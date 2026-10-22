// A capsule's local Y axis must point along the tracked segment. Reuse `out` every frame.
export type RangerSegment = { x: number; y: number; length: number; angle: number; seen: boolean };
export function rangerSegment(rig: number[][], a: number, b: number, out: RangerSegment) {
  const from = rig[a], to = rig[b];
  out.seen = !!from && !!to && from[2] > .45 && to[2] > .45 && Number.isFinite(from[0] + from[1] + to[0] + to[1]);
  if (!out.seen) return out;
  const dx = to[0] - from[0], dy = to[1] - from[1];
  out.length = Math.hypot(dx,dy);
  out.seen = out.length > .025;
  out.x = (from[0]+to[0])/2; out.y = (from[1]+to[1])/2;
  out.angle = Math.atan2(dy,dx)*180/Math.PI-90;
  return out;
}

// Compact toy proportions keep the boots visible and the suit comfortably stocky.
// Only a separate visual rig is changed; repetition detection retains the original landmarks.
export function rangerDisplayRig(rig: number[][], out: number[][]) {
  for (let j=0;j<33;j++) {
    const source=rig[j], target=out[j];
    target[0]=source?.[0]??0; target[1]=(source?.[1]??0)*.8; target[2]=source?.[2]??0;
    target[3]=source?.[3]??0; target[4]=(source?.[4]??0)*.8;
  }
  return out;
}
