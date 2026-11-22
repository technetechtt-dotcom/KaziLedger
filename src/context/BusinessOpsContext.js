import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFirebaseBusiness } from './FirebaseBusinessContext';

const BusinessOpsContext = createContext();

const ACTIONS = {
  SET: 'SET'
};

const initialState = {
  suppliers: [],
  bills: [],
  tasks: []
};

function reducer(state, action) {
  if (action.type === ACTIONS.SET) {
    return { ...state, [action.key]: action.payload };
  }
  return state;
}

export function BusinessOpsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useFirebaseBusiness();

  const col = useCallback(
    (name) => (user ? collection(db, 'users', user.uid, name) : null),
    [user]
  );

  useEffect(() => {
    if (!user) return undefined;
    const unsubs = [];
    const listen = (name, key) => {
      const q = query(col(name), orderBy('createdAt', 'desc'));
      unsubs.push(
        onSnapshot(
          q,
          (snap) => {
            dispatch({
              type: ACTIONS.SET,
              key,
              payload: snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            });
          },
          () => dispatch({ type: ACTIONS.SET, key, payload: [] })
        )
      );
    };
    listen('suppliers', 'suppliers');
    listen('bills', 'bills');
    listen('tasks', 'tasks');
    return () => unsubs.forEach((u) => u());
  }, [user, col]);

  const addSupplier = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(col('suppliers'), {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        category: data.category || 'General',
        notes: data.notes || '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const deleteSupplier = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'suppliers', id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const addBill = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const amount = parseFloat(data.amount) || 0;
      const ref = await addDoc(col('bills'), {
        supplierId: data.supplierId || '',
        supplierName: data.supplierName || '',
        description: data.description || '',
        amount,
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        invoiceRef: data.invoiceRef || '',
        status: data.status || 'unpaid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const markBillPaid = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bills', id), {
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const deleteBill = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bills', id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const addTask = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(col('tasks'), {
        title: data.title || '',
        area: data.area || 'operations',
        dueDate: data.dueDate || '',
        priority: data.priority || 'medium',
        status: 'open',
        notes: data.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const completeTask = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
        status: 'done',
        completedAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const deleteTask = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const value = {
    ...state,
    addSupplier,
    deleteSupplier,
    addBill,
    markBillPaid,
    deleteBill,
    addTask,
    completeTask,
    deleteTask
  };

  return (
    <BusinessOpsContext.Provider value={value}>
      {children}
    </BusinessOpsContext.Provider>
  );
}

export function useBusinessOps() {
  const ctx = useContext(BusinessOpsContext);
  if (!ctx) throw new Error('useBusinessOps must be used within BusinessOpsProvider');
  return ctx;
}
