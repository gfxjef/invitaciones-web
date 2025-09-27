/**
 * PDF Mobile Option 3: Window Message Communication
 *
 * WHY: Uses postMessage to communicate with iframe content
 * and generates a single continuous PDF without any page breaks
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  maxHeight?: number;
}

export const generatePDFMobileOption3 = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion-mobile-continuous.pdf',
      quality = 0.98,
      maxHeight = 20000 // Max height in pixels for continuous PDF
    } = options;

    console.log('📱 PDF Mobile Option 3: Continuous PDF generation...');

    // Check if we're in mobile view or desktop
    const isMobile = checkIfMobileView();
    console.log(isMobile ? '📱 Mobile view detected' : '🖥️ Desktop view detected');

    let targetElement: HTMLElement | null = null;

    if (isMobile) {
      // Mobile: Try to capture iframe content using a different approach
      targetElement = await getMobileContent();
    } else {
      // Desktop: Standard capture
      targetElement = getDesktopContent();
    }

    if (!targetElement) {
      throw new Error('No content element found');
    }

    console.log('🎯 Target element found:', {
      width: targetElement.scrollWidth,
      height: targetElement.scrollHeight,
      isMobile
    });

    // Prepare element for continuous capture
    const preparedElement = await prepareForContinuousCapture(targetElement);

    // Capture with special continuous settings
    const canvas = await captureForContinuousPDF(preparedElement);

    // Clean up prepared element
    if (preparedElement !== targetElement && preparedElement.parentNode) {
      preparedElement.parentNode.removeChild(preparedElement);
    }

    console.log('✅ Canvas captured for continuous PDF:', {
      width: canvas.width,
      height: canvas.height
    });

    // Generate continuous PDF
    return await generateContinuousPDF(canvas, filename, quality, isMobile);

  } catch (error) {
    console.error('❌ PDF Mobile Option 3 Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Check if in mobile view
function checkIfMobileView(): boolean {
  return !!(
    document.querySelector('iframe[title="Vista móvil de la invitación"]') ||
    document.querySelector('[class*="DeviceFrameset"]') ||
    (document.querySelector('[class*="mobile"]') as HTMLElement)?.style.display !== 'none'
  );
}

// Get mobile content with fallback strategies
async function getMobileContent(): Promise<HTMLElement | null> {
  console.log('📱 Attempting to get mobile content...');

  // Strategy 1: Try iframe access
  const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

  if (iframe) {
    try {
      // Wait for iframe to be ready
      await new Promise(resolve => {
        if (iframe.contentDocument?.readyState === 'complete') {
          resolve(undefined);
        } else {
          iframe.onload = () => resolve(undefined);
          setTimeout(() => resolve(undefined), 3000);
        }
      });

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        const content = iframeDoc.body.querySelector('.font-serif.bg-white') ||
                       iframeDoc.body.querySelector('div[class*="template"]') ||
                       iframeDoc.body.firstElementChild;

        if (content) {
          console.log('✅ Got content from iframe');

          // Clone the content to main document for capture
          const clonedContent = content.cloneNode(true) as HTMLElement;
          clonedContent.id = 'mobile-content-clone';
          clonedContent.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 375px;
            background: white;
            z-index: -1;
          `;

          document.body.appendChild(clonedContent);

          // Copy computed styles
          copyStyles(content as HTMLElement, clonedContent);

          return clonedContent;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not access iframe content:', e);
    }
  }

  // Strategy 2: Look for mobile content in main document
  const mobileContent = document.querySelector('.w-full.h-full .font-serif.bg-white') ||
                       document.querySelector('[data-mobile-content]');

  return mobileContent as HTMLElement;
}

// Get desktop content
function getDesktopContent(): HTMLElement | null {
  return document.getElementById('template-content-wrapper') ||
         document.querySelector('.font-serif.bg-white') as HTMLElement;
}

// Prepare element for continuous capture
async function prepareForContinuousCapture(element: HTMLElement): Promise<HTMLElement> {
  console.log('🔧 Preparing element for continuous capture...');

  // If it's already a clone, just prepare it
  if (element.id === 'mobile-content-clone') {
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    return element;
  }

  // Create a clone for manipulation
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'continuous-capture-clone';
  clone.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${element.scrollWidth}px;
    height: auto !important;
    overflow: visible !important;
    background: white;
    z-index: -1;
  `;

  document.body.appendChild(clone);

  // Ensure all content is visible
  clone.querySelectorAll('*').forEach(el => {
    const elem = el as HTMLElement;
    if (elem.style) {
      elem.style.overflow = 'visible';
      elem.style.maxHeight = 'none';
      elem.style.height = 'auto';
    }
  });

  // Wait for any lazy content
  await new Promise(resolve => setTimeout(resolve, 1000));

  return clone;
}

// Capture for continuous PDF
async function captureForContinuousPDF(element: HTMLElement): Promise<HTMLCanvasElement> {
  console.log('📸 Capturing for continuous PDF...');

  const canvasOptions = {
    allowTaint: false,
    useCORS: true,
    scale: 3, // Higher quality for continuous PDF
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: true,
    imageTimeout: 30000,
    onclone: (clonedDoc: Document) => {
      const clonedElement = clonedDoc.getElementById(element.id);
      if (clonedElement) {
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.display = 'block';
        clonedElement.style.transform = 'none';
      }
      console.log('🎨 Clone prepared for continuous capture');
    }
  };

  return await html2canvas(element, canvasOptions);
}

// Generate continuous PDF without page breaks
async function generateContinuousPDF(
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number,
  isMobile: boolean
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📄 Generating continuous PDF...');

  // Validate canvas
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Invalid canvas dimensions');
  }

  // Get image data
  const imgData = canvas.toDataURL('image/jpeg', quality);

  // Calculate PDF dimensions
  let pdfWidth: number;
  let pdfHeight: number;

  if (isMobile) {
    // Mobile: Fixed width of 375px
    pdfWidth = 375;
    const scale = pdfWidth / canvas.width;
    pdfHeight = Math.min(canvas.height * scale, 20000); // Cap at max height
  } else {
    // Desktop: Use A4 width in pixels (210mm ≈ 595px at 72 DPI)
    pdfWidth = 595;
    const scale = pdfWidth / canvas.width;
    pdfHeight = Math.min(canvas.height * scale, 20000);
  }

  console.log('📐 PDF dimensions:', {
    width: pdfWidth,
    height: pdfHeight,
    continuous: true
  });

  // Create SINGLE PAGE continuous PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight], // Custom format for continuous page
    compress: true
  });

  // Add entire image in one shot (no pagination)
  pdf.addImage(
    imgData,
    'JPEG',
    0, // x
    0, // y
    pdfWidth, // width
    pdfHeight, // height - full continuous height
    undefined,
    'FAST' // Compression
  );

  console.log('✅ Continuous PDF created:', {
    pages: 1, // Always 1 continuous page
    mobile: isMobile
  });

  // Generate blob
  const pdfBlob = pdf.output('blob');

  console.log('✅ PDF Mobile Option 3 Success:', {
    fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    continuous: true,
    singlePage: true
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

// Helper to copy computed styles
function copyStyles(source: HTMLElement, target: HTMLElement) {
  const sourceStyles = window.getComputedStyle(source);
  const importantStyles = [
    'font-family', 'font-size', 'font-weight', 'line-height',
    'color', 'background-color', 'padding', 'margin',
    'display', 'position', 'width', 'height'
  ];

  importantStyles.forEach(prop => {
    (target.style as any)[prop] = sourceStyles.getPropertyValue(prop);
  });

  // Recursively copy styles to children
  const sourceChildren = source.children;
  const targetChildren = target.children;

  for (let i = 0; i < sourceChildren.length && i < targetChildren.length; i++) {
    copyStyles(sourceChildren[i] as HTMLElement, targetChildren[i] as HTMLElement);
  }
}

// Export helper functions
export const isContinuousPDFSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};