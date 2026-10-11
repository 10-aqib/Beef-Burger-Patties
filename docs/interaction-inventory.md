# Interaction and Route Inventory

**Project:** Beef Burger Patties (BBP)
**Baseline Commit:** 0464328
**Date:** October 2026
**Framework:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Supabase

---

## 1. Route Inventory

| Route | Component | Purpose | Current Implementation Status | Expected Outcome & Audit Findings |
|---|---|---|---|---|
| `/` | `HomePage` | Cinematic landing page showcasing hero, featured items, deals, ingredient anatomy, locations, reviews | Functional but has CSS spacing conflicts, hero video frame duplicates (5.53MB canvas frames), Double Trouble discount mismatch (25% vs 23%), anatomy deselect on hover. | Seamless hero video with reduced motion support, accurate deal pricing, persistent ingredient selection, consistent dark charcoal branding. |
| `/menu` | `MenuPage` | Full categorized menu (Burgers, Sides, Drinks, Shakes, Dips) | Functional; category tabs cramped due to unlayered CSS reset; missing required shake flavor enforcement. | Category filtering works smoothly, tabs have proper touch targets (>=44px), shake flavors required before adding to cart. |
| `/deals` | `DealsPage` | Combo bundles and value packs | Partial; deals treated as simple products instead of bundle models; 4-burger mix & match choices not configurable. | True bundle model allowing burger selection, required drink selection, accurate savings calculation. |
| `/about` | `AboutPage` | Brand story, smash technique, ingredients | Functional; ingredient illustration layers named generically; unsupported marketing claims. | Distinct appetizing layer breakdown (Top Bun, Sauce, Pickles, Cheese, Upper Patty, Lower Patty, Onions, Bottom Bun); authentic culinary narrative. |
| `/locations` | `LocationsPage` | Branch directory across Islamabad, Rawalpindi, Lahore, Karachi | Functional; Karachi branch status ambiguity ("Coming Soon" vs "Kitchen Open"); Islamabad closing time conflict. | Centralized branch hours using Asia/Karachi timezone, midnight-crossing hours handled accurately, coming-soon branches disabled for delivery. |
| `/contact` | `ContactPage` | Inquiries, support, feedback | Timer-based fake success toast; does not persist inquiry to backend database. | Genuine Supabase submission with duplicate prevention, error handling, retained form state on error. |
| `/order-tracking` / `/order-tracking/:id` | `OrderTrackingPage` | Live order progress & delivery radar | Lookup fails on ID prefix mismatch (BBP vs SMD); `.container-max` overrides max-width; status history decorative. | Authoritative lookup by canonical order number (`BBP-YYYYMMDD-XXXX`), realtime subscription cleanup on unmount, actual status history. |
| `/checkout` | `CheckoutPage` | Delivery details, branch selection, coupon code, payment method, order placement | Client-authoritative pricing and order generation; coupon Apply button incomplete; COD functional but online methods unverified. | Focused layout, server-side validated order submission, server-side coupon validation, phone normalization (+92), atomic transaction. |
| `/order-confirmation/:id` | `OrderConfirmationPage` | Receipt and order placed confirmation | Relies on query params or unvalidated ID; `.container-max` breaks narrow layout. | Authoritative order retrieval from backend, verified items and totals, link to tracking. |
| `/profile` | `ProfilePage` | Account orders, saved addresses, preferences | Order history works if signed in; addresses/favorites not implemented; `.container-max` layout override. | Protected access, real order history with tracking links, clean sign-out. |
| `/admin` | `AdminPage` | Staff order management, menu toggles, store settings | No server-side role check (client only); revenue sums calculated over only latest 100 orders; unused imports. | Strictly restricted to staff role, server-side order aggregation, paginated order status management, operational toggles. |
| `/reset-password` | *Missing* | Password recovery callback destination | Route missing from `App.tsx`! Password recovery links land on 404. | Implemented route handling Supabase auth recovery session, password input with confirmation, error states. |
| `/terms` | *Missing* | Terms and conditions | Missing route or dead footer link. | Working terms of service page consistent with brand design system. |
| `/privacy` | *Missing* | Privacy policy | Missing route or dead footer link. | Working privacy policy page. |
| `*` | `NotFoundPage` | 404 fallback | Implemented with basic styling. | Styled 404 page matching brand aesthetic with "Back to Home" and "View Menu" actions. |

---

## 2. Interaction & Overlay Inventory

| Interaction | Trigger / Component | Current Status | Issues & Required Fixes |
|---|---|---|---|
| **Header Navigation** | `Header.tsx` | Crowded on desktop; "Live Radar" label; Admin shortcut shown to guests. | Rename "Live Radar" to "Track Order", remove admin link for anonymous users, active link states, mobile drawer auto-close on navigate. |
| **City Selector** | `LocationModal.tsx` | Functional modal. | Centralize branch data; ensure selected branch updates delivery eligibility. |
| **Search** | `SearchModal.tsx` | "Double Smash" suggestion does not match catalogue ("OG Double Smash"). | Case and trim normalization, match aliases/keywords, handle empty state, keyboard navigation (Esc/focus trap), direct customization of search items. |
| **Cart Drawer** | `CartDrawer.tsx` | Functional Zustand store. Delivery threshold hardcoded. | Canonicalize modifier ordering so identical items combine; revalidate prices; empty cart should not show delivery fee; server-aligned delivery threshold (Rs. 2,000). |
| **Product Customizer** | `ProductCustomizer.tsx` | Framer Motion double vertical centering (`-translate-y-1/2` + `y: -50%`); unlayered CSS squashes buttons to 16.5px. | Single centering mechanism via flex container, scrollable modal body on mobile/small viewports, focus trap, required shake flavor selection, minimum/maximum modifier group limits. |
| **Auth Modal** | `AuthModal.tsx` | Sign in, sign up, password recovery tabs. | Loading states, clear error messages, redirect handling, session persistence without logging secrets. |
| **Ingredient Explorer** | `AnatomySection.tsx` | Hovering selects layer, moving away or clicking causes immediate de-selection. | Separate hover preview from persistent click selection; keyboard navigable; clear layer active indicator. |
| **Coupon Code** | `CheckoutPage.tsx` | Apply button was purely cosmetic or incomplete. | Server-side validation: minimum spend, expiry date, discount cap, usage limits; atomic redemption. |
| **Order Placement** | `CheckoutPage.tsx` | Client constructs order object and inserts directly into `orders` table. | RPC or authoritative transaction: calculate authoritative totals, insert order and order items atomically, prevent duplicate submissions (idempotency key), clear cart only upon success. |
| **Contact Submission** | `ContactPage.tsx` | Simulated 1.5s timeout with fake success toast. Unused `submitting` variable. | Real Supabase `contact_inquiries` table insert, duplicate protection, retain form state on failure. |
| **Newsletter Signup** | `Footer.tsx` | Basic regex with toast; no backend persistence. | Save to `newsletter_subscribers` table, handle existing subscriptions gracefully. |
| **Review Submission** | `ReviewsSection.tsx` | Client-controlled auto-approval; unverified fake reviews. | Moderation status (`is_approved: false`), server verification for completed purchases, accessible star rating buttons. |

---

## 3. Summary of Baseline Quality Metrics

- **TypeCheck (`tsc -b`):** Passed (0 errors).
- **Linter (`oxlint`):** Passed with 58 warnings (unused variables, unused imports, set-state-in-effect).
- **Automated Tests:** 0 source test files present. Vitest needs to be added with test suite.
- **Bundle & CSS:** 71.25 kB CSS, unlayered reset causing severe spacing regressions across all pages.
