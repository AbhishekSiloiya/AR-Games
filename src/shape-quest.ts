import {shapeSeat,stepShape,type ShapePhase,type ShapeSeat} from './shapeup-rules.ts';
const D=Math.PI/180,LEGS=[-95,-90,-85,-90];
export const SHAPE_POSES:[string,number[]][]=([
 ['Arms out',[180,180,0,0,...LEGS]],['Reach for the sky',[135,135,45,45,...LEGS]],
 ['Goalposts',[180,90,0,90,...LEGS]],['Hands high',[100,95,80,85,...LEGS]],
 ['One high. One wide.',[100,95,0,0,...LEGS]],['Switch sides',[180,180,80,85,...LEGS]],
 ['Make a star',[150,150,30,30,-120,-115,-60,-65]],['Go diagonal',[135,135,-45,-45,...LEGS]],
] as [string,number[]][]).map(([name,pose])=>[name,pose.map(a=>a*D)]);
export const SHAPE_STAND=[-100,-95,-80,-85,...LEGS].map(a=>a*D);
export type ShapeSample={quality:number;valid:boolean;aligned:boolean};
export type ShapeQuest={stage:number;n:number;time:number;phase:ShapePhase;index:number;remaining:number;phaseAt:number;matchSeconds:number;seats:ShapeSeat[];held:number[];quality:number[];done:boolean;serial:number};
export function newShapeQuest(stage:number,n:number):ShapeQuest{return {stage,n,time:-3,phase:'countdown',index:0,remaining:3,phaseAt:0,matchSeconds:Math.max(5.4,7.5/(1+(stage-1)*.14)),seats:Array.from({length:n},()=>({...shapeSeat(),index:0})),held:Array(n).fill(0),quality:Array(n).fill(0),done:false,serial:0};}
export function resetShapeHold(g:ShapeQuest){g.held.fill(0);}
export function stepShapeQuest(g:ShapeQuest,rawDt:number,t:number,samples:ShapeSample[]){
 if(g.done)return;const gap=t-g.time;g.time=t;if(t<0){g.remaining=-t;return;}
 if(gap>.15)resetShapeHold(g);
 const dt=Math.max(0,Math.min(.1,rawDt));
 if(g.phase==='countdown'){g.phase='match';g.phaseAt=0;}
 if(g.phase==='result'&&t-g.phaseAt>=1.2){if(g.index===7){g.phase='done';g.done=true;g.remaining=0;return;}g.phase='rest';g.phaseAt+=1.2;}
 if(g.phase==='rest'&&t-g.phaseAt>=1.4){g.phase='match';g.phaseAt+=1.4;g.index++;resetShapeHold(g);g.seats=g.seats.map(s=>stepShape(s,g.index,'match',0,false,t,g.matchSeconds).state);}
 g.remaining=Math.max(0,(g.phase==='match'?g.matchSeconds:g.phase==='result'?1.2:1.4)-(t-g.phaseAt));
 if(g.phase!=='match')return;
 g.seats.forEach((seat,p)=>{
  if(seat.judged)return;const s=samples[p],valid=!!s?.valid,quality=valid&&Number.isFinite(s.quality)?Math.max(0,Math.min(100,s.quality)):0;g.quality[p]=quality;
  g.held[p]=valid&&s.aligned&&quality>=80?g.held[p]+dt:0;
  if(g.held[p]+1e-7>=.45){const earned={...seat,locked:true,best:quality};g.seats[p]=stepShape(earned,g.index,'result',quality,true,t,0).state;g.serial++;}
  else if(g.remaining<=0){const attempt={...seat,best:quality};g.seats[p]=stepShape(attempt,g.index,'result',quality,valid,t,0).state;}
 });
 if(g.seats.every(s=>s.judged)){g.phase='result';g.phaseAt=t;g.remaining=1.2;}
}
export function shapeGuidance(mine:number[],target:number[]){
 const errors=target.map((a,i)=>Number.isFinite(mine[i])?Math.abs(Math.atan2(Math.sin(mine[i]-a),Math.cos(mine[i]-a)))/D:180);
 const groups=[Math.max(...errors.slice(0,2)),Math.max(...errors.slice(2,4)),Math.max(...errors.slice(4))];
 const matched=groups.map((e,i)=>e<=(i===2?40:35));const weighted=errors.reduce((a,e,i)=>a+e*(i<4?2:1),0)/12;
 const worst=groups.indexOf(Math.max(...groups));
 return {quality:Math.round(Math.max(0,Math.min(100,(50-weighted)*2.5))),groups:matched,aligned:matched.every(Boolean),hint:matched.every(Boolean)?'Hold it…':['Match the arm on the left','Match the arm on the right','Match your legs'][worst]};
}
export const shapeDirections=(angles:number[])=>angles.map(a=>[Math.cos(a),Math.sin(a),0] as [number,number,number]);
