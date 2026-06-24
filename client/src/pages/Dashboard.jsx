import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'identity', label: 'Identity' },
  { id: 'finance', label: 'Finance' },
  { id: 'property', label: 'Property' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'legal', label: 'Legal' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'medical', label: 'Medical' },
  { id: 'other', label: 'Other' },
];

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (search) params.search = search;

    setLoading(true);
    api
      .getDocuments(params)
      .then((data) => setDocs(data.docs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      {/* Sidebar — Sarah: expand into VaultSidebar.jsx (T16) */}
      <aside className="hidden w-48 shrink-0 md:block">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
          Categories
        </p>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCategory(c.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  category === c.id
                    ? 'bg-teal/20 text-teal'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">My Vault</h1>
          <input
            type="search"
            className="input-field max-w-xs"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-white/50">Loading documents…</p>
        ) : docs.length === 0 ? (
          <div className="card text-center">
            <p className="mb-2 text-lg font-medium">No documents yet</p>
            <p className="text-sm text-white/50">
              Upload modal coming in T17 — wire to{' '}
              <code className="text-teal">POST /api/documents/upload</code>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <Link
                key={doc._id}
                to={`/doc/${doc._id}`}
                className="card block transition hover:border-teal/50"
              >
                {/* Sarah: replace with DocumentCard.jsx (T15) */}
                <p className="font-medium">
                  {doc.aiExtracted?.documentType || doc.originalFileName}
                </p>
                <p className="mt-1 text-sm text-white/50">{doc.category}</p>
                {doc.aiExtracted?.expiryDate && (
                  <p className="mt-2 text-xs text-teal">
                    Expires: {new Date(doc.aiExtracted.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
