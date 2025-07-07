import { useState, useCallback } from 'react';

interface UseImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export function useImageCompression(options: UseImageCompressionOptions = {}) {
  const [isCompressing, setIsCompressing] = useState(false);
  
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 1
  } = options;

  const compressImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob and check size
        canvas.toBlob((blob) => {
          if (blob) {
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
              // Reduce quality if still too large
              const reducedQuality = Math.max(0.1, quality * (maxSizeMB / sizeMB));
              canvas.toBlob((finalBlob) => {
                if (finalBlob) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setIsCompressing(false);
                    resolve(e.target?.result as string);
                  };
                  reader.onerror = () => {
                    setIsCompressing(false);
                    reject(new Error('Failed to read compressed image'));
                  };
                  reader.readAsDataURL(finalBlob);
                } else {
                  setIsCompressing(false);
                  reject(new Error('Failed to compress image'));
                }
              }, 'image/jpeg', reducedQuality);
            } else {
              const reader = new FileReader();
              reader.onload = (e) => {
                setIsCompressing(false);
                resolve(e.target?.result as string);
              };
              reader.onerror = () => {
                setIsCompressing(false);
                reject(new Error('Failed to read compressed image'));
              };
              reader.readAsDataURL(blob);
            }
          } else {
            setIsCompressing(false);
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => {
        setIsCompressing(false);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth, maxHeight, quality, maxSizeMB]);

  return { compressImage, isCompressing };
}