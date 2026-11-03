/**
 * Accounts receivable aging helpers (Current, 1-30, 31-60, 61-90, 90+).
 */

export const getInvoiceAmount = (invoice) =>
  parseFloat(invoice?.total ?? invoice?.amount ?? 0) || 0;

export const getInvoiceBalance = (invoice) => {
  if (invoice?.balanceDue != null && invoice.balanceDue !== '') {
    return Math.max(0, parseFloat(invoice.balanceDue) || 0);
  }
  if (invoice?.type === 'credit_note') {
    return 0;
  }
  const total = getInvoiceAmount(invoice);
  const paid = parseFloat(invoice?.amountPaid ?? 0) || 0;
  if (invoice?.status === 'paid') return 0;
  return Math.max(0, total - paid);
};

export const isOutstandingInvoice = (invoice) => {
  if (!invoice) return false;
  if (invoice.type === 'credit_note') return false;
  if (invoice.status === 'paid' || invoice.status === 'credited') return false;
  return getInvoiceBalance(invoice) > 0;
};

const getDueDate = (invoice) => {
  if (!invoice?.dueDate) return null;
  if (typeof invoice.dueDate === 'object' && typeof invoice.dueDate.toDate === 'function') {
    return invoice.dueDate.toDate();
  }
  const d = new Date(invoice.dueDate);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const getDaysPastDue = (invoice, asOf = new Date()) => {
  const due = getDueDate(invoice);
  if (!due) return 0;
  const start = new Date(due);
  start.setHours(0, 0, 0, 0);
  const end = new Date(asOf);
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getAgingBucket = (invoice, asOf = new Date()) => {
  const days = getDaysPastDue(invoice, asOf);
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
};

export const EMPTY_AGING = {
  current: 0,
  '1-30': 0,
  '31-60': 0,
  '61-90': 0,
  '90+': 0,
  total: 0,
  counts: {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0
  }
};

/**
 * Build AR aging summary from outstanding invoices.
 */
export const buildArAging = (invoices = [], asOf = new Date()) => {
  const result = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
    total: 0,
    counts: {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0
    },
    invoices: []
  };

  invoices.filter(isOutstandingInvoice).forEach((invoice) => {
    const balance = getInvoiceBalance(invoice);
    const bucket = getAgingBucket(invoice, asOf);
    result[bucket] += balance;
    result.counts[bucket] += 1;
    result.total += balance;
    result.invoices.push({
      ...invoice,
      balance,
      agingBucket: bucket,
      daysPastDue: Math.max(0, getDaysPastDue(invoice, asOf))
    });
  });

  return result;
};

export const AGING_LABELS = [
  { key: 'current', label: 'Current' },
  { key: '1-30', label: '1–30 days' },
  { key: '31-60', label: '31–60 days' },
  { key: '61-90', label: '61–90 days' },
  { key: '90+', label: '90+ days' }
];
