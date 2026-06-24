const express = require('express');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateTokens } = require('../middleware/auth');
const { sendOTP, generateOTP } = require('../utils/otp');

const router = express.Router();

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid 10-digit phone required' });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp });

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
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const record = await OTP.findOne({ phone, otp });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await OTP.deleteMany({ phone });

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        plan: user.subscription.plan,
      },
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
    const { accessToken } = generateTokens(decoded.userId);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
