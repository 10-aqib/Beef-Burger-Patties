# Beef Burger Patties 🍔

**Beef Burger Patties** is a premium, modern burger restaurant web application designed for customers in Pakistan. The project combines a cinematic food-focused interface with a responsive ordering experience, interactive product customization, location discovery, deals, cart management, and a scalable backend architecture.

The website is designed to provide the visual quality of a premium fast-food brand while maintaining a practical foundation for real-world restaurant operations.

---

## ✨ Features

### 🍔 Premium Burger Experience

* Modern dark-themed restaurant interface
* High-quality burger and food photography
* Cinematic hero section
* Interactive food animations
* Premium typography and visual hierarchy
* Responsive product cards
* Featured and bestselling products

### 🛒 Online Ordering

* Browse the complete menu
* Add products to cart
* Customize burgers and meals
* Select additional toppings/modifiers
* Add kitchen instructions
* Adjust quantities
* View subtotal and delivery charges
* Real-time cart updates
* Checkout workflow

### 📦 Order Management

Customers can:

* Place orders
* View order details
* Track order status
* View previous orders
* Receive order status updates

Supported order workflow:

```text
PLACED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY
   ↓
OUT FOR DELIVERY
   ↓
DELIVERED
```

Orders can also be cancelled when applicable.

---

## 📍 Restaurant Locations

The website supports multiple restaurant locations across Pakistan.

Customers can:

* Browse available branches
* Filter locations by city
* View branch information
* View operating information
* Get directions
* Select a preferred location for ordering

Example supported cities:

* Islamabad
* Rawalpindi
* Lahore
* Karachi

---

## 🔥 Deals & Combos

A dedicated deals section allows customers to discover:

* Burger combos
* Meal deals
* Family offers
* Limited-time promotions
* Discounted products

Deals are designed to be managed dynamically rather than relying entirely on hardcoded frontend content.

---

## 👤 Authentication

The application supports customer accounts with authentication functionality.

Users can:

* Create an account
* Sign in
* Sign out
* Manage their profile
* View their orders
* Track active orders
* Access account-specific information

Authenticated users only have access to their own customer data.

---

## 🧑‍💼 Admin Dashboard

The project is designed with restaurant administration in mind.

Administrators can manage:

* Products
* Categories
* Deals
* Orders
* Customers
* Restaurant locations
* Reviews
* Delivery settings
* Promotional content

The admin system is separated from the customer-facing experience and protected using role-based access control.

---

## 🧩 Product Customization

Customers can customize their orders before adding them to the cart.

Customization can include:

* Burger toppings
* Cheese
* Sauces
* Extra patties
* Add-ons
* Meal upgrades
* Kitchen instructions

The selected modifiers are stored with the cart/order rather than being lost after checkout.

---

## 🎨 Design System

The interface follows a **dark, high-contrast street-food luxury aesthetic**.

### Color Direction

```text
Primary Background:     #080808
Surface:                #171717
Secondary Surface:      #1F1F1F
Borders:                #2A2A2A
Primary Accent:         #FF3B1F
Secondary Accent:       #F59E0B
Primary Text:           #FFFFFF
```

The design focuses on:

* Dark surfaces
* Strong red/orange accents
* High-contrast typography
* Cinematic food imagery
* Sharp/block-style buttons
* Minimal unnecessary decoration
* Strong visual hierarchy
* Premium restaurant branding

---

## 🎬 Cinematic Hero

The homepage features a cinematic food-focused hero experience.

The hero is designed to showcase the burger preparation process, including elements such as:

* Fresh beef patties
* High-temperature grilling
* Cheese melting
* Burger assembly
* Chef interaction
* Sizzling cooking visuals

The animation is optimized for different screen sizes and can use compressed video formats such as:

```text
WebM
MP4
```

with an optimized poster image for fast loading.

---

## 📱 Fully Responsive

The website is designed to work across:

### Desktop

```text
1920 × 1080
1600 × 900
1536 × 864
1440 × 900
1366 × 768
1280 × 800
```

### Tablet

```text
1024 × 1366
834 × 1112
820 × 1180
768 × 1024
```

### Mobile

```text
430 × 932
414 × 896
393 × 873
390 × 844
375 × 812
```

The layout uses fluid grids, responsive typography, adaptive spacing, and mobile-specific navigation.

The goal is to ensure that the website uses the available viewport efficiently without creating:

* Horizontal scrolling
* Clipped content
* Overlapping elements
* Broken cards
* Oversized images
* Unnecessary empty space

---

# 🛠️ Technology Stack

## Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Framer Motion / GSAP**
* **Lucide React**
* Responsive CSS

## Backend

* **Supabase**
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Supabase Realtime
* Row Level Security (RLS)

---

# 🗄️ Database Architecture

The application can use a relational Supabase/PostgreSQL structure containing entities such as:

```text
profiles
categories
products
product_images
modifier_groups
modifier_options
deals
locations
orders
order_items
order_status_history
delivery_zones
reviews
coupons
newsletter_subscribers
site_settings
```

Relationships between these entities allow the application to scale beyond a static restaurant website.

---

# 🔐 Security

Security is an important part of the project.

The application is designed to use:

* Supabase Row Level Security
* Role-based authorization
* Protected admin routes
* Authenticated customer routes
* User-specific order access
* Secure database policies
* Environment variables
* No exposed service-role credentials

Sensitive Supabase credentials should never be committed to the repository.

---

# 📂 Project Structure

A recommended project structure is:

```text
src/
│
├── components/
│   ├── common/
│   ├── header/
│   ├── footer/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── admin/
│
├── pages/
│   ├── Home/
│   ├── Menu/
│   ├── Deals/
│   ├── About/
│   ├── Locations/
│   ├── Contact/
│   ├── Checkout/
│   ├── Profile/
│   ├── OrderTracking/
│   └── Admin/
│
├── hooks/
│
├── services/
│   ├── supabase/
│   ├── products/
│   ├── orders/
│   └── authentication/
│
├── store/
│   ├── cart/
│   └── user/
│
├── types/
│
├── utils/
│
├── assets/
│
├── App.tsx
└── main.tsx
```

---

# 🌐 Application Routes

The application is structured around dedicated routes:

```text
/
├── /menu
├── /deals
├── /about
├── /locations
├── /contact
├── /checkout
├── /profile
├── /order-tracking
└── /admin
```

Each route should provide a complete user experience instead of relying on placeholder `#` links.

---

# 🛍️ Customer Journey

A typical customer journey is:

```text
Visit Website
      ↓
Explore Hero
      ↓
Browse Menu
      ↓
Select Burger
      ↓
Customize Burger
      ↓
Add to Cart
      ↓
Review Cart
      ↓
Checkout
      ↓
Place Order
      ↓
Order Confirmation
      ↓
Track Order
      ↓
Delivery
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
```

## 2. Enter the project

```bash
cd beef-burger-patties
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create:

```text
.env
```

Add the required Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never place the Supabase service-role key in frontend environment variables.

## 5. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 6. Build for production

```bash
npm run build
```

## 7. Preview the production build

```bash
npm run preview
```

---

# ⚙️ Environment Variables

The project may require:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Additional environment variables can be added for external services when required.

Keep `.env` files out of version control.

---

# 🧪 Quality & Testing

Before deployment, verify:

* [ ] No TypeScript errors
* [ ] No console errors
* [ ] No broken routes
* [ ] No broken images
* [ ] No horizontal overflow
* [ ] Mobile layout works
* [ ] Tablet layout works
* [ ] Laptop layout works
* [ ] Desktop layout works
* [ ] Cart works correctly
* [ ] Product customization works
* [ ] Authentication works
* [ ] Checkout works
* [ ] Orders are stored correctly
* [ ] Order tracking works
* [ ] Admin authentication works
* [ ] Supabase RLS policies work
* [ ] No sensitive credentials are exposed
* [ ] Production build succeeds

---

# 🚀 Future Enhancements

Potential future improvements include:

* Online payment gateway integration
* Real-time kitchen dashboard
* Delivery rider tracking
* Push notifications
* SMS order notifications
* Coupon system
* Loyalty/rewards program
* Customer favorites
* Advanced restaurant analytics
* Inventory management
* POS integration
* Automated order notifications
* AI-powered customer support
* Personalized recommendations

---

# 🎯 Project Goal

The goal of **Beef Burger Patties** is to create more than a static restaurant website.

It is designed as a **complete digital restaurant platform** where customers can discover food, customize their meals, place orders, manage their accounts, and track their purchases while restaurant administrators can manage products, locations, deals, and orders from a centralized dashboard.

The project combines:

**Premium UI + Cinematic Food Experience + Responsive Design + Real Ordering + Supabase Backend + Restaurant Management**

to create a modern production-ready burger ordering platform for the Pakistani market.

---

## 👨‍💻 Project Status

**Status:** 🚧 Active Development

The project is continuously being refined with emphasis on:

* UI/UX quality
* Responsive behavior
* Performance
* Real backend functionality
* Accessibility
* Security
* Restaurant operations
* Production readiness

---
