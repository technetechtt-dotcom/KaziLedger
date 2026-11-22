import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiTrash2, FiDownload, FiCheck } from 'react-icons/fi';
import { useBusinessOps } from '../context/BusinessOpsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { downloadExcel, stamp } from '../utils/downloadExport';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 1000px; margin: 0 auto; padding-bottom: 4rem;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Select = styled.select`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white;`;
const Button = styled.button`
  background: ${p => (p.$secondary ? 'white' : '#14b8a6')};
  color: ${p => (p.$secondary ? '#334155' : 'white')};
  border: 1px solid ${p => (p.$secondary ? '#e2e8f0' : '#14b8a6')};
  border-radius: 6px; padding: 0.55rem 0.9rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.35rem;
`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; display: block; margin-bottom: 0.25rem;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;

export default function Suppliers() {
  const {
    suppliers, bills, addSupplier, deleteSupplier, addBill, markBillPaid, deleteBill
  } = useBusinessOps();
  const { formatCurrency } = useCurrency();
  const { addExpense } = useFinancialData();
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', category: 'General' });
  const [billForm, setBillForm] = useState({
    supplierId: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    invoiceRef: ''
  });

  const unpaid = useMemo(() => bills.filter((b) => b.status !== 'paid'), [bills]);
  const unpaidTotal = unpaid.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    const r = await addSupplier(supplierForm);
    if (r.success) {
      toast.success('Supplier added');
      setSupplierForm({ name: '', email: '', phone: '', category: 'General' });
    } else alert(r.error);
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === billForm.supplierId);
    const r = await addBill({
      ...billForm,
      supplierName: supplier?.name || '',
      amount: parseFloat(billForm.amount)
    });
    if (r.success) {
      toast.success('Bill recorded');
      setBillForm((p) => ({ ...p, description: '', amount: '', invoiceRef: '' }));
    } else alert(r.error);
  };

  const handlePay = async (bill) => {
    const r = await markBillPaid(bill.id);
    if (!r.success) return alert(r.error);
    await addExpense({
      amount: bill.amount,
      date: new Date().toISOString().split('T')[0],
      category: 'Supplier bill',
      vendor: bill.supplierName || 'Supplier',
      notes: bill.description || bill.invoiceRef || '',
      source: 'supplier_bill',
      sourceId: bill.id
    });
    toast.success('Bill marked paid and posted to expenses');
  };

  const exportAll = () => {
    downloadExcel(
      `Suppliers_Bills_${stamp()}.xlsx`,
      bills.map((b) => ({
        Supplier: b.supplierName,
        Description: b.description,
        Reference: b.invoiceRef,
        Amount: b.amount,
        DueDate: b.dueDate,
        Status: b.status
      })),
      'Bills'
    );
    toast.success('Bills Excel downloaded');
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Suppliers & bills</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Accounts payable — track what you owe and pay suppliers</p>
          </div>
        </div>
        <Button type="button" $secondary onClick={exportAll}><FiDownload /> Download</Button>
      </div>

      <Card>
        <strong>Unpaid bills: {formatCurrency(unpaidTotal)}</strong>
        <span style={{ color: '#64748b', marginLeft: '0.75rem' }}>({unpaid.length} open)</span>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Add supplier</h3>
        <form onSubmit={handleAddSupplier} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem' }}>
          <div><Label>Name</Label><Input value={supplierForm.name} onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label>Email</Label><Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm((p) => ({ ...p, email: e.target.value }))} /></div>
          <div><Label>Phone</Label><Input value={supplierForm.phone} onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value }))} /></div>
          <div><Label>Category</Label><Input value={supplierForm.category} onChange={(e) => setSupplierForm((p) => ({ ...p, category: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add</Button></div>
        </form>
        <Table style={{ marginTop: '1rem' }}>
          <thead><tr><th>Name</th><th>Category</th><th>Contact</th><th></th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.email || s.phone || '—'}</td>
                <td>
                  <button type="button" onClick={() => deleteSupplier(s.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {suppliers.length === 0 && <p style={{ color: '#64748b' }}>No suppliers yet</p>}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Record bill</h3>
        <form onSubmit={handleAddBill} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <Label>Supplier</Label>
            <Select value={billForm.supplierId} onChange={(e) => setBillForm((p) => ({ ...p, supplierId: e.target.value }))} required>
              <option value="">Select…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div><Label>Description</Label><Input value={billForm.description} onChange={(e) => setBillForm((p) => ({ ...p, description: e.target.value }))} required /></div>
          <div><Label>Amount</Label><Input type="number" step="0.01" value={billForm.amount} onChange={(e) => setBillForm((p) => ({ ...p, amount: e.target.value }))} required /></div>
          <div><Label>Due date</Label><Input type="date" value={billForm.dueDate} onChange={(e) => setBillForm((p) => ({ ...p, dueDate: e.target.value }))} /></div>
          <div><Label>Ref</Label><Input value={billForm.invoiceRef} onChange={(e) => setBillForm((p) => ({ ...p, invoiceRef: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add bill</Button></div>
        </form>
        <Table>
          <thead><tr><th>Supplier</th><th>Description</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id}>
                <td>{b.supplierName}</td>
                <td>{b.description}</td>
                <td>{b.dueDate}</td>
                <td>{formatCurrency(b.amount || 0)}</td>
                <td>{b.status}</td>
                <td style={{ display: 'flex', gap: '0.35rem' }}>
                  {b.status !== 'paid' && (
                    <Button type="button" onClick={() => handlePay(b)}><FiCheck /> Pay</Button>
                  )}
                  <button type="button" onClick={() => deleteBill(b.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {bills.length === 0 && <p style={{ color: '#64748b' }}>No bills yet</p>}
      </Card>
    </Page>
  );
}
