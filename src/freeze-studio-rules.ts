export type FreezePose='free'|'wide'|'high'|'left'|'right';
export const FREEZE_POSES:Record<FreezePose,{title:string;hint:string}>={free:{title:'YOUR POSE',hint:'Stop moving. Make it yours.'},wide:{title:'ARMS WIDE',hint:'Hands out to the sides, level with your shoulders.'},high:{title:'HANDS HIGH',hint:'Lift both hands above your shoulders.'},left:{title:'LEFT HAND HIGH',hint:'Lift your left hand. Keep the other down.'},right:{title:'RIGHT HAND HIGH',hint:'Lift your right hand. Keep the other down.'}};
const lessons=[{title:'Find your groove',poses:['free'],hold:1.2},{title:'Spread your wings',poses:['wide'],hold:1.4},{title:'Hands to the sky',poses:['high'],hold:1.5},{title:'Switch it up',poses:['wide','high'],hold:1.6},{title:'Own the floor',poses:['wide','left','high','right','free'],hold:1.8}] as const;
export function freezeLesson(stage:number){const at=Math.max(0,Math.min(4,stage-1)),lesson=lessons[at];return {...lesson,pose:(index:number)=>lesson.poses[index%lesson.poses.length] as FreezePose};}
export const freezeObserved=(rig:number[][])=>[11,12,15,16,23,24,25,26,27,28].every(i=>rig[i]?.length>=3&&Number.isFinite(rig[i][0]+rig[i][1])&&rig[i][2]>=.35);
export function freezePoseMatches(pose:FreezePose,rig:number[][]){if(!freezeObserved(rig))return false;if(pose==='free')return true;const ids=[11,12,13,14,15,16];if(ids.some(i=>!rig[i]||rig[i][2]<.5))return false;const [ls,rs,l,r]=[rig[11],rig[12],rig[15],rig[16]],upL=l[1]>ls[1]+.5,upR=r[1]>rs[1]+.5;
 return pose==='high'?upL&&upR:pose==='left'?upL&&!upR:pose==='right'?upR&&!upL:ls[0]-l[0]>.65&&r[0]-rs[0]>.65&&Math.abs(l[1]-ls[1])<.5&&Math.abs(r[1]-rs[1])<.5;
}
export type FreezeSeat={score:number;chain:number;best:number;holds:number;attempts:number;attempted:boolean;visible:boolean;held:number;eligible:boolean;work:number;locked:boolean;match:boolean;wobble:boolean;cheer:number;danceSeconds:number};
export type FreezeStudio={stage:number;n:number;time:number;dancing:boolean;phaseAt:number;phaseEnd:number;index:number;pose:FreezePose;done:boolean;visualTime:number;seats:FreezeSeat[]};
export function newFreezeStudio(stage:number,n:number):FreezeStudio{return {stage,n,time:-3,dancing:true,phaseAt:0,phaseEnd:7,index:0,pose:freezeLesson(stage).pose(0),done:false,visualTime:0,seats:Array.from({length:n},()=>({score:0,chain:0,best:0,holds:0,attempts:0,attempted:false,visible:false,held:0,eligible:false,work:0,locked:false,match:true,wobble:false,cheer:0,danceSeconds:0}))};}
export function stepFreezeStudio(g:FreezeStudio,rawDt:number,t:number,samples:{present:boolean;rate:number;rig:number[][]}[],still=1.5){
 if(g.done)return;const dt=Math.max(0,Math.min(.1,rawDt)),lesson=freezeLesson(g.stage);g.time=t;if(t>=60){g.done=true;return;}if(t<0)return;
 while(t>=g.phaseEnd){g.phaseAt=g.phaseEnd;g.dancing=!g.dancing;if(g.dancing){g.index++;g.pose=lesson.pose(g.index);g.phaseEnd+=Math.max(4,[6,5,7,5,6][g.index%5]-(g.stage-1)*.2);g.seats.forEach(s=>{if(!s.locked)s.chain=0;s.work=0;s.held=0;s.wobble=false;});}else{g.phaseEnd+=.8+lesson.hold+1;g.seats.forEach(s=>{s.eligible=s.work>=.5;s.locked=false;s.held=0;s.match=false;s.wobble=false;s.attempted=false;});}}
 if(g.dancing)g.visualTime+=dt;
 g.seats.forEach((s,p)=>{const sample=samples[p],present=!!sample?.present,rate=Number.isFinite(sample?.rate)?Math.max(0,sample.rate):0;
  s.visible=present&&freezeObserved(sample?.rig??[]);
  if(g.dancing){s.cheer=Math.max(0,s.cheer-dt);s.match=true;s.wobble=false;if(present&&rate>2){s.score+=Math.min(12,rate)*dt;s.work+=dt;s.danceSeconds+=dt;}}
  else {if(present&&!s.attempted){s.attempts++;s.attempted=true;}s.match=present&&freezePoseMatches(g.pose,sample?.rig??[]);s.wobble=present&&rate>still/(1+(g.stage-1)*.08);if(!s.locked){if(!present||s.wobble||!s.match)s.held=0;else if(s.eligible&&t-g.phaseAt>=.8)s.held+=dt;if(s.held+1e-8>=lesson.hold){s.locked=true;s.holds++;s.chain++;s.best=Math.max(s.best,s.chain);s.score+=30+Math.min(4,s.chain-1)*5;s.cheer=1.4;}}}
 });
}
