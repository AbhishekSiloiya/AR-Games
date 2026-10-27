export type JabAction={hand:0|1;cross:boolean;height:number};
export type JabPhase='present'|'strike'|'recover'|'combo'|'duckWarn'|'duck'|'reset';
export type JabSeat={phase:JabPhase;age:number;stage:number;pattern:number;index:number;action:JabAction;score:number;streak:number;best:number;hits:number;misses:number;completed:number;nextDuck:number;ducked:boolean;roundAt:number;feedback:string;impactSide:number;impact:number};
const action=(pattern:number,index:number,t:number):JabAction=>{
 const sequences=[[0,1,0,1],[0,0,1,1],[1,0,1,0]];
 return {hand:sequences[t<12?0:pattern%3][index] as 0|1,cross:t>24&&pattern%3===2&&index===3,height:index%2===0?1.02:1.25};
};
export const newJabSeat=(stage:number):JabSeat=>({phase:'present',age:0,stage,pattern:0,index:0,action:action(0,0,0),score:0,streak:0,best:0,hits:0,misses:0,completed:0,nextDuck:14,ducked:false,roundAt:0,feedback:'',impactSide:-1,impact:0});
export const jabWindow=(s:JabSeat)=>Math.max(1.3,2.7-s.roundAt*.014-(s.stage-1)*.13);
const phase=(s:JabSeat,value:JabPhase)=>{s.phase=value;s.age=0;};
const next=(s:JabSeat)=>{s.action=action(s.pattern,s.index,s.roundAt);phase(s,'present');};
export function stepJabSeat(s:JabSeat,dt:number,t:number,present:boolean,low:boolean){
 if(!present)return;s.roundAt=t;s.age+=dt;s.impact=Math.max(0,s.impact-dt*5);
 if(s.phase==='present'&&s.age>=.28)phase(s,'strike');
 else if(s.phase==='strike'&&s.age>=jabWindow(s)){s.misses++;s.streak=0;s.index=0;s.feedback='NEXT ONE';phase(s,'reset');}
 else if(s.phase==='recover'&&s.age>=.32){if(t>=s.nextDuck){s.ducked=false;phase(s,'duckWarn');}else next(s);}
 else if(s.phase==='combo'&&s.age>=.9){s.pattern++;s.index=0;if(t>=s.nextDuck){s.ducked=false;phase(s,'duckWarn');}else next(s);}
 else if(s.phase==='duckWarn'&&s.age>=1.4)phase(s,'duck');
 else if(s.phase==='duck'){
  s.ducked ||= low;
  if(s.age>=.75){if(s.ducked){s.score+=3;s.feedback='NICE DUCK';}else{s.misses++;s.streak=0;s.feedback='BACK TO GUARD';}s.nextDuck=t+10;phase(s,'reset');}
 }else if(s.phase==='reset'&&s.age>=.55)next(s);
}
export function strikeJab(s:JabSeat,hand:number,speed:number){
 if(s.phase!=='strike'||s.action.hand!==hand||speed<4.5)return false;
 s.hits++;s.streak++;s.best=Math.max(s.best,s.streak);s.score+=2+(speed>12?1:0)+(s.action.cross?1:0);s.impactSide=hand;s.impact=1;
 s.index++;s.feedback=speed>12?'SOLID HIT':'CLEAN HIT';
 if(s.index===4){s.completed++;s.score+=4;s.feedback='COMBO COMPLETE';phase(s,'combo');}
 else phase(s,'recover');
 return true;
}
export function jabTargets(s:JabSeat,cx:number,k:number){
 const raise=Math.max(0,Math.min(1,s.age/.28)),ease=raise*raise*(3-2*raise);
 return [0,1].map(hand=>{
  const sign=hand===0?-1:1,active=hand===s.action.hand;
  let x=sign*1.45,y=.48;
  if(active&&['present','strike','recover'].includes(s.phase)){
   const amount=s.phase==='present'?ease:s.phase==='recover'?Math.max(0,1-s.age/.32):1;
   x+=(s.action.cross?-sign*1.57:sign*.40)*amount;y+=(s.action.height-.48)*amount;
  }
  if(s.phase==='combo')y=1.1;
  if(s.phase==='duck'||s.phase==='duckWarn'){x=sign*1.2;y=.25;}
  return {x:cx+x*k,y:y*k,z:.6,hand:hand as 0|1,active:active&&s.phase==='strike'};
 });
}
