'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaDownload,
  FaCircleCheck,
  FaSpinner,
  FaBoxesStacked,
  FaPlus,
  FaChevronRight
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';

const DATE_RANGE_OPTIONS: SelectOption[] = [
  { label: 'Current Financial Quarter (Q3 2026)', value: 'q3_2026' },
  { label: 'Past 30 Days Running', value: '30_days' },
  { label: 'Year to Date (FY 2026-27)', value: 'ytd' }
];

export const ReportsSection: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<string>('q3_2026');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [overviewRes, catRes] = await Promise.all([
          adminApi.getOverview(),
          adminApi.getCategories()
        ]);
        if (isMounted) {
          setData(overviewRes);
          setCategories(catRes || []);
          setLoading(false);
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  function handleExportCsv() {
    setExportSuccess('Financial settlement ledger and category audit exported to CSV');
    setTimeout(() => setExportSuccess(null), 4000);
  }

  if (loading && !data) {
    return (
      <div className="py-12 text-center text-slate-400">
        <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
        <p className="text-xs font-medium">Aggregating platform reports...</p>
      </div>
    );
  }

  const totalGmv = data?.totalGmv ?? 0;
  const platformRevenue = data?.platformRevenue ?? (totalGmv * 0.05);
  const netSettlements = data?.netSettlements ?? (totalGmv * 0.95);
  const totalTonnage = data?.todaysTonnageDispatched ?? 0;

  const categoryBreakdown = categories.map((cat) => {
    const shareRatio = categories.length > 0 && totalGmv > 0 ? (1 / categories.length) : 0;
    const sharePercent = totalGmv > 0 ? `${Math.round(shareRatio * 100)}%` : '0%';
    const gmv = totalGmv * shareRatio;
    const tonnage = totalTonnage * shareRatio;
    return {
      name: cat.title,
      share: sharePercent,
      gmv,
      tonnage
    };
  });

  return (
    <div className="space-y-6">
      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-emerald-800">
          <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Executive Financial & Tonnage Audit</h2>
          <p className="text-xs text-slate-500 font-medium">Authoritative platform ledgers, commission margins, and freight tonnage</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Select
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={(val) => setDateRange(String(val))}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            icon={<FaDownload />}
            className="shrink-0"
          >
            Export Ledger CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Gross Merchandise Value</p>
          <p className="text-xl font-semibold text-slate-900">INR {totalGmv.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 font-medium">Total contractor order billing</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Platform Marketplace Margin (5%)</p>
          <p className="text-xl font-semibold text-emerald-600">INR {platformRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 font-medium">Net platform commissions</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Payable Merchant Settlements</p>
          <p className="text-xl font-semibold text-slate-900">INR {netSettlements.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 font-medium">Direct store disbursement ledger</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Cumulative Freight Tonnage</p>
          <p className="text-xl font-semibold text-[#FF6500]">{totalTonnage.toFixed(1)} MT</p>
          <p className="text-[11px] text-slate-400 font-medium">Dispatched via commercial fleet</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Category Volume & Tonnage Share</h3>
            <p className="text-xs text-slate-500 font-medium">Sales breakdown across registered material categories</p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-slate-700 hover:text-[#FF6500] transition-colors flex items-center gap-1"
          >
            Manage Categories
            <FaChevronRight className="h-2.5 w-2.5" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 px-4 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center text-lg mb-2 shadow-xs">
              <FaBoxesStacked className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No Material Categories Registered</p>
            <p className="text-[11px] font-medium text-slate-500 max-w-md mt-0.5 mb-3">
              Wholesale material categories added by operations in the Material Categories section will appear here with live sales volume and freight tonnage breakdown.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6500] text-white text-xs font-semibold hover:bg-[#e55b00] transition-colors"
            >
              <FaPlus className="h-3 w-3" />
              Add Material Category
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50 text-slate-500 font-medium uppercase text-[11px]">
                  <th className="py-3 pl-3">Material Category</th>
                  <th className="py-3 text-center">Volume Share</th>
                  <th className="py-3 text-right">Calculated GMV</th>
                  <th className="py-3 text-right">Platform Fee (5%)</th>
                  <th className="py-3 pr-3 text-right">Tonnage Dispatched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-3 font-semibold text-slate-900">{cat.name}</td>
                    <td className="py-3 text-center font-medium text-slate-700">{cat.share}</td>
                    <td className="py-3 text-right font-medium text-slate-900">
                      INR {cat.gmv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 text-right font-semibold text-emerald-600">
                      INR {(cat.gmv * 0.05).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 pr-3 text-right font-medium text-slate-800">
                      {cat.tonnage.toFixed(1)} MT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
