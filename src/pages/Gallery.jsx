import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { galleryItems, galleryCategories } from '../data/media.js'
import { storyById, storyTypes } from '../data/index.js'
import Scene from '../components/Scene.jsx'
import Icon from '../components/Icon.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { Breadcrumb, CountPill, DataBadge, EmptyState } from '../components/ui.jsx'

export default function Gallery() {
  const [cat, setCat] = useState('all')
  const [storyId, setStoryId] = useState('all')
  const [openIndex, setOpenIndex] = useState(-1)

  const items = useMemo(() => {
    let list = galleryItems
    if (cat !== 'all') list = list.filter((g) => g.category === cat)
    if (storyId !== 'all') list = list.filter((g) => g.storyId === storyId)
    return list
  }, [cat, storyId])

  const storyOptions = useMemo(() => {
    const ids = [...new Set(galleryItems.map((g) => g.storyId).filter(Boolean))]
    return ids.map((id) => storyById[id]).filter(Boolean)
  }, [])


  return (
    <div className="page gallery-page">
      <header className="page-head">
        <div className="page-head-main">
          <Breadcrumb items={[{ label: '其他', to: '/more' }, { label: '游戏图集' }]} />
          <span className="eyebrow">GALLERY · CG / EVENT / CHARACTER / MAP</span>
          <h1>游戏图集</h1>
          <p className="page-lede">
            剧情 CG、活动视觉、角色图与地图按活动、人物和地区筛选。缩略图先加载，点开后放大、前后切换，支持键盘与退出。
          </p>
        </div>
        <div className="page-head-side">
          <DataBadge status="demo">替代画面</DataBadge>
          <span className="muted"><CountPill>{items.length}</CountPill> 张</span>
        </div>
      </header>

      <div className="gallery-toolbar">
        <div className="gallery-tabs" role="tablist" aria-label="图集分类">
          {galleryCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              className={cat === c.id ? 'is-active' : ''}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="select-wrap">
          <span>活动</span>
          <select value={storyId} onChange={(e) => setStoryId(e.target.value)}>
            <option value="all">全部</option>
            {storyOptions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
      </div>

      {items.length ? (
        <div className="gallery-grid">
          {items.map((item, i) => {
            const story = item.storyId ? storyById[item.storyId] : null
            return (
              <figure key={item.id} className="gallery-item" style={{ '--ratio': item.ratio.replace(' / ', '/') }}>
                <button type="button" className="gallery-thumb" onClick={() => setOpenIndex(i)} aria-label={`查看大图：${item.title}`}>
                  <Scene variant={item.scene} seed={i + 1} />
                  <span className="gallery-scrim" aria-hidden="true" />
                  <span className="gallery-zoom">
                    <Icon name="search" size={16} />
                  </span>
                </button>
                <figcaption>
                  <span className="gallery-title">{item.title}</span>
                  <span className="gallery-meta">
                    {story ? <Link to={`/stories/${story.id}`}>{story.title}</Link> : null}
                    {story ? <span>·</span> : null}
                    <span>{storyTypes[story?.type]?.label ?? '图集'}</span>
                  </span>
                </figcaption>
              </figure>
            )
          })}
        </div>
      ) : (
        <EmptyState title="没有符合筛选的图片" action={<button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCat('all'); setStoryId('all') }}>清空筛选</button>}>
          换一个分类或活动试试。
        </EmptyState>
      )}

      {openIndex >= 0 ? (
        <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(-1)} onIndex={setOpenIndex} />
      ) : null}

      <p className="page-footnote">
        封面、标题和图片均可直接查看；每张图都可回到所属活动、章节或人物档案。正式资源到位后将替换为核对后的官方图片并保留来源说明。
      </p>
    </div>
  )
}

