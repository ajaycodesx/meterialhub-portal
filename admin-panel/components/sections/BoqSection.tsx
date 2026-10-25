'use client';

import React, { useState, useEffect } from 'react';
import {
  FaFileContract,
  FaPen,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaLocationDot,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const BOQ_STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Quotes', value: 'all' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

const UPDATE_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Under Review', value: 'under_review' },
  { label: 'Quoted (Estimate Ready)', value: 'quoted' },
  { label: 'Approved by Contractor', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

export const BoqSection: React.FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeQuote, setActiveQuote] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('quoted');
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchQuotes() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBoqQuotes({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit
      });
      setQuotes(res.quotes || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load BOQ quotes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter, page]);

  function openEditModal(quote: any) {
    setActiveQuote(quote);
    setTargetStatus(quote.status || 'quoted');
    setEstimatedTotal(quote.estimatedTotal || 0);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!activeQuote) return;
    setSubmitting(true);
    try {
      await adminApi.updateBoqQuote(activeQuote.id, targetStatus, estimatedTotal);
      setModalOpen(false);
      setActionSuccess(`BOQ Quote #${activeQuote.id} updated`);
      fetchQuotes();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update BOQ quote');
    } finally {
      setSubmitting(false);
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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Contractor BOQ Bulk Quotes</h2>
          <p className="text-xs text-slate-500">Review multi-ton material project lists submitted by builders</p>
        </div>

        <div className="w-56">
          <Select
            options={BOQ_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(String(val));
              setPage(1);
            }}
            placeholder="Filter by status"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Project & Date</th>
                <th className="py-3.5">Contractor</th>
                <th className="py-3.5">Site Location</th>
                <th className="py-3.5">Material Summary</th>
                <th className="py-3.5 text-right">Estimated Quote</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading BOQ quotes...</p>
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No BOQ quotes recorded.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-bold text-slate-900">{q.projectName}</p>
                      <p className="text-[11px] text-slate-400">ID: #{q.id}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{q.buyer?.name}</p>
                      <p className="text-[11px] text-slate-500">{q.buyer?.phone}</p>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <p className="truncate max-w-[180px] font-medium">{q.siteAddress}</p>
                      <p className="text-[11px] text-slate-400">Pincode: {q.deliveryPincode}</p>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <p className="truncate max-w-[220px]">{q.rawMaterialsText || 'Project specification document uploaded'}</p>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      INR {(q.estimatedTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(q)}
                        icon={<FaPen />}
                      >
                        Quote / Review
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
            Showing {quotes.length} of {totalCount} quotes
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Review & Quote BOQ Estimate"
        subtitle={`Project: ${activeQuote?.projectName}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Save Estimate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-800">Contractor Requirements</p>
            <p className="text-slate-600">{activeQuote?.rawMaterialsText || 'Multi-grade cement and structural steel rods requirements.'}</p>
          </div>

          <Input
            label="Estimated Bulk Rate Total (INR)"
            type="number"
            value={estimatedTotal}
            onChange={(e) => setEstimatedTotal(Number(e.target.value))}
          />

          <Select
            label="Quote Status"
            options={UPDATE_STATUS_OPTIONS}
            value={targetStatus}
            onChange={(val) => setTargetStatus(String(val))}
          />
        </div>
      </Modal>
    </div>
  );
};
