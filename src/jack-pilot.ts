import {Color,Texture,Vec2,Quat,Vec3,type MeshInstance,type StandardMaterial} from 'playcanvas';
import {app,instantiate,node,own,lit,flat,shapes,type Scene} from './engine.ts';
let wool:Promise<Texture>|undefined;
const LIMBS=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];
const REST=[[-.17,-1],[-.1,-1],[.17,-1],[.1,-1],[-.1,-1],[0,-1],[.1,-1],[0,-1]];
export async function jackPilot(scene:Scene,p:number,n:number){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},fabric]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),wool??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture)))]);if(disposed){model.destroy();return null;}
 const x=n===1?0:(p-.5)*8,scale=n===1?.9:.78,root=node(scene.root);root.name=`jack-rizzquake-${p}`;root.addChild(model);root.setLocalScale(scale,scale,scale);root.setLocalPosition(x,-3.55,1);
 for(const r of model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[])for(const mi of r.meshInstances){const m=own((mi.material as StandardMaterial).clone());m.useMetalness=false;m.useSkybox=false;m.useSheen=false;m.specular=new Color(.03,.03,.035);m.gloss=.12;if(!/eye|iris|pupil|catchlight/.test(m.name)){m.diffuseMap=fabric;m.diffuseMapTiling=new Vec2(2,2);}m.update();mi.material=m;}
 const find=(s:string)=>model.findByName(s)!,bones=['UpperArm.L','LowerArm.L','UpperArm.R','LowerArm.R','Thigh.L','Shin.L','Thigh.R','Shin.R'].map(find),hands=['L','R'].map(s=>find('Hand.'+s)),feet=['L','R'].map(s=>find('Foot.'+s)),head=find('Head'),smile=find('Smile');
 const alloy=lit('#d4e8ee'),energy=flat(p?'#ffc084':'#8ff2ff');
 const cuffs=hands.map((hand,h)=>{const e=node(hand,shapes.sphere(.19,16),alloy,[h?.05:-.05,0,.04]);e.setLocalScale(1,.8,1);node(e,shapes.circle(.11,24),energy,[0,0,.18]);return e;});
 const shadow=node(scene.root,shapes.circle(1,48),flat('#102d49',{opacity:.27}),[x,-3.5,.4]);shadow.setLocalScale(1.15,.13,1);
 const from=new Vec3(),to=new Vec3(),q=new Quat();let pulse=0,seen=false;
 return {root,model,at:{x,y:-3.55,scale},react(_kind:string,_t:number){pulse=.22;},update(rig:number[][],fresh:boolean,dt:number,t:number,motion:boolean){
  seen=fresh;pulse=Math.max(0,pulse-dt);root.setLocalPosition(x,-3.55,1);
  bones.forEach((bone,i)=>{const [a,b]=LIMBS[i],A=rig[a],B=rig[b],valid=fresh&&A?.[2]>.45&&B?.[2]>.45&&Number.isFinite(A[0]+A[1]+B[0]+B[1]);const dx=valid?B[0]-A[0]:REST[i][0],dy=valid?B[1]-A[1]:REST[i][1];from.set(...(i<4?[i<2?-1:1,0,0]:[0,-1,0]) as [number,number,number]);to.set(dx,dy,0).normalize();bone.setRotation(q.setFromDirections(from,to));});
  hands.forEach(h=>h.setRotation(Quat.IDENTITY));feet.forEach(f=>f.setRotation(Quat.IDENTITY));const bottom=Math.min(...feet.map(f=>f.getPosition().y));root.setLocalPosition(x,-3.55+(-3.44-bottom),1);
  const lean=fresh&&rig[0]&&rig[11]&&rig[12]?(rig[0][0]-(rig[11][0]+rig[12][0])/2):0;head.setLocalEulerAngles(0,Math.max(-12,Math.min(12,lean*12)),motion?Math.sin(t*1.8)*1.2:0);smile.setLocalScale(1,1+pulse*.6,1);cuffs.forEach(e=>e.setLocalScale(1+pulse*.3,.8+pulse*.2,1));
 },muzzle(h:number){const a=hands[h].getPosition(),b=bones[h?2:0].getPosition(),dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);return {x:a.x,y:a.y,dx:dx/Math.max(.01,d),dy:dy/Math.max(.01,d)};},state(){return {character:'rizzquake',mesh:'skinned-3d',fresh:seen,hands:hands.map(h=>h.getPosition().toArray()),bones:bones.map(b=>b.getRotation().toArray())};}};
}
