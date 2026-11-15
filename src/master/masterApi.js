const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'gmc_master_token';
const OWNER_KEY = 'gmc_master_owner';
const OWNER_TOKEN_KEY = 'gmc_owner_token';

export function getMasterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getAnyAuthToken() {
  return localStorage.getItem(OWNER_TOKEN_KEY) || getMasterToken();
}

export function getStoredOwner() {
  try {
    return JSON.parse(localStorage.getItem(OWNER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setMasterSession(token, owner) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
}

export function clearMasterSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OWNER_KEY);
}

async function request(path, { method = 'GET', body, auth = false, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth || token) {
    const t = token || getMasterToken();
    if (t) headers.Authorization = `Bearer ${t}`;
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

export const masterApi = {
  status: () => request('/api/master/auth/status'),
  login: (payload) => request('/api/master/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/master/auth/me', { auth: true }),
  overview: () => request('/api/master/overview', { auth: true }),
  restaurants: () => request('/api/master/restaurants', { auth: true }),
  restaurant: (id) => request(`/api/master/restaurants/${id}`, { auth: true }),
  activity: (limit = 40) => request(`/api/master/activity?limit=${limit}`, { auth: true }),
  deleteActivity: (id) =>
    request(`/api/master/activity/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),
  clearActivity: (type) =>
    request('/api/master/activity', {
      method: 'DELETE',
      auth: true,
      body: type ? { type } : {},
    }),
  reports: () => request('/api/master/reports', { auth: true }),
  subscriptions: () => request('/api/master/subscriptions', { auth: true }),
  updateSubscription: (restaurantId, payload) =>
    request(`/api/master/subscriptions/${restaurantId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),
  updateRestaurantStatus: (restaurantId, payload) =>
    request(`/api/master/restaurants/${restaurantId}/status`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),
  reviews: () => request('/api/master/reviews', { auth: true }),
};

export async function fetchRestaurantVisibility() {
  try {
    return await request('/api/restaurants/visibility');
  } catch {
    return { visibility: {} };
  }
}

export async function fetchPublicRestaurants() {
  return request('/api/restaurants');
}

export async function fetchPublicRestaurant(id) {
  return request(`/api/restaurants/${encodeURIComponent(id)}`);
}

export async function fetchPublicReviews(id) {
  return request(`/api/restaurants/${encodeURIComponent(id)}/reviews`);
}

/** Strip blob:/huge data: URLs so publish sync stays under API body limits */
export function sanitizeRestaurantForBackend(restaurant) {
  if (!restaurant) return restaurant;
  const cleanUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:')) return '';
    // Keep reasonable data URLs (Express body limit is 12mb); drop only huge payloads
    if (url.startsWith('data:') && url.length > 2_500_000) return '';
    return url;
  };
  return {
    ...restaurant,
    coverImage: cleanUrl(restaurant.coverImage),
    categories: (restaurant.categories || []).map((cat) => ({
      ...cat,
      items: (cat.items || []).map((item) => ({
        ...item,
        image: cleanUrl(item.image),
      })),
    })),
  };
}

/** Authenticated publish — owner or master JWT required by the API */
export async function syncPublishRestaurant(restaurant) {
  const payload = sanitizeRestaurantForBackend(restaurant);
  const token = getAnyAuthToken();
  if (!token) {
    console.warn('Backend publish skipped: no owner/master token');
    return false;
  }
  try {
    await request('/api/restaurants/publish', {
      method: 'POST',
      body: payload,
      auth: true,
      token,
    });
    return true;
  } catch (e) {
    console.warn('Backend publish sync failed:', e.message);
    return false;
  }
}

/** Push any locally published restaurants into Master Admin DB (master session) */
export async function syncLocalPublishedToBackend(localList = []) {
  const results = [];
  const token = getMasterToken();
  if (!token) return localList.map((r) => ({ id: r.id, ok: false }));
  for (const restaurant of localList) {
    const payload = sanitizeRestaurantForBackend(restaurant);
    let ok = false;
    try {
      await request('/api/restaurants/publish', {
        method: 'POST',
        body: payload,
        auth: true,
        token,
      });
      ok = true;
    } catch (e) {
      console.warn('Local menu push failed:', restaurant.id, e.message);
    }
    results.push({ id: restaurant.id, ok });
  }
  return results;
}

export async function syncTrackEvent(type, restaurantId, extra = {}) {
  try {
    await request('/api/events', {
      method: 'POST',
      body: { type, restaurantId, meta: extra },
    });
  } catch {
    /* offline / backend down — ignore for public UX */
  }
}

export async function syncAddReview(restaurantId, review) {
  try {
    await request('/api/reviews', {
      method: 'POST',
      body: { restaurantId, ...review },
    });
    return true;
  } catch (e) {
    console.warn('Backend review sync failed:', e.message);
    return false;
  }
}
