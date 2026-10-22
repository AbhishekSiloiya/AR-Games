// Arrival/collision state is independent of rendering so distant targets cannot score.
export function robotArrival(t:number,start:number) {
  const progress=Math.max(0,Math.min(1,(t-start)/1.5));
  return {progress,ready:progress>=1};
}
export type IncomingState={phase:'idle'|'warning'|'approach'|'ready'|'broken';age:number;hits:number};
export const incomingState=():IncomingState=>({phase:'idle',age:0,hits:0});
export function launchIncoming(q:IncomingState){q.phase='warning';q.age=0;return q;}
export function stepIncoming(q:IncomingState,dt:number){
  if(q.phase==='idle')return q;q.age+=Math.max(0,Math.min(.05,dt));
  if(q.phase==='warning'&&q.age>=.7){q.phase='approach';q.age=0;}
  else if(q.phase==='approach'&&q.age>=1){q.phase='ready';q.age=0;}
  else if(q.phase==='ready'&&q.age>=4.3||q.phase==='broken'&&q.age>=1.25){q.phase='idle';q.age=0;}
  return q;
}
export function hitIncoming(q:IncomingState){if(q.phase!=='ready')return false;q.phase='broken';q.age=0;q.hits++;return true;}
