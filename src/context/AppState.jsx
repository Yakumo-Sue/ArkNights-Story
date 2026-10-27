import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'
import { audioEngine } from '../lib/audio.js'
import { albums } from '../data/media.js'

const AppStateContext = createContext(null)

const DEFAULT_PREFS = {
  textSpeed: 'normal', // slow | normal | fast | instant
  volume: 0.5,
  readingTheme: 'paper', // paper | dark
  autoDelay: 1800,
  showUndated: true,
}

const DEFAULT_PROGRESS = {}

export function AppStateProvider({ children }) {
  const [prefs, setPrefsState] = useState(() => ({ ...DEFAULT_PREFS, ...readJSON('prefs', {}) }))
  const [progress, setProgressState] = useState(() => readJSON('progress', DEFAULT_PROGRESS))
  const [bookmarks, setBookmarksState] = useState(() => readJSON('bookmarks', []))
  const [music, setMusic] = useState({ albumId: null, trackIndex: 0, playing: false })

  // ---- 持久化 ----
  useEffect(() => {
    writeJSON('prefs', prefs)
  }, [prefs])

  useEffect(() => {
    writeJSON('progress', progress)
  }, [progress])

  useEffect(() => {
    writeJSON('bookmarks', bookmarks)
  }, [bookmarks])

  const setPrefs = useCallback((patch) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch }
      if (patch.volume != null) audioEngine.setVolume(patch.volume)
      return next
    })
  }, [])

  // ---- 阅读进度 ----
  const saveProgress = useCallback((storyId, chapterId, nodeIndex, extra = {}) => {
    setProgressState((prev) => {
      const cur = prev[storyId] || { visited: {}, read: {}, choices: {} }
      const next = {
        ...cur,
        chapterId,
        nodeIndex,
        visited: { ...cur.visited, [chapterId]: Math.max(cur.visited?.[chapterId] ?? 0, nodeIndex) },
        read: { ...cur.read, ...(extra.read ? { [chapterId]: true } : {}) },
        choices: { ...cur.choices, ...(extra.choice ? { [chapterId]: extra.choice } : {}) },
        updatedAt: Date.now(),
      }
      return { ...prev, [storyId]: next }
    })
  }, [])

  const getProgress = useCallback((storyId) => progress[storyId] ?? null, [progress])

  const addBookmark = useCallback((mark) => {
    setBookmarksState((prev) => {
      const exists = prev.find((b) => b.storyId === mark.storyId && b.chapterId === mark.chapterId)
      if (exists) return prev
      return [{ ...mark, at: Date.now() }, ...prev].slice(0, 40)
    })
  }, [])

  const removeBookmark = useCallback((storyId, chapterId) => {
    setBookmarksState((prev) => prev.filter((b) => !(b.storyId === storyId && b.chapterId === chapterId)))
  }, [])

  // ---- 音乐（全局唯一音源） ----
  const musicRef = useRef(music)
  musicRef.current = music

  const calendarAlbum = useCallback((albumId) => albums.find((a) => a.id === albumId) ?? null, [])

  const startMusic = useCallback(
    (album, trackIndex = 0) => {
      if (!album) return
      const ok = audioEngine.start(album.mood, { volume: prefs.volume })
      if (!ok) return
      setMusic({ albumId: album.id, trackIndex, playing: true })
    },
    [prefs.volume],
  )

  const pauseMusic = useCallback(() => {
    audioEngine.stop()
    setMusic((m) => ({ ...m, playing: false }))
  }, [])

  const resumeMusic = useCallback(() => {
    const album = calendarAlbum(musicRef.current.albumId)
    if (!album) return
    audioEngine.start(album.mood, { volume: prefs.volume })
    setMusic((m) => ({ ...m, playing: true }))
  }, [calendarAlbum, prefs.volume])

  const stopMusic = useCallback(() => {
    if (audioEngine.playing) audioEngine.stop()
    setMusic({ albumId: null, trackIndex: 0, playing: false })
  }, [])

  const nextTrack = useCallback(() => {
    const album = calendarAlbum(musicRef.current.albumId)
    if (!album) return
    const idx = (musicRef.current.trackIndex + 1) % album.tracks.length
    setMusic({ albumId: album.id, trackIndex: idx, playing: true })
    audioEngine.start(album.mood, { volume: prefs.volume })
  }, [calendarAlbum, prefs.volume])

  const prevTrack = useCallback(() => {
    const album = calendarAlbum(musicRef.current.albumId)
    if (!album) return
    const idx = (musicRef.current.trackIndex - 1 + album.tracks.length) % album.tracks.length
    setMusic({ albumId: album.id, trackIndex: idx, playing: true })
    audioEngine.start(album.mood, { volume: prefs.volume })
  }, [calendarAlbum, prefs.volume])

  // 离开标签页时暂停音乐；回到页面后不自动恢复出声
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && musicRef.current.playing) {
        audioEngine.stop()
        setMusic((m) => ({ ...m, playing: false }))
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  const value = useMemo(
    () => ({
      prefs,
      setPrefs,
      progress,
      saveProgress,
      getProgress,
      bookmarks,
      addBookmark,
      removeBookmark,
      music,
      startMusic,
      pauseMusic,
      resumeMusic,
      stopMusic,
      nextTrack,
      prevTrack,
      audioSupported: audioEngine.isSupported(),
    }),
    [
      prefs,
      setPrefs,
      progress,
      saveProgress,
      getProgress,
      bookmarks,
      addBookmark,
      removeBookmark,
      music,
      startMusic,
      pauseMusic,
      resumeMusic,
      stopMusic,
      nextTrack,
      prevTrack,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider')
  return ctx
}

export { DEFAULT_PREFS }
