'use client';

import React, { useState } from 'react';
import {
  FaCoins,
  FaTag,
  FaPlus,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPercent,
  FaCalendarDays,
  FaBoxesStacked,
  FaCheck
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface VendorPricingSectionProps {
  commodityRates: any[];
  deals: any[];
  onProposeDeal: (data: any) => Promise<void>;
  onRefresh: () => void;
}

export const VendorPricingSection: React.FC<VendorPricingSectionProps> = ({
  commodityRates,
  deals,
  onProposeDeal,
  onRefresh
}) => {
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscount, setDealDiscount] = useState<number>(5);
  const [dealCategory, setDealCategory] = useState('cement');
  const [dealOriginalPrice, setDealOriginalPrice] = useState<number>(420);
  const [dealPrice, setDealPrice] = useState<number>(399);
  const [dealEndDate, setDealEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDealSubmit() {
    if (!dealTitle.trim() || dealPrice <= 0) return;
    try {
      setIsSubmitting(true);
      await onProposeDeal({
        title: dealTitle.trim(),
        discountPercent: Number(dealDiscount),
        category: dealCategory,
        originalPrice: Number(dealOriginalPrice),
        dealPrice: Number(dealPrice),
        endDate: dealEndDate || '2026-11-30'
      });
      setShowDealModal(false);
      setDealTitle('');
      setDealDiscount(5);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Regional Commodity Spot Rate Benchmarks
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Daily wholesale exchange indices for Kerala construction materials
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
            Live Central Feed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodityRates.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              <FaCoins className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">Loading regional market spot indices...</p>
            </div>
          ) : (
            commodityRates.map((rate, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {rate.category?.toUpperCase() || 'MATERIAL'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <FaArrowTrendUp className="h-2.5 w-2.5" />
                      +{rate.changePercent || 0.8}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {rate.material || rate.title}
                  </h3>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{(rate.rate || rate.currentPrice || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500"> / {rate.unit || 'unit'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {rate.region || 'Kochi Hub'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Store Promotional Deals
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Promotional bulk tier discounts published to contractors on MaterialHub Buyer Catalog
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowDealModal(true)}
          >
            <FaPlus className="mr-1.5 h-3.5 w-3.5" />
            Propose Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              <FaTag className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No promotional bulk deals currently active</p>
            </div>
          ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-orange-50 text-[#FF6500]">
                      {deal.discountPercent}% Wholesale OFF
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {deal.title}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FaBoxesStacked className="h-3 w-3 text-slate-400" />
                    <span className="capitalize">{deal.category || 'General'} Bulk Tier</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 line-through mr-1.5">
                      ₹{(deal.originalPrice || 420).toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{(deal.dealPrice || 399).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 flex items-center gap-1">
                    <FaCalendarDays className="h-3 w-3 text-slate-400" />
                    <span>Valid: {deal.endDate || 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDealModal && (
        <Modal
          isOpen={showDealModal}
          onClose={() => setShowDealModal(false)}
          title="Publish Store Bulk Material Deal"
          subtitle="Proposed promotions are featured prominently on the contractor Buyer App"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowDealModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                disabled={!dealTitle.trim() || dealPrice <= 0}
                onClick={handleDealSubmit}
              >
                Publish Promotional Deal
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Promotion Title"
              placeholder="e.g., Heavy Project Foundation Cement Bulk Offer"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Discount (%)"
                type="number"
                value={dealDiscount}
                onChange={(e) => setDealDiscount(Number(e.target.value))}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={dealCategory}
                  onChange={(e) => setDealCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#FF6500]"
                >
                  <option value="cement">Cement</option>
                  <option value="steel">TMT Steel</option>
                  <option value="aggregates">Aggregates</option>
                  <option value="bricks">Bricks</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Standard Price (₹)"
                type="number"
                value={dealOriginalPrice}
                onChange={(e) => setDealOriginalPrice(Number(e.target.value))}
                required
              />

              <Input
                label="Promotional Price (₹)"
                type="number"
                value={dealPrice}
                onChange={(e) => setDealPrice(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Valid Until (YYYY-MM-DD)"
              placeholder="2026-11-30"
              value={dealEndDate}
              onChange={(e) => setDealEndDate(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
