import { useId, useMemo } from 'react'
import { seededRandom } from '../lib/random.js'

/**
 * 程序化场景插图
 * ---------------------------------------------------------------
 * 站点不包含官方插画资源，所有场景由 SVG 分层绘制（天空、山脊、城市剪影、
 * 雾、粒子、暗角），用同一套调色板保证视觉一致。每张图按 variant 固定随机种子，
 * 因此刷新后构图不变。正式上线应替换为核对后的官方素材。
 */

const BASE = {
  chernobog: {
    sky: ['#05080b', '#131d26', '#39434c'],
    glow: { x: 0.66, y: 0.3, r: 0.44, color: '#c9d8e2', opacity: 0.28 },
    ground: ['#0a0d10', '#05070a'],
    layers: ['ridgeFar', 'ridgeNear', 'ruins', 'haze', 'snow'],
    accent: '#9fb6c4',
    vignette: 0.85,
  },
  lungmen: {
    sky: ['#060a0f', '#101b26', '#2b3a45'],
    glow: { x: 0.32, y: 0.24, r: 0.5, color: '#7fc4d6', opacity: 0.2 },
    ground: ['#080b0e', '#040608'],
    layers: ['ridgeFar', 'skyline', 'skylineNear', 'haze', 'rain'],
    accent: '#42DDE5',
    vignette: 0.8,
    neon: true,
  },
  ark: {
    sky: ['#04070a', '#0e1820', '#394c58'],
    glow: { x: 0.24, y: 0.42, r: 0.5, color: '#dbe7ee', opacity: 0.24 },
    ground: ['#070a0d', '#040608'],
    layers: ['ridgeFar', 'ship', 'haze'],
    accent: '#d9e3e8',
    vignette: 0.9,
  },
  tundra: {
    sky: ['#080c11', '#1b2833', '#5b6d78'],
    glow: { x: 0.5, y: 0.36, r: 0.55, color: '#e6eef4', opacity: 0.22 },
    ground: ['#10151a', '#070a0d'],
    layers: ['ridgeFar', 'ridgeNear', 'figures', 'haze', 'snow'],
    accent: '#cfdde6',
    vignette: 0.75,
  },
  snowMountain: {
    sky: ['#070b10', '#1a2733', '#6d7f8b'],
    glow: { x: 0.68, y: 0.22, r: 0.5, color: '#dfeaf2', opacity: 0.26 },
    ground: ['#0d1319', '#06090c'],
    layers: ['mountain', 'ridgeNear', 'haze', 'snow'],
    accent: '#dbe7ef',
    vignette: 0.7,
  },
  crystal: {
    sky: ['#04070b', '#0b1720', '#22333d'],
    glow: { x: 0.5, y: 0.62, r: 0.4, color: '#42DDE5', opacity: 0.18 },
    ground: ['#070c10', '#030506'],
    layers: ['ridgeFar', 'crystals', 'haze', 'spark'],
    accent: '#42DDE5',
    vignette: 0.85,
  },
  sea: {
    sky: ['#05090d', '#101d26', '#384b57'],
    glow: { x: 0.5, y: 0.55, r: 0.5, color: '#9fc3cf', opacity: 0.18 },
    ground: ['#0a1418', '#050a0c'],
    layers: ['ridgeFar', 'sea', 'haze', 'rain'],
    accent: '#8fb9c4',
    vignette: 0.8,
  },
  coast: {
    sky: ['#080c10', '#18242c', '#4b5c66'],
    glow: { x: 0.72, y: 0.42, r: 0.42, color: '#d6e2e8', opacity: 0.3 },
    ground: ['#0c1114', '#05080a'],
    layers: ['ridgeFar', 'sea', 'lighthouse', 'haze', 'snow'],
    accent: '#b9cbd4',
    vignette: 0.82,
  },
  desert: {
    sky: ['#0a0b0f', '#1b1d26', '#5c4f45'],
    glow: { x: 0.72, y: 0.3, r: 0.48, color: '#e3b28a', opacity: 0.3 },
    ground: ['#151210', '#080605'],
    layers: ['ridgeFar', 'dunes', 'tower', 'haze', 'dust'],
    accent: '#d9a273',
    vignette: 0.78,
  },
  forest: {
    sky: ['#040706', '#0d1713', '#2f3d34'],
    glow: { x: 0.4, y: 0.24, r: 0.42, color: '#b9cdb4', opacity: 0.2 },
    ground: ['#070b08', '#030504'],
    layers: ['ridgeFar', 'trees', 'treesNear', 'haze'],
    accent: '#9db894',
    vignette: 0.85,
  },
  citadel: {
    sky: ['#06080d', '#121b26', '#3f4b57'],
    glow: { x: 0.58, y: 0.28, r: 0.45, color: '#d2dde6', opacity: 0.25 },
    ground: ['#0a0d11', '#05070a'],
    layers: ['ridgeFar', 'citadel', 'haze', 'rain'],
    accent: '#c3cfd8',
    vignette: 0.85,
  },
  arena: {
    sky: ['#07090d', '#141d25', '#43403a'],
    glow: { x: 0.5, y: 0.2, r: 0.6, color: '#e8d9b8', opacity: 0.32 },
    ground: ['#0d0c0b', '#060505'],
    layers: ['ridgeFar', 'arena', 'haze', 'spark'],
    accent: '#d9c08a',
    vignette: 0.82,
  },
  factory: {
    sky: ['#08090c', '#1a1a1e', '#46362f'],
    glow: { x: 0.3, y: 0.66, r: 0.4, color: '#e08a5f', opacity: 0.3 },
    ground: ['#0b0b0b', '#050505'],
    layers: ['ridgeFar', 'factory', 'haze', 'embers'],
    accent: '#e08a5f',
    vignette: 0.85,
  },
  lab: {
    sky: ['#05080b', '#0e1a20', '#2c3e45'],
    glow: { x: 0.5, y: 0.5, r: 0.45, color: '#8fd6cf', opacity: 0.2 },
    ground: ['#070b0d', '#040607'],
    layers: ['grid', 'tower', 'haze'],
    accent: '#7fd6cf',
    vignette: 0.9,
  },
  dawn: {
    sky: ['#0a0c12', '#27303c', '#8b7a6a'],
    glow: { x: 0.4, y: 0.62, r: 0.6, color: '#f0c9a0', opacity: 0.4 },
    ground: ['#12100f', '#070606'],
    layers: ['ridgeFar', 'skyline', 'haze'],
    accent: '#e8c49a',
    vignette: 0.7,
  },
  yan: {
    sky: ['#070a0d', '#141c22', '#4a545a'],
    glow: { x: 0.62, y: 0.34, r: 0.44, color: '#cad6d4', opacity: 0.2 },
    ground: ['#0a0d0e', '#050707'],
    layers: ['mountain', 'temple', 'haze', 'snow'],
    accent: '#c9b99a',
    vignette: 0.8,
  },
  storm: {
    sky: ['#05080c', '#111a22', '#2e3c46'],
    glow: { x: 0.46, y: 0.28, r: 0.4, color: '#a9c4d2', opacity: 0.22 },
    ground: ['#080b0e', '#040608'],
    layers: ['ridgeFar', 'skyline', 'haze', 'rain'],
    accent: '#9fb6c4',
    vignette: 0.9,
  },
  ruins: {
    sky: ['#06080b', '#131c24', '#3a4650'],
    glow: { x: 0.7, y: 0.4, r: 0.4, color: '#c6d4dc', opacity: 0.2 },
    ground: ['#090c0e', '#040607'],
    layers: ['ridgeFar', 'ruins', 'haze', 'dust'],
    accent: '#a9bac4',
    vignette: 0.88,
  },
  babel: {
    sky: ['#03060a', '#0b141b', '#2d3b46'],
    glow: { x: 0.5, y: 0.34, r: 0.36, color: '#bcd4e2', opacity: 0.24 },
    ground: ['#06090c', '#030506'],
    layers: ['ridgeFar', 'babelTower', 'haze', 'spark'],
    accent: '#bcd4e2',
    vignette: 0.92,
  },
  crowd: {
    sky: ['#06090c', '#121a20', '#3b474f'],
    glow: { x: 0.5, y: 0.42, r: 0.5, color: '#cbd8df', opacity: 0.18 },
    ground: ['#090c0e', '#040607'],
    layers: ['ridgeFar', 'figures', 'haze'],
    accent: '#b9c9d2',
    vignette: 0.86,
  },
  fire: {
    sky: ['#08070a', '#1d1517', '#5a3026'],
    glow: { x: 0.5, y: 0.72, r: 0.5, color: '#ff8a5a', opacity: 0.38 },
    ground: ['#0d0908', '#050404'],
    layers: ['ridgeFar', 'ruins', 'haze', 'embers'],
    accent: '#ff8a5a',
    vignette: 0.88,
  },
  city: {
    sky: ['#06090c', '#131d25', '#414c55'],
    glow: { x: 0.6, y: 0.32, r: 0.45, color: '#c8d6df', opacity: 0.22 },
    ground: ['#0a0d10', '#05070a'],
    layers: ['ridgeFar', 'skyline', 'haze', 'rain'],
    accent: '#b3c3cc',
    vignette: 0.84,
  },
}

