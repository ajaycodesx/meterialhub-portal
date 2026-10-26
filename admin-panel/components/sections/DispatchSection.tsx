'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaRoute,
  FaTruckFast,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaPen,
  FaLocationDot
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const TRIP_STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Trips', value: 'all' },
  { label: 'Unassigned', value: 'unassigned' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Arrived at Store', value: 'arrived_at_store' },
  { label: 'Loaded', value: 'loaded' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Arrived at Site', value: 'arrived_at_site' },
  { label: 'Unloaded & Completed', value: 'unloaded_completed' }
];

export const DispatchSection: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('in_transit');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchTrips() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTrips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit
      });
      setTrips(res.trips || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load dispatch trips');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTrips();
  }

  function openStatusModal(trip: any) {
    setActiveTrip(trip);
    setTargetStatus(trip.status || 'in_transit');
    setModalOpen(true);
  }

  async function handleStatusSubmit() {
    if (!activeTrip) return;
    setSubmitting(true);
    try {
      await adminApi.updateTripStatus(activeTrip.id, targetStatus);
      setModalOpen(false);
      setActionSuccess(`Trip #${activeTrip.id} status updated to ${targetStatus}`);
      fetchTrips();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update trip status');
    } finally {
      setSubmitting(false);
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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <Input
            placeholder="Search Trip ID, order, vehicle reg..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FaMagnifyingGlass />}
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="w-full md:w-56">
          <Select
            options={TRIP_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(String(val));
              setPage(1);
            }}
            placeholder="Filter by trip state"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Trip & Order</th>
                <th className="py-3.5">Assigned Driver</th>
                <th className="py-3.5">Vehicle Details</th>
                <th className="py-3.5">Pickup & Drop Route</th>
                <th className="py-3.5 text-right">Distance & Fare</th>
                <th className="py-3.5 text-center">Dispatch Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading live dispatch operations...</p>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active trips matching query.
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-medium text-slate-900">#{t.id}</p>
                      <p className="text-[11px] text-slate-500">Order: #{t.orderId}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-900">{t.driverName}</p>
                      <p className="text-[11px] text-slate-500">{t.driverPhone}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-800">{t.vehicleType}</p>
                      <p className="text-[11px] text-slate-500">Reg: {t.vehicleReg}</p>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <p className="truncate max-w-[200px] text-slate-800 font-medium">To: {t.dropAddress}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">From: {t.pickupAddress}</p>
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-900">
                      INR {(t.tripFare || 0).toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-slate-500">({t.distanceKm} KM)</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStatusModal(t)}
                        icon={<FaPen />}
                      >
                        Override Status
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
            Showing {trips.length} of {totalCount} trips
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Override Trip Status"
        subtitle={`Manual dispatch transition for Trip #${activeTrip?.id}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleStatusSubmit}>
              Update Trip
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Target Trip Status"
            options={TRIP_STATUS_OPTIONS.filter((s) => s.value !== 'all')}
            value={targetStatus}
            onChange={(val) => setTargetStatus(String(val))}
          />
        </div>
      </Modal>
    </div>
  );
};
