/**
 * PDF Option 1B: jsPDF + html2canvas with MutationObserver
 *
 * WHY: Uses MutationObserver to detect when DOM stops changing
 * Ensures capture only happens when content is fully rendered and stable
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  stabilityTimeout?: number;
}

// Wait for DOM to stabilize using MutationObserver
const waitForDOMStability = (
  element: HTMLElement,
  timeout: number = 2000
): Promise<void> => {
  return new Promise((resolve) => {
    let stabilityTimer: NodeJS.Timeout;
    let totalWaitTimer: NodeJS.Timeout;
    let changeCount = 0;

    console.log('👀 Starting DOM observation...');

    const observer = new MutationObserver((mutations) => {
      changeCount += mutations.length;
      console.log(`🔄 DOM changed (${mutations.length} mutations, total: ${changeCount})`);

      // Reset the stability timer on each change
      clearTimeout(stabilityTimer);
      stabilityTimer = setTimeout(() => {
        console.log('✅ DOM stable - no changes detected');
        observer.disconnect();
        clearTimeout(totalWaitTimer);
        resolve();
      }, timeout);
    });

    // Start observing
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Maximum wait time (10 seconds)
    totalWaitTimer = setTimeout(() => {
      console.log('⏱️ Max wait time reached, proceeding with capture');
      observer.disconnect();
      clearTimeout(stabilityTimer);
      resolve();
    }, 10000);

    // Trigger initial check
    stabilityTimer = setTimeout(() => {
      console.log('✅ DOM initially stable');
      observer.disconnect();
      clearTimeout(totalWaitTimer);
      resolve();
    }, timeout);
  });
};

// Force render all visible content
const forceRenderContent = async () => {
  // Get all elements that might have lazy loading
  const lazyElements = document.querySelectorAll('[loading="lazy"], img[data-src], [data-lazy]');

  lazyElements.forEach((el) => {
    if (el instanceof HTMLImageElement) {
      // Force load lazy images
      if (el.dataset.src && !el.src) {
        el.src = el.dataset.src;
      }
      el.loading = 'eager';
    }
    // Trigger intersection observer by scrolling element into view
    el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  });

  console.log(`🖼️ Forced loading of ${lazyElements.length} lazy elements`);

  // Scroll to trigger all content
  const scrollHeight = document.documentElement.scrollHeight;
  const stepSize = window.innerHeight;
  let currentScroll = 0;

  while (currentScroll < scrollHeight) {
    window.scrollTo(0, currentScroll);
    await new Promise(resolve => requestAnimationFrame(resolve));
    currentScroll += stepSize;
  }

  // Scroll back to top
  window.scrollTo(0, 0);
  await new Promise(resolve => requestAnimationFrame(resolve));

  console.log('📜 Completed full page scroll for content loading');
};

export const generatePDFOption1B = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion.pdf',
      quality = 0.95,
      format = 'a4',
      orientation = 'portrait',
      stabilityTimeout = 1500 // Wait 1.5s of no changes
    } = options;

    console.log('📄 PDF Option 1B: Starting with MutationObserver...');

    // Try multiple selectors to find the element
    let element = document.getElementById(elementId);

    if (!element) {
      console.log('🔍 Searching for template content by class...');

      // Try to find the template builder content
      element = document.querySelector('.font-serif.bg-white') as HTMLElement;

      if (!element) {
        // Try parent of template renderer
        const templateRenderer = document.querySelector('[class*="template"]');
        element = templateRenderer?.parentElement as HTMLElement;
      }

      if (!element) {
        // Last resort - find the main content area
        element = document.querySelector('main') || document.querySelector('[role="main"]') as HTMLElement;
      }
    }

    if (!element) {
      throw new Error(`Could not find content element. Tried ID "${elementId}" and multiple fallbacks`);
    }

    console.log('🎯 Found element:', {
      tag: element.tagName,
      class: element.className.substring(0, 50),
      dimensions: `${element.scrollWidth}x${element.scrollHeight}`
    });

    // Force render all content first
    await forceRenderContent();

    // Wait for DOM to stabilize
    await waitForDOMStability(element, stabilityTimeout);

    // Additional wait for images
    const images = element.querySelectorAll('img');
    let loadedImages = 0;

    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) {
          loadedImages++;
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.addEventListener('load', () => {
            loadedImages++;
            resolve(undefined);
          });
          img.addEventListener('error', () => {
            console.warn('⚠️ Image failed to load:', img.src);
            resolve(undefined);
          });
          // Timeout for each image
          setTimeout(() => resolve(undefined), 3000);
        });
      })
    );

    console.log(`✅ ${loadedImages}/${images.length} images loaded`);

    // Final render frame wait
    await new Promise(resolve => requestAnimationFrame(resolve));

    console.log('📸 Starting canvas capture with MutationObserver method...');

    // Prepare element for capture
    const originalPosition = element.style.position;
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    // Temporarily modify styles for better capture
    element.style.position = 'relative';
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    // Configure html2canvas
    const canvasOptions = {
      allowTaint: false,
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true,
      removeContainer: false,
      imageTimeout: 15000, // 15 second timeout for images
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        // Make sure all content is visible in clone
        clonedElement.style.display = 'block';
        clonedElement.style.position = 'relative';
        clonedElement.style.height = 'auto';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.visibility = 'visible';

        // Remove any loading overlays in the clone
        const overlays = clonedDoc.querySelectorAll('[class*="loader"], [class*="loading"], [class*="overlay"]');
        overlays.forEach(overlay => overlay.remove());

        console.log('🎨 Prepared cloned document');
      }
    };

    // Capture the element
    const canvas = await html2canvas(element, canvasOptions);

    // Restore original styles
    element.style.position = originalPosition;
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    console.log('✅ Canvas captured:', {
      width: canvas.width,
      height: canvas.height,
      aspectRatio: (canvas.width / canvas.height).toFixed(2)
    });

    // Convert to image
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    if (scaledHeight > pdfHeight) {
      // Multi-page PDF
      const pageHeight = pdfHeight / ratio;
      let position = 0;
      let pageCount = 0;

      while (position < imgHeight) {
        if (pageCount > 0) {
          pdf.addPage();
        }

        const remainingHeight = imgHeight - position;
        const currentPageHeight = Math.min(pageHeight, remainingHeight);

        // Create canvas for this page
        const pageCanvas = document.createElement('canvas');
        const ctx = pageCanvas.getContext('2d');
        pageCanvas.width = imgWidth;
        pageCanvas.height = currentPageHeight;

        ctx?.drawImage(
          canvas,
          0, position, imgWidth, currentPageHeight,
          0, 0, imgWidth, currentPageHeight
        );

        const pageData = pageCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(pageData, 'JPEG', 0, 0, pdfWidth, currentPageHeight * ratio);

        position += currentPageHeight;
        pageCount++;

        console.log(`📄 Added page ${pageCount} of approximately ${Math.ceil(imgHeight / pageHeight)}`);
      }

      console.log(`📚 Created multi-page PDF with ${pageCount} pages`);
    } else {
      // Single page
      const scaledWidth = imgWidth * ratio;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
      console.log('📄 Created single-page PDF');
    }

    // Generate blob
    const pdfBlob = pdf.output('blob');

    console.log('✅ PDF Option 1B: Successfully generated', {
      fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
      pages: pdf.getNumberOfPages(),
      method: 'MutationObserver'
    });

    // Download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      blob: pdfBlob
    };

  } catch (error) {
    console.error('❌ PDF Option 1B Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Check availability
export const isPDFOption1BAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' &&
           typeof document !== 'undefined' &&
           typeof MutationObserver !== 'undefined';
  } catch {
    return false;
  }
};