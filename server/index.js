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

if (process.env.ENABLE_REMINDER_JOB === 'true') {
  require('./jobs/reminderJob');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'flowgenix-lite-api' }));

app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/webhook', webhookRoutes);

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  app.listen(PORT, () => {
    console.log(`Flowgenix Lite API running on http://localhost:${PORT}`);
    console.log(`File storage: ${getStorageMode()} (local → server/templates/)`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
