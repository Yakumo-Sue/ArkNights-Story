import {OFFICIAL_BRAND} from '../data/homeMedia.js'

/** 罗德岛 / 巴别塔的旧占位徽记；导航使用下载至本地的国服官网 Logo。 */

export function RhodesMark({ className = '', showText = true, tone = '#E8ECEF' }) {
  return (
    <svg className={className} viewBox="0 0 260 250" role="img" aria-label="罗德岛徽记（替代资源）">
      <g fill="none" stroke={tone} strokeWidth="1.4" strokeLinejoin="round">
        <path d="M130 14 L246 226 L14 226 Z" opacity="0.9" />
        <path d="M130 34 L226 212 L34 212 Z" opacity="0.28" />
        <path d="M130 46 L216 208 L44 208 Z" opacity="0.16" />
      </g>
      <g fill={tone}>
        <path d="M112 206 L112 118 L120 118 L120 100 L129 100 L129 118 L138 118 L138 100 L147 100 L147 118 L156 118 L156 206 Z" opacity="0.96" />
        <path d="M82 206 Q130 176 178 206 Z" opacity="0.96" />
        <circle cx="130" cy="86" r="2.4" opacity="0.7" />
      </g>
      <g stroke={tone} strokeWidth="1.2" opacity="0.55">
        <path d="M20 216 L52 216" />
        <path d="M208 216 L240 216" />
      </g>
      {showText ? (
        <text
          x="130"
          y="242"
          textAnchor="middle"
          fill={tone}
          fontFamily="'Times New Roman', Georgia, serif"
          fontSize="12"
          letterSpacing="4.2"
          opacity="0.92"
        >
          RHODES ISLAND
        </text>
      ) : null}
      <g fill={tone} opacity="0.7">
        <path d="M18 210 l5 -8 l5 8 Z" />
        <path d="M232 210 l5 -8 l5 8 Z" />
      </g>
    </svg>
  )
}

export function BabelMark({ className = '', tone = '#c9d6de' }) {
  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-label="巴别塔徽记（替代资源）">
      <g fill="none" stroke={tone} strokeWidth="1">
        <circle cx="120" cy="120" r="96" opacity="0.22" />
        <circle cx="120" cy="120" r="76" opacity="0.14" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2
          const r1 = 96
          const r2 = i % 4 === 0 ? 108 : 101
          return (
            <line
              key={i}
              x1={120 + Math.cos(a) * r1}
              y1={120 + Math.sin(a) * r1}
              x2={120 + Math.cos(a) * r2}
              y2={120 + Math.sin(a) * r2}
              opacity="0.4"
            />
          )
        })}
      </g>
      <g fill={tone}>
        <path d="M106 190 L106 104 L114 104 L114 86 L123 86 L123 104 L132 104 L132 86 L141 86 L141 104 L150 104 L150 190 Z" opacity="0.92" />
        <path d="M88 190 Q120 166 152 190 Z" opacity="0.92" />
        <rect x="119" y="42" width="2" height="26" opacity="0.6" />
        <circle cx="120" cy="38" r="2.2" opacity="0.8" />
      </g>
      <g stroke={tone} strokeWidth="1" opacity="0.22">
        <line x1="24" y1="120" x2="216" y2="120" />
        <line x1="120" y1="24" x2="120" y2="216" />
      </g>
    </svg>
  )
}

export function ArknightsMark({ className = '' }) {
  return (
    <img
      className={`ark-brand-logo ${className}`}
      src={OFFICIAL_BRAND.src}
      alt="明日方舟 ARKNIGHTS"
      width="254"
      height="119"
      decoding="async"
      fetchPriority="high"
    />
  )
}
