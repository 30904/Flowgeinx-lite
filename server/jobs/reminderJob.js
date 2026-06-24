const cron = require('node-cron');
const Document = require('../models/Document');
const { sendWhatsApp } = require('../utils/whatsapp');

// Daily at 9:00 AM IST (3:30 AM UTC)
cron.schedule('30 3 * * *', async () => {
  const today = new Date();
  const checkDays = [30, 7, 1];

  for (const days of checkDays) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reminderIndex = checkDays.indexOf(days);

    const docs = await Document.find({
      'aiExtracted.expiryDate': { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
      [`reminders.${reminderIndex}.sent`]: false,
    }).populate('userId');

    for (const doc of docs) {
      const user = doc.userId;
      if (!user || !user.whatsappLinked) continue;

      const msg =
        `🔔 *Reminder from Flowgenix Lite*\n\n` +
        `Your *${doc.aiExtracted.documentType}* expires in *${days} day${days > 1 ? 's' : ''}*.\n` +
        `📅 Expiry: ${doc.aiExtracted.expiryDate.toDateString()}\n\n` +
        `Tap to view: https://flowgenixlite.com/doc/${doc._id}`;

      await sendWhatsApp(user.whatsappPhone, msg);

      doc.reminders[reminderIndex].sent = true;
      doc.reminders[reminderIndex].sentAt = new Date();
      await doc.save();
    }
  }
});

console.log('Reminder cron job scheduled (9:00 AM IST daily)');
