import { useState } from 'react';
import RefreshButton from './RefreshButton';
import './MasterPages.css';

const EVENT_LABELS = {
  qr_scan: 'QR scan',
  menu_open: 'Menu open',
  food_view: 'Food view',
  review_submit: 'New review',
  review_qr_scan: 'Review QR scan',
  restaurant_launch: 'Restaurant launched',
  restaurant_status: 'Status changed',
};

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function stars(n) {
  const r = Math.round(Number(n) || 0);
  return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r));
}

function TlIcon({ type }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' };
  if (type === 'restaurant_launch') {
    return (
      <svg {...common}>
        <path d="M4 20V9.5L5.5 4h13L20 9.5V20H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'review_submit' || type === 'review_qr_scan') {
    return (
      <svg {...common}>
        <path d="M12 3l2.4 5.1 5.6.6-4.2 3.9 1.2 5.5L12 15.8 6.9 18.1l1.2-5.5L3.9 8.7l5.6-.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'qr_scan') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function tlTone(type) {
  if (type === 'restaurant_launch') return 'launch';
  if (type === 'review_submit' || type === 'review_qr_scan') return 'review';
  if (type === 'qr_scan') return 'scan';
  return '';
}

export function RestaurantsPage({ restaurants, onOpenReport, onSetStatus, onRefresh, refreshing }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const active = restaurants.filter((r) => r.status === 'active').length;
  const held = restaurants.filter((r) => r.status === 'held').length;
  const removed = restaurants.filter((r) => r.status === 'removed').length;

  const plans = ['all', ...Array.from(new Set(restaurants.map((r) => r.plan).filter(Boolean)))];

  const statusRank = { active: 0, held: 1, removed: 2 };
  const q = query.trim().toLowerCase();
  const filtered = restaurants
    .filter((r) => {
      const status = r.status || 'active';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (planFilter !== 'all' && r.plan !== planFilter) return false;
      if (!q) return true;
      const hay = [r.name, r.location, r.plan, r.tagline, r.id, r.source]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    })
    .slice()
    .sort((a, b) => {
      const ra = statusRank[a.status || 'active'] ?? 9;
      const rb = statusRank[b.status || 'active'] ?? 9;
      if (ra !== rb) return ra - rb;
      const scoreA = (a.scans || 0) + (a.menuOpens || 0) + (a.reviewCount || 0);
      const scoreB = (b.scans || 0) + (b.menuOpens || 0) + (b.reviewCount || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
  };

  const hasFilters = query.trim() || statusFilter !== 'all' || planFilter !== 'all';

  return (
    <div className="md">
      <div className="mp-banner">
        <div className="mp-banner-row">
          <div>
            <h2>Restaurants</h2>
            <p>
              Control every launch — keep live, hold until payment, or remove from the public website.
            </p>
          </div>
          <div className="mp-banner-side">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            <div className="mp-chips">
              <span className="mp-chip"><em>{restaurants.length}</em> total</span>
              <span className="mp-chip"><em>{active}</em> live</span>
              <span className="mp-chip"><em>{held}</em> held</span>
              <span className="mp-chip"><em>{removed}</em> removed</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mp-card">
        <div className="mp-card-head">
          <h3>All launches</h3>
          <span>
            {filtered.length}
            {filtered.length !== restaurants.length ? ` of ${restaurants.length}` : ''} restaurants
          </span>
        </div>

        <div className="mp-toolbar">
          <div className="mp-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or location"
              aria-label="Search restaurants"
            />
            {query ? (
              <button
                type="button"
                className="mp-search-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
            <button type="button" className="mp-search-btn" onClick={() => setQuery(query.trim())}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Search
            </button>
          </div>

          <div className="mp-filter-tabs" role="tablist" aria-label="Status filter">
            {[
              { id: 'all', label: 'All', count: restaurants.length },
              { id: 'active', label: 'Live', count: active },
              { id: 'held', label: 'Held', count: held },
              { id: 'removed', label: 'Removed', count: removed },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === f.id}
                className={`mp-filter-tab${statusFilter === f.id ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
                <em>{f.count}</em>
              </button>
            ))}
          </div>

          <select
            className="mp-filter-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            aria-label="Filter by plan"
          >
            {plans.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All plans' : p}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button type="button" className="mp-filter-clear" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {!restaurants.length && <div className="mp-empty">No restaurants yet.</div>}
        {!!restaurants.length && !filtered.length && (
          <div className="mp-empty">
            No restaurants match your search.
            <button type="button" className="md-link-btn" style={{ marginLeft: 10 }} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
        <div className="mp-rest-grid">
          {filtered.map((r) => (
            <article className={`mp-rest${r.status !== 'active' ? ' is-muted' : ''}`} key={r.id}>
              <div className="mp-rest-top">
                <div className="mp-rest-emoji">{r.emoji || '🍽️'}</div>
                <div>
                  <strong>{r.name}</strong>
                  <span>
                    {r.source === 'demo' ? 'Demo' : 'Published'} · {r.location || 'No location'}
                  </span>
                </div>
              </div>
              <div className="mp-rest-stats">
                <div className="mp-rest-stat">
                  <b>{r.menuItemCount}</b>
                  <span>Items</span>
                </div>
                <div className="mp-rest-stat">
                  <b>{r.reviewCount}</b>
                  <span>Reviews</span>
                </div>
                <div className="mp-rest-stat">
                  <b>{(r.scans || 0) + (r.menuOpens || 0)}</b>
                  <span>Visits</span>
                </div>
              </div>
              <div className="mp-rest-foot">
                <span className={`md-badge ${r.status || 'active'}`}>
                  {(r.status || 'active').replace('_', ' ')}
                </span>
                <span className={`md-badge ${r.planStatus || 'active'}`}>
                  {r.plan}
                </span>
              </div>
              {r.statusReason ? <p className="mp-rest-reason">{r.statusReason}</p> : null}
              <div className="mp-rest-controls">
                {r.status !== 'active' && (
                  <button
                    type="button"
                    className="md-link-btn mp-btn-go"
                    onClick={() => onSetStatus(r.id, 'active')}
                  >
                    Go live
                  </button>
                )}
                {r.status !== 'held' && (
                  <button
                    type="button"
                    className="md-link-btn mp-btn-hold"
                    onClick={() => onSetStatus(r.id, 'held', 'Held until payment is received')}
                  >
                    Hold
                  </button>
                )}
                {r.status !== 'removed' && (
                  <button
                    type="button"
                    className="md-link-btn mp-btn-remove"
                    onClick={() => {
                      if (window.confirm(`Remove ${r.name} from the public website?`)) {
                        onSetStatus(r.id, 'removed', 'Removed from public website');
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
                <button type="button" className="md-link-btn" onClick={() => onOpenReport(r.id)}>
                  Report
                </button>
                <button
                  type="button"
                  className="md-link-btn"
                  onClick={() => window.open(`/menu/${r.id}`, '_blank')}
                >
                  Menu
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function RestaurantDetailPage({ detail, onBack, onSetStatus, onRefresh, refreshing }) {
  if (!detail) return null;
  const { restaurant, summary, subscription, recentEvents, reviews } = detail;
  const status = summary.status || restaurant.status || 'active';

  return (
    <div className="md">
      <button type="button" className="md-link-btn mp-back" onClick={onBack}>
        ← Back to restaurants
      </button>

      <div className="mp-detail-hero">
        <div className="mp-detail-hero-top">
          <div>
            <h2>{restaurant.emoji} {restaurant.name}</h2>
            <p>
              {restaurant.tagline}
              {restaurant.location ? ` · ${restaurant.location}` : ''}
              {' · '}Launched {formatDate(restaurant.launchedAt)}
            </p>
          </div>
          <div className="mp-detail-actions">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            {status !== 'active' && (
              <button type="button" className="md-refresh mp-btn-go" onClick={() => onSetStatus(restaurant.id, 'active')}>
                Go live
              </button>
            )}
            {status !== 'held' && (
              <button
                type="button"
                className="md-refresh mp-btn-hold"
                onClick={() => onSetStatus(restaurant.id, 'held', 'Held until payment is received')}
              >
                Hold
              </button>
            )}
            {status !== 'removed' && (
              <button
                type="button"
                className="md-refresh mp-btn-remove"
                onClick={() => {
                  if (window.confirm(`Remove ${restaurant.name} from the public website?`)) {
                    onSetStatus(restaurant.id, 'removed', 'Removed from public website');
                  }
                }}
              >
                Remove
              </button>
            )}
            <button
              type="button"
              className="md-refresh"
              onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}
            >
              Open menu
            </button>
          </div>
        </div>
        <div className="mp-detail-stats">
          <div className="mp-detail-stat">
            <span>Status</span>
            <strong>{summary.status}</strong>
          </div>
          <div className="mp-detail-stat">
            <span>Menu items</span>
            <strong>{summary.menuItemCount}</strong>
          </div>
          <div className="mp-detail-stat">
            <span>Scans / opens</span>
            <strong>{summary.scans} / {summary.menuOpens}</strong>
          </div>
          <div className="mp-detail-stat">
            <span>Plan</span>
            <strong>{subscription.plan}</strong>
          </div>
        </div>
      </div>

      <div className="mp-grid mp-grid-2">
        <section className="mp-card">
          <div className="mp-card-head">
            <h3>Recent events</h3>
            <span>Activity</span>
          </div>
          <div className="mp-timeline">
            {(recentEvents || []).length === 0 && <div className="mp-empty">No events yet.</div>}
            {(recentEvents || []).slice(0, 12).map((e) => (
              <div className="mp-tl-item" key={e.id}>
                <div className={`mp-tl-ico ${tlTone(e.type)}`}>
                  <TlIcon type={e.type} />
                </div>
                <div>
                  <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                  <span>{restaurant.name}</span>
                </div>
                <time>{formatDate(e.ts)}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="mp-card">
          <div className="mp-card-head">
            <h3>Reviews</h3>
            <span>{(reviews || []).length} total</span>
          </div>
          <div className="mp-rev-grid" style={{ gridTemplateColumns: '1fr' }}>
            {(reviews || []).length === 0 && <div className="mp-empty">No reviews yet.</div>}
            {(reviews || []).slice(0, 8).map((r) => (
              <article className="mp-rev" key={r.id}>
                <div className="mp-rev-top">
                  <div>
                    <strong>{r.name}</strong>
                    <span>{stars(r.rating)}</span>
                  </div>
                  <time>{formatDate(r.ts)}</time>
                </div>
                <p>{r.comment || 'No comment'}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PresencePage({ activity, onRefresh, refreshing, onRemoveEvent, onClearEvents }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [busyId, setBusyId] = useState('');

  const launches = activity.filter((e) => e.type === 'restaurant_launch').length;
  const scans = activity.filter((e) => e.type === 'qr_scan').length;
  const reviews = activity.filter((e) => e.type === 'review_submit').length;
  const opens = activity.filter((e) => e.type === 'menu_open').length;

  const typeTabs = [
    { id: 'all', label: 'All', count: activity.length },
    { id: 'qr_scan', label: 'Scans', count: scans },
    { id: 'menu_open', label: 'Opens', count: opens },
    { id: 'review_submit', label: 'Reviews', count: reviews },
    { id: 'restaurant_launch', label: 'Launches', count: launches },
  ];

  const q = query.trim().toLowerCase();
  const filtered = activity.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (!q) return true;
    const hay = [
      EVENT_LABELS[e.type] || e.type,
      e.restaurantName,
      e.restaurantId,
      e.meta?.name,
      e.meta?.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
  };

  const hasFilters = query.trim() || typeFilter !== 'all';

  const handleRemove = async (id) => {
    if (!onRemoveEvent || busyId) return;
    setBusyId(id);
    try {
      await onRemoveEvent(id);
    } finally {
      setBusyId('');
    }
  };

  const handleClearVisible = async () => {
    if (!onClearEvents) return;
    const label = typeFilter === 'all' ? 'all activity events' : `${EVENT_LABELS[typeFilter] || typeFilter} events`;
    if (!window.confirm(`Remove ${label} from Presence?`)) return;
    await onClearEvents(typeFilter === 'all' ? null : typeFilter);
    clearFilters();
  };

  return (
    <div className="md">
      <div className="mp-banner">
        <div className="mp-banner-row">
          <div>
            <h2>Presence</h2>
            <p>Live feed of scans, opens, reviews, and new restaurant launches across the platform.</p>
          </div>
          <div className="mp-banner-side">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            <div className="mp-chips">
              <span className="mp-chip"><em>{activity.length}</em> events</span>
              <span className="mp-chip"><em>{scans}</em> scans</span>
              <span className="mp-chip"><em>{reviews}</em> reviews</span>
              <span className="mp-chip"><em>{launches}</em> launches</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mp-card">
        <div className="mp-card-head">
          <h3>Activity timeline</h3>
          <span>
            {filtered.length}
            {filtered.length !== activity.length ? ` of ${activity.length}` : ''} events
          </span>
        </div>

        <div className="mp-toolbar">
          <div className="mp-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or restaurant"
              aria-label="Search activity"
            />
            {query ? (
              <button type="button" className="mp-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                ×
              </button>
            ) : null}
            <button type="button" className="mp-search-btn" onClick={() => setQuery(query.trim())}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Search
            </button>
          </div>

          <div className="mp-filter-tabs" role="tablist" aria-label="Event type filter">
            {typeTabs.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={typeFilter === f.id}
                className={`mp-filter-tab${typeFilter === f.id ? ' is-active' : ''}`}
                onClick={() => setTypeFilter(f.id)}
              >
                {f.label}
                <em>{f.count}</em>
              </button>
            ))}
          </div>

          {hasFilters && (
            <button type="button" className="mp-filter-clear" onClick={clearFilters}>
              Clear
            </button>
          )}

          {!!activity.length && (
            <button type="button" className="mp-filter-clear mp-presence-clear" onClick={handleClearVisible}>
              {typeFilter === 'all' ? 'Clear all' : `Clear ${EVENT_LABELS[typeFilter] || typeFilter}`}
            </button>
          )}
        </div>

        <div className="mp-timeline">
          {!activity.length && <div className="mp-empty">No recent activity.</div>}
          {!!activity.length && !filtered.length && (
            <div className="mp-empty">
              No events match your filters.
              <button type="button" className="md-link-btn" style={{ marginLeft: 10 }} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
          {filtered.map((e) => (
            <div className="mp-tl-item" key={e.id}>
              <div className={`mp-tl-ico ${tlTone(e.type)}`}>
                <TlIcon type={e.type} />
              </div>
              <div>
                <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                <span>
                  {e.restaurantName || e.restaurantId || 'Platform'}
                  {e.meta?.name ? ` · ${e.meta.name}` : ''}
                  {e.meta?.status ? ` · ${e.meta.status}` : ''}
                </span>
              </div>
              <div className="mp-tl-side">
                <time>{formatDate(e.ts)}</time>
                <button
                  type="button"
                  className="md-link-btn mp-btn-remove mp-tl-remove"
                  disabled={busyId === e.id}
                  onClick={() => {
                    if (window.confirm('Remove this event from Presence?')) {
                      handleRemove(e.id);
                    }
                  }}
                >
                  {busyId === e.id ? '…' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReportsPage({ reports, overview, onRefresh, refreshing }) {
  const daily = reports?.daily || [];
  const top = reports?.topRestaurants || [];
  const volume = reports?.reviewVolume || [];
  const maxBar = Math.max(1, ...daily.map((d) => d.scans + d.menuOpens));
  const maxTop = Math.max(1, ...top.map((r) => r.score || 0));
  const weekScans = daily.slice(-7).reduce((a, d) => a + d.scans, 0);
  const weekOpens = daily.slice(-7).reduce((a, d) => a + d.menuOpens, 0);
  const weekReviews = daily.slice(-7).reduce((a, d) => a + d.reviews, 0);

  return (
    <div className="md">
      <div className="mp-banner">
        <div className="mp-banner-row">
          <div>
            <h2>Reports</h2>
            <p>Platform trends — traffic, top restaurants, and review volume over the last two weeks.</p>
          </div>
          <div className="mp-banner-side">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            <div className="mp-chips">
              <span className="mp-chip"><em>{overview?.totalScans || 0}</em> all-time scans</span>
              <span className="mp-chip"><em>{overview?.totalReviews || 0}</em> reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mp-stat-row">
        <div className="mp-mini">
          <div className="l">Week · scans</div>
          <div className="v">{weekScans}</div>
        </div>
        <div className="mp-mini">
          <div className="l">Week · opens</div>
          <div className="v">{weekOpens}</div>
        </div>
        <div className="mp-mini">
          <div className="l">Week · reviews</div>
          <div className="v">{weekReviews}</div>
        </div>
        <div className="mp-mini">
          <div className="l">Restaurants</div>
          <div className="v">{overview?.totalRestaurants || 0}</div>
        </div>
      </div>

      <div className="mp-grid mp-grid-2">
        <section className="mp-card">
          <div className="mp-card-head">
            <h3>Traffic · 14 days</h3>
            <span>Scans + opens</span>
          </div>
          <div className="mp-chart" aria-hidden="true">
            {daily.map((d) => {
              const scanH = (d.scans / maxBar) * 100;
              const openH = (d.menuOpens / maxBar) * 100;
              return (
                <div
                  key={d.date}
                  className="mp-chart-col"
                  title={`${d.scans} scans, ${d.menuOpens} opens`}
                >
                  <div className="mp-chart-pair">
                    <div className="mp-chart-bar scans" style={{ height: `${Math.max(4, scanH)}%` }} />
                    <div className="mp-chart-bar opens" style={{ height: `${Math.max(4, openH)}%` }} />
                  </div>
                  <em>{formatDay(d.date)}</em>
                </div>
              );
            })}
          </div>
          <div className="mp-chart-legend">
            <span><i className="scans" /> QR scans</span>
            <span><i className="opens" /> Menu opens</span>
          </div>
        </section>

        <section className="mp-card">
          <div className="mp-card-head">
            <h3>Review volume</h3>
            <span>By restaurant</span>
          </div>
          <div className="mp-rank">
            {!volume.length && <div className="mp-empty">No reviews yet.</div>}
            {volume.map((r, i) => (
              <div className="mp-rank-row" key={r.restaurantId}>
                <div className="mp-rank-n">{i + 1}</div>
                <div className="mp-rank-meta">
                  <strong>{r.name}</strong>
                  <div className="mp-rank-bar">
                    <i style={{ width: `${Math.max(8, (r.count / Math.max(1, volume[0]?.count || 1)) * 100)}%` }} />
                  </div>
                </div>
                <div className="mp-rank-score">{r.count} · {r.average || 0}★</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mp-card">
        <div className="mp-card-head">
          <h3>Top restaurants by traffic</h3>
          <span>Score = scans + opens</span>
        </div>
        <div className="mp-rank">
          {!top.length && <div className="mp-empty">No traffic yet.</div>}
          {top.map((r, i) => (
            <div className="mp-rank-row" key={r.restaurantId}>
              <div className="mp-rank-n">{i + 1}</div>
              <div className="mp-rank-meta">
                <strong>{r.name}</strong>
                <div className="mp-rank-bar">
                  <i style={{ width: `${Math.max(8, (r.score / maxTop) * 100)}%` }} />
                </div>
              </div>
              <div className="mp-rank-score">
                {r.scans} scans · {r.menuOpens} opens
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PlansPage({ subscriptions, plans, statuses, overview, onUpdate, onRefresh, refreshing }) {
  return (
    <div className="md">
      <div className="mp-banner">
        <div className="mp-banner-row">
          <div>
            <h2>Plans</h2>
            <p>Manage Free, Starter, Pro, and Business for every restaurant on the platform.</p>
          </div>
          <div className="mp-banner-side">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            <div className="mp-chips">
              <span className="mp-chip"><em>{overview?.activeSubscriptions || 0}</em> paid</span>
              <span className="mp-chip"><em>{overview?.freePlans || 0}</em> free</span>
              <span className="mp-chip"><em>{overview?.pastDue || 0}</em> past due</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mp-card">
        <div className="mp-card-head">
          <h3>Subscriptions</h3>
          <span>{subscriptions.length} restaurants</span>
        </div>
        <div className="mp-plan-grid">
          {subscriptions.map((s) => (
            <article className="mp-plan" key={s.restaurantId}>
              <div className="mp-plan-top">
                <div className="mp-rest-emoji">{s.emoji || '🍽️'}</div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem', fontWeight: 800 }}>
                    {s.restaurantName}
                  </strong>
                  <span className={`md-badge ${s.status}`} style={{ marginTop: 6 }}>
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="mp-plan-fields">
                <label>
                  Plan
                  <select
                    className="md-select"
                    value={s.plan}
                    onChange={(e) => onUpdate(s.restaurantId, { plan: e.target.value })}
                  >
                    {plans.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    className="md-select"
                    value={s.status}
                    onChange={(e) => onUpdate(s.restaurantId, { status: e.target.value })}
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st.replace('_', ' ')}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mp-plan-meta">
                <span>Started {formatDate(s.startedAt)}</span>
                <span>Renews {s.renewsAt ? formatDate(s.renewsAt) : '—'}</span>
              </div>
            </article>
          ))}
          {!subscriptions.length && <div className="mp-empty">No subscriptions yet.</div>}
        </div>
      </section>
    </div>
  );
}

export function ReviewsPage({ reviews, onRefresh, refreshing }) {
  const avg = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length) * 10) / 10
    : 0;
  const five = reviews.filter((r) => Number(r.rating) === 5).length;

  return (
    <div className="md">
      <div className="mp-banner">
        <div className="mp-banner-row">
          <div>
            <h2>Reviews</h2>
            <p>All guest feedback across every restaurant, newest first.</p>
          </div>
          <div className="mp-banner-side">
            <RefreshButton onClick={onRefresh} busy={refreshing} />
            <div className="mp-chips">
              <span className="mp-chip"><em>{reviews.length}</em> total</span>
              <span className="mp-chip"><em>{avg || 0}</em> avg ★</span>
              <span className="mp-chip"><em>{five}</em> five-star</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mp-card">
        <div className="mp-card-head">
          <h3>Guest feedback</h3>
          <span>{reviews.length} reviews</span>
        </div>
        {!reviews.length && <div className="mp-empty">No reviews yet.</div>}
        <div className="mp-rev-grid">
          {reviews.map((r) => (
            <article className="mp-rev" key={`${r.restaurantId}-${r.id}`}>
              <div className="mp-rev-top">
                <div>
                  <strong>
                    {r.restaurantEmoji} {r.restaurantName}
                  </strong>
                  <span>{r.name}</span>
                </div>
                <div className="mp-stars" title={`${r.rating} stars`}>
                  {stars(r.rating)}
                </div>
              </div>
              <p>{r.comment || 'No comment'}</p>
              <time>{formatDate(r.ts)}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
