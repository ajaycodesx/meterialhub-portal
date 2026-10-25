'use client';

import { FaStar, FaHelmetSafety, FaQuoteLeft } from 'react-icons/fa6';

const TESTIMONIALS = [
  {
    name: 'Suresh Nair',
    role: 'Site Supervisor',
    location: 'Kakkanad, Ernakulam',
    rating: 5,
    quote: 'Ordered 200 bags of UltraTech Cement and 3 tons of TMT rods. Delivery was on-site within 50 minutes via Bolero pickup. GST invoice came instantly on WhatsApp. Exactly what construction sites need.',
    initials: 'SN',
    color: 'bg-orange-50 text-[#FF6500]',
    project: 'G+3 Residential, 2400 sqft',
  },
  {
    name: 'Biju Thomas',
    role: 'Civil Contractor',
    location: 'Thrissur, Kerala',
    rating: 5,
    quote: 'The wholesale rate index saved me ₹18,000 on a single steel order. Being able to compare JSW vs Tata Tiscon rates live and order directly from the nearest stocked store is a game changer.',
    initials: 'BT',
    color: 'bg-slate-100 text-slate-800',
    project: 'Commercial Complex, 8500 sqft',
  },
  {
    name: 'Anitha Krishnan',
    role: 'Interior Works Contractor',
    location: 'Edapally, Ernakulam',
    rating: 5,
    quote: 'Paints, PVC pipes, and electrical wires — all from one store, one invoice, one delivery truck. The site unloading support option is brilliant for apartment buildings with narrow access roads.',
    initials: 'AK',
    color: 'bg-slate-900 text-white',
    project: 'Apartment Fit-out, 12 Units',
  },
  {
    name: 'Rajan Pillai',
    role: 'Hardware Procurement Manager',
    location: 'Aluva, Ernakulam',
    rating: 4,
    quote: 'Running bulk procurement for 4 concurrent construction sites. The Direct Quote feature from Metropolitan Hardware saved our team at least 3 hours of phone calls every week. Highly recommended.',
    initials: 'RP',
    color: 'bg-orange-50 text-[#FF6500]',
    project: 'Multi-site Bulk Procurement',
  },
];

export function ContractorTestimonials() {
  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-5">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5">
            Contractor Reviews
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
            Trusted by Site Managers Across Kerala
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed max-w-xl mx-auto">
            Real feedback from contractors, civil engineers, and hardware procurement teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gsap-stagger-group">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-100/80 gsap-card">
              <FaQuoteLeft className="h-5 w-5 text-slate-300" />

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-0.5 mt-auto">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FaStar key={j} className={`h-3 w-3 ${j < t.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                <div className={`h-9 w-9 rounded-xl ${t.color} flex items-center justify-center text-xs font-semibold shrink-0`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 font-normal truncate flex items-center gap-2">
                    <span>{t.role}</span>
                    <span className="h-2.5 w-px bg-slate-200 inline-block" />
                    <span>{t.location}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FaHelmetSafety className="h-2.5 w-2.5 text-slate-400" />
                    <p className="text-xs text-slate-400 font-normal truncate">{t.project}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
