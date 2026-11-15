import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toplogo from '../assets/top_logo.png';
import { useOwnerAuth } from './OwnerAuthContext';
import './OwnerAuth.css';

export default function OwnerSignup() {
  const { signup, isAuthenticated, loading } = useOwnerAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  if (loading) return <div className="oa-loading">Loading</div>;
  if (isAuthenticated && !justSignedUp) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup({ name, email, password, restaurantName });
      setJustSignedUp(true);
      navigate('/create-menu', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="oa-shell">
      <aside className="oa-hero">
        <button type="button" className="oa-hero-brand" onClick={() => navigate('/')}>
          <img src={toplogo} alt="GetMenuCard" />
          <div>
            <strong>GetMenuCard</strong>
            <span>Get started</span>
          </div>
        </button>
        <div className="oa-hero-copy">
          <h2>Create your restaurant account.</h2>
          <p>
            Sign up in a minute. Your Free plan includes a live QR menu, basic analytics, and guest reviews.
          </p>
        </div>
        <div className="oa-hero-meta">
          <div>
            <strong>Free start</strong>
            <span>No card needed</span>
          </div>
          <div>
            <strong>Your brand</strong>
            <span>Name & menu</span>
          </div>
          <div>
            <strong>QR ready</strong>
            <span>Share instantly</span>
          </div>
        </div>
      </aside>

      <div className="oa-panel">
        <div className="oa-card">
          <div className="oa-card-top">
            <button type="button" className="oa-home-btn" onClick={() => navigate('/')}>
              ← Home
            </button>
          </div>
          <span className="oa-eyebrow">Restaurant owner</span>
          <h1>Sign up</h1>
          <p className="oa-lead">Create your owner account and restaurant workspace.</p>
          <form className="oa-form" onSubmit={onSubmit}>
            {error && <div className="oa-error" role="alert">{error}</div>}
            <div className="oa-field">
              <label htmlFor="os-name">Your name</label>
              <input
                id="os-name"
                type="text"
                autoComplete="name"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="oa-field">
              <label htmlFor="os-restaurant">Restaurant name</label>
              <input
                id="os-restaurant"
                type="text"
                placeholder="Spice Garden"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
            <div className="oa-field">
              <label htmlFor="os-email">Email</label>
              <input
                id="os-email"
                type="email"
                autoComplete="email"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="oa-field">
              <label htmlFor="os-password">Password</label>
              <input
                id="os-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button className="oa-btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="oa-switch">
            Already have an account?
            <button type="button" onClick={() => navigate('/login')}>Log in</button>
          </p>
          <p className="oa-switch">
            <Link to="/pricing">Compare plans</Link>
            {' · '}
            <Link to="/">Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
