import { Link } from 'react-router-dom';

const CATEGORY_STYLES = {
  identity: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Identity' },
  finance: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Finance' },
  property: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Property' },
  insurance: { bg: 'bg-teal/10', text: 'text-teal-dark', label: 'Insurance' },
  legal: { bg: 'bg-violet-500/10', text: 'text-violet-600', label: 'Legal' },
  vehicle: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Vehicle' },
  medical: { bg: 'bg-rose-500/10', text: 'text-rose-600', label: 'Medical' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-600', label: 'Other' },
};

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: 'Expired', className: 'text-red-600 bg-red-50' };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, className: 'text-orange-600 bg-orange-50' };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, className: 'text-amber-600 bg-amber-50' };
  return {
    label: expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    className: 'text-teal-dark bg-teal/10',
  };
}

export default function DocumentCard({ doc }) {
  const title = doc.aiExtracted?.documentType || doc.originalFileName;
  const category = doc.category || 'other';
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
  const expiry = getExpiryStatus(doc.aiExtracted?.expiryDate);

  return (
    <Link
      to={`/doc/${doc._id}`}
      className="card-light group block hover:border-teal/30"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
        >
          <svg
            className={`h-5 w-5 ${style.text}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>

      <p className="font-semibold text-navy group-hover:text-teal-dark">{title}</p>

      {doc.originalFileName && doc.aiExtracted?.documentType && (
        <p className="mt-1 truncate text-xs text-gray-400">{doc.originalFileName}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        {expiry ? (
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${expiry.className}`}>
            {doc.aiExtracted?.expiryDate ? `Expires: ${expiry.label}` : expiry.label}
          </span>
        ) : (
          <span className="text-xs text-gray-400">No expiry date</span>
        )}
        <span className="text-xs text-gray-400 opacity-0 transition group-hover:opacity-100">
          View &rarr;
        </span>
      </div>
    </Link>
  );
}