/** variant → 基础构图 */
const ALIASES = {
  'chernobog-night': 'chernobog',
  'chernobog-fire': 'fire',
  'chernobog-ruins': 'ruins',
  'ark-night': 'ark',
  'lungmen-night': 'lungmen',
  'lungmen-alley': 'lungmen',
  'snow-night': 'tundra',
  'snow-mountain': 'snowMountain',
  'snow-ruins': 'tundra',
  'snow-peak': 'snowMountain',
  'crystal-dark': 'crystal',
  'sea-fog': 'sea',
  'sea-deep': 'sea',
  'coast-fog': 'coast',
  'desert-tower': 'desert',
  'desert-dawn': 'dawn',
  'waste-storm': 'desert',
  waste: 'desert',
  'knight-arena': 'arena',
  'knight-city': 'citadel',
  'knight-light': 'arena',
  'factory-fire': 'fire',
  'city-fog': 'city',
  'city-industrial': 'factory',
  'city-night': 'city',
  'dark-horizon': 'storm',
  'storm-city': 'storm',
  'dawn-city': 'dawn',
  'yan-mountain': 'yan',
  'mountain-ink': 'yan',
  mountain: 'snowMountain',
  'train-snow': 'tundra',
  'field-road': 'tundra',
  'rain-city': 'lungmen',
  'babel-tower': 'babel',
  'tower-dark': 'babel',
  tower: 'babel',
  people: 'crowd',
  'people-dark': 'crowd',
  'portrait-amiya': 'crowd',
  'portrait-kaltsit': 'crowd',
}

