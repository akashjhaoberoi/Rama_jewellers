# Rama Jewellers - E-Commerce Website

Premium gold jewelry e-commerce platform built with React.js and Firebase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app opens at **[http://localhost:300](https://kgsjewelry.netlify.app/)**

## 🔑 Setting Up Admin Access

1. Register a new account via the website
2. In Firebase Console → Realtime Database, navigate to `users/{uid}/role`
3. Change the value from `"user"` to `"admin"`
4. Refresh the app — you'll see the Admin link in the navbar

## 📁 Project Structure

```
src/
├── admin/          → Admin panel (product/order/rate management)
├── components/     → Reusable UI components (Navbar, Footer, ProductCard, etc.)
├── context/        → React Context (Auth, Cart)
├── pages/          → All page components
├── services/       → Firebase, imgbb, gold rate services
├── styles/         → CSS files per component/page
├── App.jsx         → Main app with routing
├── firebase.js     → Firebase configuration
└── main.jsx        → Entry point
```

## ✨ Features

- **Home Page** — Hero banner, live gold rates, categories, featured products
- **Product Listing** — Filter by category, gold type, sort by price, search
- **Product Details** — Full price breakdown with live gold rate calculation
- **Cart System** — Add/remove items, quantity controls, localStorage persistence
- **Checkout** — Delivery form, order placement to Firebase
- **Order Tracking** — Order history with status badges
- **Sell Old Gold** — HUID-based gold selling with live value calculation
- **Auth** — Register, login, logout (Firebase Auth)
- **Admin Panel** — Add/edit/delete products, manage orders, override gold rates

## 💰 Price Formula

```
finalPrice = (goldRate × (weight + wastage)) + makingCharge + tax%
```

## 🛠 Tech Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| Frontend         | React.js + Vite             |
| Database         | Firebase Realtime Database  |
| Auth             | Firebase Authentication     |
| Image Upload     | imgbb API                   |
| Gold Rates       | Live API + Firebase storage |
| Styling          | Vanilla CSS (luxury theme)  |
| Routing          | React Router v6             |
| Notifications    | react-hot-toast             |

## 🎨 Theme

- **Rose Gold**: `#B76E79`
- **White**: `#FFFFFF`
- **Black**: `#000000`
- Playfair Display + Inter fonts
- Responsive (mobile + desktop)
