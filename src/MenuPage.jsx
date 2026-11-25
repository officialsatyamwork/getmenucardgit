import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toplogo from './assets/top_logo.png';
import {
  loadPublicRestaurant,
  getRestaurantStatusInfo,
  refreshRestaurantVisibility,
  trackEvent,
  R_IMAGES,
  FALLBACK_IMG,
  isMapsLink,
  normalizeMapsUrl,
} from './restaurantStore';
import FilterSheet from './FilterSheet';
import { resolveMenuImage } from './menuImages';
import './MenuPage.css';

/* ── Icons ── */
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconStar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
);
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
);
const IconPin = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 13.5A7.5 7.5 0 1110.5 4a6.2 6.2 0 009.5 9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const THEME_KEY = 'mc_menu_theme';
function readMenuTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark' || t === 'light') return t;
  } catch { /* ignore */ }
  return 'light';
}

/* Indian FSSAI-style veg / non-veg mark */
const VegMark = ({ tag, size = 14 }) => (
  <span
    className={`vm ${tag === 'Veg' ? 'vm-veg' : 'vm-nonveg'}`}
    style={{ width: size, height: size }}
    title={tag}
    aria-label={tag}
  />
);

const isUsableImageSrc = (src) => {
  if (!src || typeof src !== 'string') return false;
  return (
    src.startsWith('http')
    || src.startsWith('blob:')
    || src.startsWith('data:')
    || src.startsWith('/')
    || src.startsWith('.')
  );
};

const FoodImage = ({ name, image, fallback }) => {
  const local = resolveMenuImage(name);
  const src = local || image;
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);
  if (err || !isUsableImageSrc(src)) {
    const letter = (name || '').trim().charAt(0).toUpperCase() || (fallback || '🍽️');
    return (
      <div className="fi-fallback fi-fallback-letter" aria-hidden="true" title={name}>
        {letter}
      </div>
    );
  }
  return <img src={src} alt={name || ''} loading="lazy" onError={() => setErr(true)} className="fi-img" />;
};