function resolvePreset(variant) {
  if (BASE[variant]) return { key: variant, ...BASE[variant] }
  const alias = ALIASES[variant]
  if (alias && BASE[alias]) return { key: alias, ...BASE[alias] }
  return { key: 'chernobog', ...BASE.chernobog }
}

function pts(points) {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function ridge(rng, w, h, baseY, amp, step = 130) {
  const points = [[-40, h]]
  for (let x = -40; x <= w + 40; x += step) {
    const y = baseY + (rng() - 0.5) * amp
    points.push([x, y])
  }
  points.push([w + 40, h])
  return pts(points)
}

function LayerRidge({ rng, w, h, baseY, amp, color, opacity, step }) {
  return <polygon points={ridge(rng, w, h, baseY, amp, step)} fill={color} opacity={opacity} />
}

function LayerMountain({ rng, w, h, color, opacity }) {
  const peakX = w * (0.32 + rng() * 0.36)
  const peakY = h * (0.2 + rng() * 0.12)
  const left = [[-40, h], [w * 0.05, h * 0.52], [peakX - w * 0.2, peakY + h * 0.14], [peakX, peakY], [peakX + w * 0.16, peakY + h * 0.1], [w * 0.86, h * 0.6], [w + 40, h]]
  return (
    <>
      <polygon points={pts(left)} fill={color} opacity={opacity} />
      <polygon
        points={pts([
          [peakX - w * 0.06, peakY + h * 0.05],
          [peakX, peakY],
          [peakX + w * 0.05, peakY + h * 0.045],
          [peakX - w * 0.01, peakY + h * 0.03],
        ])}
        fill="#e8f1f6"
        opacity={opacity * 0.55}
      />
    </>
  )
}

function LayerSkyline({ rng, w, h, color, glow, near = false, density = 1 }) {
  const buildings = []
  let x = -40
  while (x < w + 40) {
    const bw = 18 + rng() * (near ? 74 : 46)
    const bh = (near ? 80 : 40) + rng() * (near ? 260 : 190) * density
    const top = h * 0.72 - bh
    buildings.push({ x, y: top, w: bw, h: bh, id: `${x}-${bh}` })
    x += bw + (near ? 6 : 10) + rng() * 16
  }
  return (
    <g>
      {buildings.map((b) => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h + 80} fill={color} />
          {b.h > 120 && rng() > 0.5 ? (
            <rect x={b.x + b.w * 0.38} y={b.y - 14 - rng() * 26} width={2} height={20 + rng() * 24} fill={color} />
          ) : null}
          {near
            ? Array.from({ length: Math.max(2, Math.floor(b.h / 46)) }).map((_, i) => (
                <rect
                  key={i}
                  x={b.x + 5 + (i % 2) * (b.w * 0.45)}
                  y={b.y + 14 + i * 34}
                  width={3}
                  height={2}
                  fill={glow}
                  opacity={0.25 + rng() * 0.5}
                />
              ))
            : null}
        </g>
      ))}
    </g>
  )
}

