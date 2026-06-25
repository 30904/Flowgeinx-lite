const API_BASE = import.meta.env.VITE_API_URL || '';

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth:logout'));
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

let refreshPromise = null;

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      clearSession();
      throw new Error('Cannot reach the API. Start the server with: cd server && npm run dev');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      clearSession();
      throw new Error(data.error || 'Session expired. Please sign in again.');
    }

    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function getValidAccessToken() {
  const token = getAccessToken();
  if (!token) {
    clearSession();
    throw new Error('Session expired. Please sign in again.');
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    if (Date.now() >= expiresAt - 60_000) {
      return refreshAccessToken();
    }
  } catch {
    return refreshAccessToken();
  }

  return token;
}
