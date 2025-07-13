// Test HEIC conversion
import heic2any from 'heic2any';

console.log('heic2any library loaded:', typeof heic2any);

// Test function to verify the library is working
window.testHEIC = async (file) => {
  console.log('Testing HEIC conversion with file:', file);
  console.log('File type:', file.type);
  console.log('File name:', file.name);
  
  try {
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });
    console.log('Conversion successful:', result);
    return result;
  } catch (error) {
    console.error('Conversion failed:', error);
    return null;
  }
};