// Presentation rewards consume the same fresh, present-player movement rate as the
// studio rules. They never alter score, hold eligibility, pose matching or chains.
export type DanceEffectSample={present:boolean;rate:number};
export type DanceEffects={angle:number;strength:number;earned:number;work:number[];cooldown:number[]};
export const newDanceEffects=():DanceEffects=>({angle:0,strength:0,earned:0,work:[0,0],cooldown:[0,0]});
export function stepDanceEffects(state:DanceEffects,rawDt:number,dancing:boolean,samples:DanceEffectSample[],motion:boolean){
 const dt=Math.max(0,Math.min(.05,rawDt)),bursts:number[]=[];
 if(!dancing){state.strength=0;state.work.fill(0);return bursts;}
 let energy=0;
 samples.forEach((sample,p)=>{const active=sample.present&&Number.isFinite(sample.rate)&&sample.rate>2;state.cooldown[p]=Math.max(0,(state.cooldown[p]??0)-dt);state.work[p]=active?(state.work[p]??0)+dt:0;
  if(active)energy=Math.max(energy,Math.min(1,(sample.rate-2)/7));
  if(state.work[p]>=.45&&state.cooldown[p]<=0){state.work[p]=0;state.cooldown[p]=.9;if(motion){state.earned++;bursts.push(p);}}
 });
 state.strength=motion?energy:0;if(motion&&energy>0)state.angle=(state.angle+dt*(36+energy*96))%360;
 return bursts;
}
// Stage coordinates and a .14-unit safety margin prevent any earned light/particle
// from crossing the unfiltered player video, including near its frame.
export function outsideFreezeCamera(x:number,y:number,width:number,height:number){return Math.abs(x-1.8)>width*.5+.14||Math.abs(y+.3)>height*.5+.14;}
