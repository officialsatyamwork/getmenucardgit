import { useState } from 'react';
import RefreshButton from './RefreshButton';
import './MasterOverview.css';
import './MasterPages.css';

const EVENT_LABELS = {
  qr_scan: 'QR scan',
  menu_open: 'Menu open',
  food_view: 'Food view',
  review_submit: 'New review',
  review_qr_scan: 'Review QR',
  restaurant_launch: 'New launch',
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const KpiIcon = {
  store: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V9.5L5.5 4h13L20 9.5V20H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  qr: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l2.4 5.1 5.6.6-4.2 3.9 1.2 5.5L12 15.8 6.9 18.1l1.2-5.5L3.9 8.7l5.6-.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  card: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  pulse: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2.5-7 4 14L16 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function ActIcon({ type }) {
  if (type === 'restaurant_launch') return KpiIcon.store;
  if (type === 'review_submit' || type === 'review_qr_scan') return KpiIcon.star;
  if (type === 'qr_scan') return KpiIcon.qr;
  if (type === 'menu_open' || type === 'food_view') return KpiIcon.eye;
  return KpiIcon.pulse;
}

function TrafficPulseChart({ daily, maxTraffic }) {
  const [hover, setHover] = useState(null);
  const w = 640;
  const h = 200;
  const pad = { t: 16, r: 12, b: 28, l: 8 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = Math.max(daily.length, 1);
  const maxY = Math.max(maxTraffic, 1);

  const pointAt = (i, value) => {
    const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = pad.t + innerH - (value / maxY) * innerH;
    return { x, y };
  };

  const buildPath = (key) => {
    if (!daily.length) return '';
    return daily
      .map((d, i) => {
        const { x, y } = pointAt(i, d[key] || 0);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildArea = (key) => {
    if (!daily.length) return '';
    const line = buildPath(key);
    const last = pointAt(daily.length - 1, daily[daily.length - 1][key] || 0);
    const first = pointAt(0, daily[0][key] || 0);
    return `${line} L${last.x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} L${first.x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;
  };

  const totalScans = daily.reduce((a, d) => a + d.scans, 0);
  const totalOpens = daily.reduce((a, d) => a + d.menuOpens, 0);
  const peak = daily.reduce(
    (best, d) => ((d.scans + d.menuOpens) > (best.scans + best.menuOpens) ? d : best),
    daily[0] || { scans: 0, menuOpens: 0, date: '' }
  );
  const avg = daily.length
    ? Math.round((totalScans + totalOpens) / daily.length)
    : 0;

  const active = hover != null ? daily[hover] : daily[daily.length - 1];
  const activeTotal = active ? active.scans + active.menuOpens : 0;

  return (
    <div className="ov-pulse">
      <div className="ov-pulse-stats">
        <div>
          <span>Period scans</span>
          <strong>{totalScans.toLocaleString()}</strong>
        </div>
        <div>
          <span>Period opens</span>
          <strong>{totalOpens.toLocaleString()}</strong>
        </div>
        <div>
          <span>Daily avg</span>
          <strong>{avg.toLocaleString()}</strong>
        </div>
        <div>
          <span>Peak day</span>
          <strong>{peak?.date ? formatDay(peak.date) : '—'}</strong>
        </div>
      </div>

      <div className="ov-pulse-chart-wrap">
        <svg
          className="ov-pulse-svg"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Traffic over the last 14 days"
        >
          <defs>
            <linearGradient id="ovPulseScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4831f" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f4831f" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="ovPulseOpens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d1b19" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1d1b19" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              className="ov-pulse-grid"
              x1={pad.l}
              x2={w - pad.r}
              y1={pad.t + innerH * (1 - p)}
              y2={pad.t + innerH * (1 - p)}
            />
          ))}

          <path d={buildArea('menuOpens')} fill="url(#ovPulseOpens)" />
          <path d={buildArea('scans')} fill="url(#ovPulseScans)" />
          <path d={buildPath('menuOpens')} className="ov-pulse-line opens" fill="none" />
          <path d={buildPath('scans')} className="ov-pulse-line scans" fill="none" />

          {daily.map((d, i) => {
            const scans = pointAt(i, d.scans);
            const opens = pointAt(i, d.menuOpens);
            const isActive = hover === i || (hover == null && i === daily.length - 1);
            return (
              <g key={d.date}>
                <rect
                  x={pad.l + (n === 1 ? 0 : ((i - 0.5) / Math.max(n - 1, 1)) * innerW)}
                  y={pad.t}
                  width={n === 1 ? innerW : innerW / Math.max(n - 1, 1)}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
                {isActive && (
                  <line
                    className="ov-pulse-guide"
                    x1={scans.x}
                    x2={scans.x}
                    y1={pad.t}
                    y2={pad.t + innerH}
                  />
                )}
                <circle
                  className={`ov-pulse-dot scans${isActive ? ' on' : ''}`}
                  cx={scans.x}
                  cy={scans.y}
                  r={isActive ? 4.5 : 0}
                />
                <circle
                  className={`ov-pulse-dot opens${isActive ? ' on' : ''}`}
                  cx={opens.x}
                  cy={opens.y}
                  r={isActive ? 4 : 0}
                />
              </g>
            );
          })}
        </svg>

        <div className="ov-pulse-x">
          {daily.map((d, i) => (
            (i === 0 || i === daily.length - 1 || i % 3 === 0) ? (
              <em key={d.date} style={{ left: `${n === 1 ? 50 : (i / (n - 1)) * 100}%` }}>
                {formatDay(d.date)}
              </em>
            ) : null
          ))}
        </div>

        {active && (
          <div className="ov-pulse-tip">
            <strong>{formatDay(active.date)}</strong>
            <span>{active.scans} scans</span>
            <span>{active.menuOpens} opens</span>
            <span className="ov-pulse-tip-total">{activeTotal} total</span>
          </div>
        )}
      </div>

      <div className="ov-legend">
        <span><i className="scans" /> QR scans</span>
        <span><i className="opens" /> Menu opens</span>
      </div>
    </div>
  );
}

export default function MasterOverview({ overview, reports, activity, ownerName, onOpenRestaurants, onRefresh, refreshing }) {
  const daily = reports?.daily || [];
  const top = reports?.topRestaurants || [];
  const maxTraffic = Math.max(
    1,
    ...daily.flatMap((d) => [d.scans || 0, d.menuOpens || 0])
  );
  const maxTop = Math.max(1, ...top.map((r) => r.score || 0));
  const today = daily[daily.length - 1] || { scans: 0, menuOpens: 0, reviews: 0 };
  const weekScans = daily.slice(-7).reduce((a, d) => a + d.scans, 0);
  const weekOpens = daily.slice(-7).reduce((a, d) => a + d.menuOpens, 0);

  const kpis = [
    {
      label: 'Restaurants',
      value: overview.totalRestaurants,
      hint: 'Launched on platform',
      icon: KpiIcon.store,
      tone: 'ink',
    },
    {
      label: 'Menus live',
      value: overview.totalMenusPublished,
      hint: 'Published & browseable',
      icon: KpiIcon.menu,
      tone: 'orange',
    },
    {
      label: 'QR scans',
      value: overview.totalScans,
      hint: `${weekScans} this week`,
      icon: KpiIcon.qr,
      tone: 'gold',
    },
    {
      label: 'Menu opens',
      value: overview.totalMenuOpens,
      hint: `${weekOpens} this week`,
      icon: KpiIcon.eye,
      tone: 'brown',
    },
    {
      label: 'Reviews',
      value: overview.totalReviews,
      hint: 'Guest feedback',
      icon: KpiIcon.star,
      tone: 'leaf',
    },
    {
      label: 'Paid plans',
      value: overview.activeSubscriptions,
      hint: `${overview.pastDue || 0} past due`,
      icon: KpiIcon.card,
      tone: overview.pastDue ? 'red' : 'orange',
    },
  ];

  return (
    <div className="ov">
      <section className="ov-hero">
        <div className="ov-hero-inner">
          <div className="ov-hero-top">
            <div className="ov-hero-copy">
              <div className="ov-kicker">
                <i /> Live platform
              </div>
              <h2>
                {greeting()}
                {ownerName ? `, ${ownerName.split(' ')[0]}` : ''}.
              </h2>
            </div>
            <RefreshButton onClick={onRefresh} busy={refreshing} />
          </div>
          <div className="ov-hero-metrics">
            <div className="ov-hero-metric">
              <span>Today scans</span>
              <strong>{today.scans}</strong>
            </div>
            <div className="ov-hero-metric">
              <span>Today opens</span>
              <strong>{today.menuOpens}</strong>
            </div>
            <div className="ov-hero-metric">
              <span>Restaurants</span>
              <strong>{overview.totalRestaurants}</strong>
            </div>
            <div className="ov-hero-metric">
              <span>Paid active</span>
              <strong>{overview.activeSubscriptions}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ov-kpis" aria-label="Key metrics">
        {kpis.map((k) => (
          <article className="ov-kpi" key={k.label}>
            <div className={`ov-kpi-icon ${k.tone}`}>{k.icon}</div>
            <div className="ov-kpi-body">
              <div className="label">{k.label}</div>
              <div className="value">{k.value.toLocaleString()}</div>
              <div className="hint">{k.hint}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="ov-layout">
        <div className="ov-card ov-pulse-card">
          <div className="ov-card-head">
            <h3>Traffic pulse</h3>
            <span>Last 14 days</span>
          </div>
          <div className="ov-card-body">
            <TrafficPulseChart daily={daily} maxTraffic={maxTraffic} />
          </div>
        </div>

        <div className="ov-card">
          <div className="ov-card-head">
            <h3>Top restaurants</h3>
            <button type="button" className="md-link-btn" onClick={onOpenRestaurants}>
              View all
            </button>
          </div>
          <div className="ov-card-body">
            {!top.length && <div className="ov-empty">No traffic yet.</div>}
            <div className="ov-rank">
              {top.slice(0, 6).map((r, i) => (
                <div className="ov-rank-row" key={r.restaurantId}>
                  <div className="ov-rank-n">{i + 1}</div>
                  <div className="ov-rank-meta">
                    <strong>{r.name}</strong>
                    <div className="ov-rank-bar">
                      <i style={{ width: `${Math.max(8, (r.score / maxTop) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="ov-rank-score">{r.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ov-bottom">
        <div className="ov-card">
          <div className="ov-card-head">
            <h3>Live presence</h3>
            <span>Latest events</span>
          </div>
          <div className="ov-card-body">
            <div className="ov-activity">
              {(activity || []).slice(0, 8).map((e) => (
                <div className="ov-act" key={e.id}>
                  <div className="ov-act-ico">
                    <ActIcon type={e.type} />
                  </div>
                  <div>
                    <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                    <span>
                      {e.restaurantName || e.restaurantId || 'Platform'}
                      {e.meta?.name ? ` · ${e.meta.name}` : ''}
                    </span>
                  </div>
                  <time>{formatDate(e.ts)}</time>
                </div>
              ))}
              {!activity?.length && <div className="ov-empty">No recent activity.</div>}
            </div>
          </div>
        </div>

        <div className="ov-card">
          <div className="ov-card-head">
            <h3>Plan health</h3>
            <span>Subscriptions</span>
          </div>
          <div className="ov-card-body">
            <div className="ov-health">
              <div className="ov-health-row">
                <div>
                  <strong>Paid active</strong>
                  <span>Starter / Pro / Business</span>
                </div>
                <span className="ov-pill good">{overview.activeSubscriptions}</span>
              </div>
              <div className="ov-health-row">
                <div>
                  <strong>Free plans</strong>
                  <span>Starter freemium</span>
                </div>
                <span className="ov-pill muted">{overview.freePlans || 0}</span>
              </div>
              <div className="ov-health-row">
                <div>
                  <strong>Past due</strong>
                  <span>Needs attention</span>
                </div>
                <span className={`ov-pill ${overview.pastDue ? 'warn' : 'good'}`}>
                  {overview.pastDue || 0}
                </span>
              </div>
              <div className="ov-health-row">
                <div>
                  <strong>Cancelled</strong>
                  <span>Churned plans</span>
                </div>
                <span className="ov-pill muted">{overview.cancelled || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
