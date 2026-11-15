import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuImportFlow from './MenuImportFlow';
import SiteNav from './SiteNav';
import { useOwnerAuth } from './owner/OwnerAuthContext';
import useReveal from './useReveal';
import './HomePage.css';
import './HowItWorksPage.css';

const Arrow = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const STEPS = [
  {
    n: '01',
    time: '2 min',
    title: 'Create your restaurant',
    desc: 'Add your name, logo and a cover photo so guests recognise you instantly.',
    detail: 'This is your digital storefront. A clear logo and cover photo make the menu feel like yours from the first glance.',
  },
  {
    n: '02',
    time: '10 min',
    title: 'Add your menu',
    desc: 'Categories, dishes, prices, descriptions and photos — or send us a photo of your paper menu.',
    detail: 'Upload dishes by hand, or let us import from a photo or PDF. Veg markers and popular tags are included.',
  },
  {
    n: '03',
    time: '3 min',
    title: 'Pick a look',
    desc: 'Choose a theme and accent colour that fits your brand.',
    detail: 'Warm café, modern bar, or classic fine dining — your colours show on every guest phone.',
  },
  {
    n: '04',
    time: '1 min',
    title: 'Generate your QR codes',
    desc: 'One for the menu, one that goes straight to Google Reviews.',
    detail: 'Print-ready files for table tents, counters, receipts or the door. Same codes forever — no reprint when prices change.',
  },
  {
    n: '05',
    time: '5 min',
    title: 'Place them on tables',
    desc: 'Print on table tents, counters, receipts or the door.',
    detail: 'Put the menu QR where guests sit and the review QR near the exit for happy diners.',
  },
  {
    n: '06',
    time: 'instant',
    title: 'Guests scan & browse',
    desc: 'Your full menu opens in the browser. No app, no login.',
    detail: 'Photos, prices, filters and your branding — ready in seconds on any phone camera.',
  },
  {
    n: '07',
    time: 'ongoing',
    title: 'Collect more reviews',
    desc: 'Happy guests land on your review page in one tap.',
    detail: 'More 5-star reviews without awkward asks — just a second QR that does the work.',
  },
];

const PROMISES = [
  { title: 'Under 30 minutes', text: 'Most restaurants go from paper to live QR the same afternoon.' },
  { title: 'We can do it for you', text: 'Send a menu photo — we’ll build and send your QR codes ready to print.' },
  { title: 'No app required', text: 'Guests use their phone camera. You update dishes anytime from anywhere.' },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useOwnerAuth();
  const [importOpen, setImportOpen] = useState(false);
  const openCreateMenu = () => {
    if (isAuthenticated) navigate('/create-menu');
    else setImportOpen(true);
  };

  useReveal();

  return (
    <div className="hiw">
      <SiteNav
        active="/how-it-works"
        scrolled
        ctaLabel="Create menu"
        onCta={openCreateMenu}
      />

      <header className="hiw-hero">
        <div className="hiw-hero-bg" aria-hidden="true">
          <div className="hiw-blob hiw-blob-1" />
          <div className="hiw-blob hiw-blob-2" />
          <div className="hiw-dots" />
        </div>
        <div className="hiw-hero-inner">
          <div className="eyebrow au">How it works</div>
          <h1 className="hiw-title au d1">
            From paper to QR in <em>seven</em> easy courses
          </h1>
          <p className="hiw-sub au d2">
            Everything takes less than 30 minutes. Prefer we cook? Send your menu and we’ll set it up for you.
          </p>
          <div className="hiw-ctas au d3">
            <button className="btn btn-primary" onClick={openCreateMenu}>
              Start cooking <Arrow />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/contact')}>
              Get us to set it up
            </button>
          </div>
        </div>
      </header>

      <section className="hiw-promises">
        <div className="hiw-promises-inner">
          {PROMISES.map((p, i) => (
            <div key={p.title} className="hiw-promise" data-reveal style={{ '--reveal-delay': `${i * 0.08}s` }}>
              <span className="hiw-promise-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-inner">
          <div className="sec-head" data-reveal>
            <div className="eyebrow">The Set Menu</div>
            <h2 className="sec-title">Prepared fresh, served in under <em>30</em> minutes</h2>
            <p className="sec-sub">Follow each course — or skip straight to contact and we’ll plate it for you.</p>
          </div>

          <div className="setmenu" data-reveal>
            <div className="setmenu-frame">
              <div className="setmenu-top">
                <span className="setmenu-rule" />
                <span className="setmenu-label">The Set Menu</span>
                <span className="setmenu-rule" />
              </div>
              <div className="setmenu-caption">Seven courses from signup to more Google reviews</div>

              <ol className="setmenu-list">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="setmenu-item hiw-step" data-reveal style={{ '--reveal-delay': `${i * 0.05}s` }}>
                    <span className="setmenu-num">{s.n}</span>
                    <div className="setmenu-body">
                      <div className="setmenu-row">
                        <span className="setmenu-title">{s.title}</span>
                        <span className="setmenu-leader" />
                        <span className="setmenu-time">{s.time}</span>
                      </div>
                      <p className="setmenu-desc">{s.desc}</p>
                      <p className="hiw-step-detail">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="setmenu-foot">
                <span>Chef’s note — no app, no login, no friction.</span>
                <button className="setmenu-btn" onClick={openCreateMenu}>
                  Start cooking <Arrow size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-cta">
        <div className="hiw-cta-inner" data-reveal>
          <div className="eyebrow eyebrow-light">Ready when you are</div>
          <h2>See it live, or go live yourself.</h2>
          <p>Scan a demo table, or create your restaurant and generate QR codes in one sitting.</p>
          <div className="hiw-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/menu/brew-and-bites')}>
              See a live menu <Arrow />
            </button>
            <button className="btn btn-ghost-light" onClick={() => navigate('/features')}>
              Explore features
            </button>
          </div>
        </div>
      </section>

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

      {importOpen && <MenuImportFlow onClose={() => setImportOpen(false)} />}
    </div>
  );
}
