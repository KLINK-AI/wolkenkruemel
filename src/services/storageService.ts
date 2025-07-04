import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { checkAdminStatus } from './firebaseService';
import { auth } from './firebaseConfig'; // Import auth

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Check admin status before upload
    console.log('Checking admin status...');
    await checkAdminStatus();
    console.log('Admin status checked successfully.');

    // Log user's token claims to check for admin claim
    if (auth.currentUser) {
      console.log('User ID Token Result:', await auth.currentUser.getIdTokenResult(true));
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Ungültiger Dateityp. Bitte wählen Sie ein Bild aus.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Die Datei ist zu groß. Maximale Größe ist 5MB.');
    }

    console.log('File type and size checks passed.');

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `activities/${timestamp}_${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    console.log('File Name:', fileName);
    console.log('Storage Reference:', storageRef);
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000'
    };

    console.log('Starting actual upload to Firebase Storage...');
    console.log('Calling uploadBytes...'); // Add this line
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('Upload Snapshot:', snapshot);
    console.log('UploadBytes completed.'); // Add this line after uploadBytes

    console.log('Upload to Firebase Storage complete.');


    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);

    return downloadURL;

  } catch (error) {
    console.error('Error during image upload:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl || imageUrl.startsWith('https://images.pexels.com')) {
    return;
  }

  try {
    await checkAdminStatus();

    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    const fullPath = decodedUrl.substring(startIndex, endIndex);
    
    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
  } catch (error: any) {
    console.error('Delete error:', error);
    throw error;
  }
};