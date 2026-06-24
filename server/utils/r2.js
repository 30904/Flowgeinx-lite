const s3 = require('./s3');

// Backwards compatibility — prefer utils/storage.js
module.exports = {
  uploadToR2: s3.uploadToS3,
  getSignedFileUrl: s3.getSignedS3Url,
};
