import {Mesh,Texture,ShaderMaterial,SEMANTIC_POSITION,PIXELFORMAT_RGBA8,FILTER_LINEAR,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';
import {app,flat,node,own,shapes,fade,type Scene} from './engine.ts';
import {feed} from './pose.ts';
let plateAsset:Promise<Texture>|undefined;
export async function freezeStudioScene(scene:Scene){
 let disposed=false;scene.cleanup(()=>{disposed=true;});const art=await(plateAsset??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/freeze/studio-v1.png','texture',(e,a)=>e||!a?reject(e):resolve(a.resource as Texture))));if(disposed)return null;
 scene.sky('#f5e8d7');scene.ambient('#fff4e3',.7);const look=flat('#ffffff');look.emissiveMap=art;look.update();const plate=own(new Mesh(app.graphicsDevice));plate.setPositions([-8,-4.5,0,8,-4.5,0,8,4.5,0,-8,4.5,0]);plate.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);plate.setUvs(0,[0,1,1,1,1,0,0,0]);plate.setIndices([0,1,2,0,2,3]);plate.update();node(scene.root,plate,look,[0,0,-5]);
 const video=feed.video,w=video?.videoWidth??0,h=video?.videoHeight??0,aspect=w&&h?w/h:4/3,height=Math.min(6.5,10.4/aspect),width=height*aspect;
 const frame=node(scene.root,shapes.quad(width+.1,height+.1),flat('#fff7e9'),[1.8,-.3,-1.2]);frame.name='freeze-camera-frame';
 let camera:{texture:Texture;material:ShaderMaterial}|undefined;
 if(video&&w&&h){const texture=own(new Texture(app.graphicsDevice,{name:'Freeze unfiltered live camera',width:w,height:h,format:PIXELFORMAT_RGBA8,mipmaps:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE}));
  const material=own(new ShaderMaterial({uniqueName:'moon-freeze-natural-feed',attributes:{vertex_position:SEMANTIC_POSITION},vertexGLSL:'attribute vec3 vertex_position; uniform mat4 matrix_model; uniform mat4 matrix_viewProjection; varying vec2 vUv; void main(){vUv=vec2(0.5-vertex_position.x,0.5-vertex_position.y);gl_Position=matrix_viewProjection*matrix_model*vec4(vertex_position,1.0);}',fragmentGLSL:'varying vec2 vUv;uniform sampler2D uFeed;void main(){gl_FragColor=vec4(texture2D(uFeed,vUv).rgb,1.0);}'}));material.setParameter('uFeed',texture);material.update();const surface=node(scene.root,shapes.quad(1,1),material,[1.8,-.3,-1]);surface.setLocalScale(width,height,1);surface.name='freeze-live-camera';camera={texture,material};
 }else{const panel=node(scene.root,shapes.quad(width,height),flat('#e6d9c6'),[1.8,-.3,-1]);panel.name='freeze-camera-unavailable';}
 const floorLook=flat('#91c4b8',{opacity:.4}),floor=Array.from({length:12},(_,i)=>{const tile=node(scene.root,shapes.quad(.66,.075),floorLook,[-7.2+i*1.2,-3.85,.5]);tile.setLocalEulerAngles(0,0,i%2?2:-2);return tile;});
 const sparkLook=flat('#fff9e8',{opacity:.5}),glints=Array.from({length:7},(_,i)=>{const e=node(scene.root,shapes.circle(.018+(i%3)*.008,12),sparkLook,[-5.6+(i%3)*.42,3.15+Math.floor(i/3)*.3,0]);return e;});
 return {state:{filter:'none',source:camera?'live-camera':'no-feed',width,height,aspect,visualTime:0},update(t:number,motion:boolean){if(camera&&video!.readyState>=2){camera.texture.setSource(video as unknown as HTMLCanvasElement);camera.texture.upload();}this.state.visualTime=t;floor.forEach((e,i)=>fade(e,motion?.2+(.5+.5*Math.sin(t*3.1-i*.75))*.25:.25));glints.forEach((e,i)=>fade(e,motion?.15+(.5+.5*Math.sin(t*.8+i))*.45:.25));}};
}
