# Flowgenix Lite — Frontend (Sarah)

React 18 + Vite + PWA + Tailwind starter. Wired to Arnav's backend at `http://localhost:5000`.

## Quick start

**Terminal 1 — backend (Arnav):**
```bash
cd server
npm run dev
```

**Terminal 2 — frontend (Sarah):**
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

API calls use Vite proxy: `/api/*` → `http://localhost:5000`

## What's included (T09–T13 starter)

| Task | File(s) | Status |
|------|---------|--------|
| T09 Vite + React + PWA + Tailwind | `vite.config.js`, `tailwind.config.js` | Done |
| T10 Navy/teal theme + Navbar | `tailwind.config.js`, `components/Navbar.jsx` | Done |
| T11 Landing page | `pages/Landing.jsx` | Done |
| T12 Auth UI (phone + OTP) | `pages/Auth.jsx` | Done |
| T13 AuthContext + API layer | `context/AuthContext.jsx`, `services/api.js` | Done |
| T14 Dashboard placeholder | `pages/Dashboard.jsx` | Starter only |

## Sarah's next tasks

1. **Polish UI** to match flowgenix.ai (reference login Heramb provided)
2. **T15** — Extract `DocumentCard.jsx` from dashboard grid
3. **T16** — Extract `VaultSidebar.jsx` from dashboard sidebar
4. **T17** — `UploadModal.jsx` → `api.uploadDocument(file)`
5. **T18** — `DocDetail.jsx` → `api.getDocument(id)`

## Project structure

```
client/src/
├── components/     Navbar, ProtectedRoute
├── context/        AuthContext
├── pages/          Landing, Auth, Dashboard
├── services/       api.js
├── App.jsx
└── main.jsx
```

## Auth flow (already wired)

1. User enters 10-digit phone → `POST /api/auth/send-otp`
2. User enters OTP → `POST /api/auth/verify-otp`
3. Tokens saved in `localStorage` → redirect to `/vault`

**Dev OTP:** If SMS not configured, OTP prints in Arnav's server console.

## Theme colors

- Navy: `#0D1B2A`
- Teal: `#00B4D8`

Use Tailwind classes: `bg-navy`, `text-teal`, `btn-primary`, etc.

## PWA icons

Replace `public/pwa-192.png` and `public/pwa-512.png` with real app icons before launch (optional for dev).

## Production API URL

Create `client/.env`:
```
VITE_API_URL=https://your-api.railway.app
```