function LayerRuins({ rng, w, h, color }) {
  const blocks = []
  let x = -30
  while (x < w + 30) {
    const bw = 30 + rng() * 90
    const bh = 40 + rng() * 210
    let top = h * 0.74 - bh
    if (rng() > 0.45) top += 30 + rng() * 40
    blocks.push({ x, top, bw, bh, id: `${x}-${top.toFixed(0)}` })
    x += bw + 6 + rng() * 26
  }
  return (
    <g>
      {blocks.map((b) => (
        <g key={b.id}>
          <polygon
            points={pts([
              [b.x, h],
              [b.x, b.top + 24],
              [b.x + b.bw * 0.5, b.top],
              [b.x + b.bw, b.top + 30],
              [b.x + b.bw, h],
            ])}
            fill={color}
          />
          {rng() > 0.55 ? (
            <rect x={b.x + b.bw * 0.2} y={b.top + 60} width={b.bw * 0.6} height={2} fill="#42DDE5" opacity={0.18} />
          ) : null}
        </g>
      ))}
    </g>
  )
}

function LayerShip({ rng, w, h, color, accent }) {
  const baseY = h * 0.68
  const hull = [
    [w * 0.04, baseY],
    [w * 0.3, baseY - 16],
    [w * 0.62, baseY - 10],
    [w * 0.92, baseY - 46],
    [w * 0.88, baseY + 26],
    [w * 0.4, baseY + 42],
    [w * 0.08, baseY + 26],
  ]
  const towers = [0.16, 0.34, 0.55, 0.72].map((p, i) => ({
    x: w * p,
    hgt: 60 + rng() * 150,
    wid: 12 + rng() * 26,
    id: i,
  }))
  return (
    <g>
      <rect x={w * 0.06} y={baseY - 6} width={w * 0.84} height={2} fill={accent} opacity={0.25} />
      <polygon points={pts(hull)} fill={color} />
      {towers.map((t) => (
        <g key={t.id}>
          <rect x={t.x} y={baseY - 20 - t.hgt} width={t.wid} height={t.hgt} fill={color} />
          <rect x={t.x - 4} y={baseY - 24 - t.hgt} width={t.wid + 8} height={4} fill={color} opacity={0.8} />
          {rng() > 0.4 ? <circle cx={t.x + t.wid / 2} cy={baseY - 30 - t.hgt} r={2} fill={accent} opacity={0.7} /> : null}
        </g>
      ))}
      <path
        d={`M${w * 0.3} ${baseY - 78} L${w * 0.55} ${baseY - 78} M${w * 0.3} ${baseY - 62} L${w * 0.5} ${baseY - 62}`}
        stroke={color}
        strokeWidth={6}
        opacity={0.9}
      />
      <g opacity={0.55}>
        {Array.from({ length: 22 }).map((_, i) => (
          <rect
            key={i}
            x={w * 0.12 + i * (w * 0.036)}
            y={baseY + 4 + (i % 3) * 10}
            width={4}
            height={2}
            fill="#f2d8a8"
            opacity={0.35 + rng() * 0.45}
          />
        ))}
      </g>
    </g>
  )
}

function LayerCitadel({ rng, w, h, color, accent }) {
  const cx = w * 0.56
  const baseY = h * 0.76
  const spires = [
    { x: cx - 150, w: 54, h: 150 },
    { x: cx - 54, w: 70, h: 240 },
    { x: cx + 60, w: 44, h: 180 },
    { x: cx + 140, w: 60, h: 120 },
  ]
  return (
    <g>
      <rect x={w * 0.18} y={baseY} width={w * 0.68} height={h * 0.24} fill={color} />
      {spires.map((s, i) => (
        <g key={i}>
          <polygon points={pts([[s.x, baseY], [s.x + s.w / 2, baseY - s.h], [s.x + s.w, baseY]])} fill={color} />
          <rect x={s.x + s.w / 2 - 2} y={baseY - s.h - 26} width={4} height={28} fill={color} />
          <circle cx={s.x + s.w / 2} cy={baseY - s.h - 30} r={2.6} fill={accent} opacity={0.8} />
        </g>
      ))}
      <path d={`M${w * 0.26} ${baseY + 30} h${w * 0.48}`} stroke={accent} strokeWidth={1} opacity={0.25} />
    </g>
  )
}

