/**
 * KaziLedger Cloud Functions — callable HTTPS + Firestore triggers
 */
const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

setGlobalOptions({ maxInstances: 10 });
admin.initializeApp();

const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

function getTransporter() {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    return null;
  }
  return nodemailer.createTransport(emailConfig);
}

function requireAuth(request) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  return request.auth.uid;
}

function assertSelf(request, userId) {
  const uid = requireAuth(request);
  if (userId && userId !== uid) {
    throw new HttpsError('permission-denied', 'Cannot access another user\'s data');
  }
  return uid;
}

exports.generateQuoteNumber = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const db = admin.firestore();
  const quotesRef = db.collection(`users/${userId}/quotes`);
  const snapshot = await quotesRef.orderBy('createdAt', 'desc').limit(1).get();

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastQuote = snapshot.docs[0].data();
    const lastNumber = parseInt(String(lastQuote.quoteNumber || '').replace(/\D/g, '') || '0', 10);
    nextNumber = lastNumber + 1;
  }
  return { quoteNumber: `Q-${String(nextNumber).padStart(4, '0')}` };
});

exports.generateInvoiceNumber = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const db = admin.firestore();
  const invoicesRef = db.collection(`users/${userId}/invoices`);
  const snapshot = await invoicesRef.orderBy('createdAt', 'desc').limit(1).get();

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const lastNumber = parseInt(String(lastInvoice.invoiceNumber || '').replace(/\D/g, '') || '0', 10);
    nextNumber = lastNumber + 1;
  }
  return { invoiceNumber: `INV-${String(nextNumber).padStart(4, '0')}` };
});

exports.updateInventoryOnSale = onDocumentUpdated(
  'users/{userId}/quotes/{quoteId}',
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status === 'accepted' || after.status !== 'accepted') return;

    const db = admin.firestore();
    const batch = db.batch();

    for (const item of after.items || []) {
      if (!item.productId) continue;
      const productRef = db.doc(`users/${event.params.userId}/products/${item.productId}`);
      const productDoc = await productRef.get();
      if (!productDoc.exists) continue;
      const data = productDoc.data();
      const currentStock = data.quantity ?? data.currentStock ?? data.stockQuantity ?? 0;
      const newStock = Math.max(0, currentStock - (item.quantity || 0));
      batch.update(productRef, {
        quantity: newStock,
        currentStock: newStock,
        stockQuantity: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    logger.info('Inventory updated for accepted quote:', event.params.quoteId);
  }
);

exports.sendQuoteEmail = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const { quoteId, clientEmail, clientName, quoteData } = request.data || {};
  if (!clientEmail) throw new HttpsError('invalid-argument', 'clientEmail required');

  const transporter = getTransporter();
  if (!transporter) {
    throw new HttpsError(
      'failed-precondition',
      'Email is not configured. Set EMAIL_USER and EMAIL_PASS for Functions.'
    );
  }

  const db = admin.firestore();
  const businessDoc = await db.doc(`users/${userId}/business/profile`).get();
  const business = businessDoc.exists ? businessDoc.data() : {};

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #14b8a6; color: white; padding: 20px; text-align: center;">
        <h1>Quote from ${business.name || 'KaziLedger'}</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>Dear ${clientName || 'Customer'},</p>
        <p>Please find your quote #${quoteData?.quoteNumber || quoteId}.</p>
        <p><strong>Total:</strong> R${Number(quoteData?.total || 0).toFixed(2)}</p>
        <p>${business.name || ''}<br/>${business.email || ''}<br/>${business.phone || ''}</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: emailConfig.auth.user,
    to: clientEmail,
    subject: `Quote #${quoteData?.quoteNumber || quoteId} from ${business.name || 'KaziLedger'}`,
    html: emailHtml
  });

  return { message: 'Quote email sent successfully' };
});

