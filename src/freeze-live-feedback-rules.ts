export const FREEZE_LIVE_JOINTS=[15,16,27,28] as const;
export type LiveSample={body:number[][];present:boolean;seen:number;rate:number;match:boolean;wobble:boolean;eligible:boolean};
type Ring={x:number;y:number;status:'hidden'|'moving'|'steady';settled:number;observed:boolean};
export const newLiveFeedback=(n:number)=>({seats:Array.from({length:n},()=>({seen:0,work:0,cooldown:0,earned:0,rings:FREEZE_LIVE_JOINTS.map(()=>({x:0,y:0,status:'hidden',settled:0,observed:false} as Ring))}))});
export type LiveFeedback=ReturnType<typeof newLiveFeedback>;
export function liveJointPoint(point:number[],width:number,height:number){return {x:1.8+(point[0]-.5)*width,y:-.3+(.5-point[1])*height};}
export function stepLiveFeedback(state:LiveFeedback,now:number,_dt:number,dancing:boolean,samples:LiveSample[],motion:boolean,aspect=16/9){
 const bursts:number[]=[];
 state.seats.forEach((s,p)=>{const sample=samples[p],fresh=sample?.present&&Number.isFinite(sample.seen)&&sample.seen<=now+1&&now-sample.seen<=200,newFrame=fresh&&sample.seen>s.seen,elapsed=newFrame&&s.seen?Math.min(.1,(sample.seen-s.seen)/1000):0;
  if(!fresh){s.work=0;s.seen=0;s.rings.forEach(r=>{r.status='hidden';r.settled=0;r.observed=false;});return;}
  if(newFrame){s.cooldown=Math.max(0,s.cooldown-elapsed);s.work=dancing&&sample.rate>2?s.work+elapsed:0;
   if(s.work>=.45&&s.cooldown<=0){s.work=0;s.cooldown=.9;if(motion){s.earned++;bursts.push(p);}}
  }if(!dancing)s.work=0;
  s.rings.forEach((r,i)=>{const point=sample.body[FREEZE_LIVE_JOINTS[i]],observed=point?.length>=3&&point[2]>=.5&&Number.isFinite(point[0]+point[1])&&point[0]>=0&&point[0]<=1&&point[1]>=0&&point[1]<=1;
   if(!observed){r.status='hidden';r.settled=0;r.observed=false;return;}
   if(newFrame){const speed=r.observed&&elapsed>0?Math.hypot((point[0]-r.x)*aspect,point[1]-r.y)/elapsed:Infinity;r.settled=!dancing&&sample.match&&!sample.wobble&&sample.eligible&&speed<.18?r.settled+elapsed:0;r.x=point[0];r.y=point[1];r.observed=true;}
   r.status=!dancing&&sample.match&&!sample.wobble&&sample.eligible&&r.settled>=.2?'steady':'moving';
  });if(newFrame)s.seen=sample.seen;
 });return bursts;
}
