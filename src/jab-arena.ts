import {Color,Entity,Mesh,Texture,StandardMaterial,SHADOW_PCF5_32F,BLEND_MULTIPLICATIVE,CHUNKAPI_2_8} from 'playcanvas';
import {app,color,flat,node,own,shapes,type Scene} from './engine.ts';
let backdrop:Promise<Texture>|undefined;
const texture=()=>backdrop??=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl('/assets/moon/jab/pavilion.webp','texture',(error,asset)=>error||!asset?reject(error):resolve(asset.resource as Texture)));
/** Baked architectural detail + a real-time shadow-catching floor. A fixed arena
 * camera makes this a cheap mobile alternative to modelling the distant city. */
export async function jabArena(scene:Scene){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const image=await texture();if(disposed)return null;
 scene.sky('#d9e6df');scene.ambient('#fff6e5',.58);
 // All streams must exist before first upload: adding UVs to an already-uploaded
 // shared quad leaves TEXCOORD0 out of its GPU vertex format.
 const mesh=own(new Mesh(app.graphicsDevice));mesh.setPositions([-21.1,-11.9,0,21.1,-11.9,0,21.1,11.9,0,-21.1,11.9,0]);mesh.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);mesh.setUvs(0,[0,1,1,1,1,0,0,0]);mesh.setIndices([0,1,2,0,2,3]);mesh.update();
 const background=flat('#ffffff');background.emissiveMap=image;background.update();
 const plate=node(scene.root,mesh,background,[0,0,-18]);plate.name='jab-pavilion-backplate';
 const catcher=own(new StandardMaterial());catcher.diffuse=color('#ffffff');catcher.useSkybox=false;catcher.shadowCatcher=true;catcher.blendType=BLEND_MULTIPLICATIVE;catcher.depthWrite=false;
 catcher.shaderChunksVersion=CHUNKAPI_2_8;catcher.getShaderChunks('glsl').set('litUserMainEndPS','gl_FragColor.rgb = mix(vec3(1.0), gl_FragColor.rgb, 0.38);');catcher.update();
 const court=node(scene.root,shapes.floor(36,35),catcher,[0,-3.57,-4]);court.name='jab-shadow-mat';court.render!.receiveShadows=true;
 const fill=new Entity('jab-window-fill');fill.addComponent('light',{type:'directional',color:new Color(.83,.92,1),intensity:.35,castShadows:false});fill.setEulerAngles(25,-145,0);scene.root.addChild(fill);
 const key=scene.root.findByName('sun') as Entity|null;key?.setEulerAngles(42,-32,0);if(key?.light)Object.assign(key.light,{intensity:1,castShadows:true,shadowResolution:1024,shadowDistance:24,shadowType:SHADOW_PCF5_32F,normalOffsetBias:.025,shadowBias:.1,numCascades:1});
 return {name:'daylight-pavilion',rendering:'baked architecture / realtime character, mitts, gloves and shadows',objects:2};
}
