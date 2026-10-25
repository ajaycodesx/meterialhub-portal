'use client';

import React, { useState } from 'react';
import {
  FaBoxesStacked,
  FaMagnifyingGlass,
  FaClock,
  FaTruckFast,
  FaCheck,
  FaXmark,
  FaEye,
  FaFileInvoice,
  FaIndianRupeeSign,
  FaWeightHanging,
  FaLocationDot,
  FaTriangleExclamation,
  FaPrint
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface VendorOrdersSectionProps {
  orders: any[];
  onPackOrder: (orderId: string) => Promise<void>;
  onRejectOrder: (orderId: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export const VendorOrdersSection: React.FC<VendorOrdersSectionProps> = ({
  orders,
  onPackOrder,
  onRejectOrder,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState<any | null>(null);

  const statusOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'Awaiting Action', value: 'confirmed' },
    { label: 'Packing', value: 'packing' },
    { label: 'Ready for Pickup', value: 'ready_for_pickup' },
    { label: 'In Transit', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.buyerName && o.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handlePackConfirm(orderId: string) {
    try {
      setIsActionLoading(true);
      await onPackOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: 'ready_for_pickup' }));
      }
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectModalOrder || !rejectReason.trim()) return;
    try {
      setIsActionLoading(true);
      await onRejectOrder(rejectModalOrder.id, rejectReason.trim());
      setRejectModalOrder(null);
      setRejectReason('');
      if (selectedOrder?.id === rejectModalOrder.id) {
        setSelectedOrder(null);
      }
    } finally {
      setIsActionLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const s = status?.toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg">
          Awaiting Action
        </span>
      );
    }
    if (s === 'packing') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-lg">
          Depot Packing
        </span>
      );
    }
    if (s === 'ready_for_pickup') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-lg">
          Ready for Pickup
        </span>
      );
    }
    if (s === 'out_for_delivery') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-lg">
          Out for Delivery
        </span>
      );
    }
    if (s === 'delivered') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg">
          Fulfilled
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-lg">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by order #, site, buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaMagnifyingGlass className="h-4 w-4 text-slate-400" />}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Buyer & Site Destination</th>
                <th className="py-3 px-4">SKUs / Items</th>
                <th className="py-3 px-4">Est. Weight</th>
                <th className="py-3 px-4">Gross Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaBoxesStacked className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No orders found matching criteria</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsCount = order.items?.length || 0;
                  const totalWeightKg = order.items?.reduce(
                    (acc: number, item: any) => acc + (item.weightKg || 50) * (item.quantity || 1),
                    0
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {order.buyerName || 'Contractor Project Site'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <FaLocationDot className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{order.deliveryAddress || 'Kakkanad Site'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">
                          {itemsCount} {itemsCount === 1 ? 'material' : 'materials'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {totalWeightKg >= 1000
                            ? `${(totalWeightKg / 1000).toFixed(2)} Tons`
                            : `${totalWeightKg} kg`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Inspect Pick List & Details"
                          >
                            <FaEye className="h-3.5 w-3.5" />
                          </button>

                          {(order.status === 'confirmed' || order.status === 'packing') && (
                            <>
                              <button
                                onClick={() => handlePackConfirm(order.id)}
                                disabled={isActionLoading}
                                className="px-3 py-1.5 rounded-xl bg-[#FF6500] hover:bg-orange-600 text-white font-semibold transition-colors cursor-pointer"
                              >
                                Pack & Ready
                              </button>

                              <button
                                onClick={() => {
                                  setRejectModalOrder(order);
                                  setRejectReason('');
                                }}
                                disabled={isActionLoading}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="Reject Order"
                              >
                                <FaXmark className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {(order.status === 'ready_for_pickup' ||
                            order.status === 'out_for_delivery' ||
                            order.status === 'delivered') && (
                            <button
                              onClick={() => setShowChallanModal(order)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FaFileInvoice className="h-3 w-3" />
                              <span>Challan</span>
                            </button>
                          )}
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

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`}
          subtitle="Contractor pick list, site specifications, and dispatch authorization"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div>
                {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'packing') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectModalOrder(selectedOrder);
                      setRejectReason('');
                    }}
                  >
                    Reject Order
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>

                {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'packing') && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isActionLoading}
                    onClick={() => handlePackConfirm(selectedOrder.id)}
                  >
                    Confirm Packing & Mark Ready
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Delivery Destination</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {selectedOrder.deliveryAddress || 'Project Construction Site, Kakkanad, Kochi'}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <span>Buyer: {selectedOrder.buyerName || 'Registered Contractor'}</span>
                <span className="h-2 w-px bg-slate-300 inline-block" />
                <span>Contact: {selectedOrder.buyerPhone || '+91 98470 12345'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Pick List Items ({selectedOrder.items?.length || 0})
              </h3>
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3">Material SKU / Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-400">SKU: {item.sku || `MAT-${idx + 1}`}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 font-medium">Payment Mode: </span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.paymentMethod || 'Razorpay Escrow (Paid)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Order Total: </span>
                <span className="text-sm font-bold text-emerald-600">
                  ₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {rejectModalOrder && (
        <Modal
          isOpen={!!rejectModalOrder}
          onClose={() => setRejectModalOrder(null)}
          title="Reject Order Confirmation"
          subtitle="Rejection triggers buyer notification and releases platform escrow hold"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setRejectModalOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isActionLoading}
                disabled={!rejectReason.trim()}
                onClick={handleRejectSubmit}
              >
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 font-medium">
              Specify the commercial or stock reason for rejecting Order #
              {rejectModalOrder.id.slice(0, 8).toUpperCase()}:
            </p>
            <Input
              label="Rejection Reason"
              placeholder="e.g., Depot out of stock of 12mm TMT bars, loading bay outage"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}

      {showChallanModal && (
        <Modal
          isOpen={!!showChallanModal}
          onClose={() => setShowChallanModal(null)}
          title="Delivery Challan & Dispatch Bill"
          subtitle="Official commercial transit manifest for commercial road transport"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <FaPrint className="mr-1.5 h-3.5 w-3.5" />
                Print Challan
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowChallanModal(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white text-xs text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase">MaterialHub Delivery Challan</h2>
                <p className="text-slate-500 font-medium">Rule 55, CGST Rules 2017 Transit Document</p>
                <p className="text-slate-500">Challan Ref: MH-DC-{showChallanModal.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">Date: </span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Consignor (Merchant Depot):</span>
                <p className="font-medium">Kakkanad Building Supplies</p>
                <p className="text-slate-500">GSTIN: 32AABCU9603R1ZX</p>
                <p className="text-slate-500">Seaport-Airport Road, Kakkanad, Kochi</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Consignee (Project Site):</span>
                <p className="font-medium">{showChallanModal.buyerName || 'Contractor Delivery Site'}</p>
                <p className="text-slate-500">{showChallanModal.deliveryAddress || 'Site Delivery'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Consignment Material Manifest:</span>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {showChallanModal.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium">{item.title}</td>
                      <td className="py-2 px-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="py-2 px-3 text-right">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold">
                        ₹{((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 flex justify-between items-end border-t border-slate-200 text-slate-500 text-[11px]">
              <div>
                <p>Authorized Dispatch Officer: ___________________</p>
                <p className="pt-1">Yard Security Gate Stamp</p>
              </div>
              <div className="text-right">
                <p>Receiver's Signature: ___________________</p>
                <p className="pt-1">Site Unloading Supervisor</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
