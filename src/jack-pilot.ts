import {Color,Texture,Vec2,Quat,Vec3,type MeshInstance,type StandardMaterial} from 'playcanvas';
import {app,instantiate,node,own,lit,flat,shapes,type Scene} from './engine.ts';
let wool:Promise<Texture>|undefined;
const LIMBS=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];
const REST=[[-.17,-1],[-.1,-1],[.17,-1],[.1,-1],[-.1,-1],[0,-1],[.1,-1],[0,-1]];
export async function jackPilot(scene:Scene,p:number,n:number){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},fabric]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),wool??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture)))]);if(disposed){model.destroy();return null;}
 const x=n===1?0:(p-.5)*8,scale=n===1?1.08:.88,root=node(scene.root);root.name=`jack-rizzquake-${p}`;root.addChild(model);root.setLocalScale(scale,scale,scale);root.setLocalPosition(x,-3.55,1);
 for(const r of model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[])for(const mi of r.meshInstances){const m=own((mi.material as StandardMaterial).clone());m.useMetalness=false;m.useSkybox=false;m.useSheen=false;m.specular=new Color(.03,.03,.035);m.gloss=.12;if(!/eye|iris|pupil|catchlight/.test(m.name)){m.diffuseMap=fabric;m.diffuseMapTiling=new Vec2(2,2);}m.update();mi.material=m;}
 const find=(s:string)=>model.findByName(s)!,bones=['UpperArm.L','LowerArm.L','UpperArm.R','LowerArm.R','Thigh.L','Shin.L','Thigh.R','Shin.R'].map(find),hands=['L','R'].map(s=>find('Hand.'+s)),feet=['L','R'].map(s=>find('Foot.'+s)),head=find('Head'),smile=find('Smile');
 const alloy=lit('#e4ece9'),ink=lit('#244c5a'),bronze=lit('#477e89'),energy=flat(p?'#ffcb91':'#8ce8ed');
 const gear=hands.map((_,h)=>{const e=node(scene.root);e.name=`jack-gauntlet-${p}-${h}`;
  const shell=node(e,shapes.sphere(1,24),alloy);shell.setLocalScale(.33,.4,.28);
  const cuff=node(e,shapes.cylinder(.27,.2,24),ink,[0,-.3,0]);cuff.setLocalScale(1,1,.8);
  node(e,shapes.cylinder(.19,.48,28),bronze,[0,.38,0]);node(e,shapes.cylinder(.145,.5,28),ink,[0,.4,.015]);
  const tip=node(e,shapes.cylinder(.1,.03,24),energy,[0,.66,.015]);tip.name=`jack-muzzle-${p}-${h}`;
  const core=node(e,shapes.circle(.15,28),energy,[0,.05,.285]);const frame=node(e,shapes.ring(.16,.19,32),ink,[0,.05,.29]);frame.setLocalScale(1,1,1);
  for(const side of [-1,1]){const rail=node(e,shapes.box(.07,.45,.15),alloy,[side*.27,.2,0]);rail.setLocalEulerAngles(0,0,-side*8);}
  return {root:e,tip,core,pulse:0,dx:0,dy:1};
 });
 const shadow=node(scene.root,shapes.circle(1,48),flat('#102d49',{opacity:.27}),[x,-3.5,.4]);shadow.setLocalScale(1.15,.13,1);
 const from=new Vec3(),to=new Vec3(),q=new Quat();let pulse=0,seen=false;
 return {root,model,at:{x,y:-3.55,scale},react(_kind:string,_t:number){pulse=.22;},fire(h:number){gear[h].pulse=.18;},update(rig:number[][],fresh:boolean,dt:number,t:number,motion:boolean,lift=0){
  seen=fresh;pulse=Math.max(0,pulse-dt);root.setLocalPosition(x,-3.55,1);
  bones.forEach((bone,i)=>{const [a,b]=LIMBS[i],A=rig[a],B=rig[b],valid=fresh&&A?.[2]>.45&&B?.[2]>.45&&Number.isFinite(A[0]+A[1]+B[0]+B[1]);const dx=valid?B[0]-A[0]:REST[i][0],dy=valid?B[1]-A[1]:REST[i][1];from.set(...(i<4?[i<2?-1:1,0,0]:[0,-1,0]) as [number,number,number]);to.set(dx,dy,0).normalize();bone.setRotation(q.setFromDirections(from,to));});
  hands.forEach(h=>h.setRotation(Quat.IDENTITY));feet.forEach(f=>f.setRotation(Quat.IDENTITY));const bottom=Math.min(...feet.map(f=>f.getPosition().y));root.setLocalPosition(x,-3.55+(-3.44-bottom)+(fresh?Math.max(0,Math.min(.3,lift*.5)):0),1);
  const lean=fresh&&rig[0]&&rig[11]&&rig[12]?(rig[0][0]-(rig[11][0]+rig[12][0])/2):0;head.setLocalEulerAngles(0,Math.max(-12,Math.min(12,lean*12)),motion?Math.sin(t*1.8)*1.2:0);smile.setLocalScale(1,1+pulse*.6,1);gear.forEach((g,h)=>{g.pulse=Math.max(0,g.pulse-dt);const wrist=hands[h].getPosition(),shoulder=bones[h?2:0].getPosition(),dx=wrist.x-shoulder.x,dy=wrist.y-shoulder.y,len=Math.max(.01,Math.hypot(dx,dy));g.dx=dx/len;g.dy=dy/len;g.root.setLocalPosition(wrist.x,wrist.y,1.2);g.root.setLocalEulerAngles(0,0,Math.atan2(g.dy,g.dx)*180/Math.PI-90);const k=1+g.pulse*.45;g.root.setLocalScale(scale*k,scale*k,scale);g.core.setLocalScale(1+g.pulse*2,1+g.pulse*2,1);});
 },muzzle(h:number){const g=gear[h],at=g.tip.getPosition();return {x:at.x,y:at.y,dx:g.dx,dy:g.dy};},state(){return {character:'rizzquake',mesh:'skinned-3d',fresh:seen,hands:hands.map(h=>h.getPosition().toArray()),bones:bones.map(b=>b.getRotation().toArray()),gear:gear.map(g=>({name:'orbital pulse gauntlet',muzzle:g.tip.getPosition().toArray(),direction:[g.dx,g.dy],pulse:g.pulse})),scale};}};
}
