import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  people,
  personById,
  organizations,
  orgById,
  relations,
  relationTypes,
  storyById,
  peopleForStory,
  firstPlayableSegment,
} from '../data/index.js'
import { useIsMobile } from '../lib/hooks.js'
import { seededRandom } from '../lib/random.js'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { CountPill, Drawer, EmptyState, SearchField, SegmentedControl, Tag, Breadcrumb, DataBadge } from '../components/ui.jsx'

const ERAS = ['all', 1094, 1096, 1097, 1098, 1099, 1100]
const W = 1400
const H = 900

function layoutPeople() {
  const byOrg = new Map()
  for (const p of people) {
    if (!byOrg.has(p.org)) byOrg.set(p.org, [])
    byOrg.get(p.org).push(p)
  }
  const map = new Map()
  for (const org of organizations) {
    const members = byOrg.get(org.id) ?? []
    const ax = org.anchor.x * 1.18 + 40
    const ay = org.anchor.y + 20
    members.forEach((p, i) => {
      const rng = seededRandom(`node:${p.id}`, 1)
      if (i === 0) {
        map.set(p.id, { x: ax, y: ay, org: org.id })
        return
      }
      const ring = Math.floor((i - 1) / 6) + 1
      const angle = ((i - 1) % 6) * (Math.PI / 3) + (rng() - 0.5) * 0.3
      const radius = 52 + ring * 34
      map.set(p.id, {
        x: ax + Math.cos(angle) * radius,
        y: ay + Math.sin(angle) * radius * 0.8,
        org: org.id,
      })
    })
  }
  return map
}

