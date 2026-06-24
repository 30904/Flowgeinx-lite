# Flowgenix Lite

DocDrop — AI document vault for Indian personal documents (Aadhaar, PAN, insurance, leases, etc.).

## Project structure

```
flowgenix-lite/
├── client/          # React PWA (Sarah)
├── server/          # Node.js + Express API (Arnav)
├── ai-service/      # Python FastAPI + Claude (Arnav)
└── docs/            # Work breakdown + specs
```

## Backend quick start (Arnav)

### 1. Environment

Copy `.env.example` to `.env` and fill in MongoDB Atlas URI at minimum.

For local dev without SMS, OTP is printed to the server console when `FAST2SMS_KEY` is empty.

### 2. Install & run API

```bash
cd server
npm install
npm run dev
```

API: http://localhost:5000  
Health: http://localhost:5000/health

### 3. Install & run AI service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

AI health: http://localhost:8001/health

### 4. Test OTP auth

```bash
curl -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phone\":\"9876543210\"}"
# Check server console for OTP in dev

curl -X POST http://localhost:5000/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"phone\":\"9876543210\",\"otp\":\"123456\"}"
```

## Work allocation

See `docs/WORK_BREAKDOWN.md` and `docs/Flowgenix_Lite_Work_Breakdown.csv` (open in Excel).

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, PWA, Tailwind |
| API | Node 20, Express 4, Mongoose |
| AI | Python 3.11, FastAPI, Claude API |
| DB | MongoDB Atlas |
| Storage | Cloudflare R2 |
| Payments | Razorpay Subscriptions |
| Messaging | WhatsApp Business Cloud API |
