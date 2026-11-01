const observed=(p:number[]|undefined):p is number[]=>!!p&&p[2]>=.4&&Number.isFinite(p[0]+p[1]);
const clamp=(v:number,low:number,high:number)=>Math.max(low,Math.min(high,v));
/** Screen-space aiming: the tracker exposes x/y, not forward depth. A foreshortened reach still has a stable target. */
export function jackAim(rig:number[][],hand:number,cx:number,half:number){
 const s=rig[11+hand],w=rig[15+hand];if(!observed(s)||!observed(w))return null;
 const height=w[1]-s[1],side=hand?1:-1;
 return {x:cx+clamp(side*.12+(w[0]-s[0])/.95,-1,1)*half*.83,y:clamp(1.7+height*2.4,1.25,4.2),ready:height>=-.15};
}
/** A segment pointing into the camera has almost no projected length; never normalize it into an arbitrary bone rotation. */
export function jackArmVector(a:number[],b:number[],side:number):[number,number]{
 if(!observed(a)||!observed(b)||Math.hypot(b[0]-a[0],b[1]-a[1])<.18)return [side*.2,-.7];
 return [b[0]-a[0],b[1]-a[1]];
}
