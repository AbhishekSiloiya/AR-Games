export type PartyMotion={angle:number;lightTime:number;dancing:boolean;awards:number[]};
export const partyMotion=():PartyMotion=>({angle:0,lightTime:0,dancing:true,awards:[-Infinity,-Infinity]});
export function stepParty(state:PartyMotion,dancing:boolean,dt:number){
  state.dancing=dancing;
  if(dancing){const step=Math.max(0,Math.min(.05,dt));state.angle=(state.angle+step*22)%360;state.lightTime+=step;}
  return state;
}
export function partyReward(state:PartyMotion,p:number,freezeId:number,present:boolean,still:boolean){
  if(!present||!still||state.awards[p]===freezeId)return false;
  state.awards[p]=freezeId;return true;
}
