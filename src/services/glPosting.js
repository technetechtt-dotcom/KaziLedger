import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Post a balanced journal and update GL account balances.
 * Used by finance flows that sit outside AccountingExtensionsProvider order.
 */
export async function postJournalEntry(userId, { memo, date, lines }) {
  if (!userId) throw new Error('Not authenticated');
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

export async function postPaymentJournal(userId, { amount, date, invoiceNumber, clientName }) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: `Payment received — ${invoiceNumber || 'Invoice'} (${clientName || 'Customer'})`,
    date,
    lines: [
      { accountCode: '1000', debit: amt, credit: 0, memo: 'Bank / Cash' },
      { accountCode: '1100', debit: 0, credit: amt, memo: 'Accounts Receivable' }
    ]
  });
}

export async function postExpenseJournal(userId, { amount, date, category, notes }) {
  const amt = parseFloat(amount) || 0;
  if (amt <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: notes || `Expense — ${category || 'Operating'}`,
    date,
    lines: [
      { accountCode: '5100', debit: amt, credit: 0, memo: category || 'Operating Expenses' },
      { accountCode: '1000', debit: 0, credit: amt, memo: 'Bank / Cash' }
    ]
  });
}

export async function postInvoiceJournal(userId, { amount, vatAmount = 0, date, invoiceNumber }) {
  const total = parseFloat(amount) || 0;
  const vat = parseFloat(vatAmount) || 0;
  const net = Math.max(0, total - vat);
  if (total <= 0) return { success: false, error: 'Invalid amount' };
  return postJournalEntry(userId, {
    memo: `Invoice ${invoiceNumber || ''}`.trim(),
    date,
    lines: [
      { accountCode: '1100', debit: total, credit: 0, memo: 'AR' },
      { accountCode: '4000', debit: 0, credit: net, memo: 'Sales' },
      ...(vat > 0 ? [{ accountCode: '2100', debit: 0, credit: vat, memo: 'VAT' }] : [
        // If no VAT split, credit full amount to sales already covered by net===total
      ])
    ].filter((l) => (l.debit || 0) + (l.credit || 0) > 0)
  });
}
