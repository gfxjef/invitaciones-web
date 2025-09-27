/**
 * PDF Mobile Option 2: Smart Mode Detection
 *
 * WHY: Automatically detects if in mobile or desktop view
 * and applies the appropriate capture strategy
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  forceMode?: 'mobile' | 'desktop' | 'auto';
}

// Detect current view mode
const detectViewMode = (): 'mobile' | 'desktop' => {
  // Check multiple indicators for mobile view
  const mobileIndicators = [
    'iframe[title="Vista móvil de la invitación"]',
    '[class*="DeviceFrameset"]',
    '.iPhone-X',
    '.scale-75.sm\\:scale-90'
  ];

  for (const selector of mobileIndicators) {
    if (document.querySelector(selector)) {
      console.log(`📱 Detected mobile view via: ${selector}`);
      return 'mobile';
    }
  }

  // Check if the mobile div is visible
  const mobileDiv = document.querySelector('[class*="mobile"]');
  if (mobileDiv) {
    const styles = window.getComputedStyle(mobileDiv);
    if (styles.display !== 'none' && styles.visibility !== 'hidden') {
      console.log('📱 Detected mobile view via visible mobile div');
      return 'mobile';
    }
  }

  console.log('🖥️ Detected desktop view');
  return 'desktop';
};

export const generatePDFMobileOption2 = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion.pdf',
      quality = 0.95,
      forceMode = 'auto'
    } = options;

    console.log('📱 PDF Mobile Option 2: Smart detection starting...');

    // Detect mode
    const viewMode = forceMode === 'auto' ? detectViewMode() : forceMode;
    console.log(`🎯 Using ${viewMode} mode strategy`);

    let element: HTMLElement | null = null;
    let isMobile = viewMode === 'mobile';

    if (isMobile) {
      // MOBILE STRATEGY
      console.log('📱 Applying mobile capture strategy...');

      // Try to get iframe content first
      const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

      if (iframe) {
        // Wait for iframe load
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
          // Get content from inside iframe
          element = iframeDoc.body.querySelector('.font-serif.bg-white') ||
                   iframeDoc.body.querySelector('[data-template-content]') ||
                   iframeDoc.body.firstElementChild as HTMLElement;

          console.log('✅ Got content from iframe');

          // Wait for iframe images
          await waitForImages(iframeDoc);

          // Special capture for iframe content
          return await captureMobileContent(element, filename, quality, iframeDoc);
        }
      }

      // Fallback: Try direct mobile content
      element = document.querySelector('.w-full.h-full .font-serif.bg-white') as HTMLElement;

    } else {
      // DESKTOP STRATEGY
      console.log('🖥️ Applying desktop capture strategy...');

      // Find desktop content
      element = document.getElementById('template-content-wrapper') ||
               document.querySelector('.font-serif.bg-white') as HTMLElement;

      // Wait for desktop images
      await waitForImages(document);
    }

    if (!element) {
      throw new Error(`No content found in ${viewMode} mode`);
    }

    console.log('🎯 Found element:', {
      mode: viewMode,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    // Capture based on mode
    if (isMobile) {
      return await captureMobileContent(element, filename, quality);
    } else {
      return await captureDesktopContent(element, filename, quality);
    }

  } catch (error) {
    console.error('❌ PDF Mobile Option 2 Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Wait for images to load
async function waitForImages(doc: Document) {
  const images = doc.querySelectorAll('img');
  let loadedCount = 0;

  await Promise.all(
    Array.from(images).map(img =>
      new Promise<void>(resolve => {
        if (img.complete) {
          loadedCount++;
          resolve();
        } else {
          const timeout = setTimeout(() => resolve(), 2000);
          img.onload = () => {
            loadedCount++;
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
        }
      })
    )
  );

  console.log(`✅ ${loadedCount}/${images.length} images loaded`);
}

// Capture mobile content (continuous PDF)
async function captureMobileContent(
  element: HTMLElement,
  filename: string,
  quality: number,
  ownerDocument?: Document
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📱 Capturing mobile content...');

  const canvasOptions: any = {
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
    imageTimeout: 15000
  };

  if (ownerDocument) {
    canvasOptions.ownerDocument = ownerDocument;
  }

  // Ensure visibility in clone
  canvasOptions.onclone = (clonedDoc: Document) => {
    const cloned = clonedDoc.body.firstElementChild as HTMLElement;
    if (cloned) {
      cloned.style.cssText = `
        display: block !important;
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      `;
    }
  };

  const canvas = await html2canvas(element, canvasOptions);

  console.log('✅ Mobile canvas captured:', {
    width: canvas.width,
    height: canvas.height
  });

  // Validate canvas
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Invalid canvas dimensions');
  }

  const imgData = canvas.toDataURL('image/jpeg', quality);

  // Create continuous mobile PDF
  const mobileWidth = 375;
  const scale = mobileWidth / canvas.width;
  const pdfHeight = canvas.height * scale;

  console.log('📄 Creating continuous mobile PDF...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [mobileWidth, pdfHeight] // Single continuous page
  });

  pdf.addImage(
    imgData,
    'JPEG',
    0,
    0,
    mobileWidth,
    pdfHeight
  );

  const pdfBlob = pdf.output('blob');

  console.log('✅ Mobile PDF created (continuous)', {
    size: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    dimensions: `${mobileWidth} x ${pdfHeight}px`
  });

  downloadPDF(pdfBlob, filename);

  return {
    success: true,
    blob: pdfBlob
  };
}

// Capture desktop content (can be multi-page)
async function captureDesktopContent(
  element: HTMLElement,
  filename: string,
  quality: number
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('🖥️ Capturing desktop content...');

  const canvas = await html2canvas(element, {
    allowTaint: false,
    useCORS: true,
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false
  });

  console.log('✅ Desktop canvas captured:', {
    width: canvas.width,
    height: canvas.height
  });

  const imgData = canvas.toDataURL('image/jpeg', quality);

  // For desktop, use standard A4 pages
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  // Single or multi-page based on content
  if (scaledHeight <= pdfHeight) {
    // Single page
    const x = (pdfWidth - imgWidth * ratio) / 2;
    const y = (pdfHeight - scaledHeight) / 2;
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth * ratio, scaledHeight);
  } else {
    // Multi-page
    let position = 0;
    const pageHeight = pdfHeight / ratio;

    while (position < imgHeight) {
      if (position > 0) pdf.addPage();

      const remainingHeight = imgHeight - position;
      const currentHeight = Math.min(pageHeight, remainingHeight);

      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      tempCanvas.width = imgWidth;
      tempCanvas.height = currentHeight;

      ctx?.drawImage(canvas, 0, position, imgWidth, currentHeight, 0, 0, imgWidth, currentHeight);

      const pageData = tempCanvas.toDataURL('image/jpeg', quality);
      pdf.addImage(pageData, 'JPEG', 0, 0, pdfWidth, currentHeight * ratio);

      position += currentHeight;
    }
  }

  const pdfBlob = pdf.output('blob');

  console.log('✅ Desktop PDF created', {
    size: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    pages: pdf.getNumberOfPages()
  });

  downloadPDF(pdfBlob, filename);

  return {
    success: true,
    blob: pdfBlob
  };
}

// Helper to download PDF
function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export helper to check mode
export const getCurrentViewMode = detectViewMode;