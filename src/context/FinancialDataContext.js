import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useFirebaseBusiness } from './FirebaseBusinessContext';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const FinancialDataContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_INCOME: 'SET_INCOME',
  SET_EXPENSES: 'SET_EXPENSES',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_QUOTES: 'SET_QUOTES',
  SET_INVOICES: 'SET_INVOICES',
  ADD_INCOME: 'ADD_INCOME',
  ADD_EXPENSE: 'ADD_EXPENSE',
  ADD_PRODUCT: 'ADD_PRODUCT',
  ADD_QUOTE: 'ADD_QUOTE',
  ADD_INVOICE: 'ADD_INVOICE',
  UPDATE_INCOME: 'UPDATE_INCOME',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  UPDATE_QUOTE: 'UPDATE_QUOTE',
  UPDATE_INVOICE: 'UPDATE_INVOICE',
  DELETE_INCOME: 'DELETE_INCOME',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  DELETE_QUOTE: 'DELETE_QUOTE',
  DELETE_INVOICE: 'DELETE_INVOICE',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  income: [],
  expenses: [],
  products: [],
  quotes: [],
  invoices: [],
  totals: {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalQuotes: 0,
    totalInvoices: 0,
    totalProducts: 0,
    pendingAmount: 0,
    paidAmount: 0,
    inventoryValue: 0,
    lowStockItems: 0
  }
};

// Reducer
function financialDataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_INCOME:
      return { ...state, income: action.payload };
    
    case ACTIONS.SET_EXPENSES:
      return { ...state, expenses: action.payload };
    
    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case ACTIONS.SET_QUOTES:
      return { ...state, quotes: action.payload };
    
    case ACTIONS.SET_INVOICES:
      return { ...state, invoices: action.payload };
    
    case ACTIONS.ADD_INCOME:
      return { ...state, income: [...state.income, action.payload] };
    
    case ACTIONS.ADD_EXPENSE:
      return { ...state, expenses: [...state.expenses, action.payload] };
    
    case ACTIONS.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] };
    
    case ACTIONS.ADD_QUOTE:
      return { ...state, quotes: [...state.quotes, action.payload] };
    
    case ACTIONS.ADD_INVOICE:
      return { ...state, invoices: [...state.invoices, action.payload] };
    
    case ACTIONS.UPDATE_INCOME:
      return {
        ...state,
        income: state.income.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.UPDATE_QUOTE:
      return {
        ...state,
        quotes: state.quotes.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.UPDATE_INVOICE:
      return {
        ...state,
        invoices: state.invoices.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.DELETE_INCOME:
      return {
        ...state,
        income: state.income.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.DELETE_QUOTE:
      return {
        ...state,
        quotes: state.quotes.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.DELETE_INVOICE:
      return {
        ...state,
        invoices: state.invoices.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.CALCULATE_TOTALS:
      return {
        ...state,
        totals: action.payload
      };
    
    default:
      return state;
  }
}

// Helper function to calculate totals with enhanced cross-references
const calculateTotals = (income, expenses, quotes, invoices, products) => {
  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  const totalQuotes = quotes.length;
  const totalInvoices = invoices.length;
  const totalProducts = products.length;
  
  // Invoice calculations using consistent logic
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  
  // Use 30-day overdue logic consistently
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status === 'paid') return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < thirtyDaysAgo; // 30+ days past due
  });
  
  const paidAmount = paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
  
  // Quote calculations
  const pendingQuoteAmount = quotes
    .filter(quote => quote.status === 'pending')
    .reduce((sum, quote) => sum + parseFloat(quote.total || 0), 0);
  
  // Calculate inventory value
  const inventoryValue = products.reduce((sum, product) => {
    const quantity = product.quantity || 0;
    const price = product.price || 0;
    return sum + (quantity * price);
  }, 0);
  
  // Calculate low stock items
  const lowStockItems = products.filter(product => 
    (product.quantity || 0) <= (product.minQuantity || 0)
  ).length;
  
  // Net profit includes both direct income and invoice revenue
  const totalRevenue = totalIncome + paidAmount;
  const netProfit = totalRevenue - totalExpenses;
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    totalRevenue,
    totalQuotes,
    totalInvoices,
    totalProducts,
    pendingAmount,        // Pending invoice amount
    paidAmount,          // Paid invoice amount  
    overdueAmount,       // Overdue invoice amount (30+ days)
    pendingQuoteAmount,  // Pending quote amount
    inventoryValue,
    lowStockItems,
    // Additional metrics for consistency
    paidInvoiceCount: paidInvoices.length,
    pendingInvoiceCount: pendingInvoices.length,
    overdueInvoiceCount: overdueInvoices.length
  };
};

