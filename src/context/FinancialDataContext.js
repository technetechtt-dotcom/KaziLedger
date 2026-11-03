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
  SET_STOCK_MOVEMENTS: 'SET_STOCK_MOVEMENTS',
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
  stockMovements: [],
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

    case ACTIONS.SET_STOCK_MOVEMENTS:
      return { ...state, stockMovements: action.payload };
    
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
  
  const getBal = (invoice) => {
    if (invoice.type === 'credit_note') return 0;
    if (invoice.balanceDue != null) return Math.max(0, parseFloat(invoice.balanceDue) || 0);
    const total = parseFloat(invoice.total ?? invoice.amount ?? 0) || 0;
    const paid = parseFloat(invoice.amountPaid ?? 0) || 0;
    if (invoice.status === 'paid') return 0;
    return Math.max(0, total - paid);
  };

  // Invoice calculations using consistent logic
  const regularInvoices = invoices.filter(invoice => invoice.type !== 'credit_note');
  const paidInvoices = regularInvoices.filter(invoice => invoice.status === 'paid');
  const pendingInvoices = regularInvoices.filter(invoice =>
    invoice.status === 'pending' || invoice.status === 'partial'
  );
  
  // Use 30-day overdue logic consistently
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const overdueInvoices = regularInvoices.filter(invoice => {
    if (invoice.status === 'paid' || invoice.status === 'credited') return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < thirtyDaysAgo; // 30+ days past due
  });
  
  const paidAmount = paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total ?? invoice.amount ?? 0), 0);
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + getBal(invoice), 0);
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + getBal(invoice), 0);
  
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

    // Stock movements listener
    const stockQuery = query(
      collection(db, 'users', user.uid, 'stockMovements'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeStock = onSnapshot(
      stockQuery,
      (snapshot) => {
        const movements = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        dispatch({ type: ACTIONS.SET_STOCK_MOVEMENTS, payload: movements });
      },
      () => {
        dispatch({ type: ACTIONS.SET_STOCK_MOVEMENTS, payload: [] });
      }
    );
    unsubscribeFunctions.push(unsubscribeStock);

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

      const total = parseFloat(invoiceData.total ?? invoiceData.amount ?? 0) || 0;
      const amountPaid = parseFloat(invoiceData.amountPaid ?? 0) || 0;
      const normalized = {
        type: 'invoice',
        payments: [],
        amountPaid,
        balanceDue: Math.max(0, total - amountPaid),
        ...invoiceData,
        amount: total,
        total
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), {
        ...normalized,
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

  // Record stock movement
  const addStockMovement = useCallback(async (movementData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'stockMovements'), {
        ...movementData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
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

  // Update invoice (income is created via recordPayment unless skipAutoIncome is false and status becomes paid without payments)
  const updateInvoice = useCallback(async (id, invoiceData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const currentInvoice = state.invoices.find(i => i.id === id);
      const { skipAutoIncome, ...dataToSave } = invoiceData;
      
      await updateDoc(doc(db, 'users', user.uid, 'invoices', id), {
        ...dataToSave,
        updatedAt: serverTimestamp()
      });
      
      // Legacy path: mark paid without going through recordPayment
      if (
        !skipAutoIncome &&
        currentInvoice?.status !== 'paid' &&
        dataToSave.status === 'paid' &&
        !(dataToSave.payments && dataToSave.payments.length)
      ) {
        const total = dataToSave.total || dataToSave.amount || currentInvoice?.total || currentInvoice?.amount || 0;
        const alreadyPaid = parseFloat(currentInvoice?.amountPaid || 0) || 0;
        const remaining = Math.max(0, total - alreadyPaid);
        if (remaining > 0) {
          await addIncome({
            amount: remaining,
            date: new Date().toISOString().split('T')[0],
            category: 'sales',
            service: 'Invoice Paid',
            product: dataToSave.customerName || dataToSave.clientName || currentInvoice?.clientName || 'Customer',
            notes: `Invoice #${dataToSave.invoiceNumber || currentInvoice?.invoiceNumber} paid`,
            source: 'invoice',
            sourceId: id
          });
        }
      }
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.invoices, addIncome]);

  // Record a (partial or full) payment against an invoice
  const recordPayment = useCallback(async (invoiceId, payment) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const invoice = state.invoices.find(i => i.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.type === 'credit_note') throw new Error('Cannot record payment on a credit note');

      const total = parseFloat(invoice.total ?? invoice.amount ?? 0) || 0;
      const previousPaid = parseFloat(invoice.amountPaid ?? 0) || 0;
      const payAmount = parseFloat(payment.amount) || 0;
      if (payAmount <= 0) throw new Error('Payment amount must be greater than zero');
      if (payAmount > total - previousPaid + 0.001) {
        throw new Error('Payment exceeds remaining balance');
      }

      const paymentRecord = {
        id: `pay_${Date.now()}`,
        amount: payAmount,
        date: payment.date || new Date().toISOString().split('T')[0],
        method: payment.method || 'other',
        notes: payment.notes || ''
      };

      const amountPaid = previousPaid + payAmount;
      const balanceDue = Math.max(0, total - amountPaid);
      const status = balanceDue <= 0.001 ? 'paid' : 'partial';
      const payments = [...(invoice.payments || []), paymentRecord];

      await updateDoc(doc(db, 'users', user.uid, 'invoices', invoiceId), {
        amountPaid,
        balanceDue,
        status,
        payments,
        paidDate: status === 'paid' ? new Date().toISOString() : (invoice.paidDate || null),
        updatedAt: serverTimestamp()
      });

      await addIncome({
        amount: payAmount,
        date: paymentRecord.date,
        category: 'sales',
        service: 'Invoice Payment',
        product: invoice.clientName || invoice.customerName || 'Customer',
        notes: `Payment for invoice ${invoice.invoiceNumber}${payment.notes ? ` — ${payment.notes}` : ''}`,
        source: 'invoice',
        sourceId: invoiceId,
        paymentId: paymentRecord.id
      });

      return { success: true, status, balanceDue, amountPaid };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.invoices, addIncome]);

  // Void an unpaid / partially paid invoice (clears remaining balance)
  const voidInvoice = useCallback(async (invoiceId, reason = '') => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const invoice = state.invoices.find(i => i.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.type === 'credit_note') throw new Error('Cannot void a credit note');
      if (invoice.status === 'paid') throw new Error('Cannot void a paid invoice');
      if (invoice.status === 'void') throw new Error('Invoice is already void');

      await updateDoc(doc(db, 'users', user.uid, 'invoices', invoiceId), {
        status: 'void',
        balanceDue: 0,
        voidedAt: new Date().toISOString(),
        voidReason: reason || '',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.invoices]);

  // Create a credit note linked to an invoice
  const createCreditNote = useCallback(async (invoiceId, options = {}) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const invoice = state.invoices.find(i => i.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const creditAmount = parseFloat(options.amount ?? invoice.balanceDue ?? invoice.total ?? invoice.amount ?? 0) || 0;
      if (creditAmount <= 0) throw new Error('Credit amount must be greater than zero');

      const creditNumber = `CN-${Date.now().toString().slice(-6)}`;
      const creditData = {
        type: 'credit_note',
        invoiceNumber: creditNumber,
        creditNoteFor: invoiceId,
        customerId: invoice.customerId || null,
        clientName: invoice.clientName || invoice.customerName || '',
        clientEmail: invoice.clientEmail || '',
        clientPhone: invoice.clientPhone || '',
        clientAddress: invoice.clientAddress || '',
        amount: -Math.abs(creditAmount),
        total: -Math.abs(creditAmount),
        amountPaid: 0,
        balanceDue: 0,
        status: 'issued',
        description: options.reason || `Credit note for invoice ${invoice.invoiceNumber}`,
        dueDate: new Date().toISOString().split('T')[0],
        invoiceDate: new Date().toISOString().split('T')[0],
        items: invoice.items || [],
        payments: []
      };

      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), {
        ...creditData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const applyToBalance = options.applyToBalance !== false;
      if (applyToBalance) {
        const total = parseFloat(invoice.total ?? invoice.amount ?? 0) || 0;
        const previousPaid = parseFloat(invoice.amountPaid ?? 0) || 0;
        const newPaid = Math.min(total, previousPaid + creditAmount);
        const balanceDue = Math.max(0, total - newPaid);
        const status = balanceDue <= 0.001 ? 'credited' : (previousPaid > 0 || newPaid > 0 ? 'partial' : invoice.status);

        await updateDoc(doc(db, 'users', user.uid, 'invoices', invoiceId), {
          amountPaid: newPaid,
          balanceDue,
          status: balanceDue <= 0.001 ? 'credited' : status,
          creditNoteId: docRef.id,
          updatedAt: serverTimestamp()
        });
      }

      return { success: true, id: docRef.id, creditNumber };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user, state.invoices]);

  // Generate invoices that are due from recurring templates
  const generateDueRecurringInvoices = useCallback(async () => {
    if (!user) return { success: false, error: 'User not authenticated', created: 0 };
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const templates = state.invoices.filter(
        inv => inv.isRecurring && inv.recurrence?.active !== false && inv.type !== 'credit_note'
      );

      let created = 0;
      for (const template of templates) {
        const nextRun = template.recurrence?.nextRun ? new Date(template.recurrence.nextRun) : null;
        if (!nextRun || nextRun > today) continue;
        if (template.recurrence?.endDate && new Date(template.recurrence.endDate) < today) continue;

        const total = parseFloat(template.total ?? template.amount ?? 0) || 0;
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${created}`;
        const dueDays = 30;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);

        await addDoc(collection(db, 'users', user.uid, 'invoices'), {
          type: 'invoice',
          invoiceNumber,
          customerId: template.customerId || null,
          clientName: template.clientName || '',
          clientEmail: template.clientEmail || '',
          clientPhone: template.clientPhone || '',
          clientAddress: template.clientAddress || '',
          clientCity: template.clientCity || '',
          clientPostalCode: template.clientPostalCode || '',
          clientCountry: template.clientCountry || '',
          items: template.items || [],
          amount: total,
          total,
          amountPaid: 0,
          balanceDue: total,
          payments: [],
          description: template.description || `Recurring invoice from ${template.invoiceNumber}`,
          status: 'pending',
          dueDate: dueDate.toISOString().split('T')[0],
          invoiceDate: new Date().toISOString().split('T')[0],
          recurringFrom: template.id,
          isRecurring: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const interval = template.recurrence?.interval || 'monthly';
        const next = new Date(nextRun);
        if (interval === 'weekly') next.setDate(next.getDate() + 7);
        else if (interval === 'quarterly') next.setMonth(next.getMonth() + 3);
        else next.setMonth(next.getMonth() + 1);

        await updateDoc(doc(db, 'users', user.uid, 'invoices', template.id), {
          recurrence: {
            ...template.recurrence,
            nextRun: next.toISOString().split('T')[0],
            active: true
          },
          updatedAt: serverTimestamp()
        });
        created += 1;
      }

      return { success: true, created };
    } catch (error) {
      return { success: false, error: error.message, created: 0 };
    }
  }, [user, state.invoices]);

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

      if (quote.status === 'invoiced') {
        throw new Error('This quote has already been converted to an invoice');
      }

      const existingInvoice = state.invoices.find(inv => inv.quoteId === quoteId);
      if (existingInvoice) {
        throw new Error('An invoice already exists for this quote');
      }
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const totalAmount = parseFloat(quote.total || quote.amount || 0) || 0;
      const itemDescription = (quote.items || [])
        .map(item => item.name || item.description)
        .filter(Boolean)
        .join(', ');
      const customer = typeof quote.customer === 'object' ? quote.customer : null;
      
      const invoiceData = {
        invoiceNumber,
        customer: quote.customer || null,
        customerId: quote.customerId || customer?.id || null,
        customerName: quote.customerName || customer?.name || '',
        clientName: quote.customerName || customer?.name || '',
        clientEmail: customer?.email || quote.clientEmail || '',
        clientPhone: customer?.phone || quote.clientPhone || '',
        clientAddress: customer?.address || quote.clientAddress || '',
        clientCity: customer?.city || quote.clientCity || '',
        clientPostalCode: customer?.postalCode || quote.clientPostalCode || '',
        clientCountry: customer?.country || quote.clientCountry || '',
        items: quote.items || [],
        subtotal: quote.subtotal || totalAmount,
        vatRate: quote.vatRate || 0,
        vatAmount: quote.vatAmount || 0,
        discount: quote.discount || 0,
        amount: totalAmount,
        total: totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        payments: [],
        type: 'invoice',
        description: quote.notes || itemDescription || `Converted from quote #${quote.quoteNumber}`,
        notes: quote.notes || '',
        status: 'pending',
        quoteId: quoteId,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        acceptedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Decrement stock only for physical products (not services/consultations)
      if (quote.items) {
        for (const item of quote.items) {
          if (!item.productId) continue;
          const product = state.products.find(p => p.id === item.productId);
          if (!product) continue;
          const itemType = product.itemType || item.itemType || 'product';
          if (itemType !== 'product') continue;

          const previousQty = product.quantity || 0;
          const newQuantity = previousQty - (item.quantity || 0);
          await updateProduct(item.productId, {
            quantity: Math.max(0, newQuantity),
            currentStock: Math.max(0, newQuantity),
            lastSold: serverTimestamp()
          });
          await addDoc(collection(db, 'users', user.uid, 'stockMovements'), {
            productId: item.productId,
            productName: product.name,
            type: 'out',
            quantity: item.quantity || 0,
            previousQuantity: previousQty,
            newQuantity: Math.max(0, newQuantity),
            reference: invoiceNumber,
            notes: `Sold via quote ${quote.quoteNumber}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Mark quote as accepted and invoiced
      await updateDoc(doc(db, 'users', user.uid, 'quotes', quoteId), {
        status: 'invoiced',
        acceptedAt: new Date().toISOString(),
        invoicedAt: new Date().toISOString(),
        invoiceId: docRef.id,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, state.quotes, state.invoices, state.products, updateProduct]);

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
    recordPayment,
    voidInvoice,
    createCreditNote,
    generateDueRecurringInvoices,
    addStockMovement,
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
