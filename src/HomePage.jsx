import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuImportFlow from './MenuImportFlow';
import RestaurantCard from './RestaurantCard';
import SiteNav from './SiteNav';
import { useOwnerAuth } from './owner/OwnerAuthContext';
import useReveal from './useReveal';
import { restaurants as staticRestaurants } from './data';
import { getAllRestaurants, loadPublicRestaurants, refreshRestaurantVisibility, trackEvent, R_IMAGES, FALLBACK_IMG } from './restaurantStore';
import './HomePage.css';

/* ── Icons ── */
const Arrow = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Star = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
);
const QrGlyph = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ICONS = {
  mail: <path d="M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zM3.5 6.5l8.5 6 8.5-6" />,
  phone: <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1L6.6 10.8z" />,
  pin: <><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  bolt: <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  leaf: <path d="M5 21c0-9 5-15 16-16-1 11-7 16-16 16zM5 21l8-8" />,
  palette: <><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1.3" /><circle cx="12" cy="7.5" r="1.3" /><circle cx="16" cy="10" r="1.3" /><path d="M12 21a2.5 2.5 0 010-5h2a3 3 0 003-3" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" />,
};
const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

/* ── Content ── */
const HIW_STEPS = [
  { n: '01', time: '2 min',  title: 'Create your restaurant',  desc: 'Add your name, logo and a cover photo.' },
  { n: '02', time: '10 min', title: 'Add your menu',           desc: 'Categories, dishes, prices, descriptions and photos.' },
  { n: '03', time: '3 min',  title: 'Pick a look',             desc: 'Choose a theme and accent colour that fits your brand.' },
  { n: '04', time: '1 min',  title: 'Generate your QR codes',  desc: 'One for the menu, one that goes straight to Google Reviews.' },
  { n: '05', time: '5 min',  title: 'Place them on tables',    desc: 'Print on table tents, counters, receipts or the door.' },
  { n: '06', time: 'instant', title: 'Guests scan & browse',   desc: 'Your full menu opens in the browser. No app, no login.' },
  { n: '07', time: 'ongoing', title: 'Collect more reviews',   desc: 'Happy guests land on your review page in one tap.' },
];

const MARQUEE = ['Chicken Dum Biryani', 'Cold Brew', 'Pav Bhaji', 'Tiramisu', 'Butter Chicken', 'Quinoa Bowl', 'Pani Puri', 'Lava Cake', 'Masala Chai', 'Wood-fired Pizza'];

const TREND = [
  { d: 'M', v: 142 }, { d: 'T', v: 189 }, { d: 'W', v: 167 }, { d: 'T', v: 210 },
  { d: 'F', v: 248 }, { d: 'S', v: 312 }, { d: 'S', v: 276 },
];

const demo = staticRestaurants['brew-and-bites'];
const DEMO_ITEMS = [12, 9, 7, 16]
  .map(id => demo.categories.flatMap(c => c.items).find(i => i.id === id))
  .filter(Boolean);
const BUBBLE_ITEMS = [9, 16]
  .map(id => demo.categories.flatMap(c => c.items).find(i => i.id === id))
  .filter(Boolean);

