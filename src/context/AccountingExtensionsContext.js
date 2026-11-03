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
  setDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFirebaseBusiness } from './FirebaseBusinessContext';

const AccountingExtensionsContext = createContext();

const ACTIONS = {
  SET: 'SET',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

const DEFAULT_COA = [
  { code: '1000', name: 'Bank / Cash', type: 'asset', system: true },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', system: true },
  { code: '1200', name: 'Inventory', type: 'asset', system: true },
  { code: '2000', name: 'Accounts Payable', type: 'liability', system: true },
  { code: '2100', name: 'VAT Control', type: 'liability', system: true },
  { code: '2200', name: 'Payroll Payable', type: 'liability', system: true },
  { code: '3000', name: 'Owner Equity', type: 'equity', system: true },
  { code: '4000', name: 'Sales Revenue', type: 'income', system: true },
  { code: '4100', name: 'FX Gain', type: 'income', system: true },
  { code: '5000', name: 'Cost of Sales', type: 'expense', system: true },
  { code: '5100', name: 'Operating Expenses', type: 'expense', system: true },
  { code: '5200', name: 'Salaries & Wages', type: 'expense', system: true },
  { code: '5300', name: 'FX Loss', type: 'expense', system: true }
];

const DEFAULT_FX = [
  { code: 'ZAR', name: 'South African Rand', rateToBase: 1 },
  { code: 'USD', name: 'US Dollar', rateToBase: 18.5 },
  { code: 'EUR', name: 'Euro', rateToBase: 20.2 },
  { code: 'GBP', name: 'British Pound', rateToBase: 23.5 }
];

const initialState = {
  loading: false,
  error: null,
  bankAccounts: [],
  bankTransactions: [],
  accounts: [],
  journals: [],
  employees: [],
  payRuns: [],
  fxRates: [],
  vatReturns: [],
  baseCurrency: 'ZAR'
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET:
      return { ...state, [action.key]: action.payload };
    default:
      return state;
  }
}

