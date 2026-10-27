import { useCallback, useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppStateProvider, useApp } from './context/AppState.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import MiniPlayer from './components/MiniPlayer.jsx'
import Home from './pages/Home.jsx'
import Overview from './pages/Overview.jsx'
import World from './pages/World.jsx'
import More from './pages/More.jsx'
import StoryPlay from './pages/StoryPlay.jsx'
import Relations from './pages/Relations.jsx'
import Operators from './pages/Operators.jsx'
import PersonPage from './pages/PersonPage.jsx'
import MapPage from './pages/MapPage.jsx'
import Music from './pages/Music.jsx'
import Gallery from './pages/Gallery.jsx'
import NotFound from './pages/NotFound.jsx'
import { useWheelPaging } from './lib/useWheelPaging.js'
import { PRIMARY_PAGES } from './data/meta.js'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

const PAGE_META = {
  '/home': { no: '01', label: '首页', key: 'home' },
  '/overview': { no: '02', label: '总览', key: 'overview' },
  '/world': { no: '03', label: '设定', key: 'world' },
  '/more': { no: '04', label: '其他', key: 'more' },
  '/relations': { no: '02', label: '关系图谱', key: 'overview' },
  '/operators': { no: '02', label: '干员档案', key: 'overview' },
  '/map': { no: '02', label: '泰拉地图', key: 'overview' },
  '/music': { no: '04', label: '塞壬唱片', key: 'more' },
  '/gallery': { no: '04', label: '游戏图集', key: 'more' },
}

function resolvePageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  if (pathname.startsWith('/stories') || pathname.startsWith('/people')) return { no: '02', label: '总览 / 档案', key: 'overview' }
  if (pathname.startsWith('/locations')) return { no: '02', label: '泰拉地图', key: 'overview' }
  if (pathname.startsWith('/world')) return { no: '03', label: '设定', key: 'world' }
  return { no: '02', label: '总览', key: 'overview' }
}

function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const meta = resolvePageMeta(pathname)
    document.title = `${meta.label} | 罗德岛剧情档案（非官方）`
  }, [pathname])
}

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const primaryIndex = PRIMARY_PAGES.findIndex(page =>
    page.to === location.pathname || (page.key === 'world' && location.pathname.startsWith('/world/')),
  )
  const goNext = useCallback(() => {
    if (primaryIndex >= 0 && primaryIndex < PRIMARY_PAGES.length - 1) navigate(PRIMARY_PAGES[primaryIndex + 1].to)
  }, [primaryIndex, navigate])
  const goPrev = useCallback(() => {
    if (primaryIndex > 0) navigate(PRIMARY_PAGES[primaryIndex - 1].to)
  }, [primaryIndex, navigate])
  useWheelPaging({
    enabled: primaryIndex >= 0,
    onNext: primaryIndex < PRIMARY_PAGES.length - 1 ? goNext : undefined,
    onPrev: primaryIndex > 0 ? goPrev : undefined,
  })
  const { music } = useApp()
  useDocumentTitle()

  const isHome = location.pathname === '/home' || location.pathname === '/'
  const isPlayer = location.pathname.startsWith('/stories/') && location.pathname.includes('/play')
  const meta = resolvePageMeta(location.pathname)

  const headerVariant = useMemo(() => {
    if (isHome) return 'overlay'
    if (isPlayer) return 'compact'
    return 'default'
  }, [isHome, isPlayer])

  return (
    <div className={`app-shell ${isHome ? 'is-home' : ''} ${isPlayer ? 'is-player' : ''}`}>
      <ScrollToTop />
      <SiteHeader variant={headerVariant} />
      <main id="main" className={`app-main ${isPlayer ? 'app-main-player' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/world" element={<World />} />
          <Route path="/world/:entryId" element={<World />} />
          <Route path="/more" element={<More />} />
          <Route path="/stories/:storyId" element={<StoryPlay />} />
          <Route path="/stories/:storyId/play/:chapterId" element={<StoryPlay />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/people/:personId" element={<PersonPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/locations/:locationId" element={<MapPage />} />
          <Route path="/music" element={<Music />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isPlayer && <SiteFooter pageNo={meta.no} pageLabel={meta.label} pageKey={meta.key} />}
      {!isPlayer && music.albumId && <MiniPlayer />}
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}

