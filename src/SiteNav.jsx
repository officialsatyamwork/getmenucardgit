import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toplogo from './assets/top_logo.png';
import sidelogo from './assets/side_logo.png';
import { useOwnerAuth } from './owner/OwnerAuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Contact', href: '/contact' },
];

export default function SiteNav({
  active = '',
  scrolled = false,
  ctaLabel = 'Create menu',
  onCta,
  showDemo = true,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useOwnerAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (href) => {
    setMenuOpen(false);
    navigate(href);
  };

  const handleCta = () => {
    setMenuOpen(false);
    if (onCta) onCta();
    else navigate('/signup');
  };

  return (
    <nav className={`hp-nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="hp-nav-inner">
        <div className="hp-logo" onClick={() => go('/')}>
          <img src={toplogo} alt="GetMenuCard" className="hp-logo-img" />
          <img src={sidelogo} alt="" className="hp-logo-img2" />
        </div>

        <div className="hp-nav-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={`hp-nav-link${active === link.href ? ' hp-nav-link-active' : ''}`}
              onClick={() => go(link.href)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hp-nav-actions">
          {showDemo && (
            <button className="hp-nav-ghost" onClick={() => go('/menu/brew-and-bites')}>
              Live demo
            </button>
          )}
          {isAuthenticated ? (
            <button className="hp-nav-cta" onClick={() => go('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <>
              <button className="hp-nav-ghost hp-nav-login" onClick={() => go('/login')}>
                Log in
              </button>
              <button className="hp-nav-cta" onClick={handleCta}>
                {ctaLabel}
                <span className="hp-nav-cta-icon" aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className={`hp-nav-burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`hp-nav-drawer${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <button key={link.label} className="hp-drawer-link" onClick={() => go(link.href)}>
            {link.label}
          </button>
        ))}
        <button className="hp-drawer-link" onClick={() => go('/menu/brew-and-bites')}>
          Live demo
        </button>
        {isAuthenticated ? (
          <button className="hp-drawer-cta" onClick={() => go('/dashboard')}>
            Open dashboard
          </button>
        ) : (
          <>
            <button className="hp-drawer-link" onClick={() => go('/login')}>
              Log in
            </button>
            <button className="hp-drawer-cta" onClick={handleCta}>
              {ctaLabel === 'Create menu' ? 'Sign up' : ctaLabel}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
