'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { RatingDisplay } from '@/components/ui/StarRating';
import api from '@/lib/api';

interface UserRow {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'owner';
  store_id?: string;
  avgRating?: number | null;
  [key: string]: unknown;
}

interface StoreOption {
  id: string;
  name: string;
}

function validate(form: Record<string, string>) {
  const errs: Record<string, string> = {};
  if (form.name.length < 20 || form.name.length > 60) errs.name = 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (form.address.length > 400) errs.address = 'Max 400 characters';
  if (form.password.length < 8 || form.password.length > 16) errs.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain uppercase letter';
  else if (!/[^A-Za-z0-9]/.test(form.password)) errs.password = 'Must contain special character';
  if (!['admin', 'user', 'owner'].includes(form.role)) errs.role = 'Select a valid role';
  return errs;
}

const emptyForm = { name: '', email: '', address: '', password: '', role: 'user', store_id: '' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sortBy, sortOrder });
      if (filters.name) params.set('name', filters.name);
      if (filters.email) params.set('email', filters.email);
      if (filters.address) params.set('address', filters.address);
      if (filters.role) params.set('role', filters.role);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    api.get('/admin/stores').then(({ data }) => setStores(data));
  }, []);

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
      await api.post('/admin/users', { ...form, store_id: form.role === 'owner' ? form.store_id || undefined : undefined });
      setModalOpen(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<UserRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'address', header: 'Address' },
    {
      key: 'role', header: 'Role', sortable: true,
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: 'avgRating', header: 'Store Rating',
      render: (row) => row.role === 'owner'
        ? <RatingDisplay value={row.avgRating ?? null} />
        : <span className="text-slate-400 text-xs">—</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <Button onClick={() => setModalOpen(true)} id="add-user-btn">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input id="filter-name" placeholder="Filter by name..." value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <Input id="filter-email" placeholder="Filter by email..." value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <Input id="filter-address" placeholder="Filter by address..." value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select id="filter-role" value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage="No users found"
      />

      {/* Add User Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); setFormErrors({}); setServerError(''); }} title="Add New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="new-user-name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} hint="20–60 characters" required />
          <Input id="new-user-email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} required />
          <Input id="new-user-address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={formErrors.address} />
          <Input id="new-user-password" label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={formErrors.password} hint="8–16 chars, 1 uppercase, 1 special" required />
          <div>
            <label htmlFor="new-user-role" className="text-sm font-medium text-slate-700">Role</label>
            <select id="new-user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="owner">Store Owner</option>
            </select>
          </div>
          {form.role === 'owner' && (
            <div>
              <label htmlFor="new-user-store" className="text-sm font-medium text-slate-700">Assign Store</label>
              <select id="new-user-store" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">No store selected</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1" id="create-user-btn">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
