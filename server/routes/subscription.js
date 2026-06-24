const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const PLAN_MAP = {
  basic: process.env.RAZORPAY_PLAN_BASIC,
  pro: process.env.RAZORPAY_PLAN_PRO,
};

router.post('/create', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId || !PLAN_MAP[planId]) {
      return res.status(400).json({ error: 'Invalid planId (basic or pro)' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const subscription = await getRazorpay().subscriptions.create({
      plan_id: PLAN_MAP[planId],
      total_count: 12,
      customer_notify: 1,
    });

    user.subscription.razorpaySubId = subscription.id;
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (err) {
    console.error('subscription create error:', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expected) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload?.subscription?.entity;

    if (!payload) return res.json({ received: true });

    const user = await User.findOne({ subscription: { razorpaySubId: payload.id } });
    if (!user) return res.json({ received: true });

    if (event === 'subscription.activated') {
      user.subscription.status = 'active';
      const planId = payload.plan_id;
      if (planId === PLAN_MAP.pro) user.subscription.plan = 'pro';
      else if (planId === PLAN_MAP.basic) user.subscription.plan = 'basic';
    }

    if (event === 'subscription.charged') {
      user.subscription.currentPeriodEnd = new Date(payload.current_end * 1000);
    }

    if (event === 'subscription.cancelled') {
      user.subscription.status = 'cancelled';
    }

    await user.save();
    res.json({ received: true });
  } catch (err) {
    console.error('razorpay webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      docCount: user.docCount,
    });
  } catch (err) {
    console.error('subscription status error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

module.exports = router;
