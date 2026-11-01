// Camera frames arrive independently of rendering. Keep one bounded rate per
// observed tracking sample so faster displays do not halve dance credit.
export function freezeMovement(){
 let energy=0,stamp=0,rate=0,ready=false;
 const reset=()=>{ready=false;rate=0;};
 return {reset,sample(nextEnergy:number,seen:number,now:number,present:boolean){
  if(!present||!Number.isFinite(nextEnergy+seen+now)||seen>now+1||now-seen>200){reset();return 0;}
  if(!ready){energy=nextEnergy;stamp=seen;ready=true;return 0;}
  if(seen<stamp||nextEnergy<energy){reset();return 0;}
  if(seen>stamp){const elapsed=(seen-stamp)/1000;rate=elapsed<=.2?Math.min(30,Math.max(0,(nextEnergy-energy)/elapsed)):0;energy=nextEnergy;stamp=seen;}
  return rate;
 }};
}
