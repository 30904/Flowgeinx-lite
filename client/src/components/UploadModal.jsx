import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CATEGORY_STYLES, formatConfidence } from '../utils/document';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
];
const MAX_SIZE_MB = 10;

function formatFieldLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export default function UploadModal({ open, onClose, onSuccess }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setFile(null);
    setDragOver(false);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError('');
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && status !== 'uploading') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, status]);

  const validateFile = (f) => {
    if (!f) return 'No file selected';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB} MB`;
    }
    const typeOk =
      ACCEPTED_TYPES.includes(f.type) ||
      /\.(pdf|jpe?g|png|webp|heic)$/i.test(f.name);
    if (!typeOk) return 'Upload a PDF or image (JPG, PNG, WebP)';
    return null;
  };

  const selectFile = (f) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setFile(f);
    setStatus('idle');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || status === 'uploading') return;
    setError('');
    setStatus('uploading');
    setProgress(5);

    try {
      const data = await api.uploadDocument(file, (pct) => {
        setProgress(Math.min(pct, 85));
      });
      setProgress(95);
      setResult(data.document);
      setStatus('done');
      setProgress(100);
      onSuccess?.(data.document);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setStatus('error');
      setProgress(0);
    }
  };

  if (!open) return null;

  const ai = result?.aiExtracted;
  const categoryStyle = CATEGORY_STYLES[result?.category] || CATEGORY_STYLES.other;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => status !== 'uploading' && onClose()}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 id="upload-modal-title" className="text-lg font-bold text-navy">
            {status === 'done' ? 'Document processed' : 'Upload document'}
          </h2>
          {status !== 'uploading' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {status === 'done' && result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-teal/20 bg-teal/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/10">
                  <svg className="h-5 w-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{ai?.documentType || result.originalFileName}</p>
                  <p className="truncate text-xs text-gray-500">{result.originalFileName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                  {categoryStyle.label}
                </span>
              </div>

              {ai?.summary && (
                <div>
                  <p className="section-label-dark mb-1">AI Summary</p>
                  <p className="text-sm text-gray-600">{ai.summary}</p>
                </div>
              )}

              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {ai?.holderName && (
                  <>
                    <dt className="text-gray-400">Holder</dt>
                    <dd className="font-medium text-navy">{ai.holderName}</dd>
                  </>
                )}
                {ai?.expiryDate && (
                  <>
                    <dt className="text-gray-400">Expiry</dt>
                    <dd className="font-medium text-navy">
                      {new Date(ai.expiryDate).toLocaleDateString('en-IN')}
                    </dd>
                  </>
                )}
                {formatConfidence(ai?.confidence) != null && (
                  <>
                    <dt className="text-gray-400">Confidence</dt>
                    <dd className="font-medium text-navy">{formatConfidence(ai.confidence)}%</dd>
                  </>
                )}
              </dl>

              {ai?.keyFields && Object.keys(ai.keyFields).length > 0 && (
                <div>
                  <p className="section-label-dark mb-2">Extracted fields</p>
                  <dl className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                    {Object.entries(ai.keyFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <dt className="text-gray-500">{formatFieldLabel(key)}</dt>
                        <dd className="text-right font-medium text-navy">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Link
                  to={`/doc/${result._id}`}
                  className="btn-primary flex-1 text-center"
                  onClick={onClose}
                >
                  View document
                </Link>
                <button type="button" onClick={onClose} className="btn-outline flex-1">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragOver
                    ? 'border-teal bg-teal/5'
                    : 'border-gray-200 bg-gray-50 hover:border-teal/40'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => selectFile(e.target.files?.[0])}
                />
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                {file ? (
                  <>
                    <p className="font-medium text-navy">{file.name}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="mt-3 text-sm text-teal hover:underline"
                      disabled={status === 'uploading'}
                    >
                      Choose a different file
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-navy">Drag & drop your document</p>
                    <p className="mt-1 text-sm text-gray-500">PDF or image, up to {MAX_SIZE_MB} MB</p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="btn-outline mt-4 text-sm"
                    >
                      Browse files
                    </button>
                  </>
                )}
              </div>

              {status === 'uploading' && (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>{progress < 85 ? 'Uploading…' : 'AI extracting fields…'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-teal transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || status === 'uploading'}
                  className="btn-primary flex-1"
                >
                  {status === 'uploading' ? 'Processing…' : 'Upload & extract'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'uploading'}
                  className="btn-outline flex-1 border-gray-200 text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
