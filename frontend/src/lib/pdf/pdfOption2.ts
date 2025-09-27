/**
 * PDF Option 2: Backend Puppeteer Approach
 *
 * WHY: Server-side PDF generation using Puppeteer
 * Better for complex layouts, fonts, and print media queries
 * Generates high-quality PDFs on the server
 */

import { apiClient } from '@/lib/api';

interface BackendPDFOptions {
  templateId: number;
  customData?: any;
  filename?: string;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  waitForImages?: boolean;
}

interface PDFResponse {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  fileSize?: number;
  blob?: Blob;
}

export const generatePDFOption2 = async (
  options: BackendPDFOptions
): Promise<PDFResponse> => {
  try {
    const {
      templateId,
      customData,
      filename = 'invitacion.pdf',
      format = 'a4',
      orientation = 'portrait',
      quality = 100,
      waitForImages = true
    } = options;

    console.log('🖨️ PDF Option 2: Starting backend Puppeteer generation...', {
      templateId,
      format,
      orientation
    });

    // Prepare request payload
    const requestData = {
      template_id: templateId,
      custom_data: customData,
      options: {
        format,
        orientation,
        quality,
        wait_for_images: waitForImages,
        filename
      }
    };

    console.log('📤 Sending PDF generation request to backend...', requestData);

    // Make API request to backend
    const response = await apiClient.post('/api/pdf/generate', requestData, {
      responseType: 'blob', // Important: expect binary response
      timeout: 60000 // 60 second timeout for PDF generation
    });

    console.log('✅ PDF Option 2: Backend response received');

    // Create blob from response
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

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
      blob: pdfBlob,
      fileSize: pdfBlob.size
    };

  } catch (error: any) {
    console.error('❌ PDF Option 2 Error:', error);

    let errorMessage = 'Unknown error occurred';

    if (error.response) {
      // Server responded with error
      if (error.response.status === 404) {
        errorMessage = 'PDF generation endpoint not found. Backend may not support this feature.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error during PDF generation. Please try again.';
      } else if (error.response.status === 408) {
        errorMessage = 'PDF generation timeout. The template may be too complex.';
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      errorMessage = error.message || 'Request configuration error';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Alternative method: Get PDF as base64 string
export const generatePDFOption2Base64 = async (
  options: BackendPDFOptions
): Promise<{ success: boolean; error?: string; base64?: string }> => {
  try {
    const requestData = {
      template_id: options.templateId,
      custom_data: options.customData,
      options: {
        ...options,
        return_base64: true // Request base64 response instead of blob
      }
    };

    const response = await apiClient.post('/api/pdf/generate-base64', requestData);

    if (response.data.success && response.data.pdf_base64) {
      return {
        success: true,
        base64: response.data.pdf_base64
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to generate PDF'
      };
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Unknown error'
    };
  }
};

// Check if backend PDF generation is available
export const isPDFOption2Available = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/pdf/status', {
      timeout: 5000
    });
    return response.data.available === true;
  } catch {
    return false;
  }
};

// Get PDF generation status (for long-running generations)
export const getPDFGenerationStatus = async (
  jobId: string
): Promise<{ status: 'pending' | 'completed' | 'failed'; downloadUrl?: string; error?: string }> => {
  try {
    const response = await apiClient.get(`/api/pdf/status/${jobId}`);
    return response.data;
  } catch (error: any) {
    return {
      status: 'failed',
      error: error.response?.data?.error || error.message
    };
  }
};

// Start async PDF generation (for complex templates)
export const startAsyncPDFGeneration = async (
  options: BackendPDFOptions
): Promise<{ success: boolean; jobId?: string; error?: string }> => {
  try {
    const requestData = {
      template_id: options.templateId,
      custom_data: options.customData,
      options: {
        ...options,
        async: true // Request async processing
      }
    };

    const response = await apiClient.post('/api/pdf/generate-async', requestData);

    if (response.data.success && response.data.job_id) {
      return {
        success: true,
        jobId: response.data.job_id
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to start PDF generation'
      };
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Unknown error'
    };
  }
};