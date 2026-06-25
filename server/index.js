const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Some Windows networks fail SRV lookups via system DNS; public DNS fixes mongodb+srv
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const subscriptionRoutes = require('./routes/subscription');
const webhookRoutes = require('./routes/webhook');
const fileRoutes = require('./routes/files');
const { getStorageMode } = require('./utils/storage');
const devStore = require('./utils/devStore');

if (process.env.ENABLE_REMINDER_JOB === 'true') {
  require('./jobs/reminderJob');
}

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) =>
  res.json({
    status: 'ok',
    service: 'flowgenix-lite-api',
    database: devStore.isEnabled() ? 'memory' : 'mongodb',
  })
);

app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/webhook', webhookRoutes);

function ensureDevSecrets() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-jwt-secret-change-in-production';
    console.warn('[dev] JWT_SECRET not set — using local default');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'dev-refresh-secret-change-in-production';
    console.warn('[dev] JWT_REFRESH_SECRET not set — using local default');
  }
}

async function connectDatabase() {
  if (process.env.USE_MEMORY_STORE === 'true') {
    devStore.enable();
    return;
  }

  if (!process.env.MONGODB_URI) {
    if (isDev) {
      devStore.enable();
      return;
    }
    throw new Error('MONGODB_URI is required in production');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected');
  } catch (err) {
    if (isDev) {
      console.warn('MongoDB connection failed — falling back to in-memory store for local dev');
      console.warn(err.message);
      devStore.enable();
      return;
    }
    throw err;
  }
}

async function start() {
  if (isDev) ensureDevSecrets();

  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Flowgenix Lite API running on http://localhost:${PORT}`);
    console.log(`Database: ${devStore.isEnabled() ? 'in-memory (dev)' : 'MongoDB'}`);
    console.log(`File storage: ${getStorageMode()} (local → server/templates/)`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
