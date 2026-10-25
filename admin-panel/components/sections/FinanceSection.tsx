'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaIndianRupeeSign,
  FaRotateLeft,
  FaCircleCheck,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Payments', value: 'all' },
  { label: 'Captured', value: 'captured' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Pending', value: 'pending' }
];

export const FinanceSection: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [refundModalOpen, setRefundModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');
  const [submittingRefund, setSubmittingRefund] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchPayments() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit
      });
      setPayments(res.payments || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial transactions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  }

  function openRefundModal(payment: any) {
    setSelectedPayment(payment);
    setRefundAmount(payment.grandTotal || 0);
    setRefundReason('');
    setRefundModalOpen(true);
  }

  async function handleRefundSubmit() {
    if (!selectedPayment) return;
    setSubmittingRefund(true);
    try {
      await adminApi.processRefund(
        selectedPayment.orderId,
        refundAmount || null,
        refundReason || 'Contractor material return or cancellation'
      );
      setRefundModalOpen(false);
      setActionSuccess(`Refund of INR ${refundAmount} initiated for order #${selectedPayment.orderId}`);
      fetchPayments();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to process refund');
    } finally {
      setSubmittingRefund(false);
    }
  }

  const totalCaptured = payments
    .filter((p) => p.paymentStatus === 'Captured')
    .reduce((acc, p) => acc + (p.grandTotal || 0), 0);

  const totalCommissions = payments
    .filter((p) => p.paymentStatus === 'Captured')
    .reduce((acc, p) => acc + (p.platformFee || 0), 0);

  const totalSettlements = payments
    .filter((p) => p.paymentStatus === 'Captured')
    .reduce((acc, p) => acc + (p.netSettlement || 0), 0);

  const totalRefunded = payments
    .filter((p) => p.paymentStatus === 'Refunded')
    .reduce((acc, p) => acc + (p.grandTotal || 0), 0);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Gross Captured Volume</p>
          <p className="text-xl font-bold text-slate-900">INR {totalCaptured.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Razorpay captured & online UPI</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Platform Take-Rate (5%)</p>
          <p className="text-xl font-bold text-emerald-600">INR {totalCommissions.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Direct marketplace margin</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Payable Merchant Balance</p>
          <p className="text-xl font-bold text-blue-600">INR {totalSettlements.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Net store escrow payout</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Processed Refunds</p>
          <p className="text-xl font-bold text-rose-600">INR {totalRefunded.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Reversed contractor payments</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <Input
            placeholder="Search Order ID, payment reference..."
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
            options={PAYMENT_STATUS_OPTIONS}
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
                <th className="py-3.5 pl-4">Order ID & Invoice</th>
                <th className="py-3.5">Payment Reference</th>
                <th className="py-3.5">Method</th>
                <th className="py-3.5">Counterparties</th>
                <th className="py-3.5 text-right">Gross Total</th>
                <th className="py-3.5 text-right">Platform Fee</th>
                <th className="py-3.5 text-right">Net Settlement</th>
                <th className="py-3.5 text-center">Payment Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading financial ledger...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No payment records matching criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.orderId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-bold text-slate-900">#{p.orderId}</p>
                      <p className="text-[11px] text-slate-400">{p.invoiceNumber || 'MH-INV-AUTO'}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-mono text-slate-700 font-medium text-[11px]">{p.paymentId}</p>
                      <p className="text-[10px] text-slate-400">{p.paymentOrderId}</p>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {p.paymentMode}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <p className="font-medium text-slate-900">{p.buyerName}</p>
                      <p className="text-[11px] text-slate-500">{p.merchantName}</p>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      INR {(p.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-emerald-600">
                      INR {(p.platformFee || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-blue-600">
                      INR {(p.netSettlement || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          p.paymentStatus === 'Captured'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.paymentStatus === 'Refunded'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      {p.paymentStatus !== 'Refunded' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => openRefundModal(p)}
                          icon={<FaRotateLeft />}
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {payments.length} of {totalCount} records
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
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Process Financial Refund"
        subtitle={`Order #${selectedPayment?.orderId} settlement reversal`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={submittingRefund}
              onClick={handleRefundSubmit}
            >
              Confirm Refund
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Refund Amount (INR)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
          />
          <Input
            label="Mandatory Refund Reason (Audited)"
            placeholder="e.g. Unloading defect / contractor cancellation approval"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