function LayerArena({ rng, w, h, color, accent }) {
  const cx = w * 0.5
  const baseY = h * 0.78
  return (
    <g>
      <ellipse cx={cx} cy={baseY} rx={w * 0.34} ry={h * 0.12} fill={color} />
      <ellipse cx={cx} cy={baseY} rx={w * 0.3} ry={h * 0.09} fill="#0a0a0a" opacity={0.8} />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <rect
            key={i}
            x={cx + Math.cos(a) * w * 0.245 - 3}
            y={baseY + Math.sin(a) * h * 0.075 - 3}
            width={6}
            height={6}
            fill={accent}
            opacity={0.5 + rng() * 0.4}
          />
        )
      })}
      {[[0.18, 0.42], [0.82, 0.42]].map(([px, py], i) => (
        <g key={i}>
          <rect x={w * px} y={h * py} width={w * 0.06} height={h * (0.78 - py)} fill={color} opacity={0.9} />
          <circle cx={w * px + w * 0.03} cy={h * py - 6} r={5} fill={accent} opacity={0.55} />
        </g>
      ))}
    </g>
  )
}

function LayerFactory({ rng, w, h, color, accent }) {
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = w * (0.12 + i * 0.13)
        const hh = 90 + rng() * 180
        return (
          <g key={i}>
            <rect x={x} y={h * 0.76 - hh} width={18 + rng() * 12} height={hh} fill={color} />
            <rect x={x - 6} y={h * 0.76 - hh - 8} width={32} height={8} fill={color} />
          </g>
        )
      })}
      <rect x={w * 0.08} y={h * 0.76} width={w * 0.84} height={h * 0.24} fill={color} />
      <rect x={w * 0.2} y={h * 0.8} width={w * 0.26} height={3} fill={accent} opacity={0.35} />
    </g>
  )
}

function LayerTemple({ rng, w, h, color, accent }) {
  const cx = w * 0.55
  const baseY = h * 0.76
  return (
    <g>
      <polygon points={pts([[cx - 230, baseY], [cx - 150, baseY - 60], [cx + 150, baseY - 60], [cx + 240, baseY]])} fill={color} />
      {[-120, -40, 40, 120].map((dx, i) => (
        <rect key={i} x={cx + dx - 6} y={baseY - 150} width={12} height={92} fill={color} />
      ))}
      <polygon points={pts([[cx - 150, baseY - 150], [cx, baseY - 200], [cx + 150, baseY - 150]])} fill={color} />
      <rect x={cx - 2} y={baseY - 236} width={2} height={40} fill={accent} opacity={0.6} />
    </g>
  )
}

function LayerBabel({ rng, w, h, color, accent }) {
  const cx = w * 0.5
  const baseY = h * 0.82
  const tower = [
    [cx - 150, baseY],
    [cx - 62, baseY - 190],
    [cx - 44, baseY - 300],
    [cx - 14, baseY - 330],
    [cx + 14, baseY - 330],
    [cx + 44, baseY - 300],
    [cx + 62, baseY - 190],
    [cx + 150, baseY],
  ]
  return (
    <g>
      <polygon points={pts(tower)} fill={color} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={cx - 40 + i * 22} y={baseY - 300} width={10} height={26} fill={color} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={cx - 110 + i * 46} y={baseY - 150 + i * 18} width={2} height={h * 0.1} fill={accent} opacity={0.2} />
      ))}
      <circle cx={cx} cy={baseY - 348} r={3} fill={accent} opacity={0.85} />
    </g>
  )
}

