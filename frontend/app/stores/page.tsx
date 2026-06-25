'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StarRating, RatingDisplay } from '@/components/ui/StarRating';
import api from '@/lib/api';

interface Store {
  id: string;
  name: string;
  address: string;
  avgRating: number | null;
  userRating: number | null;
  userRatingId: string | null;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [pendingRatings, setPendingRatings] = useState<Record<string, number>>({});

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await api.get(`/stores?${params}`);
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleRatingChange = (storeId: string, value: number) => {
    setPendingRatings({ ...pendingRatings, [storeId]: value });
  };

  const handleSubmitRating = async (store: Store) => {
    const value = pendingRatings[store.id];
    if (!value) return;
    setSubmitting(store.id);
    try {
      if (store.userRating !== null) {
        await api.patch(`/ratings/${store.id}`, { value });
      } else {
        await api.post('/ratings', { store_id: store.id, value });
      }
      // Remove from pending (not set to 0 — 0 renders as text in JSX)
      setPendingRatings(prev => { const next = { ...prev }; delete next[store.id]; return next; });
      fetchStores();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Browse Stores</h1>
        <p className="text-slate-500 text-sm mt-1">Discover and rate stores on the platform</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="store-search"
          type="text"
          placeholder="Search by store name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No stores found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => {
            const pending = pendingRatings[store.id] || store.userRating || null;
            const isSubmitting = submitting === store.id;

            return (
              <div key={store.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900 text-base">{store.name}</h2>
                  <div className="flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 leading-relaxed">{store.address || 'No address'}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Overall Rating</span>
                    <RatingDisplay value={store.avgRating} />
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">
                      {store.userRating !== null ? 'Your Rating' : 'Rate this store'}
                    </span>
                    <div className="flex items-center gap-3">
                      <StarRating
                        value={pending}
                        onChange={(v) => handleRatingChange(store.id, v)}
                        size="md"
                      />
                      {(pendingRatings[store.id] ?? 0) > 0 && pendingRatings[store.id] !== store.userRating && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={isSubmitting}
                          onClick={() => handleSubmitRating(store)}
                          id={`submit-rating-${store.id}`}
                        >
                          {store.userRating !== null ? 'Update' : 'Submit'}
                        </Button>
                      )}
                    </div>
                    {store.userRating !== null && !pendingRatings[store.id] && (
                      <p className="text-xs text-indigo-600 mt-1">You rated this store {store.userRating}/5</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
