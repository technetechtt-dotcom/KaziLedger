import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF for quotes and invoices
 * @param {object} data - Document data
 * @param {string} type - Document type ('quote' or 'invoice')
 * @param {object} business - Business information
 * @returns {Promise<jsPDF>} PDF document
 */
export const generatePDF = async (data, type = 'quote', business) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#3b82f6';
  const secondaryColor = '#64748b';
  const lightGray = '#f8fafc';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Business Logo (if available)
  if (business.logo) {
    try {
      const logoImg = new Image();
      logoImg.src = business.logo;
      await new Promise((resolve) => {
        logoImg.onload = () => {
          const logoWidth = 30;
          const logoHeight = 30;
          doc.addImage(logoImg, 'PNG', 20, 5, logoWidth, logoHeight);
          resolve();
        };
      });
    } catch (error) {
      console.warn('Could not load logo:', error);
    }
  }
  
  // Business Name
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(business.name || 'Your Business', 20, 25);
  
  // Document Type and Number
  doc.setFontSize(16);
  doc.text(type.toUpperCase(), pageWidth - 60, 15);
  doc.setFontSize(12);
  doc.text(data.number || `${type.toUpperCase()}-001`, pageWidth - 60, 25);
  
  // Date
  doc.text(`Date: ${new Date(data.date || new Date()).toLocaleDateString()}`, pageWidth - 60, 35);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Customer Information
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 60);
  doc.setFontSize(12);
  doc.text(data.customer?.name || 'Customer Name', 20, 70);
  if (data.customer?.email) {
    doc.text(data.customer.email, 20, 80);
  }
  if (data.customer?.phone) {
    doc.text(data.customer.phone, 20, 90);
  }
  if (data.customer?.address) {
    const addressLines = doc.splitTextToSize(data.customer.address, 100);
    doc.text(addressLines, 20, 100);
  }
  
  // Line items table
  const tableTop = 120;
  const tableLeft = 20;
  const colWidths = [80, 30, 30, 30, 30];
  const colHeaders = ['Description', 'Qty', 'Price', 'Total'];
  
  // Table header
  doc.setFillColor(lightGray);
  doc.rect(tableLeft, tableTop, pageWidth - 40, 15, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  let currentX = tableLeft + 5;
  colHeaders.forEach((header, index) => {
    doc.text(header, currentX, tableTop + 10);
    currentX += colWidths[index];
  });
  
  // Table rows
  doc.setTextColor(0, 0, 0);
  let currentY = tableTop + 25;
  
  data.items?.forEach((item, index) => {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }
    
    // Item description
    const description = doc.splitTextToSize(item.description || 'Item', colWidths[0] - 10);
    doc.text(description, tableLeft + 5, currentY);
    
    // Quantity
    doc.text(item.quantity?.toString() || '1', tableLeft + colWidths[0] + 5, currentY);
    
    // Unit price
    doc.text(formatCurrency(item.unitPrice || 0, business.currency), 
             tableLeft + colWidths[0] + colWidths[1] + 5, currentY);
    
    // Total
    const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
    doc.text(formatCurrency(itemTotal, business.currency), 
             tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY);
    
    currentY += Math.max(description.length * 4, 15);
  });
  
  // Totals section
  const totalsY = Math.max(currentY + 20, pageHeight - 80);
  const totalsLeft = pageWidth - 120;
  
  // Subtotal
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsLeft, totalsY);
  doc.text(formatCurrency(data.subtotal || 0, business.currency), totalsLeft + 60, totalsY);
  
  // Discount
  if (data.discountAmount > 0) {
    doc.text('Discount:', totalsLeft, totalsY + 10);
    doc.text(`-${formatCurrency(data.discountAmount || 0, business.currency)}`, totalsLeft + 60, totalsY + 10);
  }
  
  // VAT
  if (data.vatAmount > 0) {
    doc.text(`VAT (${data.vatRate || business.defaultVatRate}%):`, totalsLeft, totalsY + 20);
    doc.text(formatCurrency(data.vatAmount || 0, business.currency), totalsLeft + 60, totalsY + 20);
  }
  
  // Total
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total:', totalsLeft, totalsY + 35);
  doc.text(formatCurrency(data.total || 0, business.currency), totalsLeft + 60, totalsY + 35);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text('Thank you for your business!', 20, pageHeight - 20);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 80, pageHeight - 20);
  
  return doc;
};

/**
 * Format currency for PDF
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'ZAR') => {
  const symbols = {
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Generate PDF from HTML element
 * @param {HTMLElement} element - HTML element to convert
 * @param {string} filename - Filename for the PDF
 * @returns {Promise<void>}
 */
export const generatePDFFromHTML = async (element, filename = 'document.pdf') => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
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
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
};

/**
 * Generate invoice PDF
 * @param {object} invoiceData - Invoice data
 * @param {object} business - Business information
 * @returns {Promise<jsPDF>} PDF document
 */
export const generateInvoicePDF = async (invoiceData, business) => {
  return generatePDF(invoiceData, 'invoice', business);
};

/**
 * Generate quote PDF
 * @param {object} quoteData - Quote data
 * @param {object} business - Business information
 * @returns {Promise<jsPDF>} PDF document
 */
export const generateQuotePDF = async (quoteData, business) => {
  return generatePDF(quoteData, 'quote', business);
};

/**
 * Download PDF
 * @param {jsPDF} pdf - PDF document
 * @param {string} filename - Filename for download
 */
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};

/**
 * Open PDF in new tab
 * @param {jsPDF} pdf - PDF document
 */
export const openPDF = (pdf) => {
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};

export default {
  generatePDF,
  generatePDFFromHTML,
  generateInvoicePDF,
  generateQuotePDF,
  downloadPDF,
  openPDF
};
