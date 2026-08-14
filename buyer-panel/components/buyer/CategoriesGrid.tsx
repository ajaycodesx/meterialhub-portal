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
    <section className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6500] uppercase tracking-wider mb-2">
              <FaBoxesStacked className="h-3.5 w-3.5" />
              <span>Direct Wholesale Materials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Explore Material Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Verified inventory from local hardware merchants available within 20–25 KM
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 shrink-0 cursor-pointer"
          >
            <span>View All Categories</span>
            <FaChevronRight className="h-2.5 w-2.5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'shadow-xl ring-2 ring-[#FF6500]/70'
                    : 'shadow-sm hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-200">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />

                  {cat.trendingBadge && (
                    <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#FF6500] shadow-sm">
                      <FaFireFlameCurved className="h-2.5 w-2.5" />
                      {cat.trendingBadge}
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="font-semibold text-xl text-white mb-1 leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-white/70 font-normal leading-relaxed line-clamp-1">
                      {cat.subtitle}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-sm">
                        {cat.itemCount}+ Verified Items
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group-hover:gap-2.5 ${
                        isSelected ? 'text-orange-400' : 'text-white'
                      }`}>
                        Browse
                        <span className="h-6 w-6 rounded-full bg-[#FF6500] flex items-center justify-center shrink-0 group-hover:bg-[#E05800] transition-colors">
                          <FaArrowRight className="h-2.5 w-2.5 text-white" />
                        </span>
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
