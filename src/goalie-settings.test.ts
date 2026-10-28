import assert from 'node:assert/strict';
import type {Session} from './stats.ts';
const m=await import('./goalie-settings.ts');
assert.ok('normalizeGoalie' in m,'difficulty settings need bounded normalization and legacy migration');
const {normalizeGoalie,keeperPreset,keeperVariant,keeperFromVariant,keeperDifficulty,keeperStageStars}=m;
assert.deepEqual(normalizeGoalie({reach:'full',practice:false}),{reach:'full',practice:false,speed:100,circles:true});
assert.equal(normalizeGoalie({speed:NaN}).speed,100);assert.equal(normalizeGoalie({speed:999}).speed,125);assert.equal(normalizeGoalie({speed:1}).speed,75);assert.equal(normalizeGoalie({speed:103}).speed,105);
const normal=normalizeGoalie({});assert.equal(keeperVariant(normal),'','legacy Sport history stays the default');
for(const preset of ['Chill','Sport','Pro'] as const){const s=keeperPreset(normal,preset);assert.equal(keeperDifficulty(s),preset);assert.equal(keeperFromVariant(keeperVariant(s)).speed,s.speed);assert.equal(keeperFromVariant(keeperVariant(s)).circles,s.circles);}
assert.equal(keeperPreset(normal,'Pro').circles,false);assert.equal(keeperDifficulty({...normal,circles:false}),'Custom');
assert.notEqual(keeperVariant({...normal,speed:85}),keeperVariant(normal));assert.notEqual(keeperVariant({...normal,reach:'full'}),keeperVariant(normal));assert.equal(keeperVariant({...normal,practice:false}),keeperVariant(normal));
const rows:Session[]=[{t:1,game:'goalie',who:'J',stage:1,score:20,points:0,stars:2,variant:keeperVariant(keeperPreset(normal,'Chill'))}];
const {bestScore,unlockedStage,totalStars,starGoals}=await import('./meta.ts');
assert.equal(bestScore(rows,'J','goalie',1,''),0,'assisted scores never become Sport bests');assert.equal(unlockedStage(rows,'J','goalie',''),2,'stage access carries across Goalie setups');assert.equal(keeperStageStars(rows,'J',1),2);assert.equal(totalStars(rows,'J'),2);
assert.equal(unlockedStage(rows,'Other','goalie',''),1);assert.deepEqual(starGoals('goalie',1,''),[8,16,26]);
const {newKeeper,stepKeeper}=await import('./goalie-rules.ts');
for(let speed=75;speed<=125;speed+=5)for(let stage=1;stage<=5;stage++)for(const n of [1,2])for(const reach of [.8,1]){
 const variant=keeperVariant({...normal,speed,reach:reach===1?'full':'comfort'}),s=newKeeper(stage,n-1,n,reach,speed/100);
 for(let f=0;f<3600;f++){const h={x:s.tx,y:s.ty,z:.25,px:s.tx,py:s.ty,on:true,vx:0,vy:0};stepKeeper(s,1/60,f/60,true,[h],false);}
 assert.ok(s.score>=starGoals('goalie',stage,variant)[2],`${speed}% stage${stage}/${n}/${reach}: ${s.score} must reach ${starGoals('goalie',stage,variant)[2]}`);
}
const slow=newKeeper(1,0,1,.8,.85),fast=newKeeper(1,0,1,.8,1.15);stepKeeper(slow,.4,0,true,[],false);stepKeeper(fast,.4,0,true,[],false);assert.ok(slow.duration>fast.duration);
const practice=newKeeper(5,0,1,.8,1.25);stepKeeper(practice,.4,40,true,[],true);assert.equal(practice.duration,2.2);
console.log('PASS Goalie presets, migration/bounds, exact-setup history, shared stage access, practice and attainable stars for all220 speed/stage/layout/reach combinations');