const SORTERS = {
  popular:    (a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0),
  price_asc:  (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

export default function MenuPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(readMenuTheme);
  const [accessTick, setAccessTick] = useState(0);
  const [restaurant, setRestaurant] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | not_found | network

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
      return next;
    });
  };
  const access = useMemo(() => {
    if (restaurant) {
      return {
        status: restaurant.status || getRestaurantStatusInfo(restaurantId).status || 'active',
        reason: restaurant.statusReason || getRestaurantStatusInfo(restaurantId).reason || '',
      };
    }
    return getRestaurantStatusInfo(restaurantId);
  }, [restaurant, restaurantId, accessTick]);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setRestaurant(null);
    (async () => {
      await refreshRestaurantVisibility().catch(() => {});
      const result = await loadPublicRestaurant(restaurantId);
      if (cancelled) return;
      if (result.restaurant) {
        setRestaurant(result.restaurant);
        setLoadState('ready');
        setAccessTick((t) => t + 1);
      } else {
        setLoadState(result.error === 'network' ? 'network' : 'not_found');
      }
    })();
    const onVis = () => setAccessTick((t) => t + 1);
    window.addEventListener('mc_visibility_updated', onVis);
    return () => {
      cancelled = true;
      window.removeEventListener('mc_visibility_updated', onVis);
    };
  }, [restaurantId]);

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [customRange, setCustomRange] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  /** Mobile/tablet: null = category list; id = items for that category */
  const [mobileCatId, setMobileCatId] = useState(null);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false
  );
  const sectionRefs = useRef({});
  const chipBarRef = useRef(null);
  const chipRefs = useRef({});
  const picksRowRef = useRef(null);
  const [picksScroll, setPicksScroll] = useState({ left: false, right: false });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => {
      setIsCompact(mq.matches);
      if (!mq.matches) setMobileCatId(null);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const categories = useMemo(() => restaurant?.categories || [], [restaurant]);
  const allItems = useMemo(
    () => categories.flatMap((c) => (c.items || []).map((i) => ({ ...i, categoryId: c.id, categoryName: c.name }))),
    [categories]
  );
  const maxPrice = useMemo(
    () => Math.max(100, Math.ceil(Math.max(0, ...allItems.map(i => Number(i.price) || 0)) / 50) * 50),
    [allItems]
  );
  const priceRange = useMemo(() => customRange || [0, maxPrice], [customRange, maxPrice]);

  useEffect(() => {
    if (restaurant) trackEvent('menu_open', restaurantId);
  }, [restaurant, restaurantId]);

  const query = search.toLowerCase().trim();

  const sections = useMemo(() => {
    const matches = i =>
      (filterTag === 'all' || i.tag === filterTag) &&
      i.price >= priceRange[0] && i.price <= priceRange[1];
    const sort = arr => (SORTERS[sortBy] ? [...arr].sort(SORTERS[sortBy]) : arr);

    if (query) {
      const found = allItems.filter(i =>
        matches(i) && (i.name.toLowerCase().includes(query) || (i.desc || '').toLowerCase().includes(query))
      );
      return found.length ? [{ id: 'search', name: `Results for “${search.trim()}”`, items: sort(found) }] : [];
    }
    return categories
      .map((c) => ({ ...c, items: sort((c.items || []).filter(matches)) }))
      .filter((c) => c.items.length > 0);
  }, [categories, allItems, query, search, filterTag, sortBy, priceRange]);

  const filtersActive = (sortBy !== 'default') + (filterTag !== 'all') + (customRange ? 1 : 0);
  const shownCount = sections.reduce((n, s) => n + s.items.length, 0);
  const vegCount = allItems.filter(i => i.tag === 'Veg').length;
  const showCategoryHome = isCompact && !query && !mobileCatId;
  const mobileSection = mobileCatId ? sections.find((s) => s.id === mobileCatId) : null;
  const compactSections = isCompact && !query
    ? (mobileSection ? [mobileSection] : [])
    : sections;
  const picks = !query && !filtersActive && (!isCompact || showCategoryHome)
    ? allItems.filter(i => i.popular).slice(0, 8)
    : [];
  const currentCat = isCompact
    ? (mobileCatId || activeCat || sections[0]?.id)
    : (activeCat || sections[0]?.id);

  useEffect(() => {
    if (query) setMobileCatId(null);
  }, [query]);

  /* Scroll-spy: highlight the category currently in view (desktop) */
  useEffect(() => {
    if (query || isCompact) return;
    const els = sections.map(s => sectionRefs.current[s.id]).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActiveCat(e.target.dataset.cat)),
      { rootMargin: '-150px 0px -60% 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [sections, query, isCompact]);

  /* Keep the active chip visible in the mobile chip bar */
  useEffect(() => {
    if (showCategoryHome) return;
    const bar = chipBarRef.current;
    const chip = chipRefs.current[currentCat];
    if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [currentCat, showCategoryHome]);

  /* Lock page scroll + Esc to close while a dish is open */
  useEffect(() => {
    if (!selectedItem) return;
    const onKey = e => e.key === 'Escape' && setSelectedItem(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedItem]);

  const jumpTo = id => {
    setActiveCat(id);
    if (isCompact) {
      setMobileCatId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const backToCategories = () => {
    setMobileCatId(null);
    setActiveCat(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updatePicksScroll = () => {
    const el = picksRowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPicksScroll({
      left: el.scrollLeft > 4,
      right: max > 4 && el.scrollLeft < max - 4,
    });
  };

  useEffect(() => {
    const el = picksRowRef.current;
    if (!el) return undefined;
    updatePicksScroll();
    el.addEventListener('scroll', updatePicksScroll, { passive: true });
    window.addEventListener('resize', updatePicksScroll);
    return () => {
      el.removeEventListener('scroll', updatePicksScroll);
      window.removeEventListener('resize', updatePicksScroll);
    };
  }, [picks.length]);

  const scrollPicks = (dir) => {
    const el = picksRowRef.current;
    if (!el) return;
    const step = Math.max(220, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const openItem = item => {
    setSelectedItem(item);
    trackEvent('food_view', restaurantId, { item: item.name });
  };

  const clearFilters = () => {
    setSortBy('default');
    setFilterTag('all');
    setCustomRange(null);
    setSearch('');
  };

  if (loadState === 'loading') {
    return (
      <div className="mp-notfound">
        <div className="mp-notfound-card">
          <div className="mp-notfound-emoji">⏳</div>
          <h1>Loading menu…</h1>
          <p>Fetching the latest dishes for this restaurant.</p>
        </div>
      </div>
    );
  }

  if (!restaurant || loadState === 'not_found' || loadState === 'network') {
    return (
      <div className="mp-notfound">
        <div className="mp-notfound-card">
          <div className="mp-notfound-emoji">🍽️</div>
          <h1>{loadState === 'network' ? 'Can’t reach the menu' : 'Restaurant not found'}</h1>
          <p>
            {loadState === 'network'
              ? 'Check your connection and try again.'
              : 'This QR code may be out of date. Please ask the staff for a fresh one.'}
          </p>
          <button
            className="mp-btn-dark"
            onClick={() => (loadState === 'network' ? window.location.reload() : navigate('/'))}
          >
            {loadState === 'network' ? 'Retry' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  if (access.status === 'held') {
    return (
      <div className="mp-notfound">
        <div className="mp-notfound-card">
          <div className="mp-notfound-emoji">⏸️</div>
          <h1>Menu on hold</h1>
          <p>
            {access.reason || 'This restaurant menu is temporarily unavailable pending payment.'}
            {' '}Please check back soon or ask the staff.
          </p>
          <button className="mp-btn-dark" onClick={() => navigate('/')}>Back to home</button>
        </div>
      </div>
    );
  }

  if (access.status === 'removed') {
    return (
      <div className="mp-notfound">
        <div className="mp-notfound-card">
          <div className="mp-notfound-emoji">🚫</div>
          <h1>Menu unavailable</h1>
          <p>This restaurant has been removed from GetMenuCard.</p>
          <button className="mp-btn-dark" onClick={() => navigate('/')}>Back to home</button>
        </div>
      </div>
    );
  }

  const accent = restaurant.accent || '#f4831f';
  const cover = (restaurant.coverImage || R_IMAGES[restaurant.id] || FALLBACK_IMG).replace('w=600', 'w=1600');
  const brandedCover = restaurant.id === 'sangeetha-kitchen';
  /* Keep QR guests on this menu URL — no exit to marketing home */
  const lockToMenu = restaurant.id === 'sangeetha-kitchen';
  const related = selectedItem
    ? allItems.filter(i => i.categoryId === selectedItem.categoryId && i.id !== selectedItem.id).slice(0, 3)
    : [];

  const onHeaderBack = () => {
    if (lockToMenu) {
      if (isCompact && mobileCatId) backToCategories();
      return;
    }
    navigate('/');
  };

  return (
    <div className={`mp${theme === 'dark' ? ' mp-theme-dark' : ''}`} style={{ '--accent': accent }}>

      {/* ── Header ── */}
      <header className="mp-header">
        <div className="mp-header-inner">
          {!(lockToMenu && !(isCompact && mobileCatId)) && (
            <button
              className="mp-icon-btn"
              onClick={onHeaderBack}
              aria-label={lockToMenu ? 'Back to categories' : 'Back to home'}
            >
              <IconBack />
            </button>
          )}
          <img
            src={toplogo}
            alt="GetMenuCard"
            className={`mp-header-logo${lockToMenu ? ' is-static' : ''}`}
            onClick={lockToMenu ? undefined : () => navigate('/')}
          />
          <div className="mp-header-name">{restaurant.name}</div>
          <div className="mp-header-actions">
            {isMapsLink(restaurant.location) && (
              <button
                className="mp-maps-btn"
                onClick={() => window.open(normalizeMapsUrl(restaurant.location), '_blank', 'noopener,noreferrer')}
                title="Open in Google Maps"
              >
                <IconPin size={14} /> <span>Directions</span>
              </button>
            )}
            <button
              type="button"
              className="mp-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button className="mp-review-btn" onClick={() => navigate(`/menu/${restaurantId}/review`)}>
              <IconStar size={13} /> <span>Rate us</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Cover ── */}
      <section className={`mp-cover${brandedCover ? ' mp-cover-branded' : ''}`}>
        <img src={cover} alt={restaurant.name} className="mp-cover-img" />
        <div className="mp-cover-shade" />
        <div className="mp-cover-inner">
          {!brandedCover && (
            <>
              <span className="mp-cover-badge">{restaurant.emoji} {restaurant.tagline}</span>
              <h1 className="mp-cover-name">{restaurant.name}</h1>
            </>
          )}
          {brandedCover && <h1 className="sr-only">{restaurant.name}</h1>}
          {!brandedCover && (isMapsLink(restaurant.location) ? (
            <button
              type="button"
              className="mp-cover-location"
              onClick={() => window.open(normalizeMapsUrl(restaurant.location), '_blank', 'noopener,noreferrer')}
              title={restaurant.address || 'Open in Google Maps'}
            >
              <IconPin size={14} />
              {restaurant.address?.trim() || 'Get directions'}
            </button>
          ) : (restaurant.address || restaurant.location)?.trim() ? (
            <div className="mp-cover-location">
              <IconPin size={14} />
              {restaurant.address?.trim() || restaurant.location}
            </div>
          ) : null)}
          <div className="mp-cover-meta">
            <span><strong>{allItems.length}</strong> dishes</span>
            <span className="mp-sep" />
            <span><strong>{categories.length}</strong> categories</span>
            <span className="mp-sep" />
            <span><VegMark tag="Veg" size={12} /> <strong>{vegCount}</strong> veg options</span>
          </div>
        </div>
      </section>

      {/* ── Toolbar (search + quick filters + mobile chips) ── */}
      <div className="mp-toolbar">
        <div className="mp-toolbar-inner">
          <div className="mp-search">
            <IconSearch />
            <input
              placeholder={`Search ${restaurant.name}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search dishes"
            />
            {search && <button className="mp-search-clear" onClick={() => setSearch('')} aria-label="Clear search"><IconClose /></button>}
          </div>
          <button
            className={`mp-toggle${filterTag === 'Veg' ? ' is-on' : ''}`}
            onClick={() => setFilterTag(t => (t === 'Veg' ? 'all' : 'Veg'))}
            aria-pressed={filterTag === 'Veg'}
          >
            <span className="mp-toggle-track"><span className="mp-toggle-thumb" /></span>
            Veg<span className="mp-hide-sm"> only</span>
          </button>
          <button className={`mp-filter-btn${filtersActive ? ' is-on' : ''}`} onClick={() => setFilterSheetOpen(true)} aria-label="Filters">
            <IconFilter /><span className="mp-hide-sm">Filters</span>
            {filtersActive > 0 && <span className="mp-filter-count">{filtersActive}</span>}
          </button>
        </div>

        {!query && !showCategoryHome && sections.length > 0 && (
          <div className="mp-chips" ref={chipBarRef}>
            {sections.map(s => (
              <button
                key={s.id}
                ref={el => { chipRefs.current[s.id] = el; }}
                className={`mp-chip${currentCat === s.id ? ' is-active' : ''}`}
                onClick={() => jumpTo(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mp-layout">

        {/* ── Desktop category index ── */}
        <aside className="mp-index">
          <div className="mp-index-card">
            <div className="mp-index-title">On the menu</div>
            {query ? (
              <p className="mp-index-note">Showing search results. Clear the search to browse by category.</p>
            ) : (
              <ol className="mp-index-list">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <button className={currentCat === s.id ? 'is-active' : ''} onClick={() => jumpTo(s.id)}>
                      <span className="mp-index-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="mp-index-name">{s.name}</span>
                      <span className="mp-index-leader" />
                      <span className="mp-index-count">{s.items.length}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {filtersActive > 0 && (
              <button className="mp-index-clear" onClick={clearFilters}>Clear all filters</button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="mp-main">

          {picks.length > 0 && (
            <section className="mp-picks">
              <div className="mp-picks-head">
                <div className="mp-picks-head-text">
                  <h2>Chef’s <em>picks</em></h2>
                  <span>Most loved by guests</span>
                </div>
                <div className="mp-picks-arrows" aria-label="Scroll chef’s picks">
                  <button
                    type="button"
                    className="mp-picks-arrow"
                    onClick={() => scrollPicks(-1)}
                    disabled={!picksScroll.left}
                    aria-label="Previous picks"
                  >
                    <IconChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="mp-picks-arrow"
                    onClick={() => scrollPicks(1)}
                    disabled={!picksScroll.right}
                    aria-label="Next picks"
                  >
                    <IconChevronRight />
                  </button>
                </div>
              </div>
              <div className="mp-picks-row" ref={picksRowRef}>
                {picks.map(item => (
                  <button key={`${item.categoryId}-${item.id}`} className="mp-pick" onClick={() => openItem(item)}>
                    <div className="mp-pick-img">
                      <FoodImage name={item.name} image={item.image} fallback={restaurant.emoji} />
                      <span className="mp-pick-price">₹{item.price}</span>
                    </div>
                    <div className="mp-pick-name"><VegMark tag={item.tag} size={12} /> {item.name}</div>
                    <div className="mp-pick-cat">{item.categoryName}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Mobile / tablet: category list first */}
          {showCategoryHome && (
            <section className="mp-cat-browse" aria-label="Menu categories">
              <div className="mp-cat-browse-head">
                <h2>Browse <em>menu</em></h2>
                <span>{sections.length} categories</span>
              </div>
              <ol className="mp-cat-browse-list">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" className="mp-cat-browse-item" onClick={() => jumpTo(s.id)}>
                      <span className="mp-cat-browse-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="mp-cat-browse-body">
                        <span className="mp-cat-browse-name">{s.name}</span>
                        <span className="mp-cat-browse-meta">{s.items.length} {s.items.length === 1 ? 'dish' : 'dishes'}</span>
                      </span>
                      <span className="mp-cat-browse-chevron" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {isCompact && mobileSection && (
            <div className="mp-cat-back-bar">
              <button type="button" className="mp-cat-back" onClick={backToCategories}>
                <IconBack /> All categories
              </button>
            </div>
          )}

          {!showCategoryHome && sections.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-icon"><IconSearch /></div>
              <div className="mp-empty-title">Nothing matches that</div>
              <p>Try a different dish name or loosen your filters.</p>
              <button className="mp-btn-dark" onClick={clearFilters}>Reset search &amp; filters</button>
            </div>
          ) : !showCategoryHome && (
            (isCompact ? compactSections : sections).map((s, idx) => (
              <section
                key={s.id}
                className="mp-section"
                data-cat={s.id}
                ref={el => { sectionRefs.current[s.id] = el; }}
              >
                <div className="mp-section-head">
                  {!query && <span className="mp-section-num">{String((isCompact ? sections.findIndex((x) => x.id === s.id) : idx) + 1).padStart(2, '0')}</span>}
                  <h2 className="mp-section-title">{s.name}</h2>
                  <span className="mp-section-rule" />
                  <span className="mp-section-count">{s.items.length} {s.items.length === 1 ? 'dish' : 'dishes'}</span>
                </div>

                <div className="mp-grid">
                  {s.items.map(item => (
                    <article
                      key={`${s.id}-${item.id}`}
                      className="dish"
                      onClick={() => openItem({ ...item, categoryId: item.categoryId || s.id, categoryName: item.categoryName || s.name })}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && openItem({ ...item, categoryId: item.categoryId || s.id, categoryName: item.categoryName || s.name })}
                    >
                      <div className="dish-info">
                        <div className="dish-top">
                          <VegMark tag={item.tag} />
                          {item.popular && <span className="dish-best"><IconStar size={11} /> Bestseller</span>}
                        </div>
                        <h3 className="dish-name">{item.name}</h3>
                        <div className="dish-price">₹{item.price}</div>
                        {item.desc && <p className="dish-desc">{item.desc}</p>}
                      </div>
                      <div className="dish-media">
                        <FoodImage name={item.name} image={item.image} fallback={restaurant.emoji} />
                        <span className="dish-view">View</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}

          {filtersActive > 0 && sections.length > 0 && (
            <div className="mp-filter-note">
              Showing {shownCount} of {allItems.length} dishes · <button onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {/* ── Review prompt ── */}
          <section className="mp-review-card">
            <div>
              <div className="mp-review-stars">{[0, 1, 2, 3, 4].map(i => <IconStar key={i} size={18} />)}</div>
              <h2>Enjoyed your meal?</h2>
              <p>Rate {restaurant.name} in a few taps — it helps other guests too.</p>
            </div>
            <button className="mp-btn-accent" onClick={() => navigate(`/menu/${restaurantId}/review`)}>
              Rate this restaurant
            </button>
          </section>

          <footer className="mp-powered">
            {lockToMenu ? (
              <>
                <span className="mp-powered-brand is-static">
                  <img src={toplogo} alt="GetMenuCard" />
                </span>
                Digital menu by <span>GetMenuCard</span>
              </>
            ) : (
              <>
                <button type="button" className="mp-powered-brand" onClick={() => navigate('/')}>
                  <img src={toplogo} alt="GetMenuCard" />
                </button>
                Digital menu by <button type="button" onClick={() => navigate('/')}>GetMenuCard</button>
              </>
            )}
          </footer>
        </main>
      </div>

      {/* ── Dish detail ── */}
      {selectedItem && (
        <div className="sheet-overlay" onClick={() => setSelectedItem(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={selectedItem.name}>
            <div className="sheet-img">
              <FoodImage name={selectedItem.name} image={selectedItem.image} fallback={restaurant.emoji} />
              <button className="sheet-close" onClick={() => setSelectedItem(null)} aria-label="Close"><IconClose /></button>
              <div className="sheet-handle" />
            </div>
            <div className="sheet-body">
              <div className="sheet-tags">
                <span className={`sheet-tag ${selectedItem.tag === 'Veg' ? 'is-veg' : 'is-nonveg'}`}>
                  <VegMark tag={selectedItem.tag} size={12} /> {selectedItem.tag}
                </span>
                {selectedItem.popular && <span className="sheet-tag is-best"><IconStar size={11} /> Bestseller</span>}
                {selectedItem.categoryName && <span className="sheet-tag">{selectedItem.categoryName}</span>}
              </div>
              <div className="sheet-title-row">
                <h2 className="sheet-name">{selectedItem.name}</h2>
                <div className="sheet-price">₹{selectedItem.price}</div>
              </div>
              {selectedItem.desc && <p className="sheet-desc">{selectedItem.desc}</p>}

              {related.length > 0 && (
                <div className="sheet-related">
                  <div className="sheet-related-title">More from {selectedItem.categoryName}</div>
                  {related.map(r => (
                    <button key={r.id} className="sheet-related-item" onClick={() => openItem(r)}>
                      <span className="sheet-related-img"><FoodImage name={r.name} image={r.image} fallback={restaurant.emoji} /></span>
                      <span className="sheet-related-name"><VegMark tag={r.tag} size={11} /> {r.name}</span>
                      <span className="sheet-related-price">₹{r.price}</span>
                    </button>
                  ))}
                </div>
              )}

              <p className="sheet-note">Ask your server to place an order.</p>
            </div>
          </div>
        </div>
      )}

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        sortBy={sortBy} setSortBy={setSortBy}
        filterTag={filterTag} setFilterTag={setFilterTag}
        priceRange={priceRange}
        setPriceRange={r => setCustomRange(r[0] === 0 && r[1] === maxPrice ? null : r)}
        maxPrice={maxPrice}
        itemCount={shownCount}
      />
    </div>
  );
}
