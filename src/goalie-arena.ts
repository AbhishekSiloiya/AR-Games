import {Color,Entity,Mesh,Texture,StandardMaterial,BLEND_MULTIPLICATIVE,SHADOW_PCF5_32F,CHUNKAPI_2_8} from 'playcanvas';
import {app,color,flat,lit,node,own,shapes,show,fade,type Scene} from './engine.ts';
import {keeperLayout,type KeeperSeat} from './goalie-rules.ts';
import {keeperStage,keeperArt} from './goalie-stages.ts';
const images=new Map<string,Promise<Texture>>();
export async function goalieArena(scene:Scene,n:number,stage=1){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const setting=keeperStage(stage),path=keeperArt(stage);let loading=images.get(path);if(!loading){loading=new Promise<Texture>((resolve,reject)=>app.assets.loadFromUrl(path,'texture',(err,a)=>err||!a?reject(err):resolve(a.resource as Texture)));images.set(path,loading);loading.catch(()=>images.delete(path));}const art=await loading;if(disposed)return null;
 scene.sky(setting.sky);scene.ambient(setting.ambient,.64);
 const mesh=own(new Mesh(app.graphicsDevice));mesh.setPositions([-35,-19.7,0,35,-19.7,0,35,19.7,0,-35,19.7,0]);mesh.setNormals([0,0,1,0,0,1,0,0,1,0,0,1]);mesh.setUvs(0,[0,1,1,1,1,0,0,0]);mesh.setIndices([0,1,2,0,2,3]);mesh.update();
 const back=flat('#ffffff');back.emissiveMap=art;back.update();const plate=node(scene.root,mesh,back,[0,0,-37]);plate.name='goalie-stadium-backplate';
 const mat=own(new StandardMaterial());mat.diffuse=color('#ffffff');mat.useSkybox=false;mat.shadowCatcher=true;mat.blendType=BLEND_MULTIPLICATIVE;mat.depthWrite=false;mat.shaderChunksVersion=CHUNKAPI_2_8;mat.getShaderChunks('glsl').set('litUserMainEndPS','gl_FragColor.rgb = mix(vec3(1.0), gl_FragColor.rgb, 0.45);');mat.update();const turf=node(scene.root,shapes.floor(40,45),mat,[0,-3.2,-10]);turf.render!.receiveShadows=true;
 const sun=scene.root.findByName('sun') as Entity|null;sun?.setEulerAngles(38,-35,0);if(sun?.light)Object.assign(sun.light,{color:color(setting.sun),intensity:setting.power,castShadows:true,shadowResolution:1024,shadowDistance:35,shadowType:SHADOW_PCF5_32F,normalOffsetBias:.025,shadowBias:.1});
 const fill=new Entity('goalie-sky-fill');fill.addComponent('light',{type:'directional',color:new Color(.75,.88,1),intensity:.3});fill.setEulerAngles(30,150,0);scene.root.addChild(fill);
 const post=lit('#fff3d5'),sleeve=lit('#2d6d70'),rope=flat('#fff8dc',{opacity:.58}),line=flat('#f5f0d3',{opacity:.6});
 const nets=Array.from({length:n},(_,p)=>{
  const l=keeperLayout(n,p),top=n===1?3.15:2.6,bottom=-3.12;
  for(const side of [-1,1]){node(scene.root,shapes.cylinder(.095,top-bottom,32),post,[l.cx+side*l.hw,(top+bottom)/2,.12]);node(scene.root,shapes.cylinder(.105,.65,32),sleeve,[l.cx+side*l.hw,bottom+.35,.12]);}
  const cross=node(scene.root,shapes.cylinder(.095,l.hw*2,40),post,[l.cx,top,.12]);cross.setLocalEulerAngles(0,0,90);
  node(scene.root,shapes.floor(l.hw*2,.065),line,[l.cx,bottom,.15]);
  const positions:number[]=[],indices:number[]=[],base:number[]=[];
  const strip=(x1:number,y1:number,x2:number,y2:number)=>{const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy),ox=-dy/d*.011,oy=dx/d*.011,at=positions.length/3;positions.push(x1+ox,y1+oy,2.65,x1-ox,y1-oy,2.65,x2-ox,y2-oy,2.65,x2+ox,y2+oy,2.65);indices.push(at,at+1,at+2,at,at+2,at+3);};
  for(let row=0;row<=14;row++)for(let col=0;col<22;col++)strip(l.cx-l.hw+col*l.hw*2/22,bottom+(top-bottom)*row/14,l.cx-l.hw+(col+1)*l.hw*2/22,bottom+(top-bottom)*row/14);
  for(let col=0;col<=22;col++)for(let row=0;row<14;row++)strip(l.cx-l.hw+col*l.hw*2/22,bottom+(top-bottom)*row/14,l.cx-l.hw+col*l.hw*2/22,bottom+(top-bottom)*(row+1)/14);
  base.push(...positions);const netMesh=own(new Mesh(app.graphicsDevice));netMesh.setPositions(positions);netMesh.setNormals(positions.map((_,i)=>i%3===2?1:0));netMesh.setIndices(indices);netMesh.update();const net=node(scene.root,netMesh,rope);net.name=`goalie-net-${p}`;net.enabled=false;return {net,netMesh,positions,base};
 });
 return {art:path,update(seats:KeeperSeat[],motion:boolean){nets.forEach((net,p)=>{const s=seats[p];if(!show(net.net,s.phase==='miss'))return;const impact=Math.sin(Math.min(1,s.age/.8)*Math.PI);for(let i=0;i<net.positions.length;i+=3){const d=Math.hypot(net.base[i]-s.tx,net.base[i+1]-s.ty);net.positions[i+2]=2.65+(motion?impact*.65*Math.exp(-d*d/5)*Math.cos(d*3-s.age*12):0);}net.netMesh.setPositions(net.positions);net.netMesh.update();fade(net.net,Math.max(0,.65*(1-s.age/1.15)));});}};
}
