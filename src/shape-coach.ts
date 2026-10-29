import {Color,Texture,Vec2,Quat,Vec3,type MeshInstance,type StandardMaterial} from 'playcanvas';
import {app,instantiate,node,own,flat,shapes,show,fade,type Scene} from './engine.ts';
import {SHAPE_STAND,shapeDirections} from './shape-quest.ts';
let wool:Promise<Texture>|undefined;
export async function shapeCoach(scene:Scene){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},fabric]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),wool??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture)))]);if(disposed){model.destroy();return null;}
 const root=node(scene.root);root.name='shape-rizzquake';root.setLocalPosition(4.8,-3.1,0);root.setLocalScale(1.1,1.1,1.1);root.addChild(model);
 for(const r of model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[])for(const mi of r.meshInstances){const m=own((mi.material as StandardMaterial).clone());m.useMetalness=false;m.useSkybox=false;m.useSheen=false;m.specular=new Color(.025,.025,.025);m.gloss=.1;if(!/eye|iris|pupil|catchlight/.test(m.name)){m.diffuseMap=fabric;m.diffuseMapTiling=new Vec2(2,2);}m.update();mi.material=m;}
 const find=(s:string)=>model.findByName(s)!,bones=['UpperArm.L','LowerArm.L','UpperArm.R','LowerArm.R','Thigh.L','Shin.L','Thigh.R','Shin.R'].map(find),feet=['L','R'].map(s=>find('Foot.'+s)),head=find('Head'),smile=find('Smile'),eyes=['L','R'].map(s=>find('Eye.'+s));
 const shadow=node(scene.root,shapes.circle(1,48),flat('#46685d',{opacity:.18}),[4.8,-3.17,-.2]);shadow.setLocalScale(1.6,.19,1);
 const rewardRing=node(scene.root,shapes.ring(1.15,1.19,64),flat('#d5a63e',{opacity:0}),[4.8,-3.16,.05]);const motes=Array.from({length:10},(_,i)=>node(scene.root,shapes.circle(.025+(i%3)*.012,12),flat(i%2?'#e3b84d':'#65bda3',{opacity:0})));
 const from=new Vec3(),to=new Vec3(),q=new Quat(),current=[...SHAPE_STAND];let serial=0,cheer=0,last=0;
 return {model,root,update(pose:number[],dt:number,t:number,reward:number,motion:boolean){
  if(reward>serial){cheer=1.2;serial=reward;}cheer=Math.max(0,cheer-dt);last=t;
  pose.forEach((a,i)=>current[i]+=Math.atan2(Math.sin(a-current[i]),Math.cos(a-current[i]))*(motion?1-Math.exp(-dt*12):1));
  const dirs=shapeDirections(current);root.setLocalPosition(4.8,-3.1,0);
  bones.forEach((bone,i)=>{from.set(...(i<4?[i<2?-1:1,0,0]:[0,-1,0]) as [number,number,number]);to.set(...dirs[i]);bone.setRotation(q.setFromDirections(from,to));});feet.forEach(f=>f.setRotation(Quat.IDENTITY));
  const bottom=Math.min(...feet.map(f=>f.getPosition().y));root.setLocalPosition(4.8,-3.1+(-3.05-bottom),0);
  const k=cheer/1.2;rewardRing.setLocalScale(1.1+(1-k)*.5,.16+(1-k)*.08,1);fade(rewardRing,motion?k*.65:0);motes.forEach((e,i)=>{if(show(e,motion&&cheer>0)){const a=i/10*Math.PI*2;e.setLocalPosition(4.8+Math.cos(a)*(1.25+(1-k)*.6),-2.9+(1-k)*1.4+Math.sin(a)*.3,.1);fade(e,k*.8);}});head.setLocalEulerAngles(0,0,motion?k*Math.sin(t*10)*5:0);smile.setLocalScale(1+k*.1,1+k*.25,1);eyes.forEach(e=>e.setLocalScale(1,motion&&(t+20)%4<.13?.15:1,1));
 },state(){return {character:'rizzquake',mesh:'skinned-3d',serial,time:last,angles:[...current],bones:bones.map(b=>b.getRotation().toString())};}};
}
