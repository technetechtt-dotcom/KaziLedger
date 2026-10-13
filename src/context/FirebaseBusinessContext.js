import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthStateChange } from '../firebase/auth';
import { 
  businessService, 
  customerService, 
  productService, 
  quoteService, 
  invoiceService, 
  transactionService 
} from '../firebase/firestore';

const FirebaseBusinessContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
  business: {
    name: '',
    logo: null,
    vatEnabled: true,
    defaultVatRate: 15,
    currency: 'ZAR',
    language: 'en',
    address: '',
    phone: '',
    email: ''
  },
  quotes: [],
  invoices: [],
  expenses: [],
  products: [],
  customers: [],
  transactions: [],
  reports: {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  },
  loading: true
};

function businessReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isOnboardingComplete: true,
        business: {
          ...state.business,
          ...action.payload
        }
      };
    
    case 'UPDATE_BUSINESS':
      return {
        ...state,
        business: {
          ...state.business,
          ...action.payload
        }
      };
    
    case 'SET_QUOTES':
      return {
        ...state,
        quotes: action.payload
      };
    
    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload]
      };
    
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote => 
          quote.id === action.payload.id ? action.payload : quote
        )
      };
    
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter(quote => quote.id !== action.payload)
      };
    
    case 'SET_INVOICES':
      return {
        ...state,
        invoices: action.payload
      };
    
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [...state.invoices, action.payload]
      };
    
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload
      };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
    
    case 'SET_CUSTOMERS':
      return {
        ...state,
        customers: action.payload
      };
    
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload]
      };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction => 
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export function FirebaseBusinessProvider({ children }) {
  const [state, dispatch] = useReducer(businessReducer, initialState);

  // Load user data when authenticated
  useEffect(() => {
    const loadUserData = async (user) => {
      if (!user) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load business data
        const businessData = await businessService.getBusiness(user.uid);
        if (businessData) {
          dispatch({ type: 'UPDATE_BUSINESS', payload: businessData });
          dispatch({ type: 'COMPLETE_ONBOARDING' });
        }

        // Load all data in parallel
        const [quotes, invoices, products, customers, transactions] = await Promise.all([
          quoteService.getQuotes(user.uid),
          invoiceService.getInvoices(user.uid),
          productService.getProducts(user.uid),
          customerService.getCustomers(user.uid),
          transactionService.getTransactions(user.uid)
        ]);

        dispatch({ type: 'SET_QUOTES', payload: quotes });
        dispatch({ type: 'SET_INVOICES', payload: invoices });
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_CUSTOMERS', payload: customers });
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      dispatch({ type: 'SET_USER', payload: user });
      loadUserData(user);
    });

    return () => unsubscribe();
  }, []);

  // Business operations
  const updateBusiness = async (businessData) => {
    if (!state.user) return;
    
    try {
      await businessService.updateBusiness(state.user.uid, businessData);
      dispatch({ type: 'UPDATE_BUSINESS', payload: businessData });
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  };

  // Quote operations
  const addQuote = async (quoteData) => {
    if (!state.user) return;
    
    try {
      const quoteId = await quoteService.addQuote(state.user.uid, quoteData);
      const newQuote = { id: quoteId, ...quoteData };
      dispatch({ type: 'ADD_QUOTE', payload: newQuote });
      return quoteId;
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  };

  const updateQuote = async (quoteId, quoteData) => {
    if (!state.user) return;
    
    try {
      await quoteService.updateQuote(state.user.uid, quoteId, quoteData);
      const updatedQuote = { id: quoteId, ...quoteData };
      dispatch({ type: 'UPDATE_QUOTE', payload: updatedQuote });
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!state.user) return;
    
    try {
      await quoteService.deleteQuote(state.user.uid, quoteId);
      dispatch({ type: 'DELETE_QUOTE', payload: quoteId });
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  };

  // Product operations
  const addProduct = async (productData) => {
    if (!state.user) return;
    
    try {
      const productId = await productService.addProduct(state.user.uid, productData);
      const newProduct = { id: productId, ...productData };
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      return productId;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, productData) => {
    if (!state.user) return;
    
    try {
      await productService.updateProduct(state.user.uid, productId, productData);
      const updatedProduct = { id: productId, ...productData };
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Customer operations
  const addCustomer = async (customerData) => {
    if (!state.user) return;
    
    try {
      const customerId = await customerService.addCustomer(state.user.uid, customerData);
      const newCustomer = { id: customerId, ...customerData };
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      return customerId;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (customerId, customerData) => {
    if (!state.user) return;
    
    try {
      await customerService.updateCustomer(state.user.uid, customerId, customerData);
      const updatedCustomer = { id: customerId, ...customerData };
      dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  // Transaction operations
  const addTransaction = async (transactionData) => {
    if (!state.user) return;
    
    try {
      const transactionId = await transactionService.addTransaction(state.user.uid, transactionData);
      const newTransaction = { id: transactionId, ...transactionData };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      return transactionId;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    if (!state.user) return;
    
    try {
      await transactionService.updateTransaction(state.user.uid, transactionId, transactionData);
      const updatedTransaction = { id: transactionId, ...transactionData };
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!state.user) return;
    
    try {
      await transactionService.deleteTransaction(state.user.uid, transactionId);
      dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    dispatch,
    updateBusiness,
    addQuote,
    updateQuote,
    deleteQuote,
    addProduct,
    updateProduct,
    addCustomer,
    updateCustomer,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };

  return (
    <FirebaseBusinessContext.Provider value={value}>
      {children}
    </FirebaseBusinessContext.Provider>
  );
}

export function useFirebaseBusiness() {
  const context = useContext(FirebaseBusinessContext);
  if (!context) {
    throw new Error('useFirebaseBusiness must be used within a FirebaseBusinessProvider');
  }
  return context;
}
