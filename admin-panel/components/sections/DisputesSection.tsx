'use client';

import React, { useState, useEffect } from 'react';
import {
  FaTriangleExclamation,
  FaPen,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const DISPUTE_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Under Investigation', value: 'under_investigation' },
  { label: 'Resolved (Merchant Replacement Credit)', value: 'resolved_merchant_credit' },
  { label: 'Resolved (Cash Refund Processed)', value: 'resolved_refund' },
  { label: 'Claim Dismissed', value: 'dismissed' }
];

export const DisputesSection: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeDispute, setActiveDispute] = useState<any | null>(null);
  const [status, setStatus] = useState<string>('under_investigation');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchDisputes() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDisputes();
      setDisputes(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDisputes();
  }, []);

  function openResolveModal(disp: any) {
    setActiveDispute(disp);
    setStatus(disp.status || 'under_investigation');
    setResolutionNotes(disp.resolutionNotes || '');
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!activeDispute) return;
    setSubmitting(true);
    try {
      await adminApi.updateDispute(activeDispute.id, status, resolutionNotes);
      setModalOpen(false);
      setActionSuccess(`Dispute #${activeDispute.id} resolution saved`);
      fetchDisputes();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update dispute');
    } finally {
      setSubmitting(false);
    }
  }

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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-900">Contractor Claims & Material Disputes</h2>
          <p className="text-xs text-slate-500">Damage reports, site unloading shortages, and merchant settlement adjustments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Dispute & Order ID</th>
                <th className="py-3.5">Contractor</th>
                <th className="py-3.5">Merchant Store</th>
                <th className="py-3.5">Reported Issue</th>
                <th className="py-3.5 text-right">Claim Amount</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && disputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading claims...</p>
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active disputes reported.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-medium text-slate-900">#{d.id}</p>
                      <p className="text-[11px] text-slate-400">Order: #{d.orderId}</p>
                    </td>
                    <td className="py-3.5 font-medium text-slate-800">
                      {d.buyerName}
                    </td>
                    <td className="py-3.5 text-slate-700">
                      {d.merchantName}
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-900">{d.issueType}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{d.resolutionNotes}</p>
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-900">
                      INR {(d.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-700">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openResolveModal(d)}
                        icon={<FaPen />}
                      >
                        Resolve
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Resolve Contractor Dispute"
        subtitle={`Claim #${activeDispute?.id} for Order #${activeDispute?.orderId}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Save Resolution
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-medium text-slate-800">{activeDispute?.issueType}</p>
            <p className="text-slate-600">Claim Amount: INR {activeDispute?.amount?.toLocaleString('en-IN')}</p>
          </div>

          <Select
            label="Resolution Outcome"
            options={DISPUTE_STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(String(val))}
          />

          <Input
            label="Audited Resolution Notes"
            placeholder="Document driver photo evidence, yard credit agreement, or refund justification..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
