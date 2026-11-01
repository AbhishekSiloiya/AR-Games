import assert from 'node:assert/strict';
import {cameraLaunchArea} from './calibration.ts';
import {sliceSpread,sliceArc} from './slice-launch.ts';
const origins=Array.from({length:6},(_,i)=>sliceSpread([{at:0,delay:0}],i)[0].at);
assert.ok(origins[0]<-.6&&origins[1]>.6&&Math.abs(origins[2])<.1,'opening compact phrases visit left, right, then centre');
const stack=[{at:.2,delay:0,lift:1.12},{at:.2,delay:.1,lift:1},{at:.2,delay:.2,lift:.88}];
assert.ok(sliceSpread(stack,1).every(s=>s.at>.6),'a vertical slash can start on the right');
assert.deepEqual(sliceSpread(stack,1).map(s=>[s.delay,s.lift]),stack.map(s=>[s.delay,s.lift]));
const fan=[-.8,-.4,0,.4,.8].map(at=>({at,delay:0}));assert.deepEqual(sliceSpread(fan,0),fan,'wide fan phrase keeps its swipe pattern');
for(const area of [{centre:0,half:7},{centre:-4,half:3.5},cameraLaunchArea(.392,.608,16/9,.75*.35),cameraLaunchArea(.025,.3,4/3,.75*.35)]){
 for(const gravity of [9,9*.55,9*.45])for(const at of [-.85,-.62,0,.62,.85])for(const random of [0,.5,1]){
  const vy=11*Math.sqrt(gravity/9),arc=sliceArc(at,area,vy,gravity,random),apex=arc.x+arc.vx*vy/gravity;
  assert.ok(Math.abs(arc.x-area.centre)<=area.half,'origin within reach/lane');
  assert.ok(Math.abs(apex-area.centre)<=area.half,'apex within reach/lane at every gravity');
  if(Math.abs(at)>.6)assert.ok(Math.sign(at)*(apex-area.centre)>area.half*.5,'side fruit stays on its side at apex');
 }
}
console.log('PASS Slice left/right/centre openings, wide phrases, bounded side arcs across camera/paired/low-gravity areas');
