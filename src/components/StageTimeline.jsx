import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import Icon from './Icon.jsx'
import {clampTimelineOffset,centerTimelineStage,layoutTimelineStages,nearestTimelineStage} from '../lib/timelineModel.js'

const ZOOMS = [.8,1,1.3,1.6]

export default function StageTimeline({stages,mode,expandedYear,activeYear,selectedId,onExpand,onSelect,onBrowse}) {
  const trackRef=useRef(null), dragRef=useRef(null), offsetRef=useRef(0), timerRef=useRef(0), ignoreClick=useRef(false)
  const focusRequest=useRef(null)
  const selectionRef=useRef(selectedId)
  selectionRef.current=selectedId
  const activeYearRef=useRef(activeYear)
  activeYearRef.current=activeYear
  const [width,setWidth]=useState(1100)
  const [offset,setOffset]=useState(0)
  const [zoomIndex,setZoomIndex]=useState(1)
  const [panning,setPanning]=useState(false)
  const [hover,setHover]=useState(null)
  const [listOpen,setListOpen]=useState(true)
  const [yearInput,setYearInput]=useState('')
  const layout=useMemo(()=>layoutTimelineStages(stages,{width,expandedYear,zoom:ZOOMS[zoomIndex]}),[stages,width,expandedYear,zoomIndex])
  const expanded=layout.stages.find(stage=>stage.year===expandedYear)
  const current=expanded || layout.stages.find(stage=>stage.year===activeYear) || layout.stages.find(stage=>stage.items.some(item=>item.id===selectedId))

  const moveTo=useCallback(value=>{
    const next=clampTimelineOffset(value,layout)
    offsetRef.current=next
    setOffset(next)
  },[layout])

  useEffect(()=>{
    const track=trackRef.current
    const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width))
    observer.observe(track)
    setWidth(track.clientWidth)
    return ()=>observer.disconnect()
  },[])
  useLayoutEffect(()=>{
    const anchor=layout.stages.find(stage=>stage.year===expandedYear) || layout.stages.find(stage=>stage.year===activeYearRef.current) || layout.stages.find(stage=>stage.items.some(item=>item.id===selectionRef.current)) || layout.stages[0]
    moveTo(anchor?centerTimelineStage(anchor,width,layout):0)
    setHover(null)
  },[layout,expandedYear,width,moveTo])
  useEffect(()=>{
    setListOpen(true)
    const request=focusRequest.current
    if(request==null)return
    const target=expandedYear!=null
      ? (trackRef.current?.querySelector('.stg-event-dot[aria-pressed="true"]') ?? trackRef.current?.querySelector('.stg-event-dot'))
      : trackRef.current?.querySelector(`[data-stage-year="${request}"]`)
    target?.focus({preventScroll:true})
    focusRequest.current=null
  },[expandedYear])

  const browseAt=useCallback(value=>{
    if(expandedYear!=null)return
    const nearest=nearestTimelineStage(layout,value,width)
    if(nearest)onBrowse(nearest)
  },[layout,width,expandedYear,onBrowse])
  useEffect(()=>{
    const element=trackRef.current
    const wheel=event=>{
      if(event.ctrlKey||event.metaKey)return
      const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY
      if(!delta)return
      event.preventDefault()
      const factor=event.deltaMode===1?16:event.deltaMode===2?width:1
      moveTo(offsetRef.current+delta*factor)
      setPanning(true)
      clearTimeout(timerRef.current)
      timerRef.current=setTimeout(()=>{setPanning(false);browseAt(offsetRef.current)},160)
    }
    element.addEventListener('wheel',wheel,{passive:false})
    return ()=>{element.removeEventListener('wheel',wheel);clearTimeout(timerRef.current)}
  },[moveTo,browseAt,width])

  const expand=stage=>{focusRequest.current=stage.year;setHover(null);onExpand(stage.year)}
  const collapse=()=>{focusRequest.current=expandedYear;onExpand(null)}
  const onPointerDown=event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return
    ignoreClick.current=false
    dragRef.current={x:event.clientX,y:event.clientY,offset:offsetRef.current,moved:false}
  }
  const onPointerMove=event=>{
    const drag=dragRef.current
    if(!drag)return
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y
    if(!drag.moved&&Math.abs(dx)<6)return
    if(!drag.moved&&Math.abs(dy)>Math.abs(dx)){dragRef.current=null;return}
    if(!drag.moved){drag.moved=true;event.currentTarget.setPointerCapture(event.pointerId)}
    setPanning(true)
    moveTo(drag.offset-dx)
  }
  const endPointer=event=>{
    const drag=dragRef.current
    dragRef.current=null
    setPanning(false)
    if(drag?.moved){ignoreClick.current=true;if(event.type!=='pointercancel')browseAt(offsetRef.current)}
  }
  const step=direction=>{
    if(expanded){
      const index=expanded.items.findIndex(item=>item.id===selectedId)
      const next=Math.max(0,Math.min(expanded.items.length-1,index+direction))
      const item=expanded.items[next]
      onSelect(item)
      moveTo(expanded.left+((next+.5)/expanded.items.length)*expanded.width-width/2)
    }else{
      const index=layout.stages.findIndex(stage=>stage.year===current?.year)
      const stage=layout.stages[Math.max(0,Math.min(layout.stages.length-1,index+direction))]
      if(stage){onBrowse(stage);moveTo(centerTimelineStage(stage,width,layout))}
    }
  }
  const jump=event=>{
    event.preventDefault()
    const year=Number(yearInput)
    const stage=layout.stages.find(item=>item.year===year)
    if(stage){expand(stage);setYearInput('')}
  }

  return <section className="stg-timeline" aria-label="阶段剧情时间轴" data-no-page-scroll>
    <div className="stg-toolbar">
      <div className="stg-heading"><span className="eyebrow">{expanded?'CHAPTERS IN FOCUS':'STORY PERIODS'}</span><strong>{expanded?`${expanded.year} 年 · 剧情展开`:'阶段总览'}</strong></div>
      {expanded?<button type="button" className="chip stg-back" onClick={collapse}><Icon name="chevronLeft" size={14}/>返回阶段总览</button>:<span className="stg-instruction">每条竖线汇集一个阶段 · 点击展开</span>}
      <div className="stg-tools">
        <button className="icon-btn" type="button" onClick={()=>moveTo(offset-width*.65)} aria-label="向左平移"><Icon name="chevronLeft"/></button>
        <button className="icon-btn" type="button" onClick={()=>moveTo(offset+width*.65)} aria-label="向右平移"><Icon name="chevronRight"/></button>
        <button className="icon-btn" type="button" onClick={()=>setZoomIndex(index=>Math.max(0,index-1))} disabled={zoomIndex===0} aria-label="缩小"><Icon name="minus" size={15}/></button>
        <span className="stg-scale">{Math.round(ZOOMS[zoomIndex]*100)}%</span>
        <button className="icon-btn" type="button" onClick={()=>setZoomIndex(index=>Math.min(ZOOMS.length-1,index+1))} disabled={zoomIndex===ZOOMS.length-1} aria-label="放大"><Icon name="plus" size={15}/></button>
      </div>
      <form className="stg-jump" onSubmit={jump}><input value={yearInput} onChange={event=>setYearInput(event.target.value.replace(/\D/g,''))} aria-label="跳转年份" placeholder="跳转年份" inputMode="numeric" maxLength={4}/><button type="submit" className="btn btn-tiny" disabled={!layout.stages.some(stage=>stage.year===Number(yearInput))}>定位</button></form>
    </div>
    <div className={`stg-track ${panning?'is-panning':''}`} ref={trackRef} tabIndex={0} role="group" aria-label="拖动或滚轮横向浏览；点击阶段展开，方向键切换，Esc返回总览"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer}
      onClickCapture={event=>{if(ignoreClick.current){event.preventDefault();event.stopPropagation();ignoreClick.current=false}}}
      onKeyDown={event=>{
        if(!stages.length)return
        if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1)}
        else if(event.key==='Escape'){event.preventDefault();collapse()}
        else if(event.key==='Enter'&&event.target===event.currentTarget&&current){event.preventDefault();expand(current)}
      }}>
      <div className="stg-preview" aria-live="polite">{hover?<><strong>{hover.title}</strong><span>{hover.label}</span></>:<span>{expanded?'点击圆点或下方名称，切换剧情概览':'拖动 / 滚轮横向浏览 · 点击竖线进入该阶段'}</span>}</div>
      <div className="stg-world" style={{width:layout.width,transform:`translateX(${-offset}px)`}}>
        <div className="stg-axis" aria-hidden="true"/>
        {layout.stages.map(stage=>stage.year===expandedYear?
          <div className="stg-expanded" key={stage.id} style={{left:stage.left,width:stage.width}}>
            <span className="stg-expanded-label">{stage.year} 年 <em>{stage.storyCount} 个故事 / {stage.items.length} 个剧情片段</em></span>
            <div className="stg-detail-rail" aria-hidden="true"/>
            {stage.items.map((item,index)=><button type="button" key={item.id} className={`stg-event-dot ${item.id===selectedId?'is-active':''}`} style={{left:`${((index+.5)/stage.items.length)*100}%`}} onClick={()=>onSelect(item)} onMouseEnter={()=>setHover(item)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(item)} onBlur={()=>setHover(null)} aria-pressed={item.id===selectedId} aria-label={`${index+1} ${item.title} ${item.label}`} title={`${item.title} · ${item.label}`}><i aria-hidden="true"/><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span></button>)}
            <span className="stg-expanded-bound stg-bound-start" aria-hidden="true">阶段开始</span><span className="stg-expanded-bound stg-bound-end" aria-hidden="true">阶段结束</span>
          </div>
          :<button type="button" className={`stg-period ${stage.year===current?.year?'is-active':''}`} key={stage.id} data-stage-year={stage.year} style={{left:stage.center,'--stem-height':`${Math.min(74,24+stage.items.length*4)}px`}} onClick={()=>expand(stage)} aria-label={`${stage.year} 年阶段，${stage.storyCount} 个故事，${stage.items.length} 个剧情片段，点击展开`} aria-expanded={false}>
            <span className="stg-period-count">{stage.items.length}</span><span className="stg-period-stem" aria-hidden="true"/><strong>{stage.year}</strong><span className="stg-period-caption">{stage.storyCount} 个故事</span>
          </button>)}
      </div>
      {!stages.length?<div className="stg-empty">该筛选条件下没有已确定年代的阶段，可查看“年代未定”或清空筛选。</div>:null}
    </div>
    {stages.length>0?<div className="stg-scrubber-wrap"><span>{stages[0].year}</span><input className="stg-scrubber" type="range" aria-label="时间轴浏览位置" min="0" max={Math.max(1,layout.maxOffset)} step="1" value={Math.min(offset,Math.max(1,layout.maxOffset))} disabled={!layout.maxOffset} onChange={event=>moveTo(Number(event.target.value))} onPointerUp={()=>browseAt(offsetRef.current)}/><span>{stages[stages.length-1].year}</span></div>:null}
    {expanded?<div className="stg-names">
      <button type="button" className="stg-list-toggle" onClick={()=>setListOpen(open=>!open)} aria-expanded={listOpen} aria-controls="stage-story-list"><span><strong>{expanded.year} 年 · 全部剧情名称</strong><em>{expanded.items.length} 个片段</em></span><Icon name={listOpen?'chevronUp':'chevronDown'} size={17}/></button>
      {listOpen?<><div id="stage-story-list" className="stg-story-list" role="list">{expanded.items.map((item,index)=><div role="listitem" key={item.id}><button type="button" className={`stg-story-name ${item.id===selectedId?'is-active':''}`} onClick={()=>onSelect(item)} aria-pressed={item.id===selectedId}><span className="stg-story-number">{String(index+1).padStart(2,'0')}</span><span className="stg-story-copy"><strong>{item.title}</strong><span>{item.label}</span><em>{mode==='release'?item.release.date:`${item.yearLabel} · ${item.region}`}</em></span><Icon name="arrowRight" size={15}/></button></div>)}</div><p className="stg-order-note">{mode==='terra'?'年内圆点按当前资料的阅读顺序排列，不代表准确月份；跨年片段会出现在相关阶段。':'圆点按国服实装顺序排列；同日内容分别展示。'}</p></>:null}
    </div>:<p className="stg-overview-note">选择一个阶段，查看这一时期的剧情圆点与完整名称列表。</p>}
  </section>
}
