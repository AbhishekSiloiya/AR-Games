// Rendering math only. Game inputs continue to read the original calibrated landmarks.
export const MASCOT_LIMBS=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]] as const;
const good=(q?:number[])=>!!q&&q.length>=3&&q[2]>.35&&Number.isFinite(q[0]+q[1]);
export function mascotSegment(rig:number[][],a:number,b:number){
 const from=rig[a],to=rig[b];if(!good(from)||!good(to))return {visible:false,x:0,y:0,length:0,angle:0};
 const dx=to[0]-from[0],dy=-(to[1]-from[1])*.8;
 return {visible:Math.hypot(dx,dy)>.02,x:(from[0]+to[0])/2,y:-(from[1]+to[1])*.4,length:Math.hypot(dx,dy),angle:Math.atan2(dy,dx)*180/Math.PI-90};
}
export function mascotFrame(rig:number[][]){
 if(![11,12,23,24].every(j=>good(rig[j])))return {visible:false,x:0,y:0,width:1,height:1,angle:0,headX:0,headY:-1,headAngle:0};
 const shoulder=[(rig[11][0]+rig[12][0])/2,-(rig[11][1]+rig[12][1])*.4],hip=[(rig[23][0]+rig[24][0])/2,-(rig[23][1]+rig[24][1])*.4];
 const width=Math.max(.6,Math.hypot(rig[12][0]-rig[11][0],(rig[12][1]-rig[11][1])*.8));
 return {visible:true,x:(shoulder[0]+hip[0])/2,y:(shoulder[1]+hip[1])/2,width,height:Math.max(.4,Math.hypot(hip[0]-shoulder[0],hip[1]-shoulder[1])),angle:Math.atan2(hip[1]-shoulder[1],hip[0]-shoulder[0])*180/Math.PI-90,headX:good(rig[0])?rig[0][0]:shoulder[0],headY:good(rig[0])?-rig[0][1]*.8:shoulder[1]-.75,headAngle:Math.atan2(-(rig[12][1]-rig[11][1])*.8,rig[12][0]-rig[11][0])*180/Math.PI};
}
export const MASCOT_STAND=[-1.8,-1.5,-1.34,-1.65,-1.66,-1.57,-1.48,-1.57];
export function mascotPose(angles:readonly number[]=MASCOT_STAND){
 const r=Array.from({length:33},()=>[0,0,0]);r[0]=[0,1.08,1];r[11]=[-.55,0,1];r[12]=[.55,0,1];r[23]=[-.38,-1.45,1];r[24]=[.38,-1.45,1];
 const lengths=[.85,.8,.85,.8,1.15,1.05,1.15,1.05];
 MASCOT_LIMBS.forEach(([a,b],i)=>{r[b]=[r[a][0]+Math.cos(angles[i])*lengths[i],r[a][1]+Math.sin(angles[i])*lengths[i],1];});return r;
}
// Hips/feet are optional in upper-body games. Supply a neutral DISPLAY stance only;
// the tracker and collision/shot arrays remain untouched, and real arms are never replaced.
export function mascotDisplayRig(rig:number[][]){
 const display=rig.map(q=>[...q]);if(!good(rig[11])||!good(rig[12]))return display;
 const x=(rig[11][0]+rig[12][0])/2,y=(rig[11][1]+rig[12][1])/2,sw=Math.max(.5,Math.abs(rig[12][0]-rig[11][0])),rest=mascotPose();
 for(const [hip,knee,foot] of [[23,25,27],[24,26,28]]){
  if(!good(display[hip]))display[hip]=[x+rest[hip][0]*sw,y+rest[hip][1]*sw,1];
  for(const j of [knee,foot])if(!good(display[j]))display[j]=[display[hip][0]+(rest[j][0]-rest[hip][0])*sw,display[hip][1]+(rest[j][1]-rest[hip][1])*sw,1];
 }
 return display;
}
