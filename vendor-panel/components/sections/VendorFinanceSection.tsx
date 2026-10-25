'use client';

import React from 'react';
import {
  FaIndianRupeeSign,
  FaBuildingColumns,
  FaShieldHalved,
  FaCircleCheck,
  FaClock,
  FaArrowDown,
  FaReceipt,
  FaFileInvoiceDollar
} from 'react-icons/fa6';
import { Button } from '../ui/Button';

interface VendorFinanceSectionProps {
  settlementData: any;
  onRefresh: () => void;
}

export const VendorFinanceSection: React.FC<VendorFinanceSectionProps> = ({
  settlementData,
  onRefresh
}) => {
  const grossSales = settlementData?.grossSales || 0;
  const platformFees = settlementData?.platformFees || grossSales * 0.05;
  const netEarnings = settlementData?.netEarnings || grossSales * 0.95;
  const walletBalance = settlementData?.walletBalance || netEarnings;
  const bankDetails = settlementData?.bankDetails || {
    bankName: 'HDFC Bank',
    accountNumberMasked: '•••• •••• •••• 4892',
    ifsc: 'HDFC0001244',
    holderName: 'Kakkanad Building Supplies',
    payoutCycle: 'T+1 Automatic Escrow Clearance'
  };
  const orders = settlementData?.recentSettlements || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Sales Captured
            </span>
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600">
              <FaReceipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{grossSales.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Total contractor payments</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform Take Rate (5%)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <FaFileInvoiceDollar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{platformFees.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">MaterialHub service fee</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Merchant Earnings
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FaIndianRupeeSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            ₹{netEarnings.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">95% authoritative payout</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settlement Wallet
            </span>
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6500]">
              <FaShieldHalved className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FF6500] tracking-tight">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Protected escrow balance</span>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <FaBuildingColumns className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Verified Commercial Bank Payout Destination
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Direct NEFT / RTGS automatic payout beneficiary registered for wholesale clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <FaCircleCheck className="h-3 w-3" />
              Verified Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">Beneficiary Bank</span>
            <span className="font-bold text-slate-900 text-sm">{bankDetails.bankName}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">Account Number</span>
            <span className="font-bold text-slate-900 text-sm tracking-wider">
              {bankDetails.accountNumberMasked}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">IFSC Routing Code</span>
            <span className="font-bold text-slate-900 text-sm">{bankDetails.ifsc}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">Settlement Cycle</span>
            <span className="font-bold text-emerald-600 text-sm">{bankDetails.payoutCycle}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Order Settlement Clearance Ledger
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Itemized financial breakdown of delivered orders, platform fee deductions, and released disbursements
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Buyer Site Destination</th>
                <th className="py-3 px-4 text-right">Gross Total</th>
                <th className="py-3 px-4 text-right">Platform Fee (5%)</th>
                <th className="py-3 px-4 text-right">Net Merchant Payout</th>
                <th className="py-3 px-4 text-center">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FaIndianRupeeSign className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No order settlement records available</p>
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => {
                  const gross = o.grossAmount || o.totalAmount || 0;
                  const fee = o.platformFee || gross * 0.05;
                  const net = o.netAmount || gross * 0.95;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">
                        {o.buyerName || 'Contractor Site Delivery'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        ₹{gross.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                        -₹{fee.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        ₹{net.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg">
                          Settled to Bank
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
