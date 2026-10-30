import {Texture,Mesh,Entity,Color} from 'playcanvas';
import {app,node,own,flat,color,type Scene} from './engine.ts';
let art:Promise<Texture>|undefined;
export async function jackArena(scene:Scene){
 let disposed=false;scene.cleanup(()=>{disposed=true;});const image=await(art??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jacks/orbit-v1.png','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture))));if(disposed)return null;
 scene.sky('#254c83');scene.ambient('#cadff1',.64);
 const mesh=own(new Mesh(app.graphicsDevice));mesh.setPositions([-8,-4.5,0,8,-4.5,0,8,4.5,0,-8,4.5,0]);mesh.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);mesh.setUvs(0,[0,1,1,1,1,0,0,0]);mesh.setIndices([0,1,2,0,2,3]);mesh.update();const material=flat('#ffffff');material.emissiveMap=image;material.update();const plate=node(scene.root,mesh,material,[0,0,-18]);plate.name='jack-orbital-court';
 // Fixed orthographic camera: extend the painting enough for portrait and wide layouts.
 const key=scene.root.findByName('sun') as Entity|null;key?.setEulerAngles(38,-28,0);if(key?.light)Object.assign(key.light,{color:color('#ffedcf'),intensity:1.1});
 const fill=new Entity('jack-orbit-fill');fill.addComponent('light',{type:'directional',color:new Color(.58,.8,1),intensity:.4});fill.setEulerAngles(20,-145,0);scene.root.addChild(fill);
 const resize=()=>{const c=app.graphicsDevice.canvas,aspect=c.clientWidth/c.clientHeight;scene.camera.camera!.orthoHeight=Math.max(4.5,8/aspect);const k=Math.max(1,(8/aspect)/4.5,aspect/(16/9));plate.setLocalScale(k,k,1);};resize();window.addEventListener('resize',resize);scene.cleanup(()=>window.removeEventListener('resize',resize));
 return {art:'/assets/moon/jacks/orbit-v1.png',name:'Orbital sports club'};
}
