import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { persistImageUrl, publishRestaurant } from './restaurantStore';
import { getOwnerToken, ownerApi } from './owner/ownerApi';
import './MenuImportFlow.css';

/* ── Icons ── */
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconImageUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M21 14v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 16l4.6-4.6a2 2 0 0 1 2.8 0L16 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 15l1.6-1.6a2 2 0 0 1 2.8 0L21 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 2v6M15 5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 8a2 2 0 0 1 2-2h1.5l1.4-2h6.2l1.4 2H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);
const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 9.5V20h16V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M3 9.5L5 4h14l2 5.5a2.75 2.75 0 0 1-5.5 0 2.75 2.75 0 0 1-5.5 0 2.75 2.75 0 0 1-5.5 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);
const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconCutlery = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M7 3v4M11 3v4M9 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21V3c-1.9 1.1-3 3.4-3 6v4h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconQr = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="currentColor"/>
  </svg>
);
const IconUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 10l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPhoto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 8a2 2 0 0 1 2-2h1.4l1.3-1.8h6.6L16.6 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
);
const IconLayers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M3 12l9 5 9-5M3 16l9 5 9-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDish = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
);
const IconTip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const TAGLINE_MAX = 60;
const PREVIEW_CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Drinks'];
const STEPS = ['Details', 'Add Items', 'Done'];

