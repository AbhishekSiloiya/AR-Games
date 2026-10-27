import {Color,StandardMaterial} from 'playcanvas';
import {node,own,color,shapes,show,type Scene} from './engine.ts';
import {players,predict} from './pose.ts';
import {zoneX,type StageHand} from './kit.ts';
// Jab-only glove rendering: fresh tracked positions, without another smoothing queue.
export function jabGloves(scene:Scene,n:number){
 const ball=shapes.sphere(1,32),box=shapes.box(1,1,1);
 const paint=(hex:string)=>{const m=own(new StandardMaterial());m.diffuse=color(hex);m.specular=new Color(.08,.08,.08);m.gloss=.28;m.useSkybox=false;m.update();return m;};
 const cream=paint('#fff0d6'),ink=paint('#34464a'),tones=[paint('#e97b65'),paint('#4b9da0')];
 const all=Array.from({length:n*2},(_,i)=>{
  const side=i%2,root=node(scene.root);root.name=`jab-player-glove-${i}`;
  const part=(look:StandardMaterial,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(root,ball,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  part(cream,0,.1,0,.49,.56,.36);part(cream,(side?1:-1)*.32,-.12,.08,.21,.29,.25);
  part(ink,0,-.42,-.04,.36,.19,.27);part(tones[side],0,-.40,.02,.35,.155,.28);
  const stripe=node(root,box,cream,[0,-.41,.297]);stripe.setLocalScale(.45,.045,.025);
  part(tones[side],0,.2,-.24,.43,.41,.05);
  root.setLocalScale(n===1?.95:.75,n===1?.95:.75,n===1?.95:.75);
  return {root,side,armed:true,was:false,state:{p:i>>1,x:0,y:0,px:0,py:0,speed:0,on:false,pts:new Float32Array(12)} as StageHand};
 });
 return {all,update(dt:number){return all.map(g=>{
  const pl=players[g.state.p],hand=pl.hands[g.side],s=g.state,at=predict(hand);
  s.on=pl.present&&hand.seen&&performance.now()-hand.t<350;show(g.root,s.on);
  if(!s.on){g.was=false;g.armed=false;return s;}
  const x=zoneX(n,s.p)+at.x*(n===1?4:2.4),y=1.05+at.y*2.4;
  s.px=g.was?s.x:x;s.py=g.was?s.y:y;s.x=x;s.y=y;
  if(g.was)s.pts.copyWithin(2,0,10);else for(let k=0;k<6;k++)s.pts.set([x,y],k*2);s.pts.set([x,y],0);
  const raw=Math.hypot(hand.vx*(n===1?4:2.4),hand.vy*2.4),travel=g.was?Math.hypot(x-s.px,y-s.py)/Math.max(dt,.01):0;
  s.speed=Math.max(raw,Math.min(35,travel));if(s.speed<2.3)g.armed=true;
  g.root.setLocalPosition(x,y,1.23);g.root.setLocalEulerAngles(-8,g.side===0?-12:12,(g.side===0?1:-1)*-8);
  g.was=true;return s;
 });}};
}
