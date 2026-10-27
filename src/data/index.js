import { stories, storyById, storyTypes } from './stories.js'
import { people, personById, organizations, orgById, peopleForStory } from './people.js'
import { relations, relationTypes } from './relations.js'
import { locations, locationById } from './geography.js'
import { worldEntries, entryById, worldChapters, entriesByChapter } from './world.js'
import { albums, galleryItems } from './media.js'

export {
  stories,
  storyById,
  storyTypes,
  people,
  personById,
  organizations,
  orgById,
  peopleForStory,
  relations,
  relationTypes,
  locations,
  locationById,
  worldEntries,
  entryById,
  worldChapters,
  entriesByChapter,
  albums,
  galleryItems,
}

/* ------------------------------ 时间轴 ------------------------------ */

/** 叙事系列（用于筛选；与「剧情类型」不同） */
const ARC_BY_STORY = {
  'main-00': '切尔诺伯格篇',
  'main-01': '切尔诺伯格篇',
  'main-02': '龙门篇',
  'main-03': '龙门篇',
  'main-04': '龙门篇',
  'main-05': '龙门篇',
  'main-06': '龙门篇',
  'main-07': '乌萨斯篇',
  'main-08': '切尔诺伯格篇',
  'main-09': '维多利亚篇',
  'main-10': '维多利亚篇',
  'main-11': '维多利亚篇',
  'main-12': '维多利亚篇',
  'main-13': '维多利亚篇',
  'sid-01': '卡西米尔篇',
  'sid-02': '汐斯塔篇',
  'sid-03': '龙门篇',
  'sid-04': '卡兹戴尔篇',
  'sid-05': '深海篇',
  'sid-06': '深海篇',
  'sid-07': '卡西米尔篇',
  'sid-08': '谢拉格篇',
  'sid-09': '哥伦比亚篇',
  'sid-10': '大炎篇',
  'sid-11': '大炎篇',
  'sid-12': '乌萨斯篇',
  'sid-13': '叙拉古篇',
  'sid-14': '卡兹戴尔篇',
  'col-01': '维多利亚篇',
  'col-02': '萨米篇',
  'col-03': '谢拉格篇',
  'col-04': '哥伦比亚篇',
}

export const arcs = Array.from(new Set(Object.values(ARC_BY_STORY)))

export function arcOf(storyId) {
  return ARC_BY_STORY[storyId] ?? '其他'
}

const releaseTime = (s) => {
  const [y, m = '1', d = '1'] = String(s.release.date).split('-')
  return Date.UTC(Number(y), Number(m) - 1, Number(d))
}

/** 剧情片段：时间轴的最小单位（与故事主卡分开建条目） */
export const timelineEvents = stories
  .flatMap((story) =>
    story.fragments.map((frag, i) => ({
      id: `${story.id}::${i}`,
      storyId: story.id,
      fragIndex: i,
      title: story.title,
      en: story.en,
      label: frag.label,
      type: story.type,
      series: story.series,
      arc: arcOf(story.id),
      episode: story.episode,
      from: frag.from,
      to: frag.to,
      precision: frag.precision,
      certainty: frag.certainty,
      region: frag.region,
      memory: !!frag.memory,
      nonCanon: !!frag.nonCanon,
      disputed: !!frag.disputed,
      evidence: frag.evidence,
      location: story.location,
      locationId: story.locationId,
      summary: story.summary,
      cover: story.cover,
      spoiler: story.spoiler,
      release: story.release,
      releaseOrder: story.release.order,
      releaseTime: releaseTime(story),
      yearLabel: formatYearRange(frag.from, frag.to, frag.precision),
      // 未定/争议：不进入精确年份轴
      undated: frag.certainty === 'unknown' || !!frag.disputed,
    })),
  )
  .sort((a, b) => a.from - b.from || a.releaseOrder - b.releaseOrder)

export function formatYearRange(from, to, precision) {
  if (from == null) return '年代未定'
  if (to != null && to !== from) {
    if (precision === '区间') return `${from} — ${to}`
    return `${from} — ${to}`
  }
  return `${from}`
}

export const TERRA_DOMAIN = { min: 1082, max: 1102 }

export function dateToYear(ts) {
  const d = new Date(ts)
  const y = d.getUTCFullYear()
  const start = Date.UTC(y, 0, 1)
  const end = Date.UTC(y + 1, 0, 1)
  return y + (ts - start) / (end - start)
}

