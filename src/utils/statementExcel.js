import * as XLSX from 'xlsx';

const getInvoiceAmount = (invoice) => parseFloat(invoice?.total ?? invoice?.amount ?? 0) || 0;

const formatDate = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

/**
 * Export a customer statement of accounts as an Excel (.xlsx) workbook.
 */
export const exportStatementToExcel = ({
  customer,
  business,
  statementData,
  periodLabel = 'All Time',
  generatedDate = new Date().toISOString().split('T')[0]
}) => {
  if (!customer || !statementData) {
    throw new Error('Customer and statement data are required');
  }

  const businessName = business?.name || business?.businessName || 'Business';
  const customerName = customer.name || 'Customer';
  const safeCustomerName = customerName.replace(/[\\/:*?"<>|]/g, '_');

  const summaryRows = [
    ['Statement of Account'],
    ['Business', businessName],
    ['Customer', customerName],
    ['Email', customer.email || ''],
    ['Phone', customer.phone || ''],
    ['Period', periodLabel || statementData.periodLabel || 'All Time'],
    ['Generated', generatedDate],
    [],
    ['Account Summary'],
    ['Total Amount', Number(statementData.totalAmount || 0)],
    ['Outstanding', Number(statementData.outstandingAmount || 0)],
    ['Paid', Number(statementData.paidAmount || 0)],
    ['Overdue', Number(statementData.overdueAmount || 0)],
    []
  ];

  const transactionHeader = [
    'Date',
    'Invoice #',
    'Description',
    'Amount',
    'Status',
    'Due Date'
  ];

  const transactionRows = (statementData.invoices || []).map((invoice) => [
    formatDate(invoice.createdAt || invoice.invoiceDate),
    invoice.invoiceNumber || '',
    invoice.description || 'Invoice',
    getInvoiceAmount(invoice),
    invoice.status || 'pending',
    formatDate(invoice.dueDate)
  ]);

  if (transactionRows.length === 0) {
    transactionRows.push(['No invoices in this period', '', '', '', '', '']);
  }

  const sheetData = [
    ...summaryRows,
    ['Transaction History'],
    transactionHeader,
    ...transactionRows,
    [],
    ['Total Outstanding', Number(statementData.outstandingAmount || 0)],
    ['Total Amount', Number(statementData.totalAmount || 0)]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 36 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statement');

  const filename = `Statement_${safeCustomerName}_${generatedDate}.xlsx`;
  XLSX.writeFile(workbook, filename);

  return { success: true, filename };
};

/**
 * Export a combined statement of all outstanding invoices across customers.
 */
export const exportCombinedOutstandingToExcel = ({
  business,
  statementData,
  periodLabel = 'All Time',
  generatedDate = new Date().toISOString().split('T')[0]
}) => {
  if (!statementData) {
    throw new Error('Statement data is required');
  }

  const businessName = business?.name || business?.businessName || 'Business';

  const summaryRows = [
    ['Combined Statement of Account - Outstanding Invoices'],
    ['Business', businessName],
    ['Scope', 'All customers with outstanding invoices'],
    ['Period', periodLabel || statementData.periodLabel || 'All Time'],
    ['Generated', generatedDate],
    ['Customers with Outstanding', Number(statementData.customerCount || 0)],
    ['Outstanding Invoices', Number(statementData.invoiceCount || 0)],
    [],
    ['Account Summary'],
    ['Total Outstanding', Number(statementData.outstandingAmount || 0)],
    ['Overdue', Number(statementData.overdueAmount || 0)],
    []
  ];

  const transactionHeader = [
    'Customer',
    'Email',
    'Date',
    'Invoice #',
    'Description',
    'Amount',
    'Status',
    'Due Date'
  ];

  const transactionRows = (statementData.invoices || []).map((invoice) => [
    invoice.customerName || invoice.clientName || 'Customer',
    invoice.customerEmail || invoice.clientEmail || '',
    formatDate(invoice.createdAt || invoice.invoiceDate),
    invoice.invoiceNumber || '',
    invoice.description || 'Invoice',
    getInvoiceAmount(invoice),
    invoice.status || 'pending',
    formatDate(invoice.dueDate)
  ]);

  if (transactionRows.length === 0) {
    transactionRows.push(['No outstanding invoices in this period', '', '', '', '', '', '', '']);
  }

  const sheetData = [
    ...summaryRows,
    ['Outstanding Invoices'],
    transactionHeader,
    ...transactionRows,
    [],
    ['Total Outstanding', Number(statementData.outstandingAmount || 0)],
    ['Total Overdue', Number(statementData.overdueAmount || 0)]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 12 },
    { wch: 16 },
    { wch: 32 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Outstanding');

  if (statementData.aging) {
    const aging = statementData.aging;
    const agingRows = [
      ['AR Aging Summary'],
      ['Bucket', 'Amount', 'Invoice Count'],
      ['Current', Number(aging.current || 0), Number(aging.counts?.current || 0)],
      ['1-30 days', Number(aging['1-30'] || 0), Number(aging.counts?.['1-30'] || 0)],
      ['31-60 days', Number(aging['31-60'] || 0), Number(aging.counts?.['31-60'] || 0)],
      ['61-90 days', Number(aging['61-90'] || 0), Number(aging.counts?.['61-90'] || 0)],
      ['90+ days', Number(aging['90+'] || 0), Number(aging.counts?.['90+'] || 0)],
      ['Total', Number(aging.total || 0), (statementData.invoices || []).length]
    ];
    const agingSheet = XLSX.utils.aoa_to_sheet(agingRows);
    agingSheet['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, agingSheet, 'AR Aging');
  }

  const filename = `Combined_Outstanding_Statement_${generatedDate}.xlsx`;
  XLSX.writeFile(workbook, filename);

  return { success: true, filename };
};
