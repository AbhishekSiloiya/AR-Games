// Articulated original Moodi follows the same latest rig that aims each arm shot.
import { node, W, type Scene } from './engine.ts';
import { playerCount, players, sim } from './pose.ts';
import { mascotPuppet } from './mascot-puppet.ts';
import type { Pad } from './kit.ts';
export function spaceRanger(scene:Scene,p:number,at:{x:number;y:number;scale:number}) {
 const home={...at},seat=playerCount()===2?.27+.46*p:.5,anchor=node(scene.root);anchor.name=`space-ranger-${p}`;
 const root=document.createElement('div');root.className='galaxy-pilot-rig';root.dataset.player=String(p);root.hidden=true;
 document.querySelector('.stage')?.append(root);const puppet=mascotPuppet(root,'moodi','Moodi and Quack — your body controls every limb');scene.cleanup(()=>root.remove());
 const pad:Pad={part:'head',side:0,x:0,y:0,vx:0,vy:0,seen:false},pads=[pad];let reactionUntil=-1,reaction='idle';
 return {at,pads,react(kind:'fire'|'hit'|'breach',t:number){reaction=kind;reactionUntil=t+.3;},update(t=0){
  const pl=players[p],rig=pl.rig,visible=pl.present&&rig.length===33;root.hidden=!visible;anchor.enabled=visible;if(!visible){pad.seen=false;return pads;}
  const off=sim?pl.lean*1.5:(pl.frame.x/pl.frame.aspect-seat)*W*.9;
  at.x=Math.max(-W/2+1.2,Math.min(W/2-1.2,home.x+off));at.y=home.y+pl.lift*at.scale;anchor.setLocalPosition(at.x,at.y,.6);
  const head=rig[0];pad.seen=!!head&&head[2]>.45;if(pad.seen)Object.assign(pad,{x:at.x+head[0]*at.scale,y:at.y+head[1]*at.scale,vx:(head[3]??0)*at.scale,vy:(head[4]??0)*at.scale});
  const active=t<reactionUntil;root.dataset.state=active?reaction:'tracking';puppet.world(at.x,at.y,at.scale);
  puppet.update(rig,t,active?Math.max(0,reactionUntil-t):0);return pads;
 }};
}
