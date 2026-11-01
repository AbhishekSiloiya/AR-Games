export type V3 = [number, number, number];
const add=(a:V3,b:V3):V3=>a.map((v,i)=>v+b[i]) as V3;
const sub=(a:V3,b:V3):V3=>a.map((v,i)=>v-b[i]) as V3;
const mul=(a:V3,s:number):V3=>a.map(v=>v*s) as V3;
const dot=(a:V3,b:V3)=>a.reduce((s,v,i)=>s+v*b[i],0);
const length=(a:V3)=>Math.hypot(...a);
const normal=(a:V3):V3=>mul(a,1/Math.max(1e-9,length(a)));
/** Fixed-length two-bone solve, including unreachable and coincident targets. */
export function solveArm(shoulder:V3,target:V3,upper=.74,lower=.76,side=-1,bendPole?:V3):{elbow:V3;hand:V3}{
 const delta=sub(target,shoulder),distance=length(delta),direction=distance>1e-7?normal(delta):[side,0,0] as V3;
 const reach=Math.max(Math.abs(upper-lower)+.001,Math.min(upper+lower-.001,distance));
 const hand=add(shoulder,mul(direction,reach));
 const pole:V3=bendPole??[side*.35,-1,-.3];let bend=sub(pole,mul(direction,dot(pole,direction)));
 if(length(bend)<.001){const fallback:V3=[0,0,1];bend=sub(fallback,mul(direction,dot(fallback,direction)));}
 const along=(upper*upper-lower*lower+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 return {elbow:add(add(shoulder,mul(direction,along)),mul(normal(bend),height)),hand};
}
