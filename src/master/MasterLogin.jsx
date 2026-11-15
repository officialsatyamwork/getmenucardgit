import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toplogo from '../assets/top_logo.png';
import { useMasterAuth } from './MasterAuthContext';
import './MasterAuth.css';

export default function MasterLogin() {
  const { login, isAuthenticated, loading, configured, statusLoaded } = useMasterAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading || !statusLoaded) {
    return <div className="ma-loading">Loading</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/gmc-console" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/gmc-console', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ma-shell">
      <aside className="ma-hero">
        <button type="button" className="ma-hero-brand" onClick={() => navigate('/')}>
          <img src={toplogo} alt="GetMenuCard" />
          <div>
            <strong>GetMenuCard</strong>
            <span>Master Console</span>
          </div>
        </button>
        <div className="ma-hero-copy">
          <h2>One place to run the whole platform.</h2>
          <p>
            Monitor every restaurant launch, menu open, review, and subscription — cleanly and securely.
          </p>
        </div>
        <div className="ma-hero-meta">
          <div>
            <strong>Secure</strong>
            <span>Root access only</span>
          </div>
          <div>
            <strong>Live</strong>
            <span>Platform analytics</span>
          </div>
          <div>
            <strong>Simple</strong>
            <span>Owner control</span>
          </div>
        </div>
      </aside>

      <div className="ma-panel">
        <div className="ma-card">
          <button type="button" className="ma-card-mobile-brand" onClick={() => navigate('/')}>
            <img src={toplogo} alt="GetMenuCard" />
            <div>
              <strong>GetMenuCard</strong>
              <span>Master Console</span>
            </div>
          </button>
          <div className="ma-home-row">
            <button type="button" className="ma-home-btn" onClick={() => navigate('/')}>
              ← Home
            </button>
          </div>
          <span className="ma-eyebrow">Master access</span>
          <h1>Sign in</h1>
          <p className="ma-lead">
            Use the single master email and password configured on the server.
          </p>
          {!configured && (
            <div className="ma-error" role="alert" style={{ marginBottom: 16 }}>
              Master admin is not configured. Set MASTER_EMAIL and MASTER_PASSWORD in backend/.env
            </div>
          )}
          <form className="ma-form" onSubmit={onSubmit}>
            {error && <div className="ma-error" role="alert">{error}</div>}
            <div className="ma-field">
              <label htmlFor="ma-email">Email</label>
              <input
                id="ma-email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="ma-field">
              <label htmlFor="ma-password">Password</label>
              <input
                id="ma-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="ma-btn" type="submit" disabled={submitting || !configured}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
