import jsPDF from 'jspdf';

/**
 * Generate a simple employee payslip PDF.
 * @returns {jsPDF}
 */
export function generatePayslipPdf({
  businessName = 'KaziLedger',
  businessEmail = '',
  employee,
  periodStart,
  periodEnd,
  line,
  hoursWorked = null,
  generatedAt = new Date()
}) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 16;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(businessName || 'KaziLedger', margin, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(80);
  pdf.text('PAYSLIP', margin, y);
  if (businessEmail) {
    pdf.text(businessEmail, 210 - margin, y, { align: 'right' });
  }
  y += 8;
  pdf.setDrawColor(20, 184, 166);
  pdf.setLineWidth(0.6);
  pdf.line(margin, y, 210 - margin, y);
  y += 10;

  pdf.setTextColor(15);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Employee', margin, y);
  pdf.text('Pay period', 110, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(employee?.name || '—', margin, y);
  pdf.text(`${periodStart || '—'} to ${periodEnd || '—'}`, 110, y);
  y += 6;
  pdf.text(`Role: ${employee?.role || '—'}`, margin, y);
  pdf.text(`Email: ${employee?.email || '—'}`, 110, y);
  y += 10;

  const rows = [
    ['Description', 'Amount'],
    ['Gross salary', money(line?.gross)],
    ['PAYE (SARS brackets)', money(-(line?.tax || 0))],
    ['UIF (1%, capped)', money(-(line?.uif || 0))],
    ['Net pay', money(line?.net)]
  ];

  pdf.setFillColor(240, 253, 250);
  pdf.rect(margin, y, 210 - margin * 2, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text(rows[0][0], margin + 2, y + 5.5);
  pdf.text(rows[0][1], 210 - margin - 2, y + 5.5, { align: 'right' });
  y += 10;

  pdf.setFont('helvetica', 'normal');
  rows.slice(1).forEach((r, idx) => {
    if (idx === rows.length - 2) {
      pdf.setFont('helvetica', 'bold');
    }
    pdf.text(r[0], margin + 2, y);
    pdf.text(r[1], 210 - margin - 2, y, { align: 'right' });
    y += 7;
    pdf.setFont('helvetica', 'normal');
  });

  y += 4;
  if (hoursWorked != null) {
    pdf.setFontSize(10);
    pdf.text(`Time captured this period: ${Number(hoursWorked).toFixed(2)} hours`, margin, y);
    y += 7;
  }

  y += 6;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, 210 - margin, y);
  y += 8;
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(
    `Generated ${generatedAt.toLocaleString()} · This payslip is a system estimate for internal use.`,
    margin,
    y
  );
  y += 10;
  pdf.text('__________________________', margin, y + 10);
  pdf.text('Employee signature', margin, y + 16);
  pdf.text('__________________________', 120, y + 10);
  pdf.text('Employer signature', 120, y + 16);

  return pdf;
}

export function downloadPayslipPdf(pdf, filename) {
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

function money(n) {
  const v = parseFloat(n) || 0;
  return `R ${v.toFixed(2)}`;
}
