// A round-owned expressive pilot. The collision/shot rig remains calibrated to the player;
// the character art reacts immediately without smoothing or driving the game input.
import { node, toScreen, W, type Scene } from './engine.ts';
import { playerCount, players, sim } from './pose.ts';
import { effects } from './pace.ts';
import type { Pad } from './kit.ts';
import './galaxy-stage.css';
export function spaceRanger(scene:Scene,p:number,at:{x:number;y:number;scale:number}) {
  const home={...at},seat=playerCount()===2?.27+.46*p:.5;
  const anchor=node(scene.root);anchor.name=`space-ranger-${p}`;
  const root=document.createElement('div');root.className='galaxy-pilot';root.dataset.player=String(p);root.hidden=true;
  root.innerHTML='<div class="galaxy-pilot__aura"></div><img src="/assets/moon/play/moodi-idle.webp" alt="Moodi and Quack, your playful space pilot"/><span class="galaxy-pilot__name">MOODI & QUACK</span>';
  const image=root.querySelector('img')!;document.querySelector('.stage')?.append(root);
  const idle=new Image(),action=new Image();idle.src='/assets/moon/play/moodi-idle.webp';action.src='/assets/moon/play/moodi-action.webp';
  scene.cleanup(()=>root.remove());
  const pad:Pad={part:'head',side:0,x:0,y:0,vx:0,vy:0,seen:false},pads=[pad];let reactionUntil=-1,reaction='idle';
  return {at,pads,react(kind:'fire'|'hit'|'breach',t:number){reaction=kind;reactionUntil=t+.45;},update(t=0){
    const pl=players[p],rig=pl.rig;
    const visible=pl.present&&rig.length===33;root.hidden=!visible;anchor.enabled=visible;
    if(!visible){pad.seen=false;return pads;}
    const off=sim?pl.lean*1.5:(pl.frame.x/pl.frame.aspect-seat)*W*.9;
    at.x=Math.max(-W/2+1.2,Math.min(W/2-1.2,home.x+off));at.y=home.y+pl.lift*at.scale;
    anchor.setLocalPosition(at.x,at.y,.6);
    const head=rig[0];pad.seen=!!head&&head[2]>.45;
    if(pad.seen)Object.assign(pad,{x:at.x+head[0]*at.scale,y:at.y+head[1]*at.scale,vx:(head[3]??0)*at.scale,vy:(head[4]??0)*at.scale});
    const pos=toScreen(at.x,at.y,.6);if(!pos){root.hidden=true;return pads;}
    const active=t<reactionUntil,state=active?reaction:'idle';root.dataset.state=state;
    const src=active? action.src:idle.src;if(image.src!==src)image.src=src;
    root.style.left=`${pos[0]*100}%`;root.style.top=`${pos[1]*100}%`;root.style.width=`${playerCount()===2?24:28}%`;
    const motion=effects.on&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    image.style.transform=motion?`translateY(${Math.sin(t*3)*1.5}px) rotate(${active?(reaction==='breach'?5:-2):Math.sin(t*1.5)*.6}deg)`:'none';
    return pads;
  }};
}
