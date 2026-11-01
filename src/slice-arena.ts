import {Mesh,Texture} from 'playcanvas';
import {app,backdrop,flat,mirrorOn,node,own,type Scene} from './engine.ts';
let art:Promise<Texture>|undefined;
export async function sliceArena(scene:Scene){
 scene.sky('#e9efd9');scene.ambient('#fff2d8',.8);
 if(mirrorOn()){const camera=backdrop(scene,'dojo',true,true);camera.name='slice-natural-camera';return {source:'live-camera',natural:true};}
 let disposed=false;scene.cleanup(()=>{disposed=true;});const image=await(art??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/slice/orchard-v1.png','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture))));if(disposed)return null;
 const mesh=own(new Mesh(app.graphicsDevice));mesh.setPositions([-8,-4.5,0,8,-4.5,0,8,4.5,0,-8,4.5,0]);mesh.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);mesh.setUvs(0,[0,1,1,1,1,0,0,0]);mesh.setIndices([0,1,2,0,2,3]);mesh.update();const look=flat('#ffffff');look.emissiveMap=image;look.update();node(scene.root,mesh,look,[0,0,-20]).name='slice-orchard';return {source:'orchard',natural:true};
}
