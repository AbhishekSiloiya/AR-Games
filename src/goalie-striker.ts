import {Color,Texture,Vec2,type StandardMaterial,type MeshInstance} from 'playcanvas';
import {app,instantiate,node,own,flat,shapes,type Scene} from './engine.ts';
import {keeperLayout,type KeeperSeat} from './goalie-rules.ts';
let wool:Promise<Texture>|undefined;
export async function goalieStriker(scene:Scene,p:number,n:number){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},fabric]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),wool??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(err,a)=>err||!a?reject(err):resolve(a.resource as Texture)))]);if(disposed){model.destroy();return null;}
 const l=keeperLayout(n,p),scale=n===1?1.5:1.12,root=node(scene.root);root.name=`goalie-rizzquake-${p}`;root.setLocalPosition(l.cx-.18,-3.25,-14.5);root.setLocalScale(scale,scale,scale);root.addChild(model);
 for(const r of model.findComponents('render') as unknown as {meshInstances:MeshInstance[];castShadows:boolean;receiveShadows:boolean}[]){r.castShadows=r.receiveShadows=true;for(const mi of r.meshInstances){const original=mi.material as StandardMaterial,m=own(original.clone());m.useSkybox=false;m.useMetalness=false;m.specular=new Color(.025,.025,.025);m.gloss=.08;if(!/eye|iris|pupil|catchlight/.test(m.name)){m.diffuseMap=fabric;m.diffuseMapTiling=new Vec2(2,2);m.useSheen=true;m.sheen=new Color(.06,.07,.06);}m.update();mi.material=m;}}
 const find=(name:string)=>model.findByName(name)!,spine=find('Spine'),head=find('Head'),pelvis=find('Pelvis'),smile=find('Smile'),eyes=['L','R'].map(s=>find('Eye.'+s));
 const arms=['L','R'].map(s=>[find('UpperArm.'+s),find('LowerArm.'+s)]),thigh=find('Thigh.R'),shin=find('Shin.R'),foot=find('Foot.R');
 const shadow=node(scene.root,shapes.circle(1,48),flat('#143f2e',{opacity:.18}),[l.cx,-3.19,-14.2]);shadow.setLocalEulerAngles(-90,0,0);shadow.setLocalScale(1.3,.7,1);
 let kick=0,lastTime=0;
 return {model,root,kick(){kick=.6;},update(s:KeeperSeat,t:number,dt:number,motion:boolean){
  kick=Math.max(0,kick-dt);const launch=s.phase==='windup'?Math.max(0,Math.min(1,(s.age-.65)/.2)):0,wind=s.phase==='windup'?Math.min(1,s.age/.65)*(1-launch):0,follow=s.phase==='windup'?launch:kick/.6,save=s.phase==='saved'?Math.max(0,1-s.age):0,celebrate=motion&&s.saves>0&&(t>=60||s.phase==='saved'&&s.streak%5===0)?1:0,miss=s.phase==='miss'?Math.max(0,1-s.age):0;
  lastTime=t;pelvis.setLocalPosition(-wind*.08,1.35,0);spine.setLocalEulerAngles(wind*9-follow*8,wind*-8,save*4);head.setLocalEulerAngles(-wind*5+miss*-8,Math.max(-9,Math.min(9,(s.tx-l.cx)*2)),save*-7);smile.setLocalScale(1+miss*.08,1+miss*.25,1);
  arms.forEach(([upper,lower],i)=>{upper.setLocalEulerAngles(wind*(i?14:-10),0,(i?-1:1)*(55-save*13+miss*12-celebrate*42));lower.setLocalEulerAngles(0,wind*(i?-16:16),(i?1:-1)*(22+celebrate*55));});
  thigh.setLocalEulerAngles(wind*32-follow*62,0,0);shin.setLocalEulerAngles(-wind*30+follow*20,0,0);foot.setLocalEulerAngles(-follow*10,0,0);
  const blink=motion&&(t+20)%4<.15?.14:1;eyes.forEach(e=>e.setLocalScale(1,blink,1));if(motion)root.setLocalEulerAngles(0,Math.sin(t*.7)*.7,0);
 },state(){return {time:lastTime,mesh:'skinned-3d',character:'rizzquake',leg:thigh.getLocalEulerAngles().toString(),arm:arms[0][0].getLocalRotation().toString()};}};
}
