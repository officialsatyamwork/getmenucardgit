import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants } from './restaurantStore';



function getMockData() {
  const ev = JSON.parse(localStorage.getItem('mc_events') || '[]');
  const base = {
    totalScans:      1284 + ev.filter(e => e.type === 'qr_scan').length,
    totalVisitors:   1102 + ev.filter(e => e.type === 'menu_open').length,
    uniqueVisitors:  874,
    returning:       228,
    menuViews:       3421 + ev.filter(e => e.type === 'menu_open').length,
    foodViews:       8934 + ev.filter(e => e.type === 'food_view').length,
    reviewScans:     312  + ev.filter(e => e.type === 'review_qr_scan').length,
  };
  const perR = {
    'brew-and-bites': { scans:521, visitors:489, menuViews:1340, reviewScans:112 },
    'royal-bistro':   { scans:412, visitors:389, menuViews:1102, reviewScans:98  },
    'spice-house':    { scans:378, visitors:341, menuViews:987,  reviewScans:87  },
    'green-leaf':     { scans:289, visitors:261, menuViews:743,  reviewScans:72  },
    'tasty-bites':    { scans:205, visitors:111, menuViews:589,  reviewScans:55  },
  };
  ev.forEach(e => {
    if (e.restaurant && perR[e.restaurant]) {
      if (e.type === 'qr_scan')        perR[e.restaurant].scans++;
      if (e.type === 'menu_open')      perR[e.restaurant].visitors++;
      if (e.type === 'food_view')      perR[e.restaurant].menuViews++;
      if (e.type === 'review_qr_scan') perR[e.restaurant].reviewScans++;
    }
  });
  const trend = [
    { day:'Mon', scans:142 }, { day:'Tue', scans:189 }, { day:'Wed', scans:167 },
    { day:'Thu', scans:210 }, { day:'Fri', scans:248 }, { day:'Sat', scans:312 },
    { day:'Sun', scans:276 },
  ];
  return { base, perR, trend };
}

const C = {
  bg:      '#fbf7f1',
  bgAlt:   '#f4ece1',
  bgCard:  '#ffffff',
  border:  '#ece3d6',
  borderD: '#ddd0bd',
  esp:     '#1d1b19',
  brown:   '#34302b',
  gold:    '#e8730f',
  goldL:   '#f6a25a',
  t2:      '#5a544c',
  t3:      '#8b8378',
  t4:      '#b8aea1',
};

const pill = (bg, color, border) => ({
  display:'inline-flex', alignItems:'center', gap:6,
  padding:'4px 12px', borderRadius:50,
  background:bg, color, border:`1px solid ${border}`,
  fontSize:11, fontWeight:700, letterSpacing:0.3,
});

const statColors = ['#e8730f','#2e7d32','#34302b','#c0392b','#5a544c','#8b8378','#1d1b19'];

