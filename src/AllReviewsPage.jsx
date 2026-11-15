import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReviews } from './restaurantStore';
import SiteNav from './SiteNav';
import './HomePage.css';
import './AllReviewsPage.css';

const IconStar = ({ size = 14, filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
    />
  </svg>
);

function formatWhen(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AllReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(() => getAllReviews());

  useEffect(() => {
    const refresh = () => setReviews(getAllReviews());
    window.addEventListener('mc_reviews_updated', refresh);
    return () => window.removeEventListener('mc_reviews_updated', refresh);
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { count: 0, average: 0, restaurants: 0 };
    const sum = reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);
    const restaurants = new Set(reviews.map(r => r.restaurantId));
    return {
      count: reviews.length,
      average: Math.round((sum / reviews.length) * 10) / 10,
      restaurants: restaurants.size,
    };
  }, [reviews]);

  return (
    <div className="arp">
      <SiteNav active="/reviews" scrolled ctaLabel="Sign up free" />

      <header className="arp-hero">
        <div className="arp-hero-inner">
          <div className="eyebrow">Collected ratings</div>
          <h1 className="arp-title">All guest <em>reviews</em></h1>
          <p className="arp-sub">
            Every rating guests leave from menu “Rate us” pages — gathered in one place.
          </p>

          <div className="arp-stats">
            <div className="arp-stat">
              <strong>{stats.count}</strong>
              <em>Reviews</em>
            </div>
            <div className="arp-stat">
              <strong>{stats.average || '—'}</strong>
              <em>Avg rating</em>
            </div>
            <div className="arp-stat">
              <strong>{stats.restaurants}</strong>
              <em>Restaurants</em>
            </div>
          </div>
        </div>
      </header>

      <main className="arp-body">
        {reviews.length === 0 ? (
          <div className="arp-empty">
            <div className="arp-empty-title">No reviews yet</div>
            <p>When guests rate a restaurant from its menu, those ratings will show up here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>
              Browse restaurants
            </button>
          </div>
        ) : (
          <div className="arp-list">
            {reviews.map(r => (
              <article key={`${r.restaurantId}-${r.id}`} className="arp-card">
                <div className="arp-card-top">
                  <button
                    type="button"
                    className="arp-rest"
                    onClick={() => navigate(`/menu/${r.restaurantId}`)}
                    style={{ '--accent': r.restaurantAccent }}
                  >
                    <span className="arp-rest-emoji">{r.restaurantEmoji}</span>
                    <span>{r.restaurantName}</span>
                  </button>
                  <span className="arp-when">{formatWhen(r.ts)}</span>
                </div>

                <div className="arp-stars" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <IconStar key={n} size={16} filled={n <= r.rating} />
                  ))}
                </div>

                <div className="arp-name">{r.name}</div>
                {r.comment ? (
                  <p className="arp-comment">{r.comment}</p>
                ) : (
                  <p className="arp-comment is-empty">No written comment</p>
                )}

                <div className="arp-card-actions">
                  <button type="button" onClick={() => navigate(`/menu/${r.restaurantId}/review`)}>
                    View restaurant ratings
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="cp-footer">
        <div className="cp-footer-inner">
          <div className="cp-footer-brand" onClick={() => navigate('/')}>Get<span>Menu</span>Card</div>
          <div className="cp-footer-links">
            <button onClick={() => navigate('/features')}>Features</button>
            <button onClick={() => navigate('/restaurants')}>Restaurants</button>
            <button onClick={() => navigate('/contact')}>Contact</button>
          </div>
          <span className="cp-footer-copy">© {new Date().getFullYear()} GetMenuCard · Made in India</span>
        </div>
      </footer>
    </div>
  );
}