const HERO_WORDS = ['beautifully', 'instantly', 'deliciously'];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useOwnerAuth();
  const [scrolled, setScrolled] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [list, setList] = useState(() => getAllRestaurants());

  useReveal(list.length);

  const openCreateMenu = () => {
    if (isAuthenticated) navigate('/create-menu');
    else setImportOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    const refresh = () => setList(getAllRestaurants());
    (async () => {
      await refreshRestaurantVisibility().catch(() => {});
      await loadPublicRestaurants();
      if (cancelled) return;
      // Always merge API + local/demo so directory stays complete
      setList(getAllRestaurants());
    })();
    window.addEventListener('mc_restaurants_updated', refresh);
    window.addEventListener('mc_visibility_updated', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('mc_restaurants_updated', refresh);
      window.removeEventListener('mc_visibility_updated', refresh);
    };
  }, []);

  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = (id) => {
    trackEvent('qr_scan', id);
    navigate(`/menu/${id}`);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSending(true);
    setFormError('');
    const form = e.target;
    const fd = new FormData(form);
    fd.append('_subject', `New MenuCard Enquiry — ${fd.get('restaurant')}`);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');
    try {
      const res = await fetch('https://formsubmit.co/ajax/officialsatyamwork@gmail.com', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      });
      const data = await res.json();
      if (data.success === 'true' || data.success === true) {
        setFormSent(true);
        form.reset();
      } else {
        setFormError('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      setFormError('Could not send your message. Check your connection and try again.');
    } finally {
      setFormSending(false);
    }
  };

  const maxTrend = Math.max(...TREND.map(t => t.v));

  return (
    <div className="hp">

      <SiteNav
        active="/"
        scrolled={scrolled}
        ctaLabel="Create menu"
        onCta={openCreateMenu}
      />

      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-dots" />
        </div>

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker au">
              <span className="hero-kicker-tag">New</span>
              QR menus + more Google reviews
            </div>

            <h1 className="hero-title au d1" aria-label="Your menu, beautifully served on every table.">
              <span aria-hidden="true">
                Your menu,<br />
                <em key={wordIdx} className="hero-word">{HERO_WORDS[wordIdx]}</em> served<br />
                on every table.
              </span>
            </h1>

            <p className="hero-sub au d2">
              Guests scan a QR code and browse your full menu in seconds — with photos, prices and veg filters.
              No app, no download, no reprinting when prices change.
            </p>

            <div className="hero-ctas au d3">
              {isAuthenticated ? (
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  Go to dashboard <Arrow />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                  Sign up free <Arrow />
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => navigate('/pricing')}>
                View pricing
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => openMenu('brew-and-bites')}
              >
                <QrGlyph size={18} /> See a live menu
              </button>
            </div>

            <div className="hero-social au d4">
              <div className="hero-faces">
                {list.slice(0, 4).map(r => (
                  <img key={r.id} src={(r.coverImage || R_IMAGES[r.id] || FALLBACK_IMG).replace('w=600', 'w=120')} alt={r.name} title={r.name} />
                ))}
                {list.length > 4 && <span>+{list.length - 4}</span>}
              </div>
              <div className="hero-social-copy">
                <div className="hero-social-stars">
                  {[0, 1, 2, 3, 4].map(i => <Star key={i} size={13} />)}
                  <strong>4.9</strong>
                </div>
                <div className="hero-social-text">Loved by restaurants across Hyderabad</div>
              </div>
              <ul className="hero-proof">
                <li><span className="hero-proof-ic"><Check /></span>No app for guests</li>
                <li><span className="hero-proof-ic"><Check /></span>Live in 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Visual */}
          <div className="hero-visual au d2" aria-hidden="true">
            <div className="hero-plate">
              <span className="hero-wave" />
              <span className="hero-wave hero-wave-2" />
            </div>
            {BUBBLE_ITEMS.map((item, i) => (
              <img key={item.id} className={`hero-bubble hero-bubble-${i + 1}`} src={item.image.replace('w=400', 'w=200')} alt="" />
            ))}

            <div className="hero-ring">
              <svg viewBox="0 0 200 200" className="hero-ring-text">
                <defs><path id="ringPath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
                <text><textPath href="#ringPath" startOffset="0" textLength="486" lengthAdjust="spacing">SCAN • BROWSE • ENJOY • SCAN • BROWSE • ENJOY • </textPath></text>
              </svg>
              <div className="hero-ring-core"><QrGlyph size={34} color="#fff" /></div>
            </div>

            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-status"><span>9:41</span><span className="phone-status-r">●●● ▮</span></div>
                <div className="phone-url">getmenucard.app/menu/{demo.id}</div>
                <div className="phone-head">
                  <div>
                    <div className="phone-rname">{demo.name}</div>
                    <div className="phone-rtag">{demo.tagline}</div>
                  </div>
                  <div className="phone-rating"><Star size={11} /> 4.8</div>
                </div>
                <div className="phone-chips">
                  <span className="is-active">All</span>
                  {demo.categories.slice(0, 4).map(c => <span key={c.id}>{c.name}</span>)}
                </div>
                <div className="phone-items">
                  {DEMO_ITEMS.map((item, i) => (
                    <div key={item.id} className="phone-item" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                      <img src={item.image.replace('w=400', 'w=160')} alt="" />
                      <div className="phone-item-info">
                        <div className="phone-item-name">
                          <span className={`veg ${item.tag === 'Veg' ? 'is-veg' : 'is-nonveg'}`} />
                          {item.name}
                        </div>
                        <div className="phone-item-desc">{item.desc}</div>
                      </div>
                      <div className="phone-item-price">₹{item.price}</div>
                    </div>
                  ))}
                </div>
                <div className="phone-bar">View full menu <Arrow size={12} /></div>
              </div>
            </div>

            <div className="float float-tent">
              <div className="float-tent-label">Table 07</div>
              <div className="float-tent-qr"><QrGlyph size={46} color="#1d1b19" /></div>
              <div className="float-tent-cta">Scan for menu</div>
            </div>

            <div className="float float-review">
              <div className="float-review-stars">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} />)}</div>
              <div className="float-review-text">“Loved the biryani — and the menu was so easy!”</div>
              <div className="float-review-meta">New Google review · just now</div>
            </div>

            <div className="float float-stat">
              <div className="float-stat-label">Scans today</div>
              <div className="float-stat-row">
                <span className="float-stat-val">128</span>
                <span className="float-stat-up">↑ 12%</span>
              </div>
              <div className="float-stat-bars">
                {TREND.map((t, i) => <span key={i} style={{ height: `${(t.v / maxTrend) * 100}%` }} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt-style stats */}
        <div className="hero-stats au d4">
          {[
            { val: `${Math.max(list.length, 5)}+`, label: 'Restaurants live' },
            { val: '1,284', label: 'QR scans this month' },
            { val: '874', label: 'Unique guests' },
            { val: '312', label: 'Review page visits' },
          ].map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-val">{s.val}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Marquee ── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="marquee-item">{m}<span className="marquee-sep">✦</span></span>
          ))}
        </div>
      </div>

      {/* ── How it works — The Set Menu ── */}
      <section id="how-it-works" className="sec">
        <div className="sec-inner">
          <div className="sec-head" data-reveal>
            <div className="eyebrow">How it works</div>
            <h2 className="sec-title">From paper to QR in <em>seven</em> easy courses</h2>
            <p className="sec-sub">Everything takes less than 30 minutes. We can even set it all up for you.</p>
          </div>

          <div className="setmenu" data-reveal>
            <div className="setmenu-frame">
              <div className="setmenu-top">
                <span className="setmenu-rule" />
                <span className="setmenu-label">The Set Menu</span>
                <span className="setmenu-rule" />
              </div>
              <div className="setmenu-caption">Prepared fresh, served in under 30 minutes</div>

              <ol className="setmenu-list">
                {HIW_STEPS.map((s, i) => (
                  <li key={s.n} className="setmenu-item" data-reveal style={{ '--reveal-delay': `${i * 0.06}s` }}>
                    <span className="setmenu-num">{s.n}</span>
                    <div className="setmenu-body">
                      <div className="setmenu-row">
                        <span className="setmenu-title">{s.title}</span>
                        <span className="setmenu-leader" />
                        <span className="setmenu-time">{s.time}</span>
                      </div>
                      <p className="setmenu-desc">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="setmenu-foot">
                <span>Chef’s note — no app, no login, no friction.</span>
                <button className="setmenu-btn" onClick={openCreateMenu}>Start cooking <Arrow size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section id="features" className="sec sec-alt">
        <div className="sec-inner">
          <div className="sec-head" data-reveal>
            <div className="eyebrow">Everything on the house</div>
            <h2 className="sec-title">Built for busy kitchens, <em>loved</em> by guests</h2>
          </div>

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

      {/* ── Restaurants ── */}
      <section id="restaurants" className="sec">
        <div className="sec-inner">
          <div className="sec-head sec-head-row" data-reveal>
            <div>
              <div className="eyebrow">Live demos</div>
              <h2 className="sec-title">Pick a table. <em>Taste</em> the experience.</h2>
              <p className="sec-sub">Tap any restaurant to see exactly what your guests see after scanning.</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/restaurants')}>
              All restaurants <Arrow />
            </button>
          </div>

          <div className="r-grid">
            {list.slice(0, 6).map((r, i) => (
              <div key={r.id} data-reveal style={{ '--reveal-delay': `${(i % 3) * 0.08}s` }}>
                <RestaurantCard restaurant={r} onOpen={openMenu} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="contact">
        <div className="contact-inner">
          <div className="contact-copy" data-reveal>
            <div className="eyebrow eyebrow-light">Get in touch</div>
            <h2 className="contact-title">Let’s put your menu <em>online</em>.</h2>
            <p className="contact-sub">Tell us about your restaurant and we’ll have your QR menu live within 24 hours. No tech skills needed.</p>

            <div className="contact-list">
              <a href="mailto:officialsatyamwork@gmail.com" className="contact-row">
                <span className="contact-ic"><Icon name="mail" size={18} /></span>
                <span><small>Email</small>officialsatyamwork@gmail.com</span>
              </a>
              <a href="tel:+917708545455" className="contact-row">
                <span className="contact-ic"><Icon name="phone" size={18} /></span>
                <span><small>Phone · Mon–Sat, 9am–7pm</small>+91 77085 45455</span>
              </a>
              <div className="contact-row">
                <span className="contact-ic"><Icon name="pin" size={18} /></span>
                <span><small>Based in</small>Hyderabad, India</span>
              </div>
            </div>

            <ol className="contact-steps">
              <li><span>1</span>We review your details</li>
              <li><span>2</span>We build your menu</li>
              <li><span>3</span>You go live</li>
            </ol>
          </div>

          <form className="contact-form" onSubmit={handleFormSubmit} data-reveal style={{ '--reveal-delay': '0.1s' }}>
            <div className="contact-form-title">Request a free setup</div>
            <div className="field-row">
              <label className="field">
                <span>Your name</span>
                <input type="text" name="name" placeholder="Rahul Sharma" required />
              </label>
              <label className="field">
                <span>Phone</span>
                <input type="tel" name="phone" placeholder="+91 98765 43210" />
              </label>
            </div>
            <label className="field">
              <span>Restaurant name</span>
              <input type="text" name="restaurant" placeholder="e.g. Spice Garden" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@restaurant.com" required />
            </label>
            <label className="field">
              <span>Message <em>(optional)</em></span>
              <textarea name="message" rows={4} placeholder="Cuisine, number of dishes, anything we should know…" />
            </label>
            {formError && <div className="form-error" role="alert">{formError}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={formSending}>
              {formSending ? 'Sending…' : <>Send request <Arrow /></>}
            </button>
            <p className="form-note">We reply within 2 hours. No spam, ever.</p>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <button type="button" className="footer-logo" onClick={() => navigate('/')}>
                Get<span>Menu</span>Card
              </button>
              <p>The simplest way to take your restaurant menu digital. QR-based, instant and beautiful.</p>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <button onClick={() => navigate('/how-it-works')}>How it works</button>
              <button onClick={() => navigate('/features')}>Features</button>
              <button onClick={() => navigate('/pricing')}>Pricing</button>
              <button onClick={() => navigate('/reviews')}>Reviews</button>
              <button onClick={() => navigate('/menu/brew-and-bites')}>Live demo</button>
              <button onClick={openCreateMenu}>Create a menu</button>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <button onClick={() => navigate('/restaurants')}>Restaurants</button>
              <button onClick={() => navigate('/contact')}>Contact</button>
              {isAuthenticated ? (
                <button onClick={() => navigate('/dashboard')}>Dashboard</button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}>Log in</button>
                  <button onClick={() => navigate('/signup')}>Sign up</button>
                </>
              )}
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Say hello</div>
              <a href="mailto:officialsatyamwork@gmail.com">officialsatyamwork@gmail.com</a>
              <a href="tel:+917708545455">+91 77085 45455</a>
              <span>Hyderabad, India</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} GetMenuCard. All rights reserved.</span>
            <span>Made with care in India</span>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">GetMenuCard</div>
      </footer>

      {importOpen && <MenuImportFlow onClose={() => setImportOpen(false)} />}

      {formSent && (
        <div className="modal-overlay" onClick={() => setFormSent(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-check"><Check /></div>
            <h3>Request received!</h3>
            <p>Thanks for reaching out. We’ll get back to you within <strong>24 hours</strong>.</p>
            <ol className="modal-steps">
              <li><span>1</span>We review your restaurant details</li>
              <li><span>2</span>Our team prepares your QR menu</li>
              <li><span>3</span>You go live within 24 hours</li>
            </ol>
            <button className="btn btn-primary btn-block" onClick={() => setFormSent(false)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
