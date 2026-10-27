import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { PRIMARY_PAGES, SITE } from '../data/meta.js'
import { searchAll } from '../data/index.js'
import { ArknightsMark } from './Marks.jsx'
import Icon from './Icon.jsx'
import { Drawer } from './ui.jsx'

const KIND_LABEL = {
  story: '剧情',
  person: '人物',
  location: '地点',
  entry: '设定',
}

function GlobalSearch({ open, onClose }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const results = q.trim() ? searchAll(q) : []

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  if (!open) return null

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="全站检索">
      <button type="button" className="search-backdrop" aria-label="关闭检索" onClick={onClose} />
      <div className="search-panel">
        <div className="search-input-row">
          <Icon name="search" size={20} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索剧情名、关卡号、人物别名、地点与设定词"
            aria-label="搜索关键词"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) {
                navigate(results[0].to)
                onClose()
              }
            }}
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </div>
        <div className="search-results">
          {!q.trim() ? (
            <div className="search-hint">
              <p>支持中文代号、英文代号、别名、地点与设定词。</p>
              <div className="search-suggest">
                {['切尔诺伯格', '阿米娅', '源石', '维多利亚', '孤星'].map((word) => (
                  <button key={word} type="button" className="chip" onClick={() => setQ(word)}>
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="search-hint">
              <p>没有匹配结果。可尝试较短的名称或其他关键词。</p>
            </div>
          ) : (
            <ul className="search-result-list">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`}>
                  <Link
                    to={r.to}
                    onClick={() => {
                      onClose()
                    }}
                  >
                    <span className="search-kind">{KIND_LABEL[r.kind]}</span>
                    <span className="search-title">
                      {r.title}
                    </span>
                    <span className="search-sub">{r.sub}</span>
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="search-foot">
          <span>Enter 打开首条结果</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  )
}

export default function SiteHeader({ variant = 'default' }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])


  const isPrimaryActive = (key) => {
    const path = location.pathname
    if (key === 'home') return path === '/' || path === '/home'
    if (key === 'overview') {
      return ['/overview', '/relations', '/operators', '/map', '/people', '/stories', '/locations'].some((p) =>
        path.startsWith(p),
      )
    }
    if (key === 'world') return path.startsWith('/world')
    if (key === 'more') return path.startsWith('/more') || path.startsWith('/music') || path.startsWith('/gallery')
    return false
  }

  return (
    <>
      <header className={`site-header ${variant === 'compact' ? 'is-compact' : ''}`}>
        <div className="site-header-inner">
          <Link to="/home" className="brand" aria-label={`${SITE.name}，返回首页`}>
            <ArknightsMark />
          </Link>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-sub">{SITE.disclaimer}</span>

          <nav className="primary-nav" aria-label="主页面">
            {PRIMARY_PAGES.map((page) => (
              <NavLink
                key={page.key}
                to={page.to}
                className={({ isActive }) => `nav-item ${isActive || isPrimaryActive(page.key) ? 'is-active' : ''}`}
              >
                <span className="nav-en">{page.en}</span>
                <span className="nav-cn">{page.cn}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-tools">
            <button type="button" className="header-tool" onClick={() => setSearchOpen(true)} aria-label="全站检索">
              <Icon name="search" size={17} />
              <span className="header-tool-text">检索</span>
            </button>
            <button type="button" className="header-tool mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
        <span className="header-rule" aria-hidden="true" />
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="菜单" eyebrow="NAVIGATION" width={360}>
        <nav className="mobile-nav" aria-label="移动端导航">
          {PRIMARY_PAGES.map((page) => (
            <NavLink
              key={page.key}
              to={page.to}
              className={({ isActive }) => `mobile-nav-item ${isActive || isPrimaryActive(page.key) ? 'is-active' : ''}`}
            >
              <span className="mobile-nav-no">{page.no}</span>
              <span className="mobile-nav-text">
                <span className="nav-en">{page.en}</span>
                <span className="nav-cn">{page.cn}</span>
              </span>
              <Icon name="arrowRight" size={16} />
            </NavLink>
          ))}
        </nav>
        <div className="mobile-nav-extra">
          <span className="eyebrow">SUB PAGES</span>
          {[
            { to: '/relations', label: '关系图谱' },
            { to: '/map', label: '泰拉地图' },
            { to: '/operators', label: '干员档案' },
            { to: '/music', label: '塞壬唱片' },
            { to: '/gallery', label: '游戏图集' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="mobile-sub-link">
              {item.label}
              <Icon name="chevronRight" size={14} />
            </Link>
          ))}
        </div>
      </Drawer>
    </>
  )
}
