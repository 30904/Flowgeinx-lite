export const CATEGORY_STYLES = {
  identity: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Identity' },
  finance: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Finance' },
  property: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Property' },
  insurance: { bg: 'bg-teal/10', text: 'text-teal-dark', label: 'Insurance' },
  legal: { bg: 'bg-violet-500/10', text: 'text-violet-600', label: 'Legal' },
  vehicle: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Vehicle' },
  medical: { bg: 'bg-rose-500/10', text: 'text-rose-600', label: 'Medical' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-600', label: 'Other' },
};

export function getExpiryStatus(expiryDate) {
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

export function formatDocDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatConfidence(confidence) {
  if (typeof confidence !== 'number') return null;
  return confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);
}
