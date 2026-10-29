import assert from 'node:assert/strict';
import {newShapeQuest,stepShapeQuest} from './shape-quest.ts';
const good={quality:95,valid:true,aligned:true},bad={quality:20,valid:true,aligned:false},lost={quality:100,valid:false,aligned:true};
const g=newShapeQuest(1,1);for(let f=0;f<31;f++)stepShapeQuest(g,1/60,f/60,[good]);
assert.equal(g.seats[0].judged,true,'stable genuine match banks immediately, before pose timeout');
assert.equal(g.seats[0].score,95);assert.equal(g.seats[0].stars,3);assert.equal(g.phase,'result');
const score=g.seats[0].score;stepShapeQuest(g,.05,.55,[lost]);assert.equal(g.seats[0].score,score,'earned pose stays banked when relaxing');
stepShapeQuest(g,.05,1.8,[good]);assert.equal(g.phase,'rest');assert.equal(g.seats[0].score,score,'result banks only once');
stepShapeQuest(g,.05,3.3,[good]);assert.equal(g.index,1);assert.equal(g.seats[0].locked,false);assert.equal(g.seats[0].score,score);
const h=newShapeQuest(1,1);for(let f=0;f<20;f++)stepShapeQuest(h,1/60,f/60,[good]);stepShapeQuest(h,1/60,.34,[bad]);for(let f=21;f<43;f++)stepShapeQuest(h,1/60,f/60,[good]);assert.equal(h.seats[0].judged,false,'quality dip resets continuous hold');
for(let f=43;f<50;f++)stepShapeQuest(h,1/60,f/60,[good]);assert.equal(h.seats[0].judged,true);
const absent=newShapeQuest(1,1);for(let f=0;f<600;f++)stepShapeQuest(absent,1/60,f/60,[lost]);assert.equal(absent.seats[0].score,0);assert.equal(absent.seats[0].stars,0);
const wrongLimb=newShapeQuest(1,1);for(let f=0;f<40;f++)stepShapeQuest(wrongLimb,1/60,f/60,[{...good,aligned:false}]);assert.equal(wrongLimb.seats[0].locked,false,'average quality cannot hide a wrong limb');
const pair=newShapeQuest(1,2);for(let f=0;f<40;f++)stepShapeQuest(pair,1/60,f/60,[good,bad]);assert.equal(pair.phase,'match','other player gets the full window');assert.equal(pair.seats[0].stars,3);assert.equal(pair.seats[1].stars,0);for(let f=40;f<80;f++)stepShapeQuest(pair,1/60,f/60,[lost,good]);assert.equal(pair.phase,'result');assert.equal(pair.seats[0].score,95);assert.equal(pair.seats[1].score,95);
for(let stage=1;stage<=5;stage++){const master=newShapeQuest(stage,1);for(let f=0;f<7000&&!master.done;f++)stepShapeQuest(master,1/60,f/60,[good]);assert.equal(master.done,true);assert.equal(master.seats[0].stars,24);assert.equal(master.seats[0].path.length,8);assert.equal(master.seats[0].bestCombo,8);assert.equal(master.seats[0].score,1125);}
console.log('PASS Shape Quest immediate stable match, honest holds/limbs, once-only stars, earned bank, paired independence and eight-pose finish');

const {shapeGuidance,shapeDirections,SHAPE_POSES,resetShapeHold}=await import('./shape-quest.ts');
for(const [,pose] of SHAPE_POSES){assert.equal(shapeGuidance(pose,pose).quality,100);assert.equal(shapeGuidance(pose,pose).aligned,true);shapeDirections(pose).forEach((v,i)=>assert.ok(Math.abs(Math.atan2(Math.sin(Math.atan2(v[1],v[0])-pose[i]),Math.cos(Math.atan2(v[1],v[0])-pose[i])))<1e-8));}
const target=SHAPE_POSES[0][1],off=[...target];off[0]+=Math.PI/2;assert.equal(shapeGuidance(off,target).groups[0],false);assert.match(shapeGuidance(off,target).hint,/left/);assert.equal(shapeGuidance(Array(8).fill(NaN),target).quality,0);
const paused=newShapeQuest(1,1);for(let f=0;f<20;f++)stepShapeQuest(paused,1/60,f/60,[good]);resetShapeHold(paused);for(let f=20;f<40;f++)stepShapeQuest(paused,1/60,f/60,[good]);assert.equal(paused.seats[0].locked,false,'pause clears partial hold');
console.log('PASS target direction mapping, limb-specific guidance, invalid angles and pause reset');

const {starsFor,starGoals}=await import('./meta.ts');for(let stage=1;stage<=5;stage++)assert.equal(starsFor('shapeup',stage,1165),3,'perfect eight-pose round can earn three stage stars');assert.deepEqual(starGoals('jab',5),[44,88,143]);

for(const fps of [15,30,60,120]){const paced=newShapeQuest(1,1);for(let f=0;f<Math.ceil(.46*fps);f++)stepShapeQuest(paced,1/fps,f/fps,[good]);assert.equal(paced.seats[0].locked,true,`stable hold locks within half a second at ${fps}fps`);}
