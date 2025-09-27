/**
 * PDF Mobile Option A: Scale Fix (Básico)
 *
 * WHY: Corrige el problema de escalado cambiando scale: 2 → scale: 1
 * para evitar compresión dimensional en el PDF final
 *
 * MEJORA: Scale 1 para captura a tamaño real sin compresión
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  waitTime?: number;
}

export const generatePDFMobileOptionA = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion-mobile-A.pdf',
      quality = 0.95,
      waitTime = 3000
    } = options;

    console.log('🅰️ PDF Mobile Option A: Scale Fix (básico)...');

    // Find the mobile iframe
    const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

    if (!iframe) {
      console.log('❌ Mobile iframe not found, checking if we are in embedded mode...');

      // If we're already in embedded mode (no iframe), capture directly
      const embeddedContent = document.querySelector('.font-serif.bg-white') ||
                             document.querySelector('[data-template-content]') ||
                             document.querySelector('main');

      if (embeddedContent) {
        console.log('✅ Found embedded content directly');
        return await captureElementToPDF(embeddedContent as HTMLElement, filename, quality);
      }

      throw new Error('No mobile content found. Make sure you are in mobile view.');
    }

    console.log('✅ Found mobile iframe');

    // Wait for iframe to load
    await new Promise(resolve => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve(undefined);
      } else {
        iframe.onload = () => resolve(undefined);
        // Timeout after 5 seconds
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

    console.log('🎯 Found content inside iframe:', {
      element: iframeContent.tagName,
      width: (iframeContent as HTMLElement).scrollWidth,
      height: (iframeContent as HTMLElement).scrollHeight
    });

    // Wait for images to load in iframe
    await waitForIframeImages(iframeDoc, waitTime);

    // Capture and generate PDF
    return await captureElementToPDF(iframeContent as HTMLElement, filename, quality, iframeDoc);

  } catch (error) {
    console.error('❌ PDF Mobile Option A Error:', error);
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
          setTimeout(() => resolve(), 2000); // 2s timeout per image
        })
      );
    }
  });

  await Promise.all(imagePromises);
  console.log(`✅ ${images.length} images processed in iframe`);
}

// Helper to capture element and generate PDF with SCALE FIX
async function captureElementToPDF(
  element: HTMLElement,
  filename: string,
  quality: number,
  ownerDocument?: Document
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📸 Starting canvas capture with SCALE FIX...');

  // Configure html2canvas with SCALE 1 (FIX)
  const canvasOptions: any = {
    allowTaint: false,
    useCORS: true,
    scale: 1, // 🔧 MEJORA A: Cambiar de 2 a 1 para evitar compresión
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: true
  };

  // If capturing from iframe, pass the owner document
  if (ownerDocument) {
    canvasOptions.ownerDocument = ownerDocument;
  }

  // Add onclone to ensure visibility
  canvasOptions.onclone = (clonedDoc: Document) => {
    const clonedElement = clonedDoc.body.querySelector('.font-serif.bg-white') || clonedDoc.body;
    if (clonedElement) {
      (clonedElement as HTMLElement).style.display = 'block';
      (clonedElement as HTMLElement).style.position = 'relative';
      (clonedElement as HTMLElement).style.height = 'auto';
      (clonedElement as HTMLElement).style.overflow = 'visible';
      (clonedElement as HTMLElement).style.transform = 'none';
    }
    console.log('🎨 Prepared cloned document with scale 1');
  };

  // Capture the element
  const canvas = await html2canvas(element, canvasOptions);

  console.log('✅ Canvas captured with SCALE 1:', {
    width: canvas.width,
    height: canvas.height,
    aspectRatio: (canvas.width / canvas.height).toFixed(2)
  });

  // Check for valid canvas
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas has invalid dimensions (0 width or height)');
  }

  // Convert to data URL
  const imgData = canvas.toDataURL('image/jpeg', quality);

  // Create PDF with ORIGINAL CANVAS DIMENSIONS (no compression)
  console.log('📄 Creating PDF with original dimensions...');

  // 🔧 MEJORA A: Usar dimensiones originales del canvas (sin compresión)
  const pdfWidth = canvas.width;
  const pdfHeight = canvas.height;

  // Create custom size PDF matching canvas exactly
  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight] // Usar dimensiones exactas del canvas
  });

  // Add the entire image without rescaling
  pdf.addImage(
    imgData,
    'JPEG',
    0, // x
    0, // y
    pdfWidth, // width - original canvas width
    pdfHeight // height - original canvas height
  );

  console.log('✅ PDF Option A created with original dimensions:', {
    width: pdfWidth,
    height: pdfHeight,
    pages: 1,
    scaleUsed: 1,
    compressionAvoided: true
  });

  // Generate blob
  const pdfBlob = pdf.output('blob');

  console.log('✅ PDF Mobile Option A: Success (Scale Fix)', {
    fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    method: 'Scale 1 + Original Dimensions'
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