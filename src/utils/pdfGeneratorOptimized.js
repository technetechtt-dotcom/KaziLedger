import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Optimized PDF generation for large documents
 * Uses chunking and progressive rendering to handle large content
 */

const MAX_CANVAS_HEIGHT = 16384; // Maximum canvas height (browser limit)
const CHUNK_SIZE = 5000; // Process in chunks of 5000px

/**
 * Generate PDF from HTML element with optimization for large documents
 * @param {HTMLElement} element - HTML element to convert
 * @param {string} filename - Filename for the PDF
 * @param {object} options - Generation options
 * @returns {Promise<void>}
 */
export const generatePDFFromHTMLOptimized = async (
  element,
  filename = 'document.pdf',
  options = {}
) => {
  const {
    scale = 2,
    quality = 0.92,
    maxWidth = 210, // A4 width in mm
    maxHeight = 297, // A4 height in mm
    useChunking = true,
  } = options;

  try {
    const elementHeight = element.scrollHeight;
    const elementWidth = element.scrollWidth;

    // For small documents, use standard method
    if (!useChunking || elementHeight < CHUNK_SIZE) {
      return await generatePDFStandard(element, filename, { scale, quality, maxWidth, maxHeight });
    }

    // For large documents, use chunking
    return await generatePDFChunked(element, filename, { scale, quality, maxWidth, maxHeight });
  } catch (error) {
    console.error('Error generating optimized PDF:', error);
    throw error;
  }
};

/**
 * Standard PDF generation for smaller documents
 */
const generatePDFStandard = async (element, filename, options) => {
  const { scale, quality, maxWidth, maxHeight } = options;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', quality);
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = maxWidth;
  const pageHeight = maxHeight;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
};

/**
 * Chunked PDF generation for large documents
 */
const generatePDFChunked = async (element, filename, options) => {
  const { scale, quality, maxWidth, maxHeight } = options;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const elementHeight = element.scrollHeight;
  const elementWidth = element.scrollWidth;
  
  let currentY = 0;
  let pageAdded = false;

  // Process in chunks
  while (currentY < elementHeight) {
    const chunkHeight = Math.min(CHUNK_SIZE, elementHeight - currentY);
    
    // Create a temporary container for the chunk
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${elementWidth}px`;
    tempContainer.style.height = `${chunkHeight}px`;
    tempContainer.style.overflow = 'hidden';
    
    // Clone the element and adjust for chunk
    const clonedElement = element.cloneNode(true);
    clonedElement.style.position = 'relative';
    clonedElement.style.top = `-${currentY}px`;
    
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: elementWidth,
        windowHeight: chunkHeight,
        height: chunkHeight,
        width: elementWidth,
      });

      const imgData = canvas.toDataURL('image/jpeg', quality);
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = maxHeight;
      let heightLeft = imgHeight;
      let position = 0;

      if (!pageAdded) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        pageAdded = true;
      } else {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    } catch (error) {
      console.error(`Error processing chunk at Y=${currentY}:`, error);
    } finally {
      document.body.removeChild(tempContainer);
    }

    currentY += chunkHeight;
  }

  pdf.save(filename);
};

/**
 * Generate PDF programmatically (faster, better for large documents)
 * @param {object} data - Document data
 * @param {string} type - Document type ('quote' or 'invoice')
 * @param {object} business - Business information
 * @returns {jsPDF} PDF document
 */
export const generatePDFProgrammatic = (data, type = 'quote', business) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  
  // Colors
  const primaryColor = '#3b82f6';
  const secondaryColor = '#64748b';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Business Name
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(business.name || 'Your Business', margin, 25);
  
  // Document Type and Number
  doc.setFontSize(16);
  doc.text(type.toUpperCase(), pageWidth - margin - 60, 15);
  doc.setFontSize(12);
  doc.text(data.number || `${type.toUpperCase()}-001`, pageWidth - margin - 60, 25);
  
  // Date
  doc.text(`Date: ${new Date(data.date || new Date()).toLocaleDateString()}`, pageWidth - margin - 60, 35);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 60;
  
  // Customer Information
  doc.setFontSize(14);
  doc.text('Bill To:', margin, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(data.customer?.name || 'Customer Name', margin, yPosition);
  yPosition += 7;
  
  if (data.customer?.email) {
    doc.text(data.customer.email, margin, yPosition);
    yPosition += 7;
  }
  
  if (data.customer?.address) {
    const addressLines = doc.splitTextToSize(data.customer.address, pageWidth - 2 * margin);
    doc.text(addressLines, margin, yPosition);
    yPosition += addressLines.length * 7;
  }
  
  yPosition += 10;
  
  // Items table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.setFontSize(10);
  doc.text('Description', margin + 5, yPosition + 7);
  doc.text('Qty', margin + 100, yPosition + 7);
  doc.text('Price', margin + 120, yPosition + 7);
  doc.text('Total', margin + 150, yPosition + 7);
  yPosition += 15;
  
  // Items
  let subtotal = 0;
  data.items?.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    
    const itemTotal = (item.quantity || 0) * (item.price || 0);
    subtotal += itemTotal;
    
    const descriptionLines = doc.splitTextToSize(item.description || item.name || '', 90);
    doc.text(descriptionLines, margin + 5, yPosition);
    doc.text(String(item.quantity || 0), margin + 100, yPosition);
    doc.text(`$${item.price?.toFixed(2) || '0.00'}`, margin + 120, yPosition);
    doc.text(`$${itemTotal.toFixed(2)}`, margin + 150, yPosition);
    
    yPosition += Math.max(descriptionLines.length * 5, 10);
  });
  
  // Totals
  yPosition += 10;
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.setFontSize(12);
  doc.text('Subtotal:', margin + 120, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, margin + 150, yPosition);
  yPosition += 10;
  
  if (business.vatEnabled) {
    const vatRate = business.defaultVatRate || 15;
    const vatAmount = subtotal * (vatRate / 100);
    doc.text(`VAT (${vatRate}%):`, margin + 120, yPosition);
    doc.text(`$${vatAmount.toFixed(2)}`, margin + 150, yPosition);
    yPosition += 10;
    subtotal += vatAmount;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', margin + 120, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, margin + 150, yPosition);
  
  return doc;
};
