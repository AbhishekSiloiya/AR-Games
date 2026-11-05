import assert from 'node:assert/strict';
const api=await import('./tracking-runtime.ts').catch(()=>null);
assert.ok(api,'tracking needs a bounded capture/reply lifecycle');
const {trackingWork,trackingEpoch,inlinePacer,freshTrackingResult}=api;
let release:(v:{close:()=>void})=>void=()=>{},closed=0,sent=0,failures=0,now=100;
const work=trackingWork(()=>now,()=>failures++);
const pending=work.capture(()=>new Promise<{close:()=>void}>(r=>release=r),()=>sent++);
assert.equal(await work.capture(async()=>({close(){closed++;}}),()=>sent++),false,'a pending capture prevents another bitmap allocation');
release({close(){closed++;}});await pending;assert.equal(sent,1);assert.equal(work.state.inferenceInFlight,1);
assert.equal(await work.capture(async()=>({close(){closed++;}}),()=>sent++),false,'busy inference prevents obsolete waiting copies');
work.reply();assert.equal(work.state.inferenceInFlight,0);
const late=work.capture(()=>new Promise<{close:()=>void}>(r=>release=r),()=>sent++);work.close();release({close(){closed++;}});await late;assert.equal(closed,1,'late bitmap disposed after shutdown');assert.equal(sent,1);
const deadline=trackingWork(()=>now,()=>failures++);deadline.reply();await deadline.capture(async()=>({close(){}}),()=>{});now=2701;deadline.poll();deadline.poll();assert.equal(failures,1,'a lost reply requests one recovery only');
const failed=trackingWork(()=>now,()=>failures++);await failed.capture(async()=>({close(){closed++;}}),()=>{throw Error('post failed');});assert.equal(closed,2,'failed transfer releases its bitmap');assert.equal(failures,2);
const generation=trackingEpoch(),old=generation.next();generation.next();assert.equal(generation.is(old),false,'late worker/half initialization must not replace current mode');
const pacer=inlinePacer();assert.equal(pacer.due(0),true);pacer.finish(0,100);assert.equal(pacer.due(150),false,'slow inline inference leaves UI time');assert.equal(pacer.due(200),true);
assert.equal(freshTrackingResult(100,281),false,'receipt never makes an old frame fresh');assert.equal(freshTrackingResult(100,180),true);assert.equal(freshTrackingResult(NaN,180),false);
console.log('PASS tracking bounded capture/reply, late disposal, finite recovery signal, epochs, inline duty budget and capture age');

const pose=await import('./pose.ts');
pose.players[0].present=true;Object.assign(pose.players[0].hands[0],{seen:true,vx:4,vy:3,ax:8,ay:5,t:100});pose.trackingSeen[0]=100;
assert.ok(typeof pose.resetTracking==='function','recovery needs a shared reacquisition reset');pose.resetTracking();
assert.equal(pose.players[0].present,false);assert.equal(pose.trackingSeen[0],0);assert.equal(pose.players[0].hands[0].ax,0);assert.equal(pose.players[0].hands[0].t,0);
console.log('PASS recovery clears source freshness and hand motion history before reacquisition');

let warmNow=0,warmFailures=0;const warm=trackingWork(()=>warmNow,()=>warmFailures++);await warm.capture(async()=>({close(){}}),()=>{});warmNow=7000;warm.poll();assert.equal(warmFailures,0,'first inference needs bounded shader/model warm-up grace');warmNow=15001;warm.poll();assert.equal(warmFailures,1,'startup grace must still have a finite deadline');

const cold=inlinePacer();cold.finish(0,5000);assert.equal(cold.due(5200),true,'cold shader compilation must not impose another five seconds of idle delay');
