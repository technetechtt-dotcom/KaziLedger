import { 
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Helper function to get user's collection reference
const getUserCollection = (userId, collectionName) => {
  return collection(db, 'users', userId, collectionName);
};

// Business operations
export const businessService = {
  // Get business data
  getBusiness: async (userId) => {
    const docRef = doc(db, 'users', userId, 'business', 'profile');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  // Update business data
  updateBusiness: async (userId, businessData) => {
    const docRef = doc(db, 'users', userId, 'business', 'profile');
    return await setDoc(docRef, {
      ...businessData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
};

// Customer operations
export const customerService = {
  // Get all customers
  getCustomers: async (userId) => {
    const q = query(getUserCollection(userId, 'customers'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add customer
  addCustomer: async (userId, customerData) => {
    const docRef = await addDoc(getUserCollection(userId, 'customers'), {
      ...customerData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update customer
  updateCustomer: async (userId, customerId, customerData) => {
    const docRef = doc(db, 'users', userId, 'customers', customerId);
    return await updateDoc(docRef, {
      ...customerData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete customer
  deleteCustomer: async (userId, customerId) => {
    const docRef = doc(db, 'users', userId, 'customers', customerId);
    return await deleteDoc(docRef);
  }
};

// Product operations
export const productService = {
  // Get all products
  getProducts: async (userId) => {
    const q = query(getUserCollection(userId, 'products'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add product
  addProduct: async (userId, productData) => {
    const docRef = await addDoc(getUserCollection(userId, 'products'), {
      ...productData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update product
  updateProduct: async (userId, productId, productData) => {
    const docRef = doc(db, 'users', userId, 'products', productId);
    return await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete product
  deleteProduct: async (userId, productId) => {
    const docRef = doc(db, 'users', userId, 'products', productId);
    return await deleteDoc(docRef);
  }
};

// Quote operations
export const quoteService = {
  // Get all quotes
  getQuotes: async (userId) => {
    const q = query(getUserCollection(userId, 'quotes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add quote
  addQuote: async (userId, quoteData) => {
    const docRef = await addDoc(getUserCollection(userId, 'quotes'), {
      ...quoteData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update quote
  updateQuote: async (userId, quoteId, quoteData) => {
    const docRef = doc(db, 'users', userId, 'quotes', quoteId);
    return await updateDoc(docRef, {
      ...quoteData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete quote
  deleteQuote: async (userId, quoteId) => {
    const docRef = doc(db, 'users', userId, 'quotes', quoteId);
    return await deleteDoc(docRef);
  }
};

// Invoice operations
export const invoiceService = {
  // Get all invoices
  getInvoices: async (userId) => {
    const q = query(getUserCollection(userId, 'invoices'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add invoice
  addInvoice: async (userId, invoiceData) => {
    const docRef = await addDoc(getUserCollection(userId, 'invoices'), {
      ...invoiceData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update invoice
  updateInvoice: async (userId, invoiceId, invoiceData) => {
    const docRef = doc(db, 'users', userId, 'invoices', invoiceId);
    return await updateDoc(docRef, {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
  }
};

// Transaction operations (for income/expenses)
export const transactionService = {
  // Get all transactions
  getTransactions: async (userId) => {
    const q = query(getUserCollection(userId, 'transactions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add transaction
  addTransaction: async (userId, transactionData) => {
    const docRef = await addDoc(getUserCollection(userId, 'transactions'), {
      ...transactionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update transaction
  updateTransaction: async (userId, transactionId, transactionData) => {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    return await updateDoc(docRef, {
      ...transactionData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete transaction
  deleteTransaction: async (userId, transactionId) => {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    return await deleteDoc(docRef);
  }
};

// Real-time listeners
export const createRealtimeListener = (userId, collectionName, callback) => {
  const q = query(getUserCollection(userId, collectionName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
};
