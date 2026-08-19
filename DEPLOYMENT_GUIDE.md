# 🚀 DriveLearn India — Full Production Deployment Guide

End-to-end guide for deploying the DriveLearn India frontend to Vercel and the backend API service to Render with PostgreSQL database management.

---

## 🌐 Live Production Targets

- **Frontend App**: [https://drivelearn-india.vercel.app/](https://drivelearn-india.vercel.app/)
- **Backend API**: Cloud-Hosted Node.js / Render Web Service
- **Database**: PostgreSQL (Supabase / Neon / Render PostgreSQL)

---

## 📋 Environment Variables Reference

### Backend (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://username:password@your-postgres-host.com:5432/drivelearn_db?schema=public&sslmode=require"
JWT_SECRET="your_production_secure_jwt_secret"
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
CLIENT_URL="https://drivelearn-india.vercel.app"
```

### Frontend (`client/.env`)
```env
VITE_API_URL="https://your-deployed-backend-url.onrender.com/api"
VITE_RAZORPAY_KEY_ID="rzp_live_your_key_id"
```

---

## 🛠️ Step 1: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New → Web Service**.
2. Connect your GitHub repository: `https://github.com/VT-2004/drivelearn-india`.
3. Configure settings:
   - **Name:** `drivelearn-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start` (or `node src/index.js`)
4. In the **Environment Variables** tab, add all variables from the backend section above.
5. Deploy Web Service. Render will provide your live API base URL (e.g. `https://drivelearn-api.onrender.com`).

---

## ⚡ Step 2: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New → Project**.
2. Import repository `VT-2004/drivelearn-india`.
3. Configure settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite` (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` $\rightarrow$ `https://your-deployed-backend-url.onrender.com/api`
5. Click **Deploy**. Vercel will deploy to `https://drivelearn-india.vercel.app`.

---

## 🔒 Step 3: Backend CORS Configuration

Ensure CORS in `server/src/index.js` allows requests from your production frontend URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://drivelearn-india.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));
```

---

## 🧪 Step 4: Production Verification Checklist

- [x] **Authentication Flow**: Sign up, Login, Role-Based Redirects.
- [x] **Super Admin Console**: School approval, SaaS subscription duration override (`⭐ Grant 1-Yr Free`, `⚙️ Custom Rights`).
- [x] **School Owner Portal**: Dual-control fleet registration, instructor onboarding, notices & compliance acknowledgment.
- [x] **Learner Marketplace**: Geolocation search, ₹15 signup wallet credit deduction, interactive Aptitude Mock Test.
- [x] **Razorpay Gateway**: Course booking checkout and subscription payment webhook handling.

---

© 2026 DriveLearn India Pvt. Ltd. · Production Deployment Standards
