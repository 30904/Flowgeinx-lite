const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  sendOtp: (phone) =>
    request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone, otp) =>
    request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  refreshToken: (refreshToken) =>
    request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getDocuments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/documents${query ? `?${query}` : ''}`);
  },

  getDocument: (id) => request(`/api/documents/${id}`),

  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    return fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    });
  },

  deleteDocument: (id) =>
    request(`/api/documents/${id}`, { method: 'DELETE' }),

  askDocument: (id, question) =>
    request(`/api/documents/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};

export default api;
