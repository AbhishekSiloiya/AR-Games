import {Color,Entity,Mesh,Texture,StandardMaterial,SHADOW_PCF5_32F,BLEND_MULTIPLICATIVE,CHUNKAPI_2_8} from 'playcanvas';
import {app,color,flat,lit,node,own,shapes,type Scene} from './engine.ts';
import {jabStage} from './jab-presentation.ts';
const backdrops=new Map<string,Promise<Texture>>();
const texture=(url:string)=>{
 if(!backdrops.has(url))backdrops.set(url,new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl(url,'texture',(error,asset)=>error||!asset?reject(error):resolve(asset.resource as Texture))));
 return backdrops.get(url)!;
};
/** Baked architectural detail + a real-time shadow-catching floor. A fixed arena
 * camera makes this a cheap mobile alternative to modelling the distant city. */
export async function jabArena(scene:Scene,stage=1){
 const world=jabStage(stage);
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const image=await texture(world.art);if(disposed)return null;
 scene.sky('#d9e6df');scene.ambient(world.ambient,stage>=3?.65:.58);
 // All streams must exist before first upload: adding UVs to an already-uploaded
 // shared quad leaves TEXCOORD0 out of its GPU vertex format.
 const mesh=own(new Mesh(app.graphicsDevice));mesh.setPositions([-21.1,-11.9,0,21.1,-11.9,0,21.1,11.9,0,-21.1,11.9,0]);mesh.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);mesh.setUvs(0,[0,1,1,1,1,0,0,0]);mesh.setIndices([0,1,2,0,2,3]);mesh.update();
 const background=flat('#ffffff');background.emissiveMap=image;background.update();
 const plate=node(scene.root,mesh,background,[0,0,-18]);plate.name='jab-pavilion-backplate';
 const catcher=own(new StandardMaterial());catcher.diffuse=color('#ffffff');catcher.useSkybox=false;catcher.shadowCatcher=true;catcher.blendType=BLEND_MULTIPLICATIVE;catcher.depthWrite=false;
 catcher.shaderChunksVersion=CHUNKAPI_2_8;catcher.getShaderChunks('glsl').set('litUserMainEndPS','gl_FragColor.rgb = mix(vec3(1.0), gl_FragColor.rgb, 0.38);');catcher.update();
 const court=node(scene.root,shapes.floor(36,35),catcher,[0,-3.57,-4]);court.name='jab-shadow-mat';court.render!.receiveShadows=true;
 const fill=new Entity('jab-window-fill');fill.addComponent('light',{type:'directional',color:new Color(.83,.92,1),intensity:.35,castShadows:false});fill.setEulerAngles(25,-145,0);scene.root.addChild(fill);
 const key=scene.root.findByName('sun') as Entity|null;key?.setEulerAngles(42,-32,0);if(key?.light)Object.assign(key.light,{color:color(world.key),intensity:1,castShadows:true,shadowResolution:1024,shadowDistance:24,shadowType:SHADOW_PCF5_32F,normalOffsetBias:.025,shadowBias:.1,numCascades:1});
 let decorations=0;
 if(stage>=4){
  const pole=lit('#d9ccaa'),cloth=lit(world.accent),mark=flat('#fff3da');
  for(const sign of [-1,1]){
   const stand=node(scene.root);stand.name=`jab-event-side-${sign}`;stand.setLocalPosition(sign*7.25,-1.4,-3.4);
   node(stand,shapes.cylinder(.045,4.2,20),pole,[0,0,0]);
   node(stand,shapes.box(.85,1.55,.055),cloth,[-sign*.42,.9,0]);
   for(const y of [.58,.85,1.12]){const stripe=node(stand,shapes.box(.35,.045,.02),mark,[-sign*.42,y,.04]);stripe.setLocalEulerAngles(0,0,-sign*28);}
   node(stand,shapes.cylinder(.3,.065,24),pole,[0,-2.05,0]);decorations+=6;
  }
 }
 return {name:world.name,stage:world.stage,art:world.art,theme:world.theme,rendering:'baked architecture / realtime character, mitts, gloves and shadows',objects:2+decorations};
}
