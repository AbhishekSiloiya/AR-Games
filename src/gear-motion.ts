// Camera accessories use the same contain-fit projection as the game's mirror backdrop.
export function toolRoll(previous: number, dx: number, dy: number, dt: number) {
  const target=Math.max(-24,Math.min(24,dx*7+dy*2));
  return previous+(target-previous)*(1-Math.exp(-Math.max(0,dt)*12));
}
export function headAnchor(body: number[][], aspect: number) {
  const head=body[0], left=body[11], right=body[12];
  if (!head||!left||!right||[head,left,right].some(q=>q.length<3||!q.every(Number.isFinite)||q[2]<.35)) return null;
  const unit=Math.min(9,16/aspect), shoulder=Math.hypot((left[0]-right[0])*aspect,left[1]-right[1]);
  return {x:(head[0]-.5)*aspect*unit,y:(.5-head[1])*unit,scale:Math.max(.3,Math.min(2.4,shoulder*unit)),angle:Math.max(-25,Math.min(25,Math.atan2(left[1]-right[1],Math.abs(right[0]-left[0])*aspect)*180/Math.PI))};
}