function StatCard({ icon, label, value, color, sub, trend }) {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 22px',
      borderTop: `3px solid ${color}`,
      boxShadow: '0 1px 4px rgba(29,27,25,0.06)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{
          width:40, height:40, borderRadius:10,
          background:`${color}14`, border:`1px solid ${color}28`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
        }}>{icon}</div>
        {trend && (
          <span style={{ fontSize:11, fontWeight:700, color:'#2e7d32',
            background:'rgba(46,125,50,0.08)', border:'1px solid rgba(46,125,50,0.2)',
            borderRadius:20, padding:'2px 8px' }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:30, fontWeight:700, color, lineHeight:1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize:13, color:C.t2, marginTop:6, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.t3, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [tab, setTab]         = useState('overview');
  const [authed, setAuthed]   = useState(false);
  const [pin, setPin]         = useState('');
  const [pinErr, setPinErr]   = useState(false);

  useEffect(() => { setData(getMockData()); }, []);

  const handlePin = () => {
    if (pin === '1234') { setAuthed(true); setPinErr(false); }
    else { setPinErr(true); setPin(''); }
  };

  /* ── PIN Screen ── */
  if (!authed) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{
        background:C.bgCard, border:`1px solid ${C.border}`,
        borderRadius:24, padding:'40px 32px',
        width:'100%', maxWidth:380,
        boxShadow:'0 8px 40px rgba(29,27,25,0.12)',
        display:'flex', flexDirection:'column', gap:16, textAlign:'center',
      }}>
        <div style={{ fontSize:48 }}>🔐</div>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:C.esp }}>Admin Access</h2>
          <p style={{ fontSize:13, color:C.t3, marginTop:6 }}>MenuCard Internal Analytics Dashboard</p>
        </div>
        <input
          type="password" placeholder="Enter PIN (1234)"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePin()}
          style={{
            background:C.bg, border:`1.5px solid ${pinErr ? '#c0392b' : C.border}`,
            borderRadius:12, padding:'13px 16px',
            color:C.esp, fontSize:16, textAlign:'center',
            letterSpacing:8, outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif",
            transition:'border-color 0.2s',
          }}
        />
        {pinErr && <p style={{ color:'#c0392b', fontSize:12, marginTop:-8 }}>Incorrect PIN</p>}
        <button
          onClick={handlePin}
          style={{
            background:C.esp, border:'none', borderRadius:12,
            padding:'13px', color:'#fff', fontWeight:700, fontSize:14,
            transition:'background 0.2s',
          }}
        >
          Enter Dashboard →
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ background:'none', border:'none', color:C.t3, fontSize:13, cursor:'pointer' }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );

  if (!data) return null;
  const { base, perR, trend } = data;
  const maxT = Math.max(...trend.map(t => t.scans));

  const TABS = [
    { id:'overview',     label:'📊 Overview'     },
    { id:'restaurants',  label:'🏪 Restaurants'  },
    { id:'trends',       label:'📈 Trends'       },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── Top Bar ── */}
      <div style={{
        background:C.bgCard, borderBottom:`1px solid ${C.border}`,
        boxShadow:'0 1px 0 #ece3d6', position:'sticky', top:0, zIndex:40,
      }}>
        <div style={{
          maxWidth:1100, margin:'0 auto', padding:'0 24px',
          height:64, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
        }}>
          <div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:C.esp }}>
              🍽 Menu<span style={{ color:C.gold }}>Card</span>
              <span style={{ fontSize:13, fontWeight:400, color:C.t3, marginLeft:8 }}>Admin</span>
            </div>
            <div style={{ fontSize:11, color:C.t4, marginTop:1 }}>Internal Analytics · V1</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={pill('rgba(46,125,50,0.08)','#2e7d32','rgba(46,125,50,0.2)')}>● Live</span>
            <button
              onClick={() => navigate('/')}
              style={{
                padding:'8px 16px', background:C.bg,
                border:`1px solid ${C.border}`, borderRadius:10,
                color:C.t2, fontSize:12, fontWeight:600, transition:'all 0.2s',
              }}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 60px' }}>

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:'9px 20px', borderRadius:10, fontSize:13, fontWeight:600,
                border:`1.5px solid ${tab === t.id ? C.esp : C.border}`,
                background: tab === t.id ? C.esp : C.bgCard,
                color: tab === t.id ? '#fff' : C.t2,
                transition:'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
            gap:16,
          }}>
            <StatCard icon="📷" label="Total QR Scans"     value={base.totalScans}     color={statColors[0]} trend="+12%" />
            <StatCard icon="👥" label="Total Visitors"     value={base.totalVisitors}  color={statColors[1]} trend="+8%"  />
            <StatCard icon="👤" label="Unique Visitors"    value={base.uniqueVisitors} color={statColors[2]} />
            <StatCard icon="🔄" label="Returning Visitors" value={base.returning}      color={statColors[3]} />
            <StatCard icon="🍽️" label="Menu Views"         value={base.menuViews}      color={statColors[4]} trend="+21%" />
            <StatCard icon="🍔" label="Food Item Views"    value={base.foodViews}      color={statColors[5]} />
            <StatCard icon="⭐" label="Review QR Scans"    value={base.reviewScans}    color={statColors[6]} sub="Google redirects" trend="+5%" />
          </div>
        )}

        {/* ── Restaurants ── */}
        {tab === 'restaurants' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {getAllRestaurants().map(r => {
              const d = perR[r.id] || { scans:0, visitors:0, menuViews:0, reviewScans:0 };
              return (
                <div key={r.id} style={{
                  background:C.bgCard, border:`1px solid ${C.border}`,
                  borderRadius:16, overflow:'hidden',
                  boxShadow:'0 1px 4px rgba(29,27,25,0.05)',
                }}>
                  <div style={{
                    height:4, background:r.accent,
                  }} />
                  <div style={{ padding:'18px 22px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
                      <span style={{ fontSize:28 }}>{r.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:r.accent }}>{r.name}</div>
                        <div style={{ fontSize:12, color:C.t3, fontStyle:'italic' }}>{r.tagline}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/menu/${r.id}`)}
                        style={{
                          padding:'7px 14px',
                          background:`${r.accent}14`, border:`1px solid ${r.accent}40`,
                          borderRadius:8, color:r.accent,
                          fontSize:12, fontWeight:700, transition:'all 0.2s',
                        }}
                      >
                        View Menu →
                      </button>
                    </div>
                    <div style={{
                      display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))',
                      gap:10,
                    }}>
                      {[
                        { label:'QR Scans',     val:d.scans,       icon:'📷' },
                        { label:'Visitors',     val:d.visitors,    icon:'👥' },
                        { label:'Menu Views',   val:d.menuViews,   icon:'🍽️' },
                        { label:'Review Scans', val:d.reviewScans, icon:'⭐' },
                      ].map(m => (
                        <div key={m.label} style={{
                          background:C.bg, border:`1px solid ${C.border}`,
                          borderRadius:10, padding:'12px 14px', textAlign:'center',
                        }}>
                          <div style={{ fontSize:18 }}>{m.icon}</div>
                          <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:r.accent, marginTop:4 }}>{m.val}</div>
                          <div style={{ fontSize:10, color:C.t3, marginTop:2, fontWeight:500 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Trends ── */}
        {tab === 'trends' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{
              background:C.bgCard, border:`1px solid ${C.border}`,
              borderRadius:16, padding:'24px',
              boxShadow:'0 1px 4px rgba(29,27,25,0.05)',
            }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:C.esp, marginBottom:24 }}>
                Weekly QR Scans
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
                {trend.map(t => (
                  <div key={t.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:11, color:C.gold, fontWeight:700 }}>{t.scans}</div>
                    <div style={{
                      width:'100%', borderRadius:'6px 6px 0 0',
                      background:`linear-gradient(to top, ${C.esp}, ${C.brown})`,
                      height:`${(t.scans / maxT) * 120}px`, minHeight:8,
                      transition:'height 0.4s ease',
                    }} />
                    <div style={{ fontSize:11, color:C.t3, fontWeight:500 }}>{t.day}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
              gap:14,
            }}>
              {[
                { label:'Best Day',      value:'Saturday · 312 scans', icon:'🏆', color:C.gold  },
                { label:'Weekly Total',  value:`${trend.reduce((a,b)=>a+b.scans,0)} scans`, icon:'📊', color:C.esp },
                { label:'Daily Average', value:`${Math.round(trend.reduce((a,b)=>a+b.scans,0)/7)} scans/day`, icon:'📅', color:C.brown },
                { label:'Growth',        value:'+18% vs last week', icon:'📈', color:'#2e7d32' },
              ].map(s => (
                <div key={s.label} style={{
                  background:C.bgCard, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:'18px 20px',
                  borderLeft:`3px solid ${s.color}`,
                  boxShadow:'0 1px 4px rgba(29,27,25,0.05)',
                }}>
                  <div style={{ fontSize:22, marginBottom:10 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, color:C.esp }}>{s.value}</div>
                  <div style={{ fontSize:12, color:C.t3, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
