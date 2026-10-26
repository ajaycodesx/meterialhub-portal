# MaterialHub System Rules & Standards

## UI/UX & Design Guidelines
1. **Icon Library**: ALWAYS use `react-icons` (e.g., `react-icons/fa6`, `react-icons/md`, `react-icons/hi2`, `react-icons/fi`, `react-icons/tb`, `react-icons/io5`). Do NOT use `lucide-react`.
2. **Curved Aesthetics**: Enforce curved design patterns (`rounded-2xl`, `rounded-3xl`, soft card shadows). Avoid sharp rectangular borders. Strictly avoid `rounded-full`.
3. **Professional Folder Structure**:
   - `components/layout/`: Header, Footer, Navigation
   - `components/buyer/`: Feature components specific to buyer workflow (Modals, Tickers, Merchant Cards)
   - `components/ui/`: Reusable atomic UI elements (Buttons, Inputs, Badges, Modals)
   - `types/`: Type definitions
   - `data/`: Mock data & constants
4. **Standardism & Clean Layout**:
   - Clean alignment with consistent grid and flex gaps.
   - Do NOT use outer borders for cards, badges, panels, or page sections (except form inputs). Rely on soft background shade differences (e.g. `bg-slate-50`, `bg-white`) and soft drop shadows instead.
   - No floating simulator toggle tabs. Standard responsive web design only.
5. **Human-Centric Copywriting**:
   - Use practical, human-focused terminology for contractors, builders, and buyers (e.g., "Wholesale Rate Index", "Direct Merchant Delivery", "Verified Store Stock", "Site Unloading Support", "GST Tax Invoice").
   - Strictly remove AI-generated buzzwords ("AI Powered", "AI Matchmaker", "Smart AI Ticker").
6. **NO EMOJIS**:
   - Never use emoji icons or emoji flag characters in UI components, buttons, or badges. Use standard SVG icons or clean typography badges instead.
7. **Realistic Product Visuals**:
   - Use realistic high-quality product images for materials, categories, and store cards. Images must contain NO text or logos.
8. **Typography & Font Weight Rules**:
   - Strictly do NOT use `font-extrabold`, `font-black`, or `font-bold` anywhere. `font-semibold` (600), `font-medium` (500), and `font-normal` (400) are permitted for clear visual hierarchy without heavy blocky weights.
9. **No Section Divider Borders**:
   - Do NOT use section divider border lines (`border-t`, `border-b` between page sections). Rely on soft background shade changes (`bg-white` vs `bg-slate-50/50`) and clean whitespace gaps (`py-12 sm:py-16`).
10. **Semantic Heading Hierarchy & Consistent Body Font Sizes**:
    - `h1`: Page Hero Title (Single per page for SEO)
    - `h2`: Main Section Titles
    - `h3`: Card / Category / Store Titles
    - `h4`: Modal headers & Sub-card titles
    - Body elements (`p`, `li`, `ul`, `button`, `a`, `input`, `select`): Use standardized consistent font sizes (`text-xs` or `text-sm`) with `font-medium` / `font-semibold`.
11. **No Role Pill Badges or Image Floating Overlays**:
    - Do NOT place panel role pills (e.g., `BUYER` badge tags) next to the main logo in headers.
    - Do NOT overlay dark floating text boxes or overlay cards on top of hero images. Keep hero photos clean and unobscured.
