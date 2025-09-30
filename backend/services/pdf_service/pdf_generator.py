"""
PDF Generator using Playwright

WHY: Backend PDF generation with native browser rendering
solves all frontend limitations (scaling, fonts, CSS support).

FEATURES:
- Chromium headless for perfect rendering
- Device-specific viewport configurations
- Google Fonts support out of the box
- No scaling/compression issues
- Production-ready error handling
"""

import asyncio
import os
import tempfile
import time
from typing import Optional, Dict, Any, Union, TYPE_CHECKING

if TYPE_CHECKING:
    from playwright.async_api import Browser, Page
from urllib.parse import urlparse
import logging

try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    # Define dummy types for when Playwright is not installed
    Browser = None
    Page = None

from .config import PDF_CONFIG, QUALITY_PRESETS
from .device_profiles import get_device_profile, DEVICE_PROFILES

# Configure logging
logger = logging.getLogger(__name__)

# Dynamic sections that should be hidden in PDF (non-functional in static format)
HIDDEN_SECTIONS_IN_PDF = [
    'countdown',      # Countdown timers (dynamic, not functional in PDF)
    'video',          # Video sections (cannot play in PDF)
    'rsvp',           # RSVP forms (cannot be filled in PDF)
    'map',            # Interactive maps (better to show address only)
    'music',          # Music players (cannot play in PDF)
    'contact-form',   # Contact forms (cannot be submitted from PDF)
    'audio',          # Audio players (cannot play in PDF)
    'live-stream',    # Live streaming sections (not functional in PDF)
    'chat',           # Chat widgets (not functional in PDF)
    'social-feed'     # Social media feeds (dynamic content)
]

class PDFGeneratorError(Exception):
    """Custom exception for PDF generation errors"""
    pass

