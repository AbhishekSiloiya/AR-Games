export function sliceInputGate(){
 let valid=false,after=0;
 return {reset(now:number){valid=false;after=now+150;},sample(now:number,seen:number,present:boolean){const fresh=present&&Number.isFinite(seen)&&now-seen<=180&&seen<=now+1,reset=fresh&&!valid;valid=fresh;return {reset,cut:fresh&&!reset&&now>=after};}};
}
