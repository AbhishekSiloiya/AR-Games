import assert from 'node:assert/strict';
import { shapeStage, newShapeQuest, stepShapeQuest, shapeGuidance } from './shape-quest.ts';
const stages=Array.from({length:5},(_,i)=>shapeStage(i+1));
assert.equal(new Set(stages.map(s=>s.name)).size,5,'each stage has a clear identity');
for(const stage of stages){
 stage.poses.slice(1).forEach((pose,i)=>assert.equal(shapeGuidance(stage.poses[i][1],pose[1]).aligned,false,'holding the previous shape cannot match the next target'));
 assert.equal(stage.poses.length,8);assert.equal(new Set(stage.poses.map(p=>p[0])).size,8);
 for(const [,angles]of stage.poses){assert.equal(angles.length,8);assert.ok(angles.every(Number.isFinite));assert.equal(shapeGuidance(angles,angles).aligned,true);assert.ok(angles.slice(4).every(a=>a<-.7&&a> -2.4),'legs stay in safe standing/shallow lunge range');}
}
for(let stage=1;stage<5;stage++){
 assert.notDeepEqual(stages[stage].poses,stages[stage-1].poses,'later stage authors new content, not just faster repeats');
 assert.equal(stages[stage].poses.filter(([,pose])=>stages[stage-1].poses.some(([,previous])=>JSON.stringify(previous)===JSON.stringify(pose))).length,0,'adjacent stages share no exact target');
}
assert.ok(stages[1].poses.some(([,a])=>Math.abs(a[0]-a[1])>.8),'stage two introduces bent arms');
assert.ok(stages[3].poses.some(([,a])=>Math.abs(a[4]-a[5])>.3),'later stages add shallow bent-leg stances');
assert.deepEqual(shapeStage(99),stages[4]);assert.deepEqual(shapeStage(-2),stages[0]);
const good={quality:95,valid:true,aligned:true};
for(let stage=1;stage<=5;stage++){
 const quest=newShapeQuest(stage,1);for(let f=0;f<30;f++)stepShapeQuest(quest,1/60,f/60,[good]);
 assert.equal(quest.phase,'result');const earnedAt=quest.phaseAt,points=quest.seats[0].score;
 for(let f=1;f<=80&&quest.index===0;f++)stepShapeQuest(quest,1/60,earnedAt+f/60,[good]);
 assert.equal(quest.index,1,'next target arrives within 1.34 seconds of earning');
 assert.equal(quest.seats[0].score,points,'transition never adds score');
 assert.equal(quest.poses[1][0],stages[stage-1].poses[1][0]);
}
console.log('Shape stages: five distinct eight-pose schedules, safe complexity, fast cadence and current target pass.');
