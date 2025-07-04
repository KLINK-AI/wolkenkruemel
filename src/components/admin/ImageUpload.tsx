import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage, deleteImage } from '../../services/storageService';
import { testImageUrl } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload = ({ onImageUploaded, currentImage, className = '' }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousImageRef = useRef<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setPreview(currentImage || null);
    previousImageRef.current = currentImage || null;
  }, [currentImage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthLoaded(true);
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAuthLoaded) return;

    if (!user) {
      setError('Sie müssen angemeldet sein, um Bilder hochzuladen.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      console.log('Starting file upload process...', { fileName: file.name, fileSize: file.size });

      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      console.log('Initiating upload to Firebase Storage...');
      const url = await uploadImage(file);
      console.log('Upload successful, URL received:', url);

      // Delete previous image if it exists and isn't a test image
      if (previousImageRef.current && !previousImageRef.current.startsWith('https://images.pexels.com')) {
        try {
          console.log('Deleting previous image:', previousImageRef.current);
          await deleteImage(previousImageRef.current);
          console.log('Previous image deleted successfully');
        } catch (error) {
          console.error('Error deleting previous image:', error);
        }
      }

      setPreview(url);
      previousImageRef.current = url;
      onImageUploaded(url);
    } catch (error: any) {
      console.error('Image upload error:', error);
      setError(error.message);
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTestImage = () => {
    setPreview(testImageUrl);
    previousImageRef.current = testImageUrl;
    onImageUploaded(testImageUrl);
  };

  const handleReset = async () => {
    if (!user) {
      setError('Sie müssen angemeldet sein, um Bilder zu löschen.');
      return;
    }

    try {
      if (preview && !preview.startsWith('https://images.pexels.com')) {
        await deleteImage(preview);
      }
      setPreview(null);
      previousImageRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageUploaded('');
    } catch (error: any) {
      console.error('Error resetting image:', error);
      setError(error.message);
    }
  };

  if (!isAuthLoaded) {
    return (
      <div className={className}>
        <div className="mb-2">
          <label className="label">Bild</label>
        </div>
        <div className="text-center p-4">
          <p>Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={className}>
        <div className="mb-2">
          <label className="label">Bild</label>
        </div>
        <div className="text-center p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
          <p className="text-neutral-600 dark:text-neutral-400">
            Sie müssen angemeldet sein, um Bilder hochzuladen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-2">
        <label className="label">Bild</label>
      </div>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Vorschau"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Klicken Sie hier, um ein Bild hochzuladen
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              PNG, JPG bis zu 5MB
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleTestImage}
            className="btn-outline w-full"
          >
            Test-Bild verwenden
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Bild wird hochgeladen...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};
export default ImageUpload;