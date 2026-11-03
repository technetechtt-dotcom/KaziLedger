import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const DOCUMENT_TEMPLATE_STORAGE_KEY = 'kaziledger_document_template';

const TEMPLATE_STYLES = {
  'invoice-default': { primary: '#10b981', headerHeight: 30, classic: false },
  'invoice-classic': { primary: '#1e293b', headerHeight: 36, classic: true },
  'quote-standard': { primary: '#3b82f6', headerHeight: 30, classic: true },
  'quote-modern': { primary: '#14b8a6', headerHeight: 34, classic: false }
};

/** Read preferred document template id from localStorage / branding override */
export const getPreferredDocumentTemplate = (overrideId) => {
  if (overrideId) return overrideId;
  try {
    return localStorage.getItem(DOCUMENT_TEMPLATE_STORAGE_KEY) || 'invoice-default';
  } catch {
    return 'invoice-default';
  }
};

export const getTemplateStyle = (templateId, docType = 'invoice') => {
  const preferred = getPreferredDocumentTemplate(templateId);
  if (TEMPLATE_STYLES[preferred]) return { id: preferred, ...TEMPLATE_STYLES[preferred] };
  const fallback = docType === 'quote' ? 'quote-standard' : 'invoice-default';
  return { id: fallback, ...TEMPLATE_STYLES[fallback] };
};

