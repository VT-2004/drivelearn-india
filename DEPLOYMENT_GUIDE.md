# DriveLearn India — Deployment Guide (Day 30)

## Pre-Deployment Checklist

- [ ] All environment variables documented (see below)
- [ ] `.gitignore` excludes `.env`, `node_modules/`, `uploads/`
- [ ] Responsive QA pass done on all pages (mobile + desktop)
- [ ] Test the full user journey once more end-to-end before deploying

---

## Environment Variables Needed

### Backend (`server/.env`)
```
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=your_jwt_secret
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

### Frontend (`client/.env`)
```
VITE_API_URL=https://your-deployed-backend-url.com/api
```
(You'll need to update `client/src/services/api.js` to use `import.meta.env.VITE_API_URL` instead of the hardcoded `http://localhost:5000/api` before deploying — otherwise the deployed frontend will still try to call your local machine.)

---

## Step 1: Deploy the Backend (Render — free tier)

1. Push your latest code to GitHub (already done throughout this project)
2. Go to [render.com](https://render.com) → sign up/log in
3. **New → Web Service** → connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node server.js`
5. Add all backend environment variables (from above) in Render's Environment tab
6. Deploy — Render gives you a URL like `https://drivelearn-api.onrender.com`

**Important:** free-tier Render services "sleep" after inactivity and take ~30 seconds to wake up on the first request — normal for free tier, not a bug.

## Step 2: Deploy the Frontend (Vercel — free tier)

1. Go to [vercel.com](https://vercel.com) → sign up/log in
2. **New Project** → import your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (auto-detected)
4. Add `VITE_API_URL` environment variable pointing to your Render backend URL
5. Deploy — Vercel gives you a URL like `https://drivelearn-india.vercel.app`

## Step 3: Update CORS on the Backend

Once deployed, your backend's `cors()` needs to allow requests from your real frontend URL, not just `localhost`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://drivelearn-india.vercel.app'],
  credentials: true,
}));
```

## Step 4: Final Smoke Test on Production
Repeat the core user journeys on the live URLs:
- Sign up → Login (all 4 roles)
- School registration → Admin approval
- Learner search → booking → payment
- Instructor attendance marking
- Review submission

---

## Known Limitations to Document (for your report)
- AWS S3 not yet integrated — document uploads use local server storage (fine for demo, not production-scale)
- Razorpay is in test mode — needs business KYC for live payments
- Email sending uses personal/company SMTP — not a dedicated transactional email service (fine for current scale)
- Free-tier hosting (Render/Vercel) has cold-start delays and usage limits — acceptable for an internship project demo, not production traffic
