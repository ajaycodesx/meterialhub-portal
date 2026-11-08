'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaMagnifyingGlass,
  FaPlus,
  FaPen,
  FaTrashCan,
  FaCheck,
  FaBan,
  FaTriangleExclamation,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaBoxOpen,
  FaArrowUpFromBracket,
  FaArrowLeft
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

export const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  const [productForm, setProductForm] = useState<any>({
    title: '',
    category: 'cement',
    brand: '',
    price: 380,
    unit: 'Bag (50kg)',
    moq: 10,
    weight_spec: '50kg Standard',
    image: '/images/cement_aggregates.png',
    grade: '53 Grade',
    weight_kg: 50.0,
    stock_qty: 500
  });

  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
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
    try {
      const res = await adminApi.getCategories();
      setCategories(res || []);
    } catch {
      setCategories([]);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProducts({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit
      });
      setProducts(res.products || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  function openCreateView() {
    const defaultCategory = categories.length > 0 ? categories[0].id : 'cement';
    setProductForm({
      title: '',
      category: defaultCategory,
      brand: '',
      price: 380,
      unit: 'Bag (50kg)',
      moq: 10,
      weight_spec: '50kg Standard',
      image: '/images/cement_aggregates.png',
      grade: '53 Grade',
      weight_kg: 50.0,
      stock_qty: 500
    });
    setActiveProductId(null);
    setViewMode('add');
  }

  function openEditView(prod: any) {
    setActiveProductId(prod.id);
    setProductForm({
      title: prod.title,
      category: prod.category,
      brand: prod.brand,
      price: prod.price,
      unit: prod.unit,
      moq: prod.moq,
      weight_spec: prod.weightSpec || 'Standard',
      image: prod.image,
      grade: prod.grade || '',
      weight_kg: prod.weightKg || 50.0,
      stock_qty: prod.stockQty
    });
    setViewMode('edit');
  }

  function openDeleteModal(prod: any) {
    setActiveProductId(prod.id);
    setSelectedProduct(prod);
    setDeleteModalOpen(true);
  }

  function openRejectModal(prod: any) {
    setActiveProductId(prod.id);
    setSelectedProduct(prod);
    setRejectionReason('');
    setRejectModalOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setProductForm((prev: any) => ({ ...prev, image: res.url }));
      setActionSuccess('Product photo uploaded successfully');
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

  async function handleCreateSubmit() {
    if (!productForm.title.trim()) {
      setError('Product title is required');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createProduct(productForm);
      setViewMode('list');
      setActionSuccess(`New SKU "${productForm.title}" published to catalog`);
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit() {
    if (!activeProductId) return;
    setSubmitting(true);
    try {
      await adminApi.updateProduct(activeProductId, productForm);
      setViewMode('list');
      setActionSuccess('Product specs updated successfully');
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSubmit() {
    if (!activeProductId) return;
    setSubmitting(true);
    try {
      await adminApi.deleteProduct(activeProductId);
      setDeleteModalOpen(false);
      setActionSuccess('Product removed from catalog');
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(prodId: string, title: string) {
    setSubmitting(true);
    try {
      await adminApi.approveProduct(prodId);
      setActionSuccess(`Product "${title}" approved and live in Buyer marketplace`);
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve product');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRejectSubmit() {
    if (!activeProductId) return;
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejecting this material submission');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.rejectProduct(activeProductId, rejectionReason.trim());
      setRejectModalOpen(false);
      setActionSuccess('Product rejected and explanation dispatched to vendor');
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject product');
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions: SelectOption[] = [
    { label: 'All Categories', value: 'all' },
    ...categories.map((c) => ({ label: c.title, value: c.id }))
  ];

  const pendingCount = products.filter((p) => p.status === 'pending').length;
  const totalPages = Math.ceil(totalCount / limit) || 1;

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
          <div className="flex flex-wrap items-center gap-2 p-1 bg-white rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#FF6500] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Catalog SKUs
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-[#FF6500] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Pending Vendor Requests</span>
              {pendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-lg text-[10px] font-semibold ${
                    statusFilter === 'pending'
                      ? 'bg-white text-[#FF6500]'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('approved');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-[#FF6500] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Approved Live
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('rejected');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-[#FF6500] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rejected
            </button>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
              <Input
                placeholder="Search material title, brand, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<FaMagnifyingGlass />}
              />
              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="w-full md:w-56">
                <Select
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(String(val));
                    setPage(1);
                  }}
                  placeholder="Filter by category"
                />
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={openCreateView}
                icon={<FaPlus />}
                className="shrink-0"
              >
                Add Material SKU
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 pl-4">Material SKU</th>
                    <th className="py-3">Category & Brand</th>
                    <th className="py-3">Technical Specs</th>
                    <th className="py-3 text-right">Wholesale Rate</th>
                    <th className="py-3 text-center">Status</th>
                    <th className="py-3 text-right">Stock Level</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                        <p className="font-medium">Loading catalog SKUs...</p>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No products found matching filters.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isPending = p.status === 'pending';
                      const isApproved = p.status === 'approved';
                      const isRejected = p.status === 'rejected';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
                                <img
                                  src={getMediaUrl(p.image)}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block">{p.title}</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  SKU: {(p.sku || p.id || '').slice(0, 10)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3">
                            <span className="font-medium text-slate-900 block capitalize">
                              {p.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{p.brand}</span>
                          </td>

                          <td className="py-3 text-slate-600 font-medium">
                            <span>{p.weightSpec || p.unit}</span>
                            {p.grade && (
                              <span className="text-[11px] text-slate-400 block">
                                Grade: {p.grade}
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-right">
                            <span className="font-semibold text-slate-900">
                              INR {(p.price || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              MOQ: {p.moq || 1} {p.unit}
                            </span>
                          </td>

                          <td className="py-3 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-amber-600">
                                Pending Approval
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600">
                                Live
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-rose-600">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-semibold text-slate-600">
                                {p.status}
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-right">
                            <span className="font-semibold text-slate-900">{p.stockQty ?? 0}</span>
                            <span className="text-[11px] text-slate-400 block font-medium">{p.unit}</span>
                          </td>

                          <td className="py-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2 text-xs"
                                    onClick={() => handleApprove(p.id, p.title)}
                                    title="Approve submission"
                                  >
                                    <FaCheck className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => openRejectModal(p)}
                                    title="Reject submission"
                                  >
                                    <FaBan className="h-3 w-3" />
                                  </Button>
                                </>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => openEditView(p)}
                              >
                                <FaPen className="h-3 w-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                                onClick={() => openDeleteModal(p)}
                              >
                                <FaTrashCan className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                Showing {products.length} of {totalCount} products
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 py-1 font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                icon={<FaArrowLeft className="h-3 w-3" />}
              >
                Back to Products
              </Button>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {viewMode === 'edit' ? 'Edit Material SKU' : 'Create Material SKU'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {viewMode === 'edit'
                    ? 'Update pricing, technical specifications and catalog metadata'
                    : 'Publish a standard materials catalog item'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submitting}
                onClick={viewMode === 'edit' ? handleEditSubmit : handleCreateSubmit}
              >
                {viewMode === 'edit' ? 'Update SKU' : 'Publish SKU'}
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-xs w-full space-y-5">
            <Input
              label="Material Title"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              placeholder="e.g. ACC Suraksha Power PPC Cement"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Category
                </label>
                <Select
                  options={categories.map((c) => ({ label: c.title, value: c.id }))}
                  value={productForm.category}
                  onChange={(val) => setProductForm({ ...productForm, category: String(val) })}
                />
              </div>

              <Input
                label="Brand Name"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                placeholder="e.g. ACC Cement"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Wholesale Price (INR)"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                required
              />

              <Input
                label="Unit of Measure"
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                placeholder="e.g. Bag (50kg), Metric Ton, Coil"
                required
              />

              <Input
                label="MOQ (Min Order Qty)"
                type="number"
                value={productForm.moq}
                onChange={(e) => setProductForm({ ...productForm, moq: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Weight / Spec String"
                value={productForm.weight_spec}
                onChange={(e) => setProductForm({ ...productForm, weight_spec: e.target.value })}
                placeholder="e.g. 50kg Tamper Proof Bag"
              />

              <Input
                label="Grade / Gauge"
                value={productForm.grade}
                onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
                placeholder="e.g. 53 Grade, Fe500D, Class 1"
              />

              <Input
                label="Weight in KG (for logistics)"
                type="number"
                value={productForm.weight_kg}
                onChange={(e) => setProductForm({ ...productForm, weight_kg: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stock Quantity"
                type="number"
                value={productForm.stock_qty}
                onChange={(e) => setProductForm({ ...productForm, stock_qty: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Photo
              </label>
              <div className="flex items-start gap-4">
                <div className="h-20 w-28 rounded-2xl bg-slate-100 overflow-hidden relative shrink-0 shadow-xs">
                  <img
                    src={getMediaUrl(productForm.image)}
                    alt="Preview"
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
                    id="admin-product-file-upload"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="admin-product-file-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {uploadingImage ? (
                        <FaSpinner className="h-3 w-3 animate-spin text-[#FF6500]" />
                      ) : (
                        <FaArrowUpFromBracket className="h-3 w-3" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">PNG, JPG, WebP</span>
                  </div>
                  <Input
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="/images/... or /uploads/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submitting}
                onClick={viewMode === 'edit' ? handleEditSubmit : handleCreateSubmit}
              >
                {viewMode === 'edit' ? 'Update SKU' : 'Publish SKU'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Material SKU"
        subtitle="Permanently remove SKU from catalog"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" isLoading={submitting} onClick={handleDeleteSubmit}>
              Delete Product
            </Button>
          </div>
        }
      >
        <div className="text-xs space-y-3">
          <div className="p-3 bg-rose-50 rounded-2xl flex items-center gap-2 text-rose-800">
            <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
            <p className="font-medium">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold">{selectedProduct?.title}</span>?
            </p>
          </div>
          <p className="text-slate-500 font-medium">
            This will immediately remove this SKU from the platform catalog and any buyer cart items.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Material Submission"
        subtitle="Explain to the vendor why this item cannot be published"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" isLoading={submitting} onClick={handleRejectSubmit}>
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="text-xs space-y-3">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-900 font-medium space-y-1">
            <p className="font-semibold text-slate-900">{selectedProduct?.title}</p>
            <p className="text-[11px] text-slate-600">
              Brand: {selectedProduct?.brand} | Category: {selectedProduct?.category}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rejection Reason & Required Vendor Corrections
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Technical certificate is missing; please upload high-resolution photos of the actual stock and verify standard ISI grade."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6500] font-medium text-slate-900 resize-none"
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              This message will appear directly in the vendor portal so they can edit and resubmit.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
