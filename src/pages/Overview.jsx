import {useCallback, useEffect, useMemo, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {timelineEvents, arcs, storyTypes, storyById, firstPlayableSegment, personById} from '../data/index.js'
import {regions} from '../data/stories.js'
import {overviewMedia} from '../data/overviewMedia.js'
import {buildTimelineStages} from '../lib/timelineModel.js'
import {readSession, writeSession} from '../lib/storage.js'
import StageTimeline from '../components/StageTimeline.jsx'
import Scene from '../components/Scene.jsx'
import Portrait from '../components/Portrait.jsx'
import Icon from '../components/Icon.jsx'
import {CertaintyTag, CountPill, Drawer, EmptyState, SearchField, SegmentedControl, Tag} from '../components/ui.jsx'

const STORE_KEY = 'overview:v2'
const EMPTY_FILTERS = {type:'all', region:'all', arc:'all', q:''}
const TYPE_OPTIONS = [{value:'all', label:'全部'}, ...Object.entries(storyTypes).map(([value, item])=>({value,label:item.label}))]
const prtsSearch = title => `https://prts.wiki/index.php?search=${encodeURIComponent(title)}`

function StoryCover({story, event}) {
  const media=story ? overviewMedia[story.id] : null
  const [failed,setFailed]=useState(false)
  useEffect(()=>setFailed(false),[media?.image])
  return <div className="ov-hero-art">
    {media&&!failed ? <>
      <img className="ov-cover-atmosphere" src={media.image} alt="" aria-hidden="true" decoding="async"/>
      <img className="ov-hero-img" src={media.image} alt={`${story.title}剧情封面`} decoding="async" onError={()=>setFailed(true)}/>
      <a className="ov-hero-credit" href={media.page} target="_blank" rel="noreferrer noopener">封面来源 · {media.credit}<Icon name="external" size={11}/></a>
    </> : <>
      {event?<Scene variant={event.cover} seed={event.fragIndex+2}/>:null}
      <div className="ov-cover-fallback"><span className="eyebrow">STORY ARCHIVE</span><strong>{story?.title??'剧情档案'}</strong><span>{failed?'封面暂时无法加载':'封面待补充'}</span></div>
    </>}
    <span className="ov-cover-label" aria-hidden="true">STORY COVER / 剧情封面</span>
  </div>
}

function MiniGraph() {
  const nodes = [
    [58, 52, 9], [96, 30, 7], [132, 62, 8], [86, 88, 6], [30, 82, 5], [168, 34, 5],
  ]
  const edges = [[0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [2, 5]]
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="entry-art-svg" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#42DDE5" strokeOpacity="0.35" strokeWidth="0.8" />
      ))}
      {nodes.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#0f1a20" stroke="#42DDE5" strokeOpacity={i === 0 ? 0.8 : 0.4} strokeWidth="0.9" />
          <circle cx={x} cy={y} r={r * 0.35} fill="#42DDE5" opacity={i === 0 ? 0.8 : 0.4} />
        </g>
      ))}
    </svg>
  )
}

function MiniMap() {
  const dots = [[60, 40], [96, 58], [140, 44], [118, 78], [76, 82], [158, 72]]
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="entry-art-svg" aria-hidden="true">
      <path d="M18 64 Q34 34 62 30 Q84 18 104 32 Q128 28 146 42 Q172 48 178 68 Q168 92 140 96 Q112 106 88 94 Q56 96 40 82 Q20 78 18 64 Z" fill="#111a1f" stroke="#2c3a43" strokeWidth="0.8" />
      <path d="M40 52 Q72 44 100 52 Q128 50 156 58" fill="none" stroke="#42DDE5" strokeOpacity="0.28" strokeWidth="0.8" strokeDasharray="3 3" />
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2.4" fill="#42DDE5" opacity={i === 0 ? 0.95 : 0.55} />
          <circle cx={x} cy={y} r="5.5" fill="none" stroke="#42DDE5" strokeOpacity="0.2" />
        </g>
      ))}
    </svg>
  )
}

