import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';
import VaultSidebar, { CATEGORIES } from '../components/VaultSidebar';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  const setCategory = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all') next.delete('category');
      else next.set('category', value);
      return next;
    });
  };

  const setSearch = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value.trim()) next.delete('search');
      else next.set('search', value.trim());
      return next;
    });
  };

  const fetchDocs = useCallback(() => {
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

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setUploadOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('upload');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUploadSuccess = () => {
    fetchDocs();
  };

  const activeCategory = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <VaultSidebar
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        onUploadClick={() => setUploadOpen(true)}
      />

      <main className="flex-1 bg-surface">
        <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-bold text-navy md:text-2xl">My Vault</h1>
            <p className="text-sm text-gray-500">
              {activeCategory?.label || 'All Documents'}
              {search && ` · "${search}"`}
            </p>
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
              Loading documents…
            </div>
          ) : docs.length === 0 ? (
            <div className="card-light mx-auto max-w-md text-center shadow-card">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal/10">
                <svg className="h-7 w-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mb-2 text-lg font-semibold text-navy">No documents yet</p>
              <p className="mb-4 text-sm text-gray-500">
                Upload your first Aadhaar, PAN, insurance policy, or lease.
              </p>
              <button type="button" onClick={() => setUploadOpen(true)} className="btn-primary">
                Upload document
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {docs.map((doc) => (
                <DocumentCard key={doc._id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