function newItem() {
  return { id: `i-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: '', desc: '', price: '', tag: '', variants: [] };
}
function newCat() {
  return { id: `cat-${Date.now()}`, name: '', items: [newItem()] };
}

function isBlankDish(item) {
  return !String(item?.name || '').trim()
    && !String(item?.price ?? '').trim()
    && item?.tag !== 'Veg'
    && item?.tag !== 'Non-Veg';
}

function hasDishTag(item) {
  return item?.tag === 'Veg' || item?.tag === 'Non-Veg';
}

function isDishComplete(item) {
  const name = String(item?.name || '').trim();
  const price = String(item?.price ?? '').trim();
  return Boolean(name) && price !== '' && !Number.isNaN(Number(price)) && hasDishTag(item);
}

/** Returns { ok, errors[], missingName, missingPrice, missingCat, missingTag } */
function validateMenu(menu) {
  const errors = [];
  let missingName = 0;
  let missingPrice = 0;
  let missingTag = 0;
  let missingCat = 0;
  let completeDishes = 0;
  let firstTarget = null;

  const namedCats = (menu || []).filter((c) => String(c.name || '').trim());
  if (!namedCats.length) {
    errors.push('Add at least one category name.');
    if (!firstTarget && menu?.[0]) {
      firstTarget = { key: `cat-${menu[0].id}`, catId: menu[0].id };
    }
  }

  for (const cat of menu || []) {
    const catName = String(cat.name || '').trim();
    const activeItems = (cat.items || []).filter((i) => !isBlankDish(i));

    if (!catName && activeItems.length) {
      missingCat += 1;
      errors.push('Every category with dishes needs a name.');
      if (!firstTarget) firstTarget = { key: `cat-${cat.id}`, catId: cat.id };
    }

    for (const item of activeItems) {
      const hasName = Boolean(String(item.name || '').trim());
      const hasPrice = String(item.price ?? '').trim() !== '' && !Number.isNaN(Number(item.price));
      const hasTag = hasDishTag(item);
      if (!hasName) {
        missingName += 1;
        if (!firstTarget) firstTarget = { key: `name-${item.id}`, catId: cat.id, itemId: item.id };
      }
      if (!hasPrice) {
        missingPrice += 1;
        if (!firstTarget) firstTarget = { key: `price-${item.id}`, catId: cat.id, itemId: item.id };
      }
      if (!hasTag) {
        missingTag += 1;
        if (!firstTarget) firstTarget = { key: `tag-${item.id}`, catId: cat.id, itemId: item.id };
      }
      if (hasName && hasPrice && hasTag) completeDishes += 1;
    }
  }

  if (!completeDishes && !firstTarget) {
    const firstCat = menu?.[0];
    const firstItem = firstCat?.items?.[0];
    if (firstItem) {
      firstTarget = { key: `name-${firstItem.id}`, catId: firstCat.id, itemId: firstItem.id };
    } else if (firstCat) {
      firstTarget = { key: `cat-${firstCat.id}`, catId: firstCat.id };
    }
  }

  if (missingName) errors.push(`${missingName} dish${missingName > 1 ? 'es need' : ' needs'} a name.`);
  if (missingPrice) errors.push(`${missingPrice} dish${missingPrice > 1 ? 'es need' : ' needs'} a price.`);
  if (missingTag) errors.push(`${missingTag} dish${missingTag > 1 ? 'es need' : ' needs'} Veg or Non-Veg.`);
  if (!completeDishes) errors.push('Add at least one dish with name, price, and Veg / Non-Veg.');

  const unique = [...new Set(errors)];
  const ok = namedCats.length > 0
    && completeDishes > 0
    && missingName === 0
    && missingPrice === 0
    && missingTag === 0
    && missingCat === 0;

  return {
    ok,
    errors: unique,
    missingName,
    missingPrice,
    missingTag,
    missingCat,
    completeDishes,
    firstTarget,
  };
}

function focusMenuError(target) {
  if (!target?.key) return;
  const run = () => {
    const field = document.querySelector(`[data-mif-error="${target.key}"]`);
    const row = field?.closest('.mif-review-item, .mif-review-cat') || field;
    (row || field)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (field && typeof field.focus === 'function') {
      field.focus({ preventScroll: true });
    }
  };
  requestAnimationFrame(() => setTimeout(run, 140));
}

function makeDemoMenu() {
  const t = Date.now();
  return [
    {
      id: `cat-demo-starters-${t}`,
      name: 'Starters',
      items: [
        { id: `i-demo-1-${t}`, name: 'Garlic Bread', desc: 'Toasted sourdough with herb butter.', price: '99', tag: 'Veg', image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80', variants: [] },
        { id: `i-demo-2-${t}`, name: 'Peri Peri Fries', desc: 'Crispy fries with smoky peri peri.', price: '119', tag: 'Veg', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80', variants: [] },
        { id: `i-demo-3-${t}`, name: 'Chicken Strips', desc: 'Golden strips with honey mustard.', price: '199', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', variants: [] },
      ],
    },
    {
      id: `cat-demo-mains-${t}`,
      name: 'Main Course',
      items: [
        { id: `i-demo-4-${t}`, name: 'Pasta Arrabbiata', desc: 'Penne in spicy tomato basil sauce.', price: '229', tag: 'Veg', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', variants: [] },
        { id: `i-demo-5-${t}`, name: 'Chicken Dum Biryani', desc: 'Slow-cooked basmati with saffron.', price: '299', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', variants: [] },
        { id: `i-demo-6-${t}`, name: 'Mushroom Risotto', desc: 'Creamy arborio with wild mushrooms.', price: '299', tag: 'Veg', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80', variants: [] },
      ],
    },
    {
      id: `cat-demo-drinks-${t}`,
      name: 'Drinks',
      items: [
        { id: `i-demo-7-${t}`, name: 'Cold Brew Coffee', desc: '12-hour steeped coffee over ice.', price: '149', tag: 'Veg', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', variants: [] },
        { id: `i-demo-8-${t}`, name: 'Mango Smoothie', desc: 'Alphonso mango with yogurt & honey.', price: '129', tag: 'Veg', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', variants: [] },
      ],
    },
  ];
}

/* ── Step 1: Restaurant Details ── */
function StepDetails({ info, setInfo, onNext }) {
  const valid = info.name.trim();
  const imgRef = useRef();
  const [dragging, setDragging] = useState(false);

  const setCoverFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    const url = URL.createObjectURL(f);
    if (info.coverImage && info.coverImage.startsWith('blob:')) URL.revokeObjectURL(info.coverImage);
    setInfo(p => ({ ...p, coverImage: url }));
  };

  const handleCoverImage = (e) => setCoverFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setCoverFile(e.dataTransfer.files[0]);
  };

  const removeCover = (e) => {
    e.stopPropagation();
    if (info.coverImage.startsWith('blob:')) URL.revokeObjectURL(info.coverImage);
    setInfo(p => ({ ...p, coverImage: null }));
    imgRef.current.value = '';
  };

  return (
    <div className="mif-step-source">
      <div className="mif-details-card">
        <div className="mif-details-card-head">
          <div className="mif-details-card-title">Tell guests who you are</div>
          <div className="mif-details-card-sub">This is the first thing customers see when they scan your QR code.</div>
        </div>
        <div className="mif-details-layout">
          <div className="mif-details-cover">
            <label className="mif-label">Cover Photo</label>
            <div
              className={`mif-cover-upload${info.coverImage ? ' has-image' : ''}${dragging ? ' dragging' : ''}`}
              onClick={() => imgRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imgRef.current.click(); } }}
            >
              {info.coverImage
                ? <>
                    <img src={info.coverImage} alt="Cover" className="mif-cover-preview" />
                    <div className="mif-cover-change"><IconCamera /><span>Change</span></div>
                    <button type="button" className="mif-cover-remove" onClick={removeCover} title="Remove photo">
                      <IconClose />
                    </button>
                  </>
                : <div className="mif-cover-placeholder">
                    <div className="mif-cover-placeholder-icon"><IconImageUpload /></div>
                    <span>{dragging ? 'Drop to upload' : 'Add cover'}</span>
                    <small>Click or drop</small>
                  </div>
              }
              {dragging && info.coverImage && <div className="mif-cover-drop-hint">Drop to replace</div>}
              <input ref={imgRef} type="file" accept="image/*" hidden onChange={handleCoverImage} />
            </div>
          </div>

          <div className="mif-details-fields">
            <div className="mif-field">
              <label className="mif-label" htmlFor="mif-rest-name">
                Restaurant Name <span className="mif-label-required">*</span>
              </label>
              <div className="mif-input-icon-wrap">
                <span className="mif-input-icon"><IconStore /></span>
                <input
                  id="mif-rest-name"
                  className="mif-item-input mif-details-input"
                  placeholder="e.g. Spice Garden"
                  value={info.name}
                  onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
                {valid && <span className="mif-input-valid"><IconCheck size={12} /></span>}
              </div>
            </div>
            <div className="mif-field">
              <div className="mif-label-row">
                <label className="mif-label" htmlFor="mif-rest-tagline">
                  Tagline <span className="mif-label-optional">(optional)</span>
                </label>
                <span className="mif-char-count">{info.tagline.length}/{TAGLINE_MAX}</span>
              </div>
              <div className="mif-input-icon-wrap">
                <span className="mif-input-icon"><IconSparkle /></span>
                <input
                  id="mif-rest-tagline"
                  className="mif-item-input mif-details-input"
                  placeholder="e.g. Authentic Indian Flavours"
                  maxLength={TAGLINE_MAX}
                  value={info.tagline}
                  onChange={e => setInfo(p => ({ ...p, tagline: e.target.value }))}
                />
              </div>
            </div>
            <div className="mif-field">
              <label className="mif-label" htmlFor="mif-rest-location">
                Google Maps link <span className="mif-label-optional">(optional)</span>
              </label>
              <div className="mif-input-icon-wrap">
                <span className="mif-input-icon"><IconPin /></span>
                <input
                  id="mif-rest-location"
                  className="mif-item-input mif-details-input"
                  type="url"
                  placeholder="Paste Google Maps link"
                  value={info.location}
                  onChange={e => setInfo(p => ({ ...p, location: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <p className="mif-field-hint">Guests get a Directions button on your menu that opens this map.</p>
            </div>
          </div>
        </div>

        <div className="mif-preview">
          <div className="mif-preview-label"><IconEye /> Live preview</div>
          <div className="mif-preview-banner">
            {info.coverImage && <img src={info.coverImage} alt="" className="mif-preview-bg" />}
            <div className="mif-preview-content">
              <div className="mif-preview-avatar">
                {info.coverImage
                  ? <img src={info.coverImage} alt="" />
                  : <span>{(info.name.trim()[0] || 'R').toUpperCase()}</span>}
              </div>
              <div className="mif-preview-text">
                <div className={`mif-preview-name${info.name.trim() ? '' : ' empty'}`}>
                  {info.name.trim() || 'Your Restaurant'}
                </div>
                <div className={`mif-preview-tagline${info.tagline.trim() ? '' : ' empty'}`}>
                  {info.tagline.trim() || 'Your tagline appears here'}
                </div>
                <div className={`mif-preview-location${info.location.trim() ? '' : ' empty'}`}>
                  <IconPin /> {info.location.trim() ? 'Directions on menu' : 'Paste a Maps link'}
                </div>
                <div className="mif-preview-meta">
                  <span className="mif-preview-open"><i /> Open now</span>
                  <span className="mif-preview-badge"><IconQr /> QR Menu</span>
                </div>
              </div>
            </div>
            <div className="mif-preview-tabs">
              {PREVIEW_CATEGORIES.map((c, i) => (
                <span key={c} className={`mif-preview-tab${i === 0 ? ' active' : ''}`}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mif-source-footer">
        <div className="mif-source-footer-info">
          <div className="mif-progress"><div className="mif-progress-bar" style={{ width: valid ? '33%' : '12%' }} /></div>
          <span>Step 1 of 3 · {valid ? 'Looking good! Next, add your dishes.' : 'Takes about 2 minutes'}</span>
        </div>
        <button className="mif-btn-primary" disabled={!valid} onClick={onNext}>
          Next — Add Menu Items
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ── Item Row ── */
function ItemRow({ item, catId, updateItem, removeItem, index, showErrors = false }) {
  const [expanded, setExpanded] = useState(Boolean(item.desc) || (item.variants || []).length > 0);
  const imgRef = useRef();
  const blank = isBlankDish(item);
  const hasName = Boolean(item.name.trim());
  const hasPrice = String(item.price).trim() !== '' && !Number.isNaN(Number(item.price));
  const hasTag = hasDishTag(item);
  const nameInvalid = showErrors && !blank && !hasName;
  const priceInvalid = showErrors && !blank && !hasPrice;
  const tagInvalid = showErrors && !blank && !hasTag;
  const isVegSelected = item.tag === 'Veg';
  const isNonVegSelected = item.tag === 'Non-Veg';

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (item.image && item.image.startsWith('blob:')) URL.revokeObjectURL(item.image);
    updateItem(catId, item.id, 'image', url);
  };

  const addVariant = () => {
    const variants = [...(item.variants || []), { id: `v-${Date.now()}`, label: '', price: '' }];
    updateItem(catId, item.id, 'variants', variants);
    setExpanded(true);
  };
  const updateVariant = (vId, field, val) => {
    const variants = (item.variants || []).map(v => v.id === vId ? { ...v, [field]: val } : v);
    updateItem(catId, item.id, 'variants', variants);
  };
  const removeVariant = (vId) => {
    const variants = (item.variants || []).filter(v => v.id !== vId);
    updateItem(catId, item.id, 'variants', variants);
  };

  return (
    <div className={`mif-review-item${!hasName ? ' is-empty' : ''}${nameInvalid || priceInvalid || tagInvalid ? ' is-invalid' : ''}`}>
      <div className="mif-item-main">
        <button
          type="button"
          className={`mif-item-img-thumb${item.image ? ' has-image' : ''}`}
          onClick={() => imgRef.current.click()}
          title={item.image ? 'Change photo' : 'Add photo'}
        >
          {item.image ? (
            <>
              <img src={item.image} alt="" className="mif-item-img-preview" />
              <span
                className="mif-img-remove"
                onClick={e => {
                  e.stopPropagation();
                  if (item.image && item.image.startsWith('blob:')) URL.revokeObjectURL(item.image);
                  updateItem(catId, item.id, 'image', null);
                }}
                title="Remove image"
              >
                <IconClose />
              </span>
            </>
          ) : (
            <span className="mif-item-img-placeholder">
              <IconPhoto />
              <span>Photo</span>
            </span>
          )}
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={handleImage} />
        </button>

        <div className="mif-item-fields">
          <div className="mif-item-top">
            <span className="mif-item-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="mif-item-name-wrap">
              <input
                className={`mif-item-input mif-item-name${nameInvalid ? ' mif-field-error' : !hasName ? ' mif-field-warn' : ''}`}
                value={item.name}
                onChange={e => updateItem(catId, item.id, 'name', e.target.value)}
                placeholder="Dish name *"
                required
                aria-invalid={nameInvalid}
                data-mif-error={`name-${item.id}`}
              />
              {nameInvalid && <span className="mif-field-hint">Name is required</span>}
            </div>
            <div className={`mif-tag-wrap${tagInvalid ? ' is-invalid' : ''}`}>
              <div
                className={`mif-tag-switch${tagInvalid ? ' is-invalid' : ''}`}
                role="group"
                aria-label="Veg or Non-Veg"
                data-mif-error={`tag-${item.id}`}
                tabIndex={tagInvalid ? 0 : -1}
              >
                <button
                  type="button"
                  className={`mif-tag-btn is-veg${isVegSelected ? ' is-active' : ''}`}
                  aria-pressed={isVegSelected}
                  onClick={() => updateItem(catId, item.id, 'tag', 'Veg')}
                  title="Mark as Veg"
                >
                  <span className="mif-tag-dot is-veg" />
                  Veg
                </button>
                <button
                  type="button"
                  className={`mif-tag-btn is-nonveg${isNonVegSelected ? ' is-active' : ''}`}
                  aria-pressed={isNonVegSelected}
                  onClick={() => updateItem(catId, item.id, 'tag', 'Non-Veg')}
                  title="Mark as Non-Veg"
                >
                  <span className="mif-tag-dot is-nonveg" />
                  Non-Veg
                </button>
              </div>
              {tagInvalid && <span className="mif-field-hint">Pick Veg or Non-Veg</span>}
            </div>
            <div className="mif-price-wrap">
              <span className="mif-price-prefix">₹</span>
              <input
                className={`mif-item-input mif-item-price${priceInvalid ? ' mif-field-error' : !hasPrice ? ' mif-field-warn' : ''}`}
                value={item.price}
                onChange={e => updateItem(catId, item.id, 'price', e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Price *"
                inputMode="decimal"
                required
                aria-invalid={priceInvalid}
                data-mif-error={`price-${item.id}`}
              />
              {priceInvalid && <span className="mif-field-hint">Price is required</span>}
            </div>
            <div className="mif-item-actions">
              <button
                type="button"
                className={`mif-icon-btn mif-icon-btn-ghost${expanded ? ' is-on' : ''}`}
                onClick={() => setExpanded(x => !x)}
                title="Description & variants"
              >
                <IconChevron open={expanded} />
              </button>
              <button
                type="button"
                className="mif-icon-btn mif-icon-btn-danger"
                onClick={() => removeItem(catId, item.id)}
                title="Remove dish"
              >
                <IconTrash />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mif-item-extra">
              <input
                className="mif-item-input mif-item-desc"
                value={item.desc}
                onChange={e => updateItem(catId, item.id, 'desc', e.target.value)}
                placeholder="Short description — ingredients, spice level, serving size…"
              />
              <div className="mif-variants-wrap">
                <div className="mif-variants-head">
                  <div className="mif-variants-label">Sizes & variants</div>
                  <button type="button" className="mif-add-variant-btn" onClick={addVariant}>
                    <IconPlus /> Add
                  </button>
                </div>
                {(item.variants || []).length === 0 ? (
                  <p className="mif-variants-empty">Optional — e.g. Half / Full, Regular / Large</p>
                ) : (
                  (item.variants || []).map(v => (
                    <div key={v.id} className="mif-variant-row">
                      <input
                        className="mif-item-input mif-variant-label"
                        value={v.label}
                        onChange={e => updateVariant(v.id, 'label', e.target.value)}
                        placeholder="e.g. Half, Full"
                      />
                      <div className="mif-price-wrap mif-price-wrap-sm">
                        <span className="mif-price-prefix">₹</span>
                        <input
                          className="mif-item-input mif-variant-price"
                          value={v.price}
                          onChange={e => updateVariant(v.id, 'price', e.target.value.replace(/[^\d.]/g, ''))}
                          placeholder="0"
                          inputMode="decimal"
                        />
                      </div>
                      <button type="button" className="mif-icon-btn mif-icon-btn-danger" onClick={() => removeVariant(v.id)}>
                        <IconTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Category Block ── */
function CategoryBlock({ cat, idx, total, updateCatName, removeCategory, addItem, updateItem, removeItem, onMoveUp, onMoveDown, showErrors = false, forceOpenCatId = null }) {
  const [collapsed, setCollapsed] = useState(false);
  const ready = cat.items.filter((i) => isDishComplete(i)).length;
  const activeItems = cat.items.filter((i) => !isBlankDish(i));
  const catInvalid = showErrors && activeItems.length > 0 && !String(cat.name || '').trim();
  const hasItemErrors = showErrors && activeItems.some((i) => !isDishComplete(i));

  useEffect(() => {
    if (forceOpenCatId === cat.id || ((catInvalid || hasItemErrors) && showErrors)) {
      setCollapsed(false);
    }
  }, [forceOpenCatId, cat.id, catInvalid, hasItemErrors, showErrors]);

  return (
    <div className={`mif-review-cat${collapsed ? ' is-collapsed' : ''}${catInvalid ? ' is-invalid' : ''}`}>
      <div className="mif-review-cat-header">
        <span className="mif-cat-num">{String(idx + 1).padStart(2, '0')}</span>
        <div className="mif-cat-name-wrap">
          <input
            className={`mif-cat-name-input${catInvalid ? ' mif-field-error' : ''}`}
            value={cat.name}
            onChange={e => updateCatName(cat.id, e.target.value)}
            placeholder="Category name — Starters, Mains, Drinks… *"
            required
            aria-invalid={catInvalid}
            data-mif-error={`cat-${cat.id}`}
          />
          {catInvalid && <span className="mif-field-hint">Category name is required</span>}
        </div>
        <span className="mif-cat-count">
          {ready}/{activeItems.length || cat.items.length} ready
        </span>
        <div className="mif-cat-tools">
          <div className="mif-cat-reorder">
            <button type="button" className="mif-reorder-btn" onClick={onMoveUp} disabled={idx === 0} title="Move up">
              <IconUp />
            </button>
            <button type="button" className="mif-reorder-btn" onClick={onMoveDown} disabled={idx === total - 1} title="Move down">
              <IconDown />
            </button>
          </div>
          <button type="button" className="mif-icon-btn mif-icon-btn-ghost" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
            <IconChevron open={!collapsed} />
          </button>
          <button type="button" className="mif-icon-btn mif-icon-btn-danger" onClick={() => removeCategory(cat.id)} title="Remove category">
            <IconTrash />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mif-review-items">
          {cat.items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              catId={cat.id}
              index={i}
              updateItem={updateItem}
              removeItem={removeItem}
              showErrors={showErrors}
            />
          ))}
          <button type="button" className="mif-add-item-btn" onClick={() => addItem(cat.id)}>
            <IconPlus /> Add dish to {cat.name.trim() || 'this category'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Add Items ── */
function StepItems({ menu, setMenu, showErrors = false, validation = null, focusTarget = null }) {
  const addCategory = () => setMenu(m => [...m, newCat()]);
  const removeCategory = (catId) => setMenu(m => m.length <= 1 ? m : m.filter(c => c.id !== catId));
  const updateCatName = (catId, name) => setMenu(m => m.map(c => c.id === catId ? { ...c, name } : c));
  const moveCat = (idx, dir) => setMenu(m => {
    const arr = [...m];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return arr;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    return arr;
  });
  const addItem = (catId) => setMenu(m => m.map(c => c.id === catId ? { ...c, items: [...c.items, newItem()] } : c));
  const removeItem = (catId, itemId) => setMenu(m => m.map(c => {
    if (c.id !== catId) return c;
    if (c.items.length <= 1) return c;
    return { ...c, items: c.items.filter(i => i.id !== itemId) };
  }));
  const updateItem = (catId, itemId, field, value) => setMenu(m => m.map(c => c.id === catId
    ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
    : c
  ));

  const loadDemo = () => {
    const hasContent = menu.some((c) => c.name.trim() || c.items.some((i) => i.name.trim()));
    if (hasContent && !window.confirm('Replace your current menu with the demo dishes?')) return;
    setMenu(makeDemoMenu());
  };

  const namedCats = menu.filter(c => c.name.trim()).length;
  const namedDishes = menu.reduce((a, c) => a + c.items.filter(i => i.name.trim()).length, 0);
  const readyDishes = menu.reduce((a, c) => a + c.items.filter((i) => isDishComplete(i)).length, 0);
  const withPhotos = menu.reduce((a, c) => a + c.items.filter(i => i.image).length, 0);
  const progress = namedDishes ? Math.round((readyDishes / namedDishes) * 100) : 0;
  const issues = validation || validateMenu(menu);
  const previewItems = menu
    .flatMap((c) => c.items.filter((i) => i.name.trim()).map((i) => ({ ...i, cat: c.name })))
    .slice(0, 4);

  return (
    <div className="mif-step-review">
      <div className="mif-review-card">
        <div className="mif-review-card-head">
          <div>
            <div className="mif-details-card-title">Build your menu</div>
            <div className="mif-details-card-sub">Add categories and dishes — photos and descriptions are optional but convert better.</div>
          </div>
          <div className="mif-review-progress-ring" style={{ '--p': `${progress}%` }} aria-label={`${progress}% ready`}>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="mif-review-summary">
          <div className="mif-review-summary-stat">
            <span className="mif-review-stat-icon"><IconLayers /></span>
            <div>
              <strong>{namedCats}</strong>
              <em>Categories</em>
            </div>
          </div>
          <div className="mif-review-summary-stat">
            <span className="mif-review-stat-icon"><IconDish /></span>
            <div>
              <strong>{namedDishes}</strong>
              <em>Dishes</em>
            </div>
          </div>
          <div className="mif-review-summary-stat">
            <span className="mif-review-stat-icon"><IconPhoto /></span>
            <div>
              <strong>{withPhotos}</strong>
              <em>With photos</em>
            </div>
          </div>
          <div className={`mif-review-summary-stat${readyDishes === namedDishes && namedDishes > 0 ? ' is-good' : ''}`}>
            <span className="mif-review-stat-icon"><IconCheck size={14} /></span>
            <div>
              <strong>{readyDishes}</strong>
              <em>Ready</em>
            </div>
          </div>
        </div>

        <div className="mif-review-tip">
          <IconTip />
          <span>Dish name, price, and Veg / Non-Veg are mandatory for every dish before saving or publishing.</span>
        </div>

        {showErrors && !issues.ok && (
          <div className="mif-review-errors" role="alert" data-mif-error-banner>
            <strong>Fix these before continuing</strong>
            <ul>
              {issues.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mif-demo-row">
        <div className="mif-demo-card">
          <div className="mif-demo-copy">
            <span className="mif-demo-eyebrow">Demo menu</span>
            <strong>Not sure how to start?</strong>
            <p>Load a sample café menu with starters, mains, and drinks — then edit names and prices to match yours.</p>
            <button type="button" className="mif-demo-btn" onClick={loadDemo}>
              <IconSparkle /> Load demo menu
            </button>
          </div>
          <div className="mif-demo-phone" aria-hidden="true">
            <div className="mif-demo-phone-bar">getmenucard.app/menu</div>
            <div className="mif-demo-phone-chips">
              <span className="is-on">All</span>
              <span>Starters</span>
              <span>Mains</span>
            </div>
            <div className="mif-demo-phone-list">
              {(previewItems.length
                ? previewItems
                : [
                    { name: 'Garlic Bread', price: '99', tag: 'Veg', image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=200&q=80' },
                    { name: 'Chicken Dum Biryani', price: '299', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80' },
                    { name: 'Cold Brew Coffee', price: '149', tag: 'Veg', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
                  ]
              ).map((item) => (
                <div className="mif-demo-phone-item" key={`${item.name}-${item.price}`}>
                  {item.image
                    ? <img src={String(item.image).replace('w=400', 'w=120')} alt="" />
                    : <div className="mif-demo-phone-fallback">🍽️</div>}
                  <div>
                    <b>{item.name}</b>
                    <em>₹{item.price || '—'}</em>
                  </div>
                  <span className={item.tag === 'Non-Veg' ? 'nv' : 'v'}>{item.tag === 'Non-Veg' ? 'N' : 'V'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mif-review-categories">
        {menu.map((cat, idx) => (
          <CategoryBlock
            key={cat.id} cat={cat} idx={idx} total={menu.length}
            updateCatName={updateCatName} removeCategory={removeCategory}
            addItem={addItem} updateItem={updateItem} removeItem={removeItem}
            onMoveUp={() => moveCat(idx, -1)} onMoveDown={() => moveCat(idx, 1)}
            showErrors={showErrors}
            forceOpenCatId={focusTarget?.catId || null}
          />
        ))}
      </div>

      <button type="button" className="mif-add-cat-btn" onClick={addCategory}>
        <IconPlus /> Add another category
      </button>
    </div>
  );
}

/* ── Step 3: Done ── */
function StepDone({ published, onClose, donePrimaryLabel, onDonePrimary, mode, live = false }) {
  const navigate = useNavigate();
  const primaryLabel = donePrimaryLabel
    || (published && live ? 'View Restaurants' : published ? 'Create free account' : null);
  const handlePrimary = () => {
    if (onDonePrimary) {
      onDonePrimary();
      return;
    }
    onClose();
    navigate(published && !live ? '/signup' : '/restaurants');
  };

  return (
    <div className="mif-step-done">
      <div className="mif-done-icon">{published ? (live ? '🚀' : '👀') : '💾'}</div>
      <div className="mif-done-title">
        {published ? (live ? 'Menu Published!' : 'Preview ready') : 'Menu Saved!'}
      </div>
      <div className="mif-done-sub">
        {published
          ? (live
            ? (mode === 'onboarding'
              ? 'Your menu is live. Next up — your restaurant dashboard.'
              : 'Your restaurant is now live on GetMenuCard for any phone that scans your QR.')
            : 'Saved on this device only. Sign up free to publish it live so guests can open it from any phone.')
          : (mode === 'onboarding'
            ? 'Draft saved to your account. Publish when you’re ready.'
            : 'Draft saved on this device. Sign up to keep it live across phones.')
        }
      </div>
      <div className="mif-done-actions">
        <button className="mif-btn-ghost" onClick={onClose}>
          {mode === 'onboarding' ? 'Skip to dashboard' : 'Back to Home'}
        </button>
        {(published || mode === 'onboarding') && primaryLabel && (
          <button className="mif-btn-primary" onClick={handlePrimary}>
            {primaryLabel}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Publish Confirm ── */
function PublishConfirm({ menu, onConfirm, onCancel, publishing = false, error = '' }) {
  const totalDishes = menu.reduce((a, c) => a + c.items.length, 0);
  return (
    <div className="mif-confirm-overlay">
      <div className="mif-confirm-box">
        <div className="mif-confirm-icon">🚀</div>
        <div className="mif-confirm-title">Publish Menu?</div>
        <div className="mif-confirm-body">
          You are about to publish <strong>{totalDishes} dishes</strong> across <strong>{menu.length} categories</strong>.
        </div>
        {error && <div className="mif-confirm-error" role="alert">{error}</div>}
        <div className="mif-confirm-actions">
          <button className="mif-btn-ghost" onClick={onCancel} disabled={publishing}>Go Back</button>
          <button className="mif-btn-publish" onClick={onConfirm} disabled={publishing}>
            {publishing ? 'Publishing…' : '✅ Yes, Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROOT
══════════════════════════════════════ */
export default function MenuImportFlow({
  onClose,
  restaurantId = null,
  initialInfo = null,
  donePrimaryLabel = null,
  onDonePrimary = null,
  mode = 'default',
}) {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState(() => ({
    name: '',
    tagline: '',
    location: '',
    coverImage: null,
    ...(initialInfo || {}),
  }));
  const [menu, setMenu] = useState([newCat()]);
  const [published, setPublished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMenuErrors, setShowMenuErrors] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [livePublished, setLivePublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const HEADER_TITLES = ['Restaurant Details', 'Build Your Menu', published ? (livePublished ? 'Menu Published' : 'Preview Ready') : 'Menu Saved'];
  const HEADER_SUBS   = [
    'Add a cover photo, name, location and an optional tagline',
    'Add categories and dishes manually',
    published
      ? (livePublished ? 'Your menu is now live for customers' : 'Preview saved on this device — sign up to go live')
      : 'Your menu draft has been saved',
  ];

  const menuValidation = validateMenu(menu);

  useEffect(() => {
    if (showMenuErrors && focusTarget) {
      focusMenuError(focusTarget);
    }
  }, [showMenuErrors, focusTarget]);

  const ensureMenuValid = () => {
    const result = validateMenu(menu);
    if (!result.ok) {
      setShowMenuErrors(true);
      setFocusTarget(result.firstTarget);
      setStep(1);
      setShowConfirm(false);
      focusMenuError(result.firstTarget);
      return false;
    }
    setShowMenuErrors(false);
    setFocusTarget(null);
    return true;
  };

  const cleanedCategories = () =>
    menu
      .map((cat) => ({
        id: cat.id,
        name: String(cat.name || '').trim(),
        icon: '🍽️',
        items: (cat.items || [])
          .filter((item) => isDishComplete(item))
          .map((item) => ({
            id: item.id,
            name: String(item.name).trim(),
            desc: item.desc || '',
            price: Number(item.price) || 0,
            tag: item.tag,
            image: item.image || '',
            popular: false,
          })),
      }))
      .filter((cat) => cat.name && cat.items.length);

  const buildPayload = async () => {
    const slug = info.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `restaurant-${Date.now()}`;
    const id = restaurantId || slug;
    const categories = cleanedCategories();
    const coverImage = await persistImageUrl(info.coverImage || '');
    const withImages = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        items: await Promise.all(
          cat.items.map(async (item) => ({
            ...item,
            image: await persistImageUrl(item.image || ''),
          }))
        ),
      }))
    );
    return {
      id,
      name: info.name.trim(),
      tagline: info.tagline || 'Restaurant',
      location: info.location.trim(),
      emoji: '🍽️',
      accent: '#b8935a',
      googleReviewUrl: info.googleReviewUrl || '',
      coverImage,
      categories: withImages,
    };
  };

  const syncOwnerMenu = async (payload) => {
    await ownerApi.updateRestaurant({
      name: payload.name,
      tagline: payload.tagline,
      location: payload.location,
      emoji: payload.emoji,
      coverImage: typeof payload.coverImage === 'string' ? payload.coverImage : '',
      accent: payload.accent,
      googleReviewUrl: payload.googleReviewUrl || '',
    });
    await ownerApi.updateMenu({ categories: payload.categories });
    publishRestaurant({ ...payload, source: 'owner' }, { syncBackend: true });
  };

  const handleSave = async () => {
    if (!ensureMenuValid()) return;
    setSaving(true);
    setPublishError('');
    try {
      const payload = await buildPayload();
      const ownerToken = getOwnerToken();
      const useOwnerApi = Boolean(ownerToken && restaurantId);
      if (useOwnerApi) {
        await syncOwnerMenu(payload);
      } else {
        publishRestaurant(payload, { syncBackend: false });
      }
      setLivePublished(useOwnerApi);
      setPublished(false);
      setStep(2);
    } catch (err) {
      setPublishError(err.message || 'Could not save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishRequest = () => {
    if (!ensureMenuValid()) return;
    setPublishError('');
    setShowConfirm(true);
  };

  const handlePublishConfirm = async () => {
    if (!ensureMenuValid()) {
      setShowConfirm(false);
      return;
    }

    setPublishing(true);
    setPublishError('');
    try {
      const payload = await buildPayload();
      const ownerToken = getOwnerToken();
      const useOwnerApi = Boolean(ownerToken && restaurantId);

      if (useOwnerApi) {
        await syncOwnerMenu(payload);
        setLivePublished(true);
      } else {
        // Anonymous / marketing: local preview only (server publish needs owner login)
        publishRestaurant(payload, { syncBackend: false });
        setLivePublished(false);
      }
      setShowConfirm(false);
      setPublished(true);
      setStep(2);
    } catch (err) {
      setPublishError(err.message || 'Failed to publish menu. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={`mif-overlay${mode === 'onboarding' ? ' mif-overlay-page' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mif-modal">

        {/* Header */}
        <div className="mif-header">
          <div className="mif-header-left">
            <div className="mif-header-icon"><IconCutlery /></div>
            <div>
              <div className="mif-header-title">{HEADER_TITLES[step]}</div>
              <div className="mif-header-sub">{HEADER_SUBS[step]}</div>
            </div>
          </div>
          <button className="mif-close-btn" onClick={onClose}><IconClose /></button>
        </div>

        {/* Stepper */}
        <div className="mif-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`mif-stepper-item${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <div className="mif-stepper-dot">{i < step ? <IconCheck size={13} /> : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="mif-stepper-line" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="mif-body">
          {step === 0 && <StepDetails info={info} setInfo={setInfo} onNext={() => setStep(1)} />}
          {step === 1 && (
            <StepItems
              menu={menu}
              setMenu={setMenu}
              showErrors={showMenuErrors}
              validation={menuValidation}
              focusTarget={focusTarget}
            />
          )}
          {step === 2 && (
            <StepDone
              published={published}
              live={livePublished}
              onClose={onClose}
              donePrimaryLabel={donePrimaryLabel}
              onDonePrimary={onDonePrimary}
              mode={mode}
            />
          )}
        </div>

        {/* Footer — step 1 only */}
        {step === 1 && (
          <div className="mif-footer">
            <div className="mif-footer-info">
              {menuValidation.completeDishes} ready dishes · {menu.filter(c => c.name.trim()).length} categories
              {showMenuErrors && !menuValidation.ok && (
                <span className="mif-footer-warn"> · Fix required fields</span>
              )}
              {!showConfirm && publishError && (
                <span className="mif-footer-warn"> · {publishError}</span>
              )}
            </div>
            <div className="mif-footer-actions">
              <button className="mif-btn-ghost" onClick={handleSave} disabled={saving || publishing}>
                {saving ? 'Saving…' : '💾 Save Draft'}
              </button>
              <button className="mif-btn-primary" onClick={handlePublishRequest} disabled={saving || publishing}>
                🚀 Publish Menu
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        )}

        {showConfirm && (
          <PublishConfirm
            menu={menu}
            onConfirm={handlePublishConfirm}
            onCancel={() => !publishing && setShowConfirm(false)}
            publishing={publishing}
            error={publishError}
          />
        )}
      </div>
    </div>
  );
}
