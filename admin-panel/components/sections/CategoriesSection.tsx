'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaLayerGroup,
  FaPlus,
  FaPen,
  FaCircleCheck,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [form, setForm] = useState<any>({
    id: '',
    title: '',
    subtitle: '',
    icon_name: 'FaBoxesStacked',
    color_bg: 'bg-[#FF6500]',
    item_count: 100,
    trending_badge: '',
    image: '/images/cement_aggregates.png',
    subcategories: '',
    featured_brands: ''
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCategories();
      setCategories(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreateModal() {
    setIsEditing(false);
    setForm({
      id: '',
      title: '',
      subtitle: '',
      icon_name: 'FaBoxesStacked',
      color_bg: 'bg-[#FF6500]',
      item_count: 50,
      trending_badge: '',
      image: '/images/cement_aggregates.png',
      subcategories: '',
      featured_brands: ''
    });
    setModalOpen(true);
  }

  function openEditModal(cat: any) {
    setIsEditing(true);
    setForm({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      icon_name: cat.iconName || 'FaBoxesStacked',
      color_bg: cat.colorBg || 'bg-[#FF6500]',
      item_count: cat.itemCount || 100,
      trending_badge: cat.trendingBadge || '',
      image: cat.image,
      subcategories: (cat.subcategories || []).join(', '),
      featured_brands: (cat.featuredBrands || []).join(', ')
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        id: form.id.trim().toLowerCase(),
        title: form.title,
        subtitle: form.subtitle,
        icon_name: form.icon_name,
        color_bg: form.color_bg,
        item_count: Number(form.item_count),
        trending_badge: form.trending_badge || null,
        image: form.image,
        subcategories: form.subcategories
          ? form.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        featured_brands: form.featured_brands
          ? form.featured_brands.split(',').map((b: string) => b.trim()).filter(Boolean)
          : []
      };

      await adminApi.saveCategory(payload);
      setModalOpen(false);
      setActionSuccess(`Category "${form.title}" saved successfully`);
      fetchCategories();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  }

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
          <h2 className="text-sm font-bold text-slate-900">Material Categories Taxonomy</h2>
          <p className="text-xs text-slate-500">Configure marketplace taxonomy, subcategory chips, and brand linkages</p>
        </div>
        <Button size="sm" variant="primary" onClick={openCreateModal} icon={<FaPlus />}>
          Add Category
        </Button>
      </div>

      {loading && categories.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
          <p className="text-xs font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-slate-900 relative overflow-hidden">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
                      ID: {c.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 leading-tight">{c.title}</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white text-xs h-7 px-2.5"
                    onClick={() => openEditModal(c)}
                    icon={<FaPen className="h-2.5 w-2.5" />}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <p className="text-slate-600 font-medium">{c.subtitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.itemCount || 0} active materials indexed</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Subcategories
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(c.subcategories || []).map((sub: string) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Associated Brands
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(c.featuredBrands || []).map((b: string) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/60"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Edit Category (${form.id})` : 'Create Material Category'}
        subtitle="Manage category metadata, subcategory taxonomy and brands"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Save Category
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <Input
            label="Category ID (slug)"
            disabled={isEditing}
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="e.g. cement, steel, roofing, timber"
          />
          <Input
            label="Display Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Cement & Aggregates"
          />
          <Input
            label="Subtitle / Spec Summary"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="e.g. 53 Grade, PPC, M-Sand, Blue Metal"
          />
          <Input
            label="Image Asset Path"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="/images/cement_aggregates.png"
          />
          <Input
            label="Subcategories (Comma-separated)"
            value={form.subcategories}
            onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
            placeholder="53 Grade OPC, PPC Water Shield, Plastering M-Sand"
          />
          <Input
            label="Featured Brands (Comma-separated)"
            value={form.featured_brands}
            onChange={(e) => setForm({ ...form, featured_brands: e.target.value })}
            placeholder="UltraTech, ACC Cement, Dalmia, Ramco"
          />
        </div>
      </Modal>
    </div>
  );
};
