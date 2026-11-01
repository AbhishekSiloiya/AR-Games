import assert from 'node:assert/strict';
const module=await import('./freeze-movement.ts').catch(()=>null);assert.ok(module,'Freeze needs camera-sample movement rates');
const {freezeMovement}=module;
const {newFreezeStudio,stepFreezeStudio}=await import('./freeze-studio-rules.ts');
const totals=[];
for(const fps of [15,30,60,120]){const meter=freezeMovement(),round=newFreezeStudio(1,1);let score=0,moving=0;for(let f=0;f<fps*6;f++){const now=f*1000/fps,sample=Math.floor(now/(1000/30)+1e-7)*1000/30,rate=meter.sample(sample*8/1000,sample,now,true);stepFreezeStudio(round,1/fps,now/1000,[{present:true,rate,rig:Array.from({length:33},()=>[0,0,1])}]);score=round.seats[0].score;moving=round.seats[0].danceSeconds;}totals.push({score,moving});}
assert.ok(Math.max(...totals.map(t=>t.score))-Math.min(...totals.map(t=>t.score))<.6,JSON.stringify(totals));assert.ok(totals.every(t=>t.score>47&&t.moving>5.85));
const meter=freezeMovement();assert.equal(meter.sample(0,0,0,true),0);assert.equal(meter.sample(.8,100,100,true),8);assert.equal(meter.sample(.8,100,200,true),8);assert.equal(meter.sample(.8,100,301,true),0,'stale samples do not grant motion');assert.equal(meter.sample(.8,400,400,true),0,'stationary sample stops immediately');assert.equal(meter.sample(1.6,500,500,false),0,'absence resets');assert.equal(meter.sample(20,600,600,true),0,'reacquire establishes baseline');assert.equal(meter.sample(20.8,700,700,true)>7.9,true);meter.reset();assert.equal(meter.sample(90,900,900,true),0,'pause discards accumulated motion');assert.equal(meter.sample(91,800,900,true),0,'backward sample cannot score');
console.log('PASS Freeze camera-rate scoring at 15/30/60/120 fps, stale/missing/stationary samples and pause/reacquire baselines');

const gap=newFreezeStudio(1,1);gap.dancing=false;gap.phaseAt=7;gap.phaseEnd=10;gap.seats[0].eligible=true;stepFreezeStudio(gap,10,8.5,[{present:true,rate:0,rig:Array.from({length:33},()=>[0,0,1])}]);assert.equal(gap.seats[0].holds,0,'long render gaps cannot award instant holds');assert.ok(gap.seats[0].held<=.1);
