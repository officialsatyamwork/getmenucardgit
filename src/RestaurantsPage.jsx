import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants, loadPublicRestaurants, refreshRestaurantVisibility, trackEvent } from './restaurantStore';
import RestaurantCard from './RestaurantCard';
import SiteNav from './SiteNav';
import './HomePage.css';
import './RestaurantsPage.css';

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState(() => getAllRestaurants());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const applyLocal = () => setList(getAllRestaurants());
    (async () => {
      setLoading(true);
      await refreshRestaurantVisibility().catch(() => {});
      await loadPublicRestaurants();
      if (cancelled) return;
      setList(getAllRestaurants());
      setLoading(false);
    })();
    window.addEventListener('mc_restaurants_updated', applyLocal);
    window.addEventListener('mc_visibility_updated', applyLocal);
    return () => {
      cancelled = true;
      window.removeEventListener('mc_restaurants_updated', applyLocal);
      window.removeEventListener('mc_visibility_updated', applyLocal);
    };
  }, []);

  const q = search.toLowerCase();
  const filtered = list.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.tagline?.toLowerCase().includes(q) ||
    r.location?.toLowerCase().includes(q)
  );

  const handleView = (id) => {
    trackEvent('qr_scan', id);
    navigate(`/menu/${id}`);
  };

  return (
    <div className="rp-wrap">

      <SiteNav active="/restaurants" scrolled ctaLabel="Sign up free" />

      <header className="rp-header">
        <div className="rp-header-inner">
          <div className="hp-eyebrow">All restaurants</div>
          <h1 className="rp-title">Browse &amp; <em>scan</em> menus</h1>
          <p className="rp-sub">Tap any restaurant to open its digital menu, exactly as a guest would after scanning the table QR.</p>

          <div className="rp-search-wrap">
            <svg width="18" height="18" viewBox="0 0 17 17" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              className="rp-search"
              placeholder="Search by name or cuisine…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search restaurants"
            />
            <span className="rp-count">{filtered.length}</span>
          </div>
        </div>
      </header>

      <main className="rp-body">
        <div className="rp-grid">
          {loading ? (
            <div className="rp-empty">
              <div className="rp-empty-title">Loading restaurants…</div>
              <div className="rp-empty-text">Pulling the latest live menus from the server.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rp-empty">
              <div className="rp-empty-title">No restaurants found</div>
              <div className="rp-empty-text">Nothing matches “{search}”. Try another name or cuisine.</div>
            </div>
          ) : (
            filtered.map(r => <RestaurantCard key={r.id} restaurant={r} onOpen={handleView} />)
          )}
        </div>
      </main>
    </div>
  );
}
