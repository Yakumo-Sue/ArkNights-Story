import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  storyById,
  personById,
  peopleForStory,
  locationName,
  storyTypes,
  firstPlayableSegment,
} from '../data/index.js'
import { useApp } from '../context/AppState.jsx'
import { audioEngine, moodForScene } from '../lib/audio.js'
import { useReducedMotion } from '../lib/hooks.js'
import Scene from '../components/Scene.jsx'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import { CertaintyTag, Drawer, Modal, Tag } from '../components/ui.jsx'
import NotFound from './NotFound.jsx'

const SPEEDS = [
  { value: 'slow', label: '慢', delay: 72 },
  { value: 'normal', label: '标准', delay: 46 },
  { value: 'fast', label: '快', delay: 24 },
  { value: 'instant', label: '即时', delay: 0 },
]

const AUX_TABS = ['导读', '解析', '回忆年代', '相关人物地点', '来源']

export default function StoryPlay() {
  const { storyId, chapterId } = useParams()
  const story = storyById[storyId]
  if (!story) return <NotFound />

  const chapter = story.chapters.find((c) => c.id === chapterId) ?? null
  if (!chapter) {
    const first = firstPlayableSegment(story)
    return <PlayerBody key={`${story.id}:${first?.id}`} story={story} chapter={first} />
  }

  return <PlayerBody key={`${story.id}:${chapter.id}`} story={story} chapter={chapter} />
}

