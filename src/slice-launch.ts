export type SliceArea={centre:number;half:number};
// Compact phrases move around the court; wide fans/pairs keep their authored spacing.
export function sliceSpread<T extends {at:number}>(shots:T[],index:number):T[]{
  if(!shots.length)return shots;
  const low=Math.min(...shots.map(s=>s.at)),high=Math.max(...shots.map(s=>s.at));
  if(high-low>.15)return shots;
  const origin=[-.78,.78,0,.48,-.48,.24][index%6],mid=(low+high)/2;
  return shots.map(s=>({...s,at:origin+(s.at-mid)*.4}));
}
// Aim a gentle drift within the same reach area instead of converging on the middle.
export function sliceArc(at:number,area:SliceArea,vy:number,gravity:number,random:number){
  const start=Math.max(-.92,Math.min(.92,at*.96));
  const target=Math.max(-.92,Math.min(.92,start+(random-.5)*.12));
  return {x:area.centre+start*area.half,vx:(target-start)*area.half/(vy/gravity)};
}
