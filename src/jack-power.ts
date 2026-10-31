export function jackHandsHigh(rig:number[][]){return [0,1].every(h=>{const w=rig[15+h],s=rig[11+h];return !!w&&!!s&&w[2]>=.4&&s[2]>=.4&&Number.isFinite(w[0]+w[1]+s[0]+s[1])&&w[1]-s[1]>.95;});}
export type JackPower={charge:number;active:number;serial:number;armed:boolean;neutral:number;hold:number;last:number};
export const newJackPower=():JackPower=>({charge:0,active:0,serial:0,armed:false,neutral:0,hold:0,last:-Infinity});
export function earnJackPower(g:JackPower){if(g.active<=0)g.charge=Math.min(8,g.charge+1);}
export function resetJackGesture(g:JackPower){g.armed=false;g.neutral=g.hold=0;g.last=-Infinity;}
export function stepJackPower(g:JackPower,rawDt:number,s:{t:number;fresh:boolean;lift:number;liftV:number;high:boolean}){
 const dt=Math.max(0,Math.min(.05,rawDt)),gap=s.t-g.last;g.active=Math.max(0,g.active-dt);
 if(!s.fresh||!Number.isFinite(s.lift+s.liftV)){resetJackGesture(g);return false;}
 if(gap>.18)resetJackGesture(g);g.last=s.t;
 if(g.charge<8||g.active>0)return false;
 if(!g.armed){g.neutral=Math.abs(s.lift)<.18&&!s.high?g.neutral+dt:0;if(g.neutral>=.2)g.armed=true;return false;}
 g.hold=s.high?g.hold+dt:0;
 if(!(s.lift>.25&&(s.liftV>.8||s.lift>.38))&&g.hold<.8)return false;
 g.charge=0;g.active=2.4;g.serial++;resetJackGesture(g);g.last=s.t;return true;
}
