import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { CERTAINTY_HINT, CERTAINTY_LABEL } from '../data/meta.js'

export function Tag({ children, tone = 'default', className = '' }) {
  return <span className={`tag tag-${tone} ${className}`}>{children}</span>
}

export function DataBadge({ status = 'draft', children }) {
  const label = children ?? (status === 'demo' ? '示例数据' : status === 'verified' ? '已核对' : '待核对')
  return (
    <span className={`data-badge data-badge-${status}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export function SectionLabel({ en, cn, no, as: As = 'div', className = '' }) {
  return (
    <As className={`section-label ${className}`}>
      {no ? <span className="section-label-no">{no}</span> : null}
      <span className="section-label-cn">{cn}</span>
      {en ? <span className="section-label-en">{en}</span> : null}
    </As>
  )
}

export function CertaintyTag({ certainty = 'inferred', evidence, label }) {
  const [open, setOpen] = useState(false)
  const text = label ?? CERTAINTY_LABEL[certainty] ?? '推定'
  return (
    <span className={`certainty-wrap ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`certainty certainty-${certainty}`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title={CERTAINTY_HINT[certainty]}
      >
        {text}
      </button>
      {open ? (
        <span className="certainty-pop" role="note" onClick={(e) => e.stopPropagation()}>
          <strong>{text}</strong>
          <span>{CERTAINTY_HINT[certainty]}</span>
          {evidence ? <em>{evidence}</em> : null}
        </span>
      ) : null}
    </span>
  )
}

export function CountPill({ children }) {
  return <span className="count-pill">{children}</span>
}

export function EmptyState({ title = '没有结果', children, action }) {
  return (
    <div className="empty-state">
      <div className="empty-mark" aria-hidden="true">
        <Icon name="search" size={26} />
      </div>
      <h4>{title}</h4>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  )
}

export function SegmentedControl({ options, value, onChange, ariaLabel, className = '', size = 'md' }) {
  const id = useId()
  return (
    <div className={`segmented segmented-${size} ${className}`} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            id={`${id}-${opt.value}`}
            className={`segmented-item ${active ? 'is-active' : ''}`}
            onClick={() => onChange(opt.value)}
            title={opt.hint}
          >
            {opt.label}
            {opt.badge != null ? <span className="segmented-badge">{opt.badge}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ checked, onChange, label, id }) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <label className="toggle" htmlFor={inputId}>
      <input id={inputId} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-label">{label}</span>
    </label>
  )
}

export function SearchField({ value, onChange, placeholder = '搜索', onClear, autoFocus = false, className = '' }) {
  return (
    <div className={`search-field ${className}`}>
      <Icon name="search" size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => (onClear ? onClear() : onChange(''))} aria-label="清空搜索">
          <Icon name="close" size={14} />
        </button>
      ) : null}
    </div>
  )
}

/** 通用弹层：ESC 关闭、点击遮罩关闭、锁定背景滚动 */
function useOverlay(open, onClose) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => {
      const focusable = ref.current?.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])')
      focusable?.focus?.()
    }, 30)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])
  return ref
}

export function Drawer({ open, onClose, title, eyebrow, children, side = 'right', width = 420, footer }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null
  return createPortal(
    <div className={`overlay overlay-${side}`} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside
        className={`drawer drawer-${side}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        style={{ '--drawer-w': `${width}px` }}
      >
        <header className="drawer-head">
          <div>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-foot">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  )
}

export function Modal({ open, onClose, title, eyebrow, children, footer, size = 'md' }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null
  return createPortal(
    <div className="overlay overlay-center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="modal-head">
          <div>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="当前位置">
      {items.map((item, i) => (
        <span key={i} className="breadcrumb-item">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {i < items.length - 1 ? <span className="breadcrumb-sep" aria-hidden="true">/</span> : null}
        </span>
      ))}
    </nav>
  )
}
