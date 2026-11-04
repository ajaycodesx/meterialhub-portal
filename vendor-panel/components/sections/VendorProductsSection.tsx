'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaBoxOpen,
  FaPlus,
  FaMagnifyingGlass,
  FaPen,
  FaTrashCan,
  FaSpinner,
  FaArrowUpFromBracket,
  FaTriangleExclamation,
  FaCircleInfo,
  FaArrowLeft
} from 'react-icons/fa6';
import { vendorApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

interface VendorProductsSectionProps {
  products: any[];
  onCreateProduct: (data: any) => Promise<void>;
  onUpdateProduct: (productId: string, data: any) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onRefresh?: () => void;
}

export const VendorProductsSection: React.FC<VendorProductsSectionProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState<number>(380);
  const [formStock, setFormStock] = useState<number>(500);
  const [formUnit, setFormUnit] = useState('Bag (50kg)');
  const [formMoq, setFormMoq] = useState<number>(10);
  const [formGrade, setFormGrade] = useState('');
  const [formWeightKg, setFormWeightKg] = useState<number>(50);
  const [formImage, setFormImage] = useState<string>('/images/cement_aggregates.png');
  const [formWeightSpec, setFormWeightSpec] = useState('50kg Standard');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaUrl = (src: string) => {
    if (!src) return '/images/cement_aggregates.png';
    if (src.startsWith('/uploads')) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      return `${apiHost}${src}`;
    }
    return src;
  };

  async function loadAdminCategories() {
    try {
      const res = await vendorApi.getCategories();
      if (Array.isArray(res) && res.length > 0) {
        setCategories(res);
        return res;
      }
    } catch {
      setCategories([]);
    }
    return [];
  }

  useEffect(() => {
    loadAdminCategories();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) => {
    const title = p.title || '';
    const brand = p.brand || '';
    const sku = p.id || p.sku || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    const statusVal = p.status || 'approved';
    const matchesStatus =
      selectedStatus === 'all' || statusVal.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  function resetForm() {
    const defaultCat = categories.length > 0 ? categories[0].id : 'cement';
    setFormTitle('');
    setFormBrand('');
    setFormCategory(defaultCat);
    setFormPrice(380);
    setFormStock(500);
    setFormUnit('Bag (50kg)');
    setFormMoq(10);
    setFormGrade('');
    setFormWeightKg(50);
    setFormImage('/images/cement_aggregates.png');
    setFormWeightSpec('50kg Standard');
    setUploadError(null);
  }

  async function openAddView() {
    const cats = await loadAdminCategories();
    resetForm();
    if (cats.length > 0) {
      setFormCategory(cats[0].id);
    }
    setEditingProduct(null);
    setViewMode('add');
  }

  async function handleOpenEdit(product: any) {
    await loadAdminCategories();
    setEditingProduct(product);
    setFormTitle(product.title || '');
    setFormBrand(product.brand || '');
    setFormCategory(product.category || (categories[0]?.id || 'cement'));
    setFormPrice(product.price || 0);
    setFormStock(product.stockQty ?? product.stock ?? 0);
    setFormUnit(product.unit || 'Bag (50kg)');
    setFormMoq(product.moq || product.minOrderQty || 10);
    setFormGrade(product.grade || '');
    setFormWeightKg(product.weightKg || 50);
    setFormImage(product.image || '/images/cement_aggregates.png');
    setFormWeightSpec(product.weightSpec || 'Standard');
    setUploadError(null);
    setViewMode('edit');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const res = await vendorApi.uploadImage(file);
      setFormImage(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleAddSubmit() {
    if (!formTitle.trim() || formPrice <= 0) return;
    try {
      setIsSubmitting(true);
      await onCreateProduct({
        title: formTitle.trim(),
        brand: formBrand.trim() || 'Store Direct',
        category: formCategory || (categories[0]?.id || 'cement'),
        price: Number(formPrice),
        stock_qty: Number(formStock),
        unit: formUnit,
        moq: Number(formMoq),
        grade: formGrade.trim() || 'Standard Spec',
        weight_kg: Number(formWeightKg),
        weight_spec: formWeightSpec.trim() || 'Standard Pack',
        image: formImage
      });
      setViewMode('list');
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditSubmit() {
    if (!editingProduct || !formTitle.trim() || formPrice <= 0) return;
    try {
      setIsSubmitting(true);
      await onUpdateProduct(editingProduct.id, {
        title: formTitle.trim(),
        brand: formBrand.trim(),
        category: formCategory,
        price: Number(formPrice),
        stock_qty: Number(formStock),
        unit: formUnit,
        moq: Number(formMoq),
        grade: formGrade.trim(),
        weight_kg: Number(formWeightKg),
        weight_spec: formWeightSpec.trim(),
        image: formImage
      });
      setEditingProduct(null);
      setViewMode('list');
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProductId) return;
    try {
      setIsSubmitting(true);
      await onDeleteProduct(deletingProductId);
      setDeletingProductId(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const categorySelectOptions: SelectOption[] = categories.map((c) => ({
    label: c.title,
    value: c.id
  }));

  const pendingCount = safeProducts.filter((p) => p.status === 'pending').length;
  const rejectedCount = safeProducts.filter((p) => p.status === 'rejected').length;

  return (
    <div className="space-y-4">
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                All Products
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('approved')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  selectedStatus === 'approved'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Live in Buyer Panel
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'pending'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Pending Admin Approval</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-lg text-[10px] font-semibold bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('rejected')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'rejected'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Rejected (Needs Action)</span>
                {rejectedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-lg text-[10px] font-semibold bg-rose-100 text-rose-800">
                    {rejectedCount}
                  </span>
                )}
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<FaPlus className="h-3 w-3" />}
              iconPosition="left"
              onClick={openAddView}
              className="shrink-0"
            >
              Add Material Product
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#FF6500] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#FF6500] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Search material SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<FaMagnifyingGlass className="h-3.5 w-3.5 text-slate-400" />}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Material SKU & Name</th>
                    <th className="py-3 px-4">Admin Category</th>
                    <th className="py-3 px-4">Wholesale Price</th>
                    <th className="py-3 px-4">Depot Stock</th>
                    <th className="py-3 px-4">Unit / MOQ</th>
                    <th className="py-3 px-4 text-center">Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FaBoxOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium">No material SKUs found matching your filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stock = product.stockQty ?? product.stock ?? 0;
                      const isLowStock = stock <= 50;
                      const statusVal = product.status || 'approved';
                      const isPending = statusVal === 'pending';
                      const isRejected = statusVal === 'rejected';

                      return (
                        <React.Fragment key={product.id || product.productId}>
                          <tr className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center">
                                  {product.image ? (
                                    <img
                                      src={getMediaUrl(product.image)}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FaBoxOpen className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 truncate">{product.title}</div>
                                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span>{product.brand || 'Store'}</span>
                                    <span className="h-2 w-px bg-slate-300 inline-block" />
                                    <span>ID: {(product.id || product.productId || '').slice(0, 12)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                                {product.category || 'General'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900">
                                INR {(product.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium"> / {product.unit || 'unit'}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-semibold ${
                                    isLowStock ? 'text-rose-600' : 'text-slate-900'
                                  }`}
                                >
                                  {stock} {product.unit || 'units'}
                                </span>
                                {isLowStock && (
                                  <span className="text-[10px] font-semibold text-rose-600">
                                    Low
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-slate-800 font-medium">{product.unit || 'Bag'}</div>
                              <div className="text-[11px] text-slate-400 font-medium">MOQ: {product.moq || product.minOrderQty || 1}</div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              {isPending ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold text-amber-600 bg-amber-50">
                                  Pending Review
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50">
                                  Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50">
                                  Approved
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                  title="Edit SKU"
                                >
                                  <FaPen className="h-3 w-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingProductId(product.id)}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Archive / Remove SKU"
                                >
                                  <FaTrashCan className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isRejected && product.rejectionReason && (
                            <tr className="bg-rose-50/60">
                              <td colSpan={7} className="py-2.5 px-4">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-rose-800">
                                    <FaCircleInfo className="h-4 w-4 text-rose-600 shrink-0" />
                                    <span className="font-semibold">Admin Rejection Notice:</span>
                                    <span className="font-medium text-slate-700">{product.rejectionReason}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(product)}
                                    className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                                  >
                                    Edit & Resubmit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
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
                onClick={() => {
                  setViewMode('list');
                  setEditingProduct(null);
                }}
                icon={<FaArrowLeft className="h-3 w-3" />}
              >
                Back to Products
              </Button>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {viewMode === 'edit'
                    ? `Edit Product: ${editingProduct?.title || formTitle}`
                    : 'Add Material Product to Catalog'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {viewMode === 'edit'
                    ? editingProduct?.status === 'rejected'
                      ? 'Modifying this rejected product will automatically resubmit it for Admin review'
                      : 'Update wholesale pricing, specifications, and physical depot stock levels'
                    : 'Select an Admin category and submit your material SKU for approval'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode('list');
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={viewMode === 'edit' ? handleEditSubmit : handleAddSubmit}
                disabled={!formTitle.trim() || formPrice <= 0}
              >
                {viewMode === 'edit'
                  ? editingProduct?.status === 'rejected'
                    ? 'Resubmit for Approval'
                    : 'Save Changes'
                  : 'Submit for Approval'}
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-xs space-y-5 max-w-4xl">
            {viewMode === 'add' && (
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-900 font-medium flex items-center gap-2 text-xs">
                <FaCircleInfo className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  New submissions are sent to the Admin queue. Upon approval, this product will appear under the selected category in the Buyer marketplace.
                </span>
              </div>
            )}

            {viewMode === 'edit' && editingProduct?.status === 'rejected' && editingProduct.rejectionReason && (
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-800 font-medium text-xs">
                <span className="font-semibold block mb-0.5">Admin Feedback:</span>
                <span>{editingProduct.rejectionReason}</span>
              </div>
            )}

            <Input
              label="Material Title"
              placeholder="e.g. ACC Suraksha Power PPC Cement or JSW Neosteel Fe500D (16mm)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Material Category
                </label>
                <Select
                  options={categorySelectOptions}
                  value={formCategory}
                  onChange={(val) => setFormCategory(String(val))}
                  placeholder="Select material category"
                />
              </div>

              <Input
                label="Manufacturer / Brand"
                placeholder="e.g. ACC Cement, JSW Steel, Finolex"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Wholesale Price (INR)"
                type="number"
                placeholder="380"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                required
              />

              <Input
                label="Available Depot Stock"
                type="number"
                placeholder="500"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                required
              />

              <Input
                label="Unit of Measure"
                placeholder="e.g. Bag (50kg), Metric Ton, Coil"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Minimum Order Qty (MOQ)"
                type="number"
                value={formMoq}
                onChange={(e) => setFormMoq(Number(e.target.value))}
              />

              <Input
                label="Grade / Technical Standard"
                placeholder="e.g. 53 Grade PPC, Fe500D"
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
              />

              <Input
                label="Weight per Unit (KG)"
                type="number"
                value={formWeightKg}
                onChange={(e) => setFormWeightKg(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Image
              </label>
              <div className="flex items-start gap-4">
                <div className="h-20 w-28 rounded-2xl bg-slate-100 overflow-hidden relative shrink-0 shadow-xs">
                  <img
                    src={getMediaUrl(formImage)}
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
                    id="vendor-product-upload"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="vendor-product-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {uploadingImage ? (
                        <FaSpinner className="h-3 w-3 animate-spin text-[#FF6500]" />
                      ) : (
                        <FaArrowUpFromBracket className="h-3 w-3" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">PNG, JPG, WebP</span>
                  </div>
                  {uploadError && <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode('list');
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={viewMode === 'edit' ? handleEditSubmit : handleAddSubmit}
                disabled={!formTitle.trim() || formPrice <= 0}
              >
                {viewMode === 'edit'
                  ? editingProduct?.status === 'rejected'
                    ? 'Resubmit for Approval'
                    : 'Save Changes'
                  : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Remove Material Product"
        subtitle="This action will withdraw the SKU from your store catalog"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeletingProductId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isSubmitting}
              onClick={handleDeleteConfirm}
            >
              Confirm Remove
            </Button>
          </div>
        }
      >
        <div className="p-3 bg-rose-50 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
          <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-medium">
            Are you sure you want to remove this SKU from your active catalog?
          </span>
        </div>
      </Modal>
    </div>
  );
};
