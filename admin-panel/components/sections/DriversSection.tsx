'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaTruckFast,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const DriversSection: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchDrivers() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDrivers({
        search: search.trim() || undefined,
        page,
        limit
      });
      setDrivers(res.drivers || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load driver fleet');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDrivers();
  }, [page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  }

  async function handleToggleStatus(userId: string, field: string) {
    try {
      await adminApi.toggleUserStatus(userId, field);
      setActionSuccess(`Driver fleet status updated`);
      fetchDrivers();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update driver status');
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-emerald-800">
          <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs font-medium text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full sm:w-96 flex items-center gap-2">
          <Input
            placeholder="Search driver name, phone, license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FaMagnifyingGlass />}
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <span className="text-xs font-medium text-slate-500">
          Registered Fleet Vehicles: <strong className="text-slate-900">{totalCount}</strong>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Driver Name</th>
                <th className="py-3.5">Contact</th>
                <th className="py-3.5">Vehicle Type</th>
                <th className="py-3.5">Commercial License</th>
                <th className="py-3.5 text-center">Completed Runs</th>
                <th className="py-3.5 text-right">Driver Earnings</th>
                <th className="py-3.5 text-center">Duty Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading driver fleet roster...</p>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <p className="text-[11px] text-slate-400">ID: {d.id}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-800">{d.phone}</p>
                      <p className="text-[11px] text-slate-500">{d.email}</p>
                    </td>
                    <td className="py-3.5 font-medium text-slate-800">
                      {d.vehicleType || 'Commercial Mini Truck (3T)'}
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      {d.driverLicense || 'KL-07-2019-004521'}
                    </td>
                    <td className="py-3.5 text-center font-medium text-slate-900">
                      {d.completedTripsCount || 0}
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-900">
                      INR {(d.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`text-xs font-medium ${
                          d.isBusy
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {d.isBusy ? 'On Trip' : 'Available'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant={d.isActive ? 'outline' : 'primary'}
                        onClick={() => handleToggleStatus(d.id, 'is_active')}
                      >
                        {d.isActive ? 'Suspend' : 'Activate'}
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
            Showing {drivers.length} of {totalCount} fleet drivers
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
            <span className="font-medium text-slate-700">
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
