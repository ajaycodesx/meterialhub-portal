'use client';

import React, { useState, useEffect } from 'react';
import {
  FaShieldHalved,
  FaMagnifyingGlass,
  FaSpinner,
  FaClockRotateLeft
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const AuditLogsSection: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAuditLogs(100);
      setLogs(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.actorId && l.actorId.toLowerCase().includes(term)) ||
      (l.targetId && l.targetId.toLowerCase().includes(term)) ||
      (l.targetType && l.targetType.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Security Audit Trail & Administrative Telemetry</h2>
          <p className="text-xs text-slate-500">Immutable operations log tracking role changes, price overrides, and fulfillment events</p>
        </div>

        <div className="w-full sm:w-80">
          <Input
            placeholder="Search action, actor, target entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FaMagnifyingGlass />}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Timestamp & ID</th>
                <th className="py-3.5">Action Code</th>
                <th className="py-3.5">Actor Identity</th>
                <th className="py-3.5">Target Entity</th>
                <th className="py-3.5">Modified Changes / Context</th>
                <th className="py-3.5 pr-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading audit stream...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No security audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-semibold text-slate-900">
                        {l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : 'N/A'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">{l.id?.slice(0, 8)}...</p>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] font-bold text-slate-800">
                      {l.action}
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-900">{l.actorId || 'u_admin_1'}</p>
                      <span className="text-[10px] font-semibold uppercase text-orange-600">
                        {l.actorRole || 'admin'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <p className="font-semibold capitalize text-slate-900">{l.targetType || 'system'}</p>
                      <p className="text-[10px] font-mono text-slate-400">#{l.targetId}</p>
                    </td>
                    <td className="py-3.5 max-w-[280px]">
                      {l.changes ? (
                        <p className="text-[11px] font-mono text-slate-600 truncate bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          {typeof l.changes === 'object' ? JSON.stringify(l.changes) : String(l.changes)}
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No payload diff</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          l.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {l.status || 'success'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
