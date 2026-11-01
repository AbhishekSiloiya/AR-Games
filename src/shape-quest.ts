import {shapeSeat,stepShape,type ShapePhase,type ShapeSeat} from './shapeup-rules.ts';
const D=Math.PI/180,LEGS=[-95,-90,-85,-90];
export const SHAPE_POSES:[string,number[]][]=([
 ['Arms out',[180,180,0,0,...LEGS]],['Reach for the sky',[135,135,45,45,...LEGS]],
 ['Goalposts',[180,90,0,90,...LEGS]],['Hands high',[100,95,80,85,...LEGS]],
 ['One high. One wide.',[100,95,0,0,...LEGS]],['Switch sides',[180,180,80,85,...LEGS]],
 ['Make a star',[150,150,30,30,-120,-115,-60,-65]],['Go diagonal',[135,135,-45,-45,...LEGS]],
] as [string,number[]][]).map(([name,pose])=>[name,pose.map(a=>a*D)]);
export type ShapePose=[string,number[]];
const pose=(name:string,angles:number[]):ShapePose=>[name,angles.map(a=>a*D)];
const straight=[-95,-90,-85,-90],wide=[-110,-100,-70,-80];
const SHAPE_STAGES=[
 {name:'Find your flow',focus:'Open shapes · steady feet',poses:SHAPE_POSES},
 {name:'Bend the beat',focus:'Bent arms · new combinations',poses:[
  pose('Frame your face',[150,90,30,90,...straight]),pose('Open the window',[175,180,5,85,...straight]),
  pose('Reach and fold',[135,145,0,90,...straight]),pose('Fold and reach',[180,90,45,35,...straight]),
  pose('Sky elbows',[120,80,60,100,...straight]),pose('Side brackets',[170,110,10,70,...straight]),
  pose('One up. One bent.',[100,100,5,95,...straight]),pose('Victory frame',[140,85,40,95,...straight])]},
 {name:'Break the symmetry',focus:'Uneven arms · wider stance',poses:[
  pose('Lightning left',[135,90,-10,20,...wide]),pose('Lightning right',[190,160,45,90,...wide]),
  pose('Open the gate',[160,110,15,5,...wide]),pose('Reach across the sky',[115,100,40,85,...wide]),
  pose('Corner to corner',[145,130,-20,-10,...wide]),pose('High-low switch',[190,185,65,90,...wide]),
  pose('Tilted crown',[130,80,65,105,...wide]),pose('Diagonal frame',[155,100,30,55,...wide])]},
 {name:'Shift your stance',focus:'Shallow side bends · stay comfortable',poses:[
  pose('Left lightning lunge',[140,95,5,25,-115,-90,-75,-90]),pose('Right lightning lunge',[175,155,45,90,-105,-90,-65,-90]),
  pose('Wide cactus',[170,100,10,80,-115,-95,-65,-85]),pose('Left side reach',[145,145,0,80,-120,-95,-75,-90]),
  pose('Right side reach',[180,100,35,35,-105,-90,-60,-85]),pose('Bent star',[150,40,30,60,-115,-90,-65,-90]),
  pose('Open left gate',[165,90,15,10,-120,-95,-75,-85]),pose('Open right gate',[165,170,15,90,-105,-95,-60,-85])]},
 {name:'Own the pose',focus:'Asymmetric combos · controlled stance',poses:[
  pose('Electric crown',[135,75,60,110,-115,-90,-70,-90]),pose('Left power frame',[165,155,0,25,-125,-95,-80,-90]),
  pose('Right power frame',[145,105,15,85,-100,-90,-55,-85]),pose('Split lightning',[130,150,-15,40,-115,-90,-65,-90]),
  pose('Switch the current',[195,145,50,80,-110,-95,-60,-85]),pose('Left orbit',[125,90,10,-10,-120,-90,-75,-90]),
  pose('Right orbit',[170,190,55,90,-105,-90,-60,-90]),pose('Final power pose',[155,95,25,85,-120,-90,-60,-90])]}
];
export function shapeStage(stage:number){return SHAPE_STAGES[Math.max(0,Math.min(4,Math.round(stage)-1))]??SHAPE_STAGES[0];}
export const SHAPE_STAND=[-100,-95,-80,-85,...LEGS].map(a=>a*D);
export type ShapeSample={quality:number;valid:boolean;aligned:boolean};
export type ShapeQuest={stage:number;n:number;time:number;phase:ShapePhase;index:number;remaining:number;phaseAt:number;matchSeconds:number;resultSeconds:number;restSeconds:number;stageName:string;focus:string;poses:ShapePose[];seats:ShapeSeat[];held:number[];quality:number[];done:boolean;serial:number};
export function newShapeQuest(stage:number,n:number):ShapeQuest{const content=shapeStage(stage);return {stage,n,time:-3,phase:'countdown',index:0,remaining:3,phaseAt:0,matchSeconds:Math.max(5.4,7.5/(1+(stage-1)*.14)),resultSeconds:stage<=2?.8:.7,restSeconds:stage<=2?.45:.35,stageName:content.name,focus:content.focus,poses:content.poses,seats:Array.from({length:n},()=>({...shapeSeat(),index:0})),held:Array(n).fill(0),quality:Array(n).fill(0),done:false,serial:0};}
export function resetShapeHold(g:ShapeQuest){g.held.fill(0);}
export function stepShapeQuest(g:ShapeQuest,rawDt:number,t:number,samples:ShapeSample[]){
 if(g.done)return;const gap=t-g.time;g.time=t;if(t<0){g.remaining=-t;return;}
 if(gap>.15)resetShapeHold(g);
 const dt=Math.max(0,Math.min(.1,rawDt));
 if(g.phase==='countdown'){g.phase='match';g.phaseAt=0;}
 if(g.phase==='result'&&t-g.phaseAt>=g.resultSeconds){if(g.index===g.poses.length-1){g.phase='done';g.done=true;g.remaining=0;return;}g.phase='rest';g.phaseAt+=g.resultSeconds;}
 if(g.phase==='rest'&&t-g.phaseAt>=g.restSeconds){g.phase='match';g.phaseAt+=g.restSeconds;g.index++;resetShapeHold(g);g.seats=g.seats.map(s=>stepShape(s,g.index,'match',0,false,t,g.matchSeconds).state);}
 g.remaining=Math.max(0,(g.phase==='match'?g.matchSeconds:g.phase==='result'?g.resultSeconds:g.restSeconds)-(t-g.phaseAt));
 if(g.phase!=='match')return;
 g.seats.forEach((seat,p)=>{
  if(seat.judged)return;const s=samples[p],valid=!!s?.valid,quality=valid&&Number.isFinite(s.quality)?Math.max(0,Math.min(100,s.quality)):0;g.quality[p]=quality;
  g.held[p]=valid&&s.aligned&&quality>=80?g.held[p]+dt:0;
  if(g.held[p]+1e-7>=.45){const earned={...seat,locked:true,best:quality};g.seats[p]=stepShape(earned,g.index,'result',quality,true,t,0).state;g.serial++;}
  else if(g.remaining<=0){const attempt={...seat,best:quality};g.seats[p]=stepShape(attempt,g.index,'result',quality,valid,t,0).state;}
 });
 if(g.seats.every(s=>s.judged)){g.phase='result';g.phaseAt=t;g.remaining=g.resultSeconds;}
}
export function shapeGuidance(mine:number[],target:number[]){
 const errors=target.map((a,i)=>Number.isFinite(mine[i])?Math.abs(Math.atan2(Math.sin(mine[i]-a),Math.cos(mine[i]-a)))/D:180);
 const groups=[Math.max(...errors.slice(0,2)),Math.max(...errors.slice(2,4)),Math.max(...errors.slice(4))];
 const matched=groups.map((e,i)=>e<=(i===2?40:35));const weighted=errors.reduce((a,e,i)=>a+e*(i<4?2:1),0)/12;
 const worst=groups.indexOf(Math.max(...groups));
 return {quality:Math.round(Math.max(0,Math.min(100,(50-weighted)*2.5))),groups:matched,aligned:matched.every(Boolean),hint:matched.every(Boolean)?'Hold it…':['Match the arm on the left','Match the arm on the right','Match your legs'][worst]};
}
export const shapeDirections=(angles:number[])=>angles.map(a=>[Math.cos(a),Math.sin(a),0] as [number,number,number]);
