import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toplogo from '../assets/top_logo.png';
import { useOwnerAuth } from './OwnerAuthContext';
import { ownerApi } from './ownerApi';
import OwnerMenuEditor from './OwnerMenuEditor';
import OwnerQrToolkit from './OwnerQrToolkit';
import './OwnerDashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'menu', label: 'Menu' },
  { id: 'qr', label: 'QR & share' },
  { id: 'activity', label: 'Activity' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'plan', label: 'Plan' },
  { id: 'settings', label: 'Settings' },
];

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EVENT_LABELS = {
  qr_scan: 'QR scan',
  menu_open: 'Menu open',
  food_view: 'Food view',
  review_submit: 'New review',
  review_qr_scan: 'Review QR scan',
  restaurant_launch: 'Restaurant launched',
  restaurant_status: 'Status changed',
};

export default function OwnerDashboard() {
  const { owner, logout } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    location: '',
    emoji: '🍽️',
    googleReviewUrl: '',
    coverImage: '',
    accent: '#f4831f',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const dash = await ownerApi.dashboard();
      setData(dash);
      if (dash.restaurant) {
        setForm({
          name: dash.restaurant.name || '',
          tagline: dash.restaurant.tagline || '',
          location: dash.restaurant.location || '',
          emoji: dash.restaurant.emoji || '🍽️',
          googleReviewUrl: dash.restaurant.googleReviewUrl || '',
          coverImage: dash.restaurant.coverImage || '',
          accent: dash.restaurant.accent || '#f4831f',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab);
  }, [location.state]);

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await ownerApi.updateRestaurant(form);
      setData((prev) => ({
        ...prev,
        restaurant: res.restaurant,
        summary: res.summary || prev.summary,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /*
  const changePlan = async (plan) => {
    setSaving(true);
    setError('');
    try {
      const res = await ownerApi.updateSubscription({ plan });
      setData((prev) => ({
        ...prev,
        subscription: res.subscription,
        owner: { ...prev.owner, plan },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  */

  if (loading && !data) {
    return <div className="od-loading">Loading your restaurant</div>;
  }

  const restaurant = data?.restaurant;
  const summary = data?.summary || {};
  const subscription = data?.subscription || {};
  const currentPlan = data?.owner?.plan || subscription.plan || 'Free';
  const events = data?.recentEvents || [];
  const reviews = data?.reviews || [];
  // const plans = data?.plans || [];

  return (
    <div className="od">
      <aside className="od-side">
        <button type="button" className="od-brand" onClick={() => navigate('/')}>
          <img src={toplogo} alt="GetMenuCard" />
          <div>
            <strong>GetMenuCard</strong>
            <span>Owner dashboard</span>
          </div>
        </button>
        <nav className="od-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'is-active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="od-side-foot">
          <div className="od-owner">
            <strong>{owner?.name}</strong>
            {owner?.email}
          </div>
          <button type="button" className="od-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="od-main">
        <div className="od-top">
          <div>
            <h1>{restaurant?.name || 'Your restaurant'}</h1>
            <p>Manage menu presence, activity, reviews, and your subscription.</p>
          </div>
          <div className="od-top-actions">
            <button type="button" className="od-btn" onClick={load}>Refresh</button>
            {restaurant?.id && (
              <>
                <button type="button" className="od-btn" onClick={() => setTab('menu')}>
                  Edit menu
                </button>
                <button
                  type="button"
                  className="od-btn od-btn-primary"
                  onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}
                >
                  Open live menu
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="od-error">{error}</div>}

        {restaurant && (restaurant.status === 'held' || summary.status === 'held') && (
          <div className="od-banner od-banner-warn" role="status">
            <strong>Menu on hold</strong>
            <span>
              {restaurant.statusReason
                || 'Your live menu is temporarily unavailable to guests. Contact support or update billing to restore access.'}
            </span>
          </div>
        )}

        {restaurant && (restaurant.status === 'removed' || summary.status === 'removed') && (
          <div className="od-banner od-banner-danger" role="status">
            <strong>Menu removed</strong>
            <span>
              {restaurant.statusReason
                || 'This restaurant has been removed from the public directory. Contact support if this is unexpected.'}
            </span>
          </div>
        )}

        {!restaurant && (
          <div className="od-card">
            <div className="od-empty">No restaurant linked to this account yet.</div>
          </div>
        )}

        {restaurant && tab === 'overview' && (
          <>
            <section className="od-hero">
              <div>
                <h2>
                  {restaurant.emoji || '🍽️'} {restaurant.name}
                </h2>
                <p>
                  {restaurant.tagline || 'Your digital menu'}
                  {restaurant.location ? ` · ${restaurant.location}` : ''}
                </p>
              </div>
              <div className="od-hero-badges">
                <span className="od-badge">{summary.status || restaurant.status || 'active'}</span>
                <span className="od-badge">{currentPlan} plan</span>
              </div>
            </section>

            <div className="od-stats">
              <div className="od-stat">
                <span>QR scans</span>
                <strong>{summary.scans || 0}</strong>
              </div>
              <div className="od-stat">
                <span>Menu opens</span>
                <strong>{summary.menuOpens || 0}</strong>
              </div>
              <div className="od-stat">
                <span>Menu items</span>
                <strong>{summary.menuItemCount || 0}</strong>
              </div>
              <div className="od-stat">
                <span>Reviews</span>
                <strong>{summary.reviewCount || reviews.length || 0}</strong>
              </div>
            </div>

            <div className="od-grid">
              <section className="od-card">
                <div className="od-card-head">
                  <h3>Recent activity</h3>
                  <span>Latest</span>
                </div>
                <div className="od-list">
                  {!events.length && <div className="od-empty">No activity yet.</div>}
                  {events.slice(0, 6).map((e) => (
                    <div className="od-row" key={e.id}>
                      <div>
                        <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                        <span>{restaurant.name}</span>
                      </div>
                      <time>{formatDate(e.ts)}</time>
                    </div>
                  ))}
                </div>
              </section>

              <section className="od-card">
                <div className="od-card-head">
                  <h3>Latest reviews</h3>
                  <span>{reviews.length}</span>
                </div>
                <div className="od-list">
                  {!reviews.length && <div className="od-empty">No reviews yet.</div>}
                  {reviews.slice(0, 5).map((r) => (
                    <div className="od-row" key={r.id}>
                      <div>
                        <strong>{r.name || 'Guest'} · {r.rating || 0}★</strong>
                        <span>{r.comment || 'No comment'}</span>
                      </div>
                      <time>{formatDate(r.ts)}</time>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {restaurant && tab === 'menu' && (
          <section className="od-card" style={{ padding: '20px 20px 24px' }}>
            <OwnerMenuEditor
              restaurant={restaurant}
              onSaved={(res) => {
                setData((prev) => ({
                  ...prev,
                  restaurant: res.restaurant,
                  summary: res.summary || prev.summary,
                }));
              }}
            />
          </section>
        )}

        {restaurant && tab === 'qr' && (
          <section className="od-card">
            <OwnerQrToolkit restaurant={restaurant} />
          </section>
        )}

        {restaurant && tab === 'activity' && (
          <section className="od-card">
            <div className="od-card-head">
              <h3>All activity</h3>
              <span>{events.length} events</span>
            </div>
            <div className="od-list">
              {!events.length && <div className="od-empty">No activity yet.</div>}
              {events.map((e) => (
                <div className="od-row" key={e.id}>
                  <div>
                    <strong>{EVENT_LABELS[e.type] || e.type}</strong>
                    <span>{restaurant.name}</span>
                  </div>
                  <time>{formatDate(e.ts)}</time>
                </div>
              ))}
            </div>
          </section>
        )}

        {restaurant && tab === 'reviews' && (
          <section className="od-card">
            <div className="od-card-head">
              <h3>Guest reviews</h3>
              <span>{reviews.length} total</span>
            </div>
            <div className="od-list">
              {!reviews.length && <div className="od-empty">No reviews yet.</div>}
              {reviews.map((r) => (
                <div className="od-row" key={r.id}>
                  <div>
                    <strong>{r.name || 'Guest'} · {r.rating || 0}★</strong>
                    <span>{r.comment || 'No comment'}</span>
                  </div>
                  <time>{formatDate(r.ts)}</time>
                </div>
              ))}
            </div>
          </section>
        )}

        {restaurant && tab === 'plan' && (
          <section className="od-card">
            <div className="od-card-head">
              <h3>Subscription</h3>
              <span>Current: {currentPlan}</span>
            </div>
            <div className="od-coming-soon">
              <span className="od-coming-soon-badge">Coming soon</span>
              <h4>Paid plans are on the way</h4>
              <p>
                You&apos;re on the Free plan for now. Pricing upgrades for branding, analytics,
                and more will show up here soon.
              </p>
            </div>
            {/*
            <div className="od-plans">
              {plans.map((p) => (
                <article key={p.id} className={`od-plan${currentPlan === p.id ? ' is-current' : ''}`}>
                  <h4>{p.id}</h4>
                  <p>
                    {p.price ? `₹${p.price}/${p.period}` : 'Free forever'} — {p.blurb}
                  </p>
                  <button
                    type="button"
                    className={`od-btn${currentPlan === p.id ? '' : ' od-btn-primary'}`}
                    disabled={saving || currentPlan === p.id}
                    onClick={() => changePlan(p.id)}
                  >
                    {currentPlan === p.id ? 'Current plan' : `Switch to ${p.id}`}
                  </button>
                </article>
              ))}
            </div>
            */}
          </section>
        )}

        {restaurant && tab === 'settings' && (
          <section className="od-card">
            <div className="od-card-head">
              <h3>Restaurant settings</h3>
              <span>{restaurant.id}</span>
            </div>
            <form className="od-form" onSubmit={saveSettings}>
              <label>
                Restaurant name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Tagline
                <input
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                />
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Area, city or Google Maps link"
                />
              </label>
              <label>
                Emoji
                <input
                  value={form.emoji}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                />
              </label>
              <label>
                Accent colour
                <input
                  type="color"
                  value={form.accent || '#f4831f'}
                  onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                />
              </label>
              <label>
                Cover image URL
                <input
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label>
                Google Review link
                <input
                  value={form.googleReviewUrl}
                  onChange={(e) => setForm((f) => ({ ...f, googleReviewUrl: e.target.value }))}
                  placeholder="https://g.page/r/…/review"
                />
              </label>
              <p className="od-form-hint">
                Guests see this after rating you in-app — and on the review page as a Google Reviews shortcut.
              </p>
              <button type="submit" className="od-btn od-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
