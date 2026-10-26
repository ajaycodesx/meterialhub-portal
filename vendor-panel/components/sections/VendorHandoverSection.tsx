'use client';

import React, { useState } from 'react';
import {
  FaTruckFast,
  FaFileInvoice,
  FaPrint,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaWeightHanging,
  FaShieldHalved,
  FaUserTie,
  FaPhone
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface VendorHandoverSectionProps {
  orders: any[];
  onRefresh: () => void;
}

export const VendorHandoverSection: React.FC<VendorHandoverSectionProps> = ({
  orders,
  onRefresh
}) => {
  const [selectedChallan, setSelectedChallan] = useState<any | null>(null);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const handoverOrders = safeOrders.filter((o) =>
    ['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-50 text-[#FF6500]">
            <FaTruckFast className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-900">
              Commercial Yard Dispatch & Vehicle Loading Bay
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Stage materials, verify carrier truck manifests, and hand over consignments to licensed drivers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#FFF7F2] text-[#FF6500]">
            {handoverOrders.filter((o) => o.status === 'ready_for_pickup').length} Staged at Loading Bay
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {handoverOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            <FaTruckFast className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No orders currently staged or dispatched</p>
          </div>
        ) : (
          handoverOrders.map((order) => {
            const totalWeight = order.items?.reduce(
              (acc: number, item: any) => acc + (item.weightKg || 50) * (item.quantity || 1),
              0
            );

            return (
              <div
                key={order.id || order.orderId}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-900">
                      #{(order.id || order.orderId || '').slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        order.status === 'ready_for_pickup'
                          ? 'text-[#FF6500]'
                          : order.status === 'out_for_delivery'
                          ? 'text-[#F5A623]'
                          : 'text-emerald-600'
                      }`}
                    >
                      {order.status === 'ready_for_pickup'
                        ? 'Staged at Bay'
                        : order.status === 'out_for_delivery'
                        ? 'In Transit'
                        : 'Fulfilled'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-800 truncate">
                      {order.buyerName || 'Contractor Project Site'}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <FaLocationDot className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{order.deliveryAddress || 'Site Delivery'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Consignment:</span>
                      <span className="font-medium text-slate-900">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Est. Tonnage:</span>
                      <span className="font-medium text-slate-900">
                        {totalWeight >= 1000
                          ? `${(totalWeight / 1000).toFixed(2)} Tons`
                          : `${totalWeight} kg`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Invoice Total:</span>
                      <span className="font-medium text-emerald-600">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {order.status === 'ready_for_pickup' ? 'Awaiting Truck Arrival' : 'Dispatched with Carrier'}
                  </div>

                  <button
                    onClick={() => setSelectedChallan(order)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaFileInvoice className="h-3 w-3" />
                    <span>Print Challan</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedChallan && (
        <Modal
          isOpen={!!selectedChallan}
          onClose={() => setSelectedChallan(null)}
          title="Consignment Delivery Challan"
          subtitle="Road transport cargo permit and physical handover manifest"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <FaPrint className="mr-1.5 h-3.5 w-3.5" />
                Print Manifest
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedChallan(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white text-xs text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-medium text-slate-900 uppercase">
                  MaterialHub Transport Challan
                </h3>
                <p className="text-slate-500">Document No: MH-DC-{(selectedChallan.id || selectedChallan.orderId || '').slice(0, 8).toUpperCase()}</p>
                <p className="text-slate-500">Dispatch Yard: Seaport-Airport Road, Kakkanad Depot</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900">Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p className="text-slate-500">Status: Commercial Handover</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
              <div>
                <span className="font-medium text-slate-900 block mb-1">Carrier Details:</span>
                <p className="font-medium">Assigned Marketplace Logistics Truck</p>
                <p className="text-slate-500">Vehicle Type: Heavy Commercial Flatbed</p>
                <p className="text-slate-500">Permit: Commercial Goods Carrier KL-07</p>
              </div>
              <div>
                <span className="font-medium text-slate-900 block mb-1">Delivery Destination:</span>
                <p className="font-medium">{selectedChallan.buyerName || 'Project Construction Site'}</p>
                <p className="text-slate-500">{selectedChallan.deliveryAddress || 'Site Delivery'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-medium text-slate-900 block">Manifest Items:</span>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedChallan.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium">{item.title}</td>
                      <td className="py-2 px-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="py-2 px-3 text-right">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        ₹{((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 flex justify-between items-end border-t border-slate-200 text-slate-500 text-[11px]">
              <div>
                <p>Yard Loading Officer: ___________________</p>
                <p className="pt-1">Material Integrity Stamp</p>
              </div>
              <div className="text-right">
                <p>Carrier Driver Signature: ___________________</p>
                <p className="pt-1">Vehicle Loading Bay 2</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