export function FinancialDataProvider({ children }) {
  const [state, dispatch] = useReducer(financialDataReducer, initialState);
  const { user } = useFirebaseBusiness();

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    const unsubscribeFunctions = [];

    // Income listener
    const incomeQuery = query(
      collection(db, 'users', user.uid, 'income'),
      orderBy('date', 'desc')
    );
    const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
      const incomeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_INCOME, payload: incomeData });
    });
    unsubscribeFunctions.push(unsubscribeIncome);

    // Expenses listener
    const expensesQuery = query(
      collection(db, 'users', user.uid, 'expenses'),
      orderBy('date', 'desc')
    );
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: expensesData });
    });
    unsubscribeFunctions.push(unsubscribeExpenses);

    // Products listener
    const productsQuery = query(
      collection(db, 'users', user.uid, 'products'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: productsData });
    });
    unsubscribeFunctions.push(unsubscribeProducts);

    // Quotes listener
    const quotesQuery = query(
      collection(db, 'users', user.uid, 'quotes'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_QUOTES, payload: quotesData });
    });
    unsubscribeFunctions.push(unsubscribeQuotes);

    // Invoices listener
    const invoicesQuery = query(
      collection(db, 'users', user.uid, 'invoices'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Firebase invoices update received
      dispatch({ type: ACTIONS.SET_INVOICES, payload: invoicesData });
    });
    unsubscribeFunctions.push(unsubscribeInvoices);

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  // Calculate totals whenever data changes
  useEffect(() => {
    const totals = calculateTotals(state.income, state.expenses, state.quotes, state.invoices, state.products);
    dispatch({ type: ACTIONS.CALCULATE_TOTALS, payload: totals });
  }, [state.income, state.expenses, state.quotes, state.invoices, state.products]);

  // Add income
  const addIncome = useCallback(async (incomeData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'income'), {
        ...incomeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Add expense
  const addExpense = useCallback(async (expenseData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'expenses'), {
        ...expenseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Add product
  const addProduct = useCallback(async (productData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Add quote with automatic inventory updates
  const addQuote = useCallback(async (quoteData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'quotes'), {
        ...quoteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Add invoice
  const addInvoice = useCallback(async (invoiceData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update income
  const updateIncome = useCallback(async (id, incomeData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await updateDoc(doc(db, 'users', user.uid, 'income', id), {
        ...incomeData,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update expense
  const updateExpense = useCallback(async (id, expenseData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await updateDoc(doc(db, 'users', user.uid, 'expenses', id), {
        ...expenseData,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update product
  const updateProduct = useCallback(async (id, productData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await updateDoc(doc(db, 'users', user.uid, 'products', id), {
        ...productData,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update quote with automatic income creation
  const updateQuote = useCallback(async (id, quoteData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Get the current quote to check status change
      const currentQuote = state.quotes.find(q => q.id === id);
      
      await updateDoc(doc(db, 'users', user.uid, 'quotes', id), {
        ...quoteData,
        updatedAt: serverTimestamp()
      });
      
      // If quote status changed to accepted, create income record and update inventory
      if (currentQuote?.status !== 'accepted' && quoteData.status === 'accepted') {
        await addIncome({
          amount: quoteData.total || 0,
          date: new Date().toISOString().split('T')[0],
          category: 'sales',
          service: 'Quote Accepted',
          product: quoteData.customerName || 'Customer',
          notes: `Quote #${quoteData.quoteNumber} accepted`,
          source: 'quote',
          sourceId: id
        });

        // Update inventory if items have productId
        if (quoteData.items) {
          for (const item of quoteData.items) {
            if (item.productId) {
              const product = state.products.find(p => p.id === item.productId);
              if (product) {
                const newQuantity = (product.quantity || 0) - (item.quantity || 0);
                await updateProduct(item.productId, { 
                  quantity: Math.max(0, newQuantity),
                  lastSold: serverTimestamp()
                });
              }
            }
          }
        }
      }
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.quotes, state.products, addIncome, updateProduct]);

  // Update invoice with automatic income creation
  const updateInvoice = useCallback(async (id, invoiceData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Get the current invoice to check status change
      const currentInvoice = state.invoices.find(i => i.id === id);
      
      await updateDoc(doc(db, 'users', user.uid, 'invoices', id), {
        ...invoiceData,
        updatedAt: serverTimestamp()
      });
      
      // If invoice status changed to paid, create income record
      if (currentInvoice?.status !== 'paid' && invoiceData.status === 'paid') {
        await addIncome({
          amount: invoiceData.total || 0,
          date: new Date().toISOString().split('T')[0],
          category: 'sales',
          service: 'Invoice Paid',
          product: invoiceData.customerName || 'Customer',
          notes: `Invoice #${invoiceData.invoiceNumber} paid`,
          source: 'invoice',
          sourceId: id
        });
      }
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.invoices, addIncome]);

  // Delete income
  const deleteIncome = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'income', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'products', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete quote
  const deleteQuote = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'quotes', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete invoice
  const deleteInvoice = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'invoices', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Create invoice from quote
  const createInvoiceFromQuote = useCallback(async (quoteId) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const quote = state.quotes.find(q => q.id === quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      const invoiceData = {
        invoiceNumber,
        customer: quote.customer,
        customerId: quote.customerId,
        customerName: quote.customerName,
        items: quote.items,
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        discount: quote.discount,
        total: quote.total,
        notes: quote.notes,
        status: 'pending',
        quoteId: quoteId,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update quote status to invoiced
      await updateQuote(quoteId, { status: 'invoiced' });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.quotes, updateQuote]);

  // Get related data for a specific entity
  const getRelatedData = useCallback((entityType, entityId) => {
    switch (entityType) {
      case 'quote':
        const quote = state.quotes.find(q => q.id === entityId);
        return {
          customer: state.customers.find(c => c.id === quote?.customerId),
          relatedInvoices: state.invoices.filter(i => i.quoteId === entityId),
          relatedIncome: state.income.filter(i => i.sourceId === entityId)
        };
      case 'invoice':
        const invoice = state.invoices.find(i => i.id === entityId);
        return {
          customer: state.customers.find(c => c.id === invoice?.customerId),
          relatedQuote: state.quotes.find(q => q.id === invoice?.quoteId),
          relatedIncome: state.income.filter(i => i.sourceId === entityId)
        };
      case 'customer':
        return {
          quotes: state.quotes.filter(q => q.customerId === entityId),
          invoices: state.invoices.filter(i => i.customerId === entityId),
          totalSpent: state.income
            .filter(i => i.customerName === state.customers.find(c => c.id === entityId)?.name)
            .reduce((sum, i) => sum + (i.amount || 0), 0)
        };
      default:
        return {};
    }
  }, [state.quotes, state.invoices, state.customers, state.income]);

  const value = {
    ...state,
    addIncome,
    addExpense,
    addProduct,
    addQuote,
    addInvoice,
    updateIncome,
    updateExpense,
    updateProduct,
    updateQuote,
    updateInvoice,
    deleteIncome,
    deleteExpense,
    deleteProduct,
    deleteQuote,
    deleteInvoice,
    createInvoiceFromQuote,
    getRelatedData
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
