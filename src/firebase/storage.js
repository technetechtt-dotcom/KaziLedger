import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL, path: snapshot.ref.fullPath };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
};

// Delete file from Firebase Storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
};

// Upload business logo
export const uploadBusinessLogo = async (userId, file) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `logo_${timestamp}.${fileExtension}`;
  const path = `users/${userId}/business/logo/${fileName}`;
  
  return await uploadFile(file, path);
};

// Upload document attachment
export const uploadDocument = async (userId, file, type = 'general') => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${type}_${timestamp}.${fileExtension}`;
  const path = `users/${userId}/documents/${type}/${fileName}`;
  
  return await uploadFile(file, path);
};

// Upload product image
export const uploadProductImage = async (userId, file, productId) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `product_${productId}_${timestamp}.${fileExtension}`;
  const path = `users/${userId}/products/images/${fileName}`;
  
  return await uploadFile(file, path);
};

// Upload scanned receipt / slip for tax & expense records
export const uploadReceipt = async (userId, file) => {
  const timestamp = Date.now();
  const extension = (file.name && file.name.includes('.'))
    ? file.name.split('.').pop()
    : 'jpg';
  const fileName = `receipt_${timestamp}.${extension}`;
  const path = `users/${userId}/receipts/${fileName}`;

  return await uploadFile(file, path);
};
