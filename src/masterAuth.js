const OWNER_KEY = 'mc_master_owner';
const SESSION_KEY = 'mc_master_session';
const SUBS_KEY = 'mc_subscriptions';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hasMasterOwner() {
  try {
    return !!localStorage.getItem(OWNER_KEY);
  } catch {
    return false;
  }
}

export function getMasterOwner() {
  try {
    return JSON.parse(localStorage.getItem(OWNER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getMasterSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isMasterAuthenticated() {
  return !!getMasterSession();
}

export async function signupMaster({ name, email, password }) {
  if (hasMasterOwner()) {
    return { ok: false, error: 'Master owner already exists. Please log in.' };
  }
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';

  if (!cleanName || cleanName.length < 2) {
    return { ok: false, error: 'Enter your full name.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (cleanPass.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const passwordHash = await sha256(`${cleanEmail}::${cleanPass}`);
  const owner = {
    id: 'master-owner',
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: 'root',
    createdAt: Date.now(),
  };

  localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
  const session = await createSession(owner);
  return { ok: true, owner, session };
}

export async function loginMaster({ email, password }) {
  const owner = getMasterOwner();
  if (!owner) {
    return { ok: false, error: 'No master account found. Create one first.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';
  const passwordHash = await sha256(`${cleanEmail}::${cleanPass}`);

  if (cleanEmail !== owner.email || passwordHash !== owner.passwordHash) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  const session = await createSession(owner);
  return { ok: true, owner, session };
}

async function createSession(owner) {
  const session = {
    token: randomToken(),
    ownerId: owner.id,
    email: owner.email,
    name: owner.name,
    role: 'root',
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutMaster() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ── Subscriptions (per restaurant) ── */
export const PLAN_OPTIONS = [
  { id: 'free', label: 'Free', price: 0 },
  { id: 'starter', label: 'Starter', price: 499 },
  { id: 'pro', label: 'Pro', price: 1499 },
  { id: 'business', label: 'Business', price: 3999 },
];

const DEFAULT_SUBS = {
  'brew-and-bites': { plan: 'pro', status: 'active', renewsAt: null },
  'royal-bistro': { plan: 'business', status: 'active', renewsAt: null },
  'spice-house': { plan: 'starter', status: 'active', renewsAt: null },
  'green-leaf': { plan: 'free', status: 'active', renewsAt: null },
  'tasty-bites': { plan: 'starter', status: 'past_due', renewsAt: null },
};

function readSubs() {
  try {
    const stored = JSON.parse(localStorage.getItem(SUBS_KEY) || '{}');
    return { ...DEFAULT_SUBS, ...stored };
  } catch {
    return { ...DEFAULT_SUBS };
  }
}

export function getSubscription(restaurantId) {
  const all = readSubs();
  return (
    all[restaurantId] || {
      plan: 'free',
      status: 'active',
      renewsAt: null,
    }
  );
}

export function getAllSubscriptions() {
  return readSubs();
}

export function setSubscription(restaurantId, patch) {
  const all = readSubs();
  all[restaurantId] = { ...getSubscription(restaurantId), ...patch, updatedAt: Date.now() };
  localStorage.setItem(SUBS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent('mc_subs_updated'));
  return all[restaurantId];
}
