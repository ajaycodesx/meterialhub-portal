'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChevronRight,
  FaFireFlameCurved,
  FaCircleCheck,
  FaTag,
  FaLayerGroup,
  FaStore
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
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedCategory && selectedCategory !== 'all' ? selectedCategory : categories[0]?.id || 'cement'
  );

  const activeCategory = categories.find((c) => c.id === internalSelectedId) || categories[0];

  const handleCategoryClick = (catId: string) => {
    setInternalSelectedId(catId);
    onSelectCategory(catId);
  };

  return (
    <section className="py-4 sm:py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#FF6500] uppercase tracking-wider mb-0.5">
              <FaBoxesStacked className="h-3 w-3" />
              <span>Direct Wholesale Materials</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Explore Material Categories
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Select a category on the left to view its sub-types, top brands, and matching merchant stock
            </p>
          </div>

          <button
            onClick={() => {
              setInternalSelectedId('all');
              onSelectCategory('all');
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-[11px] sm:text-xs font-semibold text-slate-800 transition-all h-8 sm:h-10 shrink-0 cursor-pointer"
          >
            <span>View All Suppliers</span>
            <FaChevronRight className="h-2.5 w-2.5 text-slate-500" />
          </button>
        </div>

        {/* Mobile View: Horizontal Scrollable Category Bar + Detail Card */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = cat.id === internalSelectedId;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="h-6 w-6 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                  </div>
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Category Active Detail Panel */}
          {activeCategory && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
              <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900 group">
                <img src={activeCategory.image} alt={activeCategory.title} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-white">{activeCategory.title}</h3>
                    <p className="text-[10px] text-white/80 font-normal">{activeCategory.subtitle}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {activeCategory.itemCount}+ Items
                  </span>
                </div>
              </div>

              {activeCategory.subcategories && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FaLayerGroup className="h-2.5 w-2.5 text-[#FF6500]" />
                    Sub-Categories &amp; Grades
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.subcategories.map((sub, idx) => (
                      <Link
                        key={idx}
                        href="/catalog"
                        className="px-2.5 py-1 rounded-xl bg-orange-50/80 border border-orange-100 text-[#FF6500] text-xs font-semibold flex items-center gap-1 hover:bg-orange-100 transition-colors"
                      >
                        <FaCircleCheck className="h-2.5 w-2.5" />
                        <span>{sub}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory.featuredBrands && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <FaTag className="h-2.5 w-2.5 text-slate-500" />
                    Top Stocked Brands
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {activeCategory.featuredBrands.map((brand, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/catalog"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <span>Browse All {activeCategory.title} Products</span>
                <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Split View: Left Categories List + Right Interactive Detail Display */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Category Selection Tabs */}
          <div className="col-span-4 space-y-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 pb-1">
              Select Material Category
            </div>
            
            {categories.map((cat) => {
              const isSelected = cat.id === internalSelectedId;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group rounded-2xl p-3.5 transition-all cursor-pointer border flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#FF6500] shadow-md ring-2 ring-[#FF6500]/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60">
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${isSelected ? 'text-[#FF6500]' : 'text-slate-900'}`}>
                          {cat.title}
                        </h3>
                        {cat.trendingBadge && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6500] text-[9px] font-bold">
                            {cat.trendingBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {cat.itemCount}+
                    </span>
                    <FaChevronRight className={`h-3 w-3 transition-transform ${isSelected ? 'text-[#FF6500] translate-x-1' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Interactive Selected Category Subcategory & Stock Detail Panel */}
          <div className="col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            {activeCategory && (
              <>
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 group">
                  <img
                    src={activeCategory.image}
                    alt={activeCategory.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />

                  {activeCategory.trendingBadge && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#FF6500] shadow-sm">
                      <FaFireFlameCurved className="h-3 w-3" />
                      {activeCategory.trendingBadge}
                    </span>
                  )}

                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <h3 className="font-semibold text-2xl text-white tracking-tight">
                        {activeCategory.title}
                      </h3>
                      <p className="text-xs text-white/80 font-normal mt-0.5">
                        {activeCategory.subtitle}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20">
                      {activeCategory.itemCount}+ Verified Items
                    </span>
                  </div>
                </div>

                {/* Subcategories Grid */}
                {activeCategory.subcategories && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FaLayerGroup className="h-3.5 w-3.5 text-[#FF6500]" />
                      Sub-Categories &amp; Technical Grades Available
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {activeCategory.subcategories.map((sub, idx) => (
                        <Link
                          key={idx}
                          href="/catalog"
                          className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 hover:border-orange-300 text-slate-800 text-xs font-semibold flex items-center justify-between group transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="group-hover:text-[#FF6500] transition-colors">{sub}</span>
                          </span>
                          <FaArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[#FF6500] group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Stocked Brands */}
                {activeCategory.featuredBrands && (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <FaTag className="h-3 w-3 text-slate-400" />
                      Featured Factory Brands Stocked in Nearby Hubs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory.featuredBrands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Action Bar */}
                <div className="pt-3 flex items-center justify-between gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
                    <FaStore className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Matching local merchant stock ready within 25 KM</span>
                  </div>

                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Browse All {activeCategory.title} Inventory ({activeCategory.itemCount}+ Items)</span>
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
