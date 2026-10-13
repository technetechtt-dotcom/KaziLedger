/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated, onDocumentWritten} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Email configuration (you'll need to set these in Firebase Functions config)
const emailConfig = {
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

const transporter = nodemailer.createTransporter(emailConfig);

// Generate unique quote/invoice numbers
exports.generateQuoteNumber = onRequest(async (req, res) => {
  try {
    const {userId} = req.body;
    const db = admin.firestore();
    
    const quotesRef = db.collection(`users/${userId}/quotes`);
    const snapshot = await quotesRef.orderBy('createdAt', 'desc').limit(1).get();
    
    let nextNumber = 1;
    if (!snapshot.empty) {
      const lastQuote = snapshot.docs[0].data();
      const lastNumber = parseInt(lastQuote.quoteNumber?.replace('Q-', '') || '0');
      nextNumber = lastNumber + 1;
    }
    
    const quoteNumber = `Q-${String(nextNumber).padStart(4, '0')}`;
    res.json({quoteNumber});
  } catch (error) {
    logger.error('Error generating quote number:', error);
    res.status(500).json({error: 'Failed to generate quote number'});
  }
});

exports.generateInvoiceNumber = onRequest(async (req, res) => {
  try {
    const {userId} = req.body;
    const db = admin.firestore();
    
    const invoicesRef = db.collection(`users/${userId}/invoices`);
    const snapshot = await invoicesRef.orderBy('createdAt', 'desc').limit(1).get();
    
    let nextNumber = 1;
    if (!snapshot.empty) {
      const lastInvoice = snapshot.docs[0].data();
      const lastNumber = parseInt(lastInvoice.invoiceNumber?.replace('INV-', '') || '0');
      nextNumber = lastNumber + 1;
    }
    
    const invoiceNumber = `INV-${String(nextNumber).padStart(4, '0')}`;
    res.json({invoiceNumber});
  } catch (error) {
    logger.error('Error generating invoice number:', error);
    res.status(500).json({error: 'Failed to generate invoice number'});
  }
});

// Auto-update inventory when products are sold
exports.updateInventoryOnSale = onDocumentUpdated(
  "users/{userId}/quotes/{quoteId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    
    // Only process if quote status changed to 'accepted'
    if (before.status !== 'accepted' && after.status === 'accepted') {
      const db = admin.firestore();
      const batch = db.batch();
      
      // Update inventory for each item in the quote
      for (const item of after.items || []) {
        if (item.productId) {
          const productRef = db.doc(`users/${event.params.userId}/products/${item.productId}`);
          const productDoc = await productRef.get();
          
          if (productDoc.exists) {
            const currentStock = productDoc.data().stockQuantity || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            batch.update(productRef, {
              stockQuantity: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }
      
      await batch.commit();
      logger.info('Inventory updated for accepted quote:', event.params.quoteId);
    }
  }
);

// Send quote email
exports.sendQuoteEmail = onRequest(async (req, res) => {
  try {
    const {userId, quoteId, clientEmail, clientName, quoteData} = req.body;
    const db = admin.firestore();
    
    // Get business information
    const businessDoc = await db.doc(`users/${userId}/business/profile`).get();
    const business = businessDoc.exists ? businessDoc.data() : {};
    
    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Quote from ${business.name || 'Your Business'}</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <p>Dear ${clientName},</p>
          
          <p>Thank you for your interest in our services. Please find attached your quote #${quoteData?.quoteNumber || quoteId}.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Quote Summary</h3>
            <p><strong>Quote Number:</strong> ${quoteData?.quoteNumber || quoteId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> R${quoteData?.total?.toFixed(2) || '0.00'}</p>
          </div>
          
          <p>This quote is valid for 30 days. If you have any questions or would like to proceed, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p><strong>${business.name || 'Your Business'}</strong></p>
            <p>${business.email || ''}</p>
            <p>${business.phone || ''}</p>
            <p>${business.address || ''}</p>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: emailConfig.auth.user,
      to: clientEmail,
      subject: `Quote #${quoteData?.quoteNumber || quoteId} from ${business.name || 'Your Business'}`,
      html: emailHtml
    };
    
    await transporter.sendMail(mailOptions);
    
    logger.info('Quote email sent successfully:', {
      clientEmail,
      clientName,
      quoteId,
      userId
    });
    
    res.json({message: 'Quote email sent successfully'});
  } catch (error) {
    logger.error('Error sending quote email:', error);
    res.status(500).json({error: 'Failed to send quote email'});
  }
});

// Send invoice email
exports.sendInvoiceEmail = onRequest(async (req, res) => {
  try {
    const {userId, invoiceId, clientEmail, clientName, invoiceData} = req.body;
    const db = admin.firestore();
    
    // Get business information
    const businessDoc = await db.doc(`users/${userId}/business/profile`).get();
    const business = businessDoc.exists ? businessDoc.data() : {};
    
    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>Invoice from ${business.name || 'Your Business'}</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <p>Dear ${clientName},</p>
          
          <p>Please find attached your invoice #${invoiceData?.invoiceNumber || invoiceId}.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Invoice Summary</h3>
            <p><strong>Invoice Number:</strong> ${invoiceData?.invoiceNumber || invoiceId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Total Amount:</strong> R${invoiceData?.total?.toFixed(2) || '0.00'}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Payment Instructions:</strong></p>
            <p>Please make payment within 30 days of the invoice date. You can pay via bank transfer or contact us for other payment methods.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p><strong>${business.name || 'Your Business'}</strong></p>
            <p>${business.email || ''}</p>
            <p>${business.phone || ''}</p>
            <p>${business.address || ''}</p>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: emailConfig.auth.user,
      to: clientEmail,
      subject: `Invoice #${invoiceData?.invoiceNumber || invoiceId} from ${business.name || 'Your Business'}`,
      html: emailHtml
    };
    
    await transporter.sendMail(mailOptions);
    
    logger.info('Invoice email sent successfully:', {
      clientEmail,
      clientName,
      invoiceId,
      userId
    });
    
    res.json({message: 'Invoice email sent successfully'});
  } catch (error) {
    logger.error('Error sending invoice email:', error);
    res.status(500).json({error: 'Failed to send invoice email'});
  }
});

// Calculate business metrics
exports.calculateBusinessMetrics = onRequest(async (req, res) => {
  try {
    const {userId, period} = req.body; // period: 'daily', 'weekly', 'monthly', 'yearly'
    const db = admin.firestore();
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Get transactions for the period
    const transactionsRef = db.collection(`users/${userId}/transactions`);
    const snapshot = await transactionsRef
      .where('date', '>=', startDate)
      .get();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.type === 'income') {
        totalIncome += data.amount || 0;
      } else if (data.type === 'expense') {
        totalExpenses += data.amount || 0;
      }
    });
    
    const netProfit = totalIncome - totalExpenses;
    
    res.json({
      period,
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount: snapshot.size
    });
  } catch (error) {
    logger.error('Error calculating business metrics:', error);
    res.status(500).json({error: 'Failed to calculate metrics'});
  }
});

// Auto-generate invoice from accepted quote
exports.createInvoiceFromQuote = onDocumentUpdated(
  "users/{userId}/quotes/{quoteId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    
    // Only process if quote status changed to 'accepted'
    if (before.status !== 'accepted' && after.status === 'accepted') {
      const db = admin.firestore();
      
      try {
        // Generate invoice number
        const invoicesRef = db.collection(`users/${event.params.userId}/invoices`);
        const invoiceSnapshot = await invoicesRef.orderBy('createdAt', 'desc').limit(1).get();
        
        let nextNumber = 1;
        if (!invoiceSnapshot.empty) {
          const lastInvoice = invoiceSnapshot.docs[0].data();
          const lastNumber = parseInt(lastInvoice.invoiceNumber?.replace('INV-', '') || '0');
          nextNumber = lastNumber + 1;
        }
        
        const invoiceNumber = `INV-${String(nextNumber).padStart(4, '0')}`;
        
        // Create invoice document
        const invoiceData = {
          invoiceNumber,
          quoteId: event.params.quoteId,
          customer: after.customer,
          items: after.items,
          subtotal: after.subtotal,
          vatRate: after.vatRate,
          vatAmount: after.vatAmount,
          discount: after.discount,
          total: after.total,
          status: 'pending',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await invoicesRef.add(invoiceData);
        
        // Update quote with invoice reference
        await db.doc(`users/${event.params.userId}/quotes/${event.params.quoteId}`)
          .update({
            invoiceId: invoiceNumber,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        
        logger.info('Invoice created from quote:', {
          quoteId: event.params.quoteId,
          invoiceNumber,
          userId: event.params.userId
        });
        
      } catch (error) {
        logger.error('Error creating invoice from quote:', error);
      }
    }
  }
);

// Send payment reminders
exports.sendPaymentReminders = onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    const now = new Date();
    const reminderDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get overdue invoices
      const invoicesRef = db.collection(`users/${userId}/invoices`);
      const overdueInvoices = await invoicesRef
        .where('status', '==', 'pending')
        .where('dueDate', '<=', reminderDate)
        .get();
      
      for (const invoiceDoc of overdueInvoices.docs) {
        const invoice = invoiceDoc.data();
        
        // This would integrate with email service
        logger.info('Payment reminder would be sent:', {
          userId,
          invoiceId: invoiceDoc.id,
          invoiceNumber: invoice.invoiceNumber,
          customerEmail: invoice.customer?.email,
          amount: invoice.total
        });
        
        // Update reminder sent date
        await invoiceDoc.ref.update({
          lastReminderSent: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    res.json({message: 'Payment reminders processed'});
  } catch (error) {
    logger.error('Error sending payment reminders:', error);
    res.status(500).json({error: 'Failed to send reminders'});
  }
});

// Backup business data
exports.backupBusinessData = onRequest(async (req, res) => {
  try {
    const {userId} = req.body;
    const db = admin.firestore();
    
    // Get all business data
    const collections = ['business', 'customers', 'products', 'quotes', 'invoices', 'transactions'];
    const backupData = {};
    
    for (const collection of collections) {
      const snapshot = await db.collection(`users/${userId}/${collection}`).get();
      backupData[collection] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    // Store backup in a separate collection
    await db.collection('backups').add({
      userId,
      data: backupData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      type: 'manual'
    });
    
    res.json({
      message: 'Backup created successfully',
      collections: collections.length,
      totalDocuments: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0)
    });
  } catch (error) {
    logger.error('Error creating backup:', error);
    res.status(500).json({error: 'Failed to create backup'});
  }
});

// Validate business data integrity
exports.validateBusinessData = onRequest(async (req, res) => {
  try {
    const {userId} = req.body;
    const db = admin.firestore();
    const issues = [];
    
    // Check for orphaned quotes without customers
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
    
    // Check for negative inventory
    const productsSnapshot = await db.collection(`users/${userId}/products`).get();
    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data();
      if (product.stockQuantity < 0) {
        issues.push({
          type: 'negative_inventory',
          productId: productDoc.id,
          message: `Product ${product.name} has negative stock: ${product.stockQuantity}`
        });
      }
    }
    
    // Check for duplicate invoice numbers
    const invoicesSnapshot = await db.collection(`users/${userId}/invoices`).get();
    const invoiceNumbers = new Set();
    for (const invoiceDoc of invoicesSnapshot.docs) {
      const invoice = invoiceDoc.data();
      if (invoice.invoiceNumber) {
        if (invoiceNumbers.has(invoice.invoiceNumber)) {
          issues.push({
            type: 'duplicate_invoice_number',
            invoiceId: invoiceDoc.id,
            message: `Duplicate invoice number: ${invoice.invoiceNumber}`
          });
        }
        invoiceNumbers.add(invoice.invoiceNumber);
      }
    }
    
    res.json({
      valid: issues.length === 0,
      issues,
      totalIssues: issues.length
    });
  } catch (error) {
    logger.error('Error validating business data:', error);
    res.status(500).json({error: 'Failed to validate data'});
  }
});

// Generate business report
exports.generateBusinessReport = onRequest(async (req, res) => {
  try {
    const {userId, startDate, endDate} = req.body;
    const db = admin.firestore();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get quotes in date range
    const quotesSnapshot = await db.collection(`users/${userId}/quotes`)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();
    
    // Get invoices in date range
    const invoicesSnapshot = await db.collection(`users/${userId}/invoices`)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();
    
    // Calculate metrics
    let totalQuotes = quotesSnapshot.size;
    let acceptedQuotes = 0;
    let totalQuoteValue = 0;
    let totalInvoiceValue = 0;
    let paidInvoices = 0;
    
    quotesSnapshot.docs.forEach(doc => {
      const quote = doc.data();
      totalQuoteValue += quote.total || 0;
      if (quote.status === 'accepted') {
        acceptedQuotes++;
      }
    });
    
    invoicesSnapshot.docs.forEach(doc => {
      const invoice = doc.data();
      totalInvoiceValue += invoice.total || 0;
      if (invoice.status === 'paid') {
        paidInvoices++;
      }
    });
    
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    const paymentRate = invoicesSnapshot.size > 0 ? (paidInvoices / invoicesSnapshot.size) * 100 : 0;
    
    const report = {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      quotes: {
        total: totalQuotes,
        accepted: acceptedQuotes,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalValue: totalQuoteValue
      },
      invoices: {
        total: invoicesSnapshot.size,
        paid: paidInvoices,
        paymentRate: Math.round(paymentRate * 100) / 100,
        totalValue: totalInvoiceValue
      },
      generatedAt: new Date().toISOString()
    };
    
    res.json(report);
  } catch (error) {
    logger.error('Error generating business report:', error);
    res.status(500).json({error: 'Failed to generate report'});
  }
});
