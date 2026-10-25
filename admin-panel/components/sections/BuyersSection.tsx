'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaUsers,
  FaCircleCheck,
  FaCircleXmark,
  FaXmark,
  FaSpinner,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const BuyersSection: React.FC = () => {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchBuyers() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBuyers({
        search: search.trim() || undefined,
        page,
        limit
      });
      setBuyers(res.buyers || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load contractor accounts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBuyers();
  }, [page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchBuyers();
  }

  async function handleToggleStatus(userId: string, field: string) {
    try {
      await adminApi.toggleUserStatus(userId, field);
      setActionSuccess(`Contractor status updated`);
      fetchBuyers();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
          <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full sm:w-96 flex items-center gap-2">
          <Input
            placeholder="Search contractor name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FaMagnifyingGlass />}
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <span className="text-xs font-medium text-slate-500">
          Total Registered Builders: <strong className="text-slate-900">{totalCount}</strong>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Contractor / Builder</th>
                <th className="py-3.5">Contact Details</th>
                <th className="py-3.5 text-center">Active Sites</th>
                <th className="py-3.5 text-center">Orders Placed</th>
                <th className="py-3.5 text-right">Lifetime Spend</th>
                <th className="py-3.5 text-center">Account Status</th>
                <th className="py-3.5 text-center">Verified</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && buyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading contractors...</p>
                  </td>
                </tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No contractors found.
                  </td>
                </tr>
              ) : (
                buyers.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-bold text-slate-900">{b.name}</p>
                      <p className="text-[11px] text-slate-400">ID: {b.id}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-800">{b.phone}</p>
                      <p className="text-[11px] text-slate-500">{b.email}</p>
                    </td>
                    <td className="py-3.5 text-center font-semibold text-slate-700">
                      {(b.savedAddresses || []).length} Sites
                    </td>
                    <td className="py-3.5 text-center font-semibold text-slate-700">
                      {b.ordersCount || 0}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      INR {(b.totalSpend || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(b.id, 'is_active')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(b.id, 'is_verified')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                          b.isVerified
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {b.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(b.id, 'is_active')}
                      >
                        {b.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {buyers.length} of {totalCount} contractors
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
