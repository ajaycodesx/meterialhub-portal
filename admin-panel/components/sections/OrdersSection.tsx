'use client';

import React, { useState, useEffect } from 'react';
import {
  FaMagnifyingGlass,
  FaBoxesStacked,
  FaTruckFast,
  FaPen,
  FaEye,
  FaCheck,
  FaXmark,
  FaSpinner,
  FaLocationDot,
  FaIndianRupeeSign,
  FaWeightHanging,
  FaCircleCheck
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Packing', value: 'packing' },
  { label: 'Out For Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' }
];

const CHANGE_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Packing', value: 'packing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' }
];

export const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [orderToUpdate, setOrderToUpdate] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('confirmed');
  const [statusReason, setStatusReason] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const [driverModalOpen, setDriverModalOpen] = useState<boolean>(false);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverReason, setDriverReason] = useState<string>('');
  const [assigningDriver, setAssigningDriver] = useState<boolean>(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit
      });
      setOrders(res.orders || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  }

  async function openOrderDetail(orderId: string) {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const detail = await adminApi.getOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  function openStatusModal(order: any) {
    setOrderToUpdate(order);
    setTargetStatus(order.status || 'confirmed');
    setStatusReason('');
    setStatusModalOpen(true);
  }

  async function submitStatusUpdate() {
    if (!orderToUpdate) return;
    setUpdatingStatus(true);
    try {
      await adminApi.updateOrderStatus(orderToUpdate.id, targetStatus, statusReason || undefined);
      setStatusModalOpen(false);
      setActionSuccess(`Order #${orderToUpdate.id} status transitioned to ${targetStatus}`);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function openDriverModal(order: any) {
    setOrderToUpdate(order);
    setSelectedDriverId(order.trip?.driverId || '');
    setDriverReason('');
    setDriverModalOpen(true);
    try {
      const res = await adminApi.getDrivers({ limit: 50 });
      setDriversList(res.drivers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers fleet');
    }
  }

  async function submitDriverReassign() {
    if (!orderToUpdate || !selectedDriverId) return;
    setAssigningDriver(true);
    try {
      await adminApi.reassignDriver(orderToUpdate.id, selectedDriverId, driverReason || undefined);
      setDriverModalOpen(false);
      setActionSuccess(`Driver reassigned for order #${orderToUpdate.id}`);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to assign driver');
    } finally {
      setAssigningDriver(false);
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <Input
            placeholder="Search by Order ID, invoice, site address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<FaMagnifyingGlass />}
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="w-full md:w-56">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(String(val));
              setPage(1);
            }}
            placeholder="Filter by status"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Order ID & Date</th>
                <th className="py-3.5">Contractor</th>
                <th className="py-3.5">Merchant Store</th>
                <th className="py-3.5">Cargo Specs</th>
                <th className="py-3.5 text-right">Grand Total</th>
                <th className="py-3.5 text-center">Payment</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading platform orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-4">
                      <p className="font-bold text-slate-900">#{o.id}</p>
                      <p className="text-[11px] text-slate-400">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{o.buyer?.name || 'Contractor'}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{o.deliveryAddress}</p>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      {o.merchant?.name || 'Store'}
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{o.vehicleRecommended}</p>
                      <p className="text-[11px] text-slate-500">{(o.totalWeightKg || 0).toLocaleString()} KG</p>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      INR {(o.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {o.paymentMode}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOrderDetail(o.id)}
                          icon={<FaEye />}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openStatusModal(o)}
                          icon={<FaPen />}
                        >
                          Status
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDriverModal(o)}
                          icon={<FaTruckFast />}
                        >
                          Driver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {orders.length} of {totalCount} orders
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
            <span className="font-semibold text-slate-700">
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
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedOrder ? `Order Details #${selectedOrder.id}` : 'Order Details'}
        subtitle="Complete wholesale bill of materials and delivery specs"
        maxWidth="xl"
      >
        {loadingDetail || !selectedOrder ? (
          <div className="py-12 text-center text-slate-400">
            <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
            <p>Loading order data...</p>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Invoice Number</p>
                <p className="font-bold text-slate-900">{selectedOrder.invoiceNumber || 'MH-INV-AUTO'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Current Status</p>
                <p className="font-bold text-[#FF6500] uppercase tracking-wider">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Payment Mode</p>
                <p className="font-bold text-slate-900">{selectedOrder.paymentMode}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Order Date</p>
                <p className="font-bold text-slate-900">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contractor & Site</p>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.buyer?.name}</p>
                <p className="text-slate-600 font-medium">{selectedOrder.buyer?.phone}</p>
                <p className="text-slate-500 flex items-start gap-1">
                  <FaLocationDot className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  <span>{selectedOrder.deliveryAddress} (Pincode: {selectedOrder.pincode})</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Merchant Store</p>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.merchant?.name}</p>
                <p className="text-slate-600 font-medium">Owner: {selectedOrder.merchant?.ownerName}</p>
                <p className="text-slate-500">{selectedOrder.merchant?.address}</p>
                <p className="text-slate-500">GSTIN: {selectedOrder.merchant?.gstin || '32AAACH7409R1ZZ'}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-2">Material Line Items</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                    <tr>
                      <th className="py-2.5 pl-3">Material Title</th>
                      <th className="py-2.5 text-center">Quantity</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 pr-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedOrder.items || []).map((it: any) => (
                      <tr key={it.id}>
                        <td className="py-2.5 pl-3 font-medium text-slate-900">{it.title}</td>
                        <td className="py-2.5 text-center font-semibold text-slate-700">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="py-2.5 text-right text-slate-700">
                          INR {it.unitPrice?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-bold text-slate-900">
                          INR {it.subtotal?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>INR {(selectedOrder.itemsTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Direct Site Delivery Fee</span>
                <span>INR {(selectedOrder.deliveryFee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (18%)</span>
                <span>INR {(selectedOrder.gstAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                <span>Grand Total</span>
                <span className="text-[#FF6500]">INR {(selectedOrder.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {selectedOrder.trip && (
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Assigned Delivery Logistics</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p>Driver: <span className="font-semibold text-slate-900">{selectedOrder.trip.driverName}</span> ({selectedOrder.trip.driverPhone})</p>
                  <p>Vehicle: <span className="font-semibold text-slate-900">{selectedOrder.trip.vehicleType}</span> [{selectedOrder.trip.vehicleReg}]</p>
                  <p>Trip Fare: INR {selectedOrder.trip.tripFare}</p>
                  <p>Trip Status: <span className="font-semibold text-emerald-600 uppercase">{selectedOrder.trip.status}</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
        subtitle={`Transition workflow state for order #${orderToUpdate?.id}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updatingStatus}
              onClick={submitStatusUpdate}
            >
              Confirm Update
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Target Status"
            options={CHANGE_STATUS_OPTIONS}
            value={targetStatus}
            onChange={(val) => setTargetStatus(String(val))}
          />
          <Input
            label="Administrative Reason (Audited)"
            placeholder="e.g. Contractor requested expedited site unloading..."
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        title="Assign Commercial Vehicle Driver"
        subtitle={`Dispatch driver for order #${orderToUpdate?.id}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDriverModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={assigningDriver}
              disabled={!selectedDriverId}
              onClick={submitDriverReassign}
            >
              Assign Driver
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Driver from Fleet"
            options={driversList.map((d) => ({
              label: `${d.name} (${d.vehicleType || 'Truck'} - ${d.phone})`,
              value: d.id
            }))}
            value={selectedDriverId}
            onChange={(val) => setSelectedDriverId(String(val))}
            placeholder="Choose an active driver..."
          />
          <Input
            label="Dispatch Note"
            placeholder="e.g. High tonnage cement delivery, crane required"
            value={driverReason}
            onChange={(e) => setDriverReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
