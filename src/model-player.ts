// Authored, skinned player characters shared by games that need a complete animated avatar.
// The source asset is cached by the engine; each player owns a skeleton/anim graph and round-owned paint.
import type { AnimTrack, Asset, ContainerResource, MeshInstance, StandardMaterial } from 'playcanvas';
import { boundsOf, color, instantiate, node, own, show, type Scene } from './engine.ts';

export type ModelPlayerClip = 'Idle' | 'Running' | 'Walking' | 'Sitting' | 'Standing' | 'Punch' | 'Jump';
const CLIPS: ModelPlayerClip[] = ['Idle','Running','Walking','Sitting','Standing','Punch','Jump'];

export async function modelPlayer(scene: Scene, options: { name: string; x: number; y: number; z?: number; height: number; yaw?: number; color: string }) {
  let disposed=false;scene.cleanup(()=>{disposed=true;});
  const { entity: model, asset } = await instantiate('/assets/robot.glb');
  // A player may leave while the asset is loading. Do not attach to a dead scene or put paint in a new round's pool.
  if(disposed){model.destroy();return null;}
  const holder=node(scene.root);holder.name=options.name;
  const bounds=boundsOf(model), scale=options.height/(bounds.halfExtents.y*2);
  // Give every caller a predictable foot origin even if a future asset's bind pose is not centred.
  model.setLocalScale(scale,scale,scale);
  model.setLocalPosition(-bounds.center.x*scale,(-bounds.center.y+bounds.halfExtents.y)*scale,-bounds.center.z*scale);
  holder.setLocalEulerAngles(0,options.yaw??0,0);holder.addChild(model);
  const paints=new Map<StandardMaterial,StandardMaterial>();
  const meshes=(model.findComponents('render') as unknown as {meshInstances:MeshInstance[]}[]).flatMap(render=>render.meshInstances);
  for(const mesh of meshes) {
    const original=mesh.material as StandardMaterial;
    if(original.name!=='Main')continue;
    if(!paints.has(original)) {const paint=own(original.clone());paint.diffuse=color(options.color);paint.update();paints.set(original,paint);}
    mesh.material=paints.get(original)!;
  }
  const tracks=(asset.resource as ContainerResource&{animations:Asset[]}).animations.map(animation=>animation.resource as AnimTrack);
  const clips=new Map(CLIPS.map(name=>{const track=tracks.find(track=>track.name===name);if(!track)throw new Error(`Player animation missing: ${name}`);return[name,track] as const;}));
  model.addComponent('anim',{activate:true});
  const anim=model.anim!;
  anim.loadStateGraph({layers:[{name:'base',states:[{name:'START'},...CLIPS.map(name=>({name,speed:1,loop:['Idle','Running','Walking'].includes(name)}))],transitions:[{from:'START',to:'Idle',time:0,priority:0}]}],parameters:{}});
  for(const [name,track]of clips)anim.assignAnimation(name,track);
  const at={x:options.x,y:options.y,z:options.z??0};holder.setLocalPosition(at.x,at.y,at.z);
  let current:ModelPlayerClip='Idle';
  const play=(clip:ModelPlayerClip,speed=1,restart=false)=>{
    const layer=anim.baseLayer!;anim.playing=true;layer.playing=true;anim.speed=speed;
    if(current!==clip||restart){layer.transition(clip,.12);current=clip;}
  };
  return {
    at,holder,model,anim,
    get clip(){return current;},
    play,
    // Sitting is an authored standing-to-sitting action. Sampling it makes the knees follow the real squat,
    // rather than playing a canned exercise on a timer or stretching the mesh into a fake crouch.
    pose(clip:ModelPlayerClip,progress:number) {
      const layer=anim.baseLayer!;
      if(current!==clip){layer.transition(clip,0);current=clip;}
      anim.playing=true;anim.speed=1;layer.pause();
      layer.activeStateCurrentTime=clips.get(clip)!.duration*Math.max(0,Math.min(.999,progress));
    },
    place(x:number,y:number,z=at.z){at.x=x;at.y=y;at.z=z;holder.setLocalPosition(x,y,z);},
    show(visible:boolean){show(holder,visible);},
  };
}
