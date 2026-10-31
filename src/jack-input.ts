import type {ArmShot} from './arm-shot.ts';
/** Load low, aim with an observed hand, then commit once after a brief steady aim. */
export function jackInput(){
 const state=()=>({armed:false,fired:-Infinity,hold:-Infinity,x:0,y:0,progress:0});let hands=[state(),state()],last=-Infinity;
 const reset=()=>{hands=[state(),state()];last=-Infinity;};
 return {reset,progress:(h:number)=>hands[h].progress,sample(rig:number[][],t:number,fresh:boolean){
  if(!fresh){reset();return [];}
  if(t-last>.18)reset();last=t;const shots:ArmShot[]=[];
  for(const h of [0,1]){const a=hands[h],w=rig[15+h],s=rig[11+h];if(!w||!s||w[2]<.4||s[2]<.4||!Number.isFinite(w[0]+w[1]+s[0]+s[1])){hands[h]=state();continue;}
   const x=w[0]-s[0],y=w[1]-s[1];
   if(y<-.35){a.armed=true;a.hold=-Infinity;a.progress=0;}
   if(!a.armed||y<-.15||t-a.fired<.25){a.hold=-Infinity;a.progress=0;continue;}
   if(!Number.isFinite(a.hold)||Math.hypot(x-a.x,y-a.y)>.06){a.hold=t;a.x=x;a.y=y;}
   a.progress=Math.min(1,(t-a.hold)/.14);if(a.progress<1)continue;
   a.armed=false;a.fired=t;a.progress=0;a.hold=-Infinity;const dy=Math.max(.25,y),len=Math.hypot(x,dy);shots.push({hand:h,x:w[0],y:w[1],dx:x/len,dy:dy/len});
  }return shots;
 }};
}
