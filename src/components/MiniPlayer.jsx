import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { albums } from '../data/media.js'
import { useApp } from '../context/AppState.jsx'
import { audioEngine, formatClock } from '../lib/audio.js'
import Icon from './Icon.jsx'
import Scene from './Scene.jsx'

/** 全局唯一音源控件：跨页面保留，可随时暂停 */
export default function MiniPlayer() {
  const { music, pauseMusic, resumeMusic, stopMusic, nextTrack, prefs, setPrefs } = useApp()
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const album = albums.find((a) => a.id === music.albumId)
  const track = album?.tracks?.[music.trackIndex]

  useEffect(() => {
    if (!music.playing) return undefined
    const id = setInterval(() => setElapsed(audioEngine.elapsed()), 500)
    return () => clearInterval(id)
  }, [music.playing])

  if (!album || !track) return null
  const dur = track.dur || 200
  const progress = Math.min(100, ((elapsed % dur) / dur) * 100)

  return (
    <div className="mini-player" role="region" aria-label="音乐播放器">
      <div className="mini-cover">
        <Scene variant={album.cover} seed={3} />
      </div>
      <div className="mini-info">
        <span className="mini-eyebrow">塞壬唱片 · 占位音源</span>
        <strong className="mini-title">{track.title}</strong>
        <span className="mini-time">
          {formatClock(Math.min(elapsed, dur))} / {formatClock(dur)}
        </span>
        <div className="mini-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mini-actions">
        <button type="button" className="icon-btn" onClick={() => (music.playing ? pauseMusic() : resumeMusic())} aria-label={music.playing ? '暂停' : '播放'}>
          <Icon name={music.playing ? 'pause' : 'play'} size={16} />
        </button>
        <button type="button" className="icon-btn mini-desktop-only" onClick={nextTrack} aria-label="下一首">
          <Icon name="skip" size={16} />
        </button>
        <button
          type="button"
          className="icon-btn mini-desktop-only"
          onClick={() => {
            const nextMuted = !muted
            setMuted(nextMuted)
            setPrefs({ volume: nextMuted ? 0 : 0.5 })
          }}
          aria-label={muted ? '取消静音' : '静音'}
        >
          <Icon name={muted || prefs.volume === 0 ? 'mute' : 'volume'} size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={stopMusic} aria-label="关闭播放器">
          <Icon name="close" size={15} />
        </button>
      </div>
      <Link to="/music" className="mini-open" aria-label="打开塞壬唱片页面">
        <Icon name="chevronRight" size={14} />
      </Link>
    </div>
  )
}
