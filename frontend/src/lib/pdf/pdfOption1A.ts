/**
 * PDF Option 1A: jsPDF + html2canvas with Delayed Capture
 *
 * WHY: Waits for all content and images to fully load before capturing
 * Uses setTimeout + image verification to ensure complete rendering
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  waitTime?: number;
}

// Helper to wait for all images to load
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  const imagePromises: Promise<void>[] = [];

  images.forEach((img) => {
    if (!img.complete) {
      imagePromises.push(
        new Promise((resolve, reject) => {
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => reject(new Error(`Failed to load image: ${img.src}`)));
        })
      );
    }
  });

  return Promise.all(imagePromises).then(() => {
    console.log(`✅ All ${images.length} images loaded`);
  });
};

// Helper to scroll element to trigger lazy loading
const triggerLazyLoading = async (element: HTMLElement) => {
  const originalScrollTop = window.scrollY;

  // Scroll to bottom to trigger any lazy loading
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Scroll back to original position
  window.scrollTo(0, originalScrollTop);
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('📜 Triggered lazy loading by scrolling');
};

export const generatePDFOption1A = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion.pdf',
      quality = 0.95,
      format = 'a4',
      orientation = 'portrait',
      waitTime = 3000 // Default 3 seconds wait
    } = options;

    console.log('📄 PDF Option 1A: Starting with delayed capture...');
    console.log(`⏱️ Waiting ${waitTime}ms for content to load...`);

    // Find the element to convert - try multiple selectors
    let element = document.getElementById(elementId);

    // If not found by ID, try to find the TemplateBuilder content
    if (!element) {
      console.log('🔍 Element not found by ID, searching for template content...');

      // Try to find the actual template content
      element = document.querySelector('.font-serif.bg-white') as HTMLElement;

      if (!element) {
        // Try to find any element containing TemplateRenderer content
        element = document.querySelector('[data-template-content]') as HTMLElement;
      }
    }

    if (!element) {
      throw new Error(`Element not found. Tried ID "${elementId}" and template selectors`);
    }

    console.log('🎯 Found target element:', element.tagName, element.className);
    console.log('📏 Element dimensions:', {
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      offsetHeight: element.offsetHeight
    });

    // Trigger lazy loading if needed
    await triggerLazyLoading(element);

    // Wait for specified time
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Wait for all images within the element
    try {
      await waitForImages(element);
    } catch (imgError) {
      console.warn('⚠️ Some images failed to load, continuing anyway:', imgError);
    }

    // Additional wait for any final renders
    await new Promise(resolve => requestAnimationFrame(resolve));

    console.log('📸 Starting canvas capture...');

    // Configure html2canvas options for better capture
    const canvasOptions = {
      allowTaint: false,
      useCORS: true,
      scale: 2, // Higher resolution
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY, // Compensate for current scroll
      foreignObjectRendering: true, // Better SVG support
      onclone: (clonedDoc: Document) => {
        // Ensure cloned element is fully visible
        const clonedElement = clonedDoc.getElementById(elementId) ||
                            clonedDoc.querySelector('.font-serif.bg-white');
        if (clonedElement) {
          (clonedElement as HTMLElement).style.display = 'block';
          (clonedElement as HTMLElement).style.height = 'auto';
          (clonedElement as HTMLElement).style.overflow = 'visible';
        }
        console.log('🎨 Prepared cloned document for capture');
      }
    };

    // Capture the element as canvas
    const canvas = await html2canvas(element, canvasOptions);

    console.log('✅ Canvas captured:', {
      width: canvas.width,
      height: canvas.height,
      ratio: canvas.width / canvas.height
    });

    // Get image data with specified quality
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Check if we need multiple pages
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    if (scaledHeight > pdfHeight) {
      // Multi-page PDF
      let position = 0;
      let pageNum = 1;

      while (position < imgHeight) {
        if (pageNum > 1) {
          pdf.addPage();
        }

        const sourceY = position;
        const sourceHeight = Math.min(pdfHeight / ratio, imgHeight - position);

        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;

        pageCtx?.drawImage(
          canvas,
          0, sourceY, imgWidth, sourceHeight,
          0, 0, imgWidth, sourceHeight
        );

        const pageData = pageCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(pageData, 'JPEG', 0, 0, pdfWidth, sourceHeight * ratio);

        position += sourceHeight;
        pageNum++;

        console.log(`📄 Added page ${pageNum - 1}`);
      }
    } else {
      // Single page - center the content
      const scaledWidth = imgWidth * ratio;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
      console.log('📄 Single page PDF created');
    }

    // Generate blob
    const pdfBlob = pdf.output('blob');

    console.log('✅ PDF Option 1A: Generation completed successfully', {
      size: (pdfBlob.size / 1024).toFixed(2) + ' KB',
      pages: pdf.getNumberOfPages()
    });

    // Trigger download
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
    console.error('❌ PDF Option 1A Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function to check if required dependencies are available
export const isPDFOption1AAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' &&
           typeof document !== 'undefined';
  } catch {
    return false;
  }
};

// Get estimated file size before generation
export const estimateFileSizeOption1A = (elementId: string): number => {
  try {
    const element = document.getElementById(elementId) ||
                   document.querySelector('.font-serif.bg-white');
    if (!element) return 0;

    // Rough estimation based on element size
    const area = (element as HTMLElement).scrollWidth * (element as HTMLElement).scrollHeight;
    const estimatedKB = Math.round(area / 500); // More realistic estimate

    return estimatedKB;
  } catch {
    return 0;
  }
};