import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

// Cloud Functions service
export const functionsService = {
  // Generate unique quote number
  generateQuoteNumber: async (userId) => {
    try {
      const generateQuoteNumber = httpsCallable(functions, 'generateQuoteNumber');
      const result = await generateQuoteNumber({ userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error generating quote number:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate unique invoice number
  generateInvoiceNumber: async (userId) => {
    try {
      const generateInvoiceNumber = httpsCallable(functions, 'generateInvoiceNumber');
      const result = await generateInvoiceNumber({ userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return { success: false, error: error.message };
    }
  },

  // Send quote email
  sendQuoteEmail: async (userId, quoteId, clientEmail, clientName, quoteData) => {
    try {
      const sendQuoteEmail = httpsCallable(functions, 'sendQuoteEmail');
      const result = await sendQuoteEmail({ userId, quoteId, clientEmail, clientName, quoteData });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error sending quote email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send invoice email
  sendInvoiceEmail: async (userId, invoiceId, clientEmail, clientName, invoiceData) => {
    try {
      const sendInvoiceEmail = httpsCallable(functions, 'sendInvoiceEmail');
      const result = await sendInvoiceEmail({ userId, invoiceId, clientEmail, clientName, invoiceData });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate business metrics
  calculateBusinessMetrics: async (userId, period = 'monthly') => {
    try {
      const calculateBusinessMetrics = httpsCallable(functions, 'calculateBusinessMetrics');
      const result = await calculateBusinessMetrics({ userId, period });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error calculating business metrics:', error);
      return { success: false, error: error.message };
    }
  },

  // Send payment reminders
  sendPaymentReminders: async () => {
    try {
      const sendPaymentReminders = httpsCallable(functions, 'sendPaymentReminders');
      const result = await sendPaymentReminders();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      return { success: false, error: error.message };
    }
  },

  // Backup business data
  backupBusinessData: async (userId) => {
    try {
      const backupBusinessData = httpsCallable(functions, 'backupBusinessData');
      const result = await backupBusinessData({ userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  },

  // Validate business data
  validateBusinessData: async (userId) => {
    try {
      const validateBusinessData = httpsCallable(functions, 'validateBusinessData');
      const result = await validateBusinessData({ userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error validating business data:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate business report
  generateBusinessReport: async (userId, startDate, endDate) => {
    try {
      const generateBusinessReport = httpsCallable(functions, 'generateBusinessReport');
      const result = await generateBusinessReport({ userId, startDate, endDate });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error generating business report:', error);
      return { success: false, error: error.message };
    }
  }
};
