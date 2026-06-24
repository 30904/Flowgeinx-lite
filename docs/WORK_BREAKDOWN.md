# Flowgenix Lite — Work Breakdown (Arnav + Sarah)

**Project:** DocDrop / Flowgenix Lite — AI document vault with WhatsApp ingestion  
**Timeline:** 3 weeks (P0 = Week 1 MVP, P1 = Week 2–3 launch, P2/P3 = polish)  
**Tech:** React PWA (Sarah) | Node.js + Express + Python FastAPI (Arnav)

**Architecture decision:** Node.js handles the REST API, auth, webhooks, and integrations; Python runs only the AI microservice (extraction + Q&A). This matches the implementation guide and is the recommended setup — no pure-Python API needed.

---

## Role Split

| Area | Owner | Scope |
|------|-------|--------|
| **Backend API** | Arnav | Node.js 20 + Express — auth, documents, subscriptions, WhatsApp webhook |
| **AI Service** | Arnav | Python 3.11 + FastAPI — document extraction + Q&A (Claude API) |
| **Database** | Arnav | MongoDB Atlas — User, Document, OTP schemas |
| **Integrations** | Arnav | R2 storage, Razorpay, WhatsApp Meta API, Fast2SMS OTP |
| **Frontend PWA** | Sarah | React 18 + Vite + Tailwind — all pages and components |
| **UI/UX** | Sarah | Match flowgenix.ai look (navy `#0D1B2A`, teal `#00B4D8`) |

---

## Week 1 — MVP Foundation (P0)

### Arnav (Backend) — do in order

1. **Repo + MongoDB** — Atlas M0 cluster, connect Mongoose
2. **Schemas** — `User`, `Document`, `OTP` (TTL 5 min)
3. **Auth APIs** — `POST /api/auth/send-otp`, `verify-otp`, `refresh`
4. **R2 storage** — `uploadToR2`, `getSignedFileUrl`
5. **AI service** — FastAPI `/ai/extract` (Claude)
6. **Upload pipeline** — `POST /api/documents/upload` → R2 → AI → MongoDB
7. **Document CRUD** — list, get by id, soft delete

### Sarah (Frontend) — parallel after API contracts shared

1. **Vite + React + PWA** — `vite-plugin-pwa`, manifest, icons
2. **Tailwind** — navy/teal theme from PDF
3. **Landing.jsx** — hero, 3 feature cards, WhatsApp number CTA
4. **Auth.jsx** — phone + 6-digit OTP (no password)
5. **AuthContext + api.js** — wire to Arnav’s auth endpoints

---

## Week 2 — Full Product (P0/P1)

### Arnav

- `POST /api/documents/:id/ask` + Python `/ai/qa`
- WhatsApp webhook (Meta verify + media ingest)
- WhatsApp confirmation messages
- `PATCH /api/documents/:id/tags`

### Sarah

- **Dashboard.jsx** — VaultSidebar + DocumentCard grid + search
- **UploadModal.jsx** — upload progress + extraction preview
- **DocDetail.jsx** — fields, preview, Q&A chat
- Connect all document APIs

---

## Week 3 — Monetization + Launch (P1/P2)

### Arnav

- Razorpay subscription create + webhook
- Free tier limit (10 docs)
- Reminder cron (9 AM IST) + WhatsApp reminders
- Railway deploy (Node + Python)

### Sarah

- **Subscription.jsx** — Free / Basic ₹99 / Pro ₹249 cards
- PWA install prompt
- Vercel deploy
- Polish mobile-first layout

---

## Week 3+ (P3)

- Family vault (Pro) — Arnav APIs, Sarah UI
- ReminderBadge component

---

## API Contract (share with Sarah early)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `/api/auth/send-otp` | POST | No | `{ phone }` |
| `/api/auth/verify-otp` | POST | No | `{ phone, otp }` → tokens + user |
| `/api/auth/refresh` | POST | No | `{ refreshToken }` |
| `/api/documents/upload` | POST | Bearer | multipart `file` |
| `/api/documents` | GET | Bearer | `?category&page&limit&search` |
| `/api/documents/:id` | GET | Bearer | signed file URL |
| `/api/documents/:id` | DELETE | Bearer | soft delete |
| `/api/documents/:id/ask` | POST | Bearer | `{ question }` |
| `/api/documents/:id/tags` | PATCH | Bearer | `{ tags: [] }` |
| `/api/subscription/create` | POST | Bearer | `{ planId }` |
| `/api/subscription/status` | GET | Bearer | current plan |

**Base URL (dev):** `http://localhost:5000`

---

## Subscription Plans

| Plan | Price | Limits |
|------|-------|--------|
| Free | ₹0 | 10 docs, 5 Q&A/month, no WhatsApp bot |
| Basic | ₹99/mo | Unlimited docs + Q&A + WhatsApp + reminders |
| Pro | ₹249/mo | Basic + Family vault (5 members) + export |

---

## Excel File

Open `docs/Flowgenix_Lite_Work_Breakdown.csv` in Excel for sortable task list with Status column.
