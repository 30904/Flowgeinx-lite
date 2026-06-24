const express = require('express');
const path = require('path');
const {
  getStorageMode,
  getLocalFilePath,
  localFileExists,
} = require('../utils/storage');

const router = express.Router();

router.get('*', (req, res) => {
  if (getStorageMode() !== 'local') {
    return res.status(404).json({ error: 'Local file serving is disabled' });
  }

  const token = process.env.FILE_ACCESS_TOKEN || 'dev-local-token';
  if (req.query.token !== token) {
    return res.status(401).json({ error: 'Invalid file access token' });
  }

  const key = decodeURIComponent(req.path.replace(/^\//, ''));
  if (!key || key.includes('..')) {
    return res.status(400).json({ error: 'Invalid file key' });
  }

  if (!localFileExists(key)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = getLocalFilePath(key);
  res.sendFile(path.resolve(filePath));
});

module.exports = router;
