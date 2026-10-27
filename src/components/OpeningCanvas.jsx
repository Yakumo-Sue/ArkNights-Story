import {useEffect, useRef} from 'react'
import babelUrl from '../assets/opening/babel-logo.png'
import rhodesUrl from '../assets/opening/rhodes-logo.png'
import {buildFracture, clamp, projectShard, smoothstep} from '../lib/fracture.js'
import {OPENING as T} from '../lib/openingTimeline.js'

const assets = new Map()
function loadImage(url) {
  if (!assets.has(url)) assets.set(url, new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = async () => {await image.decode().catch(() => {}); resolve(image)}
    image.onerror = () => {assets.delete(url); reject(new Error('Opening image unavailable'))}
    image.src = url
  }))
  return assets.get(url)
}
function polygon(ctx, points) {
  ctx.beginPath()
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
  ctx.closePath()
}
function surface(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(width))
  canvas.height = Math.max(1, Math.ceil(height))
  return canvas
}
function cover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight)
  ctx.drawImage(image, x + (w - image.naturalWidth * scale) / 2, y + (h - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale)
}

/** Build the glass once per layout. No blur, gradient creation or bitmap slicing per frame. */
function preparePane(fracture, babel, backdrop, pixelRatio) {
  const size = fracture.width
  const pane = surface(size * pixelRatio, size * pixelRatio)
  const ctx = pane.getContext('2d')
  ctx.scale(pixelRatio, pixelRatio)
  polygon(ctx, fracture.triangle)
  ctx.clip()
  const glass = ctx.createLinearGradient(0, 0, size, size)
  glass.addColorStop(0, '#a3c0cc38')
  glass.addColorStop(.38, '#172e3bd4')
  glass.addColorStop(.6, '#081018ec')
  glass.addColorStop(1, '#8aa9bd3d')
  ctx.fillStyle = glass
  ctx.fillRect(0, 0, size, size)
  if (backdrop?.complete && backdrop.naturalWidth) {
    ctx.globalAlpha = .16
    cover(ctx, backdrop, -size * .15, -size * .1, size * 1.3, size * 1.3)
    ctx.globalAlpha = 1
  }
  ctx.drawImage(babel, 0, 0, size, size)
  const reflection = ctx.createLinearGradient(0, 0, size, size * .4)
  reflection.addColorStop(0, '#c5efff00')
  reflection.addColorStop(.42, '#c5efff00')
  reflection.addColorStop(.49, '#e4f7ff24')
  reflection.addColorStop(.53, '#e4f7ff08')
  reflection.addColorStop(1, '#c5efff00')
  ctx.fillStyle = reflection
  ctx.fillRect(0, 0, size, size)

  const shards = fracture.cells.map(cell => {
    const xs = cell.points.map(p => p.x), ys = cell.points.map(p => p.y)
    const bounds = {x:Math.floor(Math.min(...xs)) - 2,y:Math.floor(Math.min(...ys)) - 2}
    bounds.width = Math.ceil(Math.max(...xs)) - bounds.x + 2
    bounds.height = Math.ceil(Math.max(...ys)) - bounds.y + 2
    const sprite = surface(bounds.width * pixelRatio, bounds.height * pixelRatio)
    const g = sprite.getContext('2d')
    g.scale(pixelRatio, pixelRatio)
    g.translate(-bounds.x, -bounds.y)
    polygon(g, cell.points)
    g.clip()
    g.drawImage(pane, 0, 0, size, size)
    g.strokeStyle = '#e1f7ff72'
    g.lineWidth = 1.1
    g.stroke()
    return {...cell, sprite, bounds}
  })
  return {pane,shards:shards.sort((a,b)=>a.vz-b.vz)}
}

