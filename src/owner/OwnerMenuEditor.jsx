import { useEffect, useRef, useState } from 'react';
import { ownerApi } from './ownerApi';
import { publishRestaurant } from '../restaurantStore';
import './OwnerMenuEditor.css';

const NON_VEG = ['chicken', 'mutton', 'fish', 'prawn', 'egg', 'lamb', 'beef', 'pork', 'meat', 'keema', 'crab', 'shrimp'];

function detectTag(name) {
  return NON_VEG.some((k) => String(name || '').toLowerCase().includes(k)) ? 'Non-Veg' : 'Veg';
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function blankItem() {
  return {
    id: uid('i'),
    name: '',
    desc: '',
    price: '',
    tag: 'Veg',
    image: '',
    popular: false,
  };
}

function blankCat() {
  return { id: uid('cat'), name: '', icon: '🍽️', items: [blankItem()] };
}

function normalizeCategories(categories) {
  if (!Array.isArray(categories) || !categories.length) return [blankCat()];
  return categories.map((c) => ({
    id: c.id || uid('cat'),
    name: c.name || '',
    icon: c.icon || '🍽️',
    items: (c.items || []).length
      ? c.items.map((i) => ({
          id: i.id || uid('i'),
          name: i.name || '',
          desc: i.desc || '',
          price: i.price ?? '',
          tag: i.tag === 'Non-Veg' ? 'Non-Veg' : 'Veg',
          image: i.image || '',
          popular: Boolean(i.popular),
        }))
      : [blankItem()],
  }));
}

export default function OwnerMenuEditor({ restaurant, onSaved }) {
  const [categories, setCategories] = useState(() => normalizeCategories(restaurant?.categories));
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [openCats, setOpenCats] = useState(() => new Set((restaurant?.categories || []).map((c) => c.id)));
  const fileRefs = useRef({});

  useEffect(() => {
    setCategories(normalizeCategories(restaurant?.categories));
    setOpenCats(new Set((restaurant?.categories || []).map((c) => c.id)));
  }, [restaurant?.id, restaurant?.updatedAt]);

  const dishCount = categories.reduce((a, c) => a + c.items.filter((i) => i.name.trim()).length, 0);
  const catCount = categories.filter((c) => c.name.trim()).length;

  const toggleCat = (id) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCategory = () => {
    const cat = blankCat();
    setCategories((m) => [...m, cat]);
    setOpenCats((prev) => new Set([...prev, cat.id]));
  };

  const removeCategory = (catId) => {
    if (categories.length <= 1) return;
    if (!window.confirm('Delete this category and all its dishes?')) return;
    setCategories((m) => m.filter((c) => c.id !== catId));
  };

  const updateCat = (catId, patch) => {
    setCategories((m) => m.map((c) => (c.id === catId ? { ...c, ...patch } : c)));
  };

  const moveCat = (idx, dir) => {
    setCategories((m) => {
      const arr = [...m];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const addItem = (catId) => {
    setCategories((m) =>
      m.map((c) => (c.id === catId ? { ...c, items: [...c.items, blankItem()] } : c))
    );
    setOpenCats((prev) => new Set([...prev, catId]));
  };

  const removeItem = (catId, itemId) => {
    setCategories((m) =>
      m.map((c) => {
        if (c.id !== catId) return c;
        if (c.items.length <= 1) return c;
        return { ...c, items: c.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const updateItem = (catId, itemId, patch) => {
    setCategories((m) =>
      m.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) => {
                if (i.id !== itemId) return i;
                const next = { ...i, ...patch };
                if (patch.name !== undefined && !i._tagTouched) {
                  next.tag = detectTag(patch.name);
                }
                if (patch.tag !== undefined) next._tagTouched = true;
                return next;
              }),
            }
          : c
      )
    );
  };

  const setItemImage = (catId, itemId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      // Keep payload reasonable for API
      if (dataUrl.length > 900000) {
        setError('Image is too large. Try a smaller photo.');
        return;
      }
      updateItem(catId, itemId, { image: dataUrl });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const filtered = categories
    .map((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return c;
      const catMatch = c.name.toLowerCase().includes(q);
      const items = c.items.filter(
        (i) =>
          catMatch
          || i.name.toLowerCase().includes(q)
          || String(i.desc || '').toLowerCase().includes(q)
      );
      if (!catMatch && !items.length) return null;
      return { ...c, items: catMatch ? c.items : items };
    })
    .filter(Boolean);

  const saveMenu = async () => {
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const incomplete = [];
      for (const c of categories) {
        const catName = String(c.name || '').trim();
        for (const i of c.items || []) {
          const itemName = String(i.name || '').trim();
          const price = String(i.price ?? '').trim();
          const blank = !itemName && !price;
          if (blank) continue;
          if (!catName) incomplete.push('Name every category that has dishes');
          if (!itemName) incomplete.push(`Add a dish name in “${catName || 'Untitled'}”`);
          if (!price || Number.isNaN(Number(price))) incomplete.push(`Add a price for “${itemName || 'a dish'}”`);
          if (i.tag !== 'Veg' && i.tag !== 'Non-Veg') incomplete.push(`Pick Veg / Non-Veg for “${itemName || 'a dish'}”`);
        }
      }
      const uniqueIssues = [...new Set(incomplete)];
      if (uniqueIssues.length) {
        setError(uniqueIssues[0] + (uniqueIssues.length > 1 ? ` (+${uniqueIssues.length - 1} more)` : ''));
        setSaving(false);
        return;
      }

      const payload = {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || '🍽️',
          items: (c.items || []).map((i) => ({
            id: i.id,
            name: i.name,
            desc: i.desc,
            price: i.price,
            tag: i.tag,
            image: i.image,
            popular: i.popular,
          })),
        })),
      };
      const res = await ownerApi.updateMenu(payload);
      // Keep public localStorage menus in sync for guest pages
      if (res.restaurant) {
        publishRestaurant({
          ...res.restaurant,
          source: 'owner',
        });
      }
      setMsg('Menu saved — live for guests.');
      onSaved?.(res);
    } catch (err) {
      setError(err.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ome">
      <div className="ome-toolbar">
        <div>
          <h3>Menu</h3>
          <p>
            {catCount} categories · {dishCount} dishes — add, edit, reorder, or delete anytime.
          </p>
        </div>
        <div className="ome-toolbar-actions">
          <button type="button" className="od-btn" onClick={addCategory}>
            + Category
          </button>
          <button type="button" className="od-btn od-btn-primary" onClick={saveMenu} disabled={saving}>
            {saving ? 'Saving…' : 'Save menu'}
          </button>
        </div>
      </div>

      <div className="ome-search-row">
        <input
          type="search"
          className="ome-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes or categories"
          aria-label="Search menu"
        />
        {restaurant?.id && (
          <button
            type="button"
            className="od-btn"
            onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}
          >
            Preview live menu
          </button>
        )}
      </div>

      {error && <div className="od-error">{error}</div>}
      {msg && <div className="ome-success">{msg}</div>}

      <div className="ome-list">
        {!filtered.length && (
          <div className="od-empty">No dishes match your search.</div>
        )}

        {filtered.map((cat) => {
          const full = categories.find((c) => c.id === cat.id) || cat;
          const idx = categories.findIndex((c) => c.id === cat.id);
          const open = openCats.has(full.id) || Boolean(query.trim());

          return (
            <section className="ome-cat" key={full.id}>
              <div className="ome-cat-head">
                <button type="button" className="ome-cat-toggle" onClick={() => toggleCat(full.id)}>
                  {open ? '▾' : '▸'}
                </button>
                <input
                  className="ome-cat-name"
                  value={full.name}
                  onChange={(e) => updateCat(full.id, { name: e.target.value })}
                  placeholder="Category name (e.g. Starters)"
                />
                <span className="ome-cat-count">{full.items.filter((i) => i.name.trim()).length}</span>
                <div className="ome-cat-actions">
                  <button type="button" className="ome-icon-btn" title="Move up" onClick={() => moveCat(idx, -1)}>↑</button>
                  <button type="button" className="ome-icon-btn" title="Move down" onClick={() => moveCat(idx, 1)}>↓</button>
                  <button type="button" className="ome-icon-btn danger" title="Delete category" onClick={() => removeCategory(full.id)}>✕</button>
                </div>
              </div>

              {open && (
                <div className="ome-items">
                  {(query.trim() ? cat.items : full.items).map((item) => {
                    const real = full.items.find((i) => i.id === item.id) || item;
                    return (
                      <article className="ome-item" key={real.id}>
                        <button
                          type="button"
                          className="ome-thumb"
                          onClick={() => fileRefs.current[real.id]?.click()}
                          title="Add photo"
                        >
                          {real.image ? (
                            <img src={real.image} alt="" />
                          ) : (
                            <span>+</span>
                          )}
                        </button>
                        <input
                          ref={(el) => { fileRefs.current[real.id] = el; }}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => setItemImage(full.id, real.id, e.target.files?.[0])}
                        />

                        <div className="ome-item-fields">
                          <div className="ome-item-row">
                            <input
                              className="ome-input grow"
                              value={real.name}
                              onChange={(e) => updateItem(full.id, real.id, { name: e.target.value })}
                              placeholder="Dish name"
                            />
                            <input
                              className="ome-input price"
                              type="number"
                              min="0"
                              step="1"
                              value={real.price}
                              onChange={(e) => updateItem(full.id, real.id, { price: e.target.value })}
                              placeholder="₹"
                            />
                          </div>
                          <input
                            className="ome-input"
                            value={real.desc}
                            onChange={(e) => updateItem(full.id, real.id, { desc: e.target.value })}
                            placeholder="Short description (optional)"
                          />
                          <div className="ome-item-meta">
                            <div className="ome-tags">
                              {['Veg', 'Non-Veg'].map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={`ome-tag${real.tag === tag ? ' is-on' : ''}${tag === 'Non-Veg' ? ' nonveg' : ''}`}
                                  onClick={() => updateItem(full.id, real.id, { tag })}
                                >
                                  {tag}
                                </button>
                              ))}
                              <button
                                type="button"
                                className={`ome-tag popular${real.popular ? ' is-on' : ''}`}
                                onClick={() => updateItem(full.id, real.id, { popular: !real.popular })}
                              >
                                Popular
                              </button>
                            </div>
                            <div className="ome-item-actions">
                              {real.image && (
                                <button
                                  type="button"
                                  className="ome-link"
                                  onClick={() => updateItem(full.id, real.id, { image: '' })}
                                >
                                  Remove photo
                                </button>
                              )}
                              <button
                                type="button"
                                className="ome-link danger"
                                onClick={() => {
                                  if (full.items.length <= 1) return;
                                  if (window.confirm(`Delete “${real.name || 'this dish'}”?`)) {
                                    removeItem(full.id, real.id);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  <button type="button" className="ome-add-item" onClick={() => addItem(full.id)}>
                    + Add dish
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="ome-footer">
        <button type="button" className="od-btn" onClick={addCategory}>
          + Add category
        </button>
        <button type="button" className="od-btn od-btn-primary" onClick={saveMenu} disabled={saving}>
          {saving ? 'Saving…' : 'Save menu'}
        </button>
      </div>
    </div>
  );
}
