const FILENAME_HINTS = [
  { match: /aadhaar|aadhar|uidai/i, documentType: 'Aadhaar Card', category: 'identity' },
  { match: /pan.?card|\bpan\b/i, documentType: 'PAN Card', category: 'identity' },
  { match: /passport/i, documentType: 'Passport', category: 'identity' },
  { match: /driving|license|licence|dl\b/i, documentType: 'Driving Licence', category: 'vehicle' },
  { match: /rc\b|registration certificate|vehicle/i, documentType: 'Vehicle RC', category: 'vehicle' },
  { match: /insurance|policy/i, documentType: 'Insurance Policy', category: 'insurance' },
  { match: /lease|rent|agreement/i, documentType: 'Rent Agreement', category: 'property' },
  { match: /invoice|bill|receipt/i, documentType: 'Financial Document', category: 'finance' },
  { match: /marksheet|degree|certificate|diploma/i, documentType: 'Education Certificate', category: 'other' },
  { match: /medical|prescription|health/i, documentType: 'Medical Document', category: 'medical' },
];

function titleFromFileName(fileName) {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  if (!base) return 'Uploaded Document';
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function localDevExtract(fileName, mimeType) {
  const hint = FILENAME_HINTS.find((h) => h.match.test(fileName));
  const documentType = hint?.documentType || titleFromFileName(fileName);
  const category = hint?.category || 'other';

  return {
    documentType,
    category,
    holderName: null,
    issuedDate: null,
    expiryDate: null,
    keyFields: {
      fileName,
      mimeType,
      source: 'local-fallback',
    },
    summary: hint
      ? `Identified as ${documentType} from filename. Start the AI service (npm run dev:ai) with GEMINI_API_KEY or ANTHROPIC_API_KEY in .env for full field extraction.`
      : `Uploaded ${fileName}. Start the AI service (npm run dev:ai) with an API key in .env for automatic field extraction.`,
    confidence: hint ? 0.35 : 0.2,
  };
}

module.exports = { localDevExtract };
