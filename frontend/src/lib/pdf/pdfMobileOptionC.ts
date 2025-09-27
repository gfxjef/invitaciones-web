/**
 * PDF Mobile Option C: Smart Resolution (Avanzado)
 *
 * WHY: Detección automática del dispositivo/viewport + escala optimizada
 * dinámicamente basada en el contenido y resolución objetivo
 *
 * MEJORA: Resolución inteligente con detección automática y optimización
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  waitTime?: number;
  targetDPI?: number;
  smartScaling?: boolean;
}

// Device detection and optimization
interface DeviceInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  optimalScale: number;
}

export const generatePDFMobileOptionC = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion-mobile-C.pdf',
      quality = 0.98,
      waitTime = 3000,
      targetDPI = 150, // Target DPI for high quality
      smartScaling = true
    } = options;

    console.log('🅲 PDF Mobile Option C: Smart Resolution (avanzado)...');

    // 🔧 MEJORA C: Smart device and viewport detection
    const deviceInfo = detectDeviceInfo();
    console.log('📱 Device info detected:', deviceInfo);

    // Find the mobile iframe
    const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

    if (!iframe) {
      console.log('❌ Mobile iframe not found, checking if we are in embedded mode...');

      const embeddedContent = document.querySelector('.font-serif.bg-white') ||
                             document.querySelector('[data-template-content]') ||
                             document.querySelector('main');

      if (embeddedContent) {
        console.log('✅ Found embedded content directly');
        return await captureElementToPDF(
          embeddedContent as HTMLElement,
          filename,
          quality,
          deviceInfo,
          targetDPI
        );
      }

      throw new Error('No mobile content found. Make sure you are in mobile view.');
    }

    console.log('✅ Found mobile iframe');

    // 🔧 MEJORA C: Get real iframe dimensions and optimize
    const iframeRect = iframe.getBoundingClientRect();
    const iframeStyles = window.getComputedStyle(iframe);

    const realIframeInfo = {
      width: iframeRect.width,
      height: iframeRect.height,
      computedWidth: parseInt(iframeStyles.width) || 375,
      computedHeight: parseInt(iframeStyles.height) || 812
    };

    console.log('📐 Real iframe dimensions:', realIframeInfo);

    // Wait for iframe to load
    await new Promise(resolve => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve(undefined);
      } else {
        iframe.onload = () => resolve(undefined);
        setTimeout(() => resolve(undefined), 5000);
      }
    });

    // Access iframe content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      throw new Error('Cannot access iframe content. It may be from a different origin.');
    }

    console.log('✅ Accessed iframe document');

    // Find the content inside the iframe
    const iframeContent = iframeDoc.querySelector('.font-serif.bg-white') ||
                         iframeDoc.querySelector('[data-template-content]') ||
                         iframeDoc.querySelector('body > div') ||
                         iframeDoc.body;

    if (!iframeContent) {
      throw new Error('No content found inside iframe');
    }

    // 🔧 MEJORA C: Analyze content dimensions and optimize viewport
    const contentElement = iframeContent as HTMLElement;
    const contentInfo = analyzeContentDimensions(contentElement, iframeDoc);

    console.log('📊 Content analysis:', contentInfo);

    // 🔧 MEJORA C: Smart viewport optimization
    if (smartScaling) {
      await optimizeIframeViewport(iframeDoc, realIframeInfo, contentInfo);
    }

    // Wait for images and optimization to complete
    await waitForIframeImages(iframeDoc, waitTime);

    // Additional wait for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture and generate PDF with smart resolution
    return await captureElementToPDF(
      contentElement,
      filename,
      quality,
      {
        ...deviceInfo,
        iframeWidth: realIframeInfo.computedWidth,
        iframeHeight: realIframeInfo.computedHeight,
        contentInfo
      },
      targetDPI,
      iframeDoc
    );

  } catch (error) {
    console.error('❌ PDF Mobile Option C Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// 🔧 MEJORA C: Smart device detection
function detectDeviceInfo(): DeviceInfo {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const screen = {
    width: window.screen.width,
    height: window.screen.height
  };

  const devicePixelRatio = window.devicePixelRatio || 1;

  // Detect if mobile based on multiple factors
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   viewport.width <= 768 ||
                   'ontouchstart' in window;

  // Calculate optimal scale based on device capabilities
  let optimalScale = 1;

  if (devicePixelRatio >= 2) {
    optimalScale = 1.5; // High DPI displays
  } else if (devicePixelRatio >= 1.5) {
    optimalScale = 1.25; // Medium DPI displays
  } else {
    optimalScale = 1; // Standard displays
  }

  // Adjust for mobile vs desktop
  if (isMobile && viewport.width <= 375) {
    optimalScale = Math.min(optimalScale, 1.2); // Don't over-scale small mobile screens
  }

  return {
    width: screen.width,
    height: screen.height,
    devicePixelRatio,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    isMobile,
    optimalScale
  };
}

// 🔧 MEJORA C: Analyze content dimensions
function analyzeContentDimensions(element: HTMLElement, doc: Document) {
  const rect = element.getBoundingClientRect();
  const computedStyle = doc.defaultView?.getComputedStyle(element);

  // Detect text sizes to optimize scaling
  const textElements = element.querySelectorAll('h1, h2, h3, p, span, div');
  const fontSizes: number[] = [];

  textElements.forEach(el => {
    const styles = doc.defaultView?.getComputedStyle(el);
    if (styles) {
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize > 0) {
        fontSizes.push(fontSize);
      }
    }
  });

  const avgFontSize = fontSizes.length > 0 ?
    fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length : 16;

  return {
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    rectWidth: rect.width,
    rectHeight: rect.height,
    avgFontSize,
    textElementsCount: textElements.length,
    hasLargeText: fontSizes.some(size => size > 32),
    hasSmallText: fontSizes.some(size => size < 14)
  };
}

// 🔧 MEJORA C: Smart viewport optimization
async function optimizeIframeViewport(doc: Document, iframeInfo: any, contentInfo: any) {
  console.log('🎯 Optimizing iframe viewport...');

  // Add optimization styles to iframe document
  const style = doc.createElement('style');
  style.textContent = `
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${iframeInfo.computedWidth}px !important;
      max-width: ${iframeInfo.computedWidth}px !important;
      overflow-x: hidden !important;
    }

    .font-serif.bg-white,
    [data-template-content] {
      width: ${iframeInfo.computedWidth}px !important;
      max-width: ${iframeInfo.computedWidth}px !important;
      box-sizing: border-box !important;
    }

    img {
      max-width: 100% !important;
      height: auto !important;
    }

    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `;

  doc.head.appendChild(style);

  // Force a reflow
  doc.body.offsetHeight;

  console.log('✅ Viewport optimization applied');
}

// Helper to wait for images in iframe
async function waitForIframeImages(doc: Document, waitTime: number) {
  console.log(`⏱️ Waiting ${waitTime}ms for iframe content to load...`);
  await new Promise(resolve => setTimeout(resolve, waitTime));

  const images = doc.querySelectorAll('img');
  const imagePromises: Promise<void>[] = [];

  images.forEach((img) => {
    if (!img.complete) {
      imagePromises.push(
        new Promise((resolve) => {
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => resolve());
          setTimeout(() => resolve(), 2000);
        })
      );
    }
  });

  await Promise.all(imagePromises);
  console.log(`✅ ${images.length} images processed in iframe`);
}

// Helper to capture element and generate PDF with SMART RESOLUTION
async function captureElementToPDF(
  element: HTMLElement,
  filename: string,
  quality: number,
  deviceInfo: any,
  targetDPI: number,
  ownerDocument?: Document
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📸 Starting canvas capture with SMART RESOLUTION...');

  // 🔧 MEJORA C: Calculate smart scale and dimensions
  const smartScale = deviceInfo.optimalScale || 1;
  const targetWidth = deviceInfo.iframeWidth || 375;
  const dpiScale = targetDPI / 96; // Convert target DPI to scale factor

  const finalScale = Math.min(smartScale * dpiScale, 3); // Cap at 3x to avoid memory issues

  console.log('🧠 Smart resolution calculation:', {
    smartScale,
    dpiScale,
    finalScale,
    targetWidth,
    targetDPI
  });

  // Configure html2canvas with smart resolution
  const canvasOptions: any = {
    allowTaint: false,
    useCORS: true,
    scale: finalScale, // 🔧 Smart calculated scale
    backgroundColor: '#ffffff',
    logging: false,
    width: targetWidth,
    height: element.scrollHeight,
    windowWidth: targetWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: true,
    imageTimeout: 15000, // Longer timeout for high quality
    removeContainer: true
  };

  // If capturing from iframe, pass the owner document
  if (ownerDocument) {
    canvasOptions.ownerDocument = ownerDocument;
  }

  // Add smart onclone optimization
  canvasOptions.onclone = (clonedDoc: Document) => {
    const clonedElement = clonedDoc.body.querySelector('.font-serif.bg-white') || clonedDoc.body;
    if (clonedElement) {
      (clonedElement as HTMLElement).style.display = 'block';
      (clonedElement as HTMLElement).style.position = 'relative';
      (clonedElement as HTMLElement).style.width = `${targetWidth}px`;
      (clonedElement as HTMLElement).style.maxWidth = `${targetWidth}px`;
      (clonedElement as HTMLElement).style.height = 'auto';
      (clonedElement as HTMLElement).style.overflow = 'visible';
      (clonedElement as HTMLElement).style.transform = 'none';
      (clonedElement as HTMLElement).style.WebkitFontSmoothing = 'antialiased';
      (clonedElement as HTMLElement).style.textRendering = 'optimizeLegibility';
    }
    console.log('🧠 Smart cloned document optimization applied');
  };

  // Capture the element
  const canvas = await html2canvas(element, canvasOptions);

  console.log('✅ Canvas captured with SMART RESOLUTION:', {
    width: canvas.width,
    height: canvas.height,
    finalScale,
    targetDPI,
    aspectRatio: (canvas.width / canvas.height).toFixed(2)
  });

  // Check for valid canvas
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas has invalid dimensions (0 width or height)');
  }

  // Convert to data URL with optimized quality
  const imgData = canvas.toDataURL('image/jpeg', quality);

  // 🔧 MEJORA C: Create PDF with smart dimensions
  console.log('📄 Creating PDF with smart resolution...');

  // Calculate PDF dimensions to maintain quality while being reasonable size
  const maxPDFWidth = 1200; // Max width for PDF
  const scaleForPDF = Math.min(1, maxPDFWidth / canvas.width);

  const pdfWidth = canvas.width * scaleForPDF;
  const pdfHeight = canvas.height * scaleForPDF;

  // Create PDF with optimized format
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight],
    compress: true // Enable compression for better file size
  });

  // Add the image with smart scaling
  pdf.addImage(
    imgData,
    'JPEG',
    0, // x
    0, // y
    pdfWidth, // width
    pdfHeight, // height
    undefined, // alias
    'MEDIUM' // compression
  );

  console.log('✅ PDF Option C created with smart resolution:', {
    width: pdfWidth,
    height: pdfHeight,
    pages: 1,
    method: 'Smart Resolution',
    finalScale,
    targetDPI,
    scaleForPDF
  });

  // Generate blob
  const pdfBlob = pdf.output('blob');

  console.log('✅ PDF Mobile Option C: Success (Smart Resolution)', {
    fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    method: 'AI-Optimized Smart Resolution'
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
}