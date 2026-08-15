'use client';

import React from 'react';
import { 
  FaFire, 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaMinus, 
  FaRotateRight 
} from 'react-icons/fa6';
import { CommodityRate } from '../../types/buyer';

interface CommodityTickerProps {
  rates: CommodityRate[];
}

export const CommodityTicker: React.FC<CommodityTickerProps> = ({ rates }) => {
  const marqueeItems = [...rates, ...rates, ...rates];

  return (
    <div className="w-full bg-slate-900 text-white py-1.5 overflow-hidden shadow-xs flex items-center h-10 sm:h-12 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 w-full h-full">
        <div className="shrink-0 flex items-center gap-1.5 bg-[#FF6500] px-2.5 sm:px-4 rounded-full text-white font-semibold text-[10px] sm:text-xs z-10 shadow-xs h-7 sm:h-8">
          <FaFire className="h-3 w-3 animate-bounce text-white" />
          <span className="uppercase tracking-wider font-semibold hidden sm:inline">Wholesale Rates</span>
          <span className="uppercase tracking-wider font-semibold sm:hidden">Rates</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full relative flex items-center h-full">
          {/* Smooth curved gradient edge fades at start and end of marquee */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-4 sm:gap-6">
            {marqueeItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-2.5 text-xs font-medium px-4 rounded-full bg-slate-800/90 border border-slate-700/80 hover:bg-slate-700 transition-colors cursor-pointer shrink-0 h-8"
              >
                <span className="text-slate-300 font-normal">{item.materialName}:</span>
                <span className="text-white font-semibold">₹{item.wholesaleRate.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400">/{item.unit}</span>

                {item.trend === 'up' && (
                  <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px] bg-red-950/70 px-2 py-0.5 rounded-full border border-red-800/40">
                    <FaArrowTrendUp className="h-2.5 w-2.5" />
                    +{item.changePercent}%
                  </span>
                )}
                {item.trend === 'down' && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <FaArrowTrendDown className="h-2.5 w-2.5" />
                    -{item.changePercent}%
                  </span>
                )}
                {item.trend === 'stable' && (
                  <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-normal">
                    <FaMinus className="h-2 w-2" />
                    0.0%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-800/90 px-3.5 rounded-full border border-slate-700/80 h-8">
          <FaRotateRight className="h-3 w-3 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-[11px] font-semibold text-slate-300">Live Rates</span>
        </div>
      </div>
    </div>
  );
};
