// Pure preflight rules: camera-frame coordinates, mirrored x rightwards, y downwards.
export type PoseSample = { present: boolean; body: number[][]; seenAt: number };
export type Movement = 'reach' | 'squat' | 'knee';
export function cameraLaunchArea(left: number, right: number, aspect: number, radius: number) {
  const width = aspect * Math.min(9,16/aspect), centre = ((left+right)/2-.5)*width;
  const half = Math.max(.1,(right-left)*width/2-radius);
  return { centre, half, left: centre-half, right: centre+half };
}
export function supportedView(id: string, n: number, view: 'live'|'classic'|'cutout') {
  return view === 'cutout' && (id !== 'keepy' || n !== 1) ? 'live' : view;
}
const UPPER = [0, 11, 12, 13, 14, 15, 16];
const FULL = [...UPPER, 23, 24, 25, 26, 27, 28];
export const jointName = (j: number) => j === 0 ? 'Head' : j < 13 ? 'Shoulder' : j < 15 ? 'Elbow' : j < 17 ? 'Hand' : j < 25 ? 'Hip' : j < 27 ? 'Knee' : 'Foot';
export function gameSetup(id: string) {
  const upper = ['slice', 'smash', 'goalie', 'wipe'].includes(id);
  const movement: Movement = ['run', 'jab', 'pulse', 'beat', 'forge', 'rocket'].includes(id) ? 'squat' : id === 'sprint' ? 'knee' : 'reach';
  return { joints: upper ? UPPER : FULL, upper, movement,
    cue: movement === 'squat' ? 'Make a small squat, then stand tall' : movement === 'knee' ? 'Lift one knee, then stand tall' : 'Spread both arms to shoulder height',
  };
}
export const visibleJoint = (b: number[][], j: number, margin = 0) => {
  const q = b[j];
  return !!q && q.length >= 3 && q.every(Number.isFinite) && q[2] >= .5 && q[0] >= margin && q[0] <= 1 - margin && q[1] >= margin && q[1] <= 1 - margin;
};
export function assessPose(id: string, sample: PoseSample, now: number, framing = true, seat = 0, count = 1) {
  const { joints } = gameSetup(id);
  const missing = joints.filter(j => !visibleJoint(sample.body, j, framing ? .025 : -.15));
  if (!sample.present || now - sample.seenAt > 600 || sample.seenAt <= 0) return { ok: false, missing: joints, message: 'Step into view of the camera' };
  if (missing.length) return { ok: false, missing, message: missing.some(j => j >= 27) ? 'Step back or tilt the camera so your feet are visible' : missing.some(j => j === 0) ? 'Step back so your head fits in the frame' : 'Bring both arms into view' };
  const b = sample.body, width = Math.abs(b[11][0] - b[12][0]), mid = (b[11][0] + b[12][0]) / 2;
  if (framing && width < .065 / count) return { ok: false, missing, message: 'Come a little closer' };
  if (framing && width > .36 / count) return { ok: false, missing, message: 'Step back to leave room to move' };
  const centre = count === 1 ? .5 : seat === 0 ? .27 : .73;
  if (framing && Math.abs(mid - centre) > .19 / count) return { ok: false, missing, message: mid < centre ? 'Move a little to your right' : 'Move a little to your left' };
  return { ok: true, missing, message: 'Your position looks good' };
}
export function movementDone(movement: Movement, b: number[][], neutral: number[][]) {
  if (b.length < 29 || neutral.length < 29) return false;
  const width = Math.max(.04, Math.abs(neutral[11][0] - neutral[12][0]));
  if (movement === 'reach') return Math.abs(b[15][0] - b[16][0]) > width * 2.7 && Math.abs(b[15][1] - b[11][1]) < width * .8 && Math.abs(b[16][1] - b[12][1]) < width * .8;
  if (movement === 'knee') return [25, 26].some(j => neutral[j][1] - b[j][1] > width * .45);
  return ((b[11][1] + b[12][1]) - (neutral[11][1] + neutral[12][1])) / 2 > width * .3;
}
export function neutralPose(id: string, b: number[][], neutral: number[][]) {
  if (b.length < 17 || neutral.length < 17) return false;
  const width = Math.max(.04, Math.abs(neutral[11][0] - neutral[12][0]));
  const shoulders = [11,12].every(j=>Math.hypot(b[j][0]-neutral[j][0],b[j][1]-neutral[j][1]) < width*.2);
  const movement = gameSetup(id).movement;
  return shoulders && (movement !== 'knee' || [25, 26].every(j => Math.abs(b[j][1] - neutral[j][1]) < width * .3))
    && (movement !== 'reach' || [15,16].every(j=>Math.hypot(b[j][0]-neutral[j][0],b[j][1]-neutral[j][1]) < width*.7));
}
export function standingPose(id: string, b: number[][]) {
  const config = gameSetup(id), width = b[11] && b[12] ? Math.abs(b[11][0]-b[12][0]) : 0;
  if (!width || !config.joints.every(j=>visibleJoint(b,j))) return false;
  if (!config.upper) {
    // Reject flexed knees before learning the player's standing reference.
    for (const [hip,knee,ankle] of [[23,25,27],[24,26,28]]) {
      const a=[b[hip][0]-b[knee][0],b[hip][1]-b[knee][1]], z=[b[ankle][0]-b[knee][0],b[ankle][1]-b[knee][1]];
      const cosine=(a[0]*z[0]+a[1]*z[1])/(Math.hypot(...a)*Math.hypot(...z)||1);
      if (cosine > -.85 || b[hip][1] <= b[11][1] || b[ankle][1] <= b[knee][1]) return false;
    }
  }
  return Math.abs(b[11][1]-b[12][1]) < width*.35;
}
export function stablePose(id: string, b: number[][], previous: number[][], elapsed: number) {
  if (elapsed <= 0 || elapsed > 500 || !b[11] || !b[12]) return false;
  const width=Math.max(.04,Math.abs(b[11][0]-b[12][0])), allowed=Math.max(.003,width*1.2*elapsed/1000);
  return gameSetup(id).joints.every(j=>b[j]&&previous[j]&&Math.hypot(b[j][0]-previous[j][0],b[j][1]-previous[j][1]) <= allowed);
}
export function readiness(since: number | null, ok: boolean, now: number, duration = 2000) {
  const start = ok ? since ?? now : null;
  return { since: start, progress: start === null ? 0 : Math.min(1, (now - start) / duration), ready: start !== null && now - start >= duration };
}
export function trackingGate(since: number | null, ok: boolean, now: number) {
  const start = ok ? null : since ?? now;
  return { since: start, lost: start !== null && now - start >= 800 };
}
