const { uploadToS3, getSignedS3Url, isS3Configured } = require('./s3');
const { uploadToLocal, getLocalFilePath, localFileExists } = require('./localStorage');

const getStorageMode = () => {
  if (process.env.STORAGE_MODE === 'local') return 'local';
  if (process.env.STORAGE_MODE === 's3') return 's3';
  return isS3Configured() ? 's3' : 'local';
};

const getBaseUrl = () =>
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const uploadFile = async (buffer, key, mimeType) => {
  if (getStorageMode() === 's3') {
    return uploadToS3(buffer, key, mimeType);
  }
  return uploadToLocal(buffer, key, mimeType);
};

const getFileUrl = async (key) => {
  if (getStorageMode() === 's3') {
    return getSignedS3Url(key);
  }

  const token = process.env.FILE_ACCESS_TOKEN || 'dev-local-token';
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${getBaseUrl()}/api/files/${encodedKey}?token=${encodeURIComponent(token)}`;
};

module.exports = {
  getStorageMode,
  uploadFile,
  getFileUrl,
  getLocalFilePath,
  localFileExists,
};
