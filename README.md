# REPLATE — Food Redistribution Platform
### Give Surplus Food a Second Chance.
**Team NovaNex | Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad**  
**Event:** IETE IDEATHON 2026 | **Theme:** #HACK4SDG | **Goal:** UN Sustainable Development Goal 2 (Zero Hunger)

---

## 1. Project Overview

Restaurants, college canteens, and event organizers regularly produce surplus edible food, while community kitchens and local shelters struggle to feed those in need. **REPLATE** is a centralized, rule-based food redistribution platform designed to bridge this divide with transparency, speed, and dignity.

- **Institution:** Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
- **Target Zones:** Gandipet, Gachibowli, Banjara Hills, Hitec City, and Hyderabad Metro
- **Key Target:** Halving per capita avoidable food waste and ensuring time-sensitive safe consumption handover.

---

## 2. Distinct User Roles & Demo Credentials

The platform features an instant **1-Click "Explore Demo"** button on the Sign-In page (`/login`) and in the dashboard sidebar, allowing judges to test every role without typing credentials:

| Role | Demo Email | Password | Persona & Organization |
| :--- | :--- | :--- | :--- |
| **Food Donor** | `donor@replate.org` | `password123` | Chef Ramesh Kumar (CBIT Central Canteen & Mess, Gandipet) |
| **NGO / Kitchen** | `ngo@replate.org` | `password123` | Priya Sharma (Akshaya Seva Food Foundation, Puppalguda/Gandipet) |
| **Volunteer Logistics** | `volunteer@replate.org` | `password123` | Arjun Varma (NovaNex Swift Logistics Fleet, Hyderabad) |
| **System Administrator**| `admin@replate.org` | `password123` | Dr. K. Srinivas (CBIT Ideathon Admin Console) |

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Lucide Icons, Recharts, Canvas Confetti.
- **Backend:** Node.js (v22), Express.js REST API Architecture, JWT Authentication, BCrypt Password Hashing.
- **Database:** MongoDB & Mongoose schemas with an embedded **Dual-Persistence Engine** (`server/data/db.json`) for seamless zero-setup execution if a local MongoDB service is not started.

---

## 4. Design Direction & Color Palette

Built with a modern, white-first SaaS aesthetic suited for public health, sustainability, and institutional credibility:

- **Main Background:** `#FFFFFF` (Predominantly clean white)
- **Secondary / Canvas Background:** `#F7F9F8`
- **Primary Sustainability Green:** `#16845B`
- **Dark Forest Green:** `#116747`
- **Light Emerald Tint:** `#EAF6EF`
- **Primary Text:** Dark Charcoal `#202923`
- **Secondary Text:** Muted Slate `#6B756F`
- **Borders:** Subtle Light Grey `#E5EAE6`
- **Urgency & Deadline Accent:** Warm Orange `#F2A44A`
- **Typography:** Inter Sans-Serif font

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node.js v22)
- npm (v9 or higher)

### Step 1: Install Dependencies
Run the following commands from the project root:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Seed the Database
Populate the database with realistic demonstration records (CBIT Canteen, Minerva Grand, Akshaya Seva Foundation, Robin Hood Army, active listings, requests, and tracking audits):

```bash
cd server
npm run seed
cd ..
```

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Server runs on http://localhost:5000
# API status endpoint: http://localhost:5000/api/system/status
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 6. Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=replate_jwt_secret_dev_cbit_novanex_2026

# Optional: MongoDB connection string (Local or MongoDB Atlas)
# If left empty, REPLATE automatically uses the local persistence engine with full feature parity.
MONGODB_URI=
```

---

## 7. Complete End-to-End Demonstration Walkthrough

You can test or demonstrate the complete 13-step lifecycle:

1. **Public Landing Page (`/`):**
   - High-quality hero photograph, SDG 2 mission badge, 3-step workflow, benefits, impact preview metrics, and footer.
2. **Donor Post Food (`/donor/donations/new`):**
   - Click "Explore Demo -> Food Donor".
   - Click **+ Post Surplus Food**.
   - Use the **Quick Demo Presets** (e.g., *40 Servings Veg Biryani*) or input custom values.
   - Fill in food information, pickup address, and safe consumption deadline.
   - Click **Publish Surplus Food Listing** -> Notice live preview card and confirmation modal.
3. **NGO Discovery & Smart Matching (`/ngo/dashboard`):**
   - Use the **Switch Demo Role** sidebar widget and select **NGO**.
   - View newly listed food in the **Discover Food** feed or click **Smart Matches**.
   - Observe the explainable rule-based match score (e.g. *99% Match Compatibility*) and rationale pills (*Within your priority service zone*, *Sufficient safe consumption window*).
   - Click **Request Donation**, enter estimated beneficiaries (e.g. 50 people), and submit.
4. **Donor Review & Reservation (`/donor/dashboard`):**
   - Switch back to **Donor**.
   - Notice the pending request notification badge. Click **Review Request** -> **Accept & Reserve Food**.
5. **Volunteer Logistics Handover (`/volunteer/dashboard`):**
   - Switch to **Volunteer**.
   - Click **Confirm Pickup** -> Food transitions to *Picked Up (In Transit)*.
   - Click **Confirm Handover & Complete** -> Triggers verified completion celebration confetti!
6. **Timeline & Audit Tracking (`/tracking/:id`):**
   - Inspect the complete vertical audit timeline with timestamped milestones, actor names, and roles.
7. **Impact Analytics (`/impact`):**
   - Review transparent impact calculations: Estimated Meals Served, Food Waste Diverted (kg), CO2e Prevented (kg), and Recharts charts.
8. **Admin Operations (`/admin/dashboard`):**
   - Inspect all users, verify organizations, view all listings, and review platform-wide audit logs.

---

## 8. Automated E2E Test Suite

To verify the complete 13-step lifecycle programmatically without manual clicking, run:

```bash
cd server
node scripts/test-e2e.js
```

All 13 test steps will execute sequentially and output `[PASS]` status for each transition.

---

## 9. Sustainable Development Goals Alignment

- **UN SDG Goal 2: Zero Hunger (Target 2.1 & 2.2):** Ensuring access to safe, nutritious, and sufficient food all year round.
- **UN SDG Goal 12: Responsible Consumption and Production (Target 12.3):** Halving global food waste per capita by reducing avoidable surplus losses.
- **UN SDG Goal 13: Climate Action:** Diverting organic food waste from methane-emitting landfills.

---

© 2026 REPLATE · Developed by **Team NovaNex** (CBIT Hyderabad) for **IETE IDEATHON 2026**.
