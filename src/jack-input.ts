import {armShooter} from './arm-shot.ts';
/** A pause, missing sample or stale interval breaks a pending raise gesture. */
export function jackInput(){
 let shoot=armShooter(),last=-Infinity;
 const reset=()=>{shoot=armShooter();last=-Infinity;};
 return {reset,sample(rig:number[][],t:number,fresh:boolean){
  if(!fresh){reset();return [];}
  if(t-last>.18)shoot=armShooter();last=t;
  return shoot(rig,t);
 }};
}
