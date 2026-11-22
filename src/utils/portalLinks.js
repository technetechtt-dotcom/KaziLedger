import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateSecureToken } from './security';

/**
 * Create a customer portal link with a denormalized public snapshot.
 * Writes users/{uid}/portalLinks/{token} and publicPortal/{token}.
 */
export async function createCustomerPortalLink({
  userId,
  business,
  customer,
  invoices = [],
  quotes = []
}) {
  if (!userId || !customer?.id) {
    return { success: false, error: 'Missing user or customer' };
  }

  const token = generateSecureToken(24);
  const customerInvoices = invoices
    .filter((i) => i.customerId === customer.id || i.clientEmail === customer.email)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      status: i.status,
      total: i.total ?? i.amount ?? 0,
      balanceDue: i.balanceDue ?? (i.status === 'paid' ? 0 : i.total ?? i.amount ?? 0),
      dueDate: i.dueDate || '',
      invoiceDate: i.invoiceDate || i.createdAt || ''
    }));

  const customerQuotes = quotes
    .filter((q) => q.customerId === customer.id || q.customer?.id === customer.id)
    .map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      status: q.status,
      total: q.total ?? q.amount ?? 0,
      validUntil: q.validUntil || '',
      date: q.createdAt || q.date || ''
    }));

  const outstanding = customerInvoices
    .filter((i) => i.status !== 'paid' && i.status !== 'void')
    .reduce((s, i) => s + (parseFloat(i.balanceDue) || 0), 0);

  const payload = {
    token,
    userId,
    customerId: customer.id,
    customerName: customer.name || '',
    customerEmail: customer.email || '',
    businessName: business?.name || business?.businessName || 'KaziLedger',
    businessEmail: business?.email || business?.businessEmail || '',
    businessPhone: business?.phone || business?.businessPhone || '',
    invoices: customerInvoices,
    quotes: customerQuotes,
    outstandingTotal: +outstanding.toFixed(2),
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  };

  await setDoc(doc(db, 'users', userId, 'portalLinks', token), payload);
  // Public mirror for unauthenticated portal page
  await setDoc(doc(db, 'publicPortal', token), {
    ...payload,
    createdAt: new Date().toISOString()
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/portal/${token}`;
  return { success: true, token, url, outstanding };
}

export async function loadPublicPortal(token) {
  if (!token) return { success: false, error: 'Missing token' };
  try {
    const snap = await getDoc(doc(db, 'publicPortal', token));
    if (!snap.exists()) return { success: false, error: 'Portal link not found or expired' };
    const data = snap.data();
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return { success: false, error: 'This portal link has expired' };
    }
    return { success: true, data: { id: snap.id, ...data } };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
