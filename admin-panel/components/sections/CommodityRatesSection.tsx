'use client';

import React, { useState, useEffect } from 'react';
import {
  FaCoins,
  FaPen,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaIndianRupeeSign
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

const TREND_OPTIONS: SelectOption[] = [
  { label: 'Stable', value: 'stable' },
  { label: 'Bullish (Upward)', value: 'up' },
  { label: 'Bearish (Downward)', value: 'down' }
];

export const CommodityRatesSection: React.FC = () => {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeRate, setActiveRate] = useState<any | null>(null);
  const [newRate, setNewRate] = useState<number>(0);
  const [trend, setTrend] = useState<string>('stable');
  const [changePercent, setChangePercent] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchRates() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCommodityRates();
      setRates(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load commodity rates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
  }, []);

  function openEditModal(rate: any) {
    setActiveRate(rate);
    setNewRate(rate.wholesaleRate || rate.rate || 0);
    setTrend(rate.trend || 'stable');
    setChangePercent(rate.changePercent || 0);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!activeRate) return;
    setSubmitting(true);
    try {
      await adminApi.updateCommodityRate({
        id: activeRate.id,
        wholesale_rate: newRate,
        trend,
        change_percent: changePercent
      });
      setModalOpen(false);
      setActionSuccess(`Wholesale spot rate updated for ${activeRate.material}`);
      fetchRates();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update commodity rate');
    } finally {
      setSubmitting(false);
    }
  }

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

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Wholesale Spot Commodity Rate Governance</h2>
          <p className="text-xs text-slate-500">Benchmark daily pricing index broadcast to buyers and yard merchants</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4">Commodity Material</th>
                <th className="py-3.5">Unit of Trade</th>
                <th className="py-3.5 text-right">Current Wholesale Spot</th>
                <th className="py-3.5 text-right">Previous Benchmark</th>
                <th className="py-3.5 text-center">Market Trend</th>
                <th className="py-3.5">Telemetry Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && rates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaSpinner className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6500]" />
                    <p className="font-medium">Loading commodity spot index...</p>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No commodity rates indexed.
                  </td>
                </tr>
              ) : (
                rates.map((r) => {
                  const rateVal = r.wholesaleRate || r.rate || 0;
                  const prevVal = r.prevRate || rateVal;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-4">
                        <p className="font-bold text-slate-900">{r.material}</p>
                        <p className="text-[11px] text-slate-400">Commodity ID: {r.id}</p>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">
                        {r.unit}
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-900 text-sm">
                        INR {rateVal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right font-medium text-slate-500">
                        INR {prevVal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-center">
                        {r.trend === 'up' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FaArrowTrendUp className="h-2.5 w-2.5 text-emerald-600" /> +{r.changePercent || 0}%
                          </span>
                        ) : r.trend === 'down' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <FaArrowTrendDown className="h-2.5 w-2.5 text-rose-600" /> -{r.changePercent || 0}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Stable Index
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-500 text-[11px]">
                        {r.lastUpdated || 'Synchronized Today'}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(r)}
                          icon={<FaPen />}
                        >
                          Update Rate
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Wholesale Spot Rate"
        subtitle={`Adjust daily market index for ${activeRate?.material}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit}>
              Publish Rate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label={`New Spot Rate (INR / ${activeRate?.unit || 'Unit'})`}
            type="number"
            value={newRate}
            onChange={(e) => setNewRate(Number(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Market Trend"
              options={TREND_OPTIONS}
              value={trend}
              onChange={(val) => setTrend(String(val))}
            />
            <Input
              label="Change Percent (%)"
              type="number"
              step="0.1"
              value={changePercent}
              onChange={(e) => setChangePercent(Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
