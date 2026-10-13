// Internationalization utilities
// Currently supports English (en) - can be expanded

const translations = {
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      close: 'Close',
    },
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      quotes: 'Quotes',
      invoices: 'Invoices',
      statements: 'Statements',
      scanner: 'Scanner',
      reports: 'Reports',
      inventory: 'Inventory',
      customers: 'Customers',
      appointments: 'Appointments',
      compliance: 'Compliance',
      settings: 'Settings',
      templates: 'Templates',
    },
    // Forms
    forms: {
      email: 'Email Address',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      businessName: 'Business Name',
      phone: 'Phone Number',
      address: 'Address',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password must be at least 8 characters',
    },
    // Messages
    messages: {
      loginSuccess: 'Login successful!',
      registrationSuccess: 'Registration successful!',
      saveSuccess: 'Saved successfully',
      deleteSuccess: 'Deleted successfully',
      errorOccurred: 'An error occurred',
    },
  },
  // Add more languages here
  // es: { ... },
  // fr: { ... },
  // af: { ... }, // Afrikaans for South Africa
  // zu: { ... }, // Zulu
};

let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {object} params - Parameters to replace in translation
 * @returns {string} Translated string
 */
export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters
  return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
};

/**
 * Set current language
 * @param {string} lang - Language code (e.g., 'en', 'es')
 */
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    // Trigger language change event
    window.dispatchEvent(new Event('languagechange'));
  }
};

/**
 * Get current language
 * @returns {string} Current language code
 */
export const getLanguage = () => currentLanguage;

/**
 * Get available languages
 * @returns {string[]} Array of language codes
 */
export const getAvailableLanguages = () => Object.keys(translations);

// Export default language
export default {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
};
