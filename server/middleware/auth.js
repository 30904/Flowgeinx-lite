const jwt = require('jsonwebtoken');

const ACCESS_EXPIRY = process.env.NODE_ENV === 'production' ? '15m' : '7d';

const generateTokens = (userId, phone) => ({
  accessToken: jwt.sign({ userId, phone }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY }),
  refreshToken: jwt.sign({ userId, phone }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: message });
  }
};

module.exports = { generateTokens, authenticate };
