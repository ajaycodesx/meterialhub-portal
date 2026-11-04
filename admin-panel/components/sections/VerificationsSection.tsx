'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  vehicleType?: string | null;
  vehicleRegNumber?: string | null;
  payloadCapacityTons?: number | null;
  licenseNumber?: string | null;
}

const MIN_REASON_LENGTH = 5;

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
      setSuccess(approve ? `${applicant.name} approved.` : `${applicant.name} rejected. They will see the reason.`);
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
    `px-3 py-1.5 rounded-xl text-xs font-medium border ${
      active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className={tabClass(role === 'vendor')} onClick={() => setRole('vendor')}>Vendors</button>
          <button type="button" className={tabClass(role === 'driver')} onClick={() => setRole('driver')}>Drivers</button>
        </div>
        <div className="flex gap-2">
          <button type="button" className={tabClass(status === 'pending')} onClick={() => setStatus('pending')}>Awaiting review</button>
          <button type="button" className={tabClass(status === 'rejected')} onClick={() => setStatus('rejected')}>Rejected</button>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>}
      {success && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">{success}</div>}

      {loading ? (
        <p className="text-xs text-slate-500">Loading applicationsâ€¦</p>
      ) : items.length === 0 ? (
        <NoData
          title={status === 'pending' ? 'Nothing waiting for review' : 'No rejected applications'}
          description="New applications appear here as soon as they register."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((applicant) => (
            <div key={applicant.userId} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{applicant.name}</p>
                  <p className="text-xs text-slate-500">{applicant.phone} Â· {applicant.email}</p>
                </div>
                <span className="text-[10px] text-slate-400">
                  {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString('en-IN') : 'No data'}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {role === 'vendor' ? (
                  <>
                    <dt className="text-slate-500">Store</dt><dd className="text-slate-900">{applicant.storeName || 'No data'}</dd>
                    <dt className="text-slate-500">Address</dt><dd className="text-slate-900">{applicant.address || 'No data'}</dd>
                    <dt className="text-slate-500">Pincode</dt><dd className="text-slate-900">{applicant.pincode || 'No data'}</dd>
                    <dt className="text-slate-500">GSTIN</dt><dd className="text-slate-900">{applicant.gstin || 'No data'}</dd>
                  </>
                ) : (
                  <>
                    <dt className="text-slate-500">Vehicle</dt><dd className="text-slate-900">{applicant.vehicleType || 'No data'}</dd>
                    <dt className="text-slate-500">Registration</dt><dd className="text-slate-900">{applicant.vehicleRegNumber || 'No data'}</dd>
                    <dt className="text-slate-500">Capacity</dt><dd className="text-slate-900">{applicant.payloadCapacityTons != null ? `${applicant.payloadCapacityTons} t` : 'No data'}</dd>
                    <dt className="text-slate-500">Licence</dt><dd className="text-slate-900">{applicant.licenseNumber || 'No data'}</dd>
                  </>
                )}
              </dl>

              {status === 'rejected' && applicant.reason && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">Rejected: {applicant.reason}</p>
              )}

              {rejectingId === applicant.userId ? (
                <div className="space-y-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Explain what is missing or wrong. The applicant will see this."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setRejectingId(null); setReason(''); }}>Cancel</Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={reason.trim().length < MIN_REASON_LENGTH || busyId === applicant.userId}
                      onClick={() => decide(applicant, false, reason.trim())}
                    >
                      Confirm rejection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" disabled={busyId === applicant.userId} onClick={() => { setRejectingId(applicant.userId); setReason(''); }}>
                    Reject
                  </Button>
                  <Button variant="primary" size="sm" isLoading={busyId === applicant.userId} onClick={() => decide(applicant, true)}>
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
