'use client';

import React, { useState } from 'react';
import {
  FaBoxOpen,
  FaPlus,
  FaMagnifyingGlass,
  FaPen,
  FaTrashCan
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('cement');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('Bag');
  const [formMoq, setFormMoq] = useState<number>(10);
  const [formGrade, setFormGrade] = useState('');
  const [formWeightKg, setFormWeightKg] = useState<number>(50);
  const [formDescription, setFormDescription] = useState('');

  const categories = [
    { label: 'All Materials', value: 'all' },
    { label: 'Cement & Binding', value: 'cement' },
    { label: 'TMT Steel & Rebars', value: 'steel' },
    { label: 'Aggregates & Sand', value: 'aggregates' },
    { label: 'Red Bricks & Blocks', value: 'bricks' },
    { label: 'Electrical & Conduit', value: 'electrical' },
    { label: 'Plumbing & Pipes', value: 'plumbing' }
  ];

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) => {
    const title = p.title || '';
    const brand = p.brand || '';
    const sku = p.sku || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  function resetForm() {
    setFormTitle('');
    setFormBrand('');
    setFormCategory('cement');
    setFormPrice(0);
    setFormStock(0);
    setFormUnit('Bag');
    setFormMoq(10);
    setFormGrade('');
    setFormWeightKg(50);
    setFormDescription('');
  }

  function handleOpenEdit(product: any) {
    setEditingProduct(product);
    setFormTitle(product.title || '');
    setFormBrand(product.brand || '');
    setFormCategory(product.category || 'cement');
    setFormPrice(product.price || 0);
    setFormStock(product.stockQty ?? product.stock ?? 0);
    setFormUnit(product.unit || 'Bag');
    setFormMoq(product.minOrderQty || 10);
    setFormGrade(product.grade || '');
    setFormWeightKg(product.weightKg || 50);
    setFormDescription(product.description || '');
  }

  async function handleAddSubmit() {
    if (!formTitle.trim() || formPrice <= 0) return;
    try {
      setIsSubmitting(true);
      await onCreateProduct({
        title: formTitle.trim(),
        brand: formBrand.trim() || 'Depot Verified',
        category: formCategory,
        price: Number(formPrice),
        stockQty: Number(formStock),
        unit: formUnit,
        minOrderQty: Number(formMoq),
        grade: formGrade.trim(),
        weightKg: Number(formWeightKg),
        description: formDescription.trim() || 'Wholesale construction material'
      });
      setShowAddModal(false);
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
        stockQty: Number(formStock),
        unit: formUnit,
        minOrderQty: Number(formMoq),
        grade: formGrade.trim(),
        weightKg: Number(formWeightKg),
        description: formDescription.trim()
      });
      setEditingProduct(null);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                selectedCategory === c.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search material SKU or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FaMagnifyingGlass className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<FaPlus className="h-3.5 w-3.5" />}
            iconPosition="left"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="shrink-0"
          >
            Add SKU
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Material SKU & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">Depot Stock</th>
                <th className="py-3 px-4">Unit / MOQ</th>
                <th className="py-3 px-4">Grade / Specs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaBoxOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No material SKUs found in depot catalog</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = product.stockQty ?? product.stock ?? 0;
                  const isLowStock = stock <= (product.reorderThreshold ?? 10);

                  return (
                    <tr key={product.id || product.productId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{product.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{product.brand || 'Depot'}</span>
                          <span className="h-2 w-px bg-slate-300 inline-block" />
                          <span>SKU: {product.sku || (product.id || product.productId || '').slice(0, 8)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize text-slate-700 font-medium">
                          {product.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900">
                          ₹{(product.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400"> / {product.unit || 'unit'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-medium ${
                              isLowStock ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {stock} {product.unit || 'units'}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] font-medium text-rose-600">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{product.unit || 'Bag'}</div>
                        <div className="text-[11px] text-slate-400">MOQ: {product.minOrderQty || 1}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 font-medium">
                          {product.grade || 'Standard IS Spec'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit SKU"
                          >
                            <FaPen className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Archive / Remove SKU"
                          >
                            <FaTrashCan className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Material SKU to Depot Catalog"
          subtitle="Publish verified materials available for contractor checkout at wholesale pricing"
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleAddSubmit}
                disabled={!formTitle.trim() || formPrice <= 0}
              >
                Publish SKU
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Material Title"
              placeholder="e.g., Dalmia Ultra OPC 53 Grade Cement"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer / Brand"
                placeholder="e.g., Dalmia Cement"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#FF6500]"
                >
                  <option value="cement">Cement & Binding</option>
                  <option value="steel">TMT Steel & Rebars</option>
                  <option value="aggregates">Aggregates & Sand</option>
                  <option value="bricks">Red Bricks & Blocks</option>
                  <option value="electrical">Electrical & Conduit</option>
                  <option value="plumbing">Plumbing & Pipes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Wholesale Price (₹)"
                type="number"
                placeholder="395"
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
                placeholder="Bag / Ton / Cu.Ft"
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
                placeholder="e.g., IS 12269:2013"
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
              />

              <Input
                label="Weight per Unit (kg)"
                type="number"
                value={formWeightKg}
                onChange={(e) => setFormWeightKg(Number(e.target.value))}
              />
            </div>

            <Input
              label="Technical Description & Specifications"
              placeholder="Depot verified stock, dry stored, conforming to IS standard certifications"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Edit SKU: ${editingProduct.title}`}
          subtitle="Update wholesale pricing, specifications, and physical depot stock levels"
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleEditSubmit}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Material Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Wholesale Price (₹)"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                required
              />

              <Input
                label="Depot Stock Quantity"
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Unit of Measure"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
              />

              <Input
                label="MOQ"
                type="number"
                value={formMoq}
                onChange={(e) => setFormMoq(Number(e.target.value))}
              />

              <Input
                label="Grade / Spec"
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
              />
            </div>

            <Input
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {deletingProductId && (
        <Modal
          isOpen={!!deletingProductId}
          onClose={() => setDeletingProductId(null)}
          title="Remove Material SKU Confirmation"
          subtitle="Archived items will no longer be visible for contractor catalog search"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setDeletingProductId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isSubmitting}
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </Button>
            </div>
          }
        >
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Are you sure you want to delete this material SKU from your active depot catalog? Outstanding orders will retain historical pricing.
          </p>
        </Modal>
      )}
    </div>
  );
};
