export function getUserInitials(user) {
  const email = user?.email?.trim();
  if (email) {
    const local = email.split('@')[0] || '';
    const parts = local.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return local.slice(0, 2).toUpperCase() || '?';
  }

  const name = user?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  if (user?.phone) {
    return user.phone.slice(-2);
  }

  return '?';
}
