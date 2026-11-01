import assert from 'node:assert/strict';
import {solveArm,type V3} from './jab-kinematics.ts';
const dist=(a:V3,b:V3)=>Math.hypot(...a.map((v,i)=>v-b[i]));
for(const side of [-1,1]){
 const shoulder:V3=[side*.77,2.55,0];
 for(const target of [[side*1.2,3,.4],[side*1.5,2.5,.6],[side*.5,2.1,.4],[side*20,30,10],shoulder] as V3[]){
  const {elbow,hand}=solveArm(shoulder,target,.74,.76,side);
  assert.ok([...elbow,...hand].every(Number.isFinite));
  assert.ok(Math.abs(dist(shoulder,elbow)-.74)<1e-6,'upper arm length never stretches');
  assert.ok(Math.abs(dist(elbow,hand)-.76)<1e-6,'forearm length never stretches');
  if(dist(shoulder,target)<1.48&&dist(shoulder,target)>.03)assert.ok(dist(hand,target)<1e-6,'reachable mitt meets the actual hand');
 }
}
const a=solveArm([-.77,2.55,0],[-1.2,3,.4]);const b=solveArm([.77,2.55,0],[1.2,3,.4],.74,.76,1);
assert.ok(Math.abs(a.elbow[0]+b.elbow[0])<1e-7,'symmetric targets have symmetric bends');
console.log('Jab arm solve: fixed lengths, reachable contact, clamped reach, coincident target and symmetry pass.');

const crouch=solveArm([0,1.0,0],[0,.24,.08],.54,Math.hypot(.45,.08),0,[0,0,1]);assert.ok(crouch.elbow[2]>.1,'crouch knees bend forward while feet stay planted');
