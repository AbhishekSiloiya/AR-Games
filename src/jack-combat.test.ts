import assert from 'node:assert/strict';
import {pulseContact,jackFormation} from './jack-combat.ts';
const near={x:0,y:2,r:.5},far={x:0,y:4,r:.5},off={x:3,y:2,r:.5};
assert.equal(pulseContact([far,off,near],0,0,0,5),near,'fast pulse hits nearest actual crossed target');assert.equal(pulseContact([off],0,0,0,5),undefined,'off-axis pulse is an honest miss');assert.equal(pulseContact([near],0,0,0,1),undefined,'no impact before arrival');assert.equal(pulseContact([near],0,2,0,2),near,'stationary overlap stays finite');
const first=jackFormation(0,1,false,0,7.4);assert.equal(first.length,6);assert.equal(new Set(first.map(v=>v.kind)).size,3);assert.ok(first.every((v,i)=>i===0||v.x-first[i-1].x>1.7),'clear opening gaps');assert.ok(first.some(v=>v.entryX<-7)&&first.some(v=>v.entryX>7),'mixed arrival sides');assert.equal(jackFormation(2,1,false,0,7.4).filter(v=>v.boss).length,1);for(const p of [0,1]){const x=(p-.5)*8;assert.ok(jackFormation(0,2,false,x,3.4).every(v=>Math.abs(v.x-x)<3.4),'rival destinations stay in own sector');}
console.log('PASS Jack swept contacts, travel-before-hit, misses, sparse mixed formations and sector bounds');
const diving=await import('./jack-combat.ts');
assert.equal(typeof diving.jackDivePoint,'function','an invading ship must travel down to its pilot instead of despawning at y1.25');
assert.equal(typeof diving.pilotContact,'function');
const from={x:3,y:1.25},pilot={x:0,y:-2.2};
const halfway=diving.jackDivePoint(from,pilot,.5),arrived=diving.jackDivePoint(from,pilot,1);
assert.ok(halfway.y<from.y&&halfway.y>pilot.y,'dive has readable intermediate travel');
assert.deepEqual(arrived,pilot,'dive ends on the actual pilot target');
assert.equal(diving.pilotContact(from,halfway,pilot),false,'early descent cannot damage a distant pilot');
assert.equal(diving.pilotContact(halfway,arrived,pilot),true,'real swept contact damages the pilot');
assert.equal(diving.pilotContact({x:5,y:0},{x:5,y:-4},pilot),false,'other sector cannot damage this pilot');
assert.equal(diving.JACK_PULSE_SPEED,17,'normal pulses reach aim targets more promptly');
