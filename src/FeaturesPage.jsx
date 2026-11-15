import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuImportFlow from './MenuImportFlow';
import SiteNav from './SiteNav';
import { useOwnerAuth } from './owner/OwnerAuthContext';
import useReveal from './useReveal';
import { restaurants as staticRestaurants } from './data';
import './HomePage.css';
import './FeaturesPage.css';

const Arrow = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Star = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
  </svg>
);

const ICONS = {
  bolt: <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  leaf: <path d="M5 21c0-9 5-15 16-16-1 11-7 16-16 16zM5 21l8-8" />,
  palette: <><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1.3" /><circle cx="12" cy="7.5" r="1.3" /><circle cx="16" cy="10" r="1.3" /><path d="M12 21a2.5 2.5 0 010-5h2a3 3 0 003-3" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" />,
  phone: <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1L6.6 10.8z" />,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" /></>,
  camera: <><path d="M4 8h3l2-2h6l2 2h3v11H4V8z" /><circle cx="12" cy="13" r="3.5" /></>,
};
const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

const TREND = [
  { d: 'M', v: 142 }, { d: 'T', v: 189 }, { d: 'W', v: 167 }, { d: 'T', v: 210 },
  { d: 'F', v: 248 }, { d: 'S', v: 312 }, { d: 'S', v: 276 },
];

const EXTRA = [
  { icon: 'qr', title: 'Forever QR codes', text: 'Print once. Update your menu forever — the same codes keep working.' },
  { icon: 'phone', title: 'Works on every phone', text: 'No app store, no login, no Wi‑Fi portal. Camera → menu.' },
  { icon: 'camera', title: 'Photo-first menus', text: 'Show dishes the way they look on the plate — guests order with confidence.' },
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useOwnerAuth();
  const [importOpen, setImportOpen] = useState(false);
  const maxTrend = Math.max(...TREND.map(t => t.v));
  const openCreateMenu = () => {
    if (isAuthenticated) navigate('/create-menu');
    else setImportOpen(true);
  };

  useReveal();

  return (
    <div className="fp">
      <SiteNav
        active="/features"
        scrolled
        ctaLabel="Create menu"
        onCta={openCreateMenu}
      />

      <header className="fp-hero">
        <div className="fp-hero-bg" aria-hidden="true">
          <div className="fp-blob fp-blob-1" />
          <div className="fp-blob fp-blob-2" />
          <div className="fp-dots" />
        </div>
        <div className="fp-hero-inner">
          <div className="eyebrow au">Everything on the house</div>
          <h1 className="fp-title au d1">
            Built for busy kitchens, <em>loved</em> by guests
          </h1>
          <p className="fp-sub au d2">
            Analytics, review QRs, instant price edits, diet filters and your brand colours — all in one menu guests open in seconds.
          </p>
          <div className="fp-ctas au d3">
            <button className="btn btn-primary" onClick={openCreateMenu}>
              Create your menu <Arrow />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/how-it-works')}>
              See how it works
            </button>
          </div>
        </div>
      </header>

      <section className="sec sec-alt">
        <div className="sec-inner">
          <div className="bento">
            <div className="tile tile-dark tile-tall" data-reveal>
              <div className="tile-icon"><Icon name="chart" /></div>
              <h3 className="tile-title">Know what your guests look at</h3>
              <p className="tile-text">See scans, visitors and the dishes people open most — per table, per day.</p>
              <div className="tile-chart">
                {TREND.map((t, i) => (
                  <div key={i} className="tile-chart-col">
                    <div className="tile-chart-bar" style={{ height: `${(t.v / maxTrend) * 100}%` }} />
                    <span>{t.d}</span>
                  </div>
                ))}
              </div>
              <div className="tile-kpis">
                <div><strong>1,544</strong><span>scans / week</span></div>
                <div><strong>+18%</strong><span>vs last week</span></div>
              </div>
            </div>

            <div className="tile tile-orange" data-reveal style={{ '--reveal-delay': '0.08s' }}>
              <div className="tile-icon"><Icon name="star" /></div>
              <h3 className="tile-title">A second QR just for reviews</h3>
              <p className="tile-text">Sends happy guests straight to your Google review page.</p>
              <div className="tile-stars">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={20} />)}<span>4.8 avg</span></div>
            </div>

            <div className="tile" data-reveal style={{ '--reveal-delay': '0.14s' }}>
              <div className="tile-icon"><Icon name="bolt" /></div>
              <h3 className="tile-title">Change prices in seconds</h3>
              <p className="tile-text">Edit once, live everywhere. Never reprint a menu again.</p>
              <div className="tile-price">
                <span className="tile-price-name">Cold Brew Coffee</span>
                <span className="tile-price-old">₹169</span>
                <span className="tile-price-new">₹149</span>
              </div>
            </div>

            <div className="tile" data-reveal style={{ '--reveal-delay': '0.2s' }}>
              <div className="tile-icon tile-icon-leaf"><Icon name="leaf" /></div>
              <h3 className="tile-title">Veg & non-veg, clearly marked</h3>
              <p className="tile-text">Guests filter by diet, price or popularity in one tap.</p>
              <div className="tile-pills">
                <span><i className="veg is-veg" /> Veg only</span>
                <span><i className="veg is-nonveg" /> Non-veg</span>
                <span>★ Popular</span>
              </div>
            </div>

            <div className="tile" data-reveal style={{ '--reveal-delay': '0.26s' }}>
              <div className="tile-icon"><Icon name="palette" /></div>
              <h3 className="tile-title">Looks like your brand</h3>
              <p className="tile-text">Your colours, your photos, your vibe.</p>
              <div className="tile-swatches">
                {Object.values(staticRestaurants).map(r => (
                  <span key={r.id} style={{ background: r.accent }} title={r.name} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fp-extra">
        <div className="fp-extra-inner">
          <div className="sec-head" data-reveal>
            <div className="eyebrow">More that matters</div>
            <h2 className="sec-title">Small details that feel <em>big</em> on the table</h2>
          </div>
          <div className="fp-extra-grid">
            {EXTRA.map((f, i) => (
              <article key={f.title} className="fp-extra-card" data-reveal style={{ '--reveal-delay': `${i * 0.08}s` }}>
                <div className="fp-extra-icon"><Icon name={f.icon} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fp-cta">
        <div className="fp-cta-inner" data-reveal>
          <div className="eyebrow eyebrow-light">Try before you commit</div>
          <h2>Open a live menu the way your guests will.</h2>
          <p>Or create yours now — QR codes ready to print in the same sitting.</p>
          <div className="fp-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/menu/brew-and-bites')}>
              See a live menu <Arrow />
            </button>
            <button className="btn btn-ghost-light" onClick={() => navigate('/contact')}>
              Talk to us
            </button>
          </div>
        </div>
      </section>

      <footer className="cp-footer">
        <div className="cp-footer-inner">
          <div className="cp-footer-brand" onClick={() => navigate('/')}>Get<span>Menu</span>Card</div>
          <div className="cp-footer-links">
            <button onClick={() => navigate('/how-it-works')}>How it works</button>
            <button onClick={() => navigate('/restaurants')}>Restaurants</button>
            <button onClick={() => navigate('/contact')}>Contact</button>
          </div>
          <span className="cp-footer-copy">© {new Date().getFullYear()} GetMenuCard · Made in India</span>
        </div>
      </footer>

      {importOpen && <MenuImportFlow onClose={() => setImportOpen(false)} />}
    </div>
  );
}
