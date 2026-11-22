import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiTrash2, FiDownload, FiPackage } from 'react-icons/fi';
import { useBusinessOps } from '../context/BusinessOpsContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { postPurchaseJournal } from '../services/glPosting';
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

export default function PurchaseOrders() {
  const {
    suppliers,
    purchaseOrders,
    addPurchaseOrder,
    receivePurchaseOrder,
    deletePurchaseOrder
  } = useBusinessOps();
  const { products, updateProduct, addStockMovement } = useFinancialData();
  const { user } = useFirebaseBusiness();
  const { formatCurrency } = useCurrency();

  const [form, setForm] = useState({
    supplierId: '',
    productId: '',
    quantity: '1',
    unitCost: '',
    date: new Date().toISOString().split('T')[0],
    paid: false,
    notes: ''
  });

  const productList = (products || []).filter((p) => (p.itemType || 'product') === 'product');

  const handleCreate = async (e) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    const product = products.find((p) => p.id === form.productId);
    if (!supplier || !product) return alert('Select supplier and product');
    const unitCost = parseFloat(form.unitCost || product.cost || product.unitCost || 0);
    if (unitCost <= 0) return alert('Enter a unit cost');

    const result = await addPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      quantity: parseFloat(form.quantity),
      unitCost,
      date: form.date,
      paid: form.paid,
      notes: form.notes
    });
    if (!result.success) return alert(result.error);

    // Immediately receive into stock + GL for SMB simplicity
    const qty = parseFloat(form.quantity) || 0;
    const prevQty = product.quantity || product.currentStock || 0;
    const nextQty = prevQty + qty;
    await updateProduct(product.id, {
      quantity: nextQty,
      currentStock: nextQty,
      cost: unitCost,
      unitCost
    });
    await addStockMovement({
      productId: product.id,
      productName: product.name,
      type: 'in',
      quantity: qty,
      previousQuantity: prevQty,
      newQuantity: nextQty,
      reference: `PO-${result.id.slice(-6)}`,
      notes: `Purchase from ${supplier.name}`
    });
    if (user?.uid) {
      await postPurchaseJournal(user.uid, {
        amount: result.total,
        date: form.date,
        supplierName: supplier.name,
        paid: form.paid,
        sourceId: result.id
      });
    }
    await receivePurchaseOrder(result.id);
    toast.success('Purchase received — stock & GL updated');
    setForm((p) => ({ ...p, quantity: '1', unitCost: '', notes: '' }));
  };

  const exportPos = () => {
    downloadExcel(
      `PurchaseOrders_${stamp()}.xlsx`,
      purchaseOrders.map((po) => ({
        Date: po.date,
        Supplier: po.supplierName,
        Product: po.productName,
        Qty: po.quantity,
        UnitCost: po.unitCost,
        Total: po.total,
        Paid: po.paid ? 'Yes' : 'No',
        Status: po.status
      })),
      'POs'
    );
    toast.success('Purchase orders Excel downloaded');
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Purchase orders</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Buy stock at cost — updates inventory, COGS basis, and GL (Dr 1200)</p>
          </div>
        </div>
        <Button type="button" $secondary onClick={exportPos}><FiDownload /> Download</Button>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}><FiPackage /> New purchase</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.5rem' }}>
          <div>
            <Label>Supplier</Label>
            <Select value={form.supplierId} onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))} required>
              <option value="">Select…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Product</Label>
            <Select
              value={form.productId}
              onChange={(e) => {
                const p = products.find((x) => x.id === e.target.value);
                setForm((prev) => ({
                  ...prev,
                  productId: e.target.value,
                  unitCost: p?.cost != null || p?.unitCost != null ? String(p.cost ?? p.unitCost) : prev.unitCost
                }));
              }}
              required
            >
              <option value="">Select…</option>
              {productList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <div><Label>Qty</Label><Input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} required /></div>
          <div><Label>Unit cost</Label><Input type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))} required /></div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
          <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.paid} onChange={(e) => setForm((p) => ({ ...p, paid: e.target.checked }))} />
              Paid from bank
            </label>
          </div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Receive stock</Button></div>
        </form>
        {suppliers.length === 0 && (
          <p style={{ color: '#b45309', fontSize: '0.85rem' }}>Add a supplier under Suppliers first.</p>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>History</h3>
        <Table>
          <thead>
            <tr><th>Date</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Cost</th><th>Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td>{po.date}</td>
                <td>{po.supplierName}</td>
                <td>{po.productName}</td>
                <td>{po.quantity}</td>
                <td>{formatCurrency(po.unitCost || 0)}</td>
                <td>{formatCurrency(po.total || 0)}</td>
                <td>{po.status}{po.paid ? ' · paid' : ' · on account'}</td>
                <td>
                  <button type="button" onClick={() => deletePurchaseOrder(po.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {purchaseOrders.length === 0 && <p style={{ color: '#64748b' }}>No purchase orders yet</p>}
      </Card>
    </Page>
  );
}
