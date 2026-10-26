// Shared musical grid and round-owned visual clock. No timers: Freeze and pause hold the whole club.
export const CLUB_BPM=126;
export type ClubScene={time:number;cheer:number;awards:number[]};
export const clubScene=():ClubScene=>({time:0,cheer:0,awards:[-Infinity,-Infinity]});
export function stepClub(state:ClubScene,dancing:boolean,dt:number){if(dancing){const step=Math.max(0,Math.min(.05,dt));state.time+=step;state.cheer=Math.max(0,state.cheer-step);}return state;}
export function cheerClub(state:ClubScene,player:number,id:number,present:boolean,still:boolean){if(!present||!still||state.awards[player]===id)return false;state.awards[player]=id;state.cheer=2;return true;}
export function resolveDanceTrack(saved:string|null):'synth'|'city'|'funky'{return saved==='city'||saved==='funky'?saved:'synth';}
const BASS=[0,null,null,0,null,null,7,null,0,null,12,null,null,7,null,3] as const;
const HOOK=[12,null,7,null,null,10,null,7,12,null,15,null,14,null,7,null] as const;
export function clubStep(step:number,intensity:number){
 const s=((step%16)+16)%16,bar=Math.floor(step/16),fill=bar%4===3,sparse=bar%8===6;
 return {kick:s%4===0,clap:s%8===4,hat:s%4===2||(!sparse&&s%2===1),openHat:s===14,fill:fill&&s>=14,bass:intensity>.2?BASS[s]:null,chord:intensity>.4&&(s===2||s===10),lead:intensity>.55&&!sparse?HOOK[(s+(bar%2)*4)%16]:null};
}
