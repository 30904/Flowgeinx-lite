const express = require('express');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateTokens } = require('../middleware/auth');
const { sendOTP, generateOTP } = require('../utils/otp');
const devStore = require('../utils/devStore');

const router = express.Router();

function formatUser(user) {
  return {
    id: user._id,
    phone: user.phone,
    name: user.name,
    email: user.email || null,
    plan: user.subscription?.plan || 'free',
  };
}

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid 10-digit phone required' });
    }

    const otp = generateOTP();

    if (devStore.isEnabled()) {
      devStore.saveOtp(phone, otp);
    } else {
      await OTP.deleteMany({ phone });
      await OTP.create({ phone, otp });
    }

    if (process.env.FAST2SMS_KEY) {
      await sendOTP(phone, otp);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] phone=${phone} otp=${otp}`);
    }

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, email } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    let valid = false;
    if (devStore.isEnabled()) {
      valid = devStore.verifyOtp(phone, otp);
    } else {
      const record = await OTP.findOne({ phone, otp });
      valid = !!record;
      if (valid) await OTP.deleteMany({ phone });
    }

    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    let user;
    if (devStore.isEnabled()) {
      user = devStore.findOrCreateUser(phone, email);
    } else {
      user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone, email: email || undefined });
      } else if (email) {
        user.email = email;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.phone);

    res.json({
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken } = generateTokens(decoded.userId, decoded.phone);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