export function AccountingExtensionsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useFirebaseBusiness();

  const col = useCallback(
    (name) => (user ? collection(db, 'users', user.uid, name) : null),
    [user]
  );

  useEffect(() => {
    if (!user) return undefined;
    const unsubs = [];

    const listen = (name, key, orderField = 'createdAt') => {
      const q = query(col(name), orderBy(orderField, 'desc'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          dispatch({
            type: ACTIONS.SET,
            key,
            payload: snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          });
        },
        () => dispatch({ type: ACTIONS.SET, key, payload: [] })
      );
      unsubs.push(unsub);
    };

    listen('bankAccounts', 'bankAccounts');
    listen('bankTransactions', 'bankTransactions');
    listen('glAccounts', 'accounts', 'code');
    listen('journals', 'journals');
    listen('employees', 'employees');
    listen('payRuns', 'payRuns');
    listen('fxRates', 'fxRates', 'code');
    listen('vatReturns', 'vatReturns');

    // Seed COA / FX if empty
    (async () => {
      try {
        const coaSnap = await getDocs(query(col('glAccounts')));
        if (coaSnap.empty) {
          for (const account of DEFAULT_COA) {
            await setDoc(doc(db, 'users', user.uid, 'glAccounts', account.code), {
              ...account,
              balance: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
        const fxSnap = await getDocs(query(col('fxRates')));
        if (fxSnap.empty) {
          for (const rate of DEFAULT_FX) {
            await setDoc(doc(db, 'users', user.uid, 'fxRates', rate.code), {
              ...rate,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (e) {
        console.warn('Seed accounting defaults failed', e);
      }
    })();

    return () => unsubs.forEach((u) => u());
  }, [user, col]);

  const addBankAccount = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(col('bankAccounts'), {
        ...data,
        currency: data.currency || 'ZAR',
        balance: parseFloat(data.openingBalance || 0) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const addBankTransaction = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const amount = parseFloat(data.amount) || 0;
      const ref = await addDoc(col('bankTransactions'), {
        ...data,
        amount,
        status: data.status || 'unreconciled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      if (data.bankAccountId) {
        const account = state.bankAccounts.find((a) => a.id === data.bankAccountId);
        if (account) {
          const next = (parseFloat(account.balance) || 0) + amount;
          await updateDoc(doc(db, 'users', user.uid, 'bankAccounts', data.bankAccountId), {
            balance: next,
            updatedAt: serverTimestamp()
          });
        }
      }
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col, state.bankAccounts]);

  const importBankCsvRows = useCallback(async (bankAccountId, rows) => {
    let imported = 0;
    for (const row of rows) {
      const result = await addBankTransaction({
        bankAccountId,
        date: row.date,
        description: row.description || 'Imported',
        amount: row.amount,
        reference: row.reference || '',
        source: 'csv'
      });
      if (result.success) imported += 1;
    }
    return { success: true, imported };
  }, [addBankTransaction]);

  /**
   * Marks a bank transaction as reconciled against a match ({ type, id, label }).
   * Side-effects (invoice payments / expense journals) are intentionally left to
   * the caller (BankFeeds) so FinancialDataContext stays decoupled — call
   * recordPayment for type === 'invoice', or postJournal for expense-like matches.
   */
  const reconcileBankTransaction = useCallback(async (txId, match) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bankTransactions', txId), {
        status: 'reconciled',
        matchedType: match.type,
        matchedId: match.id,
        matchedLabel: match.label || '',
        reconciledAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const unreconcileBankTransaction = useCallback(async (txId) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bankTransactions', txId), {
        status: 'unreconciled',
        matchedType: null,
        matchedId: null,
        matchedLabel: '',
        reconciledAt: null,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const addGlAccount = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const code = String(data.code);
      await setDoc(doc(db, 'users', user.uid, 'glAccounts', code), {
        code,
        name: data.name,
        type: data.type || 'expense',
        balance: 0,
        system: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: code };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const postJournal = useCallback(async ({ memo, date, lines }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const debit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
      const credit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
      if (Math.abs(debit - credit) > 0.01) {
        throw new Error('Journal is out of balance');
      }
      const ref = await addDoc(col('journals'), {
        memo: memo || '',
        date: date || new Date().toISOString().split('T')[0],
        lines,
        debitTotal: debit,
        creditTotal: credit,
        status: 'posted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      for (const line of lines) {
        const account = state.accounts.find((a) => a.code === line.accountCode || a.id === line.accountCode);
        if (!account) continue;
        const delta = (parseFloat(line.debit) || 0) - (parseFloat(line.credit) || 0);
        // Assets/expenses increase with debit; liabilities/equity/income increase with credit
        const sign = ['liability', 'equity', 'income'].includes(account.type) ? -1 : 1;
        const next = (parseFloat(account.balance) || 0) + sign * delta;
        await updateDoc(doc(db, 'users', user.uid, 'glAccounts', account.id || account.code), {
          balance: next,
          updatedAt: serverTimestamp()
        });
      }

      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col, state.accounts]);

  const addEmployee = useCallback(async (data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(col('employees'), {
        ...data,
        salary: parseFloat(data.salary) || 0,
        status: data.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const updateEmployee = useCallback(async (id, data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, 'users', user.uid, 'employees', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const deleteEmployee = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'employees', id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const runPayroll = useCallback(async ({ periodStart, periodEnd, employeeIds }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const selected = state.employees.filter(
        (e) => e.status === 'active' && (!employeeIds?.length || employeeIds.includes(e.id))
      );
      if (!selected.length) throw new Error('No active employees selected');

      const lines = selected.map((emp) => {
        const gross = parseFloat(emp.salary) || 0;
        const tax = +(gross * 0.18).toFixed(2);
        const uif = +(gross * 0.01).toFixed(2);
        const net = +(gross - tax - uif).toFixed(2);
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          gross,
          tax,
          uif,
          net
        };
      });

      const totals = lines.reduce(
        (acc, l) => ({
          gross: acc.gross + l.gross,
          tax: acc.tax + l.tax,
          uif: acc.uif + l.uif,
          net: acc.net + l.net
        }),
        { gross: 0, tax: 0, uif: 0, net: 0 }
      );

      const ref = await addDoc(col('payRuns'), {
        periodStart,
        periodEnd,
        lines,
        totals,
        status: 'posted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await postJournal({
        memo: `Payroll ${periodStart} to ${periodEnd}`,
        date: periodEnd,
        lines: [
          { accountCode: '5200', debit: totals.gross, credit: 0, memo: 'Salaries' },
          { accountCode: '2200', debit: 0, credit: totals.net, memo: 'Net pay' },
          { accountCode: '2100', debit: 0, credit: totals.tax + totals.uif, memo: 'PAYE/UIF' }
        ]
      });

      return { success: true, id: ref.id, totals };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col, state.employees, postJournal]);

  const upsertFxRate = useCallback(async (code, data) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      await setDoc(doc(db, 'users', user.uid, 'fxRates', code), {
        code,
        name: data.name || code,
        rateToBase: parseFloat(data.rateToBase) || 1,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const convertAmount = useCallback((amount, fromCode, toCode = state.baseCurrency) => {
    const rates = state.fxRates.length ? state.fxRates : DEFAULT_FX;
    const from = rates.find((r) => r.code === fromCode) || { rateToBase: 1 };
    const to = rates.find((r) => r.code === toCode) || { rateToBase: 1 };
    const inBase = (parseFloat(amount) || 0) * (parseFloat(from.rateToBase) || 1);
    return inBase / (parseFloat(to.rateToBase) || 1);
  }, [state.fxRates, state.baseCurrency]);

  const saveVatReturn = useCallback(async (payload) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(col('vatReturns'), {
        ...payload,
        status: payload.status || 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, col]);

  const value = {
    ...state,
    addBankAccount,
    addBankTransaction,
    importBankCsvRows,
    reconcileBankTransaction,
    unreconcileBankTransaction,
    addGlAccount,
    postJournal,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    runPayroll,
    upsertFxRate,
    convertAmount,
    saveVatReturn,
    defaultCoa: DEFAULT_COA,
    defaultFx: DEFAULT_FX
  };

  return (
    <AccountingExtensionsContext.Provider value={value}>
      {children}
    </AccountingExtensionsContext.Provider>
  );
}

export function useAccountingExtensions() {
  const ctx = useContext(AccountingExtensionsContext);
  if (!ctx) {
    throw new Error('useAccountingExtensions must be used within AccountingExtensionsProvider');
  }
  return ctx;
}
