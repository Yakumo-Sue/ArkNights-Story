import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { albums, albumCategories } from '../data/media.js'
import { storyById } from '../data/index.js'
import { useApp } from '../context/AppState.jsx'
import { audioEngine, formatClock } from '../lib/audio.js'
import Scene from '../components/Scene.jsx'
import Icon from '../components/Icon.jsx'
import { Breadcrumb, DataBadge, Tag } from '../components/ui.jsx'

export default function Music() {
  const { music, startMusic, pauseMusic, resumeMusic, nextTrack, prevTrack, prefs, setPrefs } = useApp()
  const [cat, setCat] = useState('all')
  const [activeId, setActiveId] = useState(() => music.albumId ?? albums[0].id)
  const [elapsed, setElapsed] = useState(0)

  const list = useMemo(() => (cat === 'all' ? albums : albums.filter((a) => a.category === cat)), [cat])
  const album = albums.find((a) => a.id === activeId) ?? albums[0]
  const isThisAlbum = music.albumId === album.id
  const playing = music.playing && isThisAlbum
  const trackIndex = isThisAlbum ? music.trackIndex : 0
  const track = album.tracks[trackIndex]

  useEffect(() => {
    if (!music.playing) return undefined
    const id = setInterval(() => setElapsed(audioEngine.elapsed()), 500)
    return () => clearInterval(id)
  }, [music.playing])

  useEffect(() => {
    if (music.albumId) setActiveId(music.albumId)
  }, [music.albumId])

  const toggle = () => {
    if (playing) pauseMusic()
    else if (isThisAlbum) resumeMusic()
    else startMusic(album, 0)
  }

  const progress = track ? Math.min(100, ((elapsed % track.dur) / track.dur) * 100) : 0
  const story = album.storyId ? storyById[album.storyId] : null

  return (
    <div className="page music-page">
      <header className="page-head">
        <div className="page-head-main">
          <Breadcrumb items={[{ label: '其他', to: '/more' }, { label: '塞壬唱片' }]} />
          <span className="eyebrow">MONSTER SIREN RECORDS</span>
          <h1>塞壬唱片</h1>
          <p className="page-lede">
            按主线、活动或主题分类的唱片目录。点击后才播放，同一时刻只有一个音源；资源不可用时仍保留唱片信息与官方入口。
          </p>
        </div>
        <div className="page-head-side">
          <DataBadge status="demo">占位音源</DataBadge>
          <a className="btn btn-ghost btn-sm" href="https://monster-siren.hypergryph.com/" target="_blank" rel="noreferrer noopener">
            前往塞壬官网 <Icon name="external" size={13} />
          </a>
        </div>
      </header>

      <div className="music-layout">
        <aside className="music-list">
          <div className="music-filter">
            {albumCategories.map((c) => (
              <button key={c.id} type="button" className={`chip ${cat === c.id ? 'is-active' : ''}`} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <ul>
            {list.map((a) => (
              <li key={a.id}>
                <button type="button" className={`album-row ${a.id === album.id ? 'is-active' : ''}`} onClick={() => setActiveId(a.id)}>
                  <span className="album-row-art">
                    <Scene variant={a.cover} seed={2} />
                  </span>
                  <span className="album-row-body">
                    <strong>{a.title}</strong>
                    <em>{a.en}</em>
                    <span>{a.date} · {a.tracks.length} 首</span>
                  </span>
                  {music.albumId === a.id && music.playing ? <span className="album-row-playing" aria-label="播放中" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="music-player" aria-label="唱片播放器">
          <div className="player-head">
            <div>
              <span className="eyebrow">ALBUM</span>
              <h2>{album.title}</h2>
              <p className="player-en">{album.en}</p>
              <p className="player-artist">{album.artist} · {album.date}</p>
            </div>
            <div className="player-badges">
              <Tag tone="accent">{albumCategories.find((c) => c.id === album.category)?.label}</Tag>
              {story ? <Link className="chip" to={`/stories/${story.id}`}>关联剧情 · {story.title}</Link> : null}
            </div>
          </div>

          <div className="player-stage">
            <div className={`vinyl ${playing ? 'is-spinning' : ''}`} aria-hidden="true">
              <span className="vinyl-grooves" />
              <span className="vinyl-label" />
            </div>
            <div className="album-cover">
              <Scene variant={album.cover} seed={5} />
              <span className="album-cover-title">
                <em>{album.title}</em>
                <span>{album.en}</span>
              </span>
            </div>
          </div>

          <div className="player-now">
            <div className="now-meta">
              <span className="eyebrow">NOW PLAYING</span>
              <strong>{track?.title}</strong>
              <span className="now-album">{album.title} · 第 {trackIndex + 1} 首</span>
            </div>
            <div className="now-progress">
              <div className="now-bar" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="now-times">
                <span>{formatClock(Math.min(elapsed, track?.dur ?? 0))}</span>
                <span>{formatClock(track?.dur ?? 0)}</span>
              </div>
            </div>
            <div className="now-controls">
              <button type="button" className="icon-btn" onClick={prevTrack} aria-label="上一首">
                <Icon name="arrowLeft" size={16} />
              </button>
              <button type="button" className="play-big" onClick={toggle} aria-label={playing ? '暂停' : '播放'}>
                <Icon name={playing ? 'pause' : 'play'} size={20} />
              </button>
              <button type="button" className="icon-btn" onClick={nextTrack} aria-label="下一首">
                <Icon name="arrowRight" size={16} />
              </button>
              <div className="player-volume">
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
          </div>

          <ol className="tracklist">
            {album.tracks.map((t, i) => (
              <li key={t.no}>
                <button
                  type="button"
                  className={`track-row ${isThisAlbum && music.trackIndex === i ? 'is-active' : ''}`}
                  onClick={() => startMusic(album, i)}
                >
                  <span className="track-no">{t.no}</span>
                  <span className="track-title">{t.title}</span>
                  <span className="track-dur">{formatClock(t.dur)}</span>
                  {isThisAlbum && music.trackIndex === i && music.playing ? <span className="track-eq" aria-hidden="true"><i /><i /><i /></span> : null}
                </button>
              </li>
            ))}
          </ol>

          <p className="player-note">
            {album.note} 站内播放为 Web Audio 实时合成的占位环境音，不支持拖动定位；正式版本替换为官方音频后沿用同一套播放状态与互斥规则。
          </p>
        </section>
      </div>

      <p className="page-footnote">
        进入页面不自动播放；开始播放后跨页面保留，并始终显示可暂停的全局控件。进入剧情播放器时自动暂停，退出后不自动恢复。
      </p>
    </div>
  )
}

