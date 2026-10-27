const releaseTimestamp = event => event.releaseTime ?? Date.parse(event.release?.date)

/** A stage contains every recorded fragment intersecting that year. Unknown dates stay separate. */
export function buildTimelineStages(events, mode = 'terra') {
  const buckets = new Map()
  for (const event of events) {
    let first, last
    if (mode === 'release') {
      const timestamp = releaseTimestamp(event)
      if (!Number.isFinite(timestamp)) continue
      first = last = new Date(timestamp).getUTCFullYear()
    } else {
      if (event.undated || !Number.isFinite(event.from)) continue
      first = Math.floor(event.from)
      last = Math.floor(Number.isFinite(event.to) ? event.to : event.from)
      if (last < first) continue
    }
    for (let year = first; year <= last; year++) {
      if (!buckets.has(year)) buckets.set(year, new Map())
      buckets.get(year).set(event.id, event)
    }
  }
  return [...buckets.entries()].sort(([a], [b]) => a - b).map(([year, eventsById]) => {
    const items = [...eventsById.values()].sort((a, b) =>
      (mode === 'release' ? releaseTimestamp(a) - releaseTimestamp(b) : a.from - b.from) ||
      (a.releaseOrder ?? 0) - (b.releaseOrder ?? 0) || (a.fragIndex ?? 0) - (b.fragIndex ?? 0) || a.id.localeCompare(b.id),
    )
    return {id:`${mode}:${year}`,year,items,storyCount:new Set(items.map(item => item.storyId)).size}
  })
}

export function layoutTimelineStages(stages, {width = 1100, expandedYear = null, zoom = 1} = {}) {
  const collapsedWidth = Math.max(90, Math.min(132, (width - 96) / Math.min(8, stages.length || 1))) * zoom
  const sizes = stages.map(stage => stage.year === expandedYear
    ? Math.max(330, Math.min(820, width * .68), stage.items.length * 38 + 80) * zoom
    : collapsedWidth)
  const total = sizes.reduce((sum, size) => sum + size, 0)
  let left = Math.max(36, (width - total) / 2)
  const rows = stages.map((stage, i) => {
    const result = {...stage,left,width:sizes[i],center:left + sizes[i] / 2}
    left += sizes[i]
    return result
  })
  return {stages:rows,width:Math.max(width, left + 36),maxOffset:Math.max(0, left + 36 - width)}
}

export const clampTimelineOffset = (value, layout) => Math.max(0, Math.min(layout.maxOffset, value))
export const centerTimelineStage = (stage, width, layout) => clampTimelineOffset(stage.center - width / 2, layout)
export function nearestTimelineStage(layout, offset, width) {
  const center = offset + width / 2
  return layout.stages.reduce((best, stage) => !best || Math.abs(stage.center - center) < Math.abs(best.center - center) ? stage : best, null)
}