function PlayerBody({ story, chapter }) {
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()
  const {
    prefs,
    setPrefs,
    getProgress,
    saveProgress,
    stopMusic,
    bookmarks,
    addBookmark,
    removeBookmark,
  } = useApp()

  const nodes = chapter.nodes ?? []
  const progress = getProgress(story.id)
  const resumeIndex = location.state?.resumeIndex

  const [index, setIndex] = useState(() => {
    if (resumeIndex != null) return Math.max(0, Math.min(nodes.length - 1, resumeIndex))
    if (progress && progress.chapterId === chapter.id) return Math.max(0, Math.min(nodes.length - 1, progress.nodeIndex ?? 0))
    return 0
  })
  const [started, setStarted] = useState(false)
  const [chars, setChars] = useState(0)
  const [auto, setAuto] = useState(false)
  const [hideUI, setHideUI] = useState(false)
  const [log, setLog] = useState([])
  const [logOpen, setLogOpen] = useState(false)
  const [logAllOpen, setLogAllOpen] = useState(false)
  const [dirOpen, setDirOpen] = useState(false)
  const [auxOpen, setAuxOpen] = useState(false)
  const [auxTab, setAuxTab] = useState(AUX_TABS[0])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ended, setEnded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [showAllLog, setShowAllLog] = useState(true)

  const stageRef = useRef(null)
  const moodRef = useRef(null)
  const autoTimer = useRef(null)
  const startedRef = useRef(false)
  const hasProgress = !!progress && (progress.nodeIndex > 0 || progress.chapterId !== chapter.id)
  const startOverlayOpen = !started && nodes.length > 0
  const missingScript = nodes.length === 0

  const chapterIndex = story.chapters.findIndex((c) => c.id === chapter.id)
  const kindSuffix = /行动(前|后)/.test(chapter.title)
    ? ''
    : chapter.kind === 'before'
      ? ' · 行动前'
      : chapter.kind === 'after'
        ? ' · 行动后'
        : ''
  const prevChapter = story.chapters[chapterIndex - 1]
  const nextChapter = story.chapters[chapterIndex + 1]
  const backTo = location.state?.from || '/overview'

  const node = nodes[index] ?? null
  const isChoice = !!node?.choice
  const speaker = node?.sp ? personById[node.sp] : null
  const speakerName = speaker?.name ?? (node?.sp === 'doctor' ? '博士' : '旁白')
  const fullText = node?.text ?? node?.n ?? node?.choice?.prompt ?? ''
  const complete = chars >= fullText.length
  const bg = node?.bg ?? chapter.bg ?? story.cover
  const cg = node?.cg
  const emote = node?.emote ?? 'default'
  const speed = SPEEDS.find((s) => s.value === prefs.textSpeed) ?? SPEEDS[1]

  const relatedPeople = useMemo(() => peopleForStory(story.id), [story.id])

  /* 进入播放器时暂停塞壬唱片，退出时不自动恢复 */
  useEffect(() => {
    stopMusic()
    return () => {
      audioEngine.stop()
    }
  }, [stopMusic])

  /* 打字机 */
  useEffect(() => {
    setChars(0)
    if (!started || !fullText) return undefined
    if (prefs.textSpeed === 'instant' || reduced) {
      setChars(fullText.length)
      return undefined
    }
    let i = 0
    const id = setInterval(() => {
      i = Math.min(fullText.length, i + 2)
      setChars(i)
      if (i >= fullText.length) clearInterval(id)
    }, speed.delay)
    return () => clearInterval(id)
  }, [index, started, fullText, prefs.textSpeed, reduced, speed.delay])

  /* 记录已读台词（LOG 只显示已读） */
  useEffect(() => {
    if (!started || !fullText) return
    setLog((prev) => (prev.some((l) => l.index === index) ? prev : [...prev, { index, speaker: speakerName, text: fullText }]))
  }, [index, started, fullText, speakerName])

  /* 保存进度 */
  useEffect(() => {
    if (!started || !nodes.length) return
    saveProgress(story.id, chapter.id, index)
  }, [started, index, nodes.length, saveProgress, story.id, chapter.id])

  /* 背景音乐：仅在同一氛围内切换时重启 */
  useEffect(() => {
    if (!started || missingScript || !soundOn || prefs.volume === 0) return
    const mood = moodForScene(bg)
    if (moodRef.current === mood) return
    moodRef.current = mood
    audioEngine.start(mood, { volume: prefs.volume })
  }, [started, missingScript, soundOn, prefs.volume, bg])

  useEffect(() => {
    if (!soundOn || !started || missingScript || prefs.volume === 0) {
      if (audioEngine.playing) audioEngine.stop()
      return
    }
    if (!audioEngine.playing) {
      moodRef.current = moodForScene(bg)
      audioEngine.start(moodRef.current, { volume: prefs.volume })
    } else {
      audioEngine.setVolume(prefs.volume)
    }
  }, [soundOn, started, missingScript, prefs.volume, bg])

  /* 自动推进 */
  useEffect(() => {
    if (!auto || !started || ended || isChoice || !complete || logOpen || dirOpen || auxOpen || logAllOpen) return undefined
    autoTimer.current = setTimeout(() => {
      advanceRef.current?.()
    }, prefs.autoDelay + 400)
    return () => clearTimeout(autoTimer.current)
  }, [auto, started, ended, isChoice, complete, logOpen, dirOpen, auxOpen, logAllOpen, prefs.autoDelay, index])

  const advanceRef = useRef(null)

  const finishSection = useCallback(() => {
    setEnded(true)
    setAuto(false)
    if (nodes.length) saveProgress(story.id, chapter.id, nodes.length - 1, { read: true })
  }, [nodes.length, saveProgress, story.id, chapter.id])

  const advance = useCallback(() => {
    if (!started) {
      setStarted(true)
      return
    }
    if (ended || isChoice || !node) return
    if (!complete) {
      setChars(fullText.length)
      return
    }
    if (node.goto) {
      const target = nodes.findIndex((n) => n.id === node.goto)
      if (target >= 0) {
        setIndex(target)
        return
      }
    }
    if (index >= nodes.length - 1) finishSection()
    else setIndex(index + 1)
  }, [started, ended, isChoice, node, complete, fullText.length, nodes, index, finishSection])

  advanceRef.current = advance

  /* 键盘 */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag) || e.target?.isContentEditable) return
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.target?.closest?.('button, a')) return
        e.preventDefault()
        if (!logOpen && !dirOpen && !auxOpen && !logAllOpen && !settingsOpen) advanceRef.current?.()
      }
      if (e.key.toLowerCase() === 'a' && !e.metaKey && !e.ctrlKey) setAuto((v) => !v)
      if (e.key.toLowerCase() === 'h') setHideUI((v) => !v)
      if (e.key.toLowerCase() === 'l') setLogOpen((v) => !v)
      if (e.key === 'Escape') {
        setLogOpen(false)
        setDirOpen(false)
        setAuxOpen(false)
        setLogAllOpen(false)
        setSettingsOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [logOpen, dirOpen, auxOpen, logAllOpen, settingsOpen])

  /* 全屏 */
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      /* 浏览器不支持时保持普通布局 */
    }
  }

  const begin = (fromIndex = index) => {
    setStarted(true)
    setEnded(false)
    setIndex(fromIndex)
    setChars(0)
    if (soundOn) {
      moodRef.current = moodForScene(bg)
      audioEngine.start(moodRef.current, { volume: prefs.volume })
    }
  }

  const continueReading = () => {
    if (progress && progress.chapterId !== chapter.id) {
      navigate(`/stories/${story.id}/play/${progress.chapterId}`, {
        state: { from: backTo, resumeIndex: progress.nodeIndex ?? 0 },
      })
      return
    }
    begin(progress?.nodeIndex ?? index)
  }

  const startFromBeginning = () => {
    const first = firstPlayableSegment(story)
    if (first && first.id !== chapter.id) {
      navigate(`/stories/${story.id}/play/${first.id}`, { state: { from: backTo, resumeIndex: 0 } })
      return
    }
    begin(0)
  }

  const jumpToChapter = (target) => {
    setDirOpen(false)
    if (target.id === chapter.id) {
      setIndex(0)
      setEnded(false)
      setStarted(true)
      return
    }
    navigate(`/stories/${story.id}/play/${target.id}`, { state: { from: backTo } })
  }

  const choose = (option) => {
    const target = nodes.findIndex((n) => n.id === option.goto)
    if (target >= 0) setIndex(target)
    else setIndex((i) => Math.min(nodes.length - 1, i + 1))
    saveProgress(story.id, chapter.id, index, { choice: { [index]: option.text } })
  }

  const goLogIndex = (i) => {
    setIndex(i)
    setEnded(false)
    setLogOpen(false)
  }

  const isBookmarked = bookmarks.some((b) => b.storyId === story.id && b.chapterId === chapter.id)

  if (missingScript) {
    const prtsHref = `https://prts.wiki/index.php?search=${encodeURIComponent(`${story.title} ${chapter.code}`)}`
    return (
      <div className="page play-page play-missing">
        <div className="play-missing-inner">
          <span className="eyebrow">SCRIPT NOT IMPORTED</span>
          <h1>{story.title}</h1>
          <p className="play-missing-sub">
            {chapter.code} · {chapter.title}
          </p>
          <div className="play-missing-note">
            <Icon name="info" size={18} />
            <p>
              本片段的逐句脚本与演出资源尚未导入。按照资料规则，不用故事概述冒充台词；完整原文、背景图与音乐可在 PRTS 对应条目查看。
            </p>
          </div>
          <p className="play-missing-summary">{story.summary}</p>
          <div className="play-missing-meta">
            <Tag tone="accent">{storyTypes[story.type]?.label}</Tag>
            <Tag>{story.location}</Tag>
            <Tag>{story.release.date.slice(0, 7).replace('-', '.')} 实装</Tag>
          </div>
          <ol className="missing-chapters">
            {story.chapters.map((c, i) => (
              <li key={c.id}>
                <Link to={`/stories/${story.id}/play/${c.id}`}>
                  <span className="missing-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="missing-code">{c.code}</span>
                  <span className="missing-title">{c.title}</span>
                  <span className={`missing-status ${c.nodes?.length ? 'is-ready' : ''}`}>
                    {c.nodes?.length ? '示例脚本可播放' : '脚本待导入'}
                  </span>
                  <Icon name="arrowRight" size={14} />
                </Link>
              </li>
            ))}
          </ol>
          <div className="play-missing-actions">
            <button type="button" className="btn btn-primary" onClick={() => setDirOpen(true)}>
              查看章节目录
            </button>
            <Link className="btn btn-ghost" to={backTo}>
              返回总览
            </Link>
            <Link className="btn btn-ghost" to={`/map?loc=${story.locationId}`}>
              在地图查看
            </Link>
            <a className="btn btn-ghost" href={prtsHref} target="_blank" rel="noreferrer">
              在 PRTS 查看原文
            </a>
          </div>
          <ChapterDirectory
            open={dirOpen}
            onClose={() => setDirOpen(false)}
            story={story}
            currentId={chapter.id}
            onSelect={jumpToChapter}
            progress={progress}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page play-page" data-no-page-scroll>
      <div className="play-topbar">
        <Link to={backTo} className="play-back">
          <Icon name="chevronLeft" size={15} />
          返回{backTo === '/overview' ? '总览' : '上一页'}
        </Link>
        <div className="play-titles">
          <span className="play-story">{story.title}</span>
          <span className="play-chapter">
            {chapter.code} · {chapter.title}
            {kindSuffix}
          </span>
        </div>
        <div className="play-top-actions">
          <button type="button" className="icon-btn" onClick={() => setDirOpen(true)} aria-label="章节目录">
            <Icon name="list" size={17} />
          </button>
          <button type="button" className="icon-btn" onClick={() => setAuxOpen(true)} aria-label="辅助资料">
            <Icon name="book" size={17} />
          </button>
          <button type="button" className="icon-btn" onClick={() => setLogAllOpen(true)} aria-label="本节全文">
            <Icon name="doc" size={17} />
          </button>
          <button
            type="button"
            className={`icon-btn ${isBookmarked ? 'is-active' : ''}`}
            onClick={() => (isBookmarked ? removeBookmark(story.id, chapter.id) : addBookmark({ storyId: story.id, chapterId: chapter.id, label: `${chapter.code} ${chapter.title}`, nodeIndex: index }))}
            aria-label={isBookmarked ? '取消书签' : '添加书签'}
          >
            <Icon name="bookmark" size={17} />
          </button>
          <button type="button" className="icon-btn" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '全屏'}>
            <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} size={17} />
          </button>
        </div>
      </div>

      <div className={`play-stage ${hideUI ? 'is-hidden-ui' : ''}`} ref={stageRef}>
        <div className="stage-bg" key={bg}>
          <Scene variant={bg} seed={index % 5} />
        </div>
        {cg ? (
          <div className="stage-cg" key={cg}>
            <Scene variant={cg} seed={1} />
          </div>
        ) : null}
        <div className="stage-vignette" aria-hidden="true" />

        {speaker ? (
          <div className={`stage-sprite emote-${emote}`} key={speaker.id + emote}>
            <Portrait person={speaker} />
            <span className="sprite-rim" aria-hidden="true" />
          </div>
        ) : null}

        <div className="stage-clickzone" onClick={advance} aria-hidden="true" />

        {started ? (
          <>
            <div className={`dialogue ${speaker ? 'has-speaker' : 'is-narration'}`} onClick={advance} role="presentation">
              {speaker ? (
                <div className="speaker">
                  <span className="speaker-name">{speaker.name}</span>
                  <span className="speaker-en">{speaker.en}</span>
                </div>
              ) : (
                <div className="speaker is-narration"><span className="speaker-name">旁白</span></div>
              )}
              <p className={`dialogue-text ${speaker?.id === 'doctor' ? 'is-inner' : ''}`}>
                {fullText.slice(0, chars)}
                {!complete ? <span className="caret" aria-hidden="true" /> : null}
              </p>
              {complete && !isChoice ? (
                <span className="dialogue-next" aria-hidden="true">
                  <Icon name="chevronDown" size={14} />
                </span>
              ) : null}
            </div>

            <div className="play-controls" onClick={(e) => e.stopPropagation()}>
              <div className="play-progress">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="play-progress-bar">
                  <i style={{ width: `${((index + 1) / nodes.length) * 100}%` }} />
                </span>
                <span>{String(nodes.length).padStart(2, '0')}</span>
              </div>
              <div className="control-group">
                <button type="button" className={`ctrl ${auto ? 'is-on' : ''}`} onClick={() => setAuto((v) => !v)}>
                  <span className="ctrl-dot" aria-hidden="true" />
                  AUTO
                </button>
                <button type="button" className="ctrl" onClick={() => setLogOpen(true)}>
                  LOG
                </button>
                <button type="button" className="ctrl" onClick={() => setLogAllOpen(true)}>
                  LOG ALL
                </button>
                <button type="button" className="ctrl" onClick={() => setDirOpen(true)}>
                  目录
                </button>
                <button type="button" className="ctrl" onClick={() => setHideUI(true)} title="隐藏对话框（H）">
                  <Icon name="eyeOff" size={14} />
                  隐藏
                </button>
                <button type="button" className="ctrl" onClick={() => finishSection()}>
                  SKIP
                </button>
              </div>
              <div className="control-group control-group-right">
                <button
                  type="button"
                  className={`ctrl ${soundOn ? 'is-on' : ''}`}
                  onClick={() => setSoundOn((v) => !v)}
                  aria-label={soundOn ? '静音' : '开启声音'}
                >
                  <Icon name={soundOn ? 'volume' : 'mute'} size={15} />
                </button>
                <input
                  className="volume-range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.volume}
                  onChange={(e) => setPrefs({ volume: Number(e.target.value) })}
                  aria-label="音量"
                />
                <button type="button" className="ctrl" onClick={() => setSettingsOpen(true)}>
                  文字速度
                </button>
                <button type="button" className="ctrl" onClick={toggleFullscreen}>
                  <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} size={15} />
                </button>
              </div>
            </div>
          </>
        ) : null}

        {hideUI ? (
          <button type="button" className="stage-show-ui" onClick={() => setHideUI(false)}>
            <Icon name="eye" size={16} />
            显示界面
          </button>
        ) : null}

        {startOverlayOpen ? (
          <div className="stage-overlay stage-start">
            <div className="start-card">
              <span className="eyebrow">STORY PLAYER</span>
              <h1>{story.title}</h1>
              <p className="start-sub">{chapter.code} · {chapter.title}</p>
              <p className="start-desc">{story.summary}</p>
              <div className="start-warn">
                <Icon name="info" size={15} />
                演示版本：逐句脚本为示例内容，非官方原文；音频为站点内置合成音源。
              </div>
              <div className="start-actions">
                {hasProgress ? (
                  <>
                    <button type="button" className="btn btn-primary" onClick={continueReading}>
                      继续阅读
                      <span className="btn-sub">
                        {progress.chapterId === chapter.id ? `第 ${(progress.nodeIndex ?? 0) + 1} 句` : '上次所在片段'}
                      </span>
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={startFromBeginning}>
                      从头开始
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => begin(0)}>
                    开始演出
                    <span className="btn-sub">点击后开启声音</span>
                  </button>
                )}
                <Link className="btn btn-ghost" to={backTo}>
                  返回总览
                </Link>
              </div>
              <div className="start-foot">
                <span>空格 / 回车推进</span>
                <span>A 自动</span>
                <span>L 记录</span>
                <span>H 隐藏</span>
              </div>
            </div>
          </div>
        ) : null}

        {isChoice && !ended && started ? (
          <div className="stage-overlay stage-choice" onClick={(e) => e.stopPropagation()}>
            <div className="choice-panel">
              <span className="eyebrow">CHOICE</span>
              <p className="choice-prompt">{node.choice.prompt}</p>
              <div className="choice-options">
                {node.choice.options.map((opt, i) => (
                  <button key={i} type="button" className="choice-option" onClick={() => choose(opt)}>
                    <span className="choice-index">{String(i + 1).padStart(2, '0')}</span>
                    {opt.text}
                    <Icon name="arrowRight" size={15} />
                  </button>
                ))}
              </div>
              <span className="choice-hint">选择会保留在阅读进度中</span>
            </div>
          </div>
        ) : null}

        {ended ? (
          <div className="stage-overlay stage-end">
            <div className="end-card">
              <span className="eyebrow">SEGMENT COMPLETE</span>
              <h2>本节结束</h2>
              <p>{chapter.code} · {chapter.title}</p>
              <div className="end-actions">
                {nextChapter ? (
                  <button type="button" className="btn btn-primary" onClick={() => jumpToChapter(nextChapter)}>
                    下一段
                    <Icon name="arrowRight" size={15} />
                  </button>
                ) : (
                  <Link className="btn btn-primary" to="/overview">
                    返回总览
                    <Icon name="arrowRight" size={15} />
                  </Link>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => { setIndex(0); setEnded(false); setChars(0) }}>
                  重读本节
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDirOpen(true)}>
                  章节目录
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="play-underbar">
        <div className="play-under-left">
          <Tag tone="accent">{storyTypes[story.type]?.label}</Tag>
          <span>{story.episode ?? chapter.code} · {story.location}</span>
          <CertaintyTag certainty={story.year.certainty} evidence={story.fragments[0]?.evidence} />
        </div>
        <div className="play-under-right">
          {prevChapter ? (
            <button type="button" className="btn btn-tiny" onClick={() => jumpToChapter(prevChapter)}>
              <Icon name="arrowLeft" size={13} /> 上一段
            </button>
          ) : null}
          {nextChapter ? (
            <button type="button" className="btn btn-tiny" onClick={() => jumpToChapter(nextChapter)}>
              下一段 <Icon name="arrowRight" size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} log={log} onJump={goLogIndex} current={index} />
      <ChapterDirectory
        open={dirOpen}
        onClose={() => setDirOpen(false)}
        story={story}
        currentId={chapter.id}
        onSelect={jumpToChapter}
        progress={progress}
      />
      <ScriptModal
        open={logAllOpen}
        onClose={() => setLogAllOpen(false)}
        nodes={nodes}
        limit={showAllLog ? nodes.length - 1 : index}
        showAll={showAllLog}
        onToggleShowAll={() => setShowAllLog((v) => !v)}
        chapter={chapter}
        story={story}
      />
      <AuxDrawer
        open={auxOpen}
        onClose={() => setAuxOpen(false)}
        story={story}
        chapter={chapter}
        people={relatedPeople}
        tab={auxTab}
        setTab={setAuxTab}
      />
      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title="演出设置" eyebrow="PLAYER SETTINGS" width={400}>
        <div className="setting-block">
          <span className="setting-label">文字速度</span>
          <div className="speed-options">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`chip ${prefs.textSpeed === s.value ? 'is-active' : ''}`}
                onClick={() => setPrefs({ textSpeed: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-block">
          <span className="setting-label">自动推进间隔</span>
          <input
            type="range"
            min="800"
            max="5000"
            step="200"
            value={prefs.autoDelay}
            onChange={(e) => setPrefs({ autoDelay: Number(e.target.value) })}
          />
          <span className="setting-value">{(prefs.autoDelay / 1000).toFixed(1)} 秒</span>
        </div>
        <div className="setting-block">
          <span className="setting-label">音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={prefs.volume}
            onChange={(e) => setPrefs({ volume: Number(e.target.value) })}
          />
          <span className="setting-value">{Math.round(prefs.volume * 100)}%</span>
        </div>
        <p className="drawer-note">
          减少动态效果开启时，台词直接显示整句；音频为站点内置合成占位音源，正式版本替换为核对后的官方音频。
        </p>
      </Drawer>
    </div>
  )
}

function LogDrawer({ open, onClose, log, onJump, current }) {
  return (
    <Drawer open={open} onClose={onClose} title="对话记录" eyebrow="LOG · 仅显示已读" width={460}>
      {log.length === 0 ? (
        <p className="drawer-note">还没有已读台词。</p>
      ) : (
        <ol className="log-list">
          {log.map((l) => (
            <li key={l.index}>
              <button type="button" className={`log-item ${l.index === current ? 'is-current' : ''}`} onClick={() => onJump(l.index)}>
                <span className="log-speaker">{l.speaker}</span>
                <span className="log-text">{l.text}</span>
                <span className="log-index">{String(l.index + 1).padStart(2, '0')}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="drawer-note">跳转到某句时会同步恢复该处的背景与立绘状态。</p>
    </Drawer>
  )
}

function ChapterDirectory({ open, onClose, story, currentId, onSelect, progress }) {
  return (
    <Drawer open={open} onClose={onClose} title="章节目录" eyebrow={story.title} width={420}>
      <div className="dir-meta">
        <span>{story.episode ?? story.series}</span>
        <span>{story.chapters.length} 个片段</span>
      </div>
      <ol className="dir-list">
        {story.chapters.map((c, i) => {
          const active = c.id === currentId
          const read = progress?.read?.[c.id]
          return (
            <li key={c.id}>
              <button type="button" className={`dir-item ${active ? 'is-active' : ''}`} onClick={() => onSelect(c)}>
                <span className="dir-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="dir-body">
                  <span className="dir-code">{c.code}</span>
                  <span className="dir-title">{c.title}</span>
                  <span className="dir-kind">
                    {c.kind === 'before' ? '行动前' : c.kind === 'after' ? '行动后' : '剧情片段'}
                    {c.nodes?.length ? '' : ' · 脚本待导入'}
                  </span>
                </span>
                {read ? <span className="dir-read">已读</span> : null}
                {active ? <Icon name="play" size={12} /> : null}
              </button>
            </li>
          )
        })}
      </ol>
      <p className="drawer-note">目录按原章节顺序排列；发生年代可在「辅助资料 · 回忆年代」查看。</p>
    </Drawer>
  )
}

function ScriptModal({ open, onClose, nodes, limit, showAll, onToggleShowAll, chapter, story }) {
  return (
    <Modal open={open} onClose={onClose} title="本节全文" eyebrow={`LOG ALL · ${chapter.code} ${chapter.title}`} size="lg">
      <div className="script-warn">
        <Icon name="info" size={15} />
        全文包含当前片段的全部内容；可切换为仅查看已读范围。
        <button type="button" className="btn btn-tiny" onClick={onToggleShowAll}>
          {showAll ? '隐藏未读' : '显示未读'}
        </button>
      </div>
      <div className="script-body">
        {nodes.slice(0, Math.max(0, limit) + 1).map((n, i) => (
          <div key={i} className={`script-line ${n.sp ? '' : 'is-narration'}`}>
            <span className="script-speaker">{n.sp ? personById[n.sp]?.name ?? '旁白' : '旁白'}</span>
            <p>{n.text ?? n.n ?? n.choice?.prompt}</p>
          </div>
        ))}
        {limit < nodes.length - 1 ? <p className="script-more">还有 {nodes.length - 1 - limit} 句未读内容未显示。</p> : null}
      </div>
      <div className="modal-script-foot">
        <Link to={`/stories/${story.id}/play/${chapter.id}`} className="btn btn-tiny" onClick={onClose}>
          回到演出
        </Link>
      </div>
    </Modal>
  )
}

function AuxDrawer({ open, onClose, story, chapter, people, tab, setTab }) {
  return (
    <Drawer open={open} onClose={onClose} title="辅助资料" eyebrow={`${chapter.code} · ${chapter.title}`} width={480}>
      <div className="aux-tabs" role="tablist" aria-label="辅助资料分类">
        {AUX_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`aux-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="aux-body">
        {tab === '导读' ? (
          <>
            <h4>{story.title}</h4>
            <p>{story.summary}</p>
            <div className="aux-tags">
              <Tag tone="accent">{story.location}</Tag>
              <Tag>{story.release.date.slice(0, 7).replace('-', '.')} 实装</Tag>
            </div>
            <p className="drawer-note">打开辅助资料时会暂停演出；关闭后可从原位置继续。</p>
          </>
        ) : null}
        {tab === '解析' ? (
          <>
            <h4>本片段说明</h4>
            <p>{chapter.scriptNote ?? '该片段的解析尚未编写。本站不把编辑推测写成官方结论，解析会单独标注来源。'}</p>
            <p className="drawer-note">示例脚本用于验证播放器交互，不代表官方原文。</p>
          </>
        ) : null}
        {tab === '回忆年代' ? (
          <>
            <h4>时间片段</h4>
            <ul className="aux-fragments">
              {story.fragments.map((f, i) => (
                <li key={i}>
                  <span className="aux-frag-year">{f.from}–{f.to}</span>
                  <span className="aux-frag-label">{f.label}</span>
                  <CertaintyTag certainty={f.certainty} evidence={f.evidence} />
                  <p>{f.evidence}</p>
                </li>
              ))}
            </ul>
            <p className="drawer-note">播放顺序遵循原章节叙述顺序，不因时间轴排序重排回忆。</p>
          </>
        ) : null}
        {tab === '相关人物地点' ? (
          <>
            <h4>相关人物</h4>
            <div className="aux-people">
              {people.map((p) => (
                <Link key={p.id} to={`/people/${p.id}`} className="aux-person">
                  <Portrait person={p} />
                  <span>
                    <strong>{p.name}</strong>
                    <em>{p.tagline}</em>
                  </span>
                </Link>
              ))}
            </div>
            <h4>相关地点</h4>
            <Link className="aux-location" to={`/map?loc=${story.locationId}`}>
              <Icon name="pin" size={15} />
              {locationName(story.locationId)}
              <Icon name="arrowRight" size={14} />
            </Link>
          </>
        ) : null}
        {tab === '来源' ? (
          <>
            <h4>出处</h4>
            <p>{story.source}</p>
            <p className="muted">逐句脚本状态：{chapter.nodes?.length ? '示例脚本（非官方原文）' : '尚未导入'}</p>
            <p className="muted">最后核对：2026-10-25 · 资料状态：待核对</p>
          </>
        ) : null}
      </div>
    </Drawer>
  )
}
