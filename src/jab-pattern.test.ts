import assert from 'node:assert/strict';
const rules=await import('./jab-pattern.ts').catch(()=>null);
assert.ok(rules,'Jab needs one authoritative pattern state before replacing the old random pads');
const {newJabSeat,stepJabSeat,strikeJab,jabTargets}=rules;
const s=newJabSeat(1);stepJabSeat(s,.3,1,true,false);assert.equal(s.phase,'strike');
const first=s.action.hand;
assert.equal(strikeJab(s,1-first,8),false,'wrong hand cannot score');
assert.equal(strikeJab(s,first,8),true);assert.equal(s.score,2);assert.equal(s.streak,1);
assert.equal(strikeJab(s,first,20),false,'same target cannot score twice');
for(let i=0;i<3;i++){stepJabSeat(s,.4,2+i,true,false);stepJabSeat(s,.3,2+i,true,false);assert.equal(s.phase,'strike');assert.equal(strikeJab(s,s.action.hand,8),true);}
assert.equal(s.completed,1);assert.equal(s.streak,4);assert.equal(s.score,12,'four-hit sequence has exactly one four-point bonus');assert.equal(s.phase,'combo');
const snapshot=JSON.stringify(s);stepJabSeat(s,2,8,false,false);assert.equal(JSON.stringify(s),snapshot,'absence cannot advance or punish the player');
const missed=newJabSeat(1);stepJabSeat(missed,.3,1,true,false);stepJabSeat(missed,5,2,true,false);assert.equal(missed.misses,1);assert.equal(missed.score,0);assert.equal(missed.streak,0);
const duck=newJabSeat(1);duck.nextDuck=0;duck.phase='recover';stepJabSeat(duck,.4,20,true,false);assert.equal(duck.phase,'duckWarn');stepJabSeat(duck,1.5,21,true,false);assert.equal(duck.phase,'duck');stepJabSeat(duck,.2,21.2,true,true);stepJabSeat(duck,.7,22,true,false);assert.equal(duck.score,3);assert.equal(duck.phase,'reset');
assert.equal(strikeJab(duck,0,30),false,'duck/reset cannot receive a punch');
const other=newJabSeat(1);assert.equal(other.score,0);assert.equal(other.completed,0,'seats own their own progress');
for(let stage=1;stage<=5;stage++)for(let index=0;index<12;index++){
 const seat=newJabSeat(stage);seat.pattern=index;seat.roundAt=40;seat.phase='present';stepJabSeat(seat,.1,40,true,false);
 for(const target of jabTargets(seat,0,1))assert.ok(Number.isFinite(target.x)&&Math.abs(target.x)<2.1&&target.y<1.7,'all target reaches remain plausible');
}
console.log('Jab patterns: correct hand, single contact, four-hit reward, recovery, absence, misses, duck priority and independent seats pass.');
