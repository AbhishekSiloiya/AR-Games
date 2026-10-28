import assert from 'node:assert/strict';
const rules=await import('./goalie-rules.ts').catch(()=>null);assert.ok(rules,'Goalie must record continuous glove contact rather than post-step manifolds');
const {sweepContact,newKeeper,stepKeeper,flightPoint,keeperLayout,keeperReport}=rules;
assert.ok(sweepContact({x:0,y:0,z:-8},{x:0,y:0,z:8},{x:0,y:0,z:.25},{x:0,y:0,z:.25},1)!==null,'fast ball cannot tunnel through a held glove');
assert.ok(sweepContact({x:0,y:0,z:0},{x:0,y:0,z:0},{x:-4,y:0,z:0},{x:4,y:0,z:0},1)!==null,'moving glove can cross the ball between frames');
assert.equal(sweepContact({x:0,y:3,z:-8},{x:0,y:3,z:8},{x:0,y:0,z:.25},{x:0,y:0,z:.25},1),null);
const s=newKeeper(1,0,1,1);stepKeeper(s,.4,0,true,[],false);stepKeeper(s,1,1,true,[],false);assert.equal(s.phase,'flight');
const target={x:s.tx,y:s.ty,z:.25},glove={...target,px:target.x,py:target.y,on:true,vx:0,vy:0};
assert.equal(stepKeeper(s,s.duration,3,true,[glove],false),'save');assert.equal(s.saves,1);assert.equal(s.score,1);assert.ok(s.velocity.z<0,'save visibly deflects back toward the pitch');
stepKeeper(s,.2,3.2,true,[glove],false);assert.equal(s.saves,1,'one ball earns one save');
const miss=newKeeper(1,0,1,1);stepKeeper(miss,.4,0,true,[],false);stepKeeper(miss,1,1,true,[],false);stepKeeper(miss,miss.duration*1.12,3,true,[{...glove,on:false}],false);assert.equal(miss.misses,1,'invisible glove cannot save');assert.equal(keeperReport(miss).rate,0);
const frozen=JSON.stringify(miss);stepKeeper(miss,1,4,false,[glove],false);assert.equal(JSON.stringify(miss),frozen);
const lesson=newKeeper(1,0,1,1);stepKeeper(lesson,.4,0,true,[],true);stepKeeper(lesson,1,1,true,[],true);stepKeeper(lesson,lesson.duration,3,true,[{...glove,x:lesson.tx,y:lesson.ty,px:lesson.tx,py:lesson.ty}],true);assert.equal(lesson.practiceSaves,1);assert.equal(lesson.score,0);assert.equal(lesson.saves,0);assert.equal(keeperReport(lesson).rate,null,'practice cannot leak into results');
for(const n of [1,2])for(const reach of [1,.8]){const seat=newKeeper(5,n-1,n,reach),l=keeperLayout(n,n-1);for(let i=0;i<20;i++){seat.index=i;seat.phase='waiting';seat.age=1;stepKeeper(seat,.01,20,true,[],false);assert.ok(Math.abs(seat.tx-l.cx)<=l.gain+.01);const at=flightPoint(seat,1);assert.ok(Math.abs(at.x-seat.tx)<.0001&&Math.abs(at.y-seat.ty)<.0001);}}
const second=newKeeper(1,1,2,1);stepKeeper(second,.4,0,true,[],false);stepKeeper(second,1,1,true,[],false);stepKeeper(second,second.duration*1.12,3,true,[{...glove,x:-3,px:-3}],false);assert.equal(second.saves,0,'partner lane cannot award this seat');
const {starGoals}=await import('./meta.ts');
for(let stage=1;stage<=5;stage++)for(const n of [1,2])for(const reach of [.8,1]){
 const perfect=newKeeper(stage,n-1,n,reach);for(let frame=0;frame<3600;frame++){const h={x:perfect.tx,y:perfect.ty,z:.25,px:perfect.tx,py:perfect.ty,on:true,vx:0,vy:0};stepKeeper(perfect,1/60,frame/60,true,[h],false);}assert.ok(perfect.score>=starGoals('goalie',stage)[2],`stage ${stage}, ${n} players, reach ${reach}: perfect score ${perfect.score} must reach three stars ${starGoals('goalie',stage)[2]}`);
}
assert.deepEqual(starGoals('jab',3),[32,64,104],'Goalie tuning cannot alter Jab progression');

console.log('PASS Goalie continuous contacts, once-only outcomes, practice/lane isolation, reachable targets and attainable stars in all stages/reach/player layouts');
