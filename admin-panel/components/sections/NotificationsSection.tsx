'use client';

import React, { useState, useEffect } from 'react';
import {
  FaEnvelopeOpenText,
  FaPen,
  FaCircleCheck,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const NotificationsSection: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [bodyText, setBodyText] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchTemplates() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTemplates();
      setTemplates(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load communication templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  function openEditModal(tmpl: any) {
    setActiveTemplate(tmpl);
    setSubject(tmpl.subject || '');
    setBodyText(tmpl.bodyText || '');
    setIsActive(tmpl.isActive ?? true);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!activeTemplate) return;
    setSubmitting(true);
    try {
      await adminApi.updateTemplate(activeTemplate.templateId, bodyText, subject || undefined, isActive);
      setModalOpen(false);
      setActionSuccess(`Template "${activeTemplate.name}" updated successfully`);
      fetchTemplates();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
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
          <h2 className="text-sm font-medium text-slate-900">SMS, WhatsApp & Email Communication Templates</h2>
          <p className="text-xs text-slate-500">Configure transactional text copy for site deliveries, driver dispatches, and OTP verification</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Template Name</th>
                <th className="py-3.5">Channel</th>
                <th className="py-3.5">Subject / Header</th>
                <th className="py-3.5">Message Copy (with Dynamic Placeholders)</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading templates...</p>
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No communication templates found.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.templateId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{t.templateId}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
                        {t.channel}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">
                      {t.subject || 'N/A (Direct SMS)'}
                    </td>
                    <td className="py-3.5 text-slate-600 max-w-[340px]">
                      <p className="truncate font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {t.bodyText}
                      </p>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`text-xs font-medium ${
                          t.isActive
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {t.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(t)}
                        icon={<FaPen />}
                      >
                        Edit Copy
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
        title="Edit Communication Template"
        subtitle={`Template: ${activeTemplate?.name}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Save Template
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {activeTemplate?.channel.includes('Email') && (
            <Input
              label="Subject Line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Message Body Template
            </label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/20 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Supported tokens: &#123;orderId&#125;, &#123;grandTotal&#125;, &#123;otpCode&#125;, &#123;vehicleReg&#125;, &#123;etaMinutes&#125;
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