function LayerCrystals({ rng, w, h, accent }) {
  const shards = Array.from({ length: 26 }).map((_, i) => {
    const cx = w * (0.18 + rng() * 0.64)
    const base = h * (0.72 + rng() * 0.16)
    const height = 60 + rng() * 240
    const wide = 8 + rng() * 26
    return { cx, base, height, wide, lean: (rng() - 0.5) * 40, key: i }
  })
  return (
    <g>
      {shards.map((s) => (
        <g key={s.key}>
          <polygon
            points={pts([
              [s.cx - s.wide, s.base],
              [s.cx - s.wide * 0.4 + s.lean, s.base - s.height],
              [s.cx + s.wide * 0.5 + s.lean, s.base - s.height + 12],
              [s.cx + s.wide, s.base],
            ])}
            fill="#0d1b22"
            stroke={accent}
            strokeOpacity={0.22}
            strokeWidth={1}
          />
          <polyline
            points={pts([
              [s.cx - s.wide * 0.1, s.base - 6],
              [s.cx + s.lean * 0.5, s.base - s.height * 0.5],
              [s.cx + s.wide * 0.2 + s.lean, s.base - s.height + 16],
            ])}
            fill="none"
            stroke={accent}
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />
        </g>
      ))}
    </g>
  )
}

function LayerTrees({ rng, w, h, near = false }) {
  const n = near ? 9 : 14
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = (i / n) * w + rng() * 60
        const height = h * (near ? 0.5 + rng() * 0.24 : 0.24 + rng() * 0.16)
        const base = h * 0.82
        return (
          <g key={i} opacity={near ? 0.95 : 0.5}>
            <rect x={x} y={base - height} width={near ? 9 : 5} height={height} fill={near ? '#050807' : '#0a100d'} />
            {Array.from({ length: 3 }).map((_, j) => (
              <ellipse
                key={j}
                cx={x + (rng() - 0.5) * 46}
                cy={base - height - 10 - j * 34}
                rx={34 + rng() * 30}
                ry={26 + rng() * 20}
                fill={near ? '#050807' : '#0c1410'}
                opacity={near ? 0.9 : 0.75}
              />
            ))}
          </g>
        )
      })}
    </g>
  )
}

function LayerDunes({ rng, w, h }) {
  return (
    <g>
      {Array.from({ length: 4 }).map((_, i) => {
        const y = h * (0.74 + i * 0.055)
        const points = [[-40, h]]
        for (let x = -40; x <= w + 40; x += 160) points.push([x, y + (rng() - 0.5) * 26 - i * 4])
        points.push([w + 40, h])
        return <polygon key={i} points={pts(points)} fill={i % 2 ? '#0b0908' : '#12100c'} opacity={0.9 - i * 0.12} />
      })}
    </g>
  )
}

function LayerTower({ x = 0.7, y = 0.16, scale = 1, color = '#070a0c' }) {
  return (
    <g transform={`translate(${x * 1600}, ${y * 900}) scale(${scale})`}>
      <rect x={-9} y={0} width={18} height={420} fill={color} />
      <rect x={-30} y={80} width={60} height={6} fill={color} />
      <rect x={-22} y={160} width={44} height={4} fill={color} />
      <rect x={-3} y={-26} width={6} height={26} fill={color} />
    </g>
  )
}

function LayerGrid({ w, h, accent }) {
  return (
    <g opacity={0.16}>
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={`v${i}`} x1={(w / 14) * i} y1={h * 0.3} x2={(w / 14) * i + 60} y2={h} stroke={accent} strokeWidth={1} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={h * 0.36 + i * 70} x2={w} y2={h * 0.36 + i * 70} stroke={accent} strokeWidth={1} />
      ))}
    </g>
  )
}

function Particles({ type, rng, w, h, accent }) {
  const count = type === 'rain' ? 90 : type === 'snow' ? 80 : 50
  const items = Array.from({ length: count }).map((_, i) => ({
    x: rng() * w,
    y: rng() * h,
    r: type === 'rain' ? 0.8 : 1 + rng() * 2.2,
    o: 0.15 + rng() * 0.5,
    l: 8 + rng() * 26,
    key: i,
  }))
  if (type === 'rain') {
    return (
      <g opacity={0.5}>
        {items.map((p) => (
          <line key={p.key} x1={p.x} y1={p.y} x2={p.x - 3} y2={p.y + p.l} stroke="#b9cbd4" strokeWidth={0.8} opacity={p.o} />
        ))}
      </g>
    )
  }
  if (type === 'embers') {
    return (
      <g>
        {items.map((p) => (
          <circle key={p.key} cx={p.x} cy={h * 0.55 + rng() * h * 0.45} r={p.r} fill={accent} opacity={p.o * 0.9} />
        ))}
      </g>
    )
  }
  if (type === 'spark') {
    return (
      <g>
        {items.map((p) => (
          <circle key={p.key} cx={p.x} cy={p.y} r={p.r * 0.7} fill={accent} opacity={p.o * 0.8} />
        ))}
      </g>
    )
  }
  return (
    <g>
      {items.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r={p.r} fill="#e9f2f7" opacity={p.o} />
      ))}
    </g>
  )
}

