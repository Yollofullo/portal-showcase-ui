# 🌀 Portal Showcase UI

A polished, production-ready dashboard for operators, clients, and admins — powered by Next.js 14, Supabase, and TailwindCSS.

> Smart under the hood. Now sharp on the surface.

---

## ✨ Features

- 🔐 **Role-Based Auth** via Supabase (Operators, Clients, Admins)
- 📦 **Order Fulfillment** + Batch Processing
- 🗺️ **Warehouse Visualization** with MapLibre
- 🚚 **Route Optimization** (multi-stop, traffic-aware)
- 💸 **Real-Time Payment Tracking** (Stripe + Manual)
- 📈 **PDF Invoicing**, QR Scanning, and Analytics

---

## 📦 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/)
- **Styling:** TailwindCSS 3.4 + Custom Animations
- **Auth & DB:** Supabase (with RLS policies)
- **Payments:** Stripe webhooks
- **Routing:** OpenRouteService API
- **Mapping:** MapLibre + Heatmap Layer

---

## 🚀 Deployment

This project is **auto-deployed** via [Vercel](https://vercel.com/) on each Git push.

**Live URL:** _Coming soon_ (or update here once deployed)

---

## 🛠 Local Setup

1. Clone the repo  
2. Copy `.env.local.example` to `.env.local`  
3. Add your Supabase project keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
