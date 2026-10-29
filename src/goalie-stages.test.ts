import assert from 'node:assert/strict';
const stages=await import('./goalie-stages.ts').catch(()=>null);
assert.ok(stages,'Goalie needs authored stage patterns, not the same target loop at every stage');
const {keeperStage,keeperShot,keeperProgress}=stages;
const pattern=(stage:number)=>Array.from({length:14},(_,i)=>keeperShot(stage,i,20,false));
for(let stage=1;stage<=5;stage++){
 const lesson=keeperStage(stage);assert.ok(lesson.title&&lesson.instruction&&lesson.world&&lesson.art);
 const shots=pattern(stage);assert.ok(shots.every(s=>Math.abs(s.x)<=3.7&&s.y>=-1.3&&s.y<=1.8));
 if(stage>1)assert.notDeepEqual(shots.map(s=>[s.x,s.y,s.bend]),pattern(stage-1).map(s=>[s.x,s.y,s.bend]),'each stage teaches a distinct movement');
 for(let i=0;i<14;i++)assert.deepEqual(keeperShot(stage,i,0,true),keeperShot(1,i,0,true),'practice remains slow near left/right at every stage');
}
assert.ok(pattern(1).every(s=>Math.abs(s.x)<=1.8&&Math.abs(s.y)<=.6),'stage1 builds confidence with near shots');
assert.ok(pattern(2).some(s=>s.x<=-3.5)&&pattern(2).some(s=>s.x>=3.5),'stage2 asks for both wide corners');
assert.ok(pattern(3).some(s=>s.y>=1.5)&&pattern(3).some(s=>s.y<=-1.1),'stage3 mixes highs and lows');
assert.ok(pattern(4).some(s=>s.bend<0)&&pattern(4).some(s=>s.bend>0),'stage4 has readable curves from either side');
assert.equal(keeperShot(5,6,49.99,false).finale,false);
assert.equal(keeperShot(5,6,50,false).finale,true);
assert.equal(keeperShot(4,6,55,false).finale,false,'showdown belongs to stage5');
const {newKeeper,stepKeeper,flightPoint}=await import('./goalie-rules.ts');
const s=newKeeper(4,0,1,1);s.index=4;stepKeeper(s,.4,20,true,[],false);assert.notEqual(s.bend,0);const mid=flightPoint(s,.5),end=flightPoint(s,1);assert.ok(Math.abs(mid.x-(s.from.x+s.tx)/2)>.15,'curve changes real flight, not just copy');assert.equal(end.x,s.tx);assert.equal(end.y,s.ty,'ring remains the true endpoint');
const frozen={bend:s.bend,tx:s.tx,ty:s.ty,duration:s.duration,drill:s.drill,finale:s.finale};stepKeeper(s,.1,55,true,[],false);assert.deepEqual({bend:s.bend,tx:s.tx,ty:s.ty,duration:s.duration,drill:s.drill,finale:s.finale},frozen,'time/phase changes cannot move a prepared target or curve');
const ramp=[];for(let stage=1;stage<=5;stage++){const q=newKeeper(stage,0,1,1);stepKeeper(q,.4,0,true,[],false);ramp.push(q.duration);}assert.deepEqual(ramp.map(x=>Math.round(x*100)),[127,119,112,105,97]);
const p=keeperProgress(12,[8,16,26],false);assert.equal(p.stars,1);assert.equal(p.remaining,4);assert.equal(p.goal,16);assert.equal(p.unlocked,false);
assert.equal(keeperProgress(16,[8,16,26],false).unlocked,true);
assert.equal(keeperProgress(30,[8,16,26],true).remaining,0);
console.log('PASS five distinct Goalie drills, curves/ring endpoints, frozen shots, practice, modest speed ramp and earned star progress');
