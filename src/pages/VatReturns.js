import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { useFinancialData } from '../context/FinancialDataContext';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Page = styled.div`padding: 1rem; max-width: 960px; margin: 0 auto;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer;`;
const StatGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;`;
const Stat = styled.div`background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem;`;

function inPeriod(dateValue, start, end) {
  if (!dateValue) return false;
  const d = typeof dateValue?.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end); e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

export default function VatReturns() {
  const { invoices, expenses } = useFinancialData();
  const { vatReturns, saveVatReturn } = useAccountingExtensions();
  const { formatCurrency } = useCurrency();

  const now = new Date();
  const [periodStart, setPeriodStart] = useState(
    new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 2), 1).toISOString().split('T')[0]
  );
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const vatRate = 15;

  const calc = useMemo(() => {
    const sales = invoices.filter(
      (inv) => inv.type !== 'credit_note' && inPeriod(inv.invoiceDate || inv.createdAt, periodStart, periodEnd)
    );
    const credits = invoices.filter(
      (inv) => inv.type === 'credit_note' && inPeriod(inv.invoiceDate || inv.createdAt, periodStart, periodEnd)
    );
    const periodExpenses = expenses.filter((exp) => inPeriod(exp.date || exp.createdAt, periodStart, periodEnd));

    const standardSales = sales.reduce((sum, inv) => {
      const total = Math.abs(parseFloat(inv.total ?? inv.amount ?? 0) || 0);
      if (inv.vatAmount != null) {
        const net = total - Math.abs(parseFloat(inv.vatAmount) || 0);
        return sum + Math.max(0, net);
      }
      // Assume totals are VAT-inclusive at standard rate unless vatRate is 0
      const rate = inv.vatRate != null ? parseFloat(inv.vatRate) : vatRate;
      if (!rate) return sum + total;
      return sum + total / (1 + rate / 100);
    }, 0);

    const outputVat = sales.reduce((sum, inv) => {
      if (inv.vatAmount != null) return sum + Math.abs(parseFloat(inv.vatAmount) || 0);
      const total = Math.abs(parseFloat(inv.total ?? inv.amount ?? 0) || 0);
      const rate = inv.vatRate != null ? parseFloat(inv.vatRate) : vatRate;
      if (!rate) return sum;
      return sum + total - total / (1 + rate / 100);
    }, 0);

    const creditVat = credits.reduce((sum, inv) => {
      const total = Math.abs(parseFloat(inv.total ?? inv.amount ?? 0) || 0);
      return sum + (total - total / (1 + vatRate / 100));
    }, 0);

    const deductibleExpenses = periodExpenses.filter((e) => e.taxDeductible !== false);
    const expenseNet = deductibleExpenses.reduce((sum, e) => {
      const total = parseFloat(e.amount) || 0;
      return sum + total / (1 + vatRate / 100);
    }, 0);
    const inputVat = deductibleExpenses.reduce((sum, e) => {
      const total = parseFloat(e.amount) || 0;
      return sum + (total - total / (1 + vatRate / 100));
    }, 0);

    const netVat = outputVat - creditVat - inputVat;

    return {
      salesCount: sales.length,
      standardSales: +standardSales.toFixed(2),
      outputVat: +outputVat.toFixed(2),
      creditVat: +creditVat.toFixed(2),
      expenseNet: +expenseNet.toFixed(2),
      inputVat: +inputVat.toFixed(2),
      netVat: +netVat.toFixed(2),
      sales,
      credits,
      deductibleExpenses
    };
  }, [invoices, expenses, periodStart, periodEnd]);

  const handleSave = async () => {
    const result = await saveVatReturn({
      periodStart,
      periodEnd,
      vatRate,
      standardSales: calc.standardSales,
      outputVat: calc.outputVat,
      creditVat: calc.creditVat,
      inputVat: calc.inputVat,
      netVat: calc.netVat,
      status: 'draft'
    });
    if (result.success) toast.success('VAT return draft saved');
    else alert(result.error);
  };

  const handleExport = () => {
    const rows = [
      ['VAT201 Style Draft'],
      ['Period', `${periodStart} to ${periodEnd}`],
      [],
      ['Standard rated sales (excl VAT)', calc.standardSales],
      ['Output VAT', calc.outputVat],
      ['Credit note VAT', calc.creditVat],
      ['Deductible expenses (excl VAT)', calc.expenseNet],
      ['Input VAT', calc.inputVat],
      ['VAT payable / (refundable)', calc.netVat]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAT Return');
    XLSX.writeFile(wb, `VAT_Return_${periodStart}_${periodEnd}.xlsx`);
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>VAT Returns</h1>
          <p style={{ margin: 0, color: '#64748b' }}>SA-style draft from sales, credit notes, and expenses (default {vatRate}%)</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Period start</div>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>Period end</div>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <Button type="button" onClick={handleSave}>Save draft</Button>
          <Button type="button" onClick={handleExport} style={{ background: '#0f766e' }}>
            <FiDownload /> Excel
          </Button>
        </div>
      </Card>

      <StatGrid>
        <Stat>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Standard sales (excl.)</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(calc.standardSales)}</div>
        </Stat>
        <Stat>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Output VAT</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(calc.outputVat)}</div>
        </Stat>
        <Stat>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Input VAT</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(calc.inputVat)}</div>
        </Stat>
        <Stat>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>VAT payable/(refund)</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: calc.netVat >= 0 ? '#dc2626' : '#16a34a' }}>
            {formatCurrency(calc.netVat)}
          </div>
        </Stat>
      </StatGrid>

      <Card style={{ marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Draft boxes</h3>
        <p>Sales invoices in period: {calc.salesCount}</p>
        <p>Credit note VAT relief: {formatCurrency(calc.creditVat)}</p>
        <p>Deductible expenses excl. VAT: {formatCurrency(calc.expenseNet)}</p>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          This is an operational draft for bookkeeping — not a SARS eFiling submission.
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Saved returns</h3>
        {vatReturns.map((ret) => (
          <div key={ret.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{ret.periodStart} → {ret.periodEnd}</strong> · {ret.status} · Net {formatCurrency(ret.netVat || 0)}
          </div>
        ))}
        {vatReturns.length === 0 && <p style={{ color: '#64748b' }}>No saved VAT returns yet</p>}
      </Card>
    </Page>
  );
}