export default function Relations() {
  const [params, setParams] = useSearchParams()
  const isMobile = useIsMobile()
  const positions = useMemo(layoutPeople, [])

  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H })
  const [year, setYear] = useState('all')
  const [typeFilter, setTypeFilter] = useState(() => new Set(Object.keys(relationTypes)))
  const [query, setQuery] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [expand2, setExpand2] = useState(false)
  const [mode, setMode] = useState('graph')
  const [panelOpen, setPanelOpen] = useState(false)
  const svgRef = useRef(null)
  const dragRef = useRef(null)

  /* 从总览携带上下文进入 */
  useEffect(() => {
    const storyId = params.get('story')
    const y = params.get('year')
    if (storyId) {
      const related = peopleForStory(storyId)
      if (related.length) {
        setSelectedId(related[0].id)
        setFocusMode(true)
      }
    }
    if (y && !Number.isNaN(Number(y))) setYear(Number(y))
    // 只在首次进入时应用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = selectedId ? personById[selectedId] : null

  const yearPass = (rel) => {
    if (year === 'all') return true
    const until = rel.until ?? 9999
    return rel.since <= year && year <= until
  }


  const visibleRelations = useMemo(
    () =>
      relations.filter(
        (r) => yearPass(r) && typeFilter.has(r.type),
      ),
    [year, typeFilter],
  )

  const visibleIds = useMemo(() => {
    if (!focusMode || !selected) return new Set(people.map((p) => p.id))
    const set = new Set([selected.id])
    for (const r of visibleRelations) {
      if (r.a === selected.id) set.add(r.b)
      if (r.b === selected.id) set.add(r.a)
    }
    if (expand2) {
      for (const id of [...set]) {
        for (const r of visibleRelations) {
          if (r.a === id) set.add(r.b)
          if (r.b === id) set.add(r.a)
        }
      }
    }
    return set
  }, [focusMode, selected, visibleRelations, expand2])

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase()
    return people.filter((p) => {
      if (!visibleIds.has(p.id)) return false
      if (!q) return true
      return `${p.name} ${p.en} ${p.aliases.join(' ')}`.toLowerCase().includes(q)
    })
  }, [visibleIds, query])

  const panelRelations = useMemo(
    () => (selected ? relations.filter((r) => (r.a === selected.id || r.b === selected.id)) : []),
    [selected],
  )

  const selectNode = (id) => {
    setSelectedId(id)
    if (isMobile) setPanelOpen(true)
  }

  const focusNode = () => {
    if (!selected) return
    const pos = positions.get(selected.id)
    if (!pos) return
    setView((v) => ({ ...v, x: pos.x - v.w / 2, y: pos.y - v.h / 2 }))
  }

  const zoomBy = (factor, anchor) => {
    setView((v) => {
      const cx = anchor?.x ?? v.x + v.w / 2
      const cy = anchor?.y ?? v.y + v.h / 2
      const w = Math.min(1900, Math.max(420, v.w * factor))
      const h = w * (H / W)
      return { x: cx - ((cx - v.x) / v.w) * w, y: cy - ((cy - v.y) / v.h) * h, w, h }
    })
  }

  const onWheel = (e) => {
    e.preventDefault()
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = view.x + ((e.clientX - rect.left) / rect.width) * view.w
    const py = view.y + ((e.clientY - rect.top) / rect.height) * view.h
    zoomBy(e.deltaY > 0 ? 1.12 : 0.89, { x: px, y: py })
  }

  useEffect(() => {
    const el = svgRef.current
    if (!el) return undefined
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  const onPointerDown = (e) => {
    if (e.target.closest('[data-gnode]')) return
    dragRef.current = { x: e.clientX, y: e.clientY, view }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const kx = d.view.w / rect.width
    const ky = d.view.h / rect.height
    setView((v) => ({ ...v, x: d.view.x - (e.clientX - d.x) * kx, y: d.view.y - (e.clientY - d.y) * ky }))
  }
  const onPointerUp = () => {
    dragRef.current = null
  }

  const clearContext = () => {
    setParams({}, { replace: true })
    setYear('all')
    setFocusMode(false)
    setExpand2(false)
    setQuery('')
    setSelectedId(null)
  }

  const toggleType = (type) => {
    setTypeFilter((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const contextStory = params.get('story') ? storyById[params.get('story')] : null
  const selectedFirstStory = selected ? storyById[selected.firstStory] : null
  const selectedSegment = selectedFirstStory ? firstPlayableSegment(selectedFirstStory) : null

  return (
    <div className="page relations-page">
      <header className="page-head">
        <div className="page-head-main">
          <Breadcrumb items={[{ label: '总览', to: '/overview' }, { label: '关系图谱' }]} />
          <span className="eyebrow">RELATIONS · EVIDENCE FIRST</span>
          <h1>关系图谱</h1>
          <p className="page-lede">
            以机构与地域分组，细线表示有证据的关系。默认展示组织概览，选中人物后聚焦其一跳关系，再按需展开第二层。
          </p>
        </div>
        <div className="page-head-side">
          <DataBadge status="draft">关系资料待核对</DataBadge>
          <SegmentedControl
            options={[
              { value: 'graph', label: '图谱' },
              { value: 'list', label: '列表' },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel="图谱或列表视图"
          />
        </div>
      </header>

      {contextStory ? (
        <div className="context-bar">
          <Icon name="graph" size={15} />
          <span>正在查看本活动相关人物：</span>
          <strong>{contextStory.title}</strong>
          <Link to={`/stories/${contextStory.id}`}>打开剧情</Link>
          <button type="button" className="context-clear" onClick={clearContext}>
            查看全部 <Icon name="close" size={12} />
          </button>
        </div>
      ) : null}

      <div className="relations-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="搜索人名或别名" className="rel-search" />
        <label className="select-wrap">
          <span>年代</span>
          <select value={year} onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            {ERAS.map((y) => (
              <option key={y} value={y}>{y === 'all' ? '全部年代' : `${y} 年`}</option>
            ))}
          </select>
        </label>
        <div className="rel-typetoggles" role="group" aria-label="关系类型">
          {Object.entries(relationTypes).map(([key, t]) => (
            <button
              key={key}
              type="button"
              className={`legend-chip ${typeFilter.has(key) ? 'is-on' : ''}`}
              style={{ '--rel-color': t.color }}
              onClick={() => toggleType(key)}
              aria-pressed={typeFilter.has(key)}
            >
              <span className="legend-line" data-dash={t.dash} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
        <span className="rel-count">
          <CountPill>{filteredPeople.length}</CountPill> 位人物 · <CountPill>{visibleRelations.length}</CountPill> 条关系
        </span>
        {focusMode ? (
          <>
            <button type="button" className={`chip ${expand2 ? 'is-active' : ''}`} onClick={() => setExpand2((v) => !v)}>
              {expand2 ? '收起第二层' : '展开第二层'}
            </button>
            <button type="button" className="chip chip-ghost" onClick={() => { setFocusMode(false); setExpand2(false) }}>
              恢复全景
            </button>
          </>
        ) : null}
      </div>

      {mode === 'list' ? (
        <RelationTable relations={visibleRelations} onSelect={selectNode} />
      ) : (
        <>
          <div className="relations-body">
          <div className="graph-wrap">
            <svg
              ref={svgRef}
              className="graph-svg"
              viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
              role="application"
              aria-label="人物关系图谱，可拖拽平移、滚轮缩放"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <defs>
                <pattern id="graph-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M80 0 H0 V80" fill="none" stroke="#1a2228" strokeWidth="0.6" />
                </pattern>
                <radialGradient id="graph-bg" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#0d1419" />
                  <stop offset="100%" stopColor="#070a0d" />
                </radialGradient>
              </defs>
              <rect x={-2000} y={-2000} width={6000} height={6000} fill="url(#graph-bg)" />
              <rect x={-2000} y={-2000} width={6000} height={6000} fill="url(#graph-grid)" opacity="0.55" />

              {organizations.map((org) => {
                const pos = { x: org.anchor.x * 1.18 + 40, y: org.anchor.y + 20 }
                const members = filteredPeople.filter((p) => p.org === org.id)
                if (!members.length) return null
                return (
                  <g key={org.id} pointerEvents="none">
                    <ellipse cx={pos.x} cy={pos.y} rx={118} ry={92} fill={org.color} opacity="0.035" />
                    <text x={pos.x} y={pos.y - 104} textAnchor="middle" className="graph-group-label" fill={org.color}>
                      {org.name}
                    </text>
                    <text x={pos.x} y={pos.y - 88} textAnchor="middle" className="graph-group-en" fill={org.color}>
                      {members.length} MEMBERS
                    </text>
                  </g>
                )
              })}

              {visibleRelations.map((r) => {
                const a = positions.get(r.a)
                const b = positions.get(r.b)
                if (!a || !b) return null
                if (!visibleIds.has(r.a) || !visibleIds.has(r.b)) return null
                const active = selected && (r.a === selected.id || r.b === selected.id)
                const type = relationTypes[r.type]
                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2 - 18
                return (
                  <g key={r.id} className={`graph-edge ${active ? 'is-active' : ''}`} pointerEvents="none">
                    <path
                      d={`M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                      fill="none"
                      stroke={type.color}
                      strokeWidth={active ? 1.6 : 0.9}
                      strokeDasharray={type.dash || undefined}
                      opacity={active ? 0.9 : selected ? 0.16 : 0.32}
                    />
                    {active ? (
                      <text x={mx} y={my - 4} textAnchor="middle" className="graph-edge-label" fill={type.color}>
                        {type.label}
                      </text>
                    ) : null}
                  </g>
                )
              })}

              {filteredPeople.map((p) => {
                const pos = positions.get(p.id)
                if (!pos) return null
                const org = orgById[p.org]
                const active = selected?.id === p.id
                const neighbor = selected
                  ? visibleRelations.some(
                      (r) => (r.a === selected.id && r.b === p.id) || (r.b === selected.id && r.a === p.id),
                    )
                  : false
                const dim = selected ? !active && !neighbor : false
                return (
                  <g
                    key={p.id}
                    data-gnode
                    transform={`translate(${pos.x} ${pos.y})`}
                    className={`graph-node ${active ? 'is-active' : ''} ${dim ? 'is-dim' : ''}`}
                    onClick={() => selectNode(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectNode(p.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.name}，${org?.name ?? ''}`}
                  >
                    {active ? <circle r={30} fill="none" stroke={org?.color ?? '#42DDE5'} strokeOpacity="0.5" /> : null}
                    <circle r={active ? 24 : 19} fill="#0c1418" stroke={org?.color ?? '#42DDE5'} strokeOpacity={active ? 0.95 : 0.55} strokeWidth={active ? 1.8 : 1.1} />
                    <text textAnchor="middle" dy="4" className="graph-node-initial" fill={p.color}>
                      {(p.en || p.name).slice(0, 1)}
                    </text>
                    <text y={active ? 44 : 36} textAnchor="middle" className={`graph-node-label ${active ? 'is-active' : ''}`}>
                      {p.name}
                    </text>
                  </g>
                )
              })}
            </svg>

            <div className="graph-controls">
              <button type="button" className="icon-btn" onClick={() => zoomBy(1.2)} aria-label="缩小">
                <Icon name="minus" size={15} />
              </button>
              <button type="button" className="icon-btn" onClick={() => zoomBy(0.83)} aria-label="放大">
                <Icon name="plus" size={15} />
              </button>
              <button type="button" className="icon-btn" onClick={() => setView({ x: 0, y: 0, w: W, h: H })} aria-label="复位视图">
                <Icon name="reset" size={15} />
              </button>
              <button type="button" className="icon-btn" onClick={focusNode} aria-label="聚焦选中人物">
                <Icon name="pin" size={15} />
              </button>
            </div>

            <div className="graph-legend">
              <span className="eyebrow">EVIDENCE</span>
              <p>细线 = 有出处的关系；虚线 = 曾所属或冲突。点击人物查看证据侧栏。</p>
            </div>
          </div>

          {!isMobile ? (
            <PersonPanel
              person={selected}
              relations={panelRelations}
              onSelect={selectNode}
              focusMode={focusMode}
              onFocus={() => {
                setFocusMode(true)
                focusNode()
              }}
              firstStory={selectedFirstStory}
              segment={selectedSegment}
            />
          ) : null}
          </div>
        </>
      )}

      {isMobile ? (
        <Drawer open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.name ?? '人物'} eyebrow="RELATION EVIDENCE" width={420}>
          <PersonPanel
            person={selected}
            relations={panelRelations}
            onSelect={selectNode}
            focusMode={focusMode}
            onFocus={() => {
              setFocusMode(true)
              setPanelOpen(false)
            }}
            firstStory={selectedFirstStory}
            segment={selectedSegment}
            embedded
          />
        </Drawer>
      ) : null}

      {!filteredPeople.length ? (
        <EmptyState title="没有符合条件的人物" action={<button type="button" className="btn btn-ghost btn-sm" onClick={clearContext}>清空筛选</button>}>
          当前年代、关系类型或搜索条件把所有人筛掉了。
        </EmptyState>
      ) : null}

      <p className="page-footnote">
        图谱只收录有出处的关系；共同出场不等于亲属或师承。争议解读与编辑推定不进入正式连线。
      </p>
    </div>
  )
}

function PersonPanel({ person, relations, onSelect, focusMode, onFocus, firstStory, segment, embedded = false }) {
  if (!person) {
    return (
      <aside className={`person-panel ${embedded ? 'is-embedded' : ''}`} aria-label="关系索引">
        <span className="eyebrow">RELATION INDEX</span>
        <h2 className="panel-empty-title">选择一位人物</h2>
        <p className="panel-bio">
          图谱以机构与地域分组。默认不选中任何人，点击节点查看身份、所属与关系证据；也可从下面的组织开始。
        </p>
        <ul className="panel-org-list">
          {organizations.map((org) => {
            const members = people.filter((p) => p.org === org.id)
            if (!members.length) return null
            return (
              <li key={org.id}>
                <button type="button" onClick={() => onSelect(members[0].id)}>
                  <span className="org-dot" style={{ background: org.color }} aria-hidden="true" />
                  <span>{org.name}</span>
                  <em>{members.length}</em>
                  <Icon name="chevronRight" size={12} />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="drawer-note">
          关系连线只在有出处时建立；共同出场不会自动生成亲属、师承或友谊。
        </p>
      </aside>
    )
  }
  const org = orgById[person.org]
  return (
    <aside className={`person-panel ${embedded ? 'is-embedded' : ''}`} aria-label={`${person.name} 关系详情`}>
      <div className="person-panel-head">
        <Portrait person={person} className="panel-portrait" />
        <div>
          <span className="eyebrow">PERSONNEL FILE</span>
          <h2>{person.name}</h2>
          <p className="panel-en">{person.en}</p>
          <p className="panel-tagline">{person.tagline}</p>
        </div>
      </div>
      <dl className="panel-meta">
        <div><dt>国家 / 地区</dt><dd>{person.nation}</dd></div>
        <div><dt>所属</dt><dd>{org?.name ?? '无所属'}</dd></div>
        <div><dt>种族</dt><dd>{person.race}</dd></div>
      </dl>
      <p className="panel-bio">{person.bio}</p>
      <div className="panel-actions">
        <Link className="btn btn-tiny" to={`/people/${person.id}`}>
          完整档案 <Icon name="arrowRight" size={13} />
        </Link>
        {firstStory && segment ? (
          <Link className="btn btn-tiny btn-ghost" to={`/stories/${firstStory.id}/play/${segment.id}`}>
            首次登场
          </Link>
        ) : null}
        <button type="button" className={`btn btn-tiny ${focusMode ? 'btn-ghost' : ''}`} onClick={onFocus}>
          {focusMode ? '重新聚焦' : '聚焦邻接'}
        </button>
      </div>

      <h3 className="panel-h3">关系证据 <CountPill>{relations.length}</CountPill></h3>
      <ul className="rel-list">
        {relations.map((r) => {
          const otherId = r.a === person.id ? r.b : r.a
          const other = personById[otherId]
          const type = relationTypes[r.type]
          return (
            <li key={r.id}>
              <button type="button" className="rel-item" onClick={() => onSelect(otherId)}>
                <span className="rel-item-top">
                  <span className="rel-type" style={{ color: type.color }}>{type.label}</span>
                  <strong>{other?.name}</strong>
                  <span className="rel-years">{r.since}–{r.until ?? '今'}</span>
                </span>
                <span className="rel-note">{r.note}</span>
                <span className="rel-source">{r.source} · {r.certainty === 'stated' ? '明示' : '推定'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function RelationTable({ relations, onSelect }) {
  return (
    <div className="relation-table-wrap">
      <table className="relation-table">
        <thead>
          <tr>
            <th scope="col">关系</th>
            <th scope="col">两端</th>
            <th scope="col">有效时间</th>
            <th scope="col">说明与出处</th>
            <th scope="col">确定程度</th>
          </tr>
        </thead>
        <tbody>
          {relations.map((r) => {
            const a = personById[r.a]
            const b = personById[r.b]
            const type = relationTypes[r.type]
            return (
              <tr key={r.id}>
                <td><span className="rel-type" style={{ color: type.color }}>{type.label}</span></td>
                <td>
                  <button type="button" className="link-btn" onClick={() => onSelect(r.a)}>{a?.name}</button>
                  <span className="muted"> — </span>
                  <button type="button" className="link-btn" onClick={() => onSelect(r.b)}>{b?.name}</button>
                </td>
                <td className="mono">{r.since}–{r.until ?? '今'}</td>
                <td>
                  <p>{r.note}</p>
                  <span className="muted">{r.source}</span>
                </td>
                <td><Tag tone={r.certainty === 'stated' ? 'ok' : 'warn'}>{r.certainty === 'stated' ? '明示' : '推定'}</Tag></td>
              </tr>
            )
          })}
          {relations.length === 0 ? (
            <tr><td colSpan={5} className="muted">没有符合筛选条件的关系。</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
