import { R_IMAGES, FALLBACK_IMG, isMapsLink } from './restaurantStore';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant: r, onOpen, style }) {
  const categories = r.categories || [];
  const itemCount = categories.reduce((n, c) => n + (c.items?.length || 0), 0);
  const accent = r.accent || '#f4831f';
  const img = r.coverImage || R_IMAGES[r.id] || FALLBACK_IMG;
  const branded = r.id === 'sangeetha-kitchen';
  const locationLabel = (r.address || '').trim()
    || (r.location?.trim()
      ? (isMapsLink(r.location) ? 'Directions available' : r.location)
      : '');

  return (
    <article
      className={`rc${branded ? ' rc-branded' : ''}`}
      style={{ '--rc-accent': accent, ...style }}
      onClick={() => onOpen(r.id)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(r.id))}
      role="link"
      tabIndex={0}
      aria-label={`View ${r.name} menu`}
    >
      <div className="rc-media">
        <img src={img} alt={r.name} loading="lazy" className="rc-img" />
        {!branded && <span className="rc-tag">{r.emoji} {r.tagline}</span>}
        {branded && <span className="rc-tag rc-tag-branded">{r.tagline}</span>}
        <span className="rc-scan" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Scan
        </span>
      </div>

      <div className="rc-perf" aria-hidden="true" />

      <div className="rc-body">
        <div className="rc-name">{r.name}</div>
        {locationLabel && <div className="rc-location">{locationLabel}</div>}
        <div className="rc-meta">
          <span>{itemCount} dishes</span>
          <span className="rc-dot" />
          <span>{categories.length} categories</span>
        </div>
        {categories.length > 0 && (
          <div className="rc-cats">
            {categories.slice(0, 3).map((c, i) => <span key={c.id || i}>{c.name}</span>)}
          </div>
        )}
        <div className="rc-foot">
          <span className="rc-accent-bar" />
          <span className="rc-cta">
            View menu
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>
    </article>
  );
}
