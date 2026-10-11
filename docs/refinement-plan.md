# Beef Burger Patties — Refinement & Engineering Execution Plan

**Project:** Beef Burger Patties (BBP)
**Target Branch:** `refine/beef-burger-patties`
**Base Commit:** 0464328
**Author:** Senior Full-Stack Engineer, UI/UX Designer, Accessibility Specialist & QA Lead

---

## 1. Executive Summary & Brand Direction

Beef Burger Patties (BBP) is a premium, high-octane Pakistani burger brand specializing in authentic smash burgers with crispy lace edges, gourmet crinkle-cut loaded fries, and chef-crafted shakes across Islamabad, Rawalpindi, Lahore, and Karachi.

### Brand Aesthetic Directives
- **Color Palette:**
  - Background: Deep charcoal / iron-black (`#080808`, `#0D0D0D`, `#171717`)
  - Primary Action / Accent: Searing Forge Red-Orange (`#FF3B1F`, hover `#FF543B`)
  - Warm Highlight: Molten Cheddar Amber (`#F59E0B`)
  - High Contrast Neutral: `#FFFFFF` and `#E5E2E1`, borders `#2A2A2A`
- **Typography:**
  - Display: `Space Grotesk` (uppercase, bold tracking)
  - Body / Interfaces: `Inter`
- **Tone:** Cinematic, unapologetic craft, culinary authenticity, zero fluff.

---

## 2. Prioritized Issue List & Reproduction Steps

### Issue 1 (P0 - CSS Cascade & Spacing Regression)
- **Reproduction:**
  1. Open any inner page (e.g. `/menu`, `/deals`, `/profile`, `/contact`).
  2. Notice the heading begins under or is clipped by the 80px fixed header.
  3. Inspect cards and buttons in browser DevTools: cards have 0px padding or squashed buttons (~16.5px height) instead of 48-52px.
- **Root Cause:**
  `src/index.css` had an unlayered universal reset `*, *::before, *::after { margin: 0; padding: 0; }` after `@import "tailwindcss";`, overriding Tailwind v4 utility spacing classes. Additionally, `.container-max` declared an unlayered `max-width: var(--container-max);` (110rem) which defeated `max-w-2xl` and `max-w-3xl`.
- **Target Resolution:**
  Move reset to `@layer base`, move component defaults to `@layer components`, redefine `.container-max` to coexist cleanly with Tailwind width modifiers.

### Issue 2 (P0 - Client-Authoritative Ordering & Lack of Atomicity)
- **Reproduction:**
  1. Add items to cart. Go to `/checkout`.
  2. Place order. Inspect network tab.
  3. The browser generates the order ID and executes a direct client `supabase.from('orders').insert(...)` and `order_items.insert(...)`.
  4. If `order_items` fails, the order row remains orphaned in the database. Client totals can be manipulated in DevTools.
- **Root Cause:**
  Absence of server-side transactional RPC. Order creation logic is entirely client-authoritative.
- **Target Resolution:**
  Create an authoritative database function / RPC (`create_order_transaction`) that calculates true prices from the catalog, verifies branch status, validates coupon code, enforces minimum order, inserts the order and items atomically, and returns a verified canonical order ID.

### Issue 3 (P0 - Order Identifier & Tracking Mismatch (BBP vs SMD))
- **Reproduction:**
  1. Place an order or generate order number.
  2. Notice some services use `SMD-` prefix while branding uses `BBP-`.
  3. Look up order in `/order-tracking`. ID lookup regex fails on prefix mismatch.
- **Target Resolution:**
  Standardize canonical order number format: `BBP-YYYYMMDD-XXXX`. Provide backwards compatibility for legacy `SMD-` or UUID formats.

### Issue 4 (P1 - Customizer Modal Centering & Stacking)
- **Reproduction:**
  1. Click "Customize" on a burger card.
  2. On mobile or short viewports, the modal is translated off-screen or cannot be scrolled because both CSS `-translate-y-1/2` and Framer Motion `y: -50%` were applied simultaneously.
  3. Focus is not trapped inside the modal, and Esc key handling is inconsistent.
- **Target Resolution:**
  Use flexbox-centered overlay backdrop (`fixed inset-0 flex items-center justify-center p-4`), inner panel with internal scrolling (`max-h-[90vh] overflow-y-auto`), proper focus trap, aria dialog attributes, and central body-scroll locking.

