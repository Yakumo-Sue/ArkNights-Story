/** Frame-independent wheel gesture policy, shared by all four primary pages. */
export const GESTURE_IDLE = 210
export const PAGE_COOLDOWN = 950
export const WHEEL_THRESHOLD = 84

export function normalizeWheel({deltaY = 0, deltaX = 0, deltaMode = 0, ctrlKey = false, metaKey = false}, viewportHeight = 900) {
  // Pinch-to-zoom and horizontal timeline gestures belong to the browser/widget.
  if (ctrlKey || metaKey || Math.abs(deltaX) > Math.abs(deltaY) * 1.15) return 0
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? viewportHeight : 1
  return Math.max(-160, Math.min(160, deltaY * unit))
}

export function canScrollRange({scrollTop = 0, scrollHeight = 0, clientHeight = 0}, direction, tolerance = 3) {
  const extent = Math.max(0, scrollHeight - clientHeight)
  if (extent <= tolerance) return false
  return direction > 0 ? scrollTop < extent - tolerance : scrollTop > tolerance
}

export function createWheelGesture({idle = GESTURE_IDLE, cooldown = PAGE_COOLDOWN, threshold = WHEEL_THRESHOLD} = {}) {
  let lastAt = -Infinity, lastNavigation = -Infinity, sum = 0, direction = 0
  let consumed = false, blocked = false
  return {
    push(delta, now, eligible = true) {
      if (!delta || !Number.isFinite(delta)) return 0
      const sign = Math.sign(delta)
      if (now - lastAt > idle) {sum = 0; direction = sign; consumed = false; blocked = false}
      lastAt = now
      // Once a gesture scrolls content, its tail cannot turn a page at the edge.
      if (!eligible) {blocked = true; sum = 0; return 0}
      if (consumed || blocked || now - lastNavigation < cooldown) return 0
      if (sign !== direction) {direction = sign; sum = 0}
      sum += delta
      if (Math.abs(sum) < threshold) return 0
      consumed = true; lastNavigation = now; sum = 0
      return sign
    },
    consume(now) {lastAt = now; lastNavigation = now; consumed = true; sum = 0},
  }
}
