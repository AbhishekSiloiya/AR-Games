import assert from 'node:assert/strict';
import {pulseContact,jackFormation} from './jack-combat.ts';
const near={x:0,y:2,r:.5},far={x:0,y:4,r:.5},off={x:3,y:2,r:.5};
assert.equal(pulseContact([far,off,near],0,0,0,5),near,'fast pulse hits nearest actual crossed target');assert.equal(pulseContact([off],0,0,0,5),undefined,'off-axis pulse is an honest miss');assert.equal(pulseContact([near],0,0,0,1),undefined,'no impact before arrival');assert.equal(pulseContact([near],0,2,0,2),near,'stationary overlap stays finite');
const first=jackFormation(0,1,false,0,7.4);assert.equal(first.length,6);assert.equal(new Set(first.map(v=>v.kind)).size,3);assert.ok(first.every((v,i)=>i===0||v.x-first[i-1].x>1.7),'clear opening gaps');assert.ok(first.some(v=>v.entryX<-7)&&first.some(v=>v.entryX>7),'mixed arrival sides');assert.equal(jackFormation(2,1,false,0,7.4).filter(v=>v.boss).length,1);for(const p of [0,1]){const x=(p-.5)*8;assert.ok(jackFormation(0,2,false,x,3.4).every(v=>Math.abs(v.x-x)<3.4),'rival destinations stay in own sector');}
console.log('PASS Jack swept contacts, travel-before-hit, misses, sparse mixed formations and sector bounds');
