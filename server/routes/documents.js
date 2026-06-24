const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { uploadFile, getFileUrl } = require('../utils/storage');

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

async function callAIExtract(fileUrl, mimeType) {
  const res = await fetch(`${AI_SERVICE_URL}/ai/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url: fileUrl, mime_type: mimeType }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI extract failed: ${text}`);
  }
  return res.json();
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

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

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
      aiData = await callAIExtract(signedUrl, req.file.mimetype);
    } catch (aiErr) {
      console.error('AI extraction error:', aiErr.message);
      aiData = {
        documentType: 'Unknown',
        category: 'other',
        summary: 'AI extraction pending or failed',
        confidence: 0,
      };
    }

    const doc = await Document.create({
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
    });

    user.docCount += 1;
    await user.save();

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

router.post('/:id/ask', authenticate, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: false,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const result = await callAIQA(
      doc.aiExtracted?.summary || '',
      doc.aiExtracted?.keyFields || {},
      question
    );

    res.json({ answer: result.answer });
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
