# 🍔 SMASHD™ — Premium Gourmet Beef Burgers

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

A modern, fast-casual luxury web application for **SMASHD™**, featuring 100% grass-fed Angus smash burgers, hand-crafted sides, signature shakes, and an immersive culinary digital experience.

---

## ✨ Features

- **Fluid Full-Viewport Design**: Fluid container layout scaling from ultra-wide 4K monitors down to mobile handsets with zero awkward empty gutters.
- **Interactive 3D-Style Burger Anatomy**: Real-time layer breakdown visualizer showcasing artisanal brioche, seared crust Angus patties, American cheddar, and house sauces.
- **Dynamic Menu & Product Customizer**: Interactive selection of singles, doubles, combos, custom add-ons, and dietary options.
- **Cart & Order Management**: Real-time slide-over cart drawer powered by Zustand with persistent local state.
- **Multi-City Location Selector**: Dynamic store locator for Karachi, Lahore, and Islamabad with delivery radius checking.
- **Deals & Limited-Time Drops**: Exclusive promo codes, bundle savings, and seasonal menu items.
- **Supabase Cloud Backend**: Connected to Supabase with automatic resilient fallback to local seed data for instant zero-config evaluation.
- **Production Optimized**: Rollup chunk splitting, Tailwind CSS v4 engine, and sub-second Vite HMR.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://greensock.com/gsap/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Backend / DB**: [Supabase](https://supabase.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/10-aqib/Beef-Burger-Patties.git
cd Beef-Burger-Patties
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables (Optional)
The application works immediately out-of-the-box with bundled seed data. To connect your live Supabase project, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
Production build artifacts will be generated in the `dist/` directory.

---

## 🚀 Deploying to Vercel

This repository is pre-configured for seamless 1-click deployment to [Vercel](https://vercel.com):

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import `Beef-Burger-Patties`.
4. Vercel will auto-detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Environment Variables**.
6. Click **Deploy**.

> **Note on SPA Routing**: A [`vercel.json`](./vercel.json) file is included at the root with Single Page Application rewrites (`/(.*) -> /index.html`) to ensure direct route visits (such as `/menu`, `/deals`, `/locations`) reload without 404 errors.

---

## 📁 Repository Structure

```
├── public/                 # Static assets (favicons, product images, brand marks)
├── reference/              # Design specifications and source references
│   ├── raw_frames/         # High-resolution animation sequence frames
│   └── stitch/             # Stitch brand & luxury UI design references
├── src/
│   ├── assets/             # Bundled images and vectors
│   ├── components/
│   │   ├── anatomy/        # Interactive burger layer visualizer
│   │   ├── auth/           # Login / Register modals
│   │   ├── cart/           # Slide-over cart drawer & state
│   │   ├── deals/          # Special bundles & promo section
│   │   ├── hero/           # Cinematic hero & marquee banner
│   │   ├── layout/         # Header, Footer, navigation & search
│   │   ├── locations/      # City store finder & timing cards
│   │   ├── menu/           # Product cards, grid & customizer
│   │   └── reviews/        # Customer feedback & ratings carousel
│   ├── hooks/              # Custom React hooks (products, auth, UI)
│   ├── lib/                # Supabase client & fallback seed database
│   ├── pages/              # Route pages (Home, Menu, Deals, Locations, Checkout, etc.)
│   ├── services/           # Supabase data services
│   ├── store/              # Zustand global stores (cart, UI)
│   ├── types/              # TypeScript interface & type definitions
│   ├── utils/              # Formatting & helper utilities
│   ├── App.tsx             # Root router layout & provider wrappers
│   ├── index.css           # Global typography, colors & fluid container tokens
│   └── main.tsx            # React application entrypoint
├── .env.example            # Sample environment variables
├── .gitignore              # Git ignore rules for node_modules, dist, secrets
├── index.html              # HTML shell with Google fonts & meta tags
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment & SPA rewrite configuration
└── vite.config.ts          # Vite build config with path aliases & chunk splitting
```

---

## 📄 License

This project is proprietary and confidential. Developed for **SMASHD™ Beef Burger Patties**.
