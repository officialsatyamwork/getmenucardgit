import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toplogo from '../assets/top_logo.png';
import { useMasterAuth } from './MasterAuthContext';
import { masterApi } from './masterApi';
import { refreshRestaurantVisibility, pushLocalMenusToBackend } from '../restaurantStore';
import MasterOverview from './MasterOverview';
import {
  RestaurantsPage,
  RestaurantDetailPage,
  PresencePage,
  ReportsPage,
  PlansPage,
  ReviewsPage,
} from './MasterPages';
import './MasterDashboard.css';
import './MasterAuth.css';

const Icon = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  restaurants: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V9.5L5.5 4h13L20 9.5V20H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  activity: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2.5-7 4 14L16 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  reports: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  subscriptions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  reviews: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l2.4 5.1 5.6.6-4.2 3.9 1.2 5.5L12 15.8 6.9 18.1l1.2-5.5L3.9 8.7l5.6-.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: Icon.overview },
  { id: 'restaurants', label: 'Restaurants', icon: Icon.restaurants },
  { id: 'activity', label: 'Presence', icon: Icon.activity },
  { id: 'reports', label: 'Reports', icon: Icon.reports },
  { id: 'subscriptions', label: 'Plans', icon: Icon.subscriptions },
  { id: 'reviews', label: 'Reviews', icon: Icon.reviews },
];

export default function MasterDashboard() {
  const { owner, logout } = useMasterAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reports, setReports] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState(['Free', 'Starter', 'Pro', 'Business']);
  const [statuses, setStatuses] = useState(['active', 'past_due', 'cancelled']);
  const [reviews, setReviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadAll = async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      // Sync any menus published on the website (localStorage) into Master Admin DB
      try {
        await pushLocalMenusToBackend();
      } catch {
        /* backend may be down — still load whatever is already stored */
      }

      const [ov, rest, act, rep, subs, revs] = await Promise.all([
        masterApi.overview(),
        masterApi.restaurants(),
        masterApi.activity(50),
        masterApi.reports(),
        masterApi.subscriptions(),
        masterApi.reviews(),
      ]);
      setOverview(ov);
      setRestaurants(rest.restaurants || []);
      setActivity(act.activity || []);
      setReports(rep);
      setSubscriptions(subs.subscriptions || []);
      if (subs.plans) setPlans(subs.plans);
      if (subs.statuses) setStatuses(subs.statuses);
      setReviews(revs.reviews || []);
      await refreshRestaurantVisibility();

      if (soft && selectedId) {
        setDetail(await masterApi.restaurant(selectedId));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const softRefresh = () => {
    if (refreshing || loading) return;
    loadAll({ soft: true });
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await masterApi.restaurant(selectedId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const onLogout = () => {
    logout();
    navigate('/gmc-console/login', { replace: true });
  };

  const updateSub = async (restaurantId, patch) => {
    try {
      const data = await masterApi.updateSubscription(restaurantId, patch);
      setSubscriptions((prev) =>
        prev.map((s) => (s.restaurantId === restaurantId ? { ...s, ...data.subscription } : s))
      );
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurantId
            ? { ...r, plan: data.subscription.plan, planStatus: data.subscription.status }
            : r
        )
      );
      setOverview(await masterApi.overview());
    } catch (err) {
      setError(err.message);
    }
  };

  const updateRestaurantStatus = async (restaurantId, status, reason) => {
    try {
      const data = await masterApi.updateRestaurantStatus(restaurantId, { status, reason });
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, ...data.restaurant } : r))
      );
      if (selectedId === restaurantId) {
        const fresh = await masterApi.restaurant(restaurantId);
        setDetail(fresh);
      }
      setOverview(await masterApi.overview());
      setSubscriptions((await masterApi.subscriptions()).subscriptions || []);
      await refreshRestaurantVisibility();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="md-root">
      <aside className="md-sidebar">
        <button type="button" className="md-side-brand" onClick={() => navigate('/')}>
          <img src={toplogo} alt="GetMenuCard" />
          <div>
            <strong>GetMenuCard</strong>
            <span>Master Console</span>
          </div>
        </button>
        <nav className="md-nav" aria-label="Master sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => {
                setTab(t.id);
                if (t.id !== 'restaurants') setSelectedId(null);
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <div className="md-side-foot">
          <div className="md-owner">
            <strong>{owner?.name}</strong>
            {owner?.email}
          </div>
          <button type="button" className="md-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="md-main">
        {error && <div className="md-error-banner">{error}</div>}
        {loading && <div className="md-loading-block">Loading platform data</div>}

        {!loading && (
          <div className={`md-page${refreshing ? ' is-refreshing' : ''}`}>
            {refreshing && (
              <div className="md-refresh-overlay" aria-live="polite">
                <div className="md-refresh-spinner" />
                <span>Refreshing data…</span>
              </div>
            )}

            {tab === 'overview' && overview && (
              <MasterOverview
                overview={overview}
                reports={reports}
                activity={activity}
                ownerName={owner?.name}
                onOpenRestaurants={() => setTab('restaurants')}
                onRefresh={softRefresh}
                refreshing={refreshing}
              />
            )}

            {tab === 'restaurants' && !selectedId && (
              <RestaurantsPage
                restaurants={restaurants}
                onOpenReport={(id) => setSelectedId(id)}
                onSetStatus={updateRestaurantStatus}
                onRefresh={softRefresh}
                refreshing={refreshing}
              />
            )}

            {tab === 'restaurants' && selectedId && (
              detail
                ? (
                  <RestaurantDetailPage
                    detail={detail}
                    onBack={() => setSelectedId(null)}
                    onSetStatus={updateRestaurantStatus}
                    onRefresh={softRefresh}
                    refreshing={refreshing}
                  />
                )
                : <div className="md-loading-block">Loading restaurant</div>
            )}

            {tab === 'activity' && (
              <PresencePage
                activity={activity}
                onRefresh={softRefresh}
                refreshing={refreshing}
                onRemoveEvent={async (id) => {
                  try {
                    await masterApi.deleteActivity(id);
                    setActivity((prev) => prev.filter((e) => e.id !== id));
                  } catch (err) {
                    setError(err.message);
                  }
                }}
                onClearEvents={async (type) => {
                  try {
                    await masterApi.clearActivity(type);
                    if (!type) setActivity([]);
                    else setActivity((prev) => prev.filter((e) => e.type !== type));
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              />
            )}

            {tab === 'reports' && reports && (
              <ReportsPage reports={reports} overview={overview} onRefresh={softRefresh} refreshing={refreshing} />
            )}

            {tab === 'subscriptions' && (
              <PlansPage
                subscriptions={subscriptions}
                plans={plans}
                statuses={statuses}
                overview={overview}
                onUpdate={updateSub}
                onRefresh={softRefresh}
                refreshing={refreshing}
              />
            )}

            {tab === 'reviews' && (
              <ReviewsPage reviews={reviews} onRefresh={softRefresh} refreshing={refreshing} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
