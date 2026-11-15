import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNav from './SiteNav';
import useReveal from './useReveal';
import './HomePage.css';
import './ContactPage.css';

const EMAIL = 'officialsatyamwork@gmail.com';
const PHONE_DISPLAY = '+91 77085 45455';
const PHONE_RAW = '917708545455';

const ICONS = {
  mail: <><path d="M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11z" /><path d="M3.5 6.5l8.5 6 8.5-6" /></>,
  phone: <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1L6.6 10.8z" />,
  chat: <path d="M20 11.5a8 8 0 01-11.9 7L4 20l1.5-4A8 8 0 1120 11.5z" />,
  pin: <><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  bolt: <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" />,
  arrow: <path d="M7 17L17 7M9 7h8v8" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
};
const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

const METHODS = [
  { key: 'mail',  icon: 'mail',  label: 'Email us',  value: EMAIL,         sub: 'Replies within 2 hours',  href: `mailto:${EMAIL}` },
  { key: 'call',  icon: 'phone', label: 'Call us',   value: PHONE_DISPLAY, sub: 'Mon–Sat, 9am – 7pm IST',  href: `tel:+${PHONE_RAW}` },
  { key: 'wa',    icon: 'chat',  label: 'WhatsApp',  value: 'Chat with us', sub: 'Fastest way to reach us', href: `https://wa.me/${PHONE_RAW}?text=${encodeURIComponent('Hi! I want a QR menu for my restaurant.')}`, external: true },
];

const SERVICES = ['QR menu', 'Google review QR', 'Menu design', 'Food photos', 'Analytics', 'Printed table tents'];

const STEPS = [
  { when: 'Today',       title: 'Tell us about your restaurant', desc: 'Share your menu — a photo of the paper menu is enough.' },
  { when: 'Within 24h',  title: 'We build your digital menu',    desc: 'Categories, prices, photos and your brand colours, set up for you.' },
  { when: 'Day 2',       title: 'Print, place & go live',        desc: 'Get your menu QR and review QR, ready for every table.' },
];

const FAQS = [
  { q: 'Do my customers need to download an app?', a: 'No. Guests scan the QR code with their phone camera and the menu opens instantly in the browser — no app, no login.' },
  { q: 'How do I update prices or dishes later?', a: 'Changes go live the moment you save them. No reprinting, no waiting — the same QR code keeps working forever.' },
  { q: 'What do I need to send you to get started?', a: 'Just a photo or PDF of your current menu and your logo, if you have one. We handle the rest.' },
  { q: 'How does the Google review QR work?', a: 'It’s a second QR code that takes happy guests straight to your Google review page, so collecting reviews takes one tap.' },
  { q: 'How much does it cost?', a: 'Start free. Paid plans begin at ₹499/month for branding and extras — see Pricing for the full breakdown, or contact us for a custom setup.' },
];

/* Open Mon–Sat, 9am–7pm IST */
function isOpenNow() {
  const ist = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  const day = ist.getDay();
  const h = ist.getHours();
  return day !== 0 && h >= 9 && h < 19;
}

