'use client';

import React from 'react';
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChevronRight,
  FaFireFlameCurved
} from 'react-icons/fa6';
import { MaterialCategory } from '../../types/buyer';

interface CategoriesGridProps {
  categories: MaterialCategory[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <section className="py-6 sm:py-12 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#FF6500] uppercase tracking-wider mb-0.5">
              <FaBoxesStacked className="h-3 w-3" />
              <span>Direct Wholesale Materials</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Explore Material Categories
            </h2>
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-[11px] sm:text-xs font-semibold text-slate-800 transition-all h-8 sm:h-10 shrink-0 cursor-pointer"
          >
            <span>View All</span>
            <FaChevronRight className="h-2.5 w-2.5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? 'shadow-lg ring-2 ring-[#FF6500] border-[#FF6500]'
                    : 'bg-white shadow-xs hover:shadow-md border-slate-200/80 hover:border-orange-200'
                }`}
              >
                <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-slate-200">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />

                  {cat.trendingBadge && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white text-[#FF6500] shadow-xs">
                      <FaFireFlameCurved className="h-2.5 w-2.5" />
                      <span className="hidden sm:inline">{cat.trendingBadge}</span>
                      <span className="sm:hidden">Hot</span>
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                    <h3 className="font-semibold text-sm sm:text-xl text-white mb-0.5 sm:mb-1 leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-white/80 font-normal leading-tight line-clamp-1 hidden sm:block">
                      {cat.subtitle}
                    </p>

                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-medium backdrop-blur-xs">
                        {cat.itemCount}+ Items
                      </span>
                      
                      <span className="h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-[#FF6500] flex items-center justify-center shrink-0 group-hover:bg-[#E05800] transition-colors">
                        <FaArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
