'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaPen,
  FaTrashCan,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaArrowUpFromBracket,
  FaTriangleExclamation,
  FaArrowLeft,
  FaBoxesStacked
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formImage, setFormImage] = useState('/images/cement_aggregates.png');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaUrl = (src: string) => {
    if (!src) return '/images/cement_aggregates.png';
    if (src.startsWith('/uploads')) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      return `${apiHost}${src}`;
    }
    return src;
  };

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

  function openCreateView() {
    setEditingId(null);
    setFormTitle('');
    setFormImage('/images/cement_aggregates.png');
    setError(null);
    setViewMode('add');
  }

  function openEditView(cat: any) {
    setEditingId(cat.id);
    setFormTitle(cat.title || '');
    setFormImage(cat.image || '/images/cement_aggregates.png');
    setError(null);
    setViewMode('edit');
  }

  function openDeleteModal(cat: any) {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setFormImage(res.url);
      setActionSuccess('Image uploaded successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleSubmit() {
    if (!formTitle.trim()) {
      setError('Category Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const derivedId = editingId || formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
      const payload = {
        id: derivedId,
        title: formTitle.trim(),
        subtitle: `Wholesale ${formTitle.trim()} Supplies`,
        icon_name: 'FaBoxesStacked',
        color_bg: 'bg-[#FF6500]',
        item_count: 50,
        trending_badge: null,
        image: formImage || '/images/cement_aggregates.png',
        subcategories: [],
        featured_brands: []
      };

      await adminApi.saveCategory(payload);
      setViewMode('list');
      setActionSuccess(viewMode === 'edit' ? `Category "${formTitle}" updated` : `New category "${formTitle}" created`);
      fetchCategories();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!categoryToDelete) return;

    setSubmitting(true);
    try {
      await adminApi.deleteCategory(categoryToDelete.id);
      setDeleteModalOpen(false);
      setActionSuccess(`Category "${categoryToDelete.title}" removed`);
      setCategoryToDelete(null);
      fetchCategories();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-emerald-800">
          <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 rounded-2xl flex items-center justify-between text-xs font-medium text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Material Categories</h2>
              <p className="text-xs text-slate-500 font-medium">Add and manage material categories available for vendor products</p>
            </div>
            <Button size="sm" variant="primary" onClick={openCreateView} icon={<FaPlus />}>
              Add Category
            </Button>
          </div>

          {loading && categories.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
              <p className="text-xs font-medium">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 px-4 bg-white rounded-2xl shadow-xs text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center text-xl mb-3">
                <FaBoxesStacked className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">No Material Categories Created</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mb-4">
                Add wholesale categories so merchants can organize catalog products and buyers can browse verified suppliers.
              </p>
              <Button size="sm" variant="primary" onClick={openCreateView} icon={<FaPlus />}>
                Add First Category
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-slate-900 relative overflow-hidden">
                    <img
                      src={getMediaUrl(c.image)}
                      alt={c.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-white leading-tight">{c.title}</h3>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">{c.itemCount || 0} active materials</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white text-xs h-7 px-2"
                          onClick={() => openEditView(c)}
                          icon={<FaPen className="h-2.5 w-2.5" />}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(c)}
                          className="h-7 w-7 rounded-xl bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FaTrashCan className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                icon={<FaArrowLeft className="h-3 w-3" />}
              >
                Back to Categories
              </Button>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {viewMode === 'edit' ? 'Edit Material Category' : 'Add Material Category'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {viewMode === 'edit'
                    ? 'Update the material category name and display photo'
                    : 'This category will be immediately available for vendors when adding products'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
                {viewMode === 'edit' ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-xs max-w-2xl space-y-5">
            <Input
              label="Category Name"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Cement & Aggregates, TMT Steel Rods, PVC & Plumbing"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Category Photo
              </label>
              <div className="flex items-start gap-4">
                <div className="h-24 w-36 rounded-2xl bg-slate-100 overflow-hidden relative shrink-0 shadow-xs">
                  <img
                    src={getMediaUrl(formImage)}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="admin-category-photo-file"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="admin-category-photo-file"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {uploadingImage ? (
                        <FaSpinner className="h-3 w-3 animate-spin text-[#FF6500]" />
                      ) : (
                        <FaArrowUpFromBracket className="h-3 w-3" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Category Photo'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">PNG, JPG, WebP</span>
                  </div>
                  <Input
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/images/... or /uploads/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
                {viewMode === 'edit' ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Material Category"
        subtitle="This action cannot be undone"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={submitting}
              onClick={handleDeleteConfirm}
            >
              Delete Category
            </Button>
          </div>
        }
      >
        <div className="text-xs space-y-3">
          <div className="p-3 bg-rose-50 rounded-2xl flex items-center gap-2 text-rose-800">
            <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
            <p className="font-medium">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{categoryToDelete?.title}</span>?
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
