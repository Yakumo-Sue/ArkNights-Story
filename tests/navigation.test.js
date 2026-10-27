import test from 'node:test'
import assert from 'node:assert/strict'
import {canScrollRange,createWheelGesture,normalizeWheel} from '../src/lib/wheelPagingCore.js'

test('small trackpad deltas accumulate into one page turn',()=>{
  const gesture=createWheelGesture()
  const turns=Array.from({length:24},(_,i)=>gesture.push(7,i*12)).filter(Boolean)
  assert.deepEqual(turns,[1])
})
test('a long inertial tail never cascades into a second page',()=>{
  const gesture=createWheelGesture()
  assert.equal(gesture.push(120,0),1)
  for(let time=40;time<1800;time+=40)assert.equal(gesture.push(18,time),0)
  assert.equal(gesture.push(120,2200),1)
})
test('content-scrolling gesture must end before an edge can turn the page',()=>{
  const gesture=createWheelGesture()
  assert.equal(gesture.push(120,0,false),0)
  assert.equal(gesture.push(120,80,true),0)
  assert.equal(gesture.push(120,400,true),1)
})
test('rapid separate gestures respect the navigation cooldown',()=>{
  const gesture=createWheelGesture()
  assert.equal(gesture.push(120,0),1)
  assert.equal(gesture.push(120,400),0)
  assert.equal(gesture.push(120,1050),1)
})
test('reversing direction discards the old accumulated distance',()=>{
  const gesture=createWheelGesture()
  assert.equal(gesture.push(60,0),0)
  assert.equal(gesture.push(-50,40),0)
  assert.equal(gesture.push(-40,80),-1)
})
test('wheel normalization respects pinch, horizontal gestures and delta units',()=>{
  assert.equal(normalizeWheel({deltaY:20,ctrlKey:true}),0)
  assert.equal(normalizeWheel({deltaY:20,metaKey:true}),0)
  assert.equal(normalizeWheel({deltaY:20,deltaX:80}),0)
  assert.equal(normalizeWheel({deltaY:3,deltaMode:1}),48)
  assert.equal(normalizeWheel({deltaY:-1,deltaMode:2},800),-160)
})
test('long articles scroll normally; paging is possible only at their edge',()=>{
  const page={scrollTop:0,scrollHeight:2400,clientHeight:900}
  assert.equal(canScrollRange(page,1),true)
  assert.equal(canScrollRange(page,-1),false)
  page.scrollTop=1500
  assert.equal(canScrollRange(page,1),false)
  assert.equal(canScrollRange(page,-1),true)
  assert.equal(canScrollRange({scrollTop:0,scrollHeight:901,clientHeight:900},1),false)
})