### Issue 5 (P1 - Deal Bundle Selection Not Configurable)
- **Reproduction:**
  1. Go to `/deals`. Click "Add Deal" on Gang Squad or Coastal Feast.
  2. Deal promises "4x Craft Burgers (Mix & Match Choice)", but customer is never prompted to select 4 burgers or drinks; a static product is dumped into cart.
- **Target Resolution:**
  Build a deal configuration workflow in the customizer / modal allowing customers to pick their mix & match items and drinks before adding to cart.

### Issue 6 (P1 - Required Modifier Groups (Shake Flavor, Spice Level))
- **Reproduction:**
  1. Open Smasher Shake in `/menu`.
  2. Can add to cart without selecting a flavor (Vanilla, Chocolate, Salted Caramel).
- **Target Resolution:**
  Add `required: true`, `min_selection: 1`, `max_selection: 1` to modifier groups and validate before allowing "Add to Bag".

### Issue 7 (P1 - Anatomy Section Hover/Click Conflict)
- **Reproduction:**
  1. On Homepage, scroll to the Ingredient Explorer / Anatomy section.
  2. Hovering over a layer highlights it, but clicking it or moving the mouse immediately deselects or triggers jittery resets.
- **Target Resolution:**
  Decouple hover preview from persistent click selection. Moving the mouse away preserves the clicked layer. Support keyboard selection and distinct food layer styling.

### Issue 8 (P1 - Fake Contact, Newsletter & Moderation Flows)
- **Reproduction:**
  1. Submit contact form: simulated 1.5s delay displays success toast, but no record is saved to any backend.
  2. Subscribe to newsletter: displays toast without saving.
  3. Reviews allow client-side auto-approval.
- **Target Resolution:**
  Implement Supabase tables and service methods for `contact_inquiries`, `newsletter_subscribers`, and review moderation (`is_approved: false` pending admin review).

### Issue 9 (P1 - Missing Reset Password, Terms, Privacy Routes)
- **Reproduction:**
  1. Trigger password recovery from Auth modal.
  2. Click link in email or navigate to `/reset-password` -> Lands on 404.
  3. Click Terms or Privacy in footer -> Dead links or 404.
- **Target Resolution:**
  Add `/reset-password` page handling recovery token and updating password; add `/terms` and `/privacy` pages.

### Issue 10 (P2 - 58 Lint Warnings & Code Cleanup)
- **Reproduction:**
  Run `npm run lint`. Output lists 58 warnings for unused imports, unused state variables, and `set-state-in-effect`.
- **Target Resolution:**
  Clean up unused variables and imports, refactor state synchronization in effects.

### Issue 11 (P2 - 5.53MB Unused JPEG Frames & Hero Performance)
- **Reproduction:**
  Inspect `public/frames` and network waterfall on `/`. Browser requests dozens of JPEG frames while the hero video MP4 is already playing.
- **Target Resolution:**
  Remove unused frame preloading / canvas logic; keep sleek MP4 video with poster image, pause toggle, and `prefers-reduced-motion` compliance.

---

## 3. Implementation Phases Roadmap

- **Phase 0:** Baseline, inventory, reproduction (Done - inventory & refinement plan created).
- **Phase 1:** CSS-layer fix in `src/index.css`, layout tokens, container fix, page shells.
- **Phase 2:** Visual polish page by page (Header, Hero, Product Cards, Deals, About, Locations, Contact, Footer).
- **Phase 3:** Modals, search query normalization & keyboard a11y, anatomy persistent selection.
- **Phase 4:** Product modifiers (required/optional), deals bundle mix-and-match model, canonical cart items.
- **Phase 5:** Supabase migrations (schema, tables, RLS, indexes, sample data), environment isolation, explicit demo mode indicator.
- **Phase 6:** Authoritative transactional ordering (RPC / DB transaction), canonical `BBP-` order numbers, idempotency.
- **Phase 7:** Checkout UX, coupon validation, payment states (Cash on Delivery enabled, online labeled appropriately).
- **Phase 8:** Confirmation, live tracking with realtime cleanup, `/reset-password`, profile orders.
- **Phase 9:** Contact inquiry persistence, newsletter subscription table, review submission with moderation.
- **Phase 10:** Branch hours (Asia/Karachi, midnight crossover), admin order management & analytics aggregation.
- **Phase 11:** Performance (remove unused frame loading), accessibility (skip links, focus trap, ARIA), lint cleanup (0 warnings).
- **Phase 12:** Automated unit & integration testing (Vitest test suite covering order numbers, price calculation, modifiers, bundles, coupons).
- **Phase 13:** Handover documentation and release verification.
