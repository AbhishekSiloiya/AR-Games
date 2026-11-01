import assert from 'node:assert/strict';
import {jackInput} from './jack-input.ts';
const rig=Array.from({length:33},()=>[0,0,1]);rig[11]=[-.5,0,1];rig[12]=[.5,0,1];rig[15]=[-.5,-.8,1];rig[16]=[.5,-.8,1];
const c=jackInput();let t=0;const sample=(rapid=false,fresh=true)=>c.sample(rig,t+=1/60,fresh,rapid);
sample();rig[15][1]=0;assert.equal(sample().length,1,'first observed raise fires immediately, no aim dwell');for(let i=0;i<60;i++)assert.equal(sample().length,0,'normal held hand cannot repeat');
for(let i=0;i<6;i++){rig[15][1]=-.8;sample();rig[15][1]=0;assert.equal(sample().length,1,'quick separate raises each fire once');}
rig[16][1]=0;assert.equal(sample().length,1,'hands fire independently');let powered=0;for(let i=0;i<60;i++)powered+=sample(true).length;assert.ok(powered>=12&&powered<=18,'earned rapid power repeats held observed hands at a bounded rate');for(let i=0;i<30;i++)assert.equal(sample(false).length,0,'expiration stops held-hand fire immediately');
sample(true,false);for(let i=0;i<20;i++)assert.equal(sample(true).length,0,'reacquired raised hands must lower, even while boosted');rig[15][1]=-.8;sample(true);rig[15][1]=0;assert.equal(sample(true).length,1);c.reset();assert.equal(sample(true).length,0,'pause discards the old raised-hand latch');
rig[15][1]=-.8;sample();rig[15][1]=0;rig[15][2]=0;assert.equal(sample().length,0);rig[15][2]=1;assert.equal(sample().length,0,'hidden hands require a new real raise');
for(const fps of [15,30,60,120]){const g=jackInput(),r=rig.map(j=>[...j]);r[15][1]=-.8;g.sample(r,0,true);r[15][1]=0;assert.equal(g.sample(r,1/fps,true).filter(s=>s.hand===0).length,1,`immediate at${fps}fps`);}
console.log('PASS immediate single shots per raise, rapid repeated gestures, pickup-only held fire, bounded cadence and stale/pause/visibility guards');
