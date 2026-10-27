import {mulberry32} from './random.js'

export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value))
export const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}
export const easeOutCubic = t => 1 - (1 - t) ** 3

export function polygonArea(points) {
  return Math.abs(points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length]
    return sum + p.x * q.y - q.x * p.y
  }, 0)) / 2
}

export function polygonCentroid(points) {
  let area = 0, x = 0, y = 0
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length]
    const cross = p.x * q.y - q.x * p.y
    area += cross
    x += (p.x + q.x) * cross
    y += (p.y + q.y) * cross
  })
  return {x:x / (3 * area), y:y / (3 * area)}
}

/** Shared radial edges form a continuous pane, with irregular concentric cracks. */
export function buildFracture({width, height, count = 45, seed = 20261027, impact = {x:0.49, y:0.59}}) {
  const rng = mulberry32(seed)
  const triangle = [{x:width * .062,y:height * .876}, {x:width * .938,y:height * .876}, {x:width * .5,y:height * .122}]
  const ip = {x:impact.x * width,y:impact.y * height}
  const divisions = Math.max(3, Math.round(count / 9))
  const outer = triangle.flatMap((a, edge) => {
    const b = triangle[(edge + 1) % 3]
    return Array.from({length:divisions}, (_, i) => {
      const t = i === 0 ? 0 : (i + (rng() - .5) * .45) / divisions
      return {x:a.x + (b.x - a.x) * t, y:a.y + (b.y - a.y) * t}
    })
  })
  const rings = [.24, .59].map(radius => outer.map(p => {
    const r = radius + (rng() - .5) * .12
    return {x:ip.x + (p.x - ip.x) * r, y:ip.y + (p.y - ip.y) * r}
  }))
  rings.push(outer)
  const polygons = []
  for (let i = 0; i < outer.length; i++) {
    const next = (i + 1) % outer.length
    polygons.push([ip, rings[0][i], rings[0][next]])
    for (let r = 1; r < rings.length; r++) {
      polygons.push([rings[r - 1][i], rings[r][i], rings[r][next], rings[r - 1][next]])
    }
  }
  const maxDist = Math.max(...outer.map(p => Math.hypot(p.x - ip.x, p.y - ip.y)))
  const cells = polygons.map((points, index) => {
    const centroid = polygonCentroid(points)
    const angle = Math.atan2(centroid.y - ip.y, centroid.x - ip.x) + (rng() - .5) * .32
    const dist = Math.hypot(centroid.x - ip.x, centroid.y - ip.y) / maxDist
    return {
      index, points, centroid, dist, area:polygonArea(points),
      delay:dist * 75 + rng() * 22,
      vx:Math.cos(angle) * width * (.55 + rng() * .7),
      vy:Math.sin(angle) * width * (.5 + rng() * .55) - height * .18,
      vz:width * (rng() - .55) * 1.15,
      rx:(rng() - .5) * 5.5, ry:(rng() - .5) * 6.5, rz:(rng() - .5) * 2.6,
      life:1120 + rng() * 380, glint:rng(),
    }
  })
  const edgeMap = new Map()
  cells.forEach(cell => cell.points.forEach((a, i) => {
    const b = cell.points[(i + 1) % cell.points.length]
    const keys = [a, b].map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).sort()
    const key = keys.join('|')
    if (!edgeMap.has(key)) edgeMap.set(key, {a,b,dist:Math.min(Math.hypot(a.x-ip.x,a.y-ip.y),Math.hypot(b.x-ip.x,b.y-ip.y)) / maxDist})
  }))
  return {width,height,triangle,impact:ip,cells,edges:[...edgeMap.values()],maxDist}
}

/** Time in seconds, independent of frame rate; perspective uses a finite near plane. */
export function projectShard(cell, time, width, origin) {
  const t = Math.max(0, time)
  const ax = cell.rx * t, ay = cell.ry * t, az = cell.rz * t
  const sx = Math.sin(ax), cx = Math.cos(ax), sy = Math.sin(ay), cy = Math.cos(ay), sz = Math.sin(az), cz = Math.cos(az)
  const focal = width * 3.5
  const center = {x:origin.x + cell.centroid.x + cell.vx * t, y:origin.y + cell.centroid.y + cell.vy * t + width * .5 * t * t}
  return cell.points.map(p => {
    const x = p.x - cell.centroid.x, y = p.y - cell.centroid.y
    const y1 = y * cx, z1 = y * sx
    const x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy + cell.vz * t
    const scale = focal / Math.max(focal * .28, focal - z2)
    return {x:center.x + (x2 * cz - y1 * sz) * scale, y:center.y + (x2 * sz + y1 * cz) * scale}
  })
}
