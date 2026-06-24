const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const uploadToLocal = async (buffer, key, mimeType) => {
  const filePath = path.join(TEMPLATES_DIR, key);
  ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, buffer);
  return key;
};

const getLocalFilePath = (key) => path.join(TEMPLATES_DIR, key);

const localFileExists = (key) => fs.existsSync(getLocalFilePath(key));

module.exports = {
  TEMPLATES_DIR,
  uploadToLocal,
  getLocalFilePath,
  localFileExists,
};
