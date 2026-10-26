'use client';

import React, { useState } from 'react';
import {
  FaWarehouse,
  FaArrowsRotate,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaCircleCheck,
  FaClipboardList
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface VendorStockSectionProps {
  products: any[];
  onAdjustStock: (productId: string, adjustmentQty: number, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export const VendorStockSection: React.FC<VendorStockSectionProps> = ({
  products,
  onAdjustStock,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingProduct, setAdjustingProduct] = useState<any | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState(
    'Physical yard shipment arrival from manufacturer'
  );
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeProducts = Array.isArray(products) ? products : [];
  const totalStockUnits = safeProducts.reduce(
    (acc, p) => acc + (p.stockQty ?? p.stock ?? 0),
    0
  );
  const lowStockCount = safeProducts.filter(
    (p) => (p.stockQty ?? p.stock ?? 0) <= (p.reorderThreshold ?? 10)
  ).length;

  const filteredProducts = safeProducts.filter((p) => {
    const title = p.title || '';
    const sku = p.sku || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());
  });

  async function handleAdjustSubmit() {
    if (!adjustingProduct || adjustmentQty === 0) return;
    const finalReason =
      adjustmentReason === 'Other custom reason'
        ? customReason.trim()
        : adjustmentReason;

    if (!finalReason) return;

    try {
      setIsSubmitting(true);
      await onAdjustStock(adjustingProduct.id, adjustmentQty, finalReason);
      setAdjustingProduct(null);
      setAdjustmentQty(0);
      setCustomReason('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Yard Inventory
            </span>
            <div className="text-2xl font-medium text-slate-900 mt-1">
              {totalStockUnits.toLocaleString('en-IN')} units
            </div>
            <span className="text-xs text-slate-500">Across {products.length} material SKUs</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[#FF6500]">
            <FaWarehouse className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Healthy SKUs
            </span>
            <div className="text-2xl font-medium text-emerald-600 mt-1">
              {products.length - lowStockCount} SKUs
            </div>
            <span className="text-xs text-slate-500">Above reorder safety thresholds</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600">
            <FaCircleCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Critical Reorder Alerts
            </span>
            <div className="text-2xl font-medium text-rose-600 mt-1">
              {lowStockCount} SKUs
            </div>
            <span className="text-xs text-slate-500">Immediate depot restocking required</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-rose-600">
            <FaTriangleExclamation className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search material SKU or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaMagnifyingGlass className="h-4 w-4 text-slate-400" />}
          />
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={<FaArrowsRotate className="h-3.5 w-3.5" />}
          iconPosition="left"
          onClick={onRefresh}
          className="shrink-0"
        >
          Sync Depot Ledger
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Material SKU & Title</th>
                <th className="py-3 px-4">Physical Stock</th>
                <th className="py-3 px-4">Reserved (Orders)</th>
                <th className="py-3 px-4">Available for Sale</th>
                <th className="py-3 px-4">Safety Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Stock Ledger Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaWarehouse className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No inventory records matching criteria</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stockQty ?? p.stock ?? 0;
                  const threshold = p.reorderThreshold ?? 10;
                  const isLow = stock <= threshold;
                  const isOut = stock === 0;

                  return (
                    <tr key={p.id || p.productId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>SKU: {p.sku || (p.id || p.productId || '').slice(0, 8)}</span>
                          <span className="h-2 w-px bg-slate-300 inline-block" />
                          <span>Unit: {p.unit || 'Bag'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {stock} {p.unit || 'units'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        0 {p.unit || 'units'}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-emerald-600">
                        {stock} {p.unit || 'units'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {threshold} {p.unit || 'units'}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="text-xs font-medium text-rose-600">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="text-xs font-medium text-amber-600">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600">
                            Optimal Level
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<FaClipboardList className="h-3 w-3" />}
                          iconPosition="left"
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustmentQty(0);
                            setAdjustmentReason('Physical yard shipment arrival from manufacturer');
                            setCustomReason('');
                          }}
                          className="shrink-0"
                        >
                          Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustingProduct && (
        <Modal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          title={`Stock Adjustment: ${adjustingProduct.title}`}
          subtitle="Record physical yard arrival, damaged materials discard, or cycle count correction"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setAdjustingProduct(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                disabled={adjustmentQty === 0}
                onClick={handleAdjustSubmit}
              >
                Apply Adjustment
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="text-slate-500">Current Depot Stock: </span>
                <span className="font-medium text-slate-900">
                  {adjustingProduct.stockQty ?? adjustingProduct.stock ?? 0} {adjustingProduct.unit || 'units'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Updated Balance: </span>
                <span className="font-medium text-[#FF6500]">
                  {(adjustingProduct.stockQty ?? adjustingProduct.stock ?? 0) + adjustmentQty} {adjustingProduct.unit || 'units'}
                </span>
              </div>
            </div>

            <Input
              label="Adjustment Quantity (Use positive for arrivals, negative for discards)"
              type="number"
              placeholder="+100 or -5"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(Number(e.target.value))}
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mandatory Operational Reason
              </label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#FF6500]"
              >
                <option value="Physical yard shipment arrival from manufacturer">
                  Physical yard shipment arrival from manufacturer
                </option>
                <option value="Damaged / torn bags discarded during handling">
                  Damaged / torn bags discarded during handling
                </option>
                <option value="Periodic cycle count physical audit correction">
                  Periodic cycle count physical audit correction
                </option>
                <option value="Contractor site return accepted">
                  Contractor site return accepted
                </option>
                <option value="Other custom reason">Other custom reason</option>
              </select>
            </div>

            {adjustmentReason === 'Other custom reason' && (
              <Input
                label="Custom Reason Description"
                placeholder="Specify reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
