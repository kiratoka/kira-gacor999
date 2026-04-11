import React from 'react';
import { Gem, Crown, Star, Heart, Coins, CircleDollarSign, AlertTriangle } from 'lucide-react';
 
// ─── THEME TOKENS ────────────────────────────────────────────────────────────
// Cyan neon + dark black theme
// bg:        #080c10  (near-black)
// surface:   #0d1117  (card bg)
// surface-2: #111820  (row bg)
// border:    #0e2a33  (default)
// cyan:      #00e5ff  (neon accent)
// cyan-dim:  rgba(0,229,255,0.12) (glow fill)
// error-neon:#ff2d6b  (pink-red neon)
// ─────────────────────────────────────────────────────────────────────────────
 
const PAYTABLE_DATA = [
  {
    icon: Crown,
    name: 'Crown',
    accentColor: '#ff6ef7',
    glowColor: 'rgba(255,110,247,0.18)',
    borderColor: 'rgba(255,110,247,0.25)',
    hoverBorder: 'rgba(255,110,247,0.55)',
    rewards: { 3: 'Rp 1.500', 4: 'Rp 4.000', 5: 'Rp 10.000' },
  },
  {
    icon: Gem,
    name: 'Diamond',
    accentColor: '#00e5ff',
    glowColor: 'rgba(0,229,255,0.15)',
    borderColor: 'rgba(0,229,255,0.25)',
    hoverBorder: 'rgba(0,229,255,0.55)',
    rewards: { 3: 'Rp 1.000', 4: 'Rp 3.000', 5: 'Rp 7.000' },
  },
  {
    icon: Star,
    name: 'Star',
    accentColor: '#60b8ff',
    glowColor: 'rgba(96,184,255,0.15)',
    borderColor: 'rgba(96,184,255,0.22)',
    hoverBorder: 'rgba(96,184,255,0.5)',
    rewards: { 3: 'Rp 1.200', 4: 'Rp 3.500', 5: 'Rp 8.000' },
  },
  {
    icon: Heart,
    name: 'Heart',
    accentColor: '#b06fff',
    glowColor: 'rgba(176,111,255,0.15)',
    borderColor: 'rgba(176,111,255,0.22)',
    hoverBorder: 'rgba(176,111,255,0.5)',
    rewards: { 3: 'Rp 1.000', 4: 'Rp 2.500', 5: 'Rp 5.000' },
  },
  {
    icon: Coins,
    name: 'Coins',
    accentColor: '#00ffb2',
    glowColor: 'rgba(0,255,178,0.13)',
    borderColor: 'rgba(0,255,178,0.2)',
    hoverBorder: 'rgba(0,255,178,0.45)',
    rewards: { 3: 'Rp 900', 4: 'Rp 2.000', 5: 'Rp 4.500' },
  },
  {
    icon: CircleDollarSign,
    name: 'Green Coin',
    accentColor: '#aaff00',
    glowColor: 'rgba(170,255,0,0.12)',
    borderColor: 'rgba(170,255,0,0.2)',
    hoverBorder: 'rgba(170,255,0,0.45)',
    rewards: { 3: 'Rp 800', 4: 'Rp 2.000', 5: 'Rp 4.000' },
  },
];
 
// ─── PAYTABLE ─────────────────────────────────────────────────────────────────
 
export function Paytable() {
  return (
    <div
      id="paytable"
      data-tutorial="paytable"
      style={{
        backgroundColor: '#0d1117',
        border: '1px solid #0e2a33',
        borderRadius: '20px',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 0 40px rgba(0,229,255,0.04)',
      }}
    >
      {/* TITLE */}
      <p
        style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#00e5ff',
          marginBottom: '16px',
          opacity: 0.75,
        }}
      >
        Daftar Hadiah (Paytable)
      </p>
 
      {/* ROWS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PAYTABLE_DATA.map((item, idx) => (
          <PaytableRow key={idx} item={item} />
        ))}
      </div>
 
      {/* NOTE */}
      <div
        style={{
          marginTop: '14px',
          padding: '12px 14px',
          backgroundColor: 'rgba(0,229,255,0.04)',
          border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: '12px',
        }}
      >
        <p style={{ fontSize: '11px', color: 'rgba(0,229,255,0.55)', lineHeight: 1.6, margin: 0 }}>
          <span style={{ fontWeight: 600, color: 'rgba(0,229,255,0.8)' }}>Catatan Sistem: </span>
          Simbol dengan hadiah besar (Crown, Diamond) memiliki probabilitas kemunculan yang sangat kecil.
          Simbol Green Coin sering muncul untuk memberikan ilusi kemenangan.
        </p>
      </div>
    </div>
  );
}
 
// Threshold (px) di mana reward cells pindah ke bawah nama
const NARROW_BREAKPOINT = 280;
 
function PaytableRow({ item }: { item: (typeof PAYTABLE_DATA)[0] }) {
  const [hovered, setHovered] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  const rowRef = React.useRef<HTMLDivElement>(null);
 
  React.useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < NARROW_BREAKPOINT);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
 
  return (
    <div
      ref={rowRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        // Ketika sempit: kolom (icon+nama di atas, rewards di bawah)
        // Ketika lebar: baris biasa
        flexDirection: narrow ? 'column' : 'row',
        alignItems: narrow ? 'flex-start' : 'center',
        justifyContent: narrow ? 'flex-start' : 'space-between',
        gap: narrow ? '8px' : '12px',
        padding: '10px 14px',
        borderRadius: '12px',
        backgroundColor: hovered ? 'rgba(0,229,255,0.03)' : '#111820',
        border: `1px solid ${hovered ? item.hoverBorder : item.borderColor}`,
        transition: 'border-color 0.2s, background-color 0.2s',
        boxShadow: hovered ? `0 0 18px ${item.glowColor}` : 'none',
        cursor: 'default',
      }}
    >
      {/* ICON + NAMA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: item.glowColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${item.borderColor}`,
          }}
        >
          <item.icon style={{ width: '17px', height: '17px', color: item.accentColor }} />
        </div>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#e0f7ff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </span>
      </div>
 
      {/* REWARD CELLS
          - Mode lebar  : jajar kanan, sejajar horizontal
          - Mode sempit : jajar kiri di bawah nama, tetap horizontal (3 pill berjajar)
      */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexShrink: 0,
          // Saat sempit: mulai dari kiri (rata dengan icon+nama), bukan kanan
          alignSelf: narrow ? 'stretch' : 'auto',
          justifyContent: narrow ? 'flex-start' : 'flex-end',
          // Kalau sangat sempit sekali, boleh wrap ke baris baru antar-pill
          flexWrap: 'wrap',
        }}
      >
        {([3, 4, 5] as const).map((count) => (
          <div
            key={count}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: narrow ? 'flex-start' : 'flex-end',
              // Pill styling saat narrow agar lebih compact & rapi
              ...(narrow
                ? {
                    backgroundColor: item.glowColor,
                    border: `1px solid ${item.borderColor}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    flex: '1 1 auto',
                    maxWidth: '90px',
                  }
                : {
                    minWidth: '52px',
                  }),
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(160,200,210,0.45)',
                marginBottom: '1px',
              }}
            >
              {count}x
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'monospace',
                color: item.accentColor,
                textShadow: hovered ? `0 0 8px ${item.accentColor}` : 'none',
                transition: 'text-shadow 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {item.rewards[count]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}