export default function Scene({ variant = 'chernobog', seed = 0, className = '', style, children, overlay = true }) {
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const preset = useMemo(() => resolvePreset(variant), [variant])
  const rng = useMemo(() => seededRandom(`${preset.key}:${variant}`, seed), [preset.key, variant, seed])

  const w = 1600
  const h = 900
  const { sky, glow, ground, accent } = preset

  const layers = preset.layers || []
  const has = (name) => layers.includes(name)

  return (
    <svg
      className={`scene ${className}`}
      style={style}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="58%" stopColor={sky[1]} />
          <stop offset="100%" stopColor={sky[2]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow.color} stopOpacity={glow.opacity} />
          <stop offset="55%" stopColor={glow.color} stopOpacity={glow.opacity * 0.35} />
          <stop offset="100%" stopColor={glow.color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`moon-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow.color} stopOpacity="0.62" />
          <stop offset="42%" stopColor={glow.color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={glow.color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ground[0]} />
          <stop offset="100%" stopColor={ground[1]} />
        </linearGradient>
        <linearGradient id={`fog-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8bcc7" stopOpacity="0" />
          <stop offset="45%" stopColor="#a8bcc7" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#a8bcc7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`horizon-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[2]} stopOpacity="0" />
          <stop offset="48%" stopColor={sky[2]} stopOpacity="0.32" />
          <stop offset="100%" stopColor={sky[2]} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="46%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity={preset.vignette} />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      <rect width={w} height={h} fill={`url(#sky-${uid})`} />
      <rect x={0} y={h * 0.4} width={w} height={h * 0.38} fill={`url(#horizon-${uid})`} />
      <ellipse cx={glow.x * w} cy={glow.y * h} rx={glow.r * w} ry={glow.r * h * 0.8} fill={`url(#glow-${uid})`} />
      {glow.opacity > 0.18 ? (
        <circle cx={glow.x * w} cy={glow.y * h} r={Math.min(80, glow.r * w * 0.13)} fill={`url(#moon-${uid})`} />
      ) : null}
      <line x1={0} y1={h * 0.685} x2={w} y2={h * 0.685} stroke={accent} strokeOpacity={0.12} strokeWidth={1} />
      {preset.neon ? (
        <ellipse cx={w * 0.2} cy={h * 0.7} rx={w * 0.35} ry={h * 0.16} fill={accent} opacity={0.08} filter={`url(#blur-${uid})`} />
      ) : null}

      {has('mountain') ? <LayerMountain rng={rng} w={w} h={h} color="#0a1218" opacity={0.9} /> : null}
      {has('ridgeFar') ? <LayerRidge rng={rng} w={w} h={h} baseY={h * 0.66} amp={70} color="#0b141a" opacity={0.85} step={180} /> : null}
      {has('ridgeNear') ? <LayerRidge rng={rng} w={w} h={h} baseY={h * 0.78} amp={54} color="#070c0f" opacity={0.95} step={140} /> : null}

      {has('skyline') ? <LayerSkyline rng={rng} w={w} h={h} color="#0a1116" glow={accent} density={0.9} /> : null}
      {has('skylineNear') ? <LayerSkyline rng={rng} w={w} h={h} color="#05080b" glow={accent} near density={1} /> : null}
      {has('ruins') ? <LayerRuins rng={rng} w={w} h={h} color="#080c0f" /> : null}
      {has('ship') ? <LayerShip rng={rng} w={w} h={h} color="#06090c" accent={accent} /> : null}
      {has('citadel') ? <LayerCitadel rng={rng} w={w} h={h} color="#080c10" accent={accent} /> : null}
      {has('arena') ? <LayerArena rng={rng} w={w} h={h} color="#0e0d0b" accent={accent} /> : null}
      {has('factory') ? <LayerFactory rng={rng} w={w} h={h} color="#070707" accent={accent} /> : null}
      {has('temple') ? <LayerTemple rng={rng} w={w} h={h} color="#0a0c0b" accent={accent} /> : null}
      {has('babelTower') ? <LayerBabel rng={rng} w={w} h={h} color="#05080b" accent={accent} /> : null}
      {has('crystals') ? <LayerCrystals rng={rng} w={w} h={h} accent="#42DDE5" /> : null}
      {has('trees') ? <LayerTrees rng={rng} w={w} h={h} /> : null}
      {has('treesNear') ? <LayerTrees rng={rng} w={w} h={h} near /> : null}
      {has('dunes') ? <LayerDunes rng={rng} w={w} h={h} /> : null}
      {has('grid') ? <LayerGrid w={w} h={h} accent={accent} /> : null}
      {has('tower') ? (
        <g opacity={0.9}>
          <LayerTower x={0.72} y={0.16} scale={1} color="#07090b" />
          {(preset.key === 'desert' || preset.key === 'lab') && <LayerTower x={0.72} y={0.16} scale={0.62} color={accent} />}
        </g>
      ) : null}
      {has('lighthouse') ? (
        <g>
          <polygon points={pts([[w * 0.78, h * 0.86], [w * 0.775, h * 0.5], [w * 0.795, h * 0.5], [w * 0.8, h * 0.86]])} fill="#070b0d" />
          <rect x={w * 0.772} y={h * 0.47} width={w * 0.026} height={h * 0.03} fill="#0a0f12" />
          <circle cx={w * 0.785} cy={h * 0.485} r={4} fill={accent} opacity={0.9} />
          <polygon points={pts([[w * 0.785, h * 0.485], [w * 0.6, h * 0.42], [w * 0.62, h * 0.49]])} fill={accent} opacity={0.12} />
        </g>
      ) : null}
      {has('sea') ? (
        <g>
          <rect x={0} y={h * 0.68} width={w} height={h * 0.32} fill="#0a1418" />
          {Array.from({ length: 26 }).map((_, i) => (
            <line
              key={i}
              x1={rng() * w}
              y1={h * (0.7 + rng() * 0.28)}
              x2={rng() * w}
              y2={h * (0.7 + rng() * 0.28)}
              stroke="#8fb9c4"
              strokeWidth={0.7}
              opacity={0.12 + rng() * 0.16}
            />
          ))}
        </g>
      ) : null}
      {has('figures') ? (
        <g fill="#040708">
          {Array.from({ length: 7 }).map((_, i) => {
            const x = w * (0.3 + i * 0.055) + (rng() - 0.5) * 26
            const s = 0.8 + rng() * 0.5
            return (
              <g key={i} transform={`translate(${x}, ${h * 0.82}) scale(${s})`}>
                <circle cx={0} cy={-58} r={9} />
                <path d="M-14 -8 L-10 -50 Q0 -60 10 -50 L14 -8 Z" />
                <rect x={-8} y={-10} width={5} height={10} />
                <rect x={3} y={-10} width={5} height={10} />
              </g>
            )
          })}
        </g>
      ) : null}

      {has('haze') ? (
        <g filter={`url(#blur-${uid})`} opacity={0.9}>
          <rect x={-40} y={h * 0.6} width={w + 80} height={h * 0.2} fill={`url(#fog-${uid})`} />
          <ellipse cx={w * 0.35} cy={h * 0.72} rx={w * 0.4} ry={h * 0.05} fill="#a8bcc7" opacity={0.08} />
          <ellipse cx={w * 0.68} cy={h * 0.78} rx={w * 0.32} ry={h * 0.045} fill="#a8bcc7" opacity={0.06} />
        </g>
      ) : null}

      {has('snow') ? <Particles type="snow" rng={rng} w={w} h={h} accent={accent} /> : null}
      {has('rain') ? <Particles type="rain" rng={rng} w={w} h={h} accent={accent} /> : null}
      {has('dust') ? <Particles type="spark" rng={rng} w={w} h={h} accent={accent} /> : null}
      {has('spark') ? <Particles type="spark" rng={rng} w={w} h={h} accent={accent} /> : null}
      {has('embers') ? <Particles type="embers" rng={rng} w={w} h={h} accent={accent} /> : null}

      <rect x={0} y={h * 0.82} width={w} height={h * 0.18} fill={`url(#ground-${uid})`} />
      <rect width={w} height={h} fill={`url(#vig-${uid})`} />
      {overlay ? <rect width={w} height={h} className="scene-grain" fill="transparent" /> : null}
      {children}
    </svg>
  )
}
