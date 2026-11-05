import {app,begin,mount,run,end} from '../src/engine.ts';
import {pace,effects} from '../src/pace.ts';
import {feed,players,trackingSeen} from '../src/pose.ts';
import {Texture} from 'playcanvas';
const stage=document.createElement('div');stage.className='stage';stage.style.cssText='position:relative;width:100vw;height:100vh;overflow:hidden';document.body.style.cssText='margin:0';document.body.append(stage);mount(stage);
const video=document.createElement('video');video.muted=true;video.playsInline=true;video.srcObject=await navigator.mediaDevices.getUserMedia({video:{width:640,height:360,frameRate:10}});await video.play();feed.video=video;
let cameraFrames=0,videoUploads=0,draws:number[]=[],shadows:number[]=[],frames:number[]=[],last=0;
const cameraTick=()=>{cameraFrames++;video.requestVideoFrameCallback(cameraTick);};video.requestVideoFrameCallback(cameraTick);
const setSource=Texture.prototype.setSource;Texture.prototype.setSource=function(source:any,...args:any[]){if(source===video)videoUploads++;return setSource.call(this,source,...args);};
const rig=Array.from({length:33},()=>[0,-1,1,0,0]);for(const [j,x,y]of [[0,0,1],[11,-.5,0],[12,.5,0],[13,-.7,-.65],[14,.7,-.65],[15,-.7,-1.4],[16,.7,-1.4],[23,-.3,-1.4],[24,.3,-1.4],[25,-.3,-2.2],[26,.3,-2.2],[27,-.3,-3],[28,.3,-3]])rig[j]=[x,y,1,0,0];
for(const p of players){p.present=true;p.rig=rig;p.body=rig.map(q=>[.5+q[0]*.1,.3-q[1]*.15,1]);p.frame={x:.89,y:.3,sw:.18,aspect:16/9};}
let current='',rounds=0;
const hud=Object.assign(()=>{},{p(){},flash(){},shake(){},pop(){},banner(){}}) as any;
const clear=()=>{videoUploads=0;cameraFrames=0;draws=[];shadows=[];frames=[];last=0;};
const avg=(v:number[])=>v.length?v.reduce((a,b)=>a+b)/v.length:0;
Object.assign(window,{__perfAudit:{app,pace,effects,clear,async load(id:string){end();stage.querySelectorAll(':scope > :not(canvas)').forEach(e=>e.remove());const game=await ({jab:()=>import('../src/games/jab.ts'),goalie:()=>import('../src/games/goalie.ts'),freeze:()=>import('../src/games/freeze.ts'),shapeup:()=>import('../src/games/shapeup.ts')}[id]!());const scene=begin(game.view);const update=await game.default({n:1,stage:1,mode:id==='slice'?'zen':'',team:false,best:0,scene,cleanup:scene.cleanup,onEnd(){},hud});current=id;rounds++;run(dt=>{trackingSeen[0]=performance.now();update(dt);});return current;},read(){const d=app.graphicsDevice as any;return {current,rounds,renderSize:[d.width,d.height],lean:pace.lean,effects:effects.on,frames:frames.length,frameMs:avg(frames),drawCalls:avg(draws),shadowDraws:avg(shadows),cameraFrames,videoUploads,lastShadow:app.stats.drawCalls.shadow,vram:{...app.stats.vram},lights:app.root.findComponents('light').map((l:any)=>({castShadows:l.castShadows,resolution:l.shadowResolution,type:l.shadowType})),assets:app.assets.list().length};},stop(){end();(video.srcObject as MediaStream).getTracks().forEach(t=>t.stop());}}});
app.on('frameend',()=>{const now=performance.now();if(last)frames.push(now-last);last=now;draws.push(app.stats.drawCalls.total);shadows.push(app.stats.drawCalls.shadow);});