class PDFGenerator:
    """
    PDF Generator using Playwright for backend PDF generation

    Solves frontend html2canvas issues:
    - Perfect font rendering (Google Fonts work natively)
    - No scaling/compression problems
    - Full CSS support (shadows, gradients, etc.)
    - Multiple device profiles
    """

    def __init__(self):
        if not PLAYWRIGHT_AVAILABLE:
            raise PDFGeneratorError(
                "Playwright not installed. Run: pip install playwright && playwright install chromium"
            )

        self._browser: Optional['Browser'] = None
        self._is_initialized = False

    async def initialize(self) -> None:
        """Initialize the browser instance"""
        if self._is_initialized:
            return

        try:
            self._playwright = await async_playwright().start()

            # Launch browser with production-ready configuration
            self._browser = await self._playwright.chromium.launch(
                headless=PDF_CONFIG['headless'],
                args=PDF_CONFIG['browser_args']
            )

            self._is_initialized = True
            logger.info("PDF Generator initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize PDF Generator: {e}")
            raise PDFGeneratorError(f"Browser initialization failed: {e}")

    async def cleanup(self) -> None:
        """Clean up browser resources"""
        try:
            if self._browser:
                await self._browser.close()
            if hasattr(self, '_playwright'):
                await self._playwright.stop()

            self._is_initialized = False
            logger.info("PDF Generator cleaned up successfully")

        except Exception as e:
            logger.warning(f"Error during cleanup: {e}")

    async def generate_pdf(
        self,
        url: str,
        device_type: str = 'mobile',
        quality_preset: str = 'standard',
        custom_options: Optional[Dict[str, Any]] = None,
        custom_data: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate PDF from URL with device-specific configuration

        Args:
            url: The invitation URL to convert to PDF
            device_type: Device profile to use ('mobile', 'iphone_x', 'premium', etc.)
            quality_preset: Quality preset ('draft', 'standard', 'high', 'premium')
            custom_options: Override specific options

        Returns:
            PDF content as bytes

        Raises:
            PDFGeneratorError: If PDF generation fails
        """
        if not self._is_initialized:
            await self.initialize()

        # Validate URL
        if not self._is_valid_url(url):
            raise PDFGeneratorError(f"Invalid URL provided: {url}")

        # Get device profile
        device_profile = get_device_profile(device_type)
        if not device_profile:
            raise PDFGeneratorError(f"Device profile not found: {device_type}")

        # Get quality preset
        quality_config = QUALITY_PRESETS.get(quality_preset, QUALITY_PRESETS['standard'])

        logger.info(f"Generating PDF for {url} using device {device_type} with quality {quality_preset}")

        page = None
        try:
            # Create new page with device configuration
            page = await self._browser.new_page()

            # Set up console logging to capture frontend logs
            def handle_console_log(msg):
                # Log ALL console messages from the embedded page
                logger.info(f"🖥️ [Frontend Console] {msg.type}: {msg.text}")

            page.on('console', handle_console_log)

            # Configure viewport and device settings
            await self._configure_page(page, device_profile)

            # Navigate to URL with proper waiting and custom data injection
            await self._navigate_and_wait(page, url, quality_config, custom_data)

            # Generate PDF with device-specific settings
            pdf_bytes = await self._generate_pdf_content(page, device_profile, quality_config, custom_options)

            logger.info(f"PDF generated successfully. Size: {len(pdf_bytes)} bytes")
            return pdf_bytes

        except Exception as e:
            logger.error(f"PDF generation failed for {url}: {e}")
            raise PDFGeneratorError(f"PDF generation failed: {e}")

        finally:
            if page:
                await page.close()

    async def _configure_page(self, page: 'Page', device_profile: Dict[str, Any]) -> None:
        """Configure page with device-specific settings"""
        # Set viewport
        viewport = device_profile['viewport']
        await page.set_viewport_size({'width': viewport['width'], 'height': viewport['height']})

        # Set user agent if specified
        if 'user_agent' in device_profile:
            await page.set_extra_http_headers({
                'User-Agent': device_profile['user_agent']
            })

        # Simulate mobile device if needed
        if device_profile.get('is_mobile', False):
            await page.set_extra_http_headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            })

        # Emulate screen media for faithful mobile capture (not print pages)
        await page.emulate_media(media='screen')

        logger.debug(f"Page configured with viewport: {viewport['width']}x{viewport['height']}, media: screen")

    async def _navigate_and_wait(self, page: 'Page', url: str, quality_config: Dict[str, Any], custom_data: Optional[Dict[str, Any]] = None) -> None:
        """Navigate to URL and wait for content to be ready"""
        # Set timeout
        page.set_default_timeout(quality_config.get('timeout', PDF_CONFIG['timeout']))

        # Add pdf=1 parameter to URL for frontend PDF mode detection
        url_separator = '&' if '?' in url else '?'
        pdf_url = f"{url}{url_separator}pdf=1"

        # First navigate to get the domain context for localStorage
        await page.goto(
            pdf_url,
            wait_until='domcontentloaded',  # Wait just for DOM, faster than networkidle
            timeout=quality_config.get('timeout', PDF_CONFIG['timeout'])
        )

        # Inject custom localStorage data if provided
        if custom_data:
            # Extract invitation ID from URL
            import re
            match = re.search(r'/invitacion/demo/(\d+)', url)
            if match:
                template_id = match.group(1)
                storage_key = f"demo-customizer-{template_id}"

                # DEBUG: Log custom_data structure and content
                logger.info(f"🔍 [PDF Generator] Processing custom_data injection:")
                logger.info(f"  - URL: {url}")
                logger.info(f"  - Extracted template_id: {template_id}")
                logger.info(f"  - Storage key: {storage_key}")
                logger.info(f"  - custom_data type: {type(custom_data)}")
                logger.info(f"  - custom_data length: {len(custom_data) if custom_data else 0}")

                if custom_data:
                    logger.info(f"🎯 [PDF Generator] COMPLETE custom_data content:")
                    for key, value in custom_data.items():
                        logger.info(f"    [{key}] = {value}")

                # Create localStorage state object
                # Calculate touched fields: any field with a non-empty value
                touched_fields = {}
                for key, value in custom_data.items():
                    # Mark as touched if value is not empty
                    # Handle different types: strings, numbers, booleans, lists
                    if value:  # Truthy check: non-empty string, non-zero number, True, non-empty list
                        touched_fields[key] = True
                    elif isinstance(value, bool):  # Keep false booleans as touched
                        touched_fields[key] = True
                    elif isinstance(value, (int, float)) and value == 0:  # Keep 0 as touched
                        touched_fields[key] = True

                logger.info(f"🔧 [PDF Generator] Calculated touched fields: {len(touched_fields)} out of {len(custom_data)} total fields")

                storage_data = {
                    'customizerData': custom_data,
                    'touchedFields': touched_fields,  # ✅ Calculated touched fields
                    'selectedMode': 'basic',
                    'timestamp': int(time.time() * 1000)  # Current timestamp in milliseconds
                }

                logger.info(f"🔧 [PDF Generator] ✅ Injecting localStorage data for template {template_id} with {len(custom_data)} fields")

                # Inject localStorage data
                import json
                storage_data_json = json.dumps(storage_data)

                logger.info(f"💉 [PDF Generator] COMPLETE localStorage injection JSON:")
                logger.info(f"    storage_key: {storage_key}")
                logger.info(f"    storage_data_json: {storage_data_json}")

                await page.evaluate(f'''
                    () => {{
                        const storageKey = '{storage_key}';
                        const storageData = {storage_data_json};
                        localStorage.setItem(storageKey, JSON.stringify(storageData));
                        console.log('✅ Custom localStorage data injected for PDF generation:', storageKey);

                        // Verify injection worked
                        const verify = localStorage.getItem(storageKey);
                        console.log('🔍 Verification - localStorage content after injection:', verify);

                        // List all localStorage keys
                        const allKeys = Object.keys(localStorage);
                        console.log('🔍 All localStorage keys after injection:', allKeys);
                    }}
                ''')

                # Reload page to apply localStorage data
                await page.reload(wait_until='networkidle')

                # Give extra time for React to re-render with localStorage data
                logger.info(f"⏳ [PDF Generator] Waiting 3 seconds for React to re-render with localStorage data")
                await asyncio.sleep(3)

                # Trigger a forced re-evaluation to ensure React reads localStorage
                await page.evaluate('''
                    () => {
                        console.log('🔄 Triggering React re-evaluation after localStorage injection');
                        // Force a resize event to trigger React re-render
                        window.dispatchEvent(new Event('resize'));
                        // Also trigger storage event
                        window.dispatchEvent(new Event('storage'));
                    }
                ''')

                await asyncio.sleep(1)  # Small additional wait
            else:
                logger.warning("Could not extract template ID from URL for localStorage injection")
        else:
            # If no custom data, wait for network idle normally
            await page.wait_for_load_state('networkidle')
        logger.debug(f"Initial page load complete (networkidle) - URL: {pdf_url}")

        # Inject pdf-mode class to document root for CSS targeting
        await page.evaluate('''
            () => {
                document.documentElement.classList.add('pdf-mode');
                // Also add print media CSS class for better styling control
                document.documentElement.classList.add('print-mode');
                console.log('PDF mode classes injected');
            }
        ''')
        logger.debug("PDF mode classes injected to document root")

        # Normalize html/body layout to avoid print-style "pages" and 100vh inflation
        await page.add_style_tag(content="""
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
            }
            .pdf-mode [data-section] {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        """)
        logger.debug("CSS normalization injected for PDF layout")

        # Inject CSS to hide unwanted elements in PDF
        await self._inject_pdf_hide_css(page)

        # Wait for fonts to load if required
        if quality_config.get('wait_for_fonts', False):
            await self._wait_for_fonts(page)

        # Wait for images to load if required
        if quality_config.get('wait_for_images', False):
            await self._wait_for_images(page)

        # Wait for React/Next.js content to be ready (always for embedded pages)
        if '?embedded=true' in url or quality_config.get('wait_for_react', True):
            await self._wait_for_react_content(page)

        # Wait for background images to load (critical for Hero sections)
        await self._wait_for_background_images(page)

        # Wait for content height to stabilize
        if quality_config.get('wait_for_stability', True):
            await self._wait_for_content_stability(page)

        # Additional wait time if specified (extra buffer for React hydration)
        additional_wait = quality_config.get('additional_wait', 0)
        if additional_wait > 0:
            logger.debug(f"Additional wait: {additional_wait}ms")
            await asyncio.sleep(additional_wait / 1000)  # Convert to seconds

        # FINAL VERIFICATION: Check what values are actually displayed on the page
        final_values = await page.evaluate('''
            () => {
                // Extract text from common selectors for bride/groom names
                const selectors = [
                    '[data-groom-name]',
                    '[data-bride-name]',
                    'h1', 'h2', 'h3',
                    '.couple-names',
                    '.hero-title',
                    '.groom-name',
                    '.bride-name'
                ];

                const foundTexts = [];
                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        if (el.textContent.trim()) {
                            foundTexts.push(`${selector}: "${el.textContent.trim()}"`);
                        }
                    });
                });

                // Also check the first h1 or title-like element
                const firstH1 = document.querySelector('h1');
                const firstH2 = document.querySelector('h2');
                const result = {
                    foundTexts: foundTexts.slice(0, 10), // Limit to first 10 matches
                    firstH1: firstH1 ? firstH1.textContent.trim() : 'NOT FOUND',
                    firstH2: firstH2 ? firstH2.textContent.trim() : 'NOT FOUND',
                    pageTitle: document.title,
                    currentURL: window.location.href
                };

                console.log('🔍 FINAL PAGE CONTENT CHECK:', result);
                return result;
            }
        ''')

        logger.info(f"🔍 [PDF Generator] FINAL VERIFICATION - Page content:")
        logger.info(f"    First H1: {final_values.get('firstH1', 'N/A')}")
        logger.info(f"    First H2: {final_values.get('firstH2', 'N/A')}")
        logger.info(f"    Page Title: {final_values.get('pageTitle', 'N/A')}")
        logger.info(f"    Found texts: {final_values.get('foundTexts', [])}")

        logger.debug(f"Page fully loaded and ready for PDF generation")

    async def _wait_for_fonts(self, page: 'Page') -> None:
        """Wait for Google Fonts and custom fonts to load"""
        try:
            # Wait for font-face rules to be loaded
            await page.wait_for_function(
                "document.fonts.ready",
                timeout=PDF_CONFIG['font_load_timeout']
            )

            # Additional check for Google Fonts specifically
            await page.evaluate("""
                () => {
                    return new Promise((resolve) => {
                        if (document.fonts.status === 'loaded') {
                            resolve();
                        } else {
                            document.fonts.addEventListener('loadingdone', resolve);
                            // Fallback timeout
                            setTimeout(resolve, 5000);
                        }
                    });
                }
            """)

            logger.debug("Fonts loaded successfully")

        except Exception as e:
            logger.warning(f"Font loading timeout or error: {e}")

    async def _wait_for_images(self, page: 'Page') -> None:
        """Wait for all images to load"""
        try:
            await page.wait_for_function(
                """
                () => {
                    const images = Array.from(document.querySelectorAll('img'));
                    return images.every(img => img.complete && img.naturalHeight !== 0);
                }
                """,
                timeout=PDF_CONFIG['image_load_timeout']
            )
            logger.debug("Images loaded successfully")

        except Exception as e:
            logger.warning(f"Image loading timeout or error: {e}")

    async def _wait_for_react_content(self, page: 'Page') -> None:
        """Wait for React/Next.js content to be fully rendered"""
        try:
            logger.debug("Waiting for React content to be ready...")

            # Wait for key React components to be present
            await page.wait_for_selector('[data-template-renderer]', timeout=10000)
            logger.debug("TemplateRenderer component detected")

            # Wait for content to be hydrated and stable
            await page.wait_for_function(
                """
                () => {
                    // Check if React has finished hydrating
                    const templateRenderer = document.querySelector('[data-template-renderer]');
                    if (!templateRenderer) return false;

                    // Check if main content sections are present
                    const sections = document.querySelectorAll('[data-section]');
                    if (sections.length === 0) return false;

                    // Verify images in gallery are loaded
                    const galleryImages = document.querySelectorAll('[data-gallery] img');
                    if (galleryImages.length > 0) {
                        const allImagesLoaded = Array.from(galleryImages).every(img =>
                            img.complete && img.naturalHeight > 0
                        );
                        if (!allImagesLoaded) return false;
                    }

                    // Check if content height seems reasonable (not just header)
                    const contentHeight = Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    );

                    // Minimum height check - should be more than just a header
                    return contentHeight > 500;
                }
                """,
                timeout=15000
            )

            logger.debug("React content appears to be fully rendered")

        except Exception as e:
            logger.warning(f"React content wait timeout or error: {e} - Proceeding anyway")

    async def _wait_for_content_stability(self, page: 'Page') -> None:
        """Wait for content height to stabilize (handles dynamic content)"""
        try:
            logger.debug("Waiting for content height to stabilize...")

            stable_count = 0
            last_height = 0

            for attempt in range(10):  # Max 10 attempts
                current_height = await page.evaluate("""
                    () => Math.max(
                        document.body.scrollHeight,
                        document.body.offsetHeight,
                        document.documentElement.clientHeight,
                        document.documentElement.scrollHeight,
                        document.documentElement.offsetHeight
                    )
                """)

                if current_height == last_height and current_height > 500:
                    stable_count += 1
                    if stable_count >= 3:  # Height stable for 3 checks
                        logger.debug(f"Content height stabilized at {current_height}px")
                        return
                else:
                    stable_count = 0
                    last_height = current_height

                await asyncio.sleep(0.5)  # Wait 500ms between checks

            logger.warning(f"Content height did not fully stabilize, using last height: {last_height}px")

        except Exception as e:
            logger.warning(f"Content stability check failed: {e}")

    async def _wait_for_background_images(self, page: 'Page') -> None:
        """Wait for CSS background images to load (critical for Hero sections)"""
        try:
            logger.debug("Waiting for background images to load...")

            await page.evaluate("""
                async () => {
                    // First, load regular <img> elements
                    const imgs = Array.from(document.images);
                    await Promise.all(imgs.map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = img.onerror = resolve;
                        });
                    }));

                    // Then, find and load background-image URLs
                    const backgroundUrls = [];
                    const allElements = Array.from(document.querySelectorAll('*'));

                    for (const element of allElements) {
                        const computedStyle = getComputedStyle(element);
                        const backgroundImage = computedStyle.backgroundImage;

                        if (!backgroundImage || backgroundImage === 'none') continue;

                        // Extract URLs from background-image (handles multiple urls and gradients)
                        // Improved regex to handle single quotes, double quotes, and no quotes
                        const urlMatches = backgroundImage.match(/url\\((\"|')?(.*?)(\\1)?\\)/g);
                        if (!urlMatches) continue;

                        for (const match of urlMatches) {
                            // Clean extraction of URL
                            const url = match
                                .replace(/url\\s*\\(\\s*/, '')
                                .replace(/\\s*\\)\\s*$/, '')
                                .replace(/^[\"']/, '')
                                .replace(/[\"']$/, '');

                            if (url && url !== '' && !backgroundUrls.includes(url)) {
                                backgroundUrls.push(url);
                            }
                        }
                    }

                    // Log found background URLs for debugging
                    if (backgroundUrls.length > 0) {
                        console.log('Found background images:', backgroundUrls);
                    }

                    // Preload all background images
                    await Promise.all(backgroundUrls.map(src =>
                        new Promise((resolve, reject) => {
                            const img = new Image();
                            img.onload = () => {
                                console.log(`Background image loaded: ${src.substring(0, 50)}...`);
                                resolve();
                            };
                            img.onerror = () => {
                                console.warn(`Failed to load background image: ${src.substring(0, 50)}...`);
                                resolve(); // Continue even if one fails
                            };
                            img.src = src;

                            // Timeout after 5 seconds per image
                            setTimeout(() => resolve(), 5000);
                        })
                    ));

                    console.log(`Processed ${backgroundUrls.length} background images`);
                }
            """)

            logger.debug("Background images loaded successfully")

        except Exception as e:
            logger.warning(f"Background image loading timeout or error: {e}")

    async def _generate_pdf_content(
        self,
        page: 'Page',
        device_profile: Dict[str, Any],
        quality_config: Dict[str, Any],
        custom_options: Optional[Dict[str, Any]]
    ) -> bytes:
        """Generate the actual PDF content"""
        # Base PDF options with explicit zero margins
        pdf_options = {
            'print_background': True,
            'prefer_css_page_size': False,
            'margin': { 'top': '0px', 'bottom': '0px', 'left': '0px', 'right': '0px' },
        }

        # Apply device-specific PDF configuration
        device_pdf_config = device_profile.get('pdf_config', {})
        pdf_options.update(device_pdf_config)

        # Apply quality settings
        if 'quality' in quality_config:
            # Note: Playwright doesn't have a direct quality setting like Puppeteer
            # But we can control other aspects that affect quality
            pass

        # Apply custom options
        if custom_options:
            pdf_options.update(custom_options)

        # Handle custom dimensions for mobile devices
        if device_pdf_config.get('format') is None:
            # Custom size based on viewport
            width = device_pdf_config.get('width', device_profile['viewport']['width'])

            # Get actual content height - pixel-snapped calculation without padding
            content_height = await page.evaluate("""
                () => {
                    const isVisible = el => {
                        const s = getComputedStyle(el);
                        return s && s.display !== 'none' && s.visibility !== 'hidden';
                    };

                    // 1) Footer preferido; si no, último [data-section]
                    let last = document.querySelector('[data-section="footer"]');
                    if (!last) {
                        const secs = Array.from(document.querySelectorAll('[data-section]')).filter(isVisible);
                        last = secs.length ? secs[secs.length - 1] : null;
                    }

                    const lastBottom = last
                        ? (last.getBoundingClientRect().bottom + window.scrollY)
                        : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

                    // 2) Snap a píxel físico para evitar decimales (DPR)
                    const dpr = window.devicePixelRatio || 1;
                    const snap = v => Math.round(v * dpr) / dpr;

                    console.log('Pixel-snapped height calculation:', {
                        footerFound: !!document.querySelector('[data-section="footer"]'),
                        lastSectionType: last ? last.getAttribute('data-section') : 'none',
                        lastBottomRaw: lastBottom,
                        lastBottomSnapped: snap(lastBottom),
                        dpr,
                        scrollY: window.scrollY
                    });

                    // 3) Sin colchón; altura exacta pixel-snapped
                    return Math.max(0, snap(lastBottom));
                }
            """)

            # Minimum height check for React/SPA content
            if content_height < 800:
                logger.warning(f"Content height seems too small: {content_height}px, using minimum of 1200px")
                content_height = 1200

            pdf_options['width'] = f"{width}px"
            pdf_options['height'] = f"{content_height}px"

            logger.info(f"Using custom PDF dimensions: {width}x{content_height}px (pixel-snapped, no padding)")

        # Generate PDF
        pdf_content = await page.pdf(**pdf_options)
        return pdf_content

    async def _inject_pdf_hide_css(self, page: 'Page') -> None:
        """Inject CSS to hide unwanted elements during PDF generation"""
        try:
            logger.debug("Injecting PDF hide CSS...")

            await page.add_style_tag(content="""
                /* Hide navigation and floating elements in PDF */
                .pdf-mode nav,
                .pdf-mode header nav,
                .pdf-mode .navigation,
                .pdf-mode [data-navigation] {
                    display: none !important;
                }

                /* Hide all fixed/sticky positioned elements */
                .pdf-mode .fixed,
                .pdf-mode .sticky,
                .pdf-mode [class*="fixed"],
                .pdf-mode [class*="sticky"] {
                    display: none !important;
                }

                /* Hide floating buttons and scroll-to-top */
                .pdf-mode button[class*="fixed"],
                .pdf-mode .scroll-to-top,
                .pdf-mode [data-scroll-top],
                .pdf-mode .back-to-top {
                    display: none !important;
                }

                /* Hide customizer and demo elements */
                .pdf-mode .customizer-button,
                .pdf-mode [data-customizer],
                .pdf-mode .demo-notice,
                .pdf-mode [data-demo] {
                    display: none !important;
                }

                /* Hide pagination controls */
                .pdf-mode .pagination,
                .pdf-mode .page-nav,
                .pdf-mode [data-pagination] {
                    display: none !important;
                }

                /* Hide gallery/carousel pagination controls */
                .pdf-mode div[class*="flex"][class*="justify-center"][class*="items-center"][class*="mt-6"],
                .pdf-mode .flex.justify-center.items-center.mt-6,
                .pdf-mode button[aria-label*="Página"],
                .pdf-mode button[aria-label*="anterior"],
                .pdf-mode button[aria-label*="siguiente"] {
                    display: none !important;
                }

                /* Hide pagination dots and navigation arrows */
                .pdf-mode button[class*="w-8"][class*="h-8"][class*="rounded-full"],  /* Arrow buttons */
                .pdf-mode button[class*="w-2"][class*="h-2"][class*="rounded-full"],  /* Dot indicators */
                .pdf-mode .lucide-chevron-left,                                       /* Left arrow icon */
                .pdf-mode .lucide-chevron-right {                                     /* Right arrow icon */
                    display: none !important;
                }

                /* Hide dynamic/interactive sections that don't work in PDF */""" + self._generate_dynamic_sections_css() + """

                /* Hide admin/debug elements */
                .pdf-mode .auth-debugger,
                .pdf-mode .bulk-actions,
                .pdf-mode [data-debug] {
                    display: none !important;
                }

                /* Hide z-index layered elements typically used for overlays */
                .pdf-mode [class*="z-50"],
                .pdf-mode [class*="z-40"] {
                    display: none !important;
                }

                /* Hero2 Header Elements - Hide complete header navigation */
                .pdf-mode header.absolute.top-0,
                .pdf-mode header[class*="absolute"][class*="top-0"],
                .pdf-mode [data-section="hero2"] header,
                .pdf-mode section[data-section="hero2"] header {
                    display: none !important;
                }

                /* Hero2 specific navigation and couple names in header */
                .pdf-mode .text-3xl[class*="font-great-vibes"],  /* Couple names in header */
                .pdf-mode button[class*="md:hidden"],            /* Mobile hamburger menu */
                .pdf-mode nav[class*="hidden"][class*="md:flex"] /* Desktop navigation menu */
                {
                    display: none !important;
                }

                /* Footer Copyright Text - using class selectors */
                .pdf-mode p.text-xs.text-gray-500,
                .pdf-mode p[class*="text-xs"][class*="text-gray-500"],
                .pdf-mode footer p.font-montserrat,
                .pdf-mode footer .text-xs {
                    display: none !important;
                }

                /* Specific overrides for known problematic elements */
                .pdf-mode .fixed.bottom-8.right-8,  /* Back to top button */
                .pdf-mode .fixed.bottom-6.right-6,  /* Customizer button */
                .pdf-mode .fixed.bottom-0.left-0,   /* Demo notice bar */
                .pdf-mode .fixed.bottom-4.right-4   /* Auth debugger */
                {
                    display: none !important;
                }

                /* Quitar divisores/bordes entre secciones en PDF */
                .pdf-mode .divide-y > :not([hidden]) ~ :not([hidden]) {
                    border-top-width: 0 !important;
                }
                .pdf-mode [class*="divide-y"],
                .pdf-mode [class*="divide-gray"],
                .pdf-mode [data-section] {
                    border-top: 0 !important;
                    border-bottom: 0 !important;
                }
                .pdf-mode section[data-section] {
                    border: none !important;
                }
            """)

            logger.debug("PDF hide CSS injected successfully")

        except Exception as e:
            logger.warning(f"Failed to inject PDF hide CSS: {e}")

    def _generate_dynamic_sections_css(self) -> str:
        """Generate CSS rules to hide dynamic sections based on HIDDEN_SECTIONS_IN_PDF list"""
        css_rules = []

        for section in HIDDEN_SECTIONS_IN_PDF:
            # Generate CSS selectors for each section type
            section_css = f"""
                .pdf-mode [data-section="{section}"],
                .pdf-mode [data-section*="{section}"],
                .pdf-mode .{section}-section,
                .pdf-mode .{section.replace('-', '_')}-section,
                .pdf-mode .{section}-timer,
                .pdf-mode .{section}-player,
                .pdf-mode .{section}-form,
                .pdf-mode .{section}-widget {{
                    display: none !important;
                }}"""

            css_rules.append(section_css)

        logger.debug(f"Generated CSS rules for {len(HIDDEN_SECTIONS_IN_PDF)} dynamic sections")
        return '\n'.join(css_rules)

    def _is_valid_url(self, url: str) -> bool:
        """Validate if URL is properly formatted"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False

    # Synchronous wrapper methods for easier integration
    def generate_pdf_sync(
        self,
        url: str,
        device_type: str = 'mobile',
        quality_preset: str = 'standard',
        custom_options: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Synchronous wrapper for generate_pdf

        Use this method when calling from Flask routes
        """
        return asyncio.run(self.generate_pdf(url, device_type, quality_preset, custom_options))

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if self._is_initialized:
            asyncio.run(self.cleanup())

# Utility functions for common use cases
async def generate_invitation_pdf(
    url: str,
    device_type: str = 'invitation_mobile',
    quality: str = 'high',
    custom_data: Optional[Dict[str, Any]] = None
) -> bytes:
    """
    Quick utility function to generate invitation PDFs

    Args:
        url: Invitation URL
        device_type: Device profile (defaults to optimized mobile)
        quality: Quality preset ('draft', 'standard', 'high', 'premium')

    Returns:
        PDF bytes
    """
    generator = PDFGenerator()
    try:
        await generator.initialize()
        return await generator.generate_pdf(url, device_type, quality, None, custom_data)
    finally:
        await generator.cleanup()

def generate_invitation_pdf_sync(
    url: str,
    device_type: str = 'invitation_mobile',
    quality: str = 'high',
    custom_data: Optional[Dict[str, Any]] = None
) -> bytes:
    """Synchronous version of generate_invitation_pdf"""
    # Pass custom_data as the 4th parameter to match the async function signature
    return asyncio.run(generate_invitation_pdf(url, device_type, quality, custom_data))