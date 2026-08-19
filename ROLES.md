# 👥 Role-Based Access Control (RBAC) & Permissions — DriveLearn India

Detailed permission matrix outlining access controls across all four user roles and public visitors on DriveLearn India.

---

## 📊 Feature & Action Permission Matrix

| Feature / Action | Public / Guest | Super Admin | School Owner | Instructor | Learner |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Landing & RTO Courses Explorer** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Free 15-Question RTO Aptitude Mock Quiz** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Geolocation Academy Radius Search** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Registration / Signup** | ✅ | ❌ (Internal) | ✅ (School Self-Signup) | ❌ (Staff Invited) | ✅ (Learner Self-Signup) |
| **Login & Password Recovery** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Claim ₹15 Welcome Bonus Credit** | ❌ | ❌ | ❌ | ❌ | ✅ (Auto on Register) |
| **Review & Approve School KYC Licenses** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Grant 1-Yr Free SaaS Exemption** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Override Subscription Rights & Dates** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Issue Compliance Warnings & Suspend** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Acknowledge Compliance Warning Notices** | ❌ | ❌ | ✅ (1-Click Ack) | ❌ | ❌ |
| **Manage Academy Profile, Address & Maps** | ❌ | ❌ | ✅ (Own Academy) | ❌ | ❌ |
| **Register Dual-Control Fleet Vehicles** | ❌ | ❌ | ✅ (Own Academy) | ❌ | ❌ |
| **Onboard Certified Instructors** | ❌ | ❌ | ✅ (Staff Roster) | ❌ | ❌ |
| **Create & Publish Course Packages** | ❌ | ❌ | ✅ (RTO Presets) | ❌ | ❌ |
| **Book Driving Courses & Online Checkout**| ❌ | ❌ | ❌ | ❌ | ✅ (Razorpay / UPI) |
| **View Assigned Road Training Schedule** | ❌ | ❌ | ✅ (All Academy) | ✅ (Assigned Route) | ✅ (Own Calendar) |
| **Mark Daily Student Attendance** | ❌ | ❌ | ✅ (Override) | ✅ (1-Click Logger) | ❌ (Read-only Log) |
| **Assess 14-Step Practical Milestones** | ❌ | ❌ | ❌ | ✅ (Skill Grading) | ❌ (Read Progress) |
| **Write Verified Academy Review & Rating**| ❌ | ❌ | ❌ | ❌ | ✅ (Enrolled Only) |
| **Platform-Wide Financial Telemetry** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Academy Monthly Statement & Payouts** | ❌ | ❌ | ✅ (Own Academy) | ❌ | ❌ |

---

## 🛡️ Role Architectural Overview

### 1. 🛡️ Super Admin (`admin`)
- **Root Authority**: Oversees national driving school operations, platform revenue, and statutory RTO compliance.
- **Access Route**: `/admin`
- **Capabilities**: Approve/reject new school applications, grant SaaS duration exemptions, issue formal warning notices, enforce temporary suspensions, and inspect audit logs.

### 2. 🏫 School Owner (`school_owner`)
- **Academy Operator**: Runs the day-to-day operations of an accredited driving school.
- **Access Route**: `/school`
- **Capabilities**: Manage dual-control vehicle fleet, provision certified instructor accounts, publish course packages, schedule batches, track student enrollments, and manage SaaS subscriptions.

### 3. 👨‍🏫 Certified Instructor (`instructor`)
- **Road Safety Trainer**: Conducts hands-on practical driving lessons.
- **Access Route**: `/instructor`
- **Capabilities**: View daily pickup schedules, log digital student attendance with timestamps, and evaluate student proficiency across 14 standardized practical milestones.

### 4. 👨‍🎓 Learner (`learner`)
- **Student Driver**: Discovers academies and prepares for official RTO driver licensing.
- **Access Route**: `/learner`
- **Capabilities**: Search nearby verified schools, take free timed mock aptitude quizzes, book courses online, redeem ₹15 wallet bonus, and monitor practical driving progress.

---

© 2026 DriveLearn India Pvt. Ltd. · Role Permission Governance