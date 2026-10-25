'use client';

import React from 'react';
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMinus
} from 'react-icons/fa6';
import { CommodityRate } from '../../types/buyer';

interface CommodityTickerProps {
  rates: CommodityRate[];
}

export const CommodityTicker: React.FC<CommodityTickerProps> = ({ rates }) => {
  const defaultItems = [
    { name: 'UltraTech Cement', rate: '1.10', change: '0.640%', trend: 'up' },
    { name: 'TMT Steel', rate: '33.25', change: '0.046%', trend: 'up' },
    { name: 'PVC Pipes tement', rate: '3.10', change: '0.052%', trend: 'down' },
    { name: 'PVC Pipes', rate: '22.50', change: '0.232%', trend: 'up' },
    { name: 'UltraTech Cement', rate: '10', change: '0.335%', trend: 'down' },
    { name: 'Cement', rate: '27.30', change: '0.87%', trend: 'down' },
    { name: 'TMT Steel Fe550D', rate: '58.50', change: '0.420%', trend: 'up' },
  ];

  const itemsToDisplay = rates && rates.length > 0
    ? rates.map((r) => ({
        name: r.materialName,
        rate: r.wholesaleRate >= 1000 ? (r.wholesaleRate / 1000).toFixed(2) : String(r.wholesaleRate),
        change: `${r.changePercent}%`,
        trend: r.trend,
      }))
    : defaultItems;

  const marqueeItems = [...itemsToDisplay, ...itemsToDisplay, ...itemsToDisplay];

  return (
    <div className="relative z-20 w-full bg-[#0B1120] text-white overflow-hidden shadow-xs flex items-center h-8 sm:h-9 border-t border-slate-800/80">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center h-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0B1120] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0B1120] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center whitespace-nowrap">
          {marqueeItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                const el = document.getElementById('wholesale-rates');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-normal px-4 border-r border-slate-800 hover:text-[#FF6500] transition-colors cursor-pointer shrink-0"
            >
              <span className="text-slate-200 font-medium">{item.name}</span>
              <span className="text-slate-300 font-normal">{item.rate}</span>

              {item.trend === 'up' && (
                <span className="inline-flex items-center gap-1 text-[#34D399] font-medium text-xs">
                  <FaArrowTrendUp className="h-2 w-2" />
                  +{item.change}
                </span>
              )}
              {item.trend === 'down' && (
                <span className="inline-flex items-center gap-1 text-[#FB923C] font-medium text-xs">
                  <FaArrowTrendDown className="h-2 w-2" />
                  -{item.change}
                </span>
              )}
              {item.trend === 'stable' && (
                <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                  <FaMinus className="h-1.5 w-1.5" />
                  0.0%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
