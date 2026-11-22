import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { useFinancialData } from '../context/FinancialDataContext';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { buildVat201Draft } from '../utils/vat201';

const Page = styled.div`padding: 1rem; max-width: 960px; margin: 0 auto; padding-bottom: 3rem;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;`;
const StatGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin: 1rem 0;`;
const Stat = styled.div`background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem;`;
const BoxRow = styled.div`display: flex; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem;`;

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

  const calc = useMemo(
    () => buildVat201Draft({ invoices, expenses, periodStart, periodEnd, vatRate }),
    [invoices, expenses, periodStart, periodEnd]
  );

  const handleSave = async () => {
    const result = await saveVatReturn({
      periodStart,
      periodEnd,
      vatRate,
      ...calc,
      sales: undefined,
      credits: undefined,
      deductibleExpenses: undefined,
      status: 'draft',
      form: 'VAT201'
    });
    if (result.success) toast.success('VAT201 draft saved');
    else alert(result.error);
  };

  const handleExport = () => {
    const rows = [
      ['VAT201 Style Draft — KaziLedger'],
      ['Period', `${periodStart} to ${periodEnd}`],
      ['Standard rate', `${vatRate}%`],
      [],
      ['Box', 'Description', 'Amount'],
      ['1', 'Standard rated sales (excl VAT)', calc.box1_standardSales],
      ['1A', 'Zero-rated sales', calc.box1A_zeroRated],
      ['1B', 'Exempt supplies', calc.box1B_exempt],
      ['4', 'Output tax', calc.box4_outputVat],
      ['9', 'Credit notes (excl VAT)', calc.box9_creditNotesNet],
      ['10', 'Credit note VAT', calc.box10_creditVat],
      ['14', 'Capital goods input tax', calc.box14_capitalInputVat],
      ['14A', 'Other input tax', calc.box14A_otherInputVat],
      ['15', 'Total input tax', calc.box15_inputVat],
      ['16', 'VAT payable / (refundable)', calc.box16_vatPayable],
      [],
      ['Checklist'],
      ['1', 'Confirm all tax invoices for the period are captured'],
      ['2', 'Confirm credit notes issued are included'],
      ['3', 'Confirm expense VAT is from tax invoices (not statements)'],
      ['4', 'File on SARS eFiling when ready — this is a draft only']
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAT201');
    XLSX.writeFile(wb, `VAT201_${periodStart}_${periodEnd}.xlsx`);
    toast.success('VAT201 Excel downloaded');
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>VAT201 Returns</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Draft from sales, zero-rated/exempt, credit notes, and input VAT (uses invoice/expense vatAmount when set)
          </p>
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
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Zero-rated / exempt</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {formatCurrency(calc.zeroRatedSales + calc.exemptSales)}
          </div>
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

      <Card>
        <h3 style={{ marginTop: 0 }}>VAT201 boxes (draft)</h3>
        <BoxRow><span>1 · Standard rated sales (excl.)</span><strong>{formatCurrency(calc.box1_standardSales)}</strong></BoxRow>
        <BoxRow><span>1A · Zero-rated sales</span><strong>{formatCurrency(calc.box1A_zeroRated)}</strong></BoxRow>
        <BoxRow><span>1B · Exempt supplies</span><strong>{formatCurrency(calc.box1B_exempt)}</strong></BoxRow>
        <BoxRow><span>4 · Output tax</span><strong>{formatCurrency(calc.box4_outputVat)}</strong></BoxRow>
        <BoxRow><span>9 · Credit notes (excl.)</span><strong>{formatCurrency(calc.box9_creditNotesNet)}</strong></BoxRow>
        <BoxRow><span>10 · Credit note VAT</span><strong>{formatCurrency(calc.box10_creditVat)}</strong></BoxRow>
        <BoxRow><span>14 · Capital goods input tax</span><strong>{formatCurrency(calc.box14_capitalInputVat)}</strong></BoxRow>
        <BoxRow><span>14A · Other input tax</span><strong>{formatCurrency(calc.box14A_otherInputVat)}</strong></BoxRow>
        <BoxRow><span>15 · Total input tax</span><strong>{formatCurrency(calc.box15_inputVat)}</strong></BoxRow>
        <BoxRow><span>16 · VAT payable / (refundable)</span><strong>{formatCurrency(calc.box16_vatPayable)}</strong></BoxRow>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 0 }}>
          Mark invoices with vatCategory &quot;zero_rated&quot; or &quot;exempt&quot;, or vatRate 0, for non-standard supplies.
          Capital expenses: set category containing &quot;Capital&quot; or capitalGoods=true.
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Submission checklist</h3>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: 1.6 }}>
          <li>All tax invoices for the period are captured ({calc.salesCount} sales, {calc.creditsCount} credits)</li>
          <li>Expense VAT comes from supplier tax invoices ({calc.deductibleExpenses.length} deductible expenses)</li>
          <li>Zero-rated / exempt sales reviewed</li>
          <li>This draft is for internal use — submit via SARS eFiling when ready</li>
        </ul>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Saved drafts</h3>
        {vatReturns.length === 0 && <p style={{ color: '#64748b' }}>No drafts yet</p>}
        {vatReturns.slice(0, 8).map((r) => (
          <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
            {r.periodStart} → {r.periodEnd} · Net {formatCurrency(r.netVat || r.box16_vatPayable || 0)} · {r.status}
          </div>
        ))}
      </Card>
    </Page>
  );
}