export default function ContactPage() {
  const navigate = useNavigate();
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [services, setServices] = useState(['QR menu']);
  const [open] = useState(isOpenNow);

  useReveal(formSent);

  const toggleService = s =>
    setServices(list => (list.includes(s) ? list.filter(x => x !== s) : [...list, s]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSending(true);
    setFormError('');
    const form = e.target;
    const fd = new FormData(form);
    fd.append('interested_in', services.join(', ') || '—');
    fd.append('_subject', `New MenuCard Enquiry — ${fd.get('restaurant')}`);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      });
      const data = await res.json();
      if (data.success === 'true' || data.success === true) {
        setFormSent(true);
        form.reset();
      } else {
        setFormError('Something went wrong. Please try again or reach us on WhatsApp.');
      }
    } catch {
      setFormError('Could not send your message. Check your connection and try again.');
    } finally {
      setFormSending(false);
    }
  };

  return (
    <div className="cp">

      {/* ── Navbar ── */}
      <SiteNav active="/contact" scrolled ctaLabel="Sign up free" />

      {/* ── Hero ── */}
      <header className="cp-hero">
        <div className="cp-hero-bg" aria-hidden="true">
          <div className="cp-blob cp-blob-1" />
          <div className="cp-blob cp-blob-2" />
          <div className="cp-dots" />
        </div>

        <div className="cp-hero-inner">
          {/* Left */}
          <div className="cp-copy">
            <div className={`cp-status au${open ? ' is-open' : ''}`}>
              <span className="cp-status-dot" />
              {open ? 'We’re online now — expect a quick reply' : 'We’re offline — we’ll reply first thing tomorrow'}
            </div>
            <h1 className="cp-title au d1">
              Let’s build your<br />
              <em>digital</em> menu.
            </h1>
            <p className="cp-sub au d2">
              Tell us about your restaurant and we’ll have your QR menu live within 24 hours.
              No tech skills needed — we do the heavy lifting.
            </p>

            <div className="cp-methods au d3">
              {METHODS.map(m => (
                <a
                  key={m.key}
                  className={`cp-method cp-method-${m.key}`}
                  href={m.href}
                  {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="cp-method-ic"><Icon name={m.icon} /></span>
                  <span className="cp-method-body">
                    <span className="cp-method-label">{m.label}</span>
                    <span className="cp-method-value">{m.value}</span>
                    <span className="cp-method-sub">{m.sub}</span>
                  </span>
                  <span className="cp-method-arrow"><Icon name="arrow" size={16} /></span>
                </a>
              ))}

              <div className="cp-location">
                <div className="cp-location-map" aria-hidden="true">
                  <span className="cp-pin"><Icon name="pin" size={18} /></span>
                  <span className="cp-pin-pulse" />
                </div>
                <div>
                  <div className="cp-method-label">Based in</div>
                  <div className="cp-location-city">Hyderabad, India</div>
                  <div className="cp-method-sub">Serving restaurants across India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="cp-form-wrap au d2">
            <div className="cp-badge" aria-hidden="true">
              <svg viewBox="0 0 200 200" className="cp-badge-text">
                <defs><path id="cpRing" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
                <text><textPath href="#cpRing" textLength="486" lengthAdjust="spacing">REPLY IN UNDER 2 HOURS • REPLY IN UNDER 2 HOURS • </textPath></text>
              </svg>
              <span className="cp-badge-core"><Icon name="bolt" size={26} /></span>
            </div>

            {formSent ? (
              <div className="cp-card cp-success">
                <div className="cp-success-check"><Icon name="check" size={30} /></div>
                <h2>Request received!</h2>
                <p>Thanks for reaching out. We’ll get back to you within <strong>2 hours</strong> during working hours.</p>
                <ol className="cp-success-steps">
                  {STEPS.map((s, i) => (
                    <li key={s.title}><span>{i + 1}</span>{s.title}</li>
                  ))}
                </ol>
                <div className="cp-success-actions">
                  <button className="btn btn-primary" onClick={() => navigate('/menu/brew-and-bites')}>See a live menu</button>
                  <button className="btn btn-ghost" onClick={() => setFormSent(false)}>Send another</button>
                </div>
              </div>
            ) : (
              <form className="cp-card cp-form" onSubmit={handleSubmit}>
                <div className="cp-form-head">
                  <div>
                    <div className="cp-form-title">Request a setup</div>
                    <div className="cp-form-sub">Takes less than a minute.</div>
                  </div>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Your name</span>
                    <input type="text" name="name" placeholder="Rahul Sharma" required autoComplete="name" />
                  </label>
                  <label className="field">
                    <span>Phone</span>
                    <input type="tel" name="phone" placeholder="+91 98765 43210" autoComplete="tel" />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span>Restaurant name</span>
                    <input type="text" name="restaurant" placeholder="e.g. Spice Garden" required />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input type="email" name="email" placeholder="you@restaurant.com" required autoComplete="email" />
                  </label>
                </div>

                <div className="field">
                  <span>What are you interested in?</span>
                  <div className="cp-chips" role="group" aria-label="Services">
                    {SERVICES.map(s => {
                      const on = services.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          className={`cp-chip${on ? ' is-on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleService(s)}
                        >
                          {on && <Icon name="check" size={13} />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="field">
                  <span>Message <em>(optional)</em></span>
                  <textarea name="message" rows={3} placeholder="Cuisine, number of dishes, number of tables…" />
                </label>

                {formError && <div className="form-error" role="alert">{formError}</div>}

                <button type="submit" className="btn btn-primary btn-block cp-submit" disabled={formSending}>
                  {formSending ? <><span className="cp-spinner" /> Sending…</> : <>Send request <Icon name="arrow" size={16} /></>}
                </button>
                <p className="form-note">🔒 Your details stay with us. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* ── What happens next ── */}
      <section className="cp-next">
        <div className="cp-next-inner" data-reveal>
          <div className="cp-next-head">
            <div className="eyebrow eyebrow-light">What happens next</div>
            <h2 className="cp-next-title">From hello to <em>live</em> in two days.</h2>
          </div>
          <ol className="cp-timeline">
            {STEPS.map((s, i) => (
              <li key={s.title} className="cp-tl-item" data-reveal style={{ '--reveal-delay': `${i * 0.1}s` }}>
                <div className="cp-tl-top">
                  <span className="cp-tl-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cp-tl-when">{s.when}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="cp-faq">
        <div className="cp-faq-inner">
          <div className="cp-faq-intro" data-reveal>
            <div className="eyebrow">FAQ</div>
            <h2 className="sec-title">Questions, <em>answered</em></h2>
            <p>Can’t find what you’re looking for? Message us on WhatsApp — a real person replies.</p>
            <a className="btn btn-outline" href={METHODS[2].href} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" size={18} /> Chat on WhatsApp
            </a>
          </div>
          <div className="cp-faq-list" data-reveal style={{ '--reveal-delay': '0.1s' }}>
            {FAQS.map((f, i) => (
              <details key={f.q} className="cp-faq-item" open={i === 0}>
                <summary>
                  <span>{f.q}</span>
                  <span className="cp-faq-icon" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="cp-footer">
        <div className="cp-footer-inner">
          <div className="cp-footer-brand" onClick={() => navigate('/')}>Get<span>Menu</span>Card</div>
          <div className="cp-footer-links">
            <button onClick={() => navigate('/how-it-works')}>How it works</button>
            <button onClick={() => navigate('/features')}>Features</button>
            <button onClick={() => navigate('/restaurants')}>Restaurants</button>
            <button onClick={() => navigate('/menu/brew-and-bites')}>Live demo</button>
          </div>
          <span className="cp-footer-copy">© {new Date().getFullYear()} GetMenuCard · Made in India</span>
        </div>
      </footer>
    </div>
  );
}
