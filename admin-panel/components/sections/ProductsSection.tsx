'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaMagnifyingGlass,
  FaPlus,
  FaPen,
  FaTrash,
  FaTriangleExclamation,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaBoxOpen
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Cement & Aggregates', value: 'cement' },
  { label: 'TMT Steel Rods', value: 'steel' },
  { label: 'PVC & Plumbing', value: 'pvc' },
  { label: 'Paints & Wall Putty', value: 'paints' },
  { label: 'Electricals & Cables', value: 'electricals' },
  { label: 'Hardware & Tools', value: 'tools' }
];

export const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const [productForm, setProductForm] = useState<any>({
    title: '',
    category: 'cement',
    brand: '',
    price: 0,
    unit: 'Bag (50kg)',
    moq: 1,
    weight_spec: '50kg Standard',
    image: '/images/cement_aggregates.png',
    grade: '53 Grade',
    weight_kg: 50.0,
    stock_qty: 500
  });

  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProducts({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
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
    fetchProducts();
  }, [categoryFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  function openCreateModal() {
    setProductForm({
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
    setCreateModalOpen(true);
  }

  function openEditModal(prod: any) {
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
    setEditModalOpen(true);
  }

  function openDeleteModal(prod: any) {
    setActiveProductId(prod.id);
    setProductForm(prod);
    setDeleteModalOpen(true);
  }

  async function handleCreateSubmit() {
    setSubmitting(true);
    try {
      await adminApi.createProduct(productForm);
      setCreateModalOpen(false);
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
      setEditModalOpen(false);
      setActionSuccess(`Product specs updated successfully`);
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
      setActionSuccess(`Product removed from catalog`);
      fetchProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
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
              options={CATEGORY_OPTIONS}
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
            onClick={openCreateModal}
            icon={<FaPlus />}
            className="shrink-0"
          >
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Material SKU</th>
                <th className="py-3.5">Category & Brand</th>
                <th className="py-3.5">Technical Specs</th>
                <th className="py-3.5 text-right">Wholesale Rate</th>
                <th className="py-3.5 text-center">MOQ</th>
                <th className="py-3.5 text-right">Stock Level</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
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
                  const isLowStock = p.stockQty < 100;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <FaBoxOpen className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 leading-tight">{p.title}</p>
                            <p className="text-[11px] text-slate-400">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                        <p className="font-medium text-slate-900 mt-1">{p.brand}</p>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        <p className="font-medium">{p.grade || p.weightSpec || 'Standard'}</p>
                        <p className="text-[11px] text-slate-400">{p.weightKg || 50} KG / unit</p>
                      </td>
                      <td className="py-3.5 text-right font-medium text-slate-900">
                        INR {(p.price || 0).toLocaleString('en-IN')}{' '}
                        <span className="text-[11px] font-normal text-slate-500">/ {p.unit}</span>
                      </td>
                      <td className="py-3.5 text-center font-medium text-slate-700">
                        {p.moq || 1}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`font-medium ${
                            isLowStock ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {(p.stockQty || 0).toLocaleString()}
                        </span>
                        {isLowStock && (
                          <span className="block text-[10px] font-medium text-amber-600">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(p)}
                            icon={<FaPen />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => openDeleteModal(p)}
                            icon={<FaTrash />}
                          >
                            Delete
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

        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {products.length} of {totalCount} products
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen || editModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditModalOpen(false);
        }}
        title={createModalOpen ? 'Publish New Material SKU' : 'Update Material Specifications'}
        subtitle="Catalog governance, pricing and inventory levels"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateModalOpen(false);
                setEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submitting}
              onClick={createModalOpen ? handleCreateSubmit : handleEditSubmit}
            >
              {createModalOpen ? 'Create SKU' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Title"
            value={productForm.title}
            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
            placeholder="e.g. UltraTech Super Cement 53 Grade"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Material Category"
              options={CATEGORY_OPTIONS.filter((c) => c.value !== 'all')}
              value={productForm.category}
              onChange={(val) => setProductForm({ ...productForm, category: String(val) })}
            />
            <Input
              label="Manufacturer Brand"
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              placeholder="e.g. UltraTech, Tata Tiscon, Supreme"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Wholesale Rate (INR)"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
            />
            <Input
              label="Unit of Sale"
              value={productForm.unit}
              onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
              placeholder="e.g. Bag (50kg), Piece, Bundle"
            />
            <Input
              label="Minimum Order Qty (MOQ)"
              type="number"
              value={productForm.moq}
              onChange={(e) => setProductForm({ ...productForm, moq: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Grade / Gauge Spec"
              value={productForm.grade}
              onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
              placeholder="e.g. 53 Grade, Fe550D"
            />
            <Input
              label="Weight (KG / Unit)"
              type="number"
              value={productForm.weight_kg}
              onChange={(e) => setProductForm({ ...productForm, weight_kg: Number(e.target.value) })}
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={productForm.stock_qty}
              onChange={(e) => setProductForm({ ...productForm, stock_qty: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Product Image URL"
            value={productForm.image}
            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
            placeholder="/images/cement_aggregates.png"
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Material SKU"
        subtitle={`Remove ${productForm?.title} from platform catalog`}
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
              onClick={handleDeleteSubmit}
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">
          Are you sure you want to delete this product SKU? This will remove it from the catalog and cancel any pending buyer cart selections.
        </p>
      </Modal>
    </div>
  );
};
