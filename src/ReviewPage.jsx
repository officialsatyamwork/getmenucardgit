import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toplogo from './assets/top_logo.png';
import {
  loadPublicRestaurant,
  getRestaurantStatusInfo,
  refreshRestaurantVisibility,
  addReview,
  getReviewStats,
  trackEvent,
  R_IMAGES,
  FALLBACK_IMG,
} from './restaurantStore';
import './MenuPage.css';
import './ReviewPage.css';

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconStar = ({ size = 28, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
    />
  </svg>
);

const LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent'];

export default function ReviewPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [accessTick, setAccessTick] = useState(0);
  const [restaurant, setRestaurant] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const access = useMemo(() => {
    if (restaurant) {
      return {
        status: restaurant.status || getRestaurantStatusInfo(restaurantId).status || 'active',
        reason: restaurant.statusReason || getRestaurantStatusInfo(restaurantId).reason || '',
      };
    }
    return getRestaurantStatusInfo(restaurantId);
  }, [restaurant, restaurantId, accessTick]);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setRestaurant(null);
    (async () => {
      await refreshRestaurantVisibility().catch(() => {});
      const result = await loadPublicRestaurant(restaurantId);
      if (cancelled) return;
      if (result.restaurant) {
        setRestaurant(result.restaurant);
        setReviews(result.reviews || []);
        setLoadState('ready');
        setAccessTick((t) => t + 1);
      } else {
        setLoadState(result.error === 'network' ? 'network' : 'not_found');
      }
    })();
    return () => { cancelled = true; };
  }, [restaurantId]);

  useEffect(() => {
    if (loadState === 'ready' && restaurant) {
      trackEvent('review_page_open', restaurantId);
    }
  }, [loadState, restaurant, restaurantId]);

  const stats = useMemo(() => getReviewStats(restaurantId, reviews), [restaurantId, reviews]);

  if (loadState === 'loading') {
    return (
      <div className="rpv">
        <div className="rpv-empty">
          <h1>Loading…</h1>
          <p>Opening the review page.</p>
        </div>
      </div>
    );
  }

  if (!restaurant || loadState === 'not_found' || loadState === 'network') {
    return (
      <div className="rpv">
        <div className="rpv-empty">
          <h1>{loadState === 'network' ? 'Can’t reach reviews' : 'Restaurant not found'}</h1>
          <button
            className="mp-btn-accent"
            onClick={() => (loadState === 'network' ? window.location.reload() : navigate('/'))}
          >
            {loadState === 'network' ? 'Retry' : 'Go home'}
          </button>
        </div>
      </div>
    );
  }

  if (access.status === 'held' || access.status === 'removed') {
    return (
      <div className="rpv">
        <div className="rpv-empty">
          <h1>{access.status === 'held' ? 'Menu on hold' : 'Menu unavailable'}</h1>
          <p style={{ marginBottom: 16, color: 'var(--text-2)' }}>
            {access.reason || (access.status === 'held'
              ? 'This restaurant is temporarily unavailable pending payment.'
              : 'This restaurant has been removed from GetMenuCard.')}
          </p>
          <button className="mp-btn-accent" onClick={() => navigate('/')}>Go home</button>
        </div>
      </div>
    );
  }

  const accent = restaurant.accent || '#f4831f';
  const cover = restaurant.coverImage || R_IMAGES[restaurant.id] || FALLBACK_IMG;
  const active = hover || rating;
  const googleUrl = (restaurant.googleReviewUrl || '').trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await addReview(restaurantId, { rating, name, comment });
      if (!result?.ok) {
        setSubmitError('Could not save your review. Please try again.');
        return;
      }
      if (!result.synced) {
        setSubmitError('Saved on this device, but the server did not accept it yet. You can still continue.');
      }
      setSent(true);
      setReviews((prev) => [result.review, ...prev.filter((r) => r.id !== result.review.id)]);
      setComment('');
      setName('');
      setRating(0);
    } catch {
      setSubmitError('Could not save your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rpv" style={{ '--accent': accent }}>
      <header className="mp-header">
        <div className="mp-header-inner">
          <button className="mp-icon-btn" onClick={() => navigate(`/menu/${restaurantId}`)} aria-label="Back to menu">
            <IconBack />
          </button>
          <img src={toplogo} alt="GetMenuCard" className="mp-header-logo" onClick={() => navigate('/')} />
          <div className="mp-header-name">Rate {restaurant.name}</div>
        </div>
      </header>

      <main className="rpv-main">
        <section className="rpv-hero">
          <img src={cover} alt="" className="rpv-hero-img" />
          <div className="rpv-hero-shade" />
          <div className="rpv-hero-copy">
            <div className="rpv-kicker">{restaurant.emoji} {restaurant.tagline}</div>
            <h1>{restaurant.name}</h1>
            {stats.count > 0 ? (
              <p className="rpv-stats">
                <strong>{stats.average}</strong>
                <span className="rpv-stats-stars">{[0, 1, 2, 3, 4].map(i => (
                  <IconStar key={i} size={14} filled={i < Math.round(stats.average)} />
                ))}</span>
                · {stats.count} review{stats.count === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="rpv-stats">Be the first to rate this place</p>
            )}
          </div>
        </section>

        {sent ? (
          <section className="rpv-card rpv-thanks">
            <div className="rpv-thanks-icon">★</div>
            <h2>Thanks for rating!</h2>
            <p>Your feedback helps {restaurant.name} serve guests better.</p>
            <div className="rpv-thanks-actions">
              <button className="mp-btn-accent" onClick={() => navigate(`/menu/${restaurantId}`)}>
                Back to menu
              </button>
              <button className="rpv-btn-ghost" onClick={() => setSent(false)}>
                Rate again
              </button>
            </div>
            {googleUrl && (
              <button
                className="rpv-google"
                onClick={() => {
                  trackEvent('review_qr_scan', restaurantId);
                  window.open(googleUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                Also leave a Google review →
              </button>
            )}
          </section>
        ) : (
          <form className="rpv-card" onSubmit={handleSubmit}>
            <div className="rpv-card-title">How was your visit?</div>
            <div className="rpv-card-sub">Tap a star to rate — it takes a few seconds.</div>

            <div className="rpv-stars" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`rpv-star${(hover || rating) >= n ? ' is-on' : ''}`}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-checked={rating === n}
                  role="radio"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => setRating(n)}
                >
                  <IconStar filled={(hover || rating) >= n} />
                </button>
              ))}
            </div>
            <div className={`rpv-label${active ? ' is-on' : ''}`}>
              {active ? LABELS[active] : 'Select a rating'}
            </div>

            <label className="rpv-field">
              <span>Your name <em>(optional)</em></span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahul"
                maxLength={40}
                autoComplete="name"
              />
            </label>

            <label className="rpv-field">
              <span>Comment <em>(optional)</em></span>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you love? What could be better?"
                rows={4}
                maxLength={500}
              />
            </label>

            {submitError && <div className="rpv-submit-error" role="alert">{submitError}</div>}

            <button className="mp-btn-accent" type="submit" disabled={!rating || submitting}>
              {submitting ? 'Sending…' : 'Submit review'}
            </button>

            {googleUrl && (
              <button
                type="button"
                className="rpv-google"
                onClick={() => {
                  trackEvent('review_qr_scan', restaurantId);
                  window.open(googleUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                Prefer Google Reviews? Open →
              </button>
            )}
          </form>
        )}

        {reviews.length > 0 && (
          <section className="rpv-list">
            <div className="rpv-list-head">Recent reviews</div>
            {reviews.slice(0, 12).map((r) => (
              <article key={r.id} className="rpv-item">
                <div className="rpv-item-top">
                  <strong>{r.name || 'Guest'}</strong>
                  <span className="rpv-item-stars">{r.rating}★</span>
                </div>
                {r.comment ? <p>{r.comment}</p> : null}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
