import assert from 'node:assert/strict';
import {newJabSeat,stepJabSeat,strikeJab,jabTargets} from './jab-pattern.ts';
const seat=newJabSeat(1);stepJabSeat(seat,.3,1,true,false);
const target=jabTargets(seat,0,1)[0];
assert.ok(Math.abs(target.x)>=3.2,'the new outer mitt must move beyond the previously tested 2.45-unit reach');
const {jabSpace,jabMapHand,jabStage}=await import('./jab-presentation.ts');
for(const n of [1,2]){
 const layout=jabSpace(n),cx=n===1?0:4,k=n===1?1:.78;
 const t=jabTargets(seat,cx,k)[0];
 const guard=jabMapHand(-.4,(t.y-1.05)/2.4,cx,n),full=jabMapHand(-.98,(t.y-1.05)/2.4,cx,n);
 assert.ok(Math.abs(guard.x-t.x)>layout.hitRadius,'short central guard movement cannot reach the outer pad');
 assert.ok(Math.abs(full.x-t.x)<.15,'near-full tracked reach can reach the pad centre without exceeding tracker bounds');
 assert.ok(layout.padScale>(n===1?1:.78),'physical pads are bigger in both layouts');
}
const finale=newJabSeat(1);
for(let i=0;i<4;i++){
 if(i)stepJabSeat(finale,.4,51+i,true,false);
 stepJabSeat(finale,.3,51+i,true,false);assert.equal(strikeJab(finale,finale.action.hand,8),true);
}
assert.equal(finale.finaleWon,true);assert.equal(finale.score,18,'four final-ten punches earn the normal combo and one six-point finish bonus');
for(let i=0;i<4;i++){
 stepJabSeat(finale,i===0?1:.4,55+i,true,false);stepJabSeat(finale,.3,55+i,true,false);assert.equal(strikeJab(finale,finale.action.hand,8),true);
}
assert.equal(finale.score,30,'the finish bonus cannot be awarded a second time');
const missed=newJabSeat(1);stepJabSeat(missed,.3,51,true,false);strikeJab(missed,missed.action.hand,8);stepJabSeat(missed,.4,52,true,false);stepJabSeat(missed,.3,52,true,false);stepJabSeat(missed,4,53,true,false);assert.equal(missed.finaleStreak,0);assert.equal(missed.finaleWon,false);
for(let stage=1;stage<=5;stage++)assert.equal(jabStage(stage).stage,stage);
assert.equal(jabStage(0).stage,1);assert.equal(jabStage(99).stage,5);
assert.equal(new Set([1,2,3,4,5].map(s=>jabStage(s).name)).size,5,'each stage has a distinct event identity');
assert.equal(new Set([1,2,3,4,5].map(s=>jabStage(s).theme)).size,5,'each stage selects its own arrangement');
console.log('PASS Jab reachable outer pads, guard exclusion, larger targets, per-stage worlds/music and once-only finale bonus');
