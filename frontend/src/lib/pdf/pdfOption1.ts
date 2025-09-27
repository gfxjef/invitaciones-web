/**
 * PDF Option 1: jsPDF + html2canvas
 *
 * WHY: Client-side PDF generation using canvas rendering
 * Captures the DOM element as image and embeds in PDF
 * Good for preserving exact visual appearance
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

export const generatePDFOption1 = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  try {
    const {
      filename = 'invitacion.pdf',
      quality = 0.95,
      format = 'a4',
      orientation = 'portrait'
    } = options;

    console.log('📄 PDF Option 1: Starting jsPDF + html2canvas generation...');

    // Find the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    console.log('🎯 Found target element:', element.tagName);

    // Configure html2canvas options
    const canvasOptions = {
      allowTaint: false,
      useCORS: true,
      scale: 2, // Higher resolution
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    };

    console.log('📸 Capturing element as canvas...', canvasOptions);

    // Capture the element as canvas
    const canvas = await html2canvas(element, canvasOptions);

    console.log('✅ Canvas captured:', {
      width: canvas.width,
      height: canvas.height
    });

    // Get image data
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // Calculate PDF dimensions
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit content
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Center the image
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    console.log('📐 PDF dimensions:', {
      pdfWidth,
      pdfHeight,
      scaledWidth,
      scaledHeight,
      x,
      y
    });

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);

    // Generate blob
    const pdfBlob = pdf.output('blob');

    console.log('✅ PDF Option 1: Generation completed successfully');

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
    console.error('❌ PDF Option 1 Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function to check if required dependencies are available
export const isPDFOption1Available = (): boolean => {
  try {
    // Check if jsPDF and html2canvas are available
    return typeof window !== 'undefined' &&
           typeof document !== 'undefined';
  } catch {
    return false;
  }
};

// Get estimated file size before generation
export const estimateFileSizeOption1 = (elementId: string): number => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return 0;

    // Rough estimation based on element size
    const area = element.scrollWidth * element.scrollHeight;
    const estimatedKB = Math.round(area / 1000); // Very rough estimate

    return estimatedKB;
  } catch {
    return 0;
  }
};