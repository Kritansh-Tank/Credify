'use client';

import { useEffect, useState } from 'react';
import { Users, Store, Star } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import api from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-6 h-6" />}
            color="indigo"
          />
          <StatCard
            label="Total Stores"
            value={stats?.totalStores ?? 0}
            icon={<Store className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            label="Total Ratings"
            value={stats?.totalRatings ?? 0}
            icon={<Star className="w-6 h-6" />}
            color="amber"
          />
        </div>
      )}

      <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <a href="/admin/users" id="quick-users-link"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
            <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Manage Users</p>
              <p className="text-xs text-slate-500">Add, view and filter users</p>
            </div>
          </a>
          <a href="/admin/stores" id="quick-stores-link"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Manage Stores</p>
              <p className="text-xs text-slate-500">Add, view and filter stores</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
