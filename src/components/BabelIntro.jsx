import {useCallback, useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Icon from './Icon.jsx'
import OpeningCanvas from './OpeningCanvas.jsx'
import rhodesUrl from '../assets/opening/rhodes-logo.png'
import {useReducedMotion} from '../lib/hooks.js'
import {HOME_MEDIA} from '../data/homeMedia.js'

/** One clock starts after image decoding; skipping and reduced motion use the same final layout. */
export default function BabelIntro({auto = true, onDone}) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [mode, setMode] = useState(auto ? 'running' : 'done')
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(document.hidden)
  const [runId, setRunId] = useState(0)
  const slotRef = useRef(null)
  const backdropRef = useRef(null)
  const finish = useCallback(() => setMode('done'), [])
  const start = useCallback(() => setReady(true), [])
  const running = mode === 'running' && !reduced

  useEffect(() => {
    if (reduced && mode === 'running') finish()
  }, [reduced, mode, finish])
  useEffect(() => {
    if (mode === 'done') onDone?.()
  }, [mode, onDone])
  useEffect(() => {
    const visibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])
  useEffect(() => {
    if (!running) return undefined
    const onKey = event => {
      if (event.target instanceof Element && event.target.closest('button,a,input,textarea,select')) return
      if (['Escape','Enter',' '].includes(event.key)) {
        event.preventDefault()
        finish()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [running, finish])
  const replay = () => {
    setReady(false)
    setRunId(n => n + 1)
    setMode('running')
  }

  return (
    <section className={`home-intro ${running ? 'is-running' : 'is-done'} ${ready ? 'is-ready' : 'is-loading'} ${paused ? 'is-paused' : ''} ${reduced ? 'is-reduced' : ''}`} aria-label="明日方舟剧情档案开场" data-run={runId}>
      <div className="intro-stage">
        <div className="intro-backdrop" aria-hidden="true" />
        <div className="intro-panorama" role="img" aria-label={HOME_MEDIA.alt}>
          <div className="intro-panorama-row"><div className="intro-panorama-strip">
            <img ref={backdropRef} className="intro-bg" src={HOME_MEDIA.left.src} alt="" width={HOME_MEDIA.left.width} height={HOME_MEDIA.left.height} fetchPriority="high" decoding="async" />
            <img className="intro-bg" src={HOME_MEDIA.right.src} alt="" width={HOME_MEDIA.right.width} height={HOME_MEDIA.right.height} fetchPriority="high" decoding="async" />
          </div></div>
          <div className="intro-panorama-row is-continuation" aria-hidden="true"><div className="intro-panorama-strip">
            <img className="intro-bg" src={HOME_MEDIA.left.src} alt="" width={HOME_MEDIA.left.width} height={HOME_MEDIA.left.height} decoding="async" />
            <img className="intro-bg" src={HOME_MEDIA.right.src} alt="" width={HOME_MEDIA.right.width} height={HOME_MEDIA.right.height} decoding="async" />
          </div></div>
        </div>
        <div className="intro-atmosphere" aria-hidden="true" />
        <div className="intro-grain" aria-hidden="true" />
        <OpeningCanvas slotRef={slotRef} backdropRef={backdropRef} running={running} runId={runId} reduced={reduced} onReady={start} onFinish={finish} />
        <div className="intro-main">
          <div className="intro-mark-slot" ref={slotRef} aria-hidden="true"><img className="intro-static-mark" src={rhodesUrl} alt="" /></div>
          <div className="intro-copy" key={runId}>
            <h1 className="intro-title"><span className="intro-title-cn">明日方舟</span></h1>
            <p className="intro-latin">ARKNIGHTS</p>
            <p className="intro-sub-cn">泰拉剧情档案</p>
            <p className="intro-sub-en">STORIES ACROSS TERRA</p>
          </div>
        </div>
        <div className="intro-corner intro-corner-tl" aria-hidden="true"><span>RHODES ISLAND STORY ARCHIVE</span><span className="intro-corner-rule" /></div>
        <button type="button" className="intro-enter" onClick={() => navigate('/overview')} aria-label="进入总览">
          <span className="intro-chevrons" aria-hidden="true"><i /><i /></span>
          <span className="intro-enter-text">滚轮下滑 · 进入总览</span>
        </button>
        <div className="intro-controls">
          {running ? <button type="button" className="intro-skip" onClick={finish}>跳过<Icon name="chevronRight" size={13} /></button>
            : <button type="button" className="intro-replay" onClick={replay}><Icon name="play" size={12} />重播开场</button>}
        </div>
        <div className="intro-footnote"><span>非官方剧情档案</span><span className="intro-footnote-rule" aria-hidden="true" /><a href={HOME_MEDIA.source} target="_blank" rel="noreferrer noopener" title={`${HOME_MEDIA.chapter} · ${HOME_MEDIA.credit} · ${HOME_MEDIA.note}`}>背景 · {HOME_MEDIA.stage} 决战 CG <Icon name="external" size={10} /></a></div>
      </div>
    </section>
  )
}
