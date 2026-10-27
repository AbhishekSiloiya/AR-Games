import {Color,Texture,Vec2,Quat, Vec3, ADDRESS_REPEAT,type MeshInstance, type StandardMaterial} from 'playcanvas';
import {app,instantiate,node,shapes,lit,flat,own,type Scene} from './engine.ts';
import {solveArm,type V3} from './jab-kinematics.ts';

export type MittTarget={x:number;y:number;z:number;active:boolean;hand:0|1};
let woolAsset:Promise<Texture>|undefined;
const woolTexture=()=>woolAsset??=(new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/wool.webp','texture',(error,asset)=>error||!asset?reject(error):resolve(asset.resource as Texture))));
export async function jabActor(scene:Scene,seat=0,n=1){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [{entity:model},wool]=await Promise.all([instantiate('/assets/moon/jab/rizzquake.glb'),woolTexture()]);
 if(disposed){model.destroy();return null;}
 const holder=node(scene.root);holder.name=`jab-rizzquake-${seat}`;
 const scale=n===1?1.48:1.34,cx=n===1?0:seat===0?-4:4;
 holder.setLocalPosition(cx,-3.55,-.8);holder.setLocalScale(scale,scale,scale);holder.addChild(model);
 const bones=(side:string)=>['UpperArm.','LowerArm.','Hand.'].map(name=>model.findByName(name+side)!);
 const arms=[bones('L'),bones('R')],spine=model.findByName('Spine')!,head=model.findByName('Head')!;
 const faceEyes=['L','R'].map(side=>model.findByName('Eye.'+side)!),brows=['L','R'].map(side=>model.findByName('Brow.'+side)!),smile=model.findByName('Smile')!;
 const footL=model.findByName('Foot.L')!,footR=model.findByName('Foot.R')!;
 const legs=['L','R'].map(side=>['Thigh.','Shin.','Foot.'].map(name=>model.findByName(name+side)!));
 const planted=[footL,footR].map(foot=>{const p=foot.getPosition();return [p.x,p.y,p.z] as V3;}),pelvis=model.findByName('Pelvis')!;
 const eyes=(model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[]).flatMap(r=>r.meshInstances);
 const weave=document.createElement('canvas');weave.width=weave.height=128;const ctx=weave.getContext('2d')!,pixels=ctx.createImageData(128,128);
 const height=(x:number,y:number)=>Math.sin(x*Math.PI/4+Math.sin(y*Math.PI/8)*1.7)*Math.cos(y*Math.PI/8)+Math.sin((x+y)*Math.PI/2)*.22;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;pixels.data[i]=128+(height(x-1,y)-height(x+1,y))*31;pixels.data[i+1]=128+(height(x,y-1)-height(x,y+1))*31;pixels.data[i+2]=245;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);const fabric=own(new Texture(app.graphicsDevice,{name:'Jab woven micro-normal',mipmaps:true,addressU:ADDRESS_REPEAT,addressV:ADDRESS_REPEAT}));fabric.setSource(weave);
 for(const component of model.findComponents('render') as unknown as {castShadows:boolean;receiveShadows:boolean}[]){component.castShadows=true;component.receiveShadows=true;}
 for(const mi of eyes){
  const original=mi.material as StandardMaterial,m=own(original.clone());
  const shiny=/eye|iris|pupil|catchlight/.test(original.name);m.useSkybox=false;m.useMetalness=false;m.specular=new Color(shiny?.25:.025,shiny?.25:.025,shiny?.25:.025);m.gloss=shiny?.65:.08;
  if(!shiny){wool.addressU=wool.addressV=ADDRESS_REPEAT;m.diffuseMap=wool;m.diffuseMapTiling=new Vec2(2,2);m.normalMap=fabric;m.normalMapTiling=new Vec2(9,9);m.bumpiness=.12;m.useSheen=true;m.sheen=new Color(.08,.08,.06);}
  m.update();mi.material=m;
 }
 const ball=shapes.sphere(1,32),disc=shapes.circle(1,48);
 const trim=lit('#24393d'),ivory=lit('#fff4dd'),tones=[lit('#ee795f'),lit('#368f95')],shadow=flat('#142d30',{opacity:.12});
 const mitts=arms.map((_,side)=>{
  const root=node(scene.root);root.name=`jab-mitt-${seat}-${side}`;
  const part=(look:StandardMaterial,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(root,ball,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  part(trim,0,0,-.10,.66,.79,.23);const face=part(tones[side],0,0,.04,.59,.71,.17);
  const ring=node(root,shapes.ring(.31,.34,48),ivory,[0,0,.213]);ring.setLocalScale(.95,1.2,1);
  const stamp=node(root,disc,ivory,[0,0,.216]);stamp.setLocalScale(.07,.07,1);
  root.setLocalScale(n===1?1:.78,n===1?1:.78,1);
  return {root,face,ring,impact:0};
 });
 const contact=node(scene.root,disc,shadow,[cx,-3.535,-.55]);contact.setLocalEulerAngles(-90,0,0);contact.setLocalScale(1.22,.58,1);
 const scratchA=new Vec3(),scratchB=new Vec3(),quat=new Quat();
 let lastTime=0;
 const neutral=():MittTarget[]=>[0,1].map(side=>({x:cx+(side?1.45:-1.45)*(n===1?1:.78),y:.55,z:.6,active:false,hand:side as 0|1}));
 let positions=neutral();
 return {
  holder,model,mitts,scale,cx,
  hit(side:number){mitts[side].impact=1;},
  update(t:number,dt:number,targets:MittTarget[]=neutral(),celebrate=0,duck=0,secondary=true){
   lastTime=t;const breathing=secondary?Math.sin(t*2.6):0;
   spine.setLocalEulerAngles(-2+breathing*.45-duck*8,0,secondary?celebrate*Math.sin(t*15)*2:0);
   head.setLocalEulerAngles(-1+breathing*.35,secondary?Math.sin(t*1.3)*1.2:0,secondary?celebrate*Math.sin(t*13)*5:0);
   const blinkAt=(t+12)%4,blink=secondary&&blinkAt<.22?Math.sin(blinkAt/.22*Math.PI):0;
   faceEyes.forEach(eye=>eye.setLocalScale(1,1-blink*.96,1));brows.forEach((brow,side)=>brow.setLocalEulerAngles(0,0,(side===0?-1:1)*(celebrate?7:2)));
   smile.setLocalScale(1+celebrate*.12,1+celebrate*.28,1);
   pelvis.setLocalPosition(0,1.35-duck*.24,0);
   legs.forEach(([thigh,shin,foot],side)=>{
    const hip=thigh.getPosition(),solved=solveArm([hip.x,hip.y,hip.z],planted[side],.54*scale,Math.hypot(.45,.08)*scale,0,[0,0,1]);
    scratchA.set(0,-1,0);scratchB.set(solved.elbow[0]-hip.x,solved.elbow[1]-hip.y,solved.elbow[2]-hip.z).normalize();thigh.setRotation(quat.setFromDirections(scratchA,scratchB));
    scratchA.set(0,-.45,.08).normalize();scratchB.set(solved.hand[0]-solved.elbow[0],solved.hand[1]-solved.elbow[1],solved.hand[2]-solved.elbow[2]).normalize();shin.setRotation(quat.setFromDirections(scratchA,scratchB));foot.setRotation(Quat.IDENTITY);
   });
   positions=targets.map((target,side)=>{
    const m=mitts[side];m.impact=Math.max(0,m.impact-dt*5);
    const [upper,lower,hand]=arms[side],sign=side===0?-1:1;
    const shoulder=upper.getPosition();const targetV:V3=[target.x,target.y, target.z-m.impact*.24];
    const solved=solveArm([shoulder.x,shoulder.y,shoulder.z],targetV,.74*scale,.76*scale,sign);
    scratchA.set(sign,0,0);scratchB.set(solved.elbow[0]-shoulder.x,solved.elbow[1]-shoulder.y,solved.elbow[2]-shoulder.z).normalize();
    upper.setRotation(quat.setFromDirections(scratchA,scratchB));
    scratchB.set(solved.hand[0]-solved.elbow[0],solved.hand[1]-solved.elbow[1],solved.hand[2]-solved.elbow[2]).normalize();lower.setRotation(quat.setFromDirections(scratchA,scratchB));
    hand.setRotation(Quat.IDENTITY);
    m.root.setPosition(solved.hand[0],solved.hand[1],solved.hand[2]+.4);m.root.setLocalEulerAngles(-m.impact*8,side===0?-5:5,(side===0?-1:1)*(target.active?-8:8));
    m.face.setLocalScale(.59+m.impact*.05,.71+m.impact*.025,.17-m.impact*.065);
    m.ring.enabled=target.active;m.face.setLocalPosition(0,0,.04-m.impact*.04);
    return {...target,x:solved.hand[0],y:solved.hand[1],z:solved.hand[2]};
   });
   return positions;
  },
  state(){return {time:lastTime,mesh:'skinned-3d',character:'rizzquake',mitts:positions,head:head.getLocalEulerAngles().toString(),leftArm:arms[0][0].getLocalRotation().toString(),rightArm:arms[1][0].getLocalRotation().toString(),feet:[footL,footR].map(foot=>{const p=foot.getPosition();return [p.x,p.y,p.z];})};},
 };
}
