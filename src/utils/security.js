import CryptoJS from 'crypto-js';

// Encryption key - In production, this should be stored securely (e.g., environment variable)
// For now, using a key derived from user ID or a secure random key
const getEncryptionKey = () => {
  // In production, get this from environment variable or secure storage
  const storedKey = localStorage.getItem('encryption_key');
  if (storedKey) {
    return storedKey;
  }
  
  // Generate a key if none exists (for demo purposes)
  const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
  localStorage.setItem('encryption_key', newKey);
  return newKey;
};

/**
 * Encrypt sensitive data before storing in localStorage
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export const encryptData = (data) => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Return unencrypted if encryption fails
  }
};

/**
 * Decrypt data from localStorage
 * @param {string} encryptedData - Encrypted data
 * @returns {any} Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decryptData(encrypted);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  },
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate a secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
