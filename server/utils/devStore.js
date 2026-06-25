/**
 * In-memory store for local dev when MongoDB is unavailable.
 * Not for production use.
 */

let enabled = false;

const otps = new Map();
const usersByPhone = new Map();
const usersById = new Map();
const documents = new Map();

let userCounter = 1;
let docCounter = 1;

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function enable() {
  enabled = true;
  console.warn('[devStore] Using in-memory database — data resets on server restart');
}

function isEnabled() {
  return enabled;
}

function saveOtp(phone, otp) {
  otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
}

function verifyOtp(phone, otp) {
  const record = otps.get(phone);
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return false;
  }
  otps.delete(phone);
  return true;
}

function findOrCreateUser(phone, email) {
  let user = usersByPhone.get(phone);
  if (!user) {
    const id = newId('user');
    user = {
      _id: id,
      phone,
      name: null,
      email: email || null,
      subscription: { plan: 'free', status: 'active' },
      docCount: 0,
    };
    usersByPhone.set(phone, user);
    usersById.set(id, user);
  } else if (email) {
    user.email = email;
  }
  return user;
}

function findUserById(id) {
  return usersById.get(id) || null;
}

function ensureUser(userId, phone) {
  const existing = usersById.get(userId);
  if (existing) return existing;

  if (phone) {
    const byPhone = usersByPhone.get(phone);
    if (byPhone) return byPhone;

    const user = {
      _id: userId,
      phone,
      name: null,
      subscription: { plan: 'free', status: 'active' },
      docCount: 0,
    };
    usersById.set(userId, user);
    usersByPhone.set(phone, user);
    console.warn(`[devStore] Restored user +91${phone} (in-memory data was cleared)`);
    return user;
  }

  return null;
}

function incrementDocCount(userId) {
  const user = usersById.get(userId);
  if (user) user.docCount += 1;
}

function listDocuments(userId, { category, search } = {}) {
  let docs = [...documents.values()].filter((d) => d.userId === userId && !d.isDeleted);

  if (category) docs = docs.filter((d) => d.category === category);
  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.originalFileName?.toLowerCase().includes(q) ||
        d.aiExtracted?.documentType?.toLowerCase().includes(q) ||
        d.aiExtracted?.holderName?.toLowerCase().includes(q)
    );
  }

  docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return docs;
}

function createDocument(data) {
  const id = newId('doc');
  const doc = {
    _id: id,
    isDeleted: false,
    uploadedAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    reminders: [
      { daysBefore: 30, sent: false },
      { daysBefore: 7, sent: false },
      { daysBefore: 1, sent: false },
    ],
    ...data,
  };
  documents.set(id, doc);
  return doc;
}

function findDocument(id, userId) {
  const doc = documents.get(id);
  if (!doc || doc.userId !== userId || doc.isDeleted) return null;
  return doc;
}

function softDeleteDocument(id, userId) {
  const doc = findDocument(id, userId);
  if (!doc) return false;
  doc.isDeleted = true;
  doc.updatedAt = new Date();
  return true;
}

function updateSubscription(userId, updates) {
  const user = usersById.get(userId);
  if (!user) return null;
  user.subscription = { ...user.subscription, ...updates };
  return user;
}

module.exports = {
  enable,
  isEnabled,
  saveOtp,
  verifyOtp,
  findOrCreateUser,
  findUserById,
  ensureUser,
  incrementDocCount,
  listDocuments,
  createDocument,
  findDocument,
  softDeleteDocument,
  updateSubscription,
};
