import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiDownload } from 'react-icons/fi';
import { useBusinessOps } from '../context/BusinessOpsContext';
import { downloadExcel, stamp } from '../utils/downloadExport';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 900px; margin: 0 auto; padding-bottom: 4rem;`;
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

const AREAS = [
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'customers', label: 'Customers' },
  { value: 'accounting', label: 'Accounting' }
];

export default function Tasks() {
  const { tasks, addTask, completeTask, deleteTask } = useBusinessOps();
  const [form, setForm] = useState({
    title: '',
    area: 'operations',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    notes: ''
  });

  const openTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const r = await addTask(form);
    if (r.success) {
      toast.success('Task added');
      setForm((p) => ({ ...p, title: '', notes: '' }));
    } else alert(r.error);
  };

  const exportTasks = () => {
    downloadExcel(
      `Tasks_${stamp()}.xlsx`,
      tasks.map((t) => ({
        Title: t.title,
        Area: t.area,
        Due: t.dueDate,
        Priority: t.priority,
        Status: t.status,
        Notes: t.notes || ''
      })),
      'Tasks'
    );
    toast.success('Tasks Excel downloaded');
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Tasks & operations</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Keep the business moving — assign work across sales, finance, HR, and compliance</p>
          </div>
        </div>
        <Button type="button" $secondary onClick={exportTasks}><FiDownload /> Download</Button>
      </div>

      <Card>
        <strong>{openTasks.length} open tasks</strong>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>New task</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="e.g. Follow up overdue invoices" />
          </div>
          <div>
            <Label>Area</Label>
            <Select value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
          </div>
          <div><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} /></div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add task</Button></div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Task list</h3>
        <Table>
          <thead><tr><th>Task</th><th>Area</th><th>Due</th><th>Priority</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ opacity: t.status === 'done' ? 0.55 : 1 }}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  {t.notes && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.notes}</div>}
                </td>
                <td>{t.area}</td>
                <td>{t.dueDate || '—'}</td>
                <td>{t.priority}</td>
                <td>{t.status}</td>
                <td style={{ display: 'flex', gap: '0.35rem' }}>
                  {t.status !== 'done' && (
                    <Button type="button" onClick={async () => {
                      const r = await completeTask(t.id);
                      if (r.success) toast.success('Done');
                    }}>
                      <FiCheck /> Done
                    </Button>
                  )}
                  <button type="button" onClick={() => deleteTask(t.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {tasks.length === 0 && <p style={{ color: '#64748b' }}>No tasks yet — add one to run the business more efficiently.</p>}
      </Card>
    </Page>
  );
}
