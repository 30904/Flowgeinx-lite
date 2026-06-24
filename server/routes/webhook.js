const express = require('express');
const Document = require('../models/Document');
const User = require('../models/User');
const { uploadFile, getFileUrl } = require('../utils/storage');
const { sendWhatsApp, getMediaUrl, downloadMedia } = require('../utils/whatsapp');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

const defaultReminders = () => [
  { daysBefore: 30, sent: false },
  { daysBefore: 7, sent: false },
  { daysBefore: 1, sent: false },
];

router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

router.post('/whatsapp', async (req, res) => {
  res.status(200).send('EVENT_RECEIVED');

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message) return;

    const fromPhone = message.from?.replace(/^91/, '') || message.from;
    const user = await User.findOne({
      $or: [{ phone: fromPhone }, { whatsappPhone: fromPhone }],
    });

    if (!user) {
      await sendWhatsApp(
        fromPhone,
        'Welcome to Flowgenix Lite! Sign up at https://flowgenixlite.com to link your vault.'
      );
      return;
    }

    if (message.type === 'text') {
      const docs = await Document.find({ userId: user._id, isDeleted: false }).limit(5);
      if (docs.length === 0) {
        await sendWhatsApp(fromPhone, 'Upload a document first, then you can ask questions here.');
        return;
      }
      const context = docs.map((d) => d.aiExtracted?.summary || '').join('\n');
      const qaRes = await fetch(`${AI_SERVICE_URL}/ai/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_summary: context,
          key_fields: {},
          question: message.text.body,
        }),
      });
      const qa = await qaRes.json();
      await sendWhatsApp(fromPhone, qa.answer || 'Could not process your question.');
      return;
    }

    const mediaId =
      message.image?.id || message.document?.id;
    if (!mediaId) return;

    const mediaUrl = await getMediaUrl(mediaId);
    const buffer = await downloadMedia(mediaUrl);
    const mimeType = message.image ? 'image/jpeg' : 'application/pdf';
    const ext = mimeType.includes('pdf') ? 'pdf' : 'jpg';
    const fileKey = `docs/${user._id}/wa-${Date.now()}.${ext}`;

    await uploadFile(buffer, fileKey, mimeType);
    const signedUrl = await getFileUrl(fileKey);

    let aiData = {};
    try {
      const extractRes = await fetch(`${AI_SERVICE_URL}/ai/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: signedUrl, mime_type: mimeType }),
      });
      aiData = await extractRes.json();
    } catch (e) {
      console.error('WA AI extract error:', e);
    }

    const doc = await Document.create({
      userId: user._id,
      originalFileName: `whatsapp-${Date.now()}.${ext}`,
      fileKey,
      fileUrl: signedUrl,
      mimeType,
      source: 'whatsapp',
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
    user.whatsappLinked = true;
    user.whatsappPhone = fromPhone;
    await user.save();

    const docType = doc.aiExtracted?.documentType || 'Document';
    const expiry = doc.aiExtracted?.expiryDate
      ? doc.aiExtracted.expiryDate.toDateString()
      : null;

    await sendWhatsApp(
      fromPhone,
      `✅ Got it! Your *${docType}* has been saved to your Flowgenix Lite vault.\n` +
        (expiry ? `📅 Expires: ${expiry}\nI'll remind you before it expires!\n` : '') +
        'View your vault: https://flowgenixlite.com/vault'
    );
  } catch (err) {
    console.error('whatsapp webhook error:', err);
  }
});

module.exports = router;
