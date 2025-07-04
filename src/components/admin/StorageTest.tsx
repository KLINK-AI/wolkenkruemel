import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

const StorageTest = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError('Sie müssen angemeldet sein, um Dateien hochzuladen.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadedUrl(null);

    try {
      addLog(`Starting upload of file: ${file.name}`);
      
      // Upload to test folder with timestamp to avoid conflicts
      const fileName = `test/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Set metadata with content type only
      const metadata = {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      };
      
      addLog('Uploading file...');
      const snapshot = await uploadBytes(storageRef, file, metadata);
      addLog('File uploaded successfully');
      
      addLog('Getting download URL...');
      const url = await getDownloadURL(snapshot.ref);
      addLog(`Download URL obtained: ${url}`);
      
      setUploadedUrl(url);
    } catch (error: any) {
      const errorMessage = `Upload error: ${error.message}`;
      addLog(errorMessage);
      setError(errorMessage);
      console.error('Storage test error:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user) {
    return (
      <div className="card border dark:border-neutral-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Storage Connection Test</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Sie müssen angemeldet sein, um den Storage-Test durchzuführen.
        </p>
      </div>
    );
  }

  return (
    <div className="card border dark:border-neutral-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Storage Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-neutral-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              dark:file:bg-primary-900/30 dark:file:text-primary-300"
          />
        </div>

        {isUploading && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Uploading...
          </div>
        )}

        {error && (
          <div className="p-3 bg-error-100 border border-error-300 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {uploadedUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Image:</p>
            <img 
              src={uploadedUrl} 
              alt="Uploaded test" 
              className="max-w-xs rounded-lg shadow-md"
            />
            <p className="text-xs text-neutral-500 break-all">{uploadedUrl}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Debug Logs</h3>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 max-h-60 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTest;