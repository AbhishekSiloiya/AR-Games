import assert from 'node:assert/strict';
import {jackInput} from './jack-input.ts';
const rig=Array.from({length:33},()=>[0,0,1]);rig[11]=[-.5,0,1];rig[12]=[.5,0,1];rig[15]=[-1,-.8,1];rig[16]=[1,-.8,1];
const input=jackInput();let t=0;
const tick=(seconds:number,fresh=true)=>{let shots=0;for(let i=0;i<seconds*60;i++){t+=1/60;shots+=input.sample(rig,t,fresh).length;}return shots;};
tick(.2);rig[15][1]=0;assert.equal(tick(.1),0,'forward reach aims before committing');assert.ok(input.progress(0)>0);assert.equal(tick(.1),1,'steady camera-forward aim fires without an overhead raise');assert.equal(tick(.5),0,'held hand never repeats');
rig[15][1]=-.8;tick(.1);rig[15][1]=.8;tick(.08);assert.equal(tick(.1,false),0,'missing tracking breaks the pending shot');assert.equal(tick(.3),0,'reacquired held hand must lower first');
rig[15][1]=-.8;tick(.1);input.reset();rig[15][1]=.8;assert.equal(tick(.3),0,'manual pause resets loaded and pending state');
rig[15][1]=-.8;tick(.1);rig[15][1]=.8;assert.equal(tick(.25),1);rig[16][1]=0;assert.equal(tick(.25),1,'other hand is independently loaded');
rig[15][1]=-.8;tick(.1);rig[15][1]=.8;t+=.5;assert.equal(input.sample(rig,t,true).length,0);assert.equal(tick(.3),0,'long frame gap resets loaded state');
input.reset();rig[15]=[-.5,-.8,1];tick(.2);let early=0;for(let i=1;i<=30;i++){rig[15][1]=-.8+2.2*i/30;early+=tick(1/60);}assert.equal(early,0,'gradual raise finishes aiming before committing');assert.equal(tick(.25),1,'steady final aim commits once');
rig[15][1]=-.8;tick(.1);rig[15][1]=.5;tick(.08);rig[15][2]=0;tick(.08);rig[15][2]=1;assert.equal(tick(.3),0,'hidden hand breaks partial steady hold');
for(const fps of [15,30,60,120]){const controller=jackInput(),r=rig.map(j=>[...j]);r[15]=[-.5,-.8,1];let now=0,shots=0;for(let i=0;i<fps*.2;i++){now+=1/fps;controller.sample(r,now,true);}for(let i=1;i<=Math.ceil(fps*.5);i++){now+=1/fps;r[15][1]=-.8+2.2*Math.min(1,i/(fps*.5));shots+=controller.sample(r,now,true).length;}assert.equal(shots,0,`no early shot at ${fps} fps`);for(let i=0;i<fps*.3;i++){now+=1/fps;shots+=controller.sample(r,now,true).length;}assert.equal(shots,1,`one steady shot at ${fps} fps`);}
console.log('PASS Jack forward/gradual steady aim at15–120fps, once-only fire, independent hands, confidence, stale/pause and long-gap reset');
