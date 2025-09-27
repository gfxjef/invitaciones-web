/**
 * PDF Mobile Option B: Dimension Match (Intermedio)
 *
 * WHY: Fuerza PDF a dimensiones exactas del iframe móvil (375x812)
 * garantizando proporciones idénticas a la vista web móvil
 *
 * MEJORA: PDF con dimensiones exactas del viewport móvil
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  waitTime?: number;
  targetWidth?: number;
  targetHeight?: number;
}

export const generatePDFMobileOptionB = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion-mobile-B.pdf',
      quality = 0.95,
      waitTime = 3000,
      targetWidth = 375, // iPhone viewport width
      targetHeight = 812  // iPhone X height (will be calculated dynamically)
    } = options;

    console.log('🅱️ PDF Mobile Option B: Dimension Match (intermedio)...');

    // Find the mobile iframe
    const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

    if (!iframe) {
      console.log('❌ Mobile iframe not found, checking if we are in embedded mode...');

      const embeddedContent = document.querySelector('.font-serif.bg-white') ||
                             document.querySelector('[data-template-content]') ||
                             document.querySelector('main');

      if (embeddedContent) {
        console.log('✅ Found embedded content directly');
        return await captureElementToPDF(embeddedContent as HTMLElement, filename, quality, targetWidth);
      }

      throw new Error('No mobile content found. Make sure you are in mobile view.');
    }

    console.log('✅ Found mobile iframe');

    // 🔧 MEJORA B: Obtener dimensiones exactas del iframe
    const iframeStyles = window.getComputedStyle(iframe);
    const iframeWidth = parseInt(iframeStyles.width) || targetWidth;
    const iframeHeight = parseInt(iframeStyles.height) || targetHeight;

    console.log('📐 Iframe dimensions detected:', {
      width: iframeWidth,
      height: iframeHeight,
      targetWidth,
      targetHeight
    });

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

    // 🔧 MEJORA B: Forzar dimensiones del iframe al contenido
    const contentElement = iframeContent as HTMLElement;
    const originalWidth = contentElement.style.width;
    const originalHeight = contentElement.style.height;

    // Force content to exact iframe dimensions
    contentElement.style.width = `${iframeWidth}px`;
    contentElement.style.maxWidth = `${iframeWidth}px`;
    contentElement.style.overflow = 'visible';

    console.log('🎯 Content dimensions forced to iframe size:', {
      element: contentElement.tagName,
      forcedWidth: iframeWidth,
      scrollHeight: contentElement.scrollHeight
    });

    // Wait for images to load in iframe
    await waitForIframeImages(iframeDoc, waitTime);

    // Capture and generate PDF with exact dimensions
    const result = await captureElementToPDF(
      contentElement,
      filename,
      quality,
      iframeWidth,
      iframeDoc
    );

    // Restore original styles
    contentElement.style.width = originalWidth;
    contentElement.style.height = originalHeight;

    return result;

  } catch (error) {
    console.error('❌ PDF Mobile Option B Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

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

// Helper to capture element and generate PDF with DIMENSION MATCH
async function captureElementToPDF(
  element: HTMLElement,
  filename: string,
  quality: number,
  targetWidth: number,
  ownerDocument?: Document
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📸 Starting canvas capture with DIMENSION MATCH...');

  // 🔧 MEJORA B: Configure html2canvas to match exact viewport dimensions
  const canvasOptions: any = {
    allowTaint: false,
    useCORS: true,
    scale: 1, // Keep scale 1 to avoid compression
    backgroundColor: '#ffffff',
    logging: false,
    width: targetWidth, // 🔧 Force exact width
    height: element.scrollHeight, // Let height be natural
    windowWidth: targetWidth, // 🔧 Force viewport width
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: true
  };

  // If capturing from iframe, pass the owner document
  if (ownerDocument) {
    canvasOptions.ownerDocument = ownerDocument;
  }

  // Add onclone to ensure proper sizing
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
    }
    console.log('🎨 Prepared cloned document with dimension match');
  };

  // Capture the element
  const canvas = await html2canvas(element, canvasOptions);

  console.log('✅ Canvas captured with DIMENSION MATCH:', {
    width: canvas.width,
    height: canvas.height,
    targetWidth,
    aspectRatio: (canvas.width / canvas.height).toFixed(2)
  });

  // Check for valid canvas
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas has invalid dimensions (0 width or height)');
  }

  // Convert to data URL
  const imgData = canvas.toDataURL('image/jpeg', quality);

  // 🔧 MEJORA B: Create PDF with exact mobile dimensions
  console.log('📄 Creating PDF with mobile-matched dimensions...');

  // PDF dimensions should match the captured canvas exactly
  const pdfWidth = canvas.width;
  const pdfHeight = canvas.height;

  // Create PDF with mobile-oriented format
  const pdf = new jsPDF({
    orientation: 'portrait', // Mobile is always portrait
    unit: 'px',
    format: [pdfWidth, pdfHeight] // Exact canvas dimensions
  });

  // Add the image without any scaling
  pdf.addImage(
    imgData,
    'JPEG',
    0, // x
    0, // y
    pdfWidth, // width - exact canvas width
    pdfHeight // height - exact canvas height
  );

  console.log('✅ PDF Option B created with dimension match:', {
    width: pdfWidth,
    height: pdfHeight,
    pages: 1,
    method: 'Dimension Match',
    mobileViewport: `${targetWidth}px width enforced`
  });

  // Generate blob
  const pdfBlob = pdf.output('blob');

  console.log('✅ PDF Mobile Option B: Success (Dimension Match)', {
    fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    method: 'Exact Mobile Viewport Matching'
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