import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync} from 'node:fs'
import {buildTimelineStages,layoutTimelineStages,centerTimelineStage,nearestTimelineStage,clampTimelineOffset} from '../src/lib/timelineModel.js'
import {timelineEvents,stories} from '../src/data/index.js'
import {overviewMedia} from '../src/data/overviewMedia.js'

const event=(id,from,to,extra={})=>({id,storyId:id,title:id,from,to,releaseOrder:1,fragIndex:0,release:{date:'2020-05-01'},...extra})
test('a stage contains all fragments intersecting it, including cross-year stories',()=>{
  const source=[event('a',1096,1098),event('b',1097,1097),event('c',1098,1099)]
  const before=JSON.stringify(source)
  const groups=buildTimelineStages(source)
  assert.deepEqual(groups.map(g=>g.year),[1096,1097,1098,1099])
  assert.deepEqual(groups.find(g=>g.year===1097).items.map(e=>e.id),['a','b'])
  assert.deepEqual(groups.find(g=>g.year===1098).items.map(e=>e.id),['a','c'])
  assert.equal(JSON.stringify(source),before)
})
test('unknown chronology stays off the Terra axis but remains available by release year',()=>{
  const item=event('unknown',1098,1100,{undated:true})
  assert.equal(buildTimelineStages([item],'terra').length,0)
  assert.equal(buildTimelineStages([item],'release')[0].items[0].id,'unknown')
})
test('same-day releases and multiple fragments remain separate, with no duplicate node IDs',()=>{
  const source=[event('story::0',1097,1097,{storyId:'s'}),event('story::1',1097,1097,{storyId:'s',fragIndex:1}),event('story::0',1097,1097,{storyId:'s'})]
  const stage=buildTimelineStages(source,'release')[0]
  assert.equal(stage.items.length,2)
  assert.equal(stage.storyCount,1)
})
test('release order uses the real date, including when no precomputed timestamp is present',()=>{
  const source=[event('z',1097,1097,{release:{date:'2020-01-01'}}),event('a',1097,1097,{release:{date:'2020-12-01'}})]
  assert.deepEqual(buildTimelineStages(source,'release')[0].items.map(e=>e.id),['z','a'])
})
test('local expansion widens exactly one stage and preserves other stage widths',()=>{
  const stages=buildTimelineStages([event('a',1096,1096),event('b',1097,1097),event('c',1098,1098)])
  const global=layoutTimelineStages(stages,{width:700})
  const focused=layoutTimelineStages(stages,{width:700,expandedYear:1097})
  assert.ok(focused.stages[1].width>global.stages[1].width*2)
  assert.equal(focused.stages[0].width,global.stages[0].width)
  assert.equal(focused.stages[2].width,global.stages[2].width)
  assert.ok(centerTimelineStage(focused.stages[1],700,focused)>=0)
  assert.equal(clampTimelineOffset(1e9,focused),focused.maxOffset)
  assert.equal(nearestTimelineStage(focused,centerTimelineStage(focused.stages[1],700,focused),700).year,1097)
})
test('every currently dated fragment is reachable in all of its relevant stages',()=>{
  const stages=buildTimelineStages(timelineEvents)
  for(const item of timelineEvents.filter(item=>!item.undated)){
    for(let year=Math.floor(item.from);year<=Math.floor(item.to);year++){
      assert.ok(stages.find(stage=>stage.year===year).items.some(event=>event.id===item.id),`${item.id} missing in ${year}`)
    }
  }
})
test('every recorded story has a real local cover and a source',()=>{
  for(const story of stories){
    const media=overviewMedia[story.id]
    assert.ok(media,`${story.title} has no cover`)
    assert.ok(existsSync(new URL(`../public${media.image}`,import.meta.url)),`${story.title} cover file is missing`)
    assert.match(media.page,/^https:\/\//)
  }
})
