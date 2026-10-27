import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  locations,
  locationById,
  mapLayers,
  pendingLocations,
  MAP_BASE,
  locationTypes,
} from '../data/geography.js'
import { storyById, storyTypes, personById, peopleForStory } from '../data/index.js'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { Breadcrumb, CountPill, DataBadge, Drawer, Tag } from '../components/ui.jsx'
import { useIsMobile } from '../lib/hooks.js'

const W = MAP_BASE.width
const H = MAP_BASE.height
const YEARS = ['all', 1096, 1097, 1098, 1099, 1100]

export default function MapPage() {
  const { locationId } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const initialLoc = locationId ?? params.get('loc')
  const initialYear = Number(params.get('year'))
  const [selectedId, setSelectedId] = useState(initialLoc && locationById[initialLoc] ? initialLoc : null)
  const [hoverId, setHoverId] = useState(null)
  const [year, setYear] = useState(Number.isFinite(initialYear) && initialYear > 0 ? initialYear : 'all')
  const [layers, setLayers] = useState(() => new Set(mapLayers.filter((l) => l.default).map((l) => l.id)))
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H })
  const [query, setQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const svgRef = useRef(null)
  const dragRef = useRef(null)

  const selected = selectedId ? locationById[selectedId] : null
  const contextYear = params.get('year')

  const yearStories = useMemo(() => {
    if (year === 'all') return null
    const set = new Set()
    for (const l of locations) {
      for (const sid of l.stories) {
        const s = storyById[sid]
        if (!s) continue
        if (s.fragments.some((f) => f.from <= year && year <= f.to)) set.add(sid)
      }
    }
    return set
  }, [year])

  const visibleLocations = useMemo(
    () =>
      locations.filter((l) => {
        const type = locationTypes[l.type]
        if (!layers.has(type.layer)) return false
        if (year !== 'all' && yearStories) {
          const inYear = l.stories.some((sid) => yearStories.has(sid))
          if (l.type !== 'historic' && !inYear) return false
        }
        return true
      }),
    [layers, year, yearStories],
  )

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return locations.filter((l) => `${l.name} ${l.en} ${l.summary}`.toLowerCase().includes(q)).slice(0, 7)
  }, [query])

  const storyEvents = useMemo(() => {
    if (year === 'all') return []
    return locations
      .flatMap((l) =>
        l.stories
          .map((sid) => storyById[sid])
          .filter((s) => s && s.fragments.some((f) => f.from <= year && year <= f.to))
          .map((s) => ({ ...s, loc: l })),
      )
      .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
      .slice(0, 12)
  }, [year])

  const selectLocation = (id) => {
    setSelectedId(id)
    if (isMobile) setPanelOpen(true)
  }

  const focusOn = (loc) => {
    setView({ x: loc.x - W * 0.22, y: loc.y - H * 0.22, w: W * 0.45, h: H * 0.28 })
    setQuery('')
  }

  useEffect(() => {
    if (initialLoc && locationById[initialLoc]) {
      const loc = locationById[initialLoc]
      setView({ x: loc.x - W * 0.22, y: loc.y - H * 0.22, w: W * 0.45, h: H * 0.28 })
    }
    if (params.get('story')) {
      const rel = peopleForStory(params.get('story'))
      if (rel.length === 0) return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zoomBy = (factor) => {
    setView((v) => {
      const w = Math.min(2200, Math.max(320, v.w * factor))
      const h = (w * H) / W
      const cx = v.x + v.w / 2
      const cy = v.y + v.h / 2
      return { x: cx - w / 2, y: cy - h / 2, w, h }
    })
  }

  useEffect(() => {
    const el = svgRef.current
    if (!el) return undefined
    const onWheel = (e) => {
      e.preventDefault()
      zoomBy(e.deltaY > 0 ? 1.1 : 0.9)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e) => {
    if (e.target.closest('[data-marker]')) return
    dragRef.current = { x: e.clientX, y: e.clientY, view }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setView((v) => ({
      ...v,
      x: d.view.x - (e.clientX - d.x) * (d.view.w / rect.width),
      y: d.view.y - (e.clientY - d.y) * (d.view.h / rect.height),
    }))
  }
  const onPointerUp = () => {
    dragRef.current = null
  }

  const toggleLayer = (id) => {
    setLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const relatedPeople = useMemo(() => {
    if (!selected) return []
    const ids = new Set()
    for (const sid of selected.stories) for (const p of peopleForStory(sid)) ids.add(p.id)
    return [...ids].map((id) => personById[id]).filter(Boolean)
  }, [selected])
  const relatedStories = selected ? selected.stories.map((id) => storyById[id]).filter((s) => s) : []

  return (
    <div className="page map-page">
      <header className="page-head">
        <div className="page-head-main">
          <Breadcrumb items={[{ label: '总览', to: '/overview' }, { label: '泰拉地图' }]} />
          <span className="eyebrow">TERRA MAP · INTERNAL COORDINATES</span>
          <h1>泰拉地图</h1>
          <p className="page-lede">
            以核对后的官方泰拉地图为底图，使用图像内部坐标标点，不是地球地图，也不套用经纬度。位置未明的条目进入「位置待定」列表。
          </p>
        </div>
        <div className="page-head-side">
          <DataBadge status="demo">底图 {MAP_BASE.version}</DataBadge>
        </div>
      </header>

      {contextYear ? (
        <div className="context-bar">
          <Icon name="map" size={15} />
          <span>来自时间轴：{contextYear} 年 · 已定位相关地点</span>
          <button type="button" className="context-clear" onClick={() => setParams({}, { replace: true })}>
            清除上下文 <Icon name="close" size={12} />
          </button>
        </div>
      ) : null}

      <div className="map-toolbar">
        <div className="map-search">
          <Icon name="search" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索国家、城市或区域"
            aria-label="搜索地点"
          />
          {matches.length ? (
            <ul className="map-suggest">
              {matches.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => { selectLocation(l.id); focusOn(l) }}>
                    <span>{l.name}</span>
                    <em>{l.en}</em>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="map-layers" role="group" aria-label="图层">
          {mapLayers.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`chip ${layers.has(l.id) ? 'is-active' : ''}`}
              aria-pressed={layers.has(l.id)}
              onClick={() => toggleLayer(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <label className="select-wrap">
          <span>年代</span>
          <select value={year} onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y === 'all' ? '全部年代' : `${y} 年`}</option>)}
          </select>
        </label>

        <span className="map-count"><CountPill>{visibleLocations.length}</CountPill> 个标点</span>
        <button type="button" className="chip chip-ghost" onClick={() => setPendingOpen(true)}>
          <Icon name="clock" size={13} /> 位置待定 {pendingLocations.length}
        </button>
      </div>

      <div className="map-body">
        <div className="map-canvas">
          <svg
            ref={svgRef}
            className="map-svg"
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            role="application"
            aria-label="泰拉地图，可拖拽平移、滚轮缩放"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <radialGradient id="sea" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#0b151b" />
                <stop offset="100%" stopColor="#050a0d" />
              </radialGradient>
              <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#1d2a32" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="land" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#141f26" />
                <stop offset="55%" stopColor="#0f181e" />
                <stop offset="100%" stopColor="#0a1217" />
              </linearGradient>
            </defs>

              <rect x={-500} y={-500} width={W + 1000} height={H + 1000} fill="url(#sea)" />
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={-500} y1={70 + i * 110} x2={W + 500} y2={70 + i * 110} stroke="#16242b" strokeWidth="0.7" opacity="0.55" />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v${i}`} x1={100 + i * 170} y1={-500} x2={100 + i * 170} y2={H + 500} stroke="#16242b" strokeWidth="0.7" opacity="0.55" />
            ))}
            {[200, 400, 600, 800, 1000, 1200, 1400].map((x) => (
              <text key={`gx${x}`} x={x} y={H - 16} fill="#22333d" fontSize="10" letterSpacing="2" textAnchor="middle" fontFamily="monospace">
                {x}
              </text>
            ))}
            {[200, 400, 600, 800].map((y) => (
              <text key={`gy${y}`} x={16} y={y} fill="#22333d" fontSize="10" letterSpacing="2" fontFamily="monospace">
                {y}
              </text>
            ))}

            <g className="landmasses">
              <path
                d="M 90 380 C 120 260, 250 190, 400 200 C 500 170, 580 210, 610 300 C 700 280, 780 330, 800 420 C 880 430, 920 380, 960 300 C 1010 200, 1120 190, 1180 280 C 1250 330, 1240 420, 1200 480 C 1300 520, 1400 470, 1480 500 C 1520 560, 1470 640, 1400 690 C 1370 780, 1280 820, 1180 800 C 1100 850, 1000 830, 960 760 C 900 820, 800 880, 700 850 C 640 900, 540 900, 500 840 C 420 880, 330 860, 300 790 C 210 800, 150 740, 160 660 C 100 620, 70 520, 90 380 Z"
                fill="url(#land)"
                stroke="#2b3a44"
                strokeWidth="1.4"
              />
              <path
                d="M 90 380 C 120 260, 250 190, 400 200 C 500 170, 580 210, 610 300 C 700 280, 780 330, 800 420 C 880 430, 920 380, 960 300 C 1010 200, 1120 190, 1180 280 C 1250 330, 1240 420, 1200 480 C 1300 520, 1400 470, 1480 500 C 1520 560, 1470 640, 1400 690 C 1370 780, 1280 820, 1180 800 C 1100 850, 1000 830, 960 760 C 900 820, 800 880, 700 850 C 640 900, 540 900, 500 840 C 420 880, 330 860, 300 790 C 210 800, 150 740, 160 660 C 100 620, 70 520, 90 380 Z"
                fill="url(#hatch)"
                opacity="0.4"
              />
              {/* 北方冰原 */}
              <path
                d="M 540 200 C 560 120, 640 60, 760 70 C 850 70, 900 120, 880 190 C 830 220, 740 230, 660 220 C 610 216, 570 212, 540 200 Z"
                fill="url(#land)"
                stroke="#2b3a44"
                strokeWidth="1.2"
              />
              {/* 东国列岛 */}
              <path d="M 1360 440 C 1400 410, 1460 430, 1480 480 C 1495 530, 1450 560, 1410 540 C 1375 522, 1345 470, 1360 440 Z" fill="url(#land)" stroke="#2b3a44" strokeWidth="1.2" />
              {/* 汐斯塔 */}
              <path d="M 300 780 C 320 762, 352 770, 356 792 C 360 812, 330 824, 308 812 C 296 805, 292 790, 300 780 Z" fill="url(#land)" stroke="#2b3a44" strokeWidth="1" />
              {/* 阿戈尔海域标记 */}
              <g opacity="0.55">
                {Array.from({ length: 7 }).map((_, i) => (
                  <path key={i} d={`M ${60 + i * 26} ${300 + i * 30} q 14 -8 28 0`} fill="none" stroke="#3d5a67" strokeWidth="1" />
                ))}
              </g>

              {/* 山脉与河流（示意，不作为地理依据） */}
              <g stroke="#2b3d47" fill="none" opacity="0.6" strokeLinejoin="round">
                {[[300, 300], [500, 292], [660, 340], [800, 330], [980, 350], [1180, 420], [420, 560], [700, 620], [980, 700], [1250, 750]].map(
                  ([x, y], i) => (
                    <path key={i} d={`M${x - 30} ${y + 12} L${x - 8} ${y - 14} L${x} ${y - 2} L${x + 9} ${y - 18} L${x + 32} ${y + 10}`} strokeWidth="1" />
                  ),
                )}
              </g>
              <g stroke="#3d5a67" strokeWidth="1" fill="none" opacity="0.4">
                <path d="M 384 224 C 420 300 470 350 520 470 C 560 560 640 600 700 646" />
                <path d="M 1000 320 C 1058 400 1100 460 1120 500 C 1160 560 1200 620 1244 652" />
                <path d="M 300 700 C 420 690 520 720 590 730" />
              </g>
              <g stroke="#42DDE5" strokeOpacity="0.09" strokeDasharray="3 7" fill="none">
                <path d="M 620 300 C 700 400 760 500 800 620" />
                <path d="M 900 500 C 960 560 1000 640 1040 720" />
                <path d="M 420 420 C 520 440 600 470 700 470" />
              </g>

              {/* 罗盘与比例尺 */}
              <g transform="translate(1490 118)" stroke="#3b4e59" fill="none" opacity="0.7">
                <circle r="26" />
                <circle r="19" strokeOpacity="0.5" />
                <path d="M 0 -30 V -19 M 0 19 V 30 M -30 0 H -19 M 19 0 H 30" />
                <polygon points="0,-18 5,0 0,6 -5,0" fill="#42DDE5" opacity="0.35" stroke="none" />
              </g>
              <text x="1490" y="88" textAnchor="middle" fill="#4c6270" fontSize="9" letterSpacing="3">N</text>
              <g transform="translate(1290 930)" stroke="#445c69" opacity="0.7">
                <path d="M 0 0 H 160 M 0 -5 V 5 M 80 -3 V 3 M 160 -5 V 5" />
                <text x="80" y="-12" textAnchor="middle" fill="#4c6270" fontSize="9" letterSpacing="2" stroke="none">
                  500 KM
                </text>
              </g>
            </g>

            {/* 已知行程（剧情路线） */}
            {layers.has('event') ? (
              <g className="map-route" fill="none">
                <path d="M 900 400 Q 1010 430 1120 500 Q 930 560 620 540" stroke="#42DDE5" strokeWidth="1.2" strokeDasharray="6 5" opacity="0.5" />
                <path d="M 620 540 Q 500 560 380 580" stroke="#42DDE5" strokeWidth="1.2" strokeDasharray="6 5" opacity="0.35" />
              </g>
            ) : null}

            {visibleLocations.map((loc) => {
              const type = locationTypes[loc.type]
              const active = selectedId === loc.id
              const hovered = hoverId === loc.id
              const showLabel = active || hovered || view.w < 900 || loc.type === 'nation'
              const dimmed = year !== 'all' && loc.stories.length === 0
              return (
                <g
                  key={loc.id}
                  data-marker
                  transform={`translate(${loc.x} ${loc.y})`}
                  className={`map-marker map-marker-${loc.type} ${active ? 'is-active' : ''} ${dimmed ? 'is-dim' : ''}`}
                  onClick={() => selectLocation(loc.id)}
                  onMouseEnter={() => setHoverId(loc.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      selectLocation(loc.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${loc.name}，${type.label}`}
                >
                  {active ? <circle r={loc.type === 'nation' ? 22 : 16} fill="none" stroke="#42DDE5" strokeOpacity="0.45" /> : null}
                  {loc.type === 'nation' ? (
                    <polygon points="0,-9 8,0 0,9 -8,0" fill="#0b141a" stroke="#9fb6c4" strokeOpacity={active ? 0.95 : 0.6} />
                  ) : loc.type === 'sea' ? (
                    <circle r={7} fill="#0b141a" stroke="#6fa8a8" strokeDasharray="2 2" />
                  ) : loc.type === 'historic' ? (
                    <rect x={-6} y={-6} width={12} height={12} fill="#0b141a" stroke="#9a8f7a" strokeDasharray="2 2" transform="rotate(45)" />
                  ) : (
                    <circle r={active ? 6 : 4.5} fill="#0b141a" stroke={active ? '#42DDE5' : '#b9c9d2'} />
                  )}
                  {active ? <circle r={3} fill="#42DDE5" /> : null}
                  <text y={-14} textAnchor="middle" className={`map-label ${showLabel ? 'is-visible' : ''}`}>
                    {loc.name}
                  </text>
                  <text y={20} textAnchor="middle" className={`map-label-en ${showLabel ? 'is-visible' : ''}`}>
                    {loc.en}
                  </text>
                </g>
              )
            })}

            {layers.has('event')
              ? storyEvents.map((s, i) => (
                  <g key={s.id} transform={`translate(${s.loc.x + 26} ${s.loc.y - 26 + (i % 3) * 16})`} className="map-event" onClick={() => navigate(`/stories/${s.id}`)}>
                    <rect x={-3} y={-3} width={6} height={6} fill="#42DDE5" opacity="0.7" transform="rotate(45)" />
                  </g>
                ))
              : null}
          </svg>

          <div className="map-controls">
            <button type="button" className="icon-btn" onClick={() => zoomBy(1.2)} aria-label="缩小">
              <Icon name="minus" size={15} />
            </button>
            <button type="button" className="icon-btn" onClick={() => zoomBy(0.82)} aria-label="放大">
              <Icon name="plus" size={15} />
            </button>
            <button type="button" className="icon-btn" onClick={() => setView({ x: 0, y: 0, w: W, h: H })} aria-label="复位">
              <Icon name="reset" size={15} />
            </button>
          </div>

          <div className="map-caption">
            <span>底图版本 {MAP_BASE.version}</span>
            <span>坐标：图像内部像素，非经纬度</span>
          </div>
        </div>

        {!isMobile ? (
          <LocationPanel
            location={selected}
            stories={relatedStories}
            people={relatedPeople}
            onPick={(id) => { selectLocation(id); const l = locationById[id]; if (l) focusOn(l) }}
          />
        ) : null}
      </div>

      {isMobile ? (
        <Drawer open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.name ?? '地点'} eyebrow="LOCATION FILE" width={420}>
          <LocationPanel location={selected} stories={relatedStories} people={relatedPeople} onPick={(id) => { selectLocation(id); setPanelOpen(false) }} embedded />
        </Drawer>
      ) : null}

      <Drawer open={pendingOpen} onClose={() => setPendingOpen(false)} title="位置待定" eyebrow="LOCATION UNKNOWN" width={460}>
        <p className="drawer-note">未明确公开位置的条目只给出大致区域或单独列表，不在地图上补画精确坐标。</p>
        <ul className="pending-list">
          {pendingLocations.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>
              <span>{p.type}</span>
              <p>{p.note}</p>
              <em>{p.source}</em>
            </li>
          ))}
        </ul>
      </Drawer>

      <p className="page-footnote">
        国家标记只覆盖公开位置明确的条目；历史政体、海域与位置未知条目分开管理。社区地理推演以不同样式标记，不直接作为官方国界。
      </p>
    </div>
  )
}

