import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  personById,
  orgById,
  storyById,
  storyTypes,
  firstPlayableSegment,
  relations,
  relationTypes,
  locationById,
} from '../data/index.js'
import { useApp } from '../context/AppState.jsx'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { Breadcrumb, CountPill, DataBadge } from '../components/ui.jsx'
import NotFound from './NotFound.jsx'

export default function PersonPage() {
  const { personId } = useParams()
  const person = personById[personId]
  if (!person) return <NotFound />
  return <PersonBody key={person.id} person={person} />
}

function PersonBody({ person }) {
  const { progress } = useApp()
  const [formId, setFormId] = useState(person.forms[0]?.id ?? null)
  const form = person.forms.find((f) => f.id === formId) ?? null
  const org = orgById[person.org]

  const appearances = useMemo(
    () =>
      person.appearances
        .map((id) => storyById[id])
        .filter(Boolean)
        .sort((a, b) => a.year.from - b.year.from || a.release.order - b.release.order),
    [person.appearances],
  )

  const locations = useMemo(() => {
    const ids = new Set(appearances.map((s) => s.locationId).filter(Boolean))
    return [...ids].map((id) => locationById[id]).filter(Boolean)
  }, [appearances])

  const personRelations = useMemo(
    () => relations.filter((r) => (r.a === person.id || r.b === person.id)),
    [person.id],
  )

  const firstStory = storyById[person.firstStory]
  const firstSegment = firstStory ? firstPlayableSegment(firstStory) : null
  const readCount = appearances.filter((s) => progress?.[s.id]?.read && Object.keys(progress[s.id].read).length).length

  return (
    <div className="page person-page">
      <Breadcrumb items={[{ label: '总览', to: '/overview' }, { label: '干员档案', to: '/operators' }, { label: person.name }]} />

      <section className="person-hero">
        <div className="person-hero-art">
          <Portrait person={person} showMeta />
          <span className="person-hero-frame" aria-hidden="true" />
        </div>
        <div className="person-hero-info">
          <span className="eyebrow">{person.forms.length ? 'OPERATOR FILE' : 'PERSONNEL FILE · NON-OPERATOR'}</span>
          <h1>{person.name}</h1>
          <p className="person-en">{person.en}</p>
          <p className="person-tagline">{person.tagline}</p>

          <div className="person-aliases">
            <span>别名</span>
            {person.aliases.map((a) => (
              <span key={a}>
                <em>{a}</em>
              </span>
            ))}
          </div>

          <p className="person-bio">{person.bio}</p>

          <dl className="person-meta">
            <div><dt>国家 / 地区</dt><dd>{person.nation}</dd></div>
            <div><dt>所属</dt><dd>{org?.name ?? '无所属'}</dd></div>
            <div><dt>种族</dt><dd>{person.race}</dd></div>
            <div><dt>首次登场</dt><dd>{firstStory?.title ?? '待核对'}</dd></div>
          </dl>

          <div className="person-actions">
            {firstStory && firstSegment ? (
              <Link className="btn btn-primary" to={`/stories/${firstStory.id}/play/${firstSegment.id}`}>
                阅读首次登场
                <Icon name="arrowRight" size={15} />
              </Link>
            ) : null}
            <Link className="btn btn-ghost" to={`/relations?person=${person.id}`}>
              在关系网中查看
            </Link>
            <Link className="btn btn-ghost" to={`/map?loc=${person.firstStory ? firstStory.locationId : ''}`}>
              相关地点
            </Link>
          </div>
        </div>
      </section>

      <div className="person-body">
        <div className="person-main">
          {person.forms.length ? (
            <section className="person-section">
              <div className="section-head">
                <h2>形态</h2>
                <span className="section-en">FORMS</span>
                <span className="section-note">本体与异格关联同一人物，不新增独立人物节点</span>
              </div>
              <div className="form-tabs" role="tablist" aria-label="干员形态">
                {person.forms.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={formId === f.id}
                    className={`form-tab ${formId === f.id ? 'is-active' : ''}`}
                    onClick={() => setFormId(f.id)}
                  >
                    <span className="form-name">{f.name}</span>
                    <span className="form-meta">{f.cls} · {f.rarity}★</span>
                    {f.alter ? <span className="form-badge">异格</span> : null}
                  </button>
                ))}
              </div>
              {form ? (
                <div className="form-detail">
                  <div><span>形态编号</span><strong>{form.id}</strong></div>
                  <div><span>职业</span><strong>{form.cls}</strong></div>
                  <div><span>星级</span><strong>{form.rarity} 星</strong></div>
                  <div><span>实装</span><strong>{form.release}</strong></div>
                  <div><span>英文名</span><strong>{form.en}</strong></div>
                  <p className="form-note">
                    形态切换不等于新增亲属或同伴；图谱与关系只保留一个人物节点。
                  </p>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="person-section">
              <div className="section-head">
                <h2>非干员角色</h2>
                <span className="section-en">NON-OPERATOR</span>
              </div>
              <p className="person-note">
                该人物没有可招募形态，但拥有完整人物档案。是否可招募不影响其在剧情中的出场与关系记录。
              </p>
            </section>
          )}

          <section className="person-section">
            <div className="section-head">
              <h2>出场故事</h2>
              <span className="section-en">APPEARANCES</span>
              <span className="section-note">
                已读 {readCount} / {appearances.length}
              </span>
            </div>
            <ol className="appearance-list">
              {appearances.map((s, i) => {
                const seg = firstPlayableSegment(s)
                const isFirst = s.id === person.firstStory
                return (
                  <li key={s.id}>
                    <Link to={seg ? `/stories/${s.id}/play/${seg.id}` : `/stories/${s.id}`} className="appearance-item">
                      <span className="appearance-no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="appearance-year">{s.year.from}{s.year.to !== s.year.from ? `–${s.year.to}` : ''}</span>
                      <span className="appearance-body">
                        <span className="appearance-title">{s.title}</span>
                        <span className="appearance-sub">{s.episode ?? s.series} · {s.location}</span>
                      </span>
                      {isFirst ? <span className="appearance-badge">首次登场</span> : null}
                      <span className="appearance-type">{storyTypes[s.type]?.label}</span>
                      <Icon name="arrowRight" size={14} />
                    </Link>
                  </li>
                )
              })}
            </ol>
            <p className="section-footnote">主角 / 重要配角 / 短暂提及的逐条标注待补录，当前只区分首次登场与关联出场。</p>
          </section>

          <section className="person-section">
            <div className="section-head">
              <h2>关系</h2>
              <span className="section-en">EVIDENCE</span>
              <span className="section-note"><CountPill>{personRelations.length}</CountPill> 条</span>
            </div>
            {personRelations.length ? (
              <ul className="person-rel-list">
                {personRelations.map((r) => {
                  const other = personById[r.a === person.id ? r.b : r.a]
                  const type = relationTypes[r.type]
                  return (
                    <li key={r.id}>
                      <Link to={`/people/${other?.id}`} className="person-rel-item">
                        <span className="rel-type" style={{ color: type.color }}>{type.label}</span>
                        <strong>{other?.name}</strong>
                        <span className="rel-years">{r.since}–{r.until ?? '今'}</span>
                        <p>{r.note}</p>
                        <span className="rel-source">{r.source} · {r.certainty === 'stated' ? '明示' : '推定'}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="person-note">该人物的关系记录尚未补充。</p>
            )}
          </section>
        </div>

        <aside className="person-aside">
          <section>
            <h3>相关地点</h3>
            <div className="person-place-list">
              {locations.map((l) => (
                <Link key={l.id} to={`/map?loc=${l.id}`} className="chip">
                  <Icon name="pin" size={13} />
                  {l.name}
                </Link>
              ))}
              {!locations.length ? <span className="muted">待补录</span> : null}
            </div>
          </section>

          <section>
            <h3>档案与模组线索</h3>
            <p className="muted">
              档案文本按时期区分「该时间段已知情况」「后来补充的信息」与「编辑推定」。当前演示数据只收录人物简介，模组与档案原文待补录。
            </p>
            <span className="status-inline"><Icon name="clock" size={13} /> 最后核对 2026-10-25</span>
          </section>

          <section>
            <h3>资料来源</h3>
            <ul className="source-mini">
              {appearances.slice(0, 4).map((s) => (
                <li key={s.id}>{s.source}</li>
              ))}
            </ul>
            <DataBadge status="draft">人物资料待核对</DataBadge>
          </section>

          <section>
            <h3>关联档案</h3>
            <Link to="/relations" className="btn btn-tiny">前往关系图谱</Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

