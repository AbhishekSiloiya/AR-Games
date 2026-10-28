import {Color,Texture,Vec2,Quat,Vec3,type StandardMaterial,type MeshInstance} from 'playcanvas';
import {app,instantiate,node,own,flat,shapes,type Scene} from './engine.ts';
import type {FreezePose} from './freeze-studio-rules.ts';
let wool:Promise<Texture>|undefined;
export async function freezeDancer(scene:Scene){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},fabric]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),wool??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(err,a)=>err||!a?reject(err):resolve(a.resource as Texture)))]);if(disposed){model.destroy();return null;}
 const root=node(scene.root);root.name='freeze-rizzquake';root.setLocalPosition(-5.2,-3.1,0);root.setLocalScale(1,1,1);root.addChild(model);
 for(const r of model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[])for(const mi of r.meshInstances){const m=own((mi.material as StandardMaterial).clone());m.useSkybox=false;m.useMetalness=false;m.specular=new Color(.025,.025,.025);m.gloss=.1;if(!/eye|iris|pupil|catchlight/.test(m.name)){m.diffuseMap=fabric;m.diffuseMapTiling=new Vec2(2,2);m.useSheen=true;m.sheen=new Color(.06,.07,.06);}m.update();mi.material=m;}
 const find=(name:string)=>model.findByName(name)!,arms=['L','R'].map(s=>[find('UpperArm.'+s),find('LowerArm.'+s)]),legs=['L','R'].map(s=>[find('Thigh.'+s),find('Shin.'+s)]),spine=find('Spine'),head=find('Head'),pelvis=find('Pelvis'),smile=find('Smile'),eyes=['L','R'].map(s=>find('Eye.'+s));
 const shadow=node(scene.root,shapes.circle(1,48),flat('#664839',{opacity:.16}),[-5.2,-3.11,-.1]);shadow.setLocalScale(1.15,.16,1);
 const from=new Vec3(),to=new Vec3(),q=new Quat();let lastTime=0,frozen=false;
 const direction=(bone:typeof spine,a:number[],b:number[],axis:number[])=>{if(!a||!b||a[2]<.5||b[2]<.5)return;from.set(...axis as [number,number,number]);to.set(b[0]-a[0],b[1]-a[1],.08).normalize();bone.setRotation(q.setFromDirections(from,to));};
 const poseRig=(pose:FreezePose)=>{const rig=Array.from({length:33},()=>[0,0,1]);rig[11]=[-.5,0,1];rig[12]=[.5,0,1];rig[13]=[-1,pose==='wide'?0:.5,1];rig[14]=[1,pose==='wide'?0:.5,1];rig[15]=[-1.6,pose==='wide'?0:1.5,1];rig[16]=[1.6,pose==='wide'?0:1.5,1];if(pose==='left'){rig[14]=[.7,-.4,1];rig[16]=[.8,-1,1];}if(pose==='right'){rig[13]=[-.7,-.4,1];rig[15]=[-.8,-1,1];}return rig;};
 return {model,root,update(rig:number[][],dancing:boolean,pose:FreezePose,t:number,celebrate:number,motion:boolean,lift=0){
  if(!dancing&&frozen)return;frozen=!dancing;lastTime=t;const target=pose==='free'?rig:poseRig(pose);
  arms.forEach(([upper,lower],side)=>{const shoulder=11+side,elbow=13+side,wrist=15+side;direction(upper,target[shoulder],target[elbow],[side?1:-1,0,0]);direction(lower,target[elbow],target[wrist],[side?1:-1,0,0]);});
  if(pose==='free')legs.forEach(([thigh,shin],side)=>{direction(thigh,rig[23+side],rig[25+side],[0,-1,0]);direction(shin,rig[25+side],rig[27+side],[0,-1,0]);});else legs.forEach(([thigh,shin])=>{thigh.setLocalEulerAngles(0,0,0);shin.setLocalEulerAngles(0,0,0);});
  const hips=rig[23]&&rig[24]?(rig[23][0]+rig[24][0])/2:0,lean=pose==='free'?Math.max(-8,Math.min(8,hips*5)):0;spine.setLocalEulerAngles(0,0,lean);pelvis.setLocalPosition(0,1.35+(pose==='free'?Math.max(-.2,Math.min(.05,lift*.2)):0),0);
  const cheer=motion&&celebrate>0?celebrate/1.4:0;head.setLocalEulerAngles(cheer*Math.sin(t*8)*5,0,-lean*.35);smile.setLocalScale(1+cheer*.12,1+cheer*.3,1);const blink=dancing&&motion&&(t+20)%4<.15?.14:1;eyes.forEach(e=>e.setLocalScale(1,blink,1));
 },state(){return {character:'rizzquake',mesh:'skinned-3d',time:lastTime,frozen,arm:arms.flatMap(a=>a.map(b=>b.getRotation().toString())).join('/'),legs:legs.map(l=>l[0].getRotation().toString()).join('/')};}};
}
