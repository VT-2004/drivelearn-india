# 🚗 DriveLearn India — Learn Driving. Drive Confidently.

[![Live Web Application](https://img.shields.io/badge/Live%20App-drivelearn--india.vercel.app-F97316?style=for-the-badge&logo=vercel&logoColor=white)](https://drivelearn-india.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%20ORM-2496ED?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![Payment Gateway](https://img.shields.io/badge/Payments-Razorpay%20UPI-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

> **India's premier digital driving school network and cloud operating system (OS) for certified academies, professional instructors, and learners.**

---

## 🌐 Live Application URL

- **Production URL**: [https://drivelearn-india.vercel.app/](https://drivelearn-india.vercel.app/)
- **Repository**: [https://github.com/VT-2004/drivelearn-india](https://github.com/VT-2004/drivelearn-india)

---

## 📌 Executive Summary & Architecture

**DriveLearn India** is an enterprise-grade, 2-sided SaaS marketplace platform designed to modernize and standardize India's driving school ecosystem. The platform seamlessly bridges the gap between **Driving School Academies**, **Certified Instructors**, and **Learners**, unified under a centralized **Super Admin Compliance Console**.

```
                           ┌──────────────────────────────────────────────┐
                           │            SUPER ADMIN CONSOLE               │
                           │  - School KYC & RTO Compliance Verification │
                           │  - B2B SaaS Subscriptions & Tier Overrides   │
                           │  - Platform-Wide Notices & Audit Logs        │
                           └──────────────────────┬───────────────────────┘
                                                  │
                  ┌───────────────────────────────┴───────────────────────────────┐
                  ▼                                                               ▼
  ┌──────────────────────────────┐                                ┌──────────────────────────────┐
  │   SCHOOL OWNER OPERATING OS  │                                │     LEARNER MARKETPLACE      │
  │  - Fleet & Dual-Pedal Telematics                             │  - Geolocation Radius Search │
  │  - Instructor Staff Delegation                              │  - 28-Day RTO Course Booking │
  │  - Student CRM & Attendance                                   │  - Online Razorpay Payments  │
  │  - Course Packages & Fees                                    │  - ₹15 Referral Wallet Bonus │
  └──────────────┬───────────────┘                                └──────────────┬───────────────┘
                 │                                                               │
                 ▼                                                               ▼
  ┌──────────────────────────────┐                                ┌──────────────────────────────┐
  │   INSTRUCTOR EVALUATION HUB  │                                │  INTERACTIVE APTITUDE ENGINE │
  │  - Daily Road Lessons Route  │                                │  - Free RTO Mock Practice    │
  │  - 1-Click Digital Check-in  │                                │  - 15-Question Timed Exam    │
  │  - 14 Practical Milestones   │                                │  - Category & Answer Review  │
  └──────────────────────────────┘                                └──────────────────────────────┘
```

---

## 🌟 Core Role-Based Portals & Features

### 1. 🛡️ Super Admin Compliance Console (`/admin`)
- **Academy Verification Pipeline**: Review school trade licenses, commercial registrations, and approve/reject partner listings.
- **SaaS Subscription Governance**:
  - Full subscription roster management.
  - **`⭐ Grant 1-Yr Free`**: 1-click partner exemption with automated notification dispatch.
  - **`⚙️ Custom SaaS Rights Modal`**: Tailor custom subscription end dates and monthly/yearly tier overrides.
  - **`⚠️ Compliance Warnings` & `🛑 License Suspension`**: Real-time broadcast and school access control.
- **Financial Analytics & Settlements**: Platform revenue telemetry, gross booking volumes, and transaction tracking.

### 2. 🏫 Driving School Owner Portal (`/school`)
- **Fleet & Compliance Telematics**: Register dual-control vehicles, track RTO fitness certificates, and receive renewal reminders.
- **Certified Instructor Onboarding**: Provision instructor accounts, assign dedicated training vehicles, and monitor lesson loads.
- **Course & Curriculum Builder**: Create and publish 28-Day Comprehensive, 15-Day Fast-Track, and 2-Wheeler packages with 1-click RTO presets.
- **Student CRM & Schedule**: Centralized calendar for batch scheduling, digital attendance tracking, and completion certificates.
- **Direct UPI / Razorpay Settlements**: Instant payment reconciliation with 0% platform commissions on cash admissions.
- **Compliance & Notices Inbox**: Real-time notification bell with 20s polling and 1-click acknowledgement of RTO/Admin directives.

### 3. 👨‍🏫 Instructor Evaluation Hub (`/instructor`)
- **Daily Route & Student Schedule**: View assigned students, pickup points, and training time slots.
- **1-Click Digital Attendance Logging**: Record student presence with live timestamps and vehicle tracking.
- **14-Step Standardized Practical Milestone Engine**:
  - *Phase 1*: ABC Pedal Controls, Clutch Bite-Point Balancing, Steering Slalom.
  - *Phase 2*: RTO 8-Track & H-Track Precision Bay Reversing.
  - *Phase 3*: City Bumper-to-Bumper Rush Hour Traffic, Flyovers & Slope Hill Starts (Zero Rollback).
  - *Phase 4*: Night Driving, Expressway Merging & Final RTO Simulator Mock Exam.

### 4. 👨‍🎓 Learner Portal & Public Marketplace (`/learner`, `/`)
- **Location-Based Academy Discovery**: Interactive search by City, State, or PIN code with customer reviews and verified badges.
- **Standardized Course Explorer (`/for-learners`)**: Transparent course comparison with duration tags, syllabus highlights, and per-day rate breakdowns.
- **Free RTO Aptitude Mock Test Engine (`/aptitude-test`)**:
  - Sticky glassmorphic timer with urgent-mode countdown.
  - Interactive 1-to-15 question jump-navigation matrix and flag-for-review 🚩.
  - Full keyboard shortcuts (`A`, `B`, `C`, `D`, `←`, `→`).
  - Pass/Fail radial scorecard and filterable answer review (`All`, `Correct`, `Incorrect`).
- **₹15 Signup Wallet & Referral System**: Automatic ₹15 wallet credit on registration, redeemable on course enrollments.
- **Milestone Progress Tracker**: Live student dashboard showing attendance logs and practical driving scorecards.

---

## 🛠️ Technology Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Routing & Navigation** | [React Router DOM v6](https://reactrouter.com/) |
| **Styling & Design System** | Modern Vanilla CSS, Glassmorphism, Google Fonts (*Sora*, *Inter*, *IBM Plex Mono*) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Authentication & Security** | JWT (JSON Web Tokens), `bcryptjs`, Role-Based Access Control (RBAC) |
| **Payments** | [Razorpay API](https://razorpay.com/) (Cards, NetBanking, UPI, Wallets) |
| **Mapping & Geolocation** | [Leaflet](https://leafletjs.com/) / [OpenStreetMap](https://www.openstreetmap.org/) |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) (Frontend), [Render](https://render.com/) (Backend) |

---

## 📂 Project Structure

```
drivelearn-india/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets, icons, manifest
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, NotificationBell, etc.)
│   │   ├── context/            # AuthContext, Global state providers
│   │   ├── pages/
│   │   │   ├── admin/          # Super Admin Dashboard & Governance
│   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   ├── instructor/     # Instructor Evaluation & Schedule Portal
│   │   │   ├── learner/        # Learner Dashboard & School Profiles
│   │   │   ├── public/         # Landing, Courses, For Schools, Aptitude Test, Contact
│   │   │   └── school/         # School Owner Academy OS & Fleet Telematics
│   │   ├── services/           # Axios API client & endpoint helpers
│   │   ├── styles/             # Master design system & component styles
│   │   ├── App.jsx             # Route definitions & Role Guards
│   │   └── main.jsx            # React root entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API Service (Node.js + Express)
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & entity models
│   │   └── seed.js             # Comprehensive RTO sample data seed script
│   ├── src/
│   │   ├── controllers/        # Business logic (Auth, Schools, Bookings, Payments, etc.)
│   │   ├── middleware/         # Auth verification, Role validation, Error handlers
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── utils/              # Token generation, helpers, notifications
│   │   └── index.js            # Express server initialization
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) database running locally or on cloud (e.g. Supabase / Neon)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/VT-2004/drivelearn-india.git
cd drivelearn-india
```

### 2. Backend Configuration & Setup
```bash
cd server
npm install

# Create environment configuration
cp .env.example .env
```

Configure your `.env` file in the `server/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/drivelearn_db?schema=public"
JWT_SECRET="your_secure_jwt_secret_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
CLIENT_URL="http://localhost:5173"
```

Run Prisma migrations and seed sample academies:
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 3. Frontend Configuration & Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 🗄️ Core Database Models

```prisma
model User {
  id           Int           @id @default(autoincrement())
  name         String
  email        String        @unique
  password     String
  role         Role          @default(learner) // admin, school_owner, instructor, learner
  phone        String?
  wallet       Wallet?
  bookings     Booking[]
  reviews      Review[]
  school       DrivingSchool?
  instructor   Instructor?
}

model DrivingSchool {
  id             Int             @id @default(autoincrement())
  name           String
  city           String
  state          String
  status         SchoolStatus    @default(active) // active, pending, suspended
  subscriptions  Subscription[]
  courses        Course[]
  instructors    Instructor[]
  vehicles       Vehicle[]
  bookings       Booking[]
  reviews        Review[]
}

model Subscription {
  id         Int                 @id @default(autoincrement())
  schoolId   Int
  school     DrivingSchool       @relation(fields: [schoolId], references: [id])
  plan       SubscriptionPlan    // monthly, yearly
  status     SubscriptionStatus  @default(active) // active, expired
  startDate  DateTime
  endDate    DateTime
}

model Booking {
  id            Int            @id @default(autoincrement())
  userId        Int
  schoolId      Int
  courseId      Int
  instructorId  Int?
  status        BookingStatus  @default(pending) // pending, confirmed, completed, cancelled
  milestones    StudentMilestone[]
  attendances   Attendance[]
  payment       Payment?
}
```

---

## 📜 Compliance & Legal Standards

- **Motor Vehicles Act 1988 & Amendment 2019**: Built adhering to Section 12 for licensing and driver training school standards.
- **RTO Curriculum Standardization**: Pre-configured with official Indian RTO 8-track and H-track testing criteria.
- **Data Privacy & Protection**: Encrypted password storage via bcrypt, stateless JWT session tokens, and secure Razorpay webhook signature verification.

---

## 👥 Contributors & Maintainers

- **Lead Engineer & Project Creator**: [VT-2004](https://github.com/VT-2004)
- **Organization**: DriveLearn India Pvt. Ltd. · Bengaluru, Karnataka

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

© 2026 DriveLearn India Pvt. Ltd. All rights reserved.