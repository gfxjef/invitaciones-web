/**
 * PDF Option 1C: jsPDF + html2canvas with Aggressive Pre-render
 *
 * WHY: Forces complete rendering by cloning element, applying inline styles,
 * and waiting for all asynchronous operations to complete
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

// Clone element and prepare for capture
const prepareElementForCapture = async (element: HTMLElement): Promise<HTMLElement> => {
  console.log('🔧 Preparing element for capture...');

  // Create a container for the clone
  const container = document.createElement('div');
  container.id = 'pdf-capture-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${element.scrollWidth}px;
    background: white;
    z-index: -1;
  `;

  // Clone the element
  const clone = element.cloneNode(true) as HTMLElement;

  // Apply computed styles inline to preserve appearance
  const applyInlineStyles = (original: Element, cloned: Element) => {
    const originalStyles = window.getComputedStyle(original);
    (cloned as HTMLElement).style.cssText = originalStyles.cssText;

    // Process children
    for (let i = 0; i < original.children.length; i++) {
      if (cloned.children[i]) {
        applyInlineStyles(original.children[i], cloned.children[i]);
      }
    }
  };

  console.log('🎨 Applying inline styles...');
  applyInlineStyles(element, clone);

  // Fix images in the clone
  const originalImages = element.querySelectorAll('img');
  const clonedImages = clone.querySelectorAll('img');

  clonedImages.forEach((img, index) => {
    if (originalImages[index]) {
      img.src = originalImages[index].src;
      img.style.display = 'block';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
  });

  // Remove any lazy loading attributes
  clone.querySelectorAll('[loading="lazy"]').forEach(el => {
    el.removeAttribute('loading');
  });

  // Make sure everything is visible
  clone.style.cssText = `
    display: block !important;
    position: relative !important;
    height: auto !important;
    width: 100% !important;
    overflow: visible !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  `;

  // Append to container
  container.appendChild(clone);
  document.body.appendChild(container);

  console.log('✅ Element cloned and prepared');

  return clone;
};

// Wait for all pending operations
const waitForAllPendingOperations = async (): Promise<void> => {
  console.log('⏳ Waiting for pending operations...');

  // Wait for any pending promises
  await new Promise(resolve => setTimeout(resolve, 0));

  // Wait for requestAnimationFrame
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

  // Wait for requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    await new Promise(resolve => (window as any).requestIdleCallback(() => resolve(undefined)));
  }

  // Additional wait for React renders
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('✅ Pending operations completed');
};

// Get the actual content element with multiple strategies
const findContentElement = (elementId: string): HTMLElement | null => {
  console.log('🔍 Finding content element...');

  // Strategy 1: Direct ID
  let element = document.getElementById(elementId);
  if (element) {
    console.log('✅ Found by ID');
    return element;
  }

  // Strategy 2: Find TemplateBuilder content
  element = document.querySelector('.font-serif.bg-white') as HTMLElement;
  if (element) {
    console.log('✅ Found TemplateBuilder content');
    return element;
  }

  // Strategy 3: Find by data attribute
  element = document.querySelector('[data-template-content]') as HTMLElement;
  if (element) {
    console.log('✅ Found by data attribute');
    return element;
  }

  // Strategy 4: Find largest content container
  const candidates = document.querySelectorAll('main, [role="main"], .container, .content');
  let largestElement: HTMLElement | null = null;
  let largestArea = 0;

  candidates.forEach(candidate => {
    const el = candidate as HTMLElement;
    const area = el.scrollWidth * el.scrollHeight;
    if (area > largestArea) {
      largestArea = area;
      largestElement = el;
    }
  });

  if (largestElement) {
    console.log('✅ Found largest content container');
    return largestElement;
  }

  return null;
};

export const generatePDFOption1C = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  let cloneContainer: HTMLElement | null = null;

  try {
    const {
      filename = 'invitacion.pdf',
      quality = 0.98, // Higher quality for this method
      format = 'a4',
      orientation = 'portrait'
    } = options;

    console.log('📄 PDF Option 1C: Starting with aggressive pre-render...');

    // Find the content element
    const element = findContentElement(elementId);

    if (!element) {
      throw new Error(`Could not find content element with any strategy`);
    }

    console.log('📏 Original element dimensions:', {
      width: element.scrollWidth,
      height: element.scrollHeight,
      offsetHeight: element.offsetHeight
    });

    // Scroll through the entire page first to trigger all lazy loading
    console.log('📜 Triggering lazy loading...');
    const originalScroll = window.scrollY;

    // Scroll in steps
    const scrollStep = 500;
    let currentScroll = 0;
    const maxScroll = document.body.scrollHeight;

    while (currentScroll < maxScroll) {
      window.scrollTo(0, currentScroll);
      await new Promise(resolve => setTimeout(resolve, 50));
      currentScroll += scrollStep;
    }

    // Scroll back
    window.scrollTo(0, originalScroll);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Wait for all pending operations
    await waitForAllPendingOperations();

    // Prepare cloned element
    const clonedElement = await prepareElementForCapture(element);
    cloneContainer = document.getElementById('pdf-capture-container');

    // Wait for images in the clone
    console.log('🖼️ Waiting for cloned images...');
    const clonedImages = clonedElement.querySelectorAll('img');
    let loadedCount = 0;

    await Promise.all(
      Array.from(clonedImages).map(img =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            loadedCount++;
            resolve();
          } else {
            const loadHandler = () => {
              loadedCount++;
              resolve();
            };
            const errorHandler = () => {
              console.warn('⚠️ Image failed in clone:', img.src);
              resolve();
            };

            img.addEventListener('load', loadHandler);
            img.addEventListener('error', errorHandler);

            // Force reload
            const src = img.src;
            img.src = '';
            img.src = src;

            // Timeout after 5 seconds
            setTimeout(() => {
              img.removeEventListener('load', loadHandler);
              img.removeEventListener('error', errorHandler);
              resolve();
            }, 5000);
          }
        })
      )
    );

    console.log(`✅ ${loadedCount}/${clonedImages.length} images loaded in clone`);

    // Wait a bit more for final renders
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📸 Starting canvas capture of cloned element...');

    // Canvas options optimized for the clone
    const canvasOptions = {
      allowTaint: false,
      useCORS: true,
      scale: 3, // Even higher quality
      backgroundColor: '#ffffff',
      logging: false,
      width: clonedElement.scrollWidth,
      height: clonedElement.scrollHeight,
      windowWidth: clonedElement.scrollWidth,
      windowHeight: clonedElement.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true,
      removeContainer: false,
      imageTimeout: 30000, // 30 seconds for images
      onclone: (clonedDoc: Document) => {
        // Additional cleanup in the canvas clone
        const canvasClone = clonedDoc.getElementById('pdf-capture-container');
        if (canvasClone) {
          canvasClone.style.position = 'relative';
          canvasClone.style.left = '0';
          canvasClone.style.width = 'auto';
        }
        console.log('🎨 Canvas clone prepared');
      }
    };

    // Capture the cloned element
    const canvas = await html2canvas(clonedElement, canvasOptions);

    console.log('✅ Canvas captured from clone:', {
      width: canvas.width,
      height: canvas.height,
      ratio: (canvas.width / canvas.height).toFixed(2)
    });

    // Convert to JPEG with high quality
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Check if multi-page is needed
    if (scaledHeight > pdfHeight) {
      console.log('📚 Creating multi-page PDF...');

      const pageHeightInPixels = pdfHeight / ratio;
      let yPosition = 0;
      let pageNumber = 0;

      while (yPosition < imgHeight) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        const remainingHeight = imgHeight - yPosition;
        const currentHeight = Math.min(pageHeightInPixels, remainingHeight);

        // Extract section of canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidth;
        tempCanvas.height = currentHeight;

        tempCtx?.drawImage(
          canvas,
          0, yPosition, imgWidth, currentHeight,
          0, 0, imgWidth, currentHeight
        );

        const pageImg = tempCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(pageImg, 'JPEG', 0, 0, pdfWidth, currentHeight * ratio);

        yPosition += currentHeight;
        pageNumber++;

        console.log(`📄 Page ${pageNumber} added`);
      }

      console.log(`✅ Multi-page PDF created with ${pageNumber} pages`);
    } else {
      // Single page - center it
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
      console.log('📄 Single-page PDF created');
    }

    // Generate blob
    const pdfBlob = pdf.output('blob');

    console.log('✅ PDF Option 1C: Generation complete', {
      size: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
      pages: pdf.getNumberOfPages(),
      method: 'Aggressive Pre-render'
    });

    // Cleanup clone container
    if (cloneContainer) {
      cloneContainer.remove();
    }

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
    console.error('❌ PDF Option 1C Error:', error);

    // Cleanup on error
    if (cloneContainer) {
      cloneContainer.remove();
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Check availability
export const isPDFOption1CAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' &&
           typeof document !== 'undefined';
  } catch {
    return false;
  }
};