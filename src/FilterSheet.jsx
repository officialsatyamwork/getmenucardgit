import { useState, useCallback } from 'react';
import './FilterSheet.css';

const CATEGORIES = ['Sort', 'Price', 'Type'];

const SORT_OPTIONS = [
  { val: 'default',    icon: '↕', label: 'Default'           },
  { val: 'popular',    icon: '★', label: 'Most Popular'      },
  { val: 'price_asc',  icon: '↑', label: 'Price: Low → High' },
  { val: 'price_desc', icon: '↓', label: 'Price: High → Low' },
];

const TYPE_OPTIONS = [
  { val: 'all',     icon: '🍽️', label: 'All Items'    },
  { val: 'Veg',     icon: '🟢', label: 'Veg Only'     },
  { val: 'Non-Veg', icon: '🔴', label: 'Non-Veg Only' },
];

export default function FilterSheet({ open, onClose, sortBy, setSortBy, filterTag, setFilterTag, priceRange, setPriceRange, maxPrice = 500, itemCount }) {
  const [activeTab, setActiveTab] = useState('Sort');

  const clearAll = () => {
    setSortBy('default');
    setFilterTag('all');
    setPriceRange([0, maxPrice]);
  };

  const step = maxPrice / 4;
  const presets = [0, 1, 2, 3].map(i => [Math.round(i * step / 10) * 10, Math.round((i + 1) * step / 10) * 10]);

  const handleMinPrice = useCallback((e) => {
    const val = Math.min(Number(e.target.value), priceRange[1] - 1);
    setPriceRange([val, priceRange[1]]);
  }, [priceRange, setPriceRange]);

  const handleMaxPrice = useCallback((e) => {
    const val = Math.max(Number(e.target.value), priceRange[0] + 1);
    setPriceRange([priceRange[0], val]);
  }, [priceRange, setPriceRange]);

  const minPct = (priceRange[0] / maxPrice) * 100;
  const maxPct = (priceRange[1] / maxPrice) * 100;

  const hasSort    = sortBy !== 'default';
  const hasPrice   = priceRange[0] !== 0 || priceRange[1] !== maxPrice;
  const hasType    = filterTag !== 'all';
  const totalActive = (hasSort ? 1 : 0) + (hasPrice ? 1 : 0) + (hasType ? 1 : 0);

  if (!open) return null;

  return (
    <div className="fs-overlay" onClick={onClose}>
      <div className="fs-sheet" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="fs-header">
          <span className="fs-title">Filters</span>
          {totalActive > 0 && <span className="fs-badge">{totalActive}</span>}
          <button className="fs-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="fs-body">

          {/* Left sidebar */}
          <div className="fs-sidebar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`fs-cat${activeTab === cat ? ' fs-cat-active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
                {cat === 'Sort'  && hasSort  && <span className="fs-cat-dot" />}
                {cat === 'Price' && hasPrice && <span className="fs-cat-dot" />}
                {cat === 'Type'  && hasType  && <span className="fs-cat-dot" />}
              </button>
            ))}
          </div>

          <div className="fs-divider" />

          {/* Right content */}
          <div className="fs-content">

            {/* ── Sort ── */}
            {activeTab === 'Sort' && (
              <div className="fs-panel">
                <div className="fs-panel-title">Sort By</div>
                <div className="fs-option-list">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.val}
                      className={`fs-option${sortBy === opt.val ? ' fs-option-active' : ''}`}
                      onClick={() => setSortBy(opt.val)}
                    >
                      <span className="fs-option-label">{opt.label}</span>
                      <span className="fs-option-radio" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Price ── */}
            {activeTab === 'Price' && (
              <div className="fs-panel">
                <div className="fs-panel-title">Price Range</div>
                <div className="fs-price-display">
                  ₹{priceRange[0]} &ndash; ₹{priceRange[1]}
                </div>
                <div className="fs-slider-wrap">
                  <div className="fs-slider-track">
                    <div className="fs-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                  </div>
                  <input type="range" min="0" max={maxPrice} step="10" value={priceRange[0]} className="fs-range" onChange={handleMinPrice} />
                  <input type="range" min="0" max={maxPrice} step="10" value={priceRange[1]} className="fs-range" onChange={handleMaxPrice} />
                </div>
                <div className="fs-price-labels"><span>₹0</span><span>₹{maxPrice}</span></div>
                <div className="fs-price-presets">
                  {presets.map(([mn,mx]) => (
                    <button
                      key={`${mn}-${mx}`}
                      className={`fs-preset${priceRange[0] === mn && priceRange[1] === mx ? ' fs-preset-active' : ''}`}
                      onClick={() => setPriceRange([mn, mx])}
                    >
                      ₹{mn}–₹{mx}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Type ── */}
            {activeTab === 'Type' && (
              <div className="fs-panel">
                <div className="fs-panel-title">Food Type</div>
                <div className="fs-option-list">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.val}
                      className={`fs-option${filterTag === opt.val ? ' fs-option-active' : ''}`}
                      onClick={() => setFilterTag(opt.val)}
                    >
                      <span className="fs-option-label">{opt.label}</span>
                      <span className="fs-option-radio" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="fs-footer">
          <button className="fs-btn-clear" onClick={clearAll}>Clear all</button>
          <button className="fs-btn-show" onClick={onClose}>
            Show {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </button>
        </div>

      </div>
    </div>
  );
}
