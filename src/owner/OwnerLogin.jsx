import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toplogo from '../assets/top_logo.png';
import { useOwnerAuth } from './OwnerAuthContext';
import './OwnerAuth.css';

export default function OwnerLogin() {
  const { login, isAuthenticated, loading } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';

  if (loading) return <div className="oa-loading">Loading</div>;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
            <span>Restaurant admin</span>
          </div>
        </button>
        <div className="oa-hero-copy">
          <h2>Run your menu from one calm dashboard.</h2>
          <p>
            Update dishes, track scans, manage reviews, and keep your QR menu live — without the noise.
          </p>
        </div>
        <div className="oa-hero-meta">
          <div>
            <strong>Live menu</strong>
            <span>Instant updates</span>
          </div>
          <div>
            <strong>Insights</strong>
            <span>Scans & opens</span>
          </div>
          <div>
            <strong>Plans</strong>
            <span>Grow when ready</span>
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
          <h1>Log in</h1>
          <p className="oa-lead">Access your restaurant dashboard and manage your digital menu.</p>
          <form className="oa-form" onSubmit={onSubmit}>
            {error && <div className="oa-error" role="alert">{error}</div>}
            <div className="oa-field">
              <label htmlFor="oa-email">Email</label>
              <input
                id="oa-email"
                type="email"
                autoComplete="username"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="oa-field">
              <label htmlFor="oa-password">Password</label>
              <input
                id="oa-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="oa-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>
          <p className="oa-switch">
            New here?
            <button type="button" onClick={() => navigate('/signup')}>Create account</button>
          </p>
          <p className="oa-switch">
            <Link to="/pricing">View pricing</Link>
            {' · '}
            <Link to="/">Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
