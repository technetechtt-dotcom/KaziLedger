import * as XLSX from 'xlsx';

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename, rows, headers) {
  const cols = headers || (rows[0] ? Object.keys(rows[0]) : []);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    cols.map(escape).join(','),
    ...rows.map((row) => cols.map((c) => escape(row[c])).join(','))
  ];
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function downloadExcel(filename, rows, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(rows || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}
