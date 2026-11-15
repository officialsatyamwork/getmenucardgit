import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { menuUrl, reviewUrl } from '../restaurantStore';
import './OwnerQrToolkit.css';

async function makeQrDataUrl(text) {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: { dark: '#1d1b19', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function QrCard({ title, subtitle, url, filename }) {
  const [src, setSrc] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    setSrc('');
    makeQrDataUrl(url)
      .then((data) => {
        if (!cancelled) setSrc(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not generate QR code.');
      });
    return () => { cancelled = true; };
  }, [url]);

  const onCopy = async () => {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <article className="oqr-card">
      <div className="oqr-card-copy">
        <h4>{title}</h4>
        <p>{subtitle}</p>
        <code className="oqr-url">{url}</code>
        <div className="oqr-actions">
          <button type="button" className="od-btn" onClick={onCopy}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            type="button"
            className="od-btn od-btn-primary"
            disabled={!src}
            onClick={() => downloadDataUrl(src, filename)}
          >
            Download PNG
          </button>
          <button type="button" className="od-btn" onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
            Open
          </button>
        </div>
      </div>
      <div className="oqr-preview">
        {src ? (
          <img src={src} alt={`${title} QR code`} />
        ) : (
          <div className="oqr-skeleton">{error || 'Generating…'}</div>
        )}
      </div>
    </article>
  );
}

export default function OwnerQrToolkit({ restaurant }) {
  if (!restaurant?.id) return null;

  const menu = menuUrl(restaurant.id);
  const review = reviewUrl(restaurant.id);
  const slug = restaurant.id;

  return (
    <section className="oqr">
      <div className="od-card-head">
        <h3>QR toolkit</h3>
        <span>Print-ready codes + share links</span>
      </div>
      <p className="oqr-lead">
        Put the menu QR on tables. Use the review QR for feedback — guests land on your in-app review page
        {restaurant.googleReviewUrl ? ', with a path to Google Reviews when you set that link in Settings.' : '. Add your Google Review link in Settings to collect Google ratings too.'}
      </p>
      <div className="oqr-grid">
        <QrCard
          title="Menu QR"
          subtitle="Opens your live digital menu"
          url={menu}
          filename={`${slug}-menu-qr.png`}
        />
        <QrCard
          title="Review QR"
          subtitle="Opens your guest review page"
          url={review}
          filename={`${slug}-review-qr.png`}
        />
      </div>
    </section>
  );
}
