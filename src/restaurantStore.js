import { restaurants as staticRestaurants } from './data';
import {
  syncPublishRestaurant,
  syncLocalPublishedToBackend,
  syncTrackEvent,
  syncAddReview,
  fetchRestaurantVisibility,
  fetchPublicRestaurants,
  fetchPublicRestaurant,
  fetchPublicReviews,
} from './master/masterApi';
import { getOwnerToken } from './owner/ownerApi';

const STORAGE_KEY = 'mc_published_restaurants';
const VISIBILITY_KEY = 'mc_restaurant_visibility';
const API_CACHE_KEY = 'mc_api_restaurants_cache';

export const R_IMAGES = {
  'brew-and-bites': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'royal-bistro':   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'spice-house':    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  'green-leaf':     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'tasty-bites':    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
};
export const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';

function readApiCache() {
  try {
    return JSON.parse(localStorage.getItem(API_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeApiCache(map) {
  try {
    localStorage.setItem(API_CACHE_KEY, JSON.stringify(map || {}));
  } catch {
    /* quota */
  }
}

function cacheRestaurant(restaurant) {
  if (!restaurant?.id) return;
  const map = readApiCache();
  map[restaurant.id] = restaurant;
  writeApiCache(map);
}

export function getPublishedRestaurants() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Cache locally + optionally sync to backend.
 * Backend sync requires owner JWT (secured publish).
 */
export function publishRestaurant(restaurant, { syncBackend = true } = {}) {
  const existing = getPublishedRestaurants();
  const withMeta = {
    ...restaurant,
    status: restaurant.status || 'active',
    source: restaurant.source || 'published',
    launchedAt: restaurant.launchedAt || Date.now(),
    updatedAt: Date.now(),
  };
  const idx = existing.findIndex((r) => r.id === withMeta.id);
  if (idx >= 0) existing[idx] = { ...existing[idx], ...withMeta };
  else existing.push(withMeta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  cacheRestaurant(withMeta);
  window.dispatchEvent(new CustomEvent('mc_restaurants_updated'));

  if (syncBackend && getOwnerToken()) {
    syncPublishRestaurant(withMeta).then((ok) => {
      if (!ok) {
        setTimeout(() => syncPublishRestaurant(withMeta), 1500);
      }
    });
  }
  return withMeta;
}

/** Used by Master Console to import menus that only lived in localStorage */
export async function pushLocalMenusToBackend() {
  const local = getPublishedRestaurants();
  if (!local.length) return [];
  return syncLocalPublishedToBackend(local);
}

export function getVisibilityMap() {
  try {
    return JSON.parse(localStorage.getItem(VISIBILITY_KEY) || '{}');
  } catch {
    return {};
  }
}

export function setVisibilityMap(visibility) {
  localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibility || {}));
  window.dispatchEvent(new CustomEvent('mc_visibility_updated'));
}

/** Pull hold/remove status from backend so public pages stay in sync */
export async function refreshRestaurantVisibility() {
  const data = await fetchRestaurantVisibility();
  setVisibilityMap(data.visibility || {});
  return data.visibility || {};
}

export function getRestaurantStatus(restaurantId) {
  const map = getVisibilityMap();
  return map[restaurantId]?.status || 'active';
}

export function getRestaurantStatusInfo(restaurantId) {
  const map = getVisibilityMap();
  return map[restaurantId] || { status: 'active', reason: '' };
}

export function isRestaurantPublic(restaurantId) {
  return getRestaurantStatus(restaurantId) === 'active';
}

/** Sync merge for offline/demo fallback — prefer API cache when present */
export function getAllRestaurants({ includeHidden = false } = {}) {
  const published = getPublishedRestaurants();
  const apiCache = readApiCache();
  const merged = { ...staticRestaurants, ...apiCache };
  for (const r of published) merged[r.id] = { ...merged[r.id], ...r };
  const list = Object.values(merged).map((r) => {
    const info = getRestaurantStatusInfo(r.id);
    return { ...r, status: info.status || r.status || 'active', statusReason: info.reason || r.statusReason || '' };
  });
  if (includeHidden) return list;
  return list.filter((r) => (r.status || 'active') === 'active');
}

/** Load directory from API (falls back to local merge). */
export async function loadPublicRestaurants() {
  try {
    const data = await fetchPublicRestaurants();
    const list = data.restaurants || [];
    const map = {};
    for (const r of list) map[r.id] = r;
    writeApiCache({ ...readApiCache(), ...map });
    const visibility = {};
    for (const r of list) {
      visibility[r.id] = {
        status: r.status || 'active',
        reason: r.statusReason || '',
        name: r.name,
      };
    }
    const existing = getVisibilityMap();
    setVisibilityMap({ ...existing, ...visibility });
    window.dispatchEvent(new CustomEvent('mc_restaurants_updated'));
    return list;
  } catch {
    return getAllRestaurants();
  }
}

/**
 * Load one restaurant from API for guest menu / review pages.
 * Returns { restaurant, reviews, error, fromCache }.
 */
export async function loadPublicRestaurant(restaurantId) {
  try {
    const data = await fetchPublicRestaurant(restaurantId);
    if (data?.restaurant) {
      cacheRestaurant(data.restaurant);
      const map = getVisibilityMap();
      map[restaurantId] = {
        status: data.restaurant.status || 'active',
        reason: data.restaurant.statusReason || '',
        name: data.restaurant.name,
      };
      setVisibilityMap(map);
      return {
        restaurant: data.restaurant,
        reviews: data.reviews || [],
        error: null,
        fromCache: false,
      };
    }
    return { restaurant: null, reviews: [], error: 'not_found', fromCache: false };
  } catch (err) {
    // Hard 404: do not resurrect deleted menus from stale cache
    if (err?.status === 404) {
      const map = readApiCache();
      if (map[restaurantId]) {
        delete map[restaurantId];
        writeApiCache(map);
      }
      return { restaurant: null, reviews: [], error: 'not_found', fromCache: false };
    }
    // Network / server errors: allow offline cache fallback
    const cached =
      readApiCache()[restaurantId]
      || getPublishedRestaurants().find((r) => r.id === restaurantId)
      || staticRestaurants[restaurantId]
      || null;
    if (cached) {
      return {
        restaurant: {
          ...cached,
          status: getRestaurantStatus(restaurantId) || cached.status || 'active',
          statusReason: getRestaurantStatusInfo(restaurantId).reason || '',
        },
        reviews: getReviews(restaurantId),
        error: null,
        fromCache: true,
      };
    }
    return {
      restaurant: null,
      reviews: [],
      error: 'network',
      fromCache: false,
    };
  }
}

export async function loadPublicReviews(restaurantId) {
  try {
    const data = await fetchPublicReviews(restaurantId);
    return data.reviews || [];
  } catch {
    return getReviews(restaurantId);
  }
}

// Keep visibility fresh for public pages
if (typeof window !== 'undefined') {
  refreshRestaurantVisibility().catch(() => {});
}

export function trackEvent(type, restaurantId, extra = {}) {
  try {
    const ev = JSON.parse(localStorage.getItem('mc_events') || '[]');
    ev.push({ type, restaurant: restaurantId, ts: Date.now(), ...extra });
    localStorage.setItem('mc_events', JSON.stringify(ev));
  } catch { /* ignore */ }
  syncTrackEvent(type, restaurantId, extra);
}

const REVIEWS_KEY = 'mc_reviews';

const now = Date.now();
const DEMO_REVIEWS = {
  'brew-and-bites': [
    {
      id: 'demo-rev-1',
      rating: 5,
      name: 'Ananya',
      comment: 'Loved the cold brew and the QR menu was so easy to browse. Will come again!',
      ts: now - 1000 * 60 * 45,
    },
  ],
  'spice-house': [
    {
      id: 'demo-rev-2',
      rating: 4,
      name: 'Rahul',
      comment: 'Butter chicken was fantastic. Service was quick after we scanned the table QR.',
      ts: now - 1000 * 60 * 60 * 5,
    },
  ],
  'royal-bistro': [
    {
      id: 'demo-rev-3',
      rating: 5,
      name: 'Meera',
      comment: 'Beautiful plating and the digital menu made ordering stress-free. Highly recommend.',
      ts: now - 1000 * 60 * 60 * 26,
    },
  ],
};

function readStoredReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getReviews(restaurantId) {
  const stored = readStoredReviews()[restaurantId] || [];
  const demo = DEMO_REVIEWS[restaurantId] || [];
  const ids = new Set(stored.map((r) => r.id));
  return [...stored, ...demo.filter((d) => !ids.has(d.id))];
}

export async function addReview(restaurantId, review) {
  try {
    const all = readStoredReviews();
    const list = all[restaurantId] || [];
    const entry = {
      id: `rev-${Date.now()}`,
      rating: review.rating,
      name: review.name?.trim() || 'Guest',
      comment: review.comment?.trim() || '',
      ts: Date.now(),
    };
    list.unshift(entry);
    all[restaurantId] = list.slice(0, 100);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
    trackEvent('review_submit', restaurantId, { rating: review.rating });
    window.dispatchEvent(new CustomEvent('mc_reviews_updated', { detail: { restaurantId } }));
    const synced = await syncAddReview(restaurantId, {
      rating: review.rating,
      name: review.name?.trim() || 'Guest',
      comment: review.comment?.trim() || '',
    });
    return { ok: true, synced: Boolean(synced), review: entry };
  } catch {
    return { ok: false, synced: false, review: null };
  }
}

/** Convert blob: image URLs to data URLs so they can be stored on the server. */
export async function persistImageUrl(url, { maxBytes = 1_800_000 } = {}) {
  if (!url || typeof url !== 'string') return '';
  if (!url.startsWith('blob:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    if (blob.size > maxBytes) return '';
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export function getReviewStats(restaurantId, listOverride = null) {
  const list = listOverride || getReviews(restaurantId);
  if (!list.length) return { count: 0, average: 0 };
  const sum = list.reduce((a, r) => a + (Number(r.rating) || 0), 0);
  return { count: list.length, average: Math.round((sum / list.length) * 10) / 10 };
}

export function getAllReviews() {
  try {
    const restaurants = getAllRestaurants();
    const byId = Object.fromEntries(restaurants.map((r) => [r.id, r]));
    const ids = new Set([
      ...Object.keys(readStoredReviews()),
      ...Object.keys(DEMO_REVIEWS),
      ...restaurants.map((r) => r.id),
    ]);
    const flat = [];
    for (const restaurantId of ids) {
      const restaurant = byId[restaurantId];
      for (const review of getReviews(restaurantId)) {
        flat.push({
          ...review,
          restaurantId,
          restaurantName: restaurant?.name || restaurantId,
          restaurantEmoji: restaurant?.emoji || '🍽️',
          restaurantAccent: restaurant?.accent || '#f4831f',
        });
      }
    }
    return flat.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch {
    return [];
  }
}

export function isMapsLink(value) {
  const v = (value || '').trim();
  if (!v) return false;
  return /^https?:\/\//i.test(v) || /maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|maps\.apple\.com/i.test(v);
}

export function normalizeMapsUrl(value) {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function originBase() {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export function menuUrl(restaurantId) {
  return `${originBase()}/menu/${restaurantId}`;
}

export function reviewUrl(restaurantId) {
  return `${originBase()}/menu/${restaurantId}/review`;
}
