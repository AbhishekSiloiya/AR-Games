import assert from 'node:assert/strict';
import { clubStep, clubScene, stepClub, cheerClub, resolveDanceTrack } from './club-groove.ts';
const scene=clubScene();stepClub(scene,true,.05);assert.ok(scene.time>0);const held=scene.time;stepClub(scene,false,.05);assert.equal(scene.time,held,'musical stop holds all scene motion');
assert.equal(cheerClub(scene,0,1,false,true),false);assert.equal(cheerClub(scene,0,1,true,false),false);assert.equal(cheerClub(scene,0,1,true,true),true);assert.equal(cheerClub(scene,0,1,true,true),false);assert.equal(cheerClub(scene,1,1,true,true),true);
const reward=scene.cheer;stepClub(scene,false,.05);assert.equal(scene.cheer,reward,'freeze also holds host celebration clock');stepClub(scene,true,.05);assert.ok(scene.cheer<reward);
assert.equal(resolveDanceTrack(null),'synth','new players get original club mix');assert.equal(resolveDanceTrack('city'),'city','explicit recording choice survives');assert.equal(resolveDanceTrack('old-invalid'),'synth');
const opening=Array.from({length:16},(_,i)=>clubStep(i,.9));assert.equal(opening.filter(q=>q.kick).length,4);assert.equal(opening.filter(q=>q.clap).length,2);assert.ok(opening.some(q=>q.bass!==null));assert.ok(opening.some(q=>q.chord));assert.ok(opening.some(q=>q.lead!==null));
assert.notDeepEqual(Array.from({length:16},(_,i)=>clubStep(i+16*7,.9)),opening,'four-bar fills and eight-bar melodic arrangement vary');
console.log('Club groove: phase-locked scene, earned independent cheers, default preference and layered arrangement pass.');
