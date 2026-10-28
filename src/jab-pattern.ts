import {JAB_HOME,JAB_OUTER} from './jab-presentation.ts';
export type JabAction={hand:0|1;cross:boolean;height:number};
export type JabPhase='present'|'strike'|'recover'|'combo'|'duckWarn'|'duck'|'reset';
export type JabSeat={phase:JabPhase;age:number;stage:number;pattern:number;patternAt:number;index:number;action:JabAction;score:number;streak:number;best:number;hits:number;misses:number;completed:number;nextDuck:number;ducked:boolean;roundAt:number;feedback:string;impactSide:number;impact:number;finaleStreak:number;finaleWon:boolean;finaleAt:number;missedPads:number;responseSum:number;responseCount:number};
export const jabDrill=(stage:number)=>[
 {name:'Alternating jabs',detail:'Left, right. Find your rhythm.'},
 {name:'Double jabs',detail:'Two on one side, then switch.'},
 {name:'High / low',detail:'Reach to the marked mitt at different heights.'},
 {name:'Cross work',detail:'Finish each pattern with a cross toward the centre.'},
 {name:'Mixed combinations',detail:'Switch sides, doubles and crosses.'},
][Math.max(0,Math.min(4,stage-1))];
export function jabSequence(stage:number,pattern:number,t:number):JabAction[]{
 const opposite=pattern%2===1,flip=(h:number)=>(opposite?1-h:h) as 0|1;
 let hands=[0,1,0,1],heights=[.9,1.36,.9,1.36],cross=false;
 if(t>=12){
  if(stage===2)hands=[0,0,1,1];
  if(stage===3)heights=[1.36,.72,.9,1.36];
  if(stage===4)cross=true;
  if(stage>=5){hands=pattern%3===0?[1,1,0,0]:pattern%3===1?[0,1,1,0]:[1,0,1,0];heights=[1.36,.9,.72,1.36];cross=true;}
 }
 return hands.map((hand,i)=>({hand:stage===1||t<12?hand as 0|1:flip(hand),cross:cross&&i===3,height:heights[i]}));
}
const action=(stage:number,pattern:number,index:number,t:number)=>jabSequence(stage,pattern,t)[index];
export function jabReport(s:JabSeat){const resolved=s.hits+s.missedPads;return {resolved,accuracy:resolved?Math.round(100*s.hits/resolved):null,responseMs:s.responseCount?Math.round(1000*s.responseSum/s.responseCount):null};}
export const newJabSeat=(stage:number):JabSeat=>({phase:'present',age:0,stage,pattern:0,patternAt:0,index:0,action:action(stage,0,0,0),score:0,streak:0,best:0,hits:0,misses:0,completed:0,nextDuck:14,ducked:false,roundAt:0,feedback:'',impactSide:-1,impact:0,finaleStreak:0,finaleWon:false,finaleAt:-100,missedPads:0,responseSum:0,responseCount:0});
export const jabWindow=(s:JabSeat)=>Math.max(1.3,2.7-s.roundAt*.014-(s.stage-1)*.13);
const phase=(s:JabSeat,value:JabPhase)=>{s.phase=value;s.age=0;};
const next=(s:JabSeat)=>{if(s.index===0)s.patternAt=s.roundAt;s.action=action(s.stage,s.pattern,s.index,s.patternAt);phase(s,'present');};
export function stepJabSeat(s:JabSeat,dt:number,t:number,present:boolean,low:boolean){
 if(!present)return;s.roundAt=t;s.age+=dt;s.impact=Math.max(0,s.impact-dt*5);
 if(s.phase==='present'&&s.age>=.28)phase(s,'strike');
 else if(s.phase==='strike'&&s.age>=jabWindow(s)){s.misses++;s.missedPads++;s.streak=0;s.finaleStreak=0;s.index=0;s.feedback='NEXT ONE';phase(s,'reset');}
 else if(s.phase==='recover'&&s.age>=.32){if(t>=s.nextDuck&&t<50){s.ducked=false;phase(s,'duckWarn');}else next(s);}
 else if(s.phase==='combo'&&s.age>=.9){s.pattern++;s.index=0;if(t>=s.nextDuck&&t<50){s.ducked=false;phase(s,'duckWarn');}else next(s);}
 else if(s.phase==='duckWarn'&&s.age>=1.4)phase(s,'duck');
 else if(s.phase==='duck'){
  s.ducked ||= low;
  if(s.age>=.75){if(s.ducked){s.score+=3;s.feedback='NICE DUCK';}else{s.misses++;s.streak=0;s.finaleStreak=0;s.feedback='BACK TO GUARD';}s.nextDuck=t+10;phase(s,'reset');}
 }else if(s.phase==='reset'&&s.age>=.55)next(s);
}
export function strikeJab(s:JabSeat,hand:number,speed:number){
 if(s.phase!=='strike'||s.action.hand!==hand||speed<4.5)return false;
 s.responseSum+=.28+s.age;s.responseCount++;
 s.hits++;s.streak++;s.best=Math.max(s.best,s.streak);s.score+=2+(speed>12?1:0)+(s.action.cross?1:0);s.impactSide=hand;s.impact=1;
 s.index++;s.feedback=speed>12?'SOLID HIT':'CLEAN HIT';
 if(s.index===4){s.completed++;s.score+=4;s.feedback='COMBO COMPLETE';phase(s,'combo');}
 else phase(s,'recover');
 if(s.roundAt>=50&&s.roundAt<60&&!s.finaleWon){
  s.finaleStreak++;
  if(s.finaleStreak===4){s.finaleWon=true;s.finaleAt=s.roundAt;s.score+=6;s.feedback='FINISH BONUS +6';}
 }
 return true;
}
export function jabTargets(s:JabSeat,cx:number,k:number,reach=1){
 const raise=Math.max(0,Math.min(1,s.age/.28)),ease=raise*raise*(3-2*raise);
 return [0,1].map(hand=>{
  const sign=hand===0?-1:1,active=hand===s.action.hand;
  let x=sign*JAB_HOME,y=.48;
  if(active&&['present','strike','recover'].includes(s.phase)){
   const amount=s.phase==='present'?ease:s.phase==='recover'?Math.max(0,1-s.age/.32):1;
   x+=(s.action.cross?-sign*(JAB_HOME+.45):sign*(JAB_OUTER*reach-JAB_HOME))*amount;y+=(s.action.height-.48)*amount;
  }
  if(s.phase==='combo'){y=1.35;x=sign*JAB_HOME;}
  if(s.phase==='duck'||s.phase==='duckWarn'){x=sign*2.1;y=0;}
  return {x:cx+x*k,y:y*k,z:-.15,hand:hand as 0|1,active:active&&s.phase==='strike'};
 });
}