export default function Overview() {
  const navigate=useNavigate()
  const [params]=useSearchParams()
  const [saved]=useState(()=>readSession(STORE_KEY,null))
  const [mode,setMode]=useState(saved?.mode==='release'?'release':'terra')
  const [selectedId,setSelectedId]=useState(()=>{
    const linked=timelineEvents.find(event=>event.storyId===params.get('story'))
    return linked?.id??saved?.selectedId??'main-00::0'
  })
  const [filters,setFilters]=useState(saved?.filters??EMPTY_FILTERS)
  const [expandedYear,setExpandedYear]=useState(()=>{
    const year=Number(params.get('year'))
    return year>0?year:saved?.expandedYear??null
  })
  const [browsedYear,setBrowsedYear]=useState(null)
  const [undatedOpen,setUndatedOpen]=useState(false)
  const filtered=useMemo(()=>timelineEvents.filter(event=>{
    if(filters.type!=='all'&&event.type!==filters.type)return false
    if(filters.region!=='all'&&event.region!==filters.region)return false
    if(filters.arc!=='all'&&event.arc!==filters.arc)return false
    const query=filters.q.trim().toLowerCase()
    return !query || `${event.title} ${event.episode} ${event.label} ${event.location} ${event.en}`.toLowerCase().includes(query)
  }),[filters])
  const stages=useMemo(()=>buildTimelineStages(filtered,mode),[filtered,mode])
  const selected=filtered.find(event=>event.id===selectedId)??filtered[0]??null
  const story=selected?storyById[selected.storyId]:null
  const playable=story?firstPlayableSegment(story):null
  const undatedList=filtered.filter(event=>event.undated)
  const selectedPhase=stages.find(stage=>stage.year===expandedYear)
  const contextYear=mode==='terra'&&selectedPhase?selectedPhase.year:selected?.from
  const contextQuery=selected?`year=${contextYear}&story=${selected.storyId}${selected.locationId?`&loc=${selected.locationId}`:''}`:''
  const hasFilters=Object.entries(filters).some(([key,value])=>value!==EMPTY_FILTERS[key])
  const clearFilters=()=>setFilters({...EMPTY_FILTERS})

  useEffect(()=>{
    if(expandedYear!=null&&!stages.some(stage=>stage.year===expandedYear))setExpandedYear(null)
  },[stages,expandedYear])
  useEffect(()=>{
    writeSession(STORE_KEY,{mode,selectedId:selected?.id,filters,expandedYear})
  },[mode,selected?.id,filters,expandedYear])

  const selectEvent=useCallback(event=>setSelectedId(event.id),[])
  const browseStage=useCallback(stage=>{setBrowsedYear(stage.year);setSelectedId(stage.items[0].id)},[])
  const expandStage=useCallback(year=>{
    setExpandedYear(year)
    if(year!=null)setBrowsedYear(year)
    const stage=stages.find(item=>item.year===year)
    if(stage&&!stage.items.some(item=>item.id===selected?.id))setSelectedId(stage.items[0].id)
  },[stages,selected?.id])
  const changeMode=next=>{
    if(next===mode)return
    setMode(next)
    setBrowsedYear(null)
    setExpandedYear(null)
  }
  const onRead=()=>{
    if(story&&playable)navigate(`/stories/${story.id}/play/${playable.id}`,{state:{from:'/overview'}})
  }

  return <div className="page overview-page overview-v2">
    <header className="ov-page-heading">
      <div><span className="eyebrow">STORIES ACROSS TERRA</span><h1>剧情时间轴</h1></div>
      <SegmentedControl options={[{value:'terra',label:'泰拉时间'},{value:'release',label:'实装顺序'}]} value={mode} onChange={changeMode} ariaLabel="时间轴排序方式"/>
    </header>
    <section className="ov-hero" aria-label="当前剧情概览">
      <StoryCover story={story} event={selected}/>
      <div className="ov-hero-info">
        {selected?<>
          <div className="ov-year-block"><span className="ov-year-label">{mode==='terra'?'剧情时间':'国服实装'}</span><strong className={`ov-year ${mode==='terra'&&selected.undated?'is-undated':''}`}>{mode==='terra'?(selected.undated?'年代未定':selected.yearLabel):selected.release.date.replaceAll('-','.')}</strong><span className="ov-year-meta">{selected.location}<CertaintyTag certainty={selected.certainty} evidence={selected.evidence}/></span></div>
          <h2 className="ov-event-title">{selected.title}</h2>
          <p className="ov-event-sub">{selected.label?.startsWith(selected.episode ?? '\u0000')?selected.label:`${selected.episode?`${selected.episode} · `:''}${selected.label}`}</p>
          <p className="ov-event-summary">{selected.summary}</p>
          <div className="ov-event-tags"><Tag tone="accent">{storyTypes[selected.type]?.label}</Tag><Tag>{selected.arc}</Tag>{selected.memory?<Tag tone="warm">回忆片段</Tag>:null}{selected.nonCanon?<Tag tone="warn">非正史</Tag>:null}{selected.disputed?<Tag tone="warn">年代有争议</Tag>:null}</div>
          <div className="ov-event-actions"><button type="button" className="btn btn-primary" onClick={onRead}>阅读剧情<Icon name="arrowRight" size={16}/></button><Link className="btn btn-ghost" to={`/map?${contextQuery}`}>在地图查看</Link>{!story.chapters.some(chapter=>chapter.nodes?.length)?<span className="ov-script-hint">逐句脚本待导入</span>:null}</div>
          <a className="ov-wiki-link" href={prtsSearch(selected.title)} target="_blank" rel="noreferrer noopener">完整剧情 / 背景 / 音乐：PRTS ↗</a>
        </>:<EmptyState title="没有匹配的剧情">调整类型、地区或搜索条件后重试。<button className="btn btn-ghost btn-sm" onClick={clearFilters}>清空筛选</button></EmptyState>}
      </div>
    </section>
    <div className="ov-filterbar">
      <div className="ov-typechips" role="group" aria-label="剧情类型">{TYPE_OPTIONS.map(option=><button key={option.value} type="button" className={`chip ${filters.type===option.value?'is-active':''}`} onClick={()=>setFilters(current=>({...current,type:option.value}))}>{option.label}</button>)}</div>
      <label className="select-wrap"><span>地区</span><select value={filters.region} onChange={event=>setFilters(current=>({...current,region:event.target.value}))}><option value="all">全部</option>{regions.map(region=><option key={region} value={region}>{region}</option>)}</select></label>
      <label className="select-wrap"><span>系列</span><select value={filters.arc} onChange={event=>setFilters(current=>({...current,arc:event.target.value}))}><option value="all">全部</option>{arcs.map(arc=><option key={arc} value={arc}>{arc}</option>)}</select></label>
      <SearchField value={filters.q} onChange={q=>setFilters(current=>({...current,q}))} placeholder="搜索剧情名、关卡号、地点" className="ov-search"/>
      <span className="ov-result-count"><CountPill>{filtered.length}</CountPill> 片段 / {new Set(filtered.map(event=>event.storyId)).size} 故事</span>
      {hasFilters?<button className="chip chip-ghost" type="button" onClick={clearFilters}>清空筛选</button>:null}
      {mode==='terra'?<button type="button" className="chip chip-undated" onClick={()=>setUndatedOpen(true)}><Icon name="clock" size={14}/>年代未定<CountPill>{undatedList.length}</CountPill></button>:null}
    </div>
    <StageTimeline stages={stages} mode={mode} expandedYear={selectedPhase?.year??null} activeYear={browsedYear} selectedId={selected?.id} onExpand={expandStage} onSelect={selectEvent} onBrowse={browseStage}/>
      <section className="ov-entries" aria-label="其他档案入口">
        <Link className="entry-card" to={`/relations?${contextQuery}`}>
          <div className="entry-card-top">
            <span className="entry-no">01</span>
            <Icon name="arrowRight" size={16} />
          </div>
          <h3>关系图谱</h3>
          <span className="entry-en">RELATIONS</span>
          <div className="entry-art entry-art-graph">
            <MiniGraph />
          </div>
          {selected ? <span className="entry-context">携带 {selected.undated?'年代未定':`${contextYear} 年`} · {selected.title}</span> : null}
        </Link>

        <Link className="entry-card" to={`/map?${contextQuery}`}>
          <div className="entry-card-top">
            <span className="entry-no">02</span>
            <Icon name="arrowRight" size={16} />
          </div>
          <h3>时空地图</h3>
          <span className="entry-en">TERRA MAP</span>
          <div className="entry-art entry-art-map">
            <MiniMap />
          </div>
          {selected ? <span className="entry-context">定位 {selected.location}</span> : null}
        </Link>

        <Link className="entry-card" to={`/operators?${contextQuery}`}>
          <div className="entry-card-top">
            <span className="entry-no">03</span>
            <Icon name="arrowRight" size={16} />
          </div>
          <h3>干员档案</h3>
          <span className="entry-en">OPERATORS</span>
          <div className="entry-art entry-art-people">
            {['amiya', 'kaltsit', 'chen', 'silverash'].map((id) => (
              <Portrait key={id} person={personById[id]} />
            ))}
          </div>
          {selected ? <span className="entry-context">本活动相关人物</span> : null}
        </Link>
      </section>

    <Drawer open={undatedOpen} onClose={()=>setUndatedOpen(false)} title="年代未定" eyebrow="UNDATED FRAGMENTS" width={480}>
      <p className="drawer-note">这些片段仍可正常阅读。由于剧情年代暂无足够依据，不放入精确年份轴；在“实装顺序”中仍会显示。</p>
      <ul className="undated-list">{undatedList.map(event=><li key={event.id}><button type="button" className="undated-item" onClick={()=>{selectEvent(event);setExpandedYear(null);setUndatedOpen(false)}}><strong>{event.title}</strong><span>{event.label}</span><em>{event.evidence}</em></button></li>)}</ul>
      {!undatedList.length?<p className="muted">当前筛选条件下没有年代未定的片段。</p>:null}
    </Drawer>
  </div>
}