export const RELEASE_DOMAIN = {
  min: dateToYear(Date.UTC(2019, 3, 30)),
  max: dateToYear(Date.UTC(2026, 9, 25)),
}

/** 按年代 / 实装顺序排序 */
export function sortEvents(events, mode) {
  const list = [...events]
  if (mode === 'release') {
    list.sort((a, b) => a.releaseTime - b.releaseTime || a.releaseOrder - b.releaseOrder)
  } else {
    list.sort((a, b) => a.from - b.from || a.to - b.to || a.releaseOrder - b.releaseOrder)
  }
  return list
}

/** 同年代/同批次事件分组 */
export function groupEvents(events, mode) {
  const map = new Map()
  for (const e of events) {
    const key = mode === 'release' ? e.release.date.slice(0, 7) : String(e.from)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  }
  return [...map.entries()].map(([key, items]) => ({ key, items }))
}

/* ------------------------------ 检索与关联 ------------------------------ */

export function storyTitle(id) {
  return storyById[id]?.title ?? id
}

export function personName(id) {
  return personById[id]?.name ?? id
}

export function locationName(id) {
  return locationById[id]?.name ?? id
}

/** 干员形态（列表页的卡片单位） */
export const operatorForms = people.flatMap((p) =>
  p.forms.map((f) => ({
    ...f,
    personId: p.id,
    nation: p.nation,
    org: p.org,
    race: p.race,
    firstStory: p.firstStory,
    spoiler: p.spoiler,
    color: p.color,
    aliases: p.aliases,
  })),
)

export function personForForm(formId) {
  return people.find((p) => p.forms.some((f) => f.id === formId)) ?? null
}

/** 首页/总览推荐阅读顺序（编辑建议，不代表官方） */
export const recommendedOrder = [
  'main-00',
  'main-01',
  'main-02',
  'main-05',
  'main-06',
  'sid-01',
  'sid-07',
  'main-08',
  'sid-05',
  'sid-09',
]

/** 章节可播放：是否存在逐句脚本 */
export function chapterScript(chapter) {
  return chapter?.nodes?.length ? chapter.nodes : null
}

export function firstPlayableSegment(story) {
  const chapter = story?.chapters?.find((c) => c.nodes?.length)
  return chapter ?? story?.chapters?.[0] ?? null
}

export function segmentPath(storyId, chapterId) {
  return `/stories/${storyId}/play/${chapterId}`
}

/** 全站检索：剧情、人物、地点、设定 */
export function searchAll(keyword) {
  const q = keyword.trim().toLowerCase()
  if (!q) return []
  const results = []
  const hit = (text) => String(text ?? '').toLowerCase().includes(q)

  for (const s of stories) {
    if (hit(s.title) || hit(s.en) || hit(s.summary) || hit(s.location)) {
      results.push({ kind: 'story', id: s.id, title: s.title, sub: `${s.series} · ${s.location}`, to: `/stories/${s.id}`, spoiler: s.spoiler })
    }
  }
  for (const p of people) {
    if (hit(p.name) || hit(p.en) || p.aliases.some(hit) || hit(p.tagline)) {
      results.push({ kind: 'person', id: p.id, title: p.name, sub: `${p.nation} · ${orgById[p.org]?.name ?? ''}`, to: `/people/${p.id}`, spoiler: p.spoiler })
    }
  }
  for (const l of locations) {
    if (hit(l.name) || hit(l.en) || hit(l.summary)) {
      results.push({ kind: 'location', id: l.id, title: l.name, sub: `地点 · ${l.type}`, to: `/map?loc=${l.id}`, spoiler: 0 })
    }
  }
  for (const e of worldEntries) {
    if (hit(e.name) || hit(e.en) || hit(e.lead)) {
      results.push({ kind: 'entry', id: e.id, title: e.name, sub: `设定 · 第 ${e.chapter} 章`, to: `/world/${e.id}`, spoiler: 0 })
    }
  }
  return results.slice(0, 24)
}

/** 统计信息（用于页脚与关于页） */
export const stats = {
  stories: stories.length,
  segments: stories.reduce((n, s) => n + s.chapters.length, 0),
  scripted: stories.reduce((n, s) => n + s.chapters.filter((c) => c.nodes?.length).length, 0),
  people: people.length,
  forms: operatorForms.length,
  relations: relations.length,
  locations: locations.length,
  entries: worldEntries.length,
  albums: albums.length,
  gallery: galleryItems.length,
}
