const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function apiGet(path, token) {
  return request(path, { token });
}

export function apiPost(path, body, token) {
  return request(path, { method: 'POST', body, token });
}
