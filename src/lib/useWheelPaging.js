import {useEffect, useRef} from 'react'
import {canScrollRange, createWheelGesture, normalizeWheel, PAGE_COOLDOWN} from './wheelPagingCore.js'

const LOCKED_TARGETS = 'input,select,textarea,[contenteditable="true"],[role="slider"],[role="dialog"],[data-no-page-scroll],.site-header,.site-footer'
const modalOpen = () => Boolean(document.querySelector('[aria-modal="true"],dialog[open],[data-page-paging-lock="true"]'))

export function pageCanTurn(target, direction) {
  if (modalOpen() || target?.closest(LOCKED_TARGETS)) return false
  for (let node = target; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY) && canScrollRange(node, direction)) return false
  }
  return !canScrollRange(document.scrollingElement || document.documentElement, direction)
}

/** Natural content scrolling first; a fresh, deliberate gesture at an edge turns one page. */
export function useWheelPaging({enabled = true, onNext, onPrev, cooldown = PAGE_COOLDOWN}) {
  const callbacks = useRef({onNext, onPrev})
  const gesture = useRef(null)
  if (!gesture.current) gesture.current = createWheelGesture({cooldown})
  useEffect(() => {callbacks.current = {onNext, onPrev}}, [onNext, onPrev])

  useEffect(() => {
    if (!enabled) return undefined
    let touch = null
    const callback = direction => direction > 0 ? callbacks.current.onNext : callbacks.current.onPrev
    const onWheel = event => {
      const delta = normalizeWheel(event, window.innerHeight)
      if (!delta) return
      const target = event.target instanceof Element ? event.target : null
      const direction = Math.sign(delta)
      const eligible = !event.defaultPrevented && Boolean(callback(direction)) && pageCanTurn(target, direction)
      const turn = gesture.current.push(delta, performance.now(), eligible)
      if (!eligible) return
      event.preventDefault()
      if (turn) callback(turn)?.()
    }
    const onTouchStart = event => {
      if (event.touches.length !== 1) {touch = null; return}
      const point = event.touches[0]
      const target = event.target instanceof Element ? event.target : null
      touch = {x:point.clientX, y:point.clientY, next:pageCanTurn(target, 1), prev:pageCanTurn(target, -1), target}
    }
    const onTouchEnd = event => {
      if (!touch || event.changedTouches.length !== 1) {touch = null; return}
      const current = touch; touch = null
      const dx = current.x - event.changedTouches[0].clientX
      const dy = current.y - event.changedTouches[0].clientY
      const direction = Math.sign(dy)
      if (Math.abs(dy) < 84 || Math.abs(dy) < Math.abs(dx) * 1.3) return
      if (!(direction > 0 ? current.next : current.prev) || !pageCanTurn(current.target, direction)) return
      const turn = gesture.current.push(direction * 120, performance.now(), Boolean(callback(direction)))
      if (turn) callback(turn)?.()
    }
    const onTouchCancel = () => {touch = null}
    window.addEventListener('touchcancel', onTouchCancel, {passive:true})
    window.addEventListener('wheel', onWheel, {passive:false})
    window.addEventListener('touchstart', onTouchStart, {passive:true})
    window.addEventListener('touchend', onTouchEnd, {passive:true})
    return () => {
      window.removeEventListener('touchcancel', onTouchCancel)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled])
}
