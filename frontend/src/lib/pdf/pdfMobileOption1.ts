/**
 * PDF Mobile Option 1: Access iframe contentDocument
 *
 * WHY: Captures mobile version by accessing the iframe's internal document
 * Generates a single continuous PDF without page breaks
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFMobileOptions {
  filename?: string;
  quality?: number;
  waitTime?: number;
}

export const generatePDFMobileOption1 = async (
  options: PDFMobileOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion-mobile.pdf',
      quality = 0.95,
      waitTime = 3000
    } = options;

    console.log('📱 PDF Mobile Option 1: Starting iframe content capture...');

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
    console.error('❌ PDF Mobile Option 1 Error:', error);
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

// Helper to capture element and generate continuous PDF
async function captureElementToPDF(
  element: HTMLElement,
  filename: string,
  quality: number,
  ownerDocument?: Document
): Promise<{ success: boolean; error?: string; blob?: Blob }> {

  console.log('📸 Starting canvas capture...');

  // Configure html2canvas for mobile capture
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
    console.log('🎨 Prepared cloned document');
  };

  // Capture the element
  const canvas = await html2canvas(element, canvasOptions);

  console.log('✅ Canvas captured:', {
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

  // Create PDF with CONTINUOUS format (no page breaks)
  console.log('📄 Creating continuous PDF...');

  // Calculate PDF dimensions based on mobile width (375px standard)
  const mobileWidth = 375; // Standard mobile width in px
  const scaleFactor = mobileWidth / canvas.width;
  const pdfHeight = canvas.height * scaleFactor;

  // Create custom size PDF (continuous, no pages)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [mobileWidth, pdfHeight] // Custom size matching content
  });

  // Add the entire image as one continuous PDF
  pdf.addImage(
    imgData,
    'JPEG',
    0, // x
    0, // y
    mobileWidth, // width
    pdfHeight // height - full content height
  );

  console.log('✅ Single continuous PDF created', {
    width: mobileWidth,
    height: pdfHeight,
    pages: 1 // Always 1 page (continuous)
  });

  // Generate blob
  const pdfBlob = pdf.output('blob');

  console.log('✅ PDF Mobile Option 1: Success', {
    fileSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
    continuous: true
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

// Check if in mobile view
export const isMobileView = (): boolean => {
  // Check for mobile indicators
  return !!(
    document.querySelector('iframe[title="Vista móvil de la invitación"]') ||
    document.querySelector('[class*="DeviceFrameset"]') ||
    document.querySelector('.scale-75.sm\\:scale-90') // Mobile container classes
  );
};

// Get mobile content element
export const getMobileContentElement = (): HTMLElement | null => {
  const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;

  if (iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      return iframeDoc.body.querySelector('.font-serif.bg-white') as HTMLElement;
    }
  }

  // Fallback to direct content
  return document.querySelector('.font-serif.bg-white') as HTMLElement;
};