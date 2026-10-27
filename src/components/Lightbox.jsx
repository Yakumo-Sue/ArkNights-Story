import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Scene from './Scene.jsx'
import Icon from './Icon.jsx'
import { storyById, personById, locationById } from '../data/index.js'
import { galleryCategories } from '../data/media.js'

export default function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index]

  useEffect(() => {
    if (!item) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [item, index, items.length, onClose, onIndex])

  if (!item) return null

  const story = item.storyId ? storyById[item.storyId] : null
  const person = item.people?.[0] ? personById[item.people[0]] : null
  const place = item.location ? locationById[item.location] : null
  const category = galleryCategories.find((c) => c.id === item.category)

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="lightbox-backdrop" onClick={onClose} aria-label="关闭大图" />
      <div className="lightbox-inner">
        <header className="lightbox-head">
          <div>
            <span className="eyebrow">{category?.label ?? '图集'} · {item.ratio}</span>
            <h2>{item.title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </header>

        <div className="lightbox-stage">
          <Scene variant={item.scene} seed={item.title.length} />

        </div>

        <div className="lightbox-foot">
          <div className="lightbox-caption">
            <p>{item.caption}</p>
            <span className="muted">{item.source}</span>
          </div>
          <div className="lightbox-links">
            {story ? <Link to={`/stories/${story.id}`} onClick={onClose}>所属剧情 · {story.title}</Link> : null}
            {person ? <Link to={`/people/${person.id}`} onClick={onClose}>人物 · {person.name}</Link> : null}
            {place ? <Link to={`/map?loc=${place.id}`} onClick={onClose}>地点 · {place.name}</Link> : null}
          </div>
        </div>

        <button type="button" className="lightbox-nav is-prev" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label="上一张">
          <Icon name="chevronLeft" size={20} />
        </button>
        <button type="button" className="lightbox-nav is-next" onClick={() => onIndex((index + 1) % items.length)} aria-label="下一张">
          <Icon name="chevronRight" size={20} />
        </button>
        <span className="lightbox-counter">{index + 1} / {items.length}</span>
      </div>
    </div>,
    document.body,
  )
}
