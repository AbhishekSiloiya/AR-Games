// Award only a player's real deflection: stadium/goal frame rebounds never become free points.
export function saveAward({present,contact,gold,combo}:{present:boolean;contact:boolean;gold:boolean;combo:number}) {
  return present&&contact?(gold?3:1)+Math.floor((combo+1)/5):0;
}
export function combinationProgress(combo:number) {
  const hits=Math.max(0,Math.floor(combo));const remainder=hits%4;
  return {completed:Math.floor(hits/4),fill:hits>0&&remainder===0?1:remainder/4,remaining:hits>0&&remainder===0?0:4-remainder};
}
export const keeperCue=(state:'windup'|'in',gold:boolean)=>state==='windup'?(gold?'GOLD SHOT · GET READY':'STRIKER WINDING UP'):'REACH THE RING';
