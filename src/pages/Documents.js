import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  FiArrowLeft,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiFile,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  DOCUMENT_CATEGORIES,
  useDocumentLibrary
} from '../context/DocumentLibraryContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Page = styled.div`
  padding: 1rem;
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  font-size: 1.25rem;
  padding: 0.35rem;
  border-radius: 6px;
  &:hover { background: #f1f5f9; color: #0f172a; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
`;

const Sub = styled.p`
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${p => (p.$secondary ? 'white' : '#14b8a6')};
  color: ${p => (p.$secondary ? '#334155' : 'white')};
  border: 1px solid ${p => (p.$secondary ? '#e2e8f0' : '#14b8a6')};
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.92; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
`;

const Select = styled.select`
  padding: 0.65rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
`;

const SearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  color: #94a3b8;
`;

const SearchInput = styled(Input)`
  padding-left: 2.25rem;
  width: 100%;
`;

const Stats = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.8rem;
  color: #475569;
  strong { color: #0f172a; margin-right: 0.35rem; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const DateGroup = styled.div`
  margin-top: 0.35rem;
`;

const DateHeading = styled.h3`
  margin: 0.85rem 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.85rem;
  align-items: start;
`;

const IconBox = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #f0fdfa;
  color: #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
`;

const Meta = styled.div`
  min-width: 0;
`;

const DocName = styled.div`
  font-weight: 650;
  color: #0f172a;
  word-break: break-word;
`;

const DocLine = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
`;

const Tag = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const IconBtn = styled.button`
  border: 1px solid #e2e8f0;
  background: white;
  color: ${p => (p.$danger ? '#dc2626' : '#475569')};
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  &:hover { background: #f8fafc; }
`;

const IconLink = styled.a`
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  &:hover { background: #f8fafc; }
`;

const Empty = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: #64748b;
  background: white;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  @media (min-width: 640px) {
    align-items: center;
  }
`;

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 14px 14px 0 0;
  padding: 1.1rem;
  max-height: 90vh;
  overflow: auto;
  @media (min-width: 640px) {
    border-radius: 14px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 72px;
  font-family: inherit;
  resize: vertical;
`;

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (newest first)' },
  { value: 'date_asc', label: 'Date (oldest first)' },
  { value: 'uploaded_desc', label: 'Uploaded (newest)' },
  { value: 'uploaded_asc', label: 'Uploaded (oldest)' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'category', label: 'Category' },
  { value: 'size_desc', label: 'Largest file' }
];

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function toTime(value) {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/** Prefer document date; fall back to upload/created time */
function getDocDateValue(doc) {
  return toTime(doc.documentDate) || toTime(doc.createdAt) || toTime(doc.updatedAt) || 0;
}

function getUploadDateValue(doc) {
  return toTime(doc.createdAt) || toTime(doc.updatedAt) || toTime(doc.documentDate) || 0;
}

function formatDate(value) {
  if (!value) return '—';
  const t = toTime(value);
  if (!t) return String(value);
  return new Date(t).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateHeading(ms) {
  if (!ms) return 'No date';
  const d = new Date(ms);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDoc = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (startDoc === startToday) return 'Today';
  if (startDoc === startToday - dayMs) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function dateKey(ms) {
  if (!ms) return 'unknown';
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const emptyForm = () => ({
  name: '',
  category: 'Other',
  tags: '',
  notes: '',
  documentDate: new Date().toISOString().split('T')[0],
  vendor: '',
  file: null
});

export default function Documents() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const {
    documents,
    loading,
    uploadAndAddDocument,
    updateLibraryDocument,
    deleteLibraryDocument
  } = useDocumentLibrary();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [modal, setModal] = useState(null); // upload | edit
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...documents];

    if (category !== 'all') {
      rows = rows.filter((d) => (d.category || 'Other') === category);
    }
    if (q) {
      rows = rows.filter((d) => {
        const hay = [
          d.name,
          d.category,
          d.vendor,
          d.notes,
          ...(d.tags || [])
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    rows.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return getDocDateValue(a) - getDocDateValue(b);
        case 'uploaded_desc':
          return getUploadDateValue(b) - getUploadDateValue(a);
        case 'uploaded_asc':
          return getUploadDateValue(a) - getUploadDateValue(b);
        case 'name_asc':
          return String(a.name || '').localeCompare(String(b.name || ''));
        case 'name_desc':
          return String(b.name || '').localeCompare(String(a.name || ''));
        case 'category':
          return String(a.category || '').localeCompare(String(b.category || ''))
            || (getDocDateValue(b) - getDocDateValue(a));
        case 'size_desc':
          return (Number(b.size) || 0) - (Number(a.size) || 0);
        case 'date_desc':
        case 'newest':
        case 'oldest':
        default:
          return getDocDateValue(b) - getDocDateValue(a);
      }
    });

    return rows;
  }, [documents, search, category, sortBy]);

  const groupedByDate = useMemo(() => {
    const useDocDate = sortBy === 'date_desc' || sortBy === 'date_asc' || sortBy === 'newest' || sortBy === 'oldest';
    const useUploadDate = sortBy === 'uploaded_desc' || sortBy === 'uploaded_asc';
    if (!useDocDate && !useUploadDate) {
      return [{ key: 'all', label: null, items: filtered }];
    }

    const groups = [];
    const map = new Map();
    filtered.forEach((doc) => {
      const ms = useUploadDate ? getUploadDateValue(doc) : getDocDateValue(doc);
      const key = dateKey(ms);
      if (!map.has(key)) {
        const group = { key, label: formatDateHeading(ms), items: [] };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key).items.push(doc);
    });
    return groups;
  }, [filtered, sortBy]);

  const openUpload = () => {
    setForm(emptyForm());
    setEditingId(null);
    setModal('upload');
  };

  const openEdit = (doc) => {
    setEditingId(doc.id);
    setForm({
      name: doc.name || '',
      category: doc.category || 'Other',
      tags: (doc.tags || []).join(', '),
      notes: doc.notes || '',
      documentDate: doc.documentDate || '',
      vendor: doc.vendor || '',
      file: null
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setForm(emptyForm());
  };

  const parseTags = (value) =>
    String(value || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (modal === 'upload') {
        if (!form.file) {
          toast.error('Choose a file to upload');
          return;
        }
        const result = await uploadAndAddDocument({
          file: form.file,
          name: form.name || form.file.name,
          category: form.category,
          tags: parseTags(form.tags),
          notes: form.notes,
          documentDate: form.documentDate || null,
          vendor: form.vendor
        });
        if (!result.success) throw new Error(result.error || 'Upload failed');
        toast.success('Document uploaded');
      } else if (modal === 'edit' && editingId) {
        const result = await updateLibraryDocument(editingId, {
          name: form.name,
          category: form.category,
          tags: parseTags(form.tags),
          notes: form.notes,
          documentDate: form.documentDate || null,
          vendor: form.vendor
        });
        if (!result.success) throw new Error(result.error || 'Update failed');
        toast.success('Document updated');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (docItem) => {
    if (!window.confirm(`Delete "${docItem.name}"?`)) return;
    const result = await deleteLibraryDocument(docItem.id, docItem.storagePath);
    if (result.success) toast.success('Document deleted');
    else toast.error(result.error || 'Delete failed');
  };

  return (
    <Page>
      <Header>
        <TitleBlock>
          <BackBtn type="button" onClick={() => navigate(-1)} aria-label="Back">
            <FiArrowLeft />
          </BackBtn>
          <div>
            <Title>Documents</Title>
            <Sub>Manage and sort uploaded & scanned files</Sub>
          </div>
        </TitleBlock>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="button" $secondary onClick={() => navigate('/scanner')}>
            <FiUpload /> Scan
          </Button>
          <Button type="button" onClick={openUpload}>
            <FiPlus /> Upload
          </Button>
        </div>
      </Header>

      <Toolbar>
        <Field>
          <Label>Search</Label>
          <SearchWrap>
            <SearchIcon />
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, vendor, tags…"
            />
          </SearchWrap>
        </Field>
        <Field>
          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Sort</Label>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>
      </Toolbar>

      <Stats>
        <Stat><strong>{documents.length}</strong> total</Stat>
        <Stat><strong>{filtered.length}</strong> showing</Stat>
        <Stat>
          <strong>
            {documents.filter((d) => d.source === 'scanner').length}
          </strong>
          scanned
        </Stat>
      </Stats>

      {loading && documents.length === 0 ? (
        <Empty>Loading documents…</Empty>
      ) : filtered.length === 0 ? (
        <Empty>
          <FiFile style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
          <div>No documents match your filters.</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Button type="button" onClick={openUpload}><FiPlus /> Upload one</Button>
          </div>
        </Empty>
      ) : (
        <List>
          {groupedByDate.map((group) => (
            <DateGroup key={group.key}>
              {group.label && <DateHeading>{group.label}</DateHeading>}
              {group.items.map((docItem) => (
                <Card key={docItem.id} style={{ marginBottom: '0.65rem' }}>
                  <IconBox><FiFile /></IconBox>
                  <Meta>
                    <DocName>{docItem.name}</DocName>
                    <DocLine>
                      {docItem.category || 'Other'}
                      {' · '}
                      {docItem.source || 'upload'}
                      {' · '}
                      Doc {formatDate(docItem.documentDate || docItem.createdAt)}
                      {docItem.createdAt ? ` · Uploaded ${formatDate(docItem.createdAt)}` : ''}
                      {docItem.size ? ` · ${formatBytes(docItem.size)}` : ''}
                    </DocLine>
                    {(docItem.vendor || docItem.amount != null) && (
                      <DocLine>
                        {docItem.vendor || '—'}
                        {docItem.amount != null ? ` · ${formatCurrency(docItem.amount)}` : ''}
                      </DocLine>
                    )}
                    {docItem.tags?.length > 0 && (
                      <Tags>
                        {docItem.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </Tags>
                    )}
                  </Meta>
                  <Actions>
                    {docItem.downloadURL && (
                      <>
                        <IconBtn
                          type="button"
                          title="Open"
                          onClick={() => window.open(docItem.downloadURL, '_blank', 'noopener,noreferrer')}
                        >
                          <FiExternalLink />
                        </IconBtn>
                        <IconLink
                          href={docItem.downloadURL}
                          download
                          title="Download"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiDownload />
                        </IconLink>
                      </>
                    )}
                    <IconBtn type="button" title="Edit" onClick={() => openEdit(docItem)}>
                      <FiEdit2 />
                    </IconBtn>
                    <IconBtn type="button" title="Delete" $danger onClick={() => handleDelete(docItem)}>
                      <FiTrash2 />
                    </IconBtn>
                  </Actions>
                </Card>
              ))}
            </DateGroup>
          ))}
        </List>
      )}

      {modal && (
        <ModalBackdrop onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3 style={{ margin: 0 }}>{modal === 'upload' ? 'Upload document' : 'Edit document'}</h3>
              <IconBtn type="button" onClick={closeModal}><FiX /></IconBtn>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                {modal === 'upload' && (
                  <Field>
                    <Label>File *</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(e) => setForm((p) => ({
                        ...p,
                        file: e.target.files?.[0] || null,
                        name: p.name || e.target.files?.[0]?.name || ''
                      }))}
                      required
                    />
                  </Field>
                )}
                <Field>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </Field>
                <Field>
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {DOCUMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <Label>Document date</Label>
                  <Input
                    type="date"
                    value={form.documentDate}
                    onChange={(e) => setForm((p) => ({ ...p, documentDate: e.target.value }))}
                  />
                </Field>
                <Field>
                  <Label>Vendor / party</Label>
                  <Input
                    value={form.vendor}
                    onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
                  />
                </Field>
                <Field>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="vat, fuel, q1"
                  />
                </Field>
                <Field>
                  <Label>Notes</Label>
                  <TextArea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </Field>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Saving…' : modal === 'upload' ? 'Upload' : 'Save changes'}
                </Button>
              </FormGrid>
            </form>
          </Modal>
        </ModalBackdrop>
      )}
    </Page>
  );
}
