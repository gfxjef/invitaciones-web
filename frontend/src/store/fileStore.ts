/**
 * File Store for Local Image Management
 *
 * WHY: Manages locally selected files before they are uploaded to the server.
 * Maintains blob URLs for immediate preview and file references for future upload.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FileData {
  file: File;
  blobUrl: string;
  fieldKey: string;
  timestamp: number;
  metadata?: {
    size: number;
    type: string;
    name: string;
  };
}

interface FileStoreState {
  // Map of field keys to file data
  fileMap: Record<string, FileData>;

  // Actions
  setFile: (fieldKey: string, file: File, blobUrl: string) => void;
  removeFile: (fieldKey: string) => void;
  getFile: (fieldKey: string) => FileData | null;
  getBlobUrl: (fieldKey: string) => string | null;
  clearAll: () => void;

  // Multi-image specific actions
  setMultipleFiles: (baseFieldKey: string, files: Array<{ file: File; id: string }>) => void;
  removeMultipleFiles: (baseFieldKey: string) => void;
  getFilesForField: (baseFieldKey: string) => FileData[];

  // Utility functions
  getAllFiles: () => FileData[];
  getFileCount: () => number;
  getTotalSize: () => number;

  // Cleanup functions
  cleanupBlobUrls: () => void;
  cleanupOldFiles: (maxAgeMs?: number) => void;
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      fileMap: {},

      setFile: (fieldKey: string, file: File, blobUrl: string) => {
        set((state) => {
          // Cleanup previous blob URL if exists
          const existingFile = state.fileMap[fieldKey];
          if (existingFile && existingFile.blobUrl !== blobUrl) {
            URL.revokeObjectURL(existingFile.blobUrl);
          }

          return {
            fileMap: {
              ...state.fileMap,
              [fieldKey]: {
                file,
                blobUrl,
                fieldKey,
                timestamp: Date.now(),
                metadata: {
                  size: file.size,
                  type: file.type,
                  name: file.name,
                },
              },
            },
          };
        });
      },

      removeFile: (fieldKey: string) => {
        set((state) => {
          const fileData = state.fileMap[fieldKey];
          if (fileData) {
            // Cleanup blob URL
            URL.revokeObjectURL(fileData.blobUrl);

            // Remove from map
            const newFileMap = { ...state.fileMap };
            delete newFileMap[fieldKey];

            return { fileMap: newFileMap };
          }
          return state;
        });
      },

      getFile: (fieldKey: string) => {
        return get().fileMap[fieldKey] || null;
      },

      getBlobUrl: (fieldKey: string) => {
        const fileData = get().fileMap[fieldKey];
        return fileData ? fileData.blobUrl : null;
      },

      clearAll: () => {
        const { fileMap } = get();

        // Cleanup all blob URLs
        Object.values(fileMap).forEach((fileData) => {
          URL.revokeObjectURL(fileData.blobUrl);
        });

        set({ fileMap: {} });
      },

      // Multi-image specific methods
      setMultipleFiles: (baseFieldKey: string, files: Array<{ file: File; id: string }>) => {
        set((state) => {
          const newFileMap = { ...state.fileMap };

          // First, cleanup existing files for this base field
          Object.keys(newFileMap).forEach(key => {
            if (key.startsWith(`${baseFieldKey}_`)) {
              URL.revokeObjectURL(newFileMap[key].blobUrl);
              delete newFileMap[key];
            }
          });

          // Add new files
          files.forEach(({ file, id }) => {
            const blobUrl = URL.createObjectURL(file);
            const fieldKey = `${baseFieldKey}_${id}`;

            newFileMap[fieldKey] = {
              file,
              blobUrl,
              fieldKey,
              timestamp: Date.now(),
              metadata: {
                size: file.size,
                type: file.type,
                name: file.name,
              },
            };
          });

          return { fileMap: newFileMap };
        });
      },

      removeMultipleFiles: (baseFieldKey: string) => {
        set((state) => {
          const newFileMap = { ...state.fileMap };

          // Remove all files that start with the base field key
          Object.keys(newFileMap).forEach(key => {
            if (key.startsWith(`${baseFieldKey}_`)) {
              URL.revokeObjectURL(newFileMap[key].blobUrl);
              delete newFileMap[key];
            }
          });

          return { fileMap: newFileMap };
        });
      },

      getFilesForField: (baseFieldKey: string) => {
        const { fileMap } = get();
        return Object.values(fileMap).filter(fileData =>
          fileData.fieldKey.startsWith(`${baseFieldKey}_`)
        );
      },

      getAllFiles: () => {
        return Object.values(get().fileMap);
      },

      getFileCount: () => {
        return Object.keys(get().fileMap).length;
      },

      getTotalSize: () => {
        return Object.values(get().fileMap).reduce(
          (total, fileData) => total + fileData.file.size,
          0
        );
      },

      cleanupBlobUrls: () => {
        const { fileMap } = get();
        Object.values(fileMap).forEach((fileData) => {
          URL.revokeObjectURL(fileData.blobUrl);
        });
      },

      cleanupOldFiles: (maxAgeMs = 24 * 60 * 60 * 1000) => { // Default: 24 hours
        const now = Date.now();
        const { fileMap } = get();
        const newFileMap: Record<string, FileData> = {};

        Object.entries(fileMap).forEach(([fieldKey, fileData]) => {
          if (now - fileData.timestamp <= maxAgeMs) {
            newFileMap[fieldKey] = fileData;
          } else {
            // Cleanup old blob URL
            URL.revokeObjectURL(fileData.blobUrl);
          }
        });

        set({ fileMap: newFileMap });
      },
    }),
    {
      name: 'file-storage',
      // Don't persist actual files or blob URLs - they'll be recreated
      partialize: (state) => ({
        // Only persist metadata for debugging/analytics
        // Actual files and blob URLs are session-specific
        fileMap: {},
      }),
    }
  )
);

// Utility hook for file management
export const useFileManager = () => {
  const store = useFileStore();

  return {
    ...store,

    // Enhanced file setter with automatic cleanup
    setFileWithCleanup: (fieldKey: string, file: File) => {
      const blobUrl = URL.createObjectURL(file);
      store.setFile(fieldKey, file, blobUrl);
      return blobUrl;
    },

    // Get file info for display
    getFileInfo: (fieldKey: string) => {
      const fileData = store.getFile(fieldKey);
      if (!fileData) return null;

      return {
        name: fileData.metadata?.name || fileData.file.name,
        size: fileData.metadata?.size || fileData.file.size,
        type: fileData.metadata?.type || fileData.file.type,
        sizeFormatted: formatFileSize(fileData.metadata?.size || fileData.file.size),
        blobUrl: fileData.blobUrl,
      };
    },

    // Check if field has a local file
    hasLocalFile: (fieldKey: string) => {
      const fileData = store.getFile(fieldKey);
      return fileData !== null;
    },
  };
};

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Cleanup function for app unmount
export const cleanupAllBlobUrls = () => {
  useFileStore.getState().cleanupBlobUrls();
};