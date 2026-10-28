import assert from 'node:assert/strict';
import {newJabSeat,stepJabSeat,strikeJab} from './jab-pattern.ts';
const s=newJabSeat(1);stepJabSeat(s,.3,1,true,false);s.age=.25;strikeJab(s,s.action.hand,8);
assert.equal(s.responseCount,1,'real contact records one cue response');
assert.equal(Math.round(s.responseSum*1000),530,'response includes the280ms presentation and250ms active window');
const {jabSequence,jabReport}=await import('./jab-pattern.ts');
assert.equal(new Set([1,2,3,4,5].map(stage=>JSON.stringify(jabSequence(stage,0,20)))).size,5,'stages have distinct action sequences');
assert.ok(jabSequence(4,0,20).some(a=>a.cross));assert.ok(!jabSequence(1,5,40).some(a=>a.cross));
stepJabSeat(s,.4,2,true,false);stepJabSeat(s,.3,2,true,false);stepJabSeat(s,5,3,true,false);
const report=jabReport(s);assert.equal(report.accuracy,50);assert.equal(report.resolved,2);assert.equal(report.responseMs,530);
const empty=jabReport(newJabSeat(1));assert.equal(empty.accuracy,null);assert.equal(empty.responseMs,null);
const {newPractice,stepPractice,hitPractice,practiceAction}=await import('./jab-practice.ts');
const p=newPractice();assert.equal(hitPractice(p,0,10),false,'presentation is not a target yet');stepPractice(p,.4,true,false);assert.equal(hitPractice(p,1,10),false);assert.equal(hitPractice(p,0,10),true);assert.equal(hitPractice(p,0,10),false);stepPractice(p,.8,true,false);assert.equal(p.index,1);
const frozen=JSON.stringify(p);stepPractice(p,5,false,false);assert.equal(JSON.stringify(p),frozen);
stepPractice(p,.4,true,false);hitPractice(p,1,10);stepPractice(p,.8,true,false);assert.equal(practiceAction(p).cross,true);stepPractice(p,.4,true,false);hitPractice(p,1,10);stepPractice(p,.8,true,false);assert.equal(p.index,3);stepPractice(p,1,true,true);stepPractice(p,.8,true,true);assert.equal(p.done,true);
const slow=newPractice();for(let i=0;i<4;i++)stepPractice(slow,3.2,true,false);assert.equal(slow.done,true,'timed demonstrations cover every move even without a hit');
assert.equal(newJabSeat(1).score,0,'practice has no round score');
const {jabTargets}=await import('./jab-pattern.ts');const t=newJabSeat(1);stepJabSeat(t,.3,1,true,false);assert.ok(Math.abs(jabTargets(t,0,1,.82)[0].x)<Math.abs(jabTargets(t,0,1,1)[0].x));

// Crossing the warm-up boundary must not rewrite a combination already being played.
const transition=newJabSeat(2);stepJabSeat(transition,.3,11,true,false);strikeJab(transition,0,8);stepJabSeat(transition,.4,11.9,true,false);stepJabSeat(transition,.3,12.2,true,false);
assert.equal(transition.action.hand,1);assert.deepEqual(transition.action,jabSequence(transition.stage,transition.pattern,transition.patternAt)[transition.index]);
for(let i=1;i<4;i++){strikeJab(transition,transition.action.hand,8);stepJabSeat(transition,1,12.4,true,false);stepJabSeat(transition,.3,12.4,true,false);}
assert.ok(transition.patternAt>=12);assert.deepEqual(transition.action,jabSequence(2,transition.pattern,transition.patternAt)[0]);

const duckOnly=newJabSeat(1);duckOnly.phase='duck';stepJabSeat(duckOnly,1,20,true,false);assert.equal(duckOnly.misses,1);assert.equal(jabReport(duckOnly).resolved,0,'duck failures are excluded from pad accuracy');
assert.equal(strikeJab(duckOnly,0,30),false);assert.equal(duckOnly.responseCount,0,'rejected contact cannot become a response sample');
console.log('PASS Jab stage drills, frozen combinations, score-free practice, comfortable reach and target/response results');
