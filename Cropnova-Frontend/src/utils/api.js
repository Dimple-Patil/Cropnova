let memoryToken = null;

export const setApiToken = (token) => {
  memoryToken = token;
};

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  return memoryToken;
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) })
};