/** Affine texture triangles reproduce 3D rotation using cached, tightly cropped sprites. */
function textureTriangle(ctx, sprite, source, target) {
  const [s0,s1,s2] = source, [p0,p1,p2] = target
  const sx1=s1.x-s0.x, sy1=s1.y-s0.y, sx2=s2.x-s0.x, sy2=s2.y-s0.y
  const denominator = sx1*sy2 - sx2*sy1
  if (Math.abs(denominator) < .01) return
  const dx1=p1.x-p0.x, dy1=p1.y-p0.y, dx2=p2.x-p0.x, dy2=p2.y-p0.y
  const a=(dx1*sy2-dx2*sy1)/denominator, c=(dx2*sx1-dx1*sx2)/denominator
  const b=(dy1*sy2-dy2*sy1)/denominator, d=(dy2*sx1-dy1*sx2)/denominator
  ctx.save()
  polygon(ctx,target)
  ctx.clip()
  ctx.transform(a,b,c,d,p0.x-a*s0.x-c*s0.y,p0.y-b*s0.x-d*s0.y)
  ctx.drawImage(sprite,0,0)
  ctx.restore()
}

export default function OpeningCanvas({slotRef, backdropRef, running, runId, reduced, onReady, onFinish}) {
  const canvasRef = useRef(null)
  const callbacks = useRef({onReady,onFinish})
  callbacks.current = {onReady,onFinish}

  useEffect(() => {
    if (!running || reduced) return undefined
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', {alpha:true})
    if (!ctx) {callbacks.current.onFinish?.(); return undefined}
    let disposed=false, raf=0, startedAt=0, hiddenAt=0, elapsed=0, layout=null, textures=null
    let babel, rhodes, observer
    const stage = canvas.parentElement
    let frameCount=0, renderCost=0
    const timeout = setTimeout(() => callbacks.current.onFinish?.(), 8500)

    function measure() {
      if (!babel || disposed) return
      const box=stage.getBoundingClientRect(), slot=slotRef.current?.getBoundingClientRect()
      if (!slot || !box.width || !box.height) return
      const ratio = Math.min(window.devicePixelRatio || 1, box.width < 700 ? 1.35 : 1.6)
      canvas.width=Math.round(box.width*ratio)
      canvas.height=Math.round(box.height*ratio)
      ctx.setTransform(ratio,0,0,ratio,0,0)
      const size=Math.min(340,box.width*(box.width<700?.67:.32),box.height*.48)
      const center={x:box.width*.5,y:box.height*.45}
      const fracture=buildFracture({width:size,height:size,count:box.width<700?27:45})
      layout={width:box.width,height:box.height,size,ratio,center,origin:{x:center.x-size/2,y:center.y-size/2},fracture,
        final:{x:slot.left-box.left,y:slot.top-box.top,w:slot.width,h:slot.height}}
      textures=preparePane(fracture,babel,backdropRef.current,ratio)
      if (startedAt) draw(elapsed)
    }

    function drawRhodes(time) {
      const {center,final,size}=layout
      const reveal=smoothstep(T.rhodesStart,T.rhodesEnd,time)
      if (!reveal) return
      const move=smoothstep(T.moveStart,T.moveEnd,time)
      const initialWidth=size*.92
      const w=initialWidth+(final.w-initialWidth)*move
      const h=w*rhodes.naturalHeight/rhodes.naturalWidth
      const x=(center.x-initialWidth/2)*(1-move)+final.x*move
      const y=(center.y-initialWidth*rhodes.naturalHeight/rhodes.naturalWidth/2)*(1-move)+(final.y+(final.h-final.w*rhodes.naturalHeight/rhodes.naturalWidth)/2)*move
      ctx.globalAlpha=reveal
      ctx.drawImage(rhodes,x,y,w,h)
      ctx.globalAlpha=1
    }

    function draw(time) {
      if (!layout || !textures) return
      const costStart=performance.now()
      const {width,height,size,origin,fracture}=layout
      ctx.clearRect(0,0,width,height)
      drawRhodes(time)
      const reveal=smoothstep(0,T.revealEnd,time)
      if (time<T.shatterStart) {
        const pulse=time<T.revealEnd ? .86+.14*Math.sin(time*.006)**2 : 1
        ctx.globalAlpha=reveal*pulse
        ctx.drawImage(textures.pane,origin.x,origin.y,size,size)
        ctx.globalAlpha=1
        if(time>T.crackStart) {
          const progress=clamp((time-T.crackStart)/(T.shatterStart-T.crackStart))
          ctx.save()
          ctx.translate(origin.x,origin.y)
          ctx.lineWidth=.85
          for(const edge of fracture.edges) {
            const length=smoothstep(edge.dist*.7,Math.min(1,edge.dist*.7+.2),progress)
            if(!length) continue
            ctx.strokeStyle=`rgba(220,243,255,${.3+.48*length})`
            ctx.beginPath();ctx.moveTo(edge.a.x,edge.a.y)
            ctx.lineTo(edge.a.x+(edge.b.x-edge.a.x)*length,edge.a.y+(edge.b.y-edge.a.y)*length)
            ctx.stroke()
          }
          ctx.restore()
        }
      } else if (time<T.shatterEnd) {
        // Far fragments first. Their texture and alpha mask are already cached.
        const shards=textures.shards
        for (const shard of shards) {
          const age=Math.max(0,time-T.shatterStart-shard.delay)
          const opacity=1-smoothstep(shard.life*.5,shard.life,age)
          if(opacity<.006) continue
          const points=projectShard(shard,age/1000,size,origin)
          const {bounds}=shard
          const source=shard.points.map(p=>({x:(p.x-bounds.x)*layout.ratio,y:(p.y-bounds.y)*layout.ratio}))
          const facing=Math.abs(Math.cos(shard.rx*age/1000)*Math.cos(shard.ry*age/1000))
          ctx.globalAlpha=opacity*(.48+.52*facing)
          for(let i=1;i<points.length-1;i++) textureTriangle(ctx,shard.sprite,[source[0],source[i],source[i+1]],[points[0],points[i],points[i+1]])
          polygon(ctx,points)
          ctx.strokeStyle=`rgba(210,240,255,${.26+.6*Math.abs(Math.sin(age*.004+shard.glint*6))})`
          ctx.lineWidth=.65
          ctx.stroke()
          ctx.globalAlpha=1
        }
        // Restrained impact ring and fine chips, using only cheap paths.
        const impactAge=time-T.shatterStart
        if(impactAge<390) {
          ctx.globalAlpha=(1-impactAge/390)*.32
          ctx.strokeStyle='#e6f6ff'
          ctx.lineWidth=.7
          ctx.beginPath();ctx.arc(origin.x+fracture.impact.x,origin.y+fracture.impact.y,5+impactAge*.11,0,Math.PI*2);ctx.stroke()
          ctx.globalAlpha=1
        }
      }
      frameCount++
      renderCost+=performance.now()-costStart
      if(import.meta.env.DEV) {
        canvas.dataset.elapsed=String(Math.round(time))
        canvas.dataset.phase=time<T.crackStart?'reveal':time<T.shatterStart?'crack':time<T.shatterEnd?'burst':'settle'
        canvas.dataset.averageRenderMs=(renderCost/frameCount).toFixed(2)
        canvas.dataset.shards=String(textures.shards.length)
      }
    }

    function tick(now) {
      if(disposed || document.hidden) return
      if(!startedAt) startedAt=now
      elapsed=Math.min(T.total,now-startedAt)
      draw(elapsed)
      if(elapsed<T.total) raf=requestAnimationFrame(tick)
      else {clearTimeout(timeout);callbacks.current.onFinish?.()}
    }
    function onVisibility() {
      if(document.hidden) {hiddenAt=performance.now();cancelAnimationFrame(raf);clearTimeout(timeout)}
      else if(hiddenAt) {
        if(startedAt) startedAt+=performance.now()-hiddenAt
        hiddenAt=0
        raf=requestAnimationFrame(tick)
      }
    }
    Promise.all([loadImage(babelUrl),loadImage(rhodesUrl),backdropRef.current?.decode().catch(()=>{})]).then(images=>{
      if(disposed)return
      ;[babel,rhodes]=images
      measure()
      observer=new ResizeObserver(measure)
      observer.observe(stage)
      if(slotRef.current)observer.observe(slotRef.current)
      document.addEventListener('visibilitychange',onVisibility)
      callbacks.current.onReady?.()
      if(!document.hidden)raf=requestAnimationFrame(tick)
      else hiddenAt=performance.now()
    }).catch(()=>{if(!disposed)callbacks.current.onFinish?.()})
    return ()=>{
      disposed=true
      clearTimeout(timeout)
      cancelAnimationFrame(raf)
      observer?.disconnect()
      document.removeEventListener('visibilitychange',onVisibility)
      textures=null
    }
  },[running,runId,reduced,slotRef,backdropRef])

  return <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
}
