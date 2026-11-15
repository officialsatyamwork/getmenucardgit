const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'gmc_owner_token';
const OWNER_KEY = 'gmc_owner_user';

export function getOwnerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredOwner() {
  try {
    return JSON.parse(localStorage.getItem(OWNER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setOwnerSession(token, owner) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
}

export function clearOwnerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OWNER_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getOwnerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const ownerApi = {
  signup: (payload) => request('/api/owner/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/api/owner/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/owner/auth/me', { auth: true }),
  dashboard: () => request('/api/owner/dashboard', { auth: true }),
  plans: () => request('/api/owner/plans', { auth: true }),
  updateRestaurant: (payload) =>
    request('/api/owner/restaurant', { method: 'PATCH', auth: true, body: payload }),
  updateMenu: (payload) =>
    request('/api/owner/menu', { method: 'PUT', auth: true, body: payload }),
  updateSubscription: (payload) =>
    request('/api/owner/subscription', { method: 'PATCH', auth: true, body: payload }),
};

export const PRICING_PLANS = [
  {
    id: 'Free',
    price: 0,
    period: 'forever',
    blurb: 'Launch your digital menu',
    features: ['1 restaurant', 'QR menu', 'Basic analytics', 'Guest reviews'],
    cta: 'Start free',
  },
  {
    id: 'Starter',
    price: 499,
    period: 'month',
    blurb: 'For growing cafés',
    features: ['Everything in Free', 'Custom branding', 'Review QR', 'Email support'],
    cta: 'Choose Starter',
    popular: true,
  },
  {
    id: 'Pro',
    price: 999,
    period: 'month',
    blurb: 'For busy restaurants',
    features: ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Menu themes'],
    cta: 'Choose Pro',
  },
  {
    id: 'Business',
    price: 1999,
    period: 'month',
    blurb: 'Multi-location ready',
    features: ['Everything in Pro', 'Multi-branch', 'Dedicated success', 'Custom domain'],
    cta: 'Choose Business',
  },
];
