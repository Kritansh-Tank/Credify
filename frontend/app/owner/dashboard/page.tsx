'use client';

import { useEffect, useState } from 'react';
import { Star, MapPin, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { RatingDisplay } from '@/components/ui/StarRating';
import { Table, Column } from '@/components/ui/Table';
import api from '@/lib/api';

interface RatingRow {
  id: string;
  value: number;
  created_at: string;
  updated_at: string;
  user: { name: string; email: string };
  [key: string]: unknown;
}

interface DashboardData {
  store: { id: string; name: string; address: string; email: string };
  avgRating: number | null;
  totalRatings: number;
  ratings: RatingRow[];
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<RatingRow>[] = [
    { key: 'user.name', header: 'User', render: (row) => <span className="font-medium text-slate-800">{row.user.name}</span> },
    { key: 'user.email', header: 'Email', render: (row) => <span className="text-slate-500">{row.user.email}</span> },
    {
      key: 'value', header: 'Rating',
      render: (row) => <RatingDisplay value={row.value} />,
    },
    {
      key: 'created_at', header: 'Date',
      render: (row) => <span className="text-slate-500 text-xs">{new Date(row.created_at as string).toLocaleDateString()}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-200" />)}
        </div>
        <div className="bg-white rounded-2xl h-48 animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Failed to load dashboard.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{data.store.name}</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-sm text-slate-500">{data.store.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard
          label="Average Rating"
          value={data.avgRating !== null ? `${data.avgRating.toFixed(1)} / 5` : 'No ratings yet'}
          icon={<Star className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          label="Total Ratings"
          value={data.totalRatings}
          icon={<Users className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Overall rating display */}
      {data.avgRating !== null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Store Rating</p>
            <RatingDisplay value={data.avgRating} count={data.totalRatings} size="lg" />
          </div>
        </div>
      )}

      {/* Ratings table */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Customer Ratings</h2>
        <Table
          columns={columns}
          data={data.ratings}
          emptyMessage="No ratings received yet"
        />
      </div>
    </div>
  );
}
