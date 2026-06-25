'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RatingDisplay } from '@/components/ui/StarRating';
import api from '@/lib/api';

interface StoreRow {
  id: string;
  name: string;
  email: string;
  address: string;
  avgRating: number | null;
  [key: string]: unknown;
}

function validate(form: Record<string, string>) {
  const errs: Record<string, string> = {};
  if (!form.name || form.name.length > 60) errs.name = 'Store name is required (max 60 chars)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (form.address.length > 400) errs.address = 'Max 400 characters';
  return errs;
}

const emptyForm = { name: '', email: '', address: '' };

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sortBy, sortOrder });
      if (filters.name) params.set('name', filters.name);
      if (filters.email) params.set('email', filters.email);
      if (filters.address) params.set('address', filters.address);
      const { data } = await api.get(`/admin/stores?${params}`);
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setServerError('');
    try {
      await api.post('/admin/stores', form);
      setModalOpen(false);
      setForm(emptyForm);
      fetchStores();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<StoreRow>[] = [
    { key: 'name', header: 'Store Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'address', header: 'Address' },
    {
      key: 'avgRating', header: 'Rating',
      render: (row) => <RatingDisplay value={row.avgRating} />,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
          <p className="text-slate-500 text-sm mt-1">{stores.length} total stores</p>
        </div>
        <Button onClick={() => setModalOpen(true)} id="add-store-btn">
          <Plus className="w-4 h-4" /> Add Store
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input id="filter-store-name" placeholder="Filter by name..." value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <Input id="filter-store-email" placeholder="Filter by email..." value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <Input id="filter-store-address" placeholder="Filter by address..." value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>

      <Table
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage="No stores found"
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); setFormErrors({}); setServerError(''); }} title="Add New Store">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="new-store-name" label="Store name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} required />
          <Input id="new-store-email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} required />
          <Textarea id="new-store-address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={formErrors.address} />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1" id="create-store-btn">Create Store</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
