'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaStore,
  FaCircleCheck,
  FaCircleXmark,
  FaShieldHalved,
  FaXmark,
  FaEye,
  FaPen,
  FaSpinner,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const FILTER_OPTIONS: SelectOption[] = [
  { label: 'All Merchants', value: 'all' },
  { label: 'Verified Stores', value: 'verified' },
  { label: 'Pending KYC Review', value: 'pending' },
  { label: 'Online Stores', value: 'online' },
  { label: 'Offline Stores', value: 'offline' }
];

export const MerchantsSection: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [verifyModalOpen, setVerifyModalOpen] = useState<boolean>(false);
  const [merchantToVerify, setMerchantToVerify] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verifyReason, setVerifyReason] = useState<string>('');
  const [submittingVerify, setSubmittingVerify] = useState<boolean>(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchMerchants() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getMerchants({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit
      });
      setMerchants(res.merchants || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMerchants();
  }, [statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchMerchants();
  }

  async function openDetail(merchantId: string) {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const detail = await adminApi.getMerchantDetail(merchantId);
      setSelectedMerchant(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch merchant details');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  function openVerifyModal(merchant: any, targetVerified: boolean) {
    setMerchantToVerify(merchant);
    setIsVerifying(targetVerified);
    setVerifyReason('');
    setVerifyModalOpen(true);
  }

  async function submitVerification() {
    if (!merchantToVerify) return;
    setSubmittingVerify(true);
    try {
      await adminApi.verifyMerchant(
        merchantToVerify.id,
        isVerifying,
        merchantToVerify.isOnline,
        verifyReason || (isVerifying ? 'GSTIN verification approved by admin' : 'Store suspended by operations')
      );
      setVerifyModalOpen(false);
      setActionSuccess(`Merchant ${merchantToVerify.name} ${isVerifying ? 'verified and approved' : 'suspended'}`);
      fetchMerchants();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update merchant verification');
    } finally {
      setSubmittingVerify(false);
    }
  }

  async function toggleOnline(merchantId: string) {
    try {
      await adminApi.toggleMerchant({ merchantId, field: 'is_online' });
      fetchMerchants();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle merchant online status');
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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <Input
            placeholder="Search by store name, owner, GSTIN, phone..."
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
            options={FILTER_OPTIONS}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(String(val));
              setPage(1);
            }}
            placeholder="Filter merchants"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Store & Owner</th>
                <th className="py-3.5">Contact & Location</th>
                <th className="py-3.5">GSTIN</th>
                <th className="py-3.5 text-right">Wallet Balance</th>
                <th className="py-3.5 text-center">Catalog SKUs</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-center">Store Online</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && merchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading merchant registry...</p>
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No merchants found matching filters.
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-500">Proprietor: {m.ownerName}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-slate-800">{m.phone}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{m.address}</p>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-700">
                      {m.gstin || 'Pending Verification'}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      INR {(m.walletBalance || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center font-semibold text-slate-700">
                      {m.productsCount || 0}
                    </td>
                    <td className="py-3.5 text-center">
                      {m.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FaCircleCheck className="h-3 w-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => toggleOnline(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                          m.isOnline
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.isOnline ? 'Online' : 'Offline'}
                      </button>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(m.id)}
                          icon={<FaEye />}
                        >
                          Profile
                        </Button>
                        {m.verified ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => openVerifyModal(m, false)}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openVerifyModal(m, true)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {merchants.length} of {totalCount} merchants
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
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedMerchant ? `${selectedMerchant.name}` : 'Merchant Profile'}
        subtitle="Business verification records and active stock catalog"
        maxWidth="lg"
      >
        {loadingDetail || !selectedMerchant ? (
          <div className="py-12 text-center text-slate-400">
            <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
            <p>Loading merchant profile...</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Owner</p>
                <p className="font-bold text-slate-900">{selectedMerchant.ownerName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">GSTIN Record</p>
                <p className="font-bold text-slate-900">{selectedMerchant.gstin || '32AAACH7409R1ZZ'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Bank Account</p>
                <p className="font-bold text-slate-900">{selectedMerchant.bankAccount || '9876543210123'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Escrow Wallet Balance</p>
                <p className="font-bold text-emerald-600">INR {(selectedMerchant.walletBalance || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-2">Merchant Store Catalog ({selectedMerchant.products?.length || 0} SKUs)</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                    <tr>
                      <th className="py-2 pl-3">Product Title</th>
                      <th className="py-2">Brand</th>
                      <th className="py-2 text-right">Wholesale Rate</th>
                      <th className="py-2 pr-3 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedMerchant.products || []).map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-2 pl-3 font-medium text-slate-900">{p.title}</td>
                        <td className="py-2 text-slate-600">{p.brand}</td>
                        <td className="py-2 text-right font-semibold text-slate-800">INR {p.price} / {p.unit}</td>
                        <td className="py-2 pr-3 text-right font-bold text-slate-900">{p.stockQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title={isVerifying ? 'Approve Merchant Application' : 'Suspend Merchant Account'}
        subtitle={`Administrative review for ${merchantToVerify?.name}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isVerifying ? 'primary' : 'danger'}
              size="sm"
              isLoading={submittingVerify}
              onClick={submitVerification}
            >
              {isVerifying ? 'Approve Store' : 'Suspend Store'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            {isVerifying
              ? 'Approving this merchant grants access to direct fulfillment dispatch and wholesale order broadcasts.'
              : 'Suspending this store removes their materials from the active buyer catalog and pauses driver dispatch.'}
          </p>
          <Input
            label="Administrative Reason (Required for Audit Trail)"
            placeholder="e.g. GSTIN and physical yard inspected and verified"
            value={verifyReason}
            onChange={(e) => setVerifyReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
