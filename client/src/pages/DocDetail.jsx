import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import VaultSidebar from '../components/VaultSidebar';
import DocChat from '../components/DocChat';
import { CATEGORY_STYLES, formatConfidence, formatDocDate, getExpiryStatus } from '../utils/document';

function formatFieldLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function DocPreview({ doc }) {
  const isImage = doc.mimeType?.startsWith('image/');
  const isPdf = doc.mimeType === 'application/pdf';

  if (!doc.fileUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
        Preview unavailable
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        <img
          src={doc.fileUrl}
          alt={doc.originalFileName}
          className="mx-auto max-h-[70vh] w-full object-contain"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <iframe
          title={doc.originalFileName}
          src={doc.fileUrl}
          className="h-[60vh] w-full min-h-[320px] sm:h-[70vh]"
        />
      </div>
    );
  }

  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <p className="text-sm text-gray-500">Preview not supported for this file type</p>
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-teal hover:underline"
      >
        Open file
      </a>
    </div>
  );
}

export default function DocDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getDocument(id)
      .then(setDoc)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCategoryChange = (cat) => {
    navigate(cat === 'all' ? '/vault' : `/vault?category=${cat}`);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleSearchSubmit = (query) => {
    const q = query.trim();
    navigate(q ? `/vault?search=${encodeURIComponent(q)}` : '/vault');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteDocument(id);
      navigate('/vault');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const ai = doc?.aiExtracted;
  const category = doc?.category || 'other';
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
  const expiry = getExpiryStatus(ai?.expiryDate);
  const title = ai?.documentType || doc?.originalFileName || 'Document';

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <VaultSidebar
        category={doc?.category || 'all'}
        onCategoryChange={handleCategoryChange}
        search={search}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onUploadClick={() => navigate('/vault?upload=1')}
      />

      <main className="flex-1 bg-surface">
        <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to="/vault"
                className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-teal"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to vault
              </Link>
              {loading ? (
                <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
              ) : (
                <>
                  <h1 className="truncate text-xl font-bold text-navy md:text-2xl">{title}</h1>
                  {doc?.originalFileName && ai?.documentType && (
                    <p className="truncate text-sm text-gray-500">{doc.originalFileName}</p>
                  )}
                </>
              )}
            </div>
            {doc && (
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-6 md:px-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
              Loading document…
            </div>
          ) : doc ? (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <section>
                  <h2 className="section-label-dark mb-3">Preview</h2>
                  <DocPreview doc={doc} />
                  <p className="mt-2 text-xs text-gray-400">
                    Uploaded {formatDocDate(doc.uploadedAt)}
                    {doc.source === 'whatsapp' && ' · via WhatsApp'}
                  </p>
                </section>

                <section className="space-y-5">
                  <div>
                    <h2 className="section-label-dark mb-3">Extracted fields</h2>
                    <dl className="card-light space-y-3 shadow-card">
                    {ai?.holderName && (
                      <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                        <dt className="text-sm text-gray-500">Holder name</dt>
                        <dd className="text-right text-sm font-medium text-navy">{ai.holderName}</dd>
                      </div>
                    )}
                    {ai?.issuedDate && (
                      <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                        <dt className="text-sm text-gray-500">Issued date</dt>
                        <dd className="text-right text-sm font-medium text-navy">{formatDocDate(ai.issuedDate)}</dd>
                      </div>
                    )}
                    {ai?.expiryDate && (
                      <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                        <dt className="text-sm text-gray-500">Expiry date</dt>
                        <dd className="flex items-center gap-2 text-right text-sm font-medium text-navy">
                          {formatDocDate(ai.expiryDate)}
                          {expiry && (
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${expiry.className}`}>
                              {expiry.label}
                            </span>
                          )}
                        </dd>
                      </div>
                    )}
                    {formatConfidence(ai?.confidence) != null && (
                      <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                        <dt className="text-sm text-gray-500">AI confidence</dt>
                        <dd className="text-right text-sm font-medium text-navy">
                          {formatConfidence(ai.confidence)}%
                        </dd>
                      </div>
                    )}
                    {ai?.keyFields && Object.entries(ai.keyFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <dt className="text-sm text-gray-500">{formatFieldLabel(key)}</dt>
                        <dd className="text-right text-sm font-medium text-navy">{String(value)}</dd>
                      </div>
                    ))}
                    {!ai?.holderName && !ai?.issuedDate && !ai?.expiryDate && (!ai?.keyFields || !Object.keys(ai.keyFields).length) && (
                      <p className="text-sm text-gray-400">No fields extracted yet.</p>
                    )}
                  </dl>
                </div>

                {ai?.summary && (
                  <div>
                    <h2 className="section-label-dark mb-3">Summary</h2>
                    <p className="card-light text-sm leading-relaxed text-gray-600 shadow-card">
                      {ai.summary}
                    </p>
                  </div>
                )}

                {doc.tags?.length > 0 && (
                  <div>
                    <h2 className="section-label-dark mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
              </div>

              <DocChat documentId={id} doc={doc} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
