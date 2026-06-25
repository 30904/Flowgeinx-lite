const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');
const { uploadFile, getFileUrl } = require('../utils/storage');
const devStore = require('../utils/devStore');
const { localDevExtract } = require('../utils/localExtract');
const { resolveUser } = require('../utils/resolveUser');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const FREE_DOC_LIMIT = 10;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

const defaultReminders = () => [
  { daysBefore: 30, sent: false },
  { daysBefore: 7, sent: false },
  { daysBefore: 1, sent: false },
];

async function callAIExtract(fileBuffer, mimeType) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_base64: fileBuffer.toString('base64'),
        mime_type: mimeType,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI extract failed (${res.status}): ${text}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function callAIQA(docSummary, keyFields, question) {
  const res = await fetch(`${AI_SERVICE_URL}/ai/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_summary: docSummary,
      key_fields: keyFields || {},
      question,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI QA failed: ${text}`);
  }
  return res.json();
}

router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const user = await resolveUser(req.user);
    if (!user) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    if (user.subscription.plan === 'free' && user.docCount >= FREE_DOC_LIMIT) {
      return res.status(403).json({
        error: 'Free tier limit reached (10 documents). Upgrade to Basic or Pro.',
      });
    }

    const fileKey = `docs/${user._id}/${Date.now()}-${req.file.originalname}`;
    await uploadFile(req.file.buffer, fileKey, req.file.mimetype);
    const signedUrl = await getFileUrl(fileKey);

    let aiData = {};
    try {
      aiData = await callAIExtract(req.file.buffer, req.file.mimetype);
    } catch (aiErr) {
      console.error('AI extraction error:', aiErr.message);
      console.error(
        'Tip: run `npm run dev:ai` from repo root and set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env'
      );
      aiData = localDevExtract(req.file.originalname, req.file.mimetype);
    }

    const docPayload = {
      userId: user._id,
      originalFileName: req.file.originalname,
      fileKey,
      fileUrl: signedUrl,
      mimeType: req.file.mimetype,
      source: 'upload',
      category: aiData.category || 'other',
      aiExtracted: {
        documentType: aiData.documentType,
        holderName: aiData.holderName,
        issuedDate: aiData.issuedDate ? new Date(aiData.issuedDate) : null,
        expiryDate: aiData.expiryDate ? new Date(aiData.expiryDate) : null,
        keyFields: aiData.keyFields || {},
        summary: aiData.summary,
        confidence: aiData.confidence,
      },
      reminders: defaultReminders(),
    };

    let doc;
    if (devStore.isEnabled()) {
      doc = devStore.createDocument(docPayload);
      devStore.incrementDocCount(user._id);
    } else {
      doc = await Document.create(docPayload);
      user.docCount += 1;
      await user.save();
    }

    res.status(201).json({ document: doc });
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { category, search } = req.query;

    if (devStore.isEnabled()) {
      const all = devStore.listDocuments(req.user.userId, { category, search });
      const total = all.length;
      const docs = all.slice((page - 1) * limit, page * limit);
      return res.json({
        docs,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      });
    }

    const filter = {
      userId: req.user.userId,
      isDeleted: false,
    };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { originalFileName: { $regex: search, $options: 'i' } },
        { 'aiExtracted.documentType': { $regex: search, $options: 'i' } },
        { 'aiExtracted.holderName': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Document.countDocuments(filter);
    const docs = await Document.find(filter)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      docs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('list docs error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    if (devStore.isEnabled()) {
      const doc = devStore.findDocument(req.params.id, req.user.userId);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      const signedUrl = await getFileUrl(doc.fileKey);
      return res.json({ ...doc, fileUrl: signedUrl });
    }

    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const signedUrl = await getFileUrl(doc.fileKey);
    const docObj = doc.toObject();
    docObj.fileUrl = signedUrl;

    res.json(docObj);
  } catch (err) {
    console.error('get doc error:', err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (devStore.isEnabled()) {
      const ok = devStore.softDeleteDocument(req.params.id, req.user.userId);
      if (!ok) return res.status(404).json({ error: 'Document not found' });
      return res.json({ success: true });
    }

    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    doc.isDeleted = true;
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ success: true });
  } catch (err) {
    console.error('delete doc error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

function localDevAnswer(doc, question) {
  const ai = doc.aiExtracted || {};
  const q = question.toLowerCase();

  if (q.includes('expir')) {
    return ai.expiryDate
      ? `This document expires on ${new Date(ai.expiryDate).toLocaleDateString('en-IN')}.`
      : 'No expiry date was extracted from this document.';
  }
  if (q.includes('holder') || q.includes('who')) {
    return ai.holderName
      ? `The holder name is ${ai.holderName}.`
      : 'No holder name was extracted.';
  }
  if (q.includes('type') || q.includes('what kind')) {
    return ai.documentType
      ? `This is a ${ai.documentType}.`
      : 'The document type could not be determined.';
  }
  if (q.includes('summar') || q.includes('key')) {
    if (ai.summary) return ai.summary;
    if (ai.keyFields && Object.keys(ai.keyFields).length) {
      return Object.entries(ai.keyFields)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
  }
  if (ai.summary) return ai.summary;
  return `I can answer questions about expiry, holder name, and key fields for ${ai.documentType || doc.originalFileName || 'this document'}.`;
}

router.post('/:id/ask', authenticate, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    let doc;
    if (devStore.isEnabled()) {
      doc = devStore.findDocument(req.params.id, req.user.userId);
    } else {
      doc = await Document.findOne({
        _id: req.params.id,
        userId: req.user.userId,
        isDeleted: false,
      });
    }
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    try {
      const result = await callAIQA(
        doc.aiExtracted?.summary || '',
        doc.aiExtracted?.keyFields || {},
        question
      );
      return res.json({ answer: result.answer });
    } catch (aiErr) {
      if (devStore.isEnabled() || process.env.NODE_ENV !== 'production') {
        console.warn('AI QA unavailable, using local fallback:', aiErr.message);
        return res.json({ answer: localDevAnswer(doc, question) });
      }
      throw aiErr;
    }
  } catch (err) {
    console.error('ask error:', err);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

router.patch('/:id/tags', authenticate, async (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be an array' });

    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    doc.tags = tags;
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ document: doc });
  } catch (err) {
    console.error('tags error:', err);
    res.status(500).json({ error: 'Failed to update tags' });
  }
});

module.exports = router;
