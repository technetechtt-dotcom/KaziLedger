import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 900px; margin: 0 auto;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Row = styled.div`display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end;`;
const Input = styled.input`padding: 0.65rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Select = styled.select`padding: 0.65rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white;`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; color: #374151; display: block; margin-bottom: 0.25rem;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.65rem 1rem; cursor: pointer;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;

export default function ForeignExchange() {
  const { fxRates, baseCurrency, upsertFxRate, convertAmount } = useAccountingExtensions();
  const { formatCurrency, setDefaultCurrency, defaultCurrency, currencyConfig } = useCurrency();
  const [form, setForm] = useState({ code: 'USD', name: 'US Dollar', rateToBase: '18.50' });
  const [converter, setConverter] = useState({ amount: '100', from: 'USD', to: 'ZAR' });

  const rates = fxRates.length ? fxRates : [];

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await upsertFxRate(form.code.toUpperCase(), {
      name: form.name,
      rateToBase: form.rateToBase
    });
    if (result.success) toast.success('FX rate saved');
    else alert(result.error);
  };

  const converted = convertAmount(converter.amount, converter.from, converter.to);

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Foreign Exchange</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Base currency: {baseCurrency}. Rates are units of base per 1 foreign unit.</p>
        </div>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>App display currency</h3>
        <Select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
          {Object.keys(currencyConfig).map((code) => (
            <option key={code} value={code}>{code} — {currencyConfig[code].name}</option>
          ))}
        </Select>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Update rate</h3>
        <form onSubmit={handleSave}>
          <Row>
            <div style={{ flex: 1, minWidth: 120 }}>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
            </div>
            <div style={{ flex: 2, minWidth: 160 }}>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Label>Rate to {baseCurrency}</Label>
              <Input type="number" step="0.0001" value={form.rateToBase} onChange={(e) => setForm((p) => ({ ...p, rateToBase: e.target.value }))} required />
            </div>
            <Button type="submit"><FiRefreshCw /> Save</Button>
          </Row>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Converter</h3>
        <Row>
          <div style={{ flex: 1 }}>
            <Label>Amount</Label>
            <Input type="number" value={converter.amount} onChange={(e) => setConverter((p) => ({ ...p, amount: e.target.value }))} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>From</Label>
            <Select value={converter.from} onChange={(e) => setConverter((p) => ({ ...p, from: e.target.value }))}>
              {rates.map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Label>To</Label>
            <Select value={converter.to} onChange={(e) => setConverter((p) => ({ ...p, to: e.target.value }))}>
              {rates.map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
            </Select>
          </div>
        </Row>
        <p style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
          ≈ {formatCurrency(converted)} ({converter.to})
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Rates</h3>
        <Table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Rate → {baseCurrency}</th></tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id || r.code}>
                <td>{r.code}</td>
                <td>{r.name}</td>
                <td>{Number(r.rateToBase).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Page>
  );
}