exports.sendInvoiceEmail = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const { invoiceId, clientEmail, clientName, invoiceData } = request.data || {};
  if (!clientEmail) throw new HttpsError('invalid-argument', 'clientEmail required');

  const transporter = getTransporter();
  if (!transporter) {
    throw new HttpsError(
      'failed-precondition',
      'Email is not configured. Set EMAIL_USER and EMAIL_PASS for Functions.'
    );
  }

  const db = admin.firestore();
  const businessDoc = await db.doc(`users/${userId}/business/profile`).get();
  const business = businessDoc.exists ? businessDoc.data() : {};

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
        <h1>Invoice from ${business.name || 'KaziLedger'}</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>Dear ${clientName || 'Customer'},</p>
        <p>Invoice #${invoiceData?.invoiceNumber || invoiceId}</p>
        <p><strong>Total:</strong> R${Number(invoiceData?.total || invoiceData?.amount || 0).toFixed(2)}</p>
        <p><strong>Due:</strong> ${invoiceData?.dueDate || 'N/A'}</p>
        <p>${business.name || ''}<br/>${business.email || ''}<br/>${business.phone || ''}</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: emailConfig.auth.user,
    to: clientEmail,
    subject: `Invoice #${invoiceData?.invoiceNumber || invoiceId} from ${business.name || 'KaziLedger'}`,
    html: emailHtml
  });

  return { message: 'Invoice email sent successfully' };
});

exports.calculateBusinessMetrics = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const period = request.data?.period || 'monthly';
  const db = admin.firestore();
  const now = new Date();
  let startDate;
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [incomeSnap, expenseSnap] = await Promise.all([
    db.collection(`users/${userId}/income`).get(),
    db.collection(`users/${userId}/expenses`).get()
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  incomeSnap.docs.forEach((d) => {
    const data = d.data();
    const dt = data.date ? new Date(data.date) : null;
    if (dt && dt >= startDate) totalIncome += parseFloat(data.amount) || 0;
  });
  expenseSnap.docs.forEach((d) => {
    const data = d.data();
    const dt = data.date ? new Date(data.date) : null;
    if (dt && dt >= startDate) totalExpenses += parseFloat(data.amount) || 0;
  });

  return {
    period,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    transactionCount: incomeSnap.size + expenseSnap.size
  };
});

