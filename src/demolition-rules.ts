export type BossState={armour:number[];maxArmour:number;core:number;maxCore:number;defeated:boolean};
export function bossState(stage:number,wave:number):BossState {
  const maxArmour=2+Math.floor((Math.max(1,stage)-1)/2)+Math.min(2,wave),maxCore=3+Math.floor(Math.max(1,stage)/2);
  return {armour:Array(6).fill(maxArmour),maxArmour,core:maxCore,maxCore,defeated:false};
}
export function plateImpact(boss:BossState,index:number,weak:boolean){
  if(boss.defeated||!boss.armour[index])return {points:0,broken:false};
  boss.armour[index]=Math.max(0,boss.armour[index]-(weak?2:1));
  const broken=boss.armour[index]===0;return {points:broken?3:1,broken};
}
export function coreImpact(boss:BossState){
  if(boss.defeated||boss.armour.some(Boolean))return {points:0,defeated:false};
  boss.core=Math.max(0,boss.core-1);boss.defeated=boss.core===0;return {points:boss.defeated?10:2,defeated:boss.defeated};
}
// One impact per deliberate swing; a frozen fast sample or reacquired wrist cannot auto-repeat.
export function punchTrigger(){
  let armed=false,last=-Infinity;
  const ready=(speed:number,t:number,seen:boolean)=>{
    if(!seen||!Number.isFinite(speed)){armed=false;return false;}
    if(speed<1.6)armed=true;
    if(!armed||speed<3||t-last<.26)return false;
    return true;
  };
  return Object.assign(ready,{consume:(t:number)=>{armed=false;last=t;}});
}
