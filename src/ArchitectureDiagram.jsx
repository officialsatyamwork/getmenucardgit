import './ArchitectureDiagram.css';

const Arrow = ({ color = 'default', height = 18 }) => (
  <div className={`arrow ${color}`}>
    <div className="arrow-line" style={{ height }} />
    <div className="arrow-head" />
  </div>
);

const Card = ({ title, icon, items = [], className = '', dotColor, itemBg }) => (
  <div className={`card ${className}`}>
    <div className="card-title">
      <span className="icon">{icon}</span>
      {title}
    </div>
    {items.length > 0 && (
      <div className="card-body">
        {items.map((item, i) => (
          <div key={i} className="card-item" style={itemBg ? { background: itemBg } : {}}>
            <span className="dot" style={dotColor ? { background: dotColor } : {}} />
            {item}
          </div>
        ))}
      </div>
    )}
  </div>
);

const restaurants = [
  { name: 'Royal Bistro', emoji: '👑' },
  { name: 'Spice House', emoji: '🌶️' },
  { name: 'Green Leaf', emoji: '🌿' },
  { name: 'Tasty Bites', emoji: '🍴' },
];

export default function ArchitectureDiagram() {
  return (
    <div className="diagram-wrapper">
      {/* Header */}
      <div className="diagram-header">
        <div className="diagram-title">
          <span>MenuCard</span> — V1 Product Architecture
        </div>
        <div className="diagram-subtitle">QR Digital Menu + Google Review Analytics Platform</div>
        <div className="version-badge">⚡ Version 1 · Customer View Only</div>
      </div>

      {/* Main Canvas */}
      <div className="canvas">

        {/* ── LEFT: Admin Dashboard ── */}
        <div className="col-admin">
          <div className="section-label" style={{ color: '#8b5cf6' }}>🔒 Internal Admin</div>
          <div className="admin-badge">🔐 Internal Only</div>
          <Card
            className="admin-card"
            icon="📊"
            title="MenuCard Admin Dashboard"
            items={[
              'Total QR Scans',
              'Total Visitors',
              'Unique Visitors',
              'Returning Visitors',
              'Menu Views',
              'Food Item Views',
              'Google Review QR Scans',
              'Restaurant-wise Analytics',
              'Daily / Weekly / Monthly Trends',
            ]}
          />
          <Arrow color="purple" height={24} />
          <div className="flow-label">Analytics Events</div>
          <Arrow color="purple" height={24} />
          <div style={{ width: '100%' }}>
            <Card
              className="card"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10 }}
              icon="📡"
              title="MenuCard Analytics Engine"
              items={['Captures all customer events', 'Aggregates per restaurant']}
            />
          </div>
          <Arrow color="purple" height={24} />
          <div className="flow-label">Events Flow ↓</div>
        </div>

        {/* ── CENTER: Platform + Customer Flow ── */}
        <div className="col-center">

          {/* Platform */}
          <div className="section-label" style={{ color: '#f97316' }}>⚙️ Core Platform</div>
          <Card
            className="platform-card"
            icon="🟠"
            title="MenuCard Platform"
            items={[]}
          />
          <div className="platform-card card" style={{
            background: 'linear-gradient(135deg,#1c2333,#161d2e)',
            border: '2px solid rgba(249,115,22,0.5)',
            boxShadow: '0 0 40px rgba(249,115,22,0.15)',
            borderRadius: 12,
            padding: '8px 16px',
            width: '100%',
            maxWidth: 340,
            marginTop: -8,
          }}>
            <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.6 }}>
              Central hub · Routes QR scans · Serves menus · Tracks analytics
            </div>
          </div>

          <Arrow color="accent" height={20} />

          {/* Menu Data */}
          <div className="section-label" style={{ color: '#6366f1' }}>🗄️ Menu Data</div>
          <Card
            className="menu-data-card"
            icon="📋"
            title="Menu Data Store"
            items={[
              'Restaurant Info',
              'Categories',
              'Food Items',
              'Food Images',
              'Food Prices',
              'Food Descriptions',
              'Availability Status',
            ]}
          />

          <Arrow color="blue" height={20} />

          {/* Customer */}
          <div className="section-label" style={{ color: '#3b82f6' }}>👤 Customer Journey</div>
          <Card
            className="customer-card"
            icon="👤"
            title="Customer Scans QR Code"
            items={[]}
          />

          <Arrow color="blue" height={14} />

          {/* QR Split */}
          <div className="qr-split">
            {/* Menu QR Branch */}
            <div className="qr-branch">
              <div className="qr-tag qr-tag-menu">📷 Menu QR</div>
              <Arrow color="blue" height={14} />
              <Card
                className="card qr-card qr-card-menu"
                icon="📱"
                title="MenuCard Web App"
                items={[]}
              />
              <Arrow color="blue" height={12} />
              <div style={{
                fontSize: 10, fontWeight: 600, color: '#60a5fa',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: 8, padding: '4px 10px', textAlign: 'center', width: '100%'
              }}>🔍 Identify Restaurant</div>
              <Arrow color="blue" height={12} />
              <Card
                className="card menu-result-card"
                icon="🍽️"
                title="Restaurant Menu"
                items={['Categories', 'Food Items', 'Food Details', 'Prices & Images']}
              />
            </div>

            {/* Google Review QR Branch */}
            <div className="qr-branch">
              <div className="qr-tag qr-tag-review">⭐ Review QR</div>
              <Arrow color="green" height={14} />
              <div style={{
                fontSize: 10, fontWeight: 600, color: '#34d399',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 8, padding: '4px 8px', textAlign: 'center', width: '100%'
              }}>🌐 Google Review Page</div>
              <Arrow color="green" height={12} />
              <Card
                className="card google-result-card"
                icon="⭐"
                title="Customer Leaves Review"
                items={['Star Rating', 'Written Review', 'Posted on Google']}
              />
              <Arrow color="green" height={12} />
              <div style={{
                fontSize: 10, fontWeight: 600, color: '#34d399',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 8, padding: '4px 8px', textAlign: 'center', width: '100%'
              }}>✅ Review Scan Tracked</div>
            </div>
          </div>

          <Arrow color="accent" height={16} />

          {/* Analytics Events */}
          <div className="events-strip">
            <div className="events-strip-title">📡 Analytics Events Captured</div>
            <div className="events-row">
              {['QR Scanned', 'Menu Opened', 'Category Browsed', 'Food Viewed', 'Review QR Scanned'].map(e => (
                <div key={e} className="event-chip">{e}</div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT: Restaurants ── */}
        <div className="col-restaurants">
          <div className="section-label" style={{ color: '#fbbf24' }}>🏪 Restaurants</div>
          <div className="restaurants-section">
            {restaurants.map((r) => (
              <div key={r.name} className="restaurant-block">
                <Card
                  className="restaurant-card"
                  icon={r.emoji}
                  title={r.name}
                  items={[]}
                />
                <Arrow height={10} />
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <div className="qr-tag qr-tag-menu" style={{ flex: 1, justifyContent: 'center' }}>
                    📷 Menu QR
                  </div>
                  <div className="qr-tag qr-tag-review" style={{ flex: 1, justifyContent: 'center' }}>
                    ⭐ Review QR
                  </div>
                </div>
                <Arrow height={10} />
                <div style={{
                  fontSize: 10, color: '#9ca3af', fontWeight: 500,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '4px 12px', width: '100%', textAlign: 'center'
                }}>
                  Connected to MenuCard Platform
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{
            marginTop: 20,
            padding: '10px 14px',
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 10,
            width: '100%',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
              ⚠️ V1 Scope — Not Included
            </div>
            {['Restaurant Owner Login', 'Owner Dashboard', 'POS / KOT', 'Order Management', 'Inventory', 'Payments'].map(item => (
              <div key={item} style={{ fontSize: 10, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ color: '#ef4444' }}>✕</span> {item}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="legend">
        {[
          { color: '#8b5cf6', label: 'Admin / Internal' },
          { color: '#f97316', label: 'MenuCard Platform' },
          { color: '#3b82f6', label: 'Customer / Menu Flow' },
          { color: '#10b981', label: 'Google Review Flow' },
          { color: '#6366f1', label: 'Menu Data' },
          { color: '#fbbf24', label: 'Restaurants' },
        ].map(({ color, label }) => (
          <div key={label} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
