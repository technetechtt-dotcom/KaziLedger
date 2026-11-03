import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 1000px; margin: 0 auto;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Select = styled.select`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;

export default function GeneralLedger() {
  const { accounts, journals, addGlAccount, postJournal } = useAccountingExtensions();
  const { formatCurrency } = useCurrency();
  const [accountForm, setAccountForm] = useState({ code: '', name: '', type: 'expense' });
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState([
    { accountCode: '5100', debit: '', credit: '', memo: '' },
    { accountCode: '1000', debit: '', credit: '', memo: '' }
  ]);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => String(a.code).localeCompare(String(b.code))),
    [accounts]
  );

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const result = await addGlAccount(accountForm);
    if (result.success) {
      toast.success('Account added');
      setAccountForm({ code: '', name: '', type: 'expense' });
    } else alert(result.error);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    const result = await postJournal({
      memo,
      date,
      lines: lines.map((l) => ({
        ...l,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0
      }))
    });
    if (result.success) {
      toast.success('Journal posted');
      setMemo('');
      setLines([
        { accountCode: '5100', debit: '', credit: '', memo: '' },
        { accountCode: '1000', debit: '', credit: '', memo: '' }
      ]);
    } else alert(result.error);
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>General Ledger</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Chart of accounts and double-entry journals</p>
        </div>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Chart of accounts</h3>
        <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Input style={{ maxWidth: 100 }} placeholder="Code" value={accountForm.code} onChange={(e) => setAccountForm((p) => ({ ...p, code: e.target.value }))} required />
          <Input style={{ flex: 1 }} placeholder="Name" value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} required />
          <Select style={{ maxWidth: 140 }} value={accountForm.type} onChange={(e) => setAccountForm((p) => ({ ...p, type: e.target.value }))}>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Button type="submit"><FiPlus /> Add</Button>
        </form>
        <Table>
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Balance</th></tr></thead>
          <tbody>
            {sortedAccounts.map((a) => (
              <tr key={a.id || a.code}>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td>{a.type}</td>
                <td>{formatCurrency(a.balance || 0)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Post journal entry</h3>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Input style={{ flex: 2 }} placeholder="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
            <Input style={{ maxWidth: 160 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {lines.map((line, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Select value={line.accountCode} onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...next[idx], accountCode: e.target.value };
                setLines(next);
              }}>
                {sortedAccounts.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
              </Select>
              <Input type="number" step="0.01" placeholder="Debit" value={line.debit} onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...next[idx], debit: e.target.value, credit: '' };
                setLines(next);
              }} />
              <Input type="number" step="0.01" placeholder="Credit" value={line.credit} onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...next[idx], credit: e.target.value, debit: '' };
                setLines(next);
              }} />
              <Input placeholder="Line memo" value={line.memo} onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...next[idx], memo: e.target.value };
                setLines(next);
              }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" style={{ background: '#64748b' }} onClick={() => setLines((p) => [...p, { accountCode: '5100', debit: '', credit: '', memo: '' }])}>
              Add line
            </Button>
            <Button type="submit">Post journal</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Recent journals</h3>
        {journals.slice(0, 10).map((j) => (
          <div key={j.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{j.date}</strong> — {j.memo || 'Journal'} · Dr {formatCurrency(j.debitTotal || 0)} / Cr {formatCurrency(j.creditTotal || 0)}
          </div>
        ))}
        {journals.length === 0 && <p style={{ color: '#64748b' }}>No journals posted yet</p>}
      </Card>
    </Page>
  );
}
