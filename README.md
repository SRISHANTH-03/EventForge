# EventForge — Intelligent Event Operations Platform

EventForge is an intelligent, full-stack event operations platform designed for college clubs, conferences, hackathons, workshops, Toastmasters, and community events. It replaces the messy, error-prone combination of WhatsApp groups, spreadsheets, Google Forms, and separate task lists with one coherent, calm operations workspace.

---

## Table of Contents
- [1. Visual Design & Aesthetics](#1-visual-design--aesthetics)
- [2. System Architecture](#2-system-architecture)
- [3. Key Features](#3-key-features)
- [4. Signature Feature: Event Twin Engine](#4-signature-feature-event-twin-engine)
- [5. Grounded AI Assistant & Briefing Generator](#5-grounded-ai-assistant--briefing-generator)
- [6. Demo Accounts & Credentials](#6-demo-accounts--credentials)
- [7. Getting Started](#7-getting-started)
- [8. Seeding Demo Data](#8-seeding-demo-data)
- [9. REST API Overview](#9-rest-api-overview)
- [10. Troubleshooting](#10-troubleshooting)

---

## 1. Visual Design & Aesthetics

EventForge follows an editorial, calm, and human-centered design philosophy inspired by high-end printed journals and modern productivity tools:
- **Primary Forest Green**: `#176B57`
- **Deep Green**: `#0E4F42`
- **Muted Teal**: `#3B8C7A`
- **Warm White Background**: `#FAF9F5`
- **Soft Mint Surfaces**: `#EAF4F0`
- **Main Body Text**: `#25312D`
- **Muted Text**: `#68756F`
- **Dividers & Borders**: `#D7E1DC`
- **STRICT HARD RULE**: **ZERO purple** anywhere in the product (no purple gradients, badges, shadows, or charts). No giant dark-blue hero sections.

---

## 2. System Architecture

EventForge is built as a modular MERN monorepo:

```
eventforge/
├── apps/
│   ├── api/                     # Node.js + Express + MongoDB Backend
│   │   ├── src/
│   │   │   ├── config/          # DB connection & validated environment config
│   │   │   ├── models/          # 14 Mongoose Models (User, Event, Room, Session, etc.)
│   │   │   ├── middleware/      # JWT auth, role RBAC, Zod validation, error handler
│   │   │   ├── controllers/     # Modular business logic
│   │   │   ├── routes/          # REST endpoints
│   │   │   ├── modules/
│   │   │   │   ├── event-twin/  # Deterministic simulation heuristics & actions
│   │   │   │   └── ai/          # Grounded assistant & briefing generator
│   │   │   ├── seed/            # Comprehensive seed script for EventForge Summit 2026
│   │   │   └── server.js        # Express application entry
│   │   └── package.json
│   └── web/                     # React 18 + Vite + Tailwind CSS Frontend
│       ├── src/
│       │   ├── components/      # UI component library, QRScanner, Navbar
│       │   ├── context/         # AuthContext (with 1-click persona switcher), ToastContext
│       │   ├── pages/           # Landing, Auth, Dashboard, Workspace, Tickets, Portal, Admin
│       │   ├── services/        # Fetch API client
│       │   ├── App.jsx          # Route definitions & guards
│       │   └── main.jsx
│       └── package.json
├── package.json                 # Monorepo orchestrator scripts
├── test-e2e-journey.js          # Automated end-to-end user journey test suite
└── README.md
```

---

## 3. Key Features

1. **Role-Based Access Control (RBAC)**: Distinct experiences for Organizers, Volunteers, Attendees, Speakers, and Platform Admins.
2. **Organizer Command Center**: Answers 4 core questions immediately: *What is happening? What needs attention? What is at risk? What should I do next?*
3. **Event Readiness Center**: Computes real-time percentage readiness across Registration, Venue, Speakers, Volunteers, Tasks, and Communications.
4. **Interactive Agenda Builder**: Visual timeline with collision detection for double-booked rooms and overlapping speaker sessions.
5. **Mobile-First Attendee Flow**: 10-second registration, high-contrast QR tickets, dynamic "Today" timeline, room navigation, and session feedback.
6. **QR Check-in Scanner**: Camera-based scanning via `html5-qrcode` plus instant manual code entry, handling duplicate scans with timestamp warnings.
7. **Volunteer Shift & Task Board**: Shift allocation, station assignments, and 1-tap mobile task status toggling.

---

## 4. Signature Feature: Event Twin Engine

The **Event Twin** models event-day operational dynamics using deterministic mathematical calculations:
- **Room Pressure**:
  $$\text{Pressure} = \frac{\text{Expected Attendees}}{\text{Room Capacity}} \times 100\%$$
- **Transition Risk**: Flags back-to-back sessions in different halls with $< 10$ minutes transit time.
- **Registration Queue Pressure**: Compares peak arrival rush against volunteer station throughput ($30\text{ check-ins} / \text{volunteer} / 45\text{ mins}$).
- **Dependency & Ownership Risk**: Flags critical operational tasks without assigned single-threaded owners.
- **Preset Scenarios**:
  - *"Attendance increases by 30%"*
  - *"Keynote delayed by 15 minutes"*
  - *"Room becomes unavailable (Workshop Room maintenance)"*
  - *"Two volunteers unavailable (Morning rush shortage)"*
  - *"Popular session reaches 120% expected attendance"*
- **Explainability**: Every warning provides: *What changed*, *Why it happened*, *Assumptions*, *Downstream effects*, and a 1-click **Apply Recommendation** action.

---

## 5. Grounded AI Assistant & Briefing Generator

- **Grounded Q&A**: Answers queries like *"Who is speaking at 4 PM?"*, *"Which volunteers are assigned to registration?"*, or *"What tasks are overdue?"* strictly from official database records. If details are absent, it states *"I couldn't find that information in this event."* (Zero hallucination).
- **Offline Fallback**: Operates deterministically without requiring third-party API keys, while supporting external Gemini/OpenAI keys if configured.
- **Briefing Generator**: Creates editable briefings for Morning Operations, Volunteer Crews, Speaker Preparation, and Attendee Welcome Guides.

---

## 6. Demo Accounts & Credentials

EventForge includes 5 pre-configured demo personas:

| Role | Demo Email | Development Password | Primary View |
|---|---|---|---|
| **Organizer** | `organizer@eventforge.demo` | `DemoPass123!` | `/dashboard`, `/events/:id/workspace` |
| **Volunteer** | `volunteer@eventforge.demo` | `DemoPass123!` | `/volunteer` (Mobile Shift Board) |
| **Attendee** | `attendee@eventforge.demo` | `DemoPass123!` | `/portal/:slug`, `/tickets/:code` |
| **Speaker** | `speaker@eventforge.demo` | `DemoPass123!` | Public agenda & speaker schedule |
| **Admin** | `admin@eventforge.demo` | `DemoPass123!` | `/admin` (Platform overview) |

> **Pro Tip**: Use the **"Demo Switcher"** in the top navigation bar to switch between personas instantly with one click!

---

## 7. Getting Started

### Prerequisites
- **Node.js** v18+ (tested on Node v25.6.1)
- **MongoDB** running locally on port 27017 (`mongodb://127.0.0.1:27017/eventforge`)

### Installation
From the repository root:
```bash
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

### Environment Configuration
Copy the template in `apps/api/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/eventforge
JWT_SECRET=eventforge_jwt_super_secret_production_key_2026!
CLIENT_URL=http://localhost:5173
```

---

## 8. Seeding Demo Data

To populate the flagship event **"EventForge Summit 2026"** with 4 rooms, 7 sessions, 8 volunteers, 16 tasks, 26 registered attendees, and pre-calculated Event Twin simulations:

```bash
npm run seed
# or
npm run db:seed
```

---

## 9. Development & Testing Commands

### Running Locally
To launch both API (port 5001) and Frontend (port 5173):
```bash
npm run dev
```

Or run individually:
```bash
# Terminal 1: Backend API
cd apps/api && npm run dev

# Terminal 2: Vite Frontend
cd apps/web && npm run dev
```

### Running the End-to-End Test Suite
To execute the complete 17-step user journey test (Organizer signup $\to$ event creation $\to$ attendee registration $\to$ QR check-in $\to$ Event Twin simulation $\to$ AI briefing):
```bash
node test-e2e-journey.js
```

---

## 10. REST API Overview

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/demo`, `GET /api/auth/me`
- **Events**: `GET /api/events`, `POST /api/events`, `GET /api/events/:id`, `PATCH /api/events/:id`, `GET /api/events/:id/readiness`
- **Sessions & Rooms**: `GET /api/events/:id/sessions`, `POST /api/events/:id/sessions`, `GET /api/events/:id/sessions/rooms`
- **Registration & Check-In**: `POST /api/events/:id/attendees/register`, `POST /api/events/:id/checkin`, `GET /api/tickets/:ticketCode`
- **Volunteers & Tasks**: `GET /api/events/:id/volunteers`, `GET /api/events/:id/tasks`, `PATCH /api/tasks/:id`
- **Event Twin**: `GET /api/events/:id/twin/scenarios`, `POST /api/events/:id/twin/simulate`, `POST /api/events/:id/twin/apply-action`
- **AI Operations**: `POST /api/events/:id/ai/assistant`, `POST /api/events/:id/ai/summarize`
- **Analytics**: `GET /api/events/:id/analytics`

---

## 11. Troubleshooting

- **MongoDB connection refused**: Ensure `mongod` is running on `127.0.0.1:27017` via `brew services start mongodb-community`.
- **Port conflicts**: By default, the API binds to port 5001 and Vite binds to port 5173. Configure `PORT` in `apps/api/.env` if port 5001 is in use.
- **Camera QR Scanner permissions**: When using the check-in scanner on a phone or laptop browser, allow camera permissions when prompted or switch to the **"Manual"** tab to paste ticket codes.
# EventForge
