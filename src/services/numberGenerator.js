import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Generate next quote number
export const generateNextQuoteNumber = async (userId) => {
  try {
    const quotesRef = collection(db, 'users', userId, 'quotes');
    const q = query(quotesRef, orderBy('quoteNumber', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    let nextNumber = 1;
    
    if (!querySnapshot.empty) {
      const lastQuote = querySnapshot.docs[0].data();
      const lastNumber = lastQuote.quoteNumber;
      
      // Extract number from format like "QT-0012" or "QT-12"
      const numberMatch = lastNumber.match(/(\d+)$/);
      if (numberMatch) {
        nextNumber = parseInt(numberMatch[1]) + 1;
      }
    }
    
    // Format with leading zeros (QT-0001, QT-0002, etc.)
    const formattedNumber = `QT-${String(nextNumber).padStart(4, '0')}`;
    
    return {
      success: true,
      number: formattedNumber
    };
  } catch (error) {
    console.error('Error generating quote number:', error);
    // Fallback to timestamp-based number
    const fallbackNumber = `QT-${String(Date.now()).slice(-4)}`;
    return {
      success: true,
      number: fallbackNumber
    };
  }
};

// Generate next invoice number
export const generateNextInvoiceNumber = async (userId) => {
  try {
    const invoicesRef = collection(db, 'users', userId, 'invoices');
    const q = query(invoicesRef, orderBy('invoiceNumber', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    let nextNumber = 1;
    const currentYear = new Date().getFullYear();
    
    if (!querySnapshot.empty) {
      const lastInvoice = querySnapshot.docs[0].data();
      const lastNumber = lastInvoice.invoiceNumber;
      
      // Extract number from format like "INV-2024-001" or "INV-2024-1"
      const yearMatch = lastNumber.match(/INV-(\d{4})-(\d+)$/);
      if (yearMatch) {
        const lastYear = parseInt(yearMatch[1]);
        const lastNum = parseInt(yearMatch[2]);
        
        if (lastYear === currentYear) {
          nextNumber = lastNum + 1;
        }
        // If it's a new year, start from 1
      }
    }
    
    // Format with year and leading zeros (INV-2024-001, INV-2024-002, etc.)
    const formattedNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    
    return {
      success: true,
      number: formattedNumber
    };
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based number
    const fallbackNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    return {
      success: true,
      number: fallbackNumber
    };
  }
};

// Generate next customer number
export const generateNextCustomerNumber = async (userId) => {
  try {
    const customersRef = collection(db, 'users', userId, 'customers');
    const q = query(customersRef, orderBy('customerNumber', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    let nextNumber = 1;
    
    if (!querySnapshot.empty) {
      const lastCustomer = querySnapshot.docs[0].data();
      const lastNumber = lastCustomer.customerNumber;
      
      // Extract number from format like "CUST-001" or "CUST-1"
      const numberMatch = lastNumber.match(/(\d+)$/);
      if (numberMatch) {
        nextNumber = parseInt(numberMatch[1]) + 1;
      }
    }
    
    // Format with leading zeros (CUST-001, CUST-002, etc.)
    const formattedNumber = `CUST-${String(nextNumber).padStart(3, '0')}`;
    
    return {
      success: true,
      number: formattedNumber
    };
  } catch (error) {
    console.error('Error generating customer number:', error);
    // Fallback to timestamp-based number
    const fallbackNumber = `CUST-${String(Date.now()).slice(-3)}`;
    return {
      success: true,
      number: fallbackNumber
    };
  }
};