12. **Dual Typography Font Family System**:
    - **Titles & Headings (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`)**: Use `'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
    - **Body & Interactive Elements (`p`, `li`, `a`, `button`, `span`, `input`, `select`)**: Use `'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
13. **Equal Height Hero Section Layout**:
    - Left text content container and right image container MUST have matching full height (`items-stretch`, `h-full object-cover`).
14. **Card Hover Interaction (Shadow Elevation Only, No Hover Border Color Change)**:
    - Do NOT change border color on hover (avoid `hover:border-*` or `hover:border-orange-300`).
    - Keep cards borderless or with standard borderless shadows. On hover, use soft drop shadow elevation only (`shadow-xs hover:shadow-md transition-all duration-300`).
15. **Custom Styled Reusable Form Components**:
    - ALWAYS use custom-styled reusable UI components (`components/ui/Input.tsx`, `components/ui/Select.tsx`, `components/ui/Checkbox.tsx`, `components/ui/Button.tsx`).
    - Do NOT use raw unstyled HTML form inputs or native browser `<select>` dropdowns. Custom dropdowns must use overlay popover containers with smooth transitions, custom chevrons, and clean option items.
    - Component variants must use clean `switch` or `if/else` formatting for maintainability.
16. **Standard Section Action Links ("View More >" / "All Brands >")**:
    - All section-level secondary actions and navigation triggers (e.g., "View More", "All Brands", "View More Rates") MUST use clean typography with chevron icon navigation, NOT bulky rectangular pill buttons or arrow buttons.
    - Standard class: `text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0` with `<FaChevronRight className="h-3 w-3" />`.
17. **Vertical Border Dividers Instead of Bullet Dots**:
    - Strictly prohibit bullet dot characters (`•`, `&bull;`) for inline metadata, lists, tag separations, and specifications.
    - Use clean vertical border divider lines (e.g., `<span className="h-2.5 w-px bg-slate-300 inline-block" />` or `divide-x divide-slate-200`) with clean horizontal spacing (`gap-2` or `gap-3`).
18. **NO Pulsing or Active Animation Dots**:
    - Strictly prohibit pulsing or blinking dots (`animate-pulse`, `animate-ping`) on live status indicators, telemetry sync badges, GPS markers, and shipment cards.
    - Use clean, professional static typography or subtle solid static indicator dots with high-contrast text tokens.
19. **NO Background Color Behind Text Badges**:
    - Do NOT place colored background fill pills behind text (such as `bg-emerald-50 text-emerald-700`, `bg-orange-50 text-orange-600` behind percentages, market indexes, or status tags).
    - Rely on clean, purposeful typography with direct font weight and text color tokens (`text-emerald-600 font-semibold`, `text-[#FF6500] font-semibold`) on neutral card surfaces.
20. **Authentic Transparent PNG Brand Logos**:
    - Manufacturer, brand, and partner showcase cards must use authentic, transparent PNG logo images (`/images/brands/*.png`, `max-w-[85px] h-6 sm:h-7 object-contain`) positioned at the top right of each card.
    - Never use arbitrary text tag badges or inline SVG text wordmarks as placeholders.
21. **Card Grouping & Anchored Bottom CTAs**:
    - Inside cards with headers, spec boxes, and a bottom action button, group the header text and spec box together at the top (`space-y-4`).
    - Never let middle elements float in the vertical center due to `justify-between`. Always anchor bottom action buttons to the bottom using `mt-auto` / `mt-5`.
22. **Brand Logo Surface Contrast & Variants**:
    - On dark backgrounds (`bg-[#0d1527]`, dark navbars), use `/images/logo.png` where the left stroke of the "M" is white and the right stroke/arrow is brand orange.
    - On light backgrounds (`bg-white`, `bg-slate-50`, footer cards), ALWAYS use `/images/logo_dark.png` where the left stroke of the "M" is dark slate-900 (`#0F172A`) to ensure high contrast and prevent the logo letterform from vanishing into the white surface.
23. **Strictly Zero Code Comments**:
    - Never include code comments in any project files (strictly no single-line `//`, multi-line `/* */`, or JSX `{/* */}`).
    - Write clean, self-describing, production-ready code with descriptive variable and function names. All files must remain 100% comment-free at all times.
24. **Strictly Prohibit `rounded-full`**:
    - Never use `rounded-full` anywhere in the application (including buttons, badges, avatars, icon containers, pills, progress bars, or indicator dots).
    - Enforce curved geometric design standards: use `rounded-2xl` or `rounded-3xl` for cards, modals, containers, and avatars; `rounded-xl` or `rounded-lg` for badges, buttons, chips, and progress tracks; and `rounded-xs` or `rounded-sm` for small indicator dots.
25. **Tight Standard Gap Between Section Headers & Content**:
    - Strictly enforce compact, elegant spacing between any section header and the content below it.
    - Avoid oversized bottom margins or padding (prohibit `mb-8`, `mb-6`, `pb-4`, or `space-y-6` directly under section headings).
    - Standard header-to-content gap: Use `mb-3 sm:mb-4` on section header containers, `space-y-3 sm:space-y-4` on section wrapper containers, and `pb-2 mb-2` on filter/tab strips. Ensure grid cards and category lists align closely and proportionally to their section headers without awkward empty whitespace.
26. **Full-Width Desktop Dashboard Layout (`w-full` Instead of `max-w-7xl`)**:
    - Strictly prohibit artificial maximum widths (such as `max-w-7xl`, `max-w-6xl`, or centered fixed-width content containers with large empty horizontal margins) on desktop dashboard views.
    - Always enforce full fluid width layouts (`w-full lg:max-w-none`) so dashboard grids, metric cards, telemetry displays, order feeds, and dispatch boards expand to utilize the full available canvas next to the navigation sidebar.
