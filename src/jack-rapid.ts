export type JackRapid={remaining:number;pickups:number};
export const newRapid=():JackRapid=>({remaining:0,pickups:0});
export function grantRapid(g:JackRapid){g.remaining=5;g.pickups++;}
export function stepRapid(g:JackRapid,dt:number){g.remaining=Math.max(0,g.remaining-Math.max(0,Math.min(.05,dt)));}
