'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  FaFileLines,
  FaArrowUpRightFromSquare,
  FaCheck,
  FaXmark,
  FaStore,
  FaTruckFast,
  FaClock,
  FaShieldHalved
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { NoData } from '../common/NoData';

type Role = 'vendor' | 'driver';
type Status = 'pending' | 'rejected';

interface Applicant {
  userId: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string | null;
  reason: string | null;
  storeName?: string | null;
  address?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  panNumber?: string | null;
  tradeLicense?: string | null;
  minOrderValue?: number | null;
  mainCategory?: string | null;
  proofDocuments?: Record<string, any> | null;
  vehicleType?: string | null;
  vehicleRegNumber?: string | null;
  payloadCapacityTons?: number | null;
  licenseNumber?: string | null;
}

const MIN_REASON_LENGTH = 5;

const DOCUMENT_LABELS: Record<string, string> = {
  gstCertificate: 'GST Registration Certificate',
  storePhoto: 'Store / Yard Front Photo',
  tradeLicense: 'Municipal Trade License',
  panCard: 'PAN Card Copy',
  licenseDoc: 'Driving License Copy',
  vehicleRc: 'Vehicle RC Document',
  insuranceDoc: 'Commercial Goods Insurance'
};

export const VerificationsSection: React.FC = () => {
  const [role, setRole] = useState<Role>('vendor');
  const [status, setStatus] = useState<Status>('pending');
  const [items, setItems] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminApi.getVerificationQueue(role, status);
      setItems(res?.items ?? []);
    } catch (err: any) {
      setError(err.message || 'Could not load the verification queue.');
    } finally {
      setLoading(false);
    }
  }, [role, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(applicant: Applicant, approve: boolean, rejectReason?: string) {
    setBusyId(applicant.userId);
    setError(null);
    setSuccess(null);
    try {
      await adminApi.decideVerification(applicant.userId, approve, rejectReason);
      setSuccess(
        approve
          ? `${applicant.name} approved. An official activation email has been dispatched to ${applicant.email}.`
          : `${applicant.name} rejected. A notification email has been dispatched to ${applicant.email}.`
      );
      setRejectingId(null);
      setReason('');
      await load();
    } catch (err: any) {
      setError(err.message || 'The decision could not be saved.');
    } finally {
      setBusyId(null);
    }
  }

  const tabClass = (active: boolean) =>
    `px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
      active ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className={tabClass(role === 'vendor')} onClick={() => setRole('vendor')}>
            <span className="flex items-center gap-1.5">
              <FaStore className="h-3.5 w-3.5" />
              <span>Vendors</span>
            </span>
          </button>
          <button type="button" className={tabClass(role === 'driver')} onClick={() => setRole('driver')}>
            <span className="flex items-center gap-1.5">
              <FaTruckFast className="h-3.5 w-3.5" />
              <span>Drivers</span>
            </span>
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" className={tabClass(status === 'pending')} onClick={() => setStatus('pending')}>
            <span className="flex items-center gap-1.5">
              <FaClock className="h-3.5 w-3.5 text-amber-500" />
              <span>Awaiting Review</span>
            </span>
          </button>
          <button type="button" className={tabClass(status === 'rejected')} onClick={() => setStatus('rejected')}>
            <span className="flex items-center gap-1.5">
              <FaXmark className="h-3.5 w-3.5 text-rose-500" />
              <span>Rejected</span>
            </span>
          </button>
        </div>
      </div>

      {error && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>}
      {success && <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">{success}</div>}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading applications...</div>
      ) : items.length === 0 ? (
        <NoData
          title={status === 'pending' ? 'Nothing waiting for review' : 'No rejected applications'}
          description="New vendor and driver registrations appear here as soon as they submit their onboarding proofs."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((applicant) => {
            const proofs = applicant.proofDocuments || {};
            const proofEntries = Object.entries(proofs).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0);

            return (
              <div key={applicant.userId} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{applicant.name}</p>
                    <p className="text-xs font-medium text-slate-500">{applicant.phone} &middot; {applicant.email}</p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString('en-IN') : 'Recent'}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {role === 'vendor' ? (
                    <>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Store Name</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.storeName || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Specialization</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.mainCategory || 'Building Materials'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">GSTIN</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{applicant.gstin || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">PAN Number</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{applicant.panNumber || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Trade License</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.tradeLicense || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Min Order Value</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">INR {(applicant.minOrderValue ?? 1000).toLocaleString('en-IN')}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Yard Address</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.address || 'Not provided'}, {applicant.pincode}</dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Vehicle Type</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.vehicleType || 'Commercial Vehicle'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Plate Registration</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{applicant.vehicleRegNumber || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Payload Capacity</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5">{applicant.payloadCapacityTons != null ? `${applicant.payloadCapacityTons} MT` : 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400 font-medium text-[11px] uppercase">Driver License</dt>
                        <dd className="text-slate-900 font-semibold mt-0.5 font-mono">{applicant.licenseNumber || 'Not provided'}</dd>
                      </div>
                    </>
                  )}
                </dl>

                {proofEntries.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Submitted Document Proofs</p>
                    <div className="flex flex-wrap gap-2">
                      {proofEntries.map(([key, url]) => {
                        const fileUrl = typeof url === 'string' && url.startsWith('http') ? url : `http://localhost:8000${url}`;
                        const label = DOCUMENT_LABELS[key] || key;
                        return (
                          <a
                            key={key}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <FaFileLines className="h-3.5 w-3.5 text-[#FF6500]" />
                            <span>{label}</span>
                            <FaArrowUpRightFromSquare className="h-2.5 w-2.5 text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {status === 'rejected' && applicant.reason && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 font-medium">
                    <span className="font-semibold block mb-0.5">Rejection Reason Dispatched:</span>
                    <span>{applicant.reason}</span>
                  </div>
                )}

                {rejectingId === applicant.userId ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Explain what documentation or detail is invalid. This explanation will be emailed to the applicant."
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setRejectingId(null); setReason(''); }}>
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={reason.trim().length < MIN_REASON_LENGTH || busyId === applicant.userId}
                        onClick={() => decide(applicant, false, reason.trim())}
                      >
                        Confirm Rejection & Dispatch Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === applicant.userId}
                      onClick={() => { setRejectingId(applicant.userId); setReason(''); }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={busyId === applicant.userId}
                      onClick={() => decide(applicant, true)}
                    >
                      Approve & Activate Account
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
