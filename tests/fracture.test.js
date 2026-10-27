import test from 'node:test'
import assert from 'node:assert/strict'
import {buildFracture,polygonArea,projectShard} from '../src/lib/fracture.js'

for(const count of [27,45]){
  test(`${count} glass fragments exactly cover the original triangular pane`,()=>{
    const fracture=buildFracture({width:340,height:340,count})
    assert.equal(fracture.cells.length,count)
    const covered=fracture.cells.reduce((sum,cell)=>sum+cell.area,0)
    assert.ok(Math.abs(covered-polygonArea(fracture.triangle))<.00001)
    assert.ok(fracture.cells.every(cell=>cell.area>0))
  })
}
test('zero-time projected shards match the intact pane without a position jump',()=>{
  const f=buildFracture({width:320,height:320})
  const origin={x:400,y:130}
  for(const cell of f.cells){
    const points=projectShard(cell,0,320,origin)
    points.forEach((point,i)=>{
      assert.ok(Math.abs(point.x-origin.x-cell.points[i].x)<1e-8)
      assert.ok(Math.abs(point.y-origin.y-cell.points[i].y)<1e-8)
    })
  }
})
test('perspective stays finite for the whole burst and is reproducible by seed',()=>{
  const options={width:260,height:260,seed:42}
  const f=buildFracture(options)
  assert.deepEqual(f,buildFracture(options))
  for(let time=0;time<=1.6;time+=.016){
    for(const cell of f.cells){
      assert.ok(projectShard(cell,time,260,{x:0,y:0}).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))
    }
  }
})
