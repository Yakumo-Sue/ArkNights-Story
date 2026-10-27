import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  worldChapters,
  worldEntries,
  entriesByChapter,
  entryById,
  storyById,
  personById,
  locationById,
  storyTypes,
} from '../data/index.js'
import { SITE } from '../data/meta.js'
import { useApp } from '../context/AppState.jsx'
import { useIsMobile } from '../lib/hooks.js'
import Scene from '../components/Scene.jsx'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { Breadcrumb, DataBadge, Drawer, SegmentedControl } from '../components/ui.jsx'

export default function World() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { prefs, setPrefs } = useApp()
  const [dirOpen, setDirOpen] = useState(false)

  const entry = entryId ? entryById[entryId] : null
  const chapterId = entry?.chapter ?? worldChapters[0].id
  const chapter = worldChapters.find((c) => c.id === chapterId) ?? worldChapters[0]
  const chapterEntries = entriesByChapter(chapter.id)
  const activeEntry = entry ?? chapterEntries[0]

  const entryIndex = worldEntries.findIndex((e) => e.id === activeEntry.id)
  const prevEntry = worldEntries[entryIndex - 1]
  const nextEntry = worldEntries[entryIndex + 1]

  useEffect(() => {
    if (!entryId && chapterEntries[0]) {
      navigate(`/world/${chapterEntries[0].id}`, { replace: true })
    }
  }, [entryId, chapterEntries, navigate])

  const relatedStories = useMemo(
    () => (activeEntry.related.stories ?? []).map((id) => storyById[id]).filter(Boolean),
    [activeEntry],
  )
  const relatedPeople = useMemo(
    () => (activeEntry.related.people ?? []).map((id) => personById[id]).filter(Boolean),
    [activeEntry],
  )
  const relatedLocations = useMemo(
    () => (activeEntry.related.locations ?? []).map((id) => locationById[id]).filter(Boolean),
    [activeEntry],
  )

  const goChapter = (c) => {
    const first = entriesByChapter(c.id)[0]
    if (first) navigate(`/world/${first.id}`)
    setDirOpen(false)
  }

  if (!activeEntry) {
    return (
      <div className="page world-page">
        <p>设定资料尚未加载。</p>
      </div>
    )
  }

  return (
    <div className="page world-page">
      <div className="world-layout">
        <aside className="world-side" aria-label="设定章节">
          <div className="world-side-head">
            <span className="eyebrow">WORLD</span>
            <h1>泰拉设定</h1>
            <p>《大地巡旅》六章目录</p>
          </div>
          <ol className="world-chapters">
            {worldChapters.map((c) => {
              const active = c.id === chapter.id
              return (
                <li key={c.id} className={active ? 'is-active' : ''}>
                  <button type="button" onClick={() => goChapter(c)} aria-current={active ? 'true' : undefined}>
                    <span className="world-chapter-dot" aria-hidden="true" />
                    <span className="world-chapter-body">
                      <span className="world-chapter-no">{c.no}</span>
                      <span className="world-chapter-name">{c.name}</span>
                    </span>
                    {active ? <Icon name="chevronRight" size={14} /> : null}
                  </button>
                  {active ? (
                    <ul className="world-entry-list">
                      {chapterEntries.map((e) => (
                        <li key={e.id}>
                          <Link to={`/world/${e.id}`} className={e.id === activeEntry.id ? 'is-current' : ''}>
                            <span>{String(e.index).padStart(2, '0')}</span>
                            {e.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ol>
          <div className="world-side-foot">
            <Link to="/map">
              <Icon name="map" size={14} /> 泰拉地图
            </Link>
            <Link to="/relations">
              <Icon name="graph" size={14} /> 关系图谱
            </Link>
          </div>
        </aside>

        <div className={`world-main theme-${prefs.readingTheme}`}>
          <div className="world-topbar">
            <Breadcrumb items={[{ label: '设定', to: '/world' }, { label: `第 ${chapter.id} 章` }, { label: activeEntry.name }]} />
            <div className="world-topbar-actions">
              {isMobile ? (
                <button type="button" className="btn btn-tiny" onClick={() => setDirOpen(true)}>
                  <Icon name="list" size={14} /> 目录
                </button>
              ) : null}
              <SegmentedControl
                options={[
                  { value: 'paper', label: '纸面' },
                  { value: 'dark', label: '深色' },
                ]}
                value={prefs.readingTheme}
                onChange={(v) => setPrefs({ readingTheme: v })}
                ariaLabel="阅读主题"
                size="sm"
              />
            </div>
          </div>

          <article className="world-article">
            <span className="world-article-no">设定 / {chapter.no} · {chapter.name}</span>
            <header className="world-title">
              <h1>{activeEntry.name}</h1>
              <span className="world-title-en">{activeEntry.en}</span>
              <span className="world-title-rule" aria-hidden="true" />
            </header>

            <p className="world-lead">{activeEntry.lead}</p>

            <nav className="world-tabs" aria-label="本章词条">
              {chapterEntries.map((e) => (
                <Link key={e.id} to={`/world/${e.id}`} className={e.id === activeEntry.id ? 'is-active' : ''}>
                  {e.name}
                </Link>
              ))}
            </nav>

            <figure className="world-figure">
              <Scene variant={activeEntry.illustration} seed={activeEntry.index} />
              <figcaption>
                <span>图 · {activeEntry.name}</span>
                <em>场景示意图（程序化生成），正式版本替换为核对后的官方插图</em>
              </figcaption>
            </figure>

            <div className="world-copy">
              {activeEntry.sections.map((section, i) => (
                <section key={i} className="world-section">
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>

            <div className="world-related">
              {relatedStories.length ? (
                <section>
                  <div className="world-related-head">
                    <h3>关联剧情</h3>
                    <span>RELATED STORIES</span>
                  </div>
                  <ul className="world-story-list">
                    {relatedStories.map((s) => (
                      <li key={s.id}>
                        <Link to={`/stories/${s.id}`}>
                          <span className="world-story-art">
                            <Scene variant={s.cover} seed={s.release.order} />
                          </span>
                          <span className="world-story-body">
                            <strong>{s.title}</strong>
                            <em>{s.year.from} · {s.location} · {storyTypes[s.type]?.label}</em>
                          </span>
                          <Icon name="arrowRight" size={15} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="world-related-grid">
                {relatedPeople.length ? (
                  <div>
                    <div className="world-related-head"><h3>相关人物</h3><span>PEOPLE</span></div>
                    <div className="world-people">
                      {relatedPeople.map((p) => (
                        <Link key={p.id} to={`/people/${p.id}`} className="world-person">
                          <Portrait person={p} />
                          <span>{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {relatedLocations.length ? (
                  <div>
                    <div className="world-related-head"><h3>相关地点</h3><span>PLACES</span></div>
                    <div className="world-places">
                      {relatedLocations.map((l) => (
                        <Link key={l.id} to={`/map?loc=${l.id}`} className="chip">
                          <Icon name="pin" size={13} />
                          {l.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <footer className="world-source">
              <div className="world-source-head">
                <span className="eyebrow">SOURCE & REVISION</span>
                <DataBadge status="draft">词条待核对</DataBadge>
              </div>
              <p>{activeEntry.source.text}</p>
              <dl>
                <div><dt>版次 / 页码</dt><dd>{activeEntry.source.page}</dd></div>
                <div><dt>最后核对</dt><dd>{activeEntry.updated}</dd></div>
                <div><dt>内容截止</dt><dd>{SITE.contentCutoff}</dd></div>
              </dl>
              {activeEntry.source.refs?.length ? (
                <div className="world-refs">
                  {activeEntry.source.refs.map((ref) => (
                    <a key={ref} href={ref} target="_blank" rel="noreferrer noopener">
                      {ref}
                      <Icon name="external" size={12} />
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="muted">
                设定书带有世界内记录者与批注者的视角；涉及观点与未知事实时保留这种视角，后续剧情揭示另作补充。
              </p>
            </footer>

            <nav className="world-pager" aria-label="词条翻页">
              {prevEntry ? (
                <Link to={`/world/${prevEntry.id}`} className="world-pager-item">
                  <Icon name="arrowLeft" size={14} />
                  <span>
                    <em>上一词条</em>
                    {prevEntry.name}
                  </span>
                </Link>
              ) : <span />}
              {nextEntry ? (
                <Link to={`/world/${nextEntry.id}`} className="world-pager-item is-next">
                  <span>
                    <em>下一词条</em>
                    {nextEntry.name}
                  </span>
                  <Icon name="arrowRight" size={14} />
                </Link>
              ) : null}
            </nav>
          </article>
        </div>
      </div>

      <Drawer open={dirOpen} onClose={() => setDirOpen(false)} title="设定目录" eyebrow="WORLD INDEX" width={380}>
        <ol className="drawer-chapters">
          {worldChapters.map((c) => (
            <li key={c.id}>
              <button type="button" className={c.id === chapter.id ? 'is-active' : ''} onClick={() => goChapter(c)}>
                <span>{c.no}</span>
                {c.name}
              </button>
              {c.id === chapter.id ? (
                <ul>
                  {entriesByChapter(c.id).map((e) => (
                    <li key={e.id}>
                      <Link to={`/world/${e.id}`} className={e.id === activeEntry.id ? 'is-current' : ''} onClick={() => setDirOpen(false)}>
                        {e.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </Drawer>
    </div>
  )
}

