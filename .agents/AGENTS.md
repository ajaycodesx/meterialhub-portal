# MaterialHub System Rules & Standards

## UI/UX & Design Guidelines
1. **Icon Library**: ALWAYS use `react-icons` (e.g., `react-icons/fa6`, `react-icons/md`, `react-icons/hi2`, `react-icons/fi`, `react-icons/tb`, `react-icons/io5`). Do NOT use `lucide-react`.
2. **Curved Aesthetics**: Enforce curved design patterns (`rounded-2xl`, `rounded-3xl`, smooth pill badges, soft card shadows). Avoid sharp rectangular borders.
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
   - Do NOT use `font-extrabold` or heavy `font-bold` classes. Use `font-semibold`, `font-medium`, or `font-normal` for clean, professional elegance.
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
16. **Consistent Secondary Pill Button Style (Platform-Wide Standard)**:
    - All secondary action buttons (e.g., "View All Categories", "See All Merchants", section-level CTAs) MUST use the same pill button style as the Header navigation buttons.
    - Standard style: `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11`
    - Do NOT use orange/colored backgrounds for secondary "view all" type buttons. Use the standard slate pill.
    - For primary hero/section CTAs (e.g., "Check Delivery Area"), use the `Button` component with `variant="primary"`.

