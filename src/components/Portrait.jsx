import { useMemo } from 'react'
import { seededRandom } from '../lib/random.js'
import { orgById } from '../data/people.js'

/**
 * 人物头像占位图
 * 正式资源缺失时使用：几何剪影 + 代号首字母 + 种族/组织标记。
 * 不使用生成图冒充真实干员立绘（见需求：图片与显示状态）。
 */

const EAR_SHAPES = {
  菲林: 'feline',
  鲁珀: 'lupo',
  卡特斯: 'cautus',
  库兰塔: 'kuranta',
  萨科塔: 'sankta',
  萨卡兹: 'sarkaz',
  黎博利: 'liberi',
  佩洛: 'perro',
  德拉克: 'dragon',
  龙: 'dragon',
  鬼: 'oni',
  阿斯兰: 'aslan',
  瓦伊凡: 'wyvern',
  阿戈尔: 'aegir',
  杜林: 'durin',
  温迪戈: 'wendigo',
}

function Ears({ kind, color }) {
  const stroke = '#0b0e11'
  const fill = color
  switch (kind) {
    case 'feline':
      return (
        <g>
          <polygon points="96,120 82,58 138,96" fill={fill} opacity="0.85" stroke={stroke} strokeWidth="2" />
          <polygon points="224,120 238,58 182,96" fill={fill} opacity="0.85" stroke={stroke} strokeWidth="2" />
        </g>
      )
    case 'lupo':
    case 'perro':
      return (
        <g>
          <polygon points="98,132 74,80 132,110" fill={fill} opacity="0.8" stroke={stroke} strokeWidth="2" />
          <polygon points="222,132 246,80 188,110" fill={fill} opacity="0.8" stroke={stroke} strokeWidth="2" />
        </g>
      )
    case 'cautus':
      return (
        <g>
          <ellipse cx="118" cy="52" rx="16" ry="46" fill={fill} opacity="0.7" transform="rotate(-12 118 52)" />
          <ellipse cx="202" cy="52" rx="16" ry="46" fill={fill} opacity="0.7" transform="rotate(12 202 52)" />
        </g>
      )
    case 'kuranta':
      return (
        <g>
          <polygon points="108,110 96,44 140,88" fill={fill} opacity="0.8" stroke={stroke} strokeWidth="2" />
          <polygon points="212,110 224,44 180,88" fill={fill} opacity="0.8" stroke={stroke} strokeWidth="2" />
        </g>
      )
    case 'sarkaz':
    case 'oni':
    case 'dragon':
    case 'wyvern':
    case 'wendigo':
      return (
        <g>
          <path d="M112 118 Q92 74 118 44 Q126 76 132 112 Z" fill={fill} opacity="0.9" stroke={stroke} strokeWidth="2" />
          <path d="M208 118 Q228 74 202 44 Q194 76 188 112 Z" fill={fill} opacity="0.9" stroke={stroke} strokeWidth="2" />
        </g>
      )
    case 'sankta':
      return (
        <g opacity="0.7">
          <path d="M84 150 Q58 118 74 84 Q86 120 104 138 Z" fill={fill} />
          <path d="M236 150 Q262 118 246 84 Q234 120 216 138 Z" fill={fill} />
        </g>
      )
    case 'liberi':
      return (
        <g opacity="0.75">
          <path d="M96 136 Q66 106 84 70 Q96 110 116 128 Z" fill={fill} />
          <path d="M224 136 Q254 106 236 70 Q224 110 204 128 Z" fill={fill} />
        </g>
      )
    case 'aslan':
      return (
        <g>
          <circle cx="103" cy="108" r="24" fill={fill} opacity="0.7" />
          <circle cx="217" cy="108" r="24" fill={fill} opacity="0.7" />
        </g>
      )
    case 'aegir':
      return (
        <g opacity="0.7">
          <path d="M92 142 Q62 120 78 84 Q92 118 112 134 Z" fill={fill} />
          <path d="M228 142 Q258 120 242 84 Q228 118 208 134 Z" fill={fill} />
        </g>
      )
    case 'durin':
      return null
    default:
      return null
  }
}

export default function Portrait({ person, className = '', showMeta = false, dim = false }) {
  const rng = useMemo(() => seededRandom(`portrait:${person.id}`, 3), [person.id])
  const color = person.color || '#9fb6c4'
  const kind = EAR_SHAPES[person.race] || 'none'
  const initial = (person.en || person.name || '?').replace(/[^A-Za-z]/g, '').slice(0, 1) || person.name.slice(0, 1)
  const org = orgById[person.org]
  const tilt = (rng() - 0.5) * 10

  return (
    <svg
      className={`portrait ${className}`}
      viewBox="0 0 320 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${person.name} 头像占位图`}
    >
      <defs>
        <linearGradient id={`pbg-${person.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#141b21" />
          <stop offset="55%" stopColor="#0c1116" />
          <stop offset="100%" stopColor="#080b0e" />
        </linearGradient>
        <radialGradient id={`pglow-${person.id}`} cx="50%" cy="34%" r="58%">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`pclip-${person.id}`}>
          <rect width="320" height="400" />
        </clipPath>
      </defs>
      <g clipPath={`url(#pclip-${person.id})`}>
        <rect width="320" height="400" fill={`url(#pbg-${person.id})`} />
        <rect width="320" height="400" fill={`url(#pglow-${person.id})`} />
        <g opacity={dim ? 0.5 : 1}>
          <g transform={`rotate(${tilt} 160 260)`}>
            <Ears kind={kind} color={color} />
            <path d="M160 168 Q212 168 218 226 Q224 288 196 320 Q176 342 160 342 Q144 342 124 320 Q96 288 102 226 Q108 168 160 168 Z" fill="#0a0e12" />
            <path
              d="M64 400 Q72 322 122 300 Q140 318 160 318 Q180 318 198 300 Q248 322 256 400 Z"
              fill="#0a0e12"
            />
            <path
              d="M160 168 Q212 168 218 226 Q224 288 196 320 Q176 342 160 342 Q144 342 124 320 Q96 288 102 226 Q108 168 160 168 Z"
              fill="none"
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="1.4"
            />
            <path d="M118 208 Q134 196 150 204" stroke={color} strokeOpacity="0.5" strokeWidth="1.6" fill="none" />
            <path d="M170 204 Q188 196 202 208" stroke={color} strokeOpacity="0.5" strokeWidth="1.6" fill="none" />
            <path d="M140 272 Q160 284 180 272" stroke={color} strokeOpacity="0.24" strokeWidth="1.4" fill="none" />
          </g>
          <text
            x="160"
            y="252"
            textAnchor="middle"
            fontFamily="'Times New Roman', Georgia, serif"
            fontSize="196"
            fill={color}
            opacity="0.16"
            letterSpacing="6"
          >
            {initial}
          </text>
          <g opacity="0.32" stroke={color} strokeWidth="1">
            <line x1="18" y1="24" x2="58" y2="24" />
            <line x1="18" y1="24" x2="18" y2="58" />
            <line x1="302" y1="376" x2="262" y2="376" />
            <line x1="302" y1="376" x2="302" y2="342" />
          </g>
          {showMeta ? (
            <g fontFamily="var(--font-mono, monospace)" fontSize="10" fill={color} opacity="0.72" letterSpacing="2">
              <text x="20" y="356">{person.nation}</text>
              <text x="20" y="372">{org?.name || '无所属'} · {person.race}</text>
            </g>
          ) : null}
        </g>
        <rect x="0.5" y="0.5" width="319" height="399" fill="none" stroke="#2a343d" strokeWidth="1" />
      </g>
    </svg>
  )
}
