import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

export async function ensureDefaultChartOfAccounts(userId) {
  if (!userId) return;
  const snap = await getDocs(query(collection(db, 'users', userId, 'glAccounts')));
  if (!snap.empty) return;
  for (const account of DEFAULT_COA) {
    await setDoc(doc(db, 'users', userId, 'glAccounts', account.code), {
      ...account,
      balance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Post a balanced journal and update GL account balances.
 */
export async function postJournalEntry(userId, { memo, date, lines, source, sourceId }) {
  if (!userId) throw new Error('Not authenticated');
  await ensureDefaultChartOfAccounts(userId);

  const debit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const credit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  if (Math.abs(debit - credit) > 0.01) {
    throw new Error('Journal is out of balance');
  }

  const ref = await addDoc(collection(db, 'users', userId, 'journals'), {
    memo: memo || '',
    date: date || new Date().toISOString().split('T')[0],
    lines,
    debitTotal: debit,
    creditTotal: credit,
    source: source || null,
    sourceId: sourceId || null,
    status: 'posted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const accountsSnap = await getDocs(query(collection(db, 'users', userId, 'glAccounts')));
  const accounts = accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  for (const line of lines) {
    const account = accounts.find((a) => a.code === line.accountCode || a.id === line.accountCode);
    if (!account) continue;
    const delta = (parseFloat(line.debit) || 0) - (parseFloat(line.credit) || 0);
    const sign = ['liability', 'equity', 'income'].includes(account.type) ? -1 : 1;
    const next = (parseFloat(account.balance) || 0) + sign * delta;
    await updateDoc(doc(db, 'users', userId, 'glAccounts', account.id || account.code), {
      balance: next,
      updatedAt: serverTimestamp()
    });
  }

  return { success: true, id: ref.id };
}

/** Invoice issued on credit: Dr AR, Cr Sales (+ VAT) */
export async function postInvoiceJournal(userId, { amount, vatAmount = 0, date, invoiceNumber, sourceId }) {
  const total = parseFloat(amount) || 0;
  const vat = parseFloat(vatAmount) || 0;
  const net = Math.max(0, total - vat);
  if (total <= 0) return { success: false, error: 'Invalid amount' };

  const lines = [
    { accountCode: '1100', debit: total, credit: 0, memo: 'AR' },
    { accountCode: '4000', debit: 0, credit: net > 0 ? net : total, memo: 'Sales' }
  ];
  if (vat > 0) {
    lines.push({ accountCode: '2100', debit: 0, credit: vat, memo: 'VAT' });
  }

  return postJournalEntry(userId, {
    memo: `Invoice ${invoiceNumber || ''}`.trim(),
    date,
    lines,
    source: 'invoice',
    sourceId
  });
}

/** Payment against invoice: Dr Bank, Cr AR */
export async function postPaymentJournal(userId, { amount, date, invoiceNumber, clientName, sourceId }) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: `Payment received — ${invoiceNumber || 'Invoice'} (${clientName || 'Customer'})`,
    date,
    lines: [
      { accountCode: '1000', debit: amt, credit: 0, memo: 'Bank / Cash' },
      { accountCode: '1100', debit: 0, credit: amt, memo: 'Accounts Receivable' }
    ],
    source: 'invoice_payment',
    sourceId
  });
}

/** Cash / POS / direct income: Dr Bank, Cr Sales (+ VAT) */
export async function postCashSaleJournal(userId, {
  amount,
  vatAmount = 0,
  date,
  memo,
  source,
  sourceId
}) {
  const total = parseFloat(amount) || 0;
  const vat = parseFloat(vatAmount) || 0;
  const net = Math.max(0, total - vat);
  if (total <= 0) return { success: false, error: 'Invalid amount' };

  const lines = [
    { accountCode: '1000', debit: total, credit: 0, memo: 'Bank / Cash' },
    { accountCode: '4000', debit: 0, credit: net > 0 ? net : total, memo: 'Sales' }
  ];
  if (vat > 0) {
    lines.push({ accountCode: '2100', debit: 0, credit: vat, memo: 'VAT' });
  }

  return postJournalEntry(userId, {
    memo: memo || 'Cash sale / income',
    date,
    lines,
    source: source || 'income',
    sourceId
  });
}

export async function postExpenseJournal(userId, { amount, date, category, notes, sourceId }) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: notes || `Expense — ${category || 'Operating'}`,
    date,
    lines: [
      { accountCode: '5100', debit: amt, credit: 0, memo: category || 'Operating Expenses' },
      { accountCode: '1000', debit: 0, credit: amt, memo: 'Bank / Cash' }
    ],
    source: 'expense',
    sourceId
  });
}

/** Cost of goods sold when stock leaves: Dr COGS 5000, Cr Inventory 1200 */
export async function postCogsJournal(userId, { costAmount, date, productName, source, sourceId }) {
  const cost = parseFloat(costAmount) || 0;
  if (cost <= 0) return { success: false, error: 'No cost' };
  return postJournalEntry(userId, {
    memo: `COGS — ${productName || 'Inventory'}`,
    date: date || new Date().toISOString().split('T')[0],
    lines: [
      { accountCode: '5000', debit: cost, credit: 0, memo: 'Cost of Sales' },
      { accountCode: '1200', debit: 0, credit: cost, memo: 'Inventory' }
    ],
    source: source || 'cogs',
    sourceId
  });
}

/** Purchase stock on credit or cash: Dr Inventory 1200, Cr AP 2000 or Bank 1000 */
export async function postPurchaseJournal(userId, {
  amount,
  date,
  supplierName,
  paid = false,
  sourceId
}) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: `Stock purchase — ${supplierName || 'Supplier'}`,
    date: date || new Date().toISOString().split('T')[0],
    lines: [
      { accountCode: '1200', debit: amt, credit: 0, memo: 'Inventory' },
      {
        accountCode: paid ? '1000' : '2000',
        debit: 0,
        credit: amt,
        memo: paid ? 'Bank / Cash' : 'Accounts Payable'
      }
    ],
    source: 'purchase_order',
    sourceId
  });
}

/** Soft-fail bank deposit so money also appears in Bank Feeds when an account exists */
export async function recordBankDeposit(userId, { amount, date, description, reference, source, sourceId }) {
  try {
    const amt = parseFloat(amount) || 0;
    if (!userId || amt <= 0) return { success: false };

    const accountsSnap = await getDocs(query(collection(db, 'users', userId, 'bankAccounts')));
    if (accountsSnap.empty) return { success: false, error: 'No bank account' };

    const accountDoc = accountsSnap.docs[0];
    const account = { id: accountDoc.id, ...accountDoc.data() };
    const nextBalance = (parseFloat(account.balance) || 0) + amt;

    await addDoc(collection(db, 'users', userId, 'bankTransactions'), {
      bankAccountId: account.id,
      date: date || new Date().toISOString().split('T')[0],
      description: description || 'Deposit',
      amount: amt,
      reference: reference || '',
      source: source || 'auto',
      sourceId: sourceId || null,
      status: 'reconciled',
      matchedType: source || 'income',
      matchedId: sourceId || null,
      matchedLabel: description || 'Auto deposit',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'users', userId, 'bankAccounts', account.id), {
      balance: nextBalance,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (e) {
    console.warn('Bank deposit auto-record skipped', e);
    return { success: false, error: e.message };
  }
}
