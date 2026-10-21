import assert from 'node:assert/strict';
import { assessPose, cameraLaunchArea, standingPose, stablePose, supportedView, quickReadiness, readiness, trackingGate, type PoseSample } from './calibration.ts';

const pose = (): PoseSample => {
  const body = Array.from({ length: 33 }, () => [0.5, 0.5, 1]);
  for (const [j, x, y] of [[0,.5,.15],[11,.42,.3],[12,.58,.3],[13,.35,.4],[14,.65,.4],[15,.3,.5],[16,.7,.5],[23,.44,.55],[24,.56,.55],[25,.44,.72],[26,.56,.72],[27,.44,.9],[28,.56,.9]]) body[j] = [x,y,1];
  return { present: true, body, seenAt: 1000 };
};
assert.equal(assessPose('slice', pose(), 1000).ok, true);
const noFeet = pose(); noFeet.body[27][2] = noFeet.body[28][2] = 0;
assert.equal(assessPose('slice', noFeet, 1000).ok, true, 'hands-only games do not require feet');
assert.equal(assessPose('keepy', noFeet, 1000).ok, false, 'whole-body games require feet');
assert.equal(assessPose('run', pose(), 2000).ok, false, 'a frozen tracker cannot unlock setup');
const edge = pose(); edge.body[15][0] = -.1;
assert.equal(assessPose('slice', edge, 1000).ok, false, 'off-camera wrists block setup');
const tiny = pose(); tiny.body[11][0] = .49; tiny.body[12][0] = .51;
assert.match(assessPose('slice', tiny, 1000).message, /closer/);
const squat = pose(); squat.body[11][1] += .08; squat.body[12][1] += .08;
let hold = readiness(null, true, 1000);
hold = readiness(hold.since, true, 2999); assert.equal(hold.ready, false);
hold = readiness(hold.since, true, 3000); assert.equal(hold.ready, true);
assert.equal(readiness(hold.since, false, 3001).since, null);
let gate = trackingGate(null, false, 1000);
assert.equal(gate.lost, false);
gate = trackingGate(gate.since, false, 1800); assert.equal(gate.lost, true);
assert.equal(trackingGate(gate.since, true, 1801).since, null);
assert.equal(assessPose('run', edge, 1000, false).ok, true, 'normal motion outside the setup margins is allowed during play');


assert.equal(supportedView('slice',1,'cutout'), 'live');
assert.equal(supportedView('keepy',1,'cutout'), 'cutout');
assert.equal(supportedView('keepy',2,'cutout'), 'live');
assert.equal(standingPose('run',pose().body),true);
const crouched=pose();crouched.body[25][0]=.65;crouched.body[26][0]=.35;
assert.equal(standingPose('run',crouched.body),false,'bent knees cannot define standing');
assert.equal(stablePose('run',squat.body,pose().body,100),false,'moving players cannot automatically resume');
assert.equal(stablePose('run',pose().body,pose().body,100),true);
const farBounds = cameraLaunchArea(.392,.608,16/9,.75);
assert.ok(farBounds.left >= (.392-.5)*16 && farBounds.right <= (.608-.5)*16, 'far-player fruit stays inside demonstrated reach');
assert.ok(farBounds.half < 1.75, 'far-player fan is narrower than the old five-unit spread');

// Quick setup accepts a usable off-centre pose without a demonstration or exact hand height.
const relaxed=pose();for(const q of relaxed.body)q[0]-=.2;
relaxed.body[13][2]=relaxed.body[14][2]=.2;
relaxed.body[15][2]=relaxed.body[16][2]=.4;
assert.equal(assessPose('slice',relaxed,1000).ok,true,'off-centre and lower-confidence hands remain usable');
assert.equal(standingPose('slice',relaxed.body),true);
let quick=quickReadiness(null,true,1000);
for(let t=1100;t<=1400;t+=100)quick=quickReadiness(quick,true,t);
quick=quickReadiness(quick,false,1500);
quick=quickReadiness(quick,true,1600);
for(let t=1700;t<=2000;t+=100)quick=quickReadiness(quick,true,t);
assert.equal(quick.ready,true,'a brief dropout does not restart quick setup');
quick=quickReadiness(quick,false,2100);
for(let t=2200;t<=2600;t+=100)quick=quickReadiness(quick,false,t);
assert.equal(quick.goodMs,0,'sustained tracking loss resets readiness');

console.log('Calibration: quick setup, relaxed framing, freshness, dropouts, posture and reach bounds pass.');
