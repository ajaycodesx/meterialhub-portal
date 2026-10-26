'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaTags,
  FaPlus,
  FaPen,
  FaTrash,
  FaCircleCheck,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const DealsSection: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [form, setForm] = useState<any>({
    id: '',
    material: '',
    brand: '',
    image: '/images/cement_aggregates.png',
    original_rate: 420,
    deal_rate: 375,
    unit: 'Bag (50kg)',
    discount_pct: 11,
    min_order: '100 Bags Min.',
    badge: 'Flash Deal',
    badge_color: 'bg-[#FF6500]',
    expires_in_seconds: 18000
  });

  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchDeals() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDeals();
      setDeals(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load promotional deals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeals();
  }, []);

  function openCreateModal() {
    setIsEditing(false);
    setForm({
      id: '',
      material: '',
      brand: '',
      image: '/images/cement_aggregates.png',
      original_rate: 420,
      deal_rate: 375,
      unit: 'Bag (50kg)',
      discount_pct: 11,
      min_order: '100 Bags Min.',
      badge: 'Flash Deal',
      badge_color: 'bg-[#FF6500]',
      expires_in_seconds: 18000
    });
    setModalOpen(true);
  }

  function openEditModal(d: any) {
    setIsEditing(true);
    setActiveDealId(d.id);
    setForm({
      id: d.id,
      material: d.material,
      brand: d.brand,
      image: d.image,
      original_rate: d.originalRate,
      deal_rate: d.dealRate,
      unit: d.unit,
      discount_pct: d.discountPct,
      min_order: d.minOrder,
      badge: d.badge,
      badge_color: d.badgeColor || 'bg-[#FF6500]',
      expires_in_seconds: d.expiresInSeconds || 18000
    });
    setModalOpen(true);
  }

  function openDeleteModal(d: any) {
    setActiveDealId(d.id);
    setForm(d);
    setDeleteModalOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await adminApi.saveDeal(form);
      setModalOpen(false);
      setActionSuccess(`Promotion "${form.material}" saved`);
      fetchDeals();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save deal');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSubmit() {
    if (!activeDealId) return;
    setSubmitting(true);
    try {
      await adminApi.deleteDeal(activeDealId);
      setDeleteModalOpen(false);
      setActionSuccess('Promotional deal removed');
      fetchDeals();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete deal');
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
          <h2 className="text-sm font-medium text-slate-900">Promotions & Flash Deals</h2>
          <p className="text-xs text-slate-500">Live builder discounts displayed on buyer homepage countdown ticker</p>
        </div>
        <Button size="sm" variant="primary" onClick={openCreateModal} icon={<FaPlus />}>
          Create Promotion
        </Button>
      </div>

      {loading && deals.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
          <p className="text-xs font-medium">Loading promotional deals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0">
                  {d.image && (
                    <Image
                      src={d.image}
                      alt={d.material}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-[#FF6500] uppercase tracking-wider">
                      {d.badge || 'Flash Deal'}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600">
                      {d.discountPct}% OFF
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 leading-tight">{d.material}</h3>
                  <p className="text-xs font-medium text-slate-500">{d.brand}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500">Contractor Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-slate-900">INR {d.dealRate}</span>
                    <span className="line-through text-slate-400 text-[11px]">INR {d.originalRate}</span>
                    <span className="text-slate-500 text-[11px]">/ {d.unit}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Minimum Volume:</span>
                  <span className="font-medium text-slate-700">{d.minOrder}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => openEditModal(d)} icon={<FaPen />}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => openDeleteModal(d)}
                  icon={<FaTrash />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Promotional Deal' : 'Create Flash Deal'}
        subtitle="Manage campaign pricing and minimum order criteria"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Save Deal
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <Input
            label="Material Title"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            placeholder="e.g. Dalmia DSP Cement 53 Grade"
          />
          <Input
            label="Brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="e.g. Dalmia"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Original Standard Rate"
              type="number"
              value={form.original_rate}
              onChange={(e) => setForm({ ...form, original_rate: Number(e.target.value) })}
            />
            <Input
              label="Promotional Deal Rate"
              type="number"
              value={form.deal_rate}
              onChange={(e) => setForm({ ...form, deal_rate: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit of Sale"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
            <Input
              label="Minimum Order Text"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              placeholder="e.g. 100 Bags Min."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount Percent (%)"
              type="number"
              value={form.discount_pct}
              onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })}
            />
            <Input
              label="Badge Tag"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="Flash Deal"
            />
          </div>
          <Input
            label="Image Asset Path"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Promotion"
        subtitle={`Delete ${form?.material}`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" isLoading={submitting} onClick={handleDeleteSubmit}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">
          Are you sure you want to delete this promotional deal? It will immediately disappear from the contractor homepage ticker.
        </p>
      </Modal>
    </div>
  );
};
