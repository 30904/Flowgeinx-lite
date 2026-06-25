import { Link } from 'react-router-dom';
import { CATEGORY_STYLES, getExpiryStatus } from '../utils/document';

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
