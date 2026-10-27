import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { albums, albumCategories, galleryCategories, galleryItems } from '../data/media.js'
import { storyById } from '../data/index.js'
import { useApp } from '../context/AppState.jsx'
import { audioEngine, formatClock } from '../lib/audio.js'
import Scene from '../components/Scene.jsx'
import Icon from '../components/Icon.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { SectionLabel, Tag } from '../components/ui.jsx'

export default function More() {
  const navigate = useNavigate()
  const { music, startMusic, pauseMusic, resumeMusic, prefs, setPrefs } = useApp()
  const [albumCat, setAlbumCat] = useState('all')
  const [albumId, setAlbumId] = useState(() => music.albumId ?? albums[0].id)
  const [galleryCat, setGalleryCat] = useState('all')
  const [lightbox, setLightbox] = useState(-1)
  const [elapsed, setElapsed] = useState(0)

  const albumList = albumCat === 'all' ? albums : albums.filter((a) => a.category === albumCat)
  const album = albums.find((a) => a.id === albumId) ?? albums[0]
  const isThis = music.albumId === album.id
  const playing = music.playing && isThis
  const trackIndex = isThis ? music.trackIndex : 0
  const track = album.tracks[trackIndex]
  const story = album.storyId ? storyById[album.storyId] : null

  const galleryItemsFiltered = useMemo(
    () => (galleryCat === 'all' ? galleryItems : galleryItems.filter((g) => g.category === galleryCat)),
    [galleryCat],
  )
  const featured = galleryItemsFiltered.slice(0, 4)

  useEffect(() => {
    if (!music.playing) return undefined
    const id = setInterval(() => setElapsed(audioEngine.elapsed()), 600)
    return () => clearInterval(id)
  }, [music.playing])

  const progress = track ? Math.min(100, ((elapsed % track.dur) / track.dur) * 100) : 0


  const toggle = () => {
    if (playing) pauseMusic()
    else if (isThis) resumeMusic()
    else startMusic(album, 0)
  }

  return (
    <div className="page more-page">
      <header className="more-head">
        <div className="more-head-left">
          <span className="eyebrow">MORE · MEDIA ARCHIVE</span>
          <h1>其他</h1>
          <p>
            塞壬唱片与游戏图集两个入口。封面与图片均可直接查看，每张图都能回到所属剧情；进入页面不自动出声。
          </p>
        </div>
        <span className="more-head-meta">内容截止 2026-10-25</span>
      </header>

      <div className="more-split">
        <section className="more-col more-music" aria-label="塞壬唱片">
          <SectionLabel no="01" cn="塞壬唱片" en="MONSTER SIREN RECORDS" className="more-title" />
          <div className="more-filter">
            {albumCategories.map((c) => (
              <button key={c.id} type="button" className={`pill ${albumCat === c.id ? 'is-active' : ''}`} onClick={() => setAlbumCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="more-music-stage" data-no-page-scroll>
            <div className={`more-vinyl ${playing ? 'is-spinning' : ''}`} aria-hidden="true">
              <span className="vinyl-grooves" />
              <span className="vinyl-label" />
            </div>
            <div className="more-cover">
              <Scene variant={album.cover} seed={4} />
            </div>
          </div>

          <div className="more-album-info">
            <h2>{album.title}</h2>
            <p className="more-album-en">{album.en}</p>
            <p className="more-album-meta">{album.artist}</p>
          </div>

          <div className="more-progress">
            <span className="more-time">{formatClock(Math.min(elapsed, track?.dur ?? 0))}</span>
            <span className="more-bar"><i style={{ width: `${progress}%` }} /></span>
            <span className="more-time">{formatClock(track?.dur ?? 0)}</span>
          </div>

          <div className="more-controls">
            <button type="button" className="play-big" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>
              <Icon name={playing ? 'pause' : 'play'} size={20} />
            </button>
            <span className="more-track">
              <em>{playing ? '正在播放' : '点击播放'}</em>
              {track?.title}
            </span>
            <div className="more-volume">
              <Icon name={prefs.volume === 0 ? 'mute' : 'volume'} size={15} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={prefs.volume}
                onChange={(e) => setPrefs({ volume: Number(e.target.value) })}
                aria-label="音量"
              />
            </div>
          </div>

          <div className="more-links">
            {story ? <Link to={`/stories/${story.id}`} className="more-link">关联剧情 <Icon name="arrowRight" size={13} /></Link> : null}
            <a className="more-link" href="https://monster-siren.hypergryph.com/" target="_blank" rel="noreferrer noopener">
              前往塞壬官网 <Icon name="external" size={13} />
            </a>
            <Link to="/music" className="more-link">全部唱片 <Icon name="arrowRight" size={13} /></Link>
          </div>

          <div className="more-album-strip">
            {albumList.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`more-album-thumb ${a.id === album.id ? 'is-active' : ''}`}
                onClick={() => setAlbumId(a.id)}
                aria-label={`选择唱片 ${a.title}`}
              >
                <Scene variant={a.cover} seed={1} />
              </button>
            ))}
          </div>

          <p className="more-note">
            {album.note} 站内为 Web Audio 合成的占位音源。
          </p>
        </section>

        <section className="more-col more-gallery" aria-label="游戏图集">
          <SectionLabel no="02" cn="游戏图集" en="GALLERY" className="more-title" />
          <div className="more-tabs" role="tablist" aria-label="图集分类">
            {galleryCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={galleryCat === c.id}
                className={galleryCat === c.id ? 'is-active' : ''}
                onClick={() => setGalleryCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="more-gallery-grid" data-no-page-scroll>
            {featured.map((item, i) => (
              <figure key={item.id} className="more-gallery-item">
                <button
                  type="button"
                  className="more-gallery-thumb"
                  onClick={() => setLightbox(galleryItemsFiltered.findIndex((g) => g.id === item.id))}
                  aria-label={`查看大图 ${item.title}`}
                >
                  <Scene variant={item.scene} seed={i + 3} />
                  <span className="gallery-zoom"><Icon name="search" size={15} /></span>
                </button>
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>

          <div className="more-links">
            <Link to="/gallery" className="more-link">
              全部图集 <Icon name="arrowRight" size={13} />
            </Link>
            <Link to="/map" className="more-link">
              泰拉地图 <Icon name="arrowRight" size={13} />
            </Link>
            <Link to="/relations" className="more-link">
              关系图谱 <Icon name="arrowRight" size={13} />
            </Link>
          </div>

          <div className="more-tip">
            <Tag tone="accent">占位说明</Tag>
            <p>封面与插图均为程序化场景图，用于确认版式与交互；正式版本替换为核对后的官方资源并附来源。</p>
          </div>
        </section>
      </div>

      {lightbox >= 0 ? (
        <Lightbox items={galleryItemsFiltered} index={lightbox} onClose={() => setLightbox(-1)} onIndex={setLightbox} />
      ) : null}
    </div>
  )
}
