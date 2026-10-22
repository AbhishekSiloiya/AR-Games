import assert from 'node:assert/strict';
import { shapeVerdict } from './shapeup-rules.ts';
assert.deepEqual(shapeVerdict(100, 4, false), { quality: 0, streak: 0, points: 0 });
assert.deepEqual(shapeVerdict(80, 2, true), { quality: 80, streak: 3, points: 100 });
assert.deepEqual(shapeVerdict(59, 8, true), { quality: 59, streak: 0, points: 59 });
assert.equal(shapeVerdict(100, 30, true).points, 150);
const first = shapeVerdict(90, 1, true), second = shapeVerdict(40, 0, true);
assert.equal(first.points, 100); assert.equal(second.points, 40);
console.log('Shape Up: independent streaks, missing-player guard, score and bonus cap pass.');
const { shapeClock, shapeSeat, stepShape } = await import('./shapeup-rules.ts');
assert.equal(shapeClock(0,4,2).phase,'match');
assert.equal(shapeClock(4,4,2).phase,'result');
assert.equal(shapeClock(5.2,4,2).phase,'rest');
assert.equal(shapeClock(6.7,4,2).index,1);
assert.equal(shapeClock(11.9,4,2).phase,'done','final result ends without another pose');
let seat=shapeSeat();
let update=stepShape(seat,0,'match',90,true,0,4);seat=update.state;
assert.equal(seat.locked,false);
seat=stepShape(seat,0,'match',90,true,.29,3.71).state;assert.equal(seat.locked,false);
update=stepShape(seat,0,'match',92,true,.31,3.69);seat=update.state;assert.equal(update.justLocked,true);
seat=stepShape(seat,0,'match',20,true,3.9,.1).state;assert.equal(seat.locked,true,'earned match remains clear while relaxing');
update=stepShape(seat,0,'result',20,true,4,0);seat=update.state;assert.equal(update.scored,true);assert.equal(seat.score,92);
seat=stepShape(seat,0,'result',90,true,4.5,0).state;assert.equal(seat.score,92,'result only scores once');
seat=stepShape(seat,0,'rest',90,true,5.4,1.3).state;assert.equal(seat.score,92);
let missing=shapeSeat();missing=stepShape(missing,0,'match',95,true,0,4).state;missing=stepShape(missing,0,'match',95,true,.31,3.69).state;
missing=stepShape(missing,0,'match',95,false,3.9,.1).state;assert.equal(missing.locked,false);
missing=stepShape(missing,0,'result',95,false,4,0).state;assert.equal(missing.score,0,'dropout cannot bank a matched pose');
let partial=shapeSeat();partial=stepShape(partial,0,'match',65,true,3.8,.2).state;partial=stepShape(partial,0,'result',65,true,4,0).state;
assert.equal(partial.score,65);assert.equal(partial.verdict,'partial');assert.equal(seat.score,92,'second player cannot change first score');
const next=stepShape(seat,1,'match',50,true,6.7,4).state;assert.equal(next.locked,false);assert.equal(next.score,92);
console.log('Shape Up phases: stable lock, relax pause, dropout, independent scores and one verdict pass.');
let interrupted=shapeSeat();interrupted=stepShape(interrupted,0,'match',90,true,0,4).state;
interrupted=stepShape(interrupted,0,'match',50,true,.2,3.8).state;
interrupted=stepShape(interrupted,0,'match',90,true,.3,3.7).state;
interrupted=stepShape(interrupted,0,'match',90,true,.51,3.49).state;assert.equal(interrupted.locked,false,'quality dip resets continuous hold');
interrupted=stepShape(interrupted,0,'match',90,true,.61,3.39).state;assert.equal(interrupted.locked,true);
let last=stepShape(shapeSeat(),7,'match',75,true,50,.2).state;
last=stepShape(last,7,'result',75,true,51,0).state;const finalScore=last.score;
last=stepShape(last,7,'done',75,true,53,0).state;assert.equal(last.score,finalScore,'final result cannot score twice');
const { shapeTrackedBody } = await import('./shapeup-rules.ts');
const trackedBody=()=>Array.from({length:33},()=>[.5,.5,1]);
assert.equal(shapeTrackedBody(trackedBody()),true);
for(const joint of [11,12,13,14,15,16,23,24,25,26,27,28]){
  const missing=trackedBody();missing[joint]=[];assert.equal(shapeTrackedBody(missing),false,`missing limb joint ${joint} blocks matching`);
  const hidden=trackedBody();hidden[joint][2]=.34;assert.equal(shapeTrackedBody(hidden),false,`low confidence joint ${joint} blocks matching`);
}
for(const [joint,axis,value]of [[15,0,-.01],[16,1,1.01],[27,0,Infinity],[28,1,NaN],[25,2,NaN]]){
  const invalid=trackedBody();invalid[joint][axis]=value;assert.equal(shapeTrackedBody(invalid),false,'off-frame and nonfinite landmarks block matching');
}
const forgiving=trackedBody();for(const q of forgiving)q[2]=.35;assert.equal(shapeTrackedBody(forgiving),true,'confidence boundary stays forgiving');
const advisoryHead=trackedBody();advisoryHead[0]=[];assert.equal(shapeTrackedBody(advisoryHead),true,'head is not part of limb-angle matching');
console.log('Shape Up tracking: required wrists/legs, confidence, finite coordinates and framing pass.');
const { poseStars, shapeRank } = await import('./shapeup-rules.ts');
assert.equal(poseStars(59,true,false),0);assert.equal(poseStars(60,true,false),1);
assert.equal(poseStars(79,true,false),1);assert.equal(poseStars(80,true,true),2);
assert.equal(poseStars(89,true,true),2);assert.equal(poseStars(90,true,true),3);
assert.equal(poseStars(100,false,true),0);assert.equal(poseStars(95,true,false),1,'unstable pose stays a partial reward');
let quest=shapeSeat();
for(let index=0;index<3;index++){
  quest=stepShape(quest,index,'match',95,true,index*7,4).state;
  quest=stepShape(quest,index,'match',95,true,index*7+.31,3.69).state;
  quest=stepShape(quest,index,'result',95,true,index*7+4,0).state;
}
assert.equal(quest.stars,9);assert.equal(quest.combo,3);assert.equal(quest.bestCombo,3);
assert.equal(quest.milestone,20,'third match earns one milestone bonus');
const questPoints=quest.score;quest=stepShape(quest,2,'rest',95,true,19.4,1).state;
assert.equal(quest.score,questPoints);assert.equal(quest.stars,9,'no duplicate stars or bonus');
quest=stepShape(quest,3,'match',65,true,24,.2).state;quest=stepShape(quest,3,'result',65,true,25,0).state;
assert.equal(quest.combo,0);assert.equal(quest.stars,10);assert.equal(quest.path[3],1);
const rival=stepShape(shapeSeat(),0,'result',100,false,4,0).state;assert.equal(rival.stars,0);assert.equal(quest.stars,10,'separate quest progress');
assert.equal(shapeRank(24).medal,'Gold');assert.equal(shapeRank(14).medal,'Silver');assert.equal(shapeRank(8).medal,'Bronze');
console.log('Pose Quest: reward thresholds, stable match, milestones once, combo reset and separate progress pass.');
let master=shapeSeat();let bonuses=0;
for(let index=0;index<8;index++){
  master=stepShape(master,index,'match',95,true,index*7,4).state;
  master=stepShape(master,index,'match',95,true,index*7+.31,3.69).state;
  master=stepShape(master,index,'result',95,true,index*7+4,0).state;bonuses+=master.milestone;
}
assert.equal(master.stars,24);assert.equal(master.combo,8);assert.equal(bonuses,115,'3/5/8 chain milestones each awarded once');
assert.deepEqual(master.path,Array(8).fill(3));assert.equal(shapeRank(master.stars).rank,'Pose master');
assert.equal(stepShape(master,7,'done',95,true,60,0).state.score,master.score,'final quest summary cannot award again');