const hexToRgb = (hex) => {
  const cleaned = String(hex || '#3b82f6').replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

// Generate PDF from HTML element
export const generatePDFFromElement = async (elementId, filename = 'document.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    console.log('Element found:', element);
    console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);
    console.log('Element has children:', element.children.length);

    // Force a reflow to ensure all styles are applied
    // eslint-disable-next-line no-unused-expressions
    element.offsetHeight;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    console.log('Canvas created:', canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas has zero dimensions - element may not be properly rendered');
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

// Generate quote PDF
export const generateQuotePDF = (quoteData, businessData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const style = getTemplateStyle(
    businessData?.documentTemplateId || quoteData?.templateId,
    'quote'
  );
  const [pr, pg, pb] = hexToRgb(style.primary);
  const secondaryColor = '#6b7280';
  
  // Header (visual variant from preferred template)
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(0, 0, 210, style.headerHeight, 'F');
  if (style.classic) {
    pdf.setDrawColor(pr, pg, pb);
    pdf.setLineWidth(0.6);
    pdf.line(14, style.headerHeight + 2, 196, style.headerHeight + 2);
  }
  
  // Business logo (if available)
  if (businessData.logo) {
    // Add logo placeholder - in real implementation, you'd load the image
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text('LOGO', 20, 20);
  }
  
  // Business name
  pdf.setFontSize(style.classic ? 14 : 16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(businessData.name || 'Business Name', 20, 25);
  
  // Business address
  if (businessData.address) {
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text(businessData.address, 20, 30);
  }
  
  // Quote title
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  pdf.text('QUOTE', 20, 50);
  
  // Quote number and date
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor);
  pdf.text(`Quote #: ${quoteData.quoteNumber || 'Q-001'}`, 20, 60);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
  
  // Customer information
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Bill To:', 20, 80);
  
  if (quoteData.customer) {
    pdf.setFontSize(10);
    pdf.text(quoteData.customer.name || 'Customer Name', 20, 85);
    pdf.text(quoteData.customer.email || 'customer@email.com', 20, 90);
    pdf.text(quoteData.customer.address || 'Customer Address', 20, 95);
  }
  
  // Items table
  const startY = 110;
  let currentY = startY;
  
  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, 170, 10, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Description', 25, currentY + 7);
  pdf.text('Qty', 120, currentY + 7);
  pdf.text('Price', 140, currentY + 7);
  pdf.text('Total', 170, currentY + 7);
  
  currentY += 15;
  
  // Items
  if (quoteData.items && quoteData.items.length > 0) {
    quoteData.items.forEach(item => {
      pdf.text(item.description || 'Item', 25, currentY);
      pdf.text(item.quantity?.toString() || '1', 120, currentY);
      pdf.text(`R${item.price?.toFixed(2) || '0.00'}`, 140, currentY);
      pdf.text(`R${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`, 170, currentY);
      currentY += 8;
    });
  }
  
  // Totals
  const subtotal = quoteData.items?.reduce((sum, item) => 
    sum + ((item.quantity || 1) * (item.price || 0)), 0) || 0;
  const vat = subtotal * 0.15; // 15% VAT
  const total = subtotal + vat;
  
  currentY += 10;
  pdf.text(`Subtotal: R${subtotal.toFixed(2)}`, 140, currentY);
  currentY += 8;
  pdf.text(`VAT (15%): R${vat.toFixed(2)}`, 140, currentY);
  currentY += 8;
  
  pdf.setFontSize(12);
  pdf.setTextColor(pr, pg, pb);
  pdf.text(`Total: R${total.toFixed(2)}`, 140, currentY);
  
  // Terms and conditions
  currentY += 20;
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Terms & Conditions:', 20, currentY);
  currentY += 8;
  pdf.text('• This quote is valid for 30 days', 20, currentY);
  currentY += 5;
  pdf.text('• Payment terms: Net 30', 20, currentY);
  currentY += 5;
  pdf.text('• All prices exclude VAT unless stated otherwise', 20, currentY);
  
  // Footer
  currentY += 20;
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Thank you for your business!', 20, currentY);
  
  // Add company details if available
  if (businessData.taxInfo || businessData.bankDetails) {
    currentY += 15;
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    
    // Tax Information
    if (businessData.taxInfo?.taxId || businessData.taxInfo?.vatNumber || businessData.taxInfo?.businessRegistration) {
      pdf.text('Tax Information:', 20, currentY);
      currentY += 4;
      if (businessData.taxInfo?.taxId) {
        pdf.text(`Tax ID: ${businessData.taxInfo.taxId}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.taxInfo?.vatNumber) {
        pdf.text(`VAT Number: ${businessData.taxInfo.vatNumber}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.taxInfo?.businessRegistration) {
        pdf.text(`Business Registration: ${businessData.taxInfo.businessRegistration}`, 20, currentY);
        currentY += 4;
      }
      currentY += 5;
    }
    
    // Bank Details
    if (businessData.bankDetails?.bankName || businessData.bankDetails?.accountNumber || businessData.bankDetails?.swiftCode) {
      pdf.text('Bank Details:', 20, currentY);
      currentY += 4;
      if (businessData.bankDetails?.bankName) {
        pdf.text(`Bank: ${businessData.bankDetails.bankName}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.bankDetails?.accountHolderName) {
        pdf.text(`Account Holder: ${businessData.bankDetails.accountHolderName}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.bankDetails?.accountNumber) {
        pdf.text(`Account Number: ${businessData.bankDetails.accountNumber}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.bankDetails?.routingNumber) {
        pdf.text(`Routing Number: ${businessData.bankDetails.routingNumber}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.bankDetails?.swiftCode) {
        pdf.text(`SWIFT Code: ${businessData.bankDetails.swiftCode}`, 20, currentY);
        currentY += 4;
      }
      if (businessData.bankDetails?.iban) {
        pdf.text(`IBAN: ${businessData.bankDetails.iban}`, 20, currentY);
        currentY += 4;
      }
    }
  }
  
  return pdf;
};

// Generate invoice PDF
export const generateInvoicePDF = (invoiceData, businessData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Similar structure to quote but with "INVOICE" title
  // and payment information
  const style = getTemplateStyle(
    businessData?.documentTemplateId || invoiceData?.templateId,
    'invoice'
  );
  const [pr, pg, pb] = hexToRgb(style.primary);
  const secondaryColor = '#6b7280';
  
  // Header
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(0, 0, 210, style.headerHeight, 'F');
  if (style.classic) {
    pdf.setDrawColor(pr, pg, pb);
    pdf.setLineWidth(0.6);
    pdf.line(14, style.headerHeight + 2, 196, style.headerHeight + 2);
  }
  
  // Business name
  pdf.setFontSize(style.classic ? 14 : 16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(businessData.name || 'Business Name', 20, 25);
  
  // Invoice title
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', 20, 50);
  
  // Invoice number and date
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor);
  pdf.text(`Invoice #: ${invoiceData.invoiceNumber || 'INV-001'}`, 20, 60);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
  pdf.text(`Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 20, 70);
  
  // Rest of the implementation similar to quote...
  
  return pdf;
};

// Generate statement PDF
export const generateStatementPDF = (statementData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Colors
  const primaryColor = '#3b82f6';
  const secondaryColor = '#6b7280';
  const successColor = '#10b981';
  const dangerColor = '#ef4444';
  
  // Header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, 210, 30, 'F');
  
  // Business name
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(statementData.business?.name || 'Business Name', 20, 20);
  
  // Statement title
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  pdf.text('STATEMENT OF ACCOUNT', 20, 50);
  
  // Statement info
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor);
  pdf.text(`Generated: ${statementData.generatedDate}`, 20, 60);
  pdf.text(`Period: ${statementData.periodLabel || statementData.statementData?.periodLabel || 'All Time'}`, 20, 65);
  
  // Customer information
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Customer:', 20, 80);
  
  if (statementData.customer) {
    pdf.setFontSize(10);
    pdf.text(statementData.customer.name || 'Customer Name', 20, 85);
    pdf.text(statementData.customer.email || 'customer@email.com', 20, 90);
    if (statementData.customer.address) {
      pdf.text(statementData.customer.address, 20, 95);
    }
  }
  
  // Summary section
  const startY = 110;
  let currentY = startY;
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Account Summary:', 20, currentY);
  currentY += 10;
  
  // Summary boxes
  const boxWidth = 40;
  const boxHeight = 20;
  const boxSpacing = 50;
  
  // Total Amount box
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, boxWidth, boxHeight, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Total Amount', 25, currentY + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`R${statementData.statementData.totalAmount.toFixed(2)}`, 25, currentY + 12);
  
  // Outstanding Amount box
  pdf.setFillColor(254, 226, 226); // Light red
  pdf.rect(20 + boxSpacing, currentY, boxWidth, boxHeight, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Outstanding', 25 + boxSpacing, currentY + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${statementData.statementData.outstandingAmount.toFixed(2)}`, 25 + boxSpacing, currentY + 12);
  
  // Paid Amount box
  pdf.setFillColor(220, 252, 231); // Light green
  pdf.rect(20 + (boxSpacing * 2), currentY, boxWidth, boxHeight, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Paid', 25 + (boxSpacing * 2), currentY + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(successColor);
  pdf.text(`R${statementData.statementData.paidAmount.toFixed(2)}`, 25 + (boxSpacing * 2), currentY + 12);
  
  // Overdue Amount box
  pdf.setFillColor(254, 226, 226); // Light red
  pdf.rect(20 + (boxSpacing * 3), currentY, boxWidth, boxHeight, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Overdue', 25 + (boxSpacing * 3), currentY + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${statementData.statementData.overdueAmount.toFixed(2)}`, 25 + (boxSpacing * 3), currentY + 12);
  
  currentY += 30;
  
  // Transactions table
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Transaction History:', 20, currentY);
  currentY += 10;
  
  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, 170, 10, 'F');
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Date', 25, currentY + 7);
  pdf.text('Invoice #', 50, currentY + 7);
  pdf.text('Description', 90, currentY + 7);
  pdf.text('Amount', 140, currentY + 7);
  pdf.text('Status', 160, currentY + 7);
  
  currentY += 15;
  
  // Transactions
  if (statementData.statementData.invoices && statementData.statementData.invoices.length > 0) {
    statementData.statementData.invoices.forEach(invoice => {
      // Check if we need a new page
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(new Date(invoice.createdAt).toLocaleDateString(), 25, currentY);
      pdf.text(invoice.invoiceNumber || 'N/A', 50, currentY);
      pdf.text(invoice.description || 'Invoice', 90, currentY);
      pdf.text(`R${(invoice.total ?? invoice.amount ?? 0).toFixed(2)}`, 140, currentY);
      
      // Status with color
      const status = invoice.status || 'pending';
      if (status === 'paid') {
        pdf.setTextColor(successColor);
      } else if (status === 'overdue') {
        pdf.setTextColor(dangerColor);
      } else {
        pdf.setTextColor(secondaryColor);
      }
      pdf.text(status.toUpperCase(), 160, currentY);
      
      currentY += 8;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor);
    pdf.text('No transactions found', 25, currentY);
    currentY += 10;
  }
  
  // Footer totals
  currentY += 10;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, 170, 15, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Total Outstanding Balance:', 25, currentY + 10);
  pdf.setFontSize(12);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${statementData.statementData.outstandingAmount.toFixed(2)}`, 150, currentY + 10);
  
  // Payment terms
  currentY += 25;
  pdf.setFontSize(9);
  pdf.setTextColor(secondaryColor);
  pdf.text('Payment Terms:', 20, currentY);
  currentY += 5;
  pdf.text('• Outstanding invoices are due immediately', 20, currentY);
  currentY += 4;
  pdf.text('• Overdue invoices may incur additional charges', 20, currentY);
  currentY += 4;
  pdf.text('• Please contact us for payment arrangements', 20, currentY);
  
  // Business contact info
  if (statementData.business) {
    currentY += 15;
    pdf.setFontSize(8);
    pdf.setTextColor(secondaryColor);
    pdf.text('For questions about this statement, please contact:', 20, currentY);
    currentY += 4;
    if (statementData.business.email) {
      pdf.text(`Email: ${statementData.business.email}`, 20, currentY);
      currentY += 4;
    }
    if (statementData.business.phone) {
      pdf.text(`Phone: ${statementData.business.phone}`, 20, currentY);
      currentY += 4;
    }
  }
  
  // Generate filename
  const customerName = statementData.customer?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
  const filename = `Statement_${customerName}_${statementData.generatedDate}.pdf`;
  
  // Save the PDF
  pdf.save(filename);
  
  return { success: true, filename };
};

/**
 * Generate a combined PDF for all outstanding invoices across customers.
 */
export const generateCombinedOutstandingStatementPDF = (statementInfo) => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  const primaryColor = '#3b82f6';
  const secondaryColor = '#6b7280';
  const dangerColor = '#ef4444';
  const statement = statementInfo.statementData || {};
  const invoices = statement.invoices || [];

  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, 210, 30, 'F');

  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(statementInfo.business?.name || 'Business Name', 20, 20);

  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('COMBINED STATEMENT OF ACCOUNT', 20, 48);

  pdf.setFontSize(11);
  pdf.setTextColor(secondaryColor);
  pdf.text('All Outstanding Invoices', 20, 56);
  pdf.text(`Generated: ${statementInfo.generatedDate}`, 20, 62);
  pdf.text(`Period: ${statementInfo.periodLabel || statement.periodLabel || 'All Time'}`, 20, 68);
  pdf.text(
    `Customers: ${statement.customerCount || 0}  |  Outstanding invoices: ${statement.invoiceCount || invoices.length}`,
    20,
    74
  );

  let currentY = 88;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Outstanding Summary:', 20, currentY);
  currentY += 8;

  pdf.setFillColor(254, 226, 226);
  pdf.rect(20, currentY, 80, 18, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Total Outstanding', 25, currentY + 6);
  pdf.setFontSize(12);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${Number(statement.outstandingAmount || 0).toFixed(2)}`, 25, currentY + 14);

  pdf.setFillColor(254, 226, 226);
  pdf.rect(110, currentY, 80, 18, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Overdue', 115, currentY + 6);
  pdf.setFontSize(12);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${Number(statement.overdueAmount || 0).toFixed(2)}`, 115, currentY + 14);

  currentY += 30;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Outstanding Invoices:', 20, currentY);
  currentY += 8;

  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, 170, 10, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Customer', 22, currentY + 7);
  pdf.text('Invoice #', 62, currentY + 7);
  pdf.text('Due Date', 95, currentY + 7);
  pdf.text('Amount', 130, currentY + 7);
  pdf.text('Status', 160, currentY + 7);
  currentY += 14;

  if (invoices.length === 0) {
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor);
    pdf.text('No outstanding invoices found for this period.', 22, currentY);
    currentY += 10;
  } else {
    invoices.forEach((invoice) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }

      const amount = Number(invoice.total ?? invoice.amount ?? 0);
      const customerName = (invoice.customerName || invoice.clientName || 'Customer').substring(0, 22);
      const invoiceNumber = (invoice.invoiceNumber || 'N/A').substring(0, 16);
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-';
      const status = (invoice.status || 'pending').toUpperCase();

      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      pdf.text(customerName, 22, currentY);
      pdf.text(invoiceNumber, 62, currentY);
      pdf.text(dueDate, 95, currentY);
      pdf.text(`R${amount.toFixed(2)}`, 130, currentY);
      pdf.setTextColor(dangerColor);
      pdf.text(status, 160, currentY);
      currentY += 7;
    });
  }

  currentY += 8;
  if (currentY > 270) {
    pdf.addPage();
    currentY = 20;
  }

  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, currentY, 170, 14, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Total Outstanding Balance:', 25, currentY + 9);
  pdf.setFontSize(12);
  pdf.setTextColor(dangerColor);
  pdf.text(`R${Number(statement.outstandingAmount || 0).toFixed(2)}`, 145, currentY + 9);

  const filename = `Combined_Outstanding_Statement_${statementInfo.generatedDate}.pdf`;
  pdf.save(filename);

  return { success: true, filename };
};

// Download PDF
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};