exports.createInvoiceFromQuote = onDocumentUpdated(
  'users/{userId}/quotes/{quoteId}',
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (before.status === 'accepted' || after.status !== 'accepted') return;
    if (after.invoiceId) return;

    const db = admin.firestore();
    const invoicesRef = db.collection(`users/${event.params.userId}/invoices`);
    const invoiceSnapshot = await invoicesRef.orderBy('createdAt', 'desc').limit(1).get();
    let nextNumber = 1;
    if (!invoiceSnapshot.empty) {
      const lastInvoice = invoiceSnapshot.docs[0].data();
      nextNumber = parseInt(String(lastInvoice.invoiceNumber || '').replace(/\D/g, '') || '0', 10) + 1;
    }
    const invoiceNumber = `INV-${String(nextNumber).padStart(4, '0')}`;
    const total = after.total ?? after.amount ?? 0;

    await invoicesRef.add({
      invoiceNumber,
      quoteId: event.params.quoteId,
      customerId: after.customerId || null,
      clientName: after.clientName || after.customer?.name || '',
      clientEmail: after.clientEmail || after.customer?.email || '',
      items: after.items || [],
      amount: total,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.doc(`users/${event.params.userId}/quotes/${event.params.quoteId}`).update({
      invoiceId: invoiceNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
);

exports.sendPaymentReminders = onCall(async (request) => {
  const userId = requireAuth(request);
  const db = admin.firestore();
  const transporter = getTransporter();
  const reminderDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const invoicesRef = db.collection(`users/${userId}/invoices`);
  const overdueInvoices = await invoicesRef.where('status', 'in', ['pending', 'partial']).get();

  let sent = 0;
  for (const invoiceDoc of overdueInvoices.docs) {
    const invoice = invoiceDoc.data();
    const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (!due || due > reminderDate) continue;
    const email = invoice.clientEmail || invoice.customer?.email;
    if (transporter && email) {
      try {
        await transporter.sendMail({
          from: emailConfig.auth.user,
          to: email,
          subject: `Payment reminder — Invoice ${invoice.invoiceNumber}`,
          text: `Reminder: invoice ${invoice.invoiceNumber} for R${Number(invoice.total || invoice.amount || 0).toFixed(2)} is overdue.`
        });
        sent += 1;
      } catch (e) {
        logger.warn('Reminder email failed', e);
      }
    }
    await invoiceDoc.ref.update({
      lastReminderSent: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  return { message: 'Payment reminders processed', sent };
});

exports.backupBusinessData = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const db = admin.firestore();
  const collections = ['business', 'customers', 'products', 'quotes', 'invoices', 'income', 'expenses'];
  const backupData = {};

  for (const name of collections) {
    const snapshot = await db.collection(`users/${userId}/${name}`).get();
    backupData[name] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  await db.collection('backups').add({
    userId,
    data: backupData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'manual'
  });

  return {
    message: 'Backup created successfully',
    collections: collections.length,
    totalDocuments: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0)
  };
});

exports.validateBusinessData = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const db = admin.firestore();
  const issues = [];

  const quotesSnapshot = await db.collection(`users/${userId}/quotes`).get();
  for (const quoteDoc of quotesSnapshot.docs) {
    const quote = quoteDoc.data();
    if (quote.customerId) {
      const customerDoc = await db.doc(`users/${userId}/customers/${quote.customerId}`).get();
      if (!customerDoc.exists) {
        issues.push({
          type: 'orphaned_quote',
          quoteId: quoteDoc.id,
          message: `Quote ${quote.quoteNumber} references non-existent customer`
        });
      }
    }
  }

  const productsSnapshot = await db.collection(`users/${userId}/products`).get();
  for (const productDoc of productsSnapshot.docs) {
    const product = productDoc.data();
    const stock = product.quantity ?? product.currentStock ?? product.stockQuantity ?? 0;
    if (stock < 0) {
      issues.push({
        type: 'negative_inventory',
        productId: productDoc.id,
        message: `Product ${product.name} has negative stock: ${stock}`
      });
    }
  }

  return { valid: issues.length === 0, issues, totalIssues: issues.length };
});

exports.generateBusinessReport = onCall(async (request) => {
  const userId = assertSelf(request, request.data?.userId);
  const { startDate, endDate } = request.data || {};
  const db = admin.firestore();
  const start = new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = new Date(endDate || Date.now());

  const [quotesSnapshot, invoicesSnapshot] = await Promise.all([
    db.collection(`users/${userId}/quotes`).get(),
    db.collection(`users/${userId}/invoices`).get()
  ]);

  let acceptedQuotes = 0;
  let totalQuoteValue = 0;
  let totalInvoiceValue = 0;
  let paidInvoices = 0;
  let quoteCount = 0;
  let invoiceCount = 0;

  quotesSnapshot.docs.forEach((d) => {
    const quote = d.data();
    const created = quote.createdAt?.toDate?.() || (quote.createdAt ? new Date(quote.createdAt) : null);
    if (created && (created < start || created > end)) return;
    quoteCount += 1;
    totalQuoteValue += quote.total || quote.amount || 0;
    if (quote.status === 'accepted') acceptedQuotes += 1;
  });

  invoicesSnapshot.docs.forEach((d) => {
    const invoice = d.data();
    const created = invoice.createdAt?.toDate?.() || (invoice.createdAt ? new Date(invoice.createdAt) : null);
    if (created && (created < start || created > end)) return;
    invoiceCount += 1;
    totalInvoiceValue += invoice.total || invoice.amount || 0;
    if (invoice.status === 'paid') paidInvoices += 1;
  });

  return {
    period: { startDate: start.toISOString(), endDate: end.toISOString() },
    quotes: {
      total: quoteCount,
      accepted: acceptedQuotes,
      conversionRate: quoteCount ? Math.round((acceptedQuotes / quoteCount) * 10000) / 100 : 0,
      totalValue: totalQuoteValue
    },
    invoices: {
      total: invoiceCount,
      paid: paidInvoices,
      paymentRate: invoiceCount ? Math.round((paidInvoices / invoiceCount) * 10000) / 100 : 0,
      totalValue: totalInvoiceValue
    },
    generatedAt: new Date().toISOString()
  };
});
