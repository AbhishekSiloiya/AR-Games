import {keeperShot} from './goalie-stages.ts';
import {saveAward} from './sport-rules.ts';
export type KeeperPoint={x:number;y:number;z:number};
export type KeeperHand=KeeperPoint&{px:number;py:number;on:boolean;vx:number;vy:number};
export type KeeperPhase='waiting'|'windup'|'flight'|'saved'|'miss';
export const keeperLayout=(n:number,p:number)=>({cx:n===1?0:p===0?-3.35:3.35,k:n===1?1:.56,gain:n===1?5.1:2.85,vertical:n===1?2.8:2.15,hw:n===1?5.65:3.05,hitRadius:n===1?1.02:.82,gloveScale:n===1?1:.76});
export type KeeperSeat={stage:number;seat:number;n:number;reach:number;speed:number;phase:KeeperPhase;age:number;index:number;tx:number;ty:number;gold:boolean;duration:number;bend:number;drill:string;finale:boolean;from:KeeperPoint;position:KeeperPoint;velocity:KeeperPoint;score:number;saves:number;misses:number;streak:number;best:number;practiceSaves:number;hand:number;lastEvent:string};
export function newKeeper(stage:number,seat:number,n:number,reach:number,speed=1):KeeperSeat{
 const cx=keeperLayout(n,seat).cx;return {stage,seat,n,reach,speed,phase:'waiting',age:0,index:0,tx:cx,ty:0,gold:false,duration:1.8,bend:0,drill:'',finale:false,from:{x:cx+.45,y:-2.85,z:-14.2},position:{x:cx+.45,y:-2.85,z:-14.2},velocity:{x:0,y:0,z:0},score:0,saves:0,misses:0,streak:0,best:0,practiceSaves:0,hand:-1,lastEvent:''};
}
// Earliest contact of two moving spheres in a frame. Relative motion catches both fast balls and swats.
export function sweepContact(a:KeeperPoint,b:KeeperPoint,g0:KeeperPoint,g1:KeeperPoint,r:number):number|null{
 const x=a.x-g0.x,y=a.y-g0.y,z=a.z-g0.z,dx=b.x-a.x-g1.x+g0.x,dy=b.y-a.y-g1.y+g0.y,dz=b.z-a.z-g1.z+g0.z;
 const c=x*x+y*y+z*z-r*r;if(c<=0)return 0;const aa=dx*dx+dy*dy+dz*dz;if(aa<1e-10)return null;const bb=2*(x*dx+y*dy+z*dz),d=bb*bb-4*aa*c;if(d<0)return null;const t=(-bb-Math.sqrt(d))/(2*aa);return t>=0&&t<=1?t:null;
}
export function flightPoint(s:KeeperSeat,u:number):KeeperPoint{return {x:s.from.x+(s.tx-s.from.x)*u+4*s.bend*u*(1-u),y:s.from.y+(s.ty-s.from.y)*u+4*2.1*u*(1-u),z:s.from.z+(.25-s.from.z)*u};}
export const keeperReport=(s:KeeperSeat)=>({resolved:s.saves+s.misses,rate:s.saves+s.misses?Math.round(100*s.saves/(s.saves+s.misses)):null});
export function stepKeeper(s:KeeperSeat,dt:number,t:number,present:boolean,hands:KeeperHand[],practice:boolean):'prepare'|'kick'|'save'|'miss'|null{
 if(!present)return null;s.age+=dt;
 if(s.phase==='waiting'){
  if(s.age<.35)return null;
  const l=keeperLayout(s.n,s.seat),shot=keeperShot(s.stage,s.index,t,practice);
  s.tx=l.cx+shot.x*l.k*s.reach;s.ty=shot.y*(s.n===1?1:.8);s.bend=shot.bend*l.k*s.reach;s.drill=shot.drill;s.finale=shot.finale;s.gold=!practice&&s.index>=4&&s.index%5===4;s.duration=practice?2.2:Math.max(1.25,1.9-(s.stage-1)*.11-Math.max(0,t)*.002)/(s.speed*1.5);s.index++;s.phase='windup';s.age=0;s.position={...s.from};s.lastEvent='';return 'prepare';
 }
 if(s.phase==='windup'){if(s.age<.85)return null;s.phase='flight';s.age=0;return 'kick';}
 if(s.phase==='flight'){
  const before=s.position,next=flightPoint(s,s.age/s.duration),l=keeperLayout(s.n,s.seat);let first=Infinity,hit=-1;
  hands.forEach((h,i)=>{if(!h.on||!Number.isFinite(h.x+h.y+h.px+h.py))return;const at=sweepContact(before,next,{x:h.px,y:h.py,z:h.z},h,l.hitRadius);if(at!==null&&at<first){const z=before.z+(next.z-before.z)*at;if(z<=.95){first=at;hit=i;}}});
  if(hit>=0){const h=hands[hit];s.position={x:before.x+(next.x-before.x)*first,y:before.y+(next.y-before.y)*first,z:before.z+(next.z-before.z)*first};s.velocity={x:Math.max(-5,Math.min(5,h.vx*.25))+(hit===0?-1.2:1.2),y:3+Math.min(2,Math.max(0,h.vy*.12)),z:-9};s.phase='saved';s.age=0;s.hand=hit;s.lastEvent='save';if(practice)s.practiceSaves++;else{s.score+=saveAward({present:true,contact:true,gold:s.gold,combo:s.streak});s.saves++;s.streak++;s.best=Math.max(s.best,s.streak);}return 'save';}
  s.position=next;if(next.z>.95){s.phase='miss';s.age=0;s.lastEvent='miss';if(!practice){s.misses++;s.streak=0;}return 'miss';}return null;
 }
 if(s.phase==='saved'){s.velocity.y-=5*dt;s.position={x:s.position.x+s.velocity.x*dt,y:s.position.y+s.velocity.y*dt,z:s.position.z+s.velocity.z*dt};}
 else if(s.phase==='miss'){s.position={x:s.tx,y:s.ty-Math.max(0,s.age-.3)*1.7,z:Math.min(2.3,.95+s.age*7)};}
 if(s.age>=1.15){s.phase='waiting';s.age=0;}return null;
}
