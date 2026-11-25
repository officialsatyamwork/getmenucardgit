/**
 * Local dish photos from src/assets/menu-image — matched by dish name.
 * Vite emits URL strings; images load lazily via <img>.
 */

const modules = import.meta.glob('./assets/menu-image/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

function stripExt(name) {
  return String(name || '')
    .replace(/\.jpg\.jpeg$/i, '')
    .replace(/\.(jpeg|jpg|png|webp)$/i, '');
}

function norm(s) {
  return stripExt(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .replace(/[–—−]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function extScore(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 4;
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.jpg.jpeg')) return 3;
  if (lower.endsWith('.webp')) return 2;
  return 1;
}

/** normalized filename → asset URL (best extension wins) */
const byNorm = new Map();
for (const [filePath, url] of Object.entries(modules)) {
  const base = filePath.split('/').pop() || filePath;
  const key = norm(base);
  if (!key) continue;
  const score = extScore(base);
  const prev = byNorm.get(key);
  if (!prev || score > prev.score) byNorm.set(key, { url, score, file: base });
}

/**
 * Manual aliases when filename ≠ dish name.
 * Keys/values are matched after normalization.
 */
const ALIASES = {
  'Chicken Manchuria': 'Glossy Chicken Manchurian Bowl',
  'Crispy Corn': 'crispy corn',
  'Veg Corn Soup': 'veg corn soup',
  'Tomato Soup': 'Tomato Soup',
  'Veg Hot N Sour Soup': 'Veg Hot N Sour Soup',
  'Lemon Coriander Soup': 'Lemon Coriander Soup',
  'Special Mutton Family Pack (Boneless)': 'Mutton Family Pack Spl',
  'Saffron Mutton Dum Family Pack': 'Mutton Family Pack Spl',
  'Chicken Family Pack': 'Chicken Family Pack',
  'Egg Family Pack': 'Egg Family Pack',
  'Veg Family Pack': 'Veg Family Pack',
  'Veg Manchurian': 'Veg Manchurian',
  'Chilli Veg': 'Chilli Veg',
  'Mutton Curry': 'mutton curry',
  'Tandoori Mushroom': 'Tandoori Mushroom',
};

function lookup(key) {
  const n = norm(key);
  if (!n) return '';
  return byNorm.get(n)?.url || '';
}

/** Resolve a local menu image URL for a dish name, or '' if none. */
export function resolveMenuImage(dishName) {
  if (!dishName) return '';
  const direct = lookup(dishName);
  if (direct) return direct;

  const alias = ALIASES[dishName];
  if (alias) {
    const viaAlias = lookup(alias);
    if (viaAlias) return viaAlias;
  }

  // Soft fallback: try without parenthetical portion
  const bare = String(dishName).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (bare && bare !== dishName) {
    const viaBare = lookup(bare);
    if (viaBare) return viaBare;
  }

  return '';
}

export function menuImageCoverage() {
  return { files: byNorm.size, keys: [...byNorm.keys()] };
}
