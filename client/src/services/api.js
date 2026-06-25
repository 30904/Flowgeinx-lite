import {
  clearSession,
  getValidAccessToken,
  refreshAccessToken,
} from './authToken';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}, retried = false) {
  const token = await getValidAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot reach the API. Start the server with: cd server && npm run dev');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !retried) {
    try {
      await refreshAccessToken();
      return request(path, options, true);
    } catch (err) {
      throw err;
    }
  }

  if (res.status === 401) {
    clearSession();
    throw new Error(data.error || 'Session expired. Please sign in again.');
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

function uploadWithXhr(file, onProgress, token, retried = false) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/documents/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 80));
      } else if (onProgress) {
        onProgress(40);
      }
    };

    xhr.onload = async () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }

      if (xhr.status === 401 && !retried) {
        try {
          const newToken = await refreshAccessToken();
          const result = await uploadWithXhr(file, onProgress, newToken, true);
          resolve(result);
        } catch (err) {
          reject(err);
        }
        return;
      }

      if (xhr.status === 401) {
        clearSession();
        reject(new Error(data.error || 'Session expired. Please sign in again.'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data);
      } else {
        reject(new Error(data.error || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);

    if (onProgress) onProgress(10);
  });
}

export const api = {
  sendOtp: (phone) =>
    fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      return data;
    }),

  verifyOtp: (phone, otp, email) =>
    fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, email }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      return data;
    }),

  refreshToken: (refreshToken) =>
    fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Refresh failed');
      return data;
    }),

  getDocuments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/documents${query ? `?${query}` : ''}`);
  },

  getDocument: (id) => request(`/api/documents/${id}`),

  uploadDocument: async (file, onProgress) => {
    const token = await getValidAccessToken();
    return uploadWithXhr(file, onProgress, token);
  },

  deleteDocument: (id) =>
    request(`/api/documents/${id}`, { method: 'DELETE' }),

  askDocument: (id, question) =>
    request(`/api/documents/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  getSubscriptionStatus: () => request('/api/subscription/status'),

  createSubscription: (planId) =>
    request('/api/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
};

export { clearSession };
export default api;
