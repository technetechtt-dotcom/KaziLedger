import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase/config';

// Initialize Firebase Analytics
let analytics = null;

try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Firebase Analytics initialization failed:', error);
}

/**
 * Log a custom event to Firebase Analytics
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }
  
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

/**
 * Set user ID for analytics
 * @param {string} userId - User ID
 */
export const setAnalyticsUserId = (userId) => {
  if (!analytics) return;
  
  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Error setting analytics user ID:', error);
  }
};

/**
 * Set user properties for analytics
 * @param {object} properties - User properties
 */
export const setAnalyticsUserProperties = (properties) => {
  if (!analytics) return;
  
  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Error setting analytics user properties:', error);
  }
};

// Predefined event names
export const AnalyticsEvents = {
  // Authentication
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  LOGOUT: 'logout',
  
  // Business operations
  QUOTE_CREATED: 'quote_created',
  QUOTE_UPDATED: 'quote_updated',
  QUOTE_DELETED: 'quote_deleted',
  INVOICE_CREATED: 'invoice_created',
  INVOICE_UPDATED: 'invoice_updated',
  INVOICE_PAID: 'invoice_paid',
  
  // Customer operations
  CUSTOMER_ADDED: 'customer_added',
  CUSTOMER_UPDATED: 'customer_updated',
  CUSTOMER_DELETED: 'customer_deleted',
  
  // Inventory operations
  PRODUCT_ADDED: 'product_added',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  
  // Document operations
  PDF_GENERATED: 'pdf_generated',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  
  // Settings
  SETTINGS_UPDATED: 'settings_updated',
};
