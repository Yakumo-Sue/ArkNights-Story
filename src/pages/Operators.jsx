import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  people,
  personById,
  operatorForms,
  orgById,
  organizations,
  storyById,
  peopleForStory,
} from '../data/index.js'
import { useApp } from '../context/AppState.jsx'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { Breadcrumb, CountPill, EmptyState, SearchField, Tag, DataBadge } from '../components/ui.jsx'

const SORTS = [
  { value: 'release', label: '按实装时间' },
  { value: 'name', label: '按代号' },
  { value: 'rarity', label: '按星级' },
]

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)))
}

export default function Operators() {
  const [params, setParams] = useSearchParams()
  const { progress } = useApp()
  const [q, setQ] = useState('')
  const [nation, setNation] = useState('all')
  const [org, setOrg] = useState('all')
  const [race, setRace] = useState('all')
  const [cls, setCls] = useState('all')
  const [rarity, setRarity] = useState('all')
  const [firstStory, setFirstStory] = useState('all')
  const [readScope, setReadScope] = useState('all')
  const [sort, setSort] = useState('release')
  const [includeNonOperators, setIncludeNonOperators] = useState(false)

  const contextStoryId = params.get('story')
  const contextStory = contextStoryId ? storyById[contextStoryId] : null

  const readStories = useMemo(
    () => new Set(Object.entries(progress).filter(([, v]) => v?.read && Object.keys(v.read).length).map(([k]) => k)),
    [progress],
  )

  const cards = useMemo(() => {
    const forms = operatorForms.map((f) => ({
      id: f.id,
      personId: f.personId,
      name: f.name,
      en: f.en,
      rarity: f.rarity,
      cls: f.cls,
      release: f.release,
      alter: !!f.alter,
      isOperator: true,
    }))
    const nonOperators = includeNonOperators
      ? people
          .filter((p) => !p.forms.length)
          .map((p) => ({
            id: `non-${p.id}`,
            personId: p.id,
            name: p.name,
            en: p.en,
            rarity: 0,
            cls: '非干员',
            release: '—',
            alter: false,
            isOperator: false,
          }))
      : []
    return [...forms, ...nonOperators]
  }, [includeNonOperators])

  const contextPersonIds = useMemo(
    () => (contextStoryId ? new Set(peopleForStory(contextStoryId).map((p) => p.id)) : null),
    [contextStoryId],
  )

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = cards.filter((c) => {
      const p = personById[c.personId]
      if (!p) return false
      if (contextPersonIds && !contextPersonIds.has(p.id)) return false
      if (nation !== 'all' && p.nation !== nation) return false
      if (org !== 'all' && p.org !== org) return false
      if (race !== 'all' && p.race !== race) return false
      if (cls !== 'all' && c.cls !== cls) return false
      if (rarity !== 'all' && String(c.rarity) !== String(rarity)) return false
      if (firstStory !== 'all' && p.firstStory !== firstStory) return false
      if (readScope === 'read' && !readStories.has(p.firstStory)) return false
      if (readScope === 'unread' && readStories.has(p.firstStory)) return false
      if (!query) return true
      return `${p.name} ${p.en} ${p.aliases.join(' ')} ${c.name}`.toLowerCase().includes(query)
    })
    list = [...list]
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    else if (sort === 'rarity') list.sort((a, b) => b.rarity - a.rarity)
    else list.sort((a, b) => String(b.release).localeCompare(String(a.release)))
    return list
  }, [cards, q, nation, org, race, cls, rarity, firstStory, readScope, sort, contextPersonIds, readStories])

  const nations = unique(people.map((p) => p.nation))
  const races = unique(people.map((p) => p.race))
  const classes = unique(operatorForms.map((f) => f.cls))
  const firstStories = unique(people.map((p) => p.firstStory)).filter((id) => storyById[id])

  const clear = () => {
    setQ('')
    setNation('all')
    setOrg('all')
    setRace('all')
    setCls('all')
    setRarity('all')
    setFirstStory('all')
    setReadScope('all')
    setParams({}, { replace: true })
  }

  const hasFilters =
    !!q || nation !== 'all' || org !== 'all' || race !== 'all' || cls !== 'all' || rarity !== 'all' || firstStory !== 'all' || readScope !== 'all' || !!(contextStoryId)

  return (
    <div className="page operators-page">
      <header className="page-head">
        <div className="page-head-main">
          <Breadcrumb items={[{ label: '总览', to: '/overview' }, { label: '干员档案' }]} />
          <span className="eyebrow">OPERATORS · STORY-FIRST INDEX</span>
          <h1>干员档案</h1>
          <p className="page-lede">
            为剧情阅读服务的检索：先找到人物、所属与登场故事，战斗数值不占据主要空间。未解锁身份不出现在自动补全里。
          </p>
        </div>
        <div className="page-head-side">
          <DataBadge status="draft">头像为替代资源</DataBadge>
          <label className="chip toggle-chip">
            <input type="checkbox" checked={includeNonOperators} onChange={(e) => setIncludeNonOperators(e.target.checked)} />
            含非干员角色
          </label>
          <label className="select-wrap">
            <span>排序</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {contextStory ? (
        <div className="context-bar">
          <Icon name="user" size={15} />
          <span>正在查看本活动相关人物：</span>
          <strong>{contextStory.title}</strong>
          <button type="button" className="context-clear" onClick={() => { setParams({}, { replace: true }) }}>
            返回全部 <Icon name="close" size={12} />
          </button>
        </div>
      ) : null}

      <div className="op-toolbar">
        <SearchField value={q} onChange={setQ} placeholder="搜索中文代号、英文代号、别名或人物名" className="op-search" autoFocus={false} />
        <label className="select-wrap">
          <span>国家 / 地区</span>
          <select value={nation} onChange={(e) => setNation(e.target.value)}>
            <option value="all">全部</option>
            {nations.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="select-wrap">
          <span>组织</span>
          <select value={org} onChange={(e) => setOrg(e.target.value)}>
            <option value="all">全部</option>
            {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
        <label className="select-wrap">
          <span>种族</span>
          <select value={race} onChange={(e) => setRace(e.target.value)}>
            <option value="all">全部</option>
            {races.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="select-wrap">
          <span>首次登场</span>
          <select value={firstStory} onChange={(e) => setFirstStory(e.target.value)}>
            <option value="all">全部</option>
            {firstStories.map((id) => <option key={id} value={id}>{storyById[id].title}</option>)}
          </select>
        </label>
        <label className="select-wrap">
          <span>已读范围</span>
          <select value={readScope} onChange={(e) => setReadScope(e.target.value)}>
            <option value="all">不限</option>
            <option value="read">已读故事</option>
            <option value="unread">未读故事</option>
          </select>
        </label>
        <label className="select-wrap">
          <span>职业</span>
          <select value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value="all">全部</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="select-wrap">
          <span>星级</span>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="all">全部</option>
            {[6, 5, 4].map((r) => <option key={r} value={r}>{r} 星</option>)}
          </select>
        </label>
        <span className="op-count"><CountPill>{filtered.length}</CountPill> 个条目</span>
        {hasFilters ? (
          <button type="button" className="chip chip-ghost" onClick={clear}>清除筛选</button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="没有匹配的人物"
          action={<button type="button" className="btn btn-ghost btn-sm" onClick={clear}>清空筛选</button>}
        >
          同名条目会以国家或组织辅助识别；改名与多代号已合并到别名检索。
        </EmptyState>
      ) : (
        <div className="operator-grid">
          {filtered.map((card) => {
            const p = personById[card.personId]
            const orgInfo = orgById[p.org]
            const read = readStories.has(p.firstStory)
            return (
              <Link key={card.id} to={`/people/${p.id}`} className="op-card">
                <div className="op-card-art">
                  <Portrait person={p} />
                  <span className="op-card-form">
                    {!card.isOperator ? '非干员' : card.alter ? '异格' : '本体'}
                  </span>
                  {read ? <span className="op-card-read">已读</span> : null}

                </div>
                <div className="op-card-body">
                  <div className="op-card-title">
                    <h3>{card.name}</h3>
                    <span className="op-card-en">{card.en}</span>
                  </div>
                  <p className="op-card-sub">
                    {orgInfo?.name ?? '无所属'} · {p.nation}
                  </p>
                  <div className="op-card-tags">
                    <Tag>{card.cls}</Tag>
                    <Tag tone="muted">{p.race}</Tag>
                    {card.rarity ? (
                      <span className="rarity" aria-label={`${card.rarity} 星`}>
                        {Array.from({ length: card.rarity }).map((_, i) => <i key={i} />)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="page-footnote">
        卡片展示对应的人物形态；头像、半身与精英立绘在正式资源中就位后会分别保存。并非所有出现过的人物都是可招募干员。
      </p>
    </div>
  )
}