function LocationPanel({ location, stories, people, onPick, embedded = false }) {
  if (!location) {
    const nations = locations.filter((l) => l.type === 'nation')
    return (
      <aside className={`location-panel ${embedded ? 'is-embedded' : ''}`} aria-label="地点档案">
        <div className="location-head">
          <span className="eyebrow">TERRA MAP · LOCATION INDEX</span>
          <h2>地点档案</h2>
          <p className="location-en">SELECT A MARKER</p>
        </div>
        <p className="location-summary">
          点击地图上的标记查看国家、城市或地区的简介、历史、相关剧情与来源；也可以使用上方搜索直接定位。
        </p>
        <section className="location-sub">
          <h4>首批国家目录</h4>
          <div className="map-country-grid">
            {nations.map((l) => (
              <button key={l.id} type="button" onClick={() => onPick?.(l.id)}>
                {l.name}
                <em>{l.precision}</em>
              </button>
            ))}
          </div>
        </section>
        <p className="muted map-panel-note">
          位置未明的条目在「位置待定」中单独列出；高卢属于历史政体，阿戈尔以海域图层呈现。
        </p>
      </aside>
    )
  }
  const type = locationTypes[location.type]
  return (
    <aside className={`location-panel ${embedded ? 'is-embedded' : ''}`} aria-label={`${location.name} 地点档案`}>
      <div className="location-head">
        <span className="eyebrow">{type.label} · {location.precision}</span>
        <h2>{location.name}</h2>
        <p className="location-en">{location.en}</p>
        <div className="location-tags">
          <Tag tone={location.status === '已灭亡' ? 'warn' : 'accent'}>{location.status}</Tag>
          <Tag tone="muted">{location.precision}</Tag>
        </div>
      </div>
      <p className="location-summary">{location.summary}</p>
      <div className="location-sections">
        <section>
          <h4>历史</h4>
          <p>{location.detail.history}</p>
        </section>
        <section>
          <h4>社会与治理</h4>
          <p>{location.detail.society}</p>
        </section>
        {location.detail.links?.map((text, i) => (
          <section key={i}>
            <h4>关联</h4>
            <p>{text}</p>
          </section>
        ))}
      </div>

      {stories.length ? (
        <section className="location-sub">
          <h4>相关剧情</h4>
          <ul>
            {stories.map((s) => (
              <li key={s.id}>
                <Link to={`/stories/${s.id}`}>
                  <span className="story-mini-year">{s.year.from}</span>
                  <span>{s.title}</span>
                  <em>{storyTypes[s.type]?.label}</em>
                  <Icon name="arrowRight" size={13} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {people.length ? (
        <section className="location-sub">
          <h4>相关人物</h4>
          <div className="location-people">
            {people.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/people/${p.id}`} className="location-person">
                <Portrait person={p} />
                <span>{p.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="location-sub">
        <h4>来源</h4>
        <p className="muted">{location.source}</p>
        <p className="muted">最后核对 2026-10-25 · 资料状态：待核对</p>
      </section>
    </aside>
  )
}


