import type {ArmShot} from './arm-shot.ts';
/** Normal fire is an immediate observed raise. Held repeats exist only during an earned rapid pickup. */
export function jackInput(){
 const state=()=>({armed:false,engaged:false,fired:-Infinity});let hands=[state(),state()],last=-Infinity;
 const reset=()=>{hands=[state(),state()];last=-Infinity;};
 return {reset,progress:(h:number)=>{const d=last-hands[h].fired;return Number.isFinite(d)?Math.max(0,1-d/.12):0;},sample(rig:number[][],t:number,fresh:boolean,rapid=false){
  if(!fresh){reset();return [];}
  if(t-last>.18)reset();last=t;const shots:ArmShot[]=[];
  for(const h of [0,1]){const a=hands[h],w=rig[15+h],s=rig[11+h];if(!w||!s||w[2]<.4||s[2]<.4||!Number.isFinite(w[0]+w[1]+s[0]+s[1])){hands[h]=state();continue;}
   const x=w[0]-s[0],y=w[1]-s[1];if(y<-.35){a.armed=true;a.engaged=false;}
   if(y<-.15||(!a.armed&&!(rapid&&a.engaged&&t-a.fired>=.12)))continue;
   a.armed=false;a.engaged=true;a.fired=t;const dy=Math.max(.25,y),len=Math.hypot(x,dy);shots.push({hand:h,x:w[0],y:w[1],dx:x/len,dy:dy/len});
  }return shots;
 }};
}
