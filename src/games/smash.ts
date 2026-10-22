import { robotArrival, incomingState, launchIncoming, stepIncoming, hitIncoming } from '../smash-wave.ts';
import { debrisStep, throwDebris, type Debris } from '../wreckage.ts';
import type { Entity } from 'playcanvas';
// Smash — break a scrapyard robot's armour, then finish its exposed core.
// Contact is swept along deliberate hand swings; visual debris needs no physics world.
import { bossState, coreImpact, plateImpact, punchTrigger } from '../demolition-rules.ts';
import { sim } from '../pose.ts';
import { backdrop, fade, flat, lit, node, shapes, show, tint } from '../engine.ts';
import { bursts as makeBursts, hands as makeHands, hitSound, music, round, scoreHud, segDist, sfx, zoneX, type Game } from '../kit.ts';
const ROUND=45;
const PANELS=[
  {name:'Helmet',x:0,y:2.3,w:1.6,h:.65},
  {name:'Left shoulder',x:-1.4,y:.9,w:.9,h:1.0},
  {name:'Right shoulder',x:1.4,y:.9,w:.9,h:1.0},
  {name:'Chest',x:0,y:.35,w:1.5,h:1.25},
  {name:'Left knee',x:-.65,y:-1.65,w:.8,h:.9},
  {name:'Right knee',x:.65,y:-1.65,w:.8,h:.9},
];
export default function smash({n,stage,onEnd,hud,scene,cleanup}:Game){
  backdrop(scene,'studio');
  const box=shapes.box(1,1,1),ball=shapes.sphere(1,12),limb=shapes.capsule(.26,1.7);
  const steel=lit('#38536c'),dark=lit('#172c42'),chrome=lit('#c5dae4'),orange=lit('#ff9e52'),blue=lit('#5fbee9');
  const ink=flat('#102136'),neon=flat('#75f5df'),yellow=flat('#ffe071'),red=lit('#ff617e',{emissive:'#ff617e',glow:.7});
  // A repair hangar: recessed wall panels and a striped floor keep the target readable.
  for(let i=0;i<8;i++){const e=node(scene.root,box,dark,[(i-3.5)*2.1,.8,-3]);e.setLocalScale(.025,7,.1);}
  const floor=node(scene.root,box,steel,[0,-3.35,-.2]);floor.setLocalScale(16,.22,1.3);
  for(let i=0;i<20;i++){const e=node(scene.root,box,i%2?ink:yellow,[(i-9.5)*.8,-3.2,.5]);e.setLocalScale(.55,.08,.05);e.setLocalEulerAngles(0,0,-25);}
  const area={cx:(p:number)=>zoneX(n,p),hw:n===1?3.3:3,hh:3.1,cy:0};
  const scale=n===1?1.05:.92;
  const bosses=Array.from({length:n},(_,p)=>{
    const root=node(scene.root);root.name=`smash-robot-${p}`;root.setLocalPosition(area.cx(p),0,0);root.setLocalScale(scale,scale,scale);
    const parts:{e:Entity;owner:number;home:[number,number,number];angles:[number,number,number];homeScale:[number,number,number];halfWidth:number;halfHeight:number;motion:Debris|null}[]=[];
    let owner=3;
    const piece=(mesh:typeof box,look:typeof steel,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(root,mesh,look,[x,y,z]);e.setLocalScale(sx,sy,sz);if(owner>=0){e.name=`smash-structure-${p}-${parts.length}`;parts.push({e,owner,home:[x,y,z],angles:[0,0,0],homeScale:[sx,sy,sz],halfWidth:(mesh===box?.5:mesh===ball?1:.26)*sx,halfHeight:(mesh===box?.5:mesh===ball?1:.85)*sy,motion:null});}return e;};
    piece(box,dark,0,.45,-.1,1.55,2.15,.5);owner=0;piece(box,steel,0,2.1,-.1,1.35,.9,.5);
    owner=3;piece(box,chrome,0,-.7,.1,1.65,.22,.5);owner=0;piece(box,steel,0,1.58,0,.4,.3,.3);
    for(const side of [-1,1]){
      owner=side<0?1:2;
      piece(ball,dark,side*1.05,1.05,-.1,.35,.35,.3);
      const arm=piece(limb,steel,side*1.4,.3,-.1,1,1,1);arm.setLocalEulerAngles(0,0,side*12);parts[parts.length-1].angles=[0,0,side*12];
      piece(ball,dark,side*1.6,-.45,.0,.37,.4,.3);
      owner=side<0?4:5;
      piece(limb,steel,side*.65,-1.8,-.1,1,1.2,1);piece(box,dark,side*.65,-2.8,.05,1.02,.4,.7);piece(box,neon,side*.65,-2.65,.43,.6,.06,.04);
      owner=0;piece(ball,chrome,side*.83,2.15,-.1,.16,.28,.22);piece(box,neon,side*.26,1.91,.53,.3,.08,.04);
    }
    owner=0;piece(box,ink,0,1.8,.25,.55,.05,.04);piece(box,chrome,0,2.85,-.1,.07,.55,.08);piece(ball,neon,0,3.13,-.1,.13,.13,.12);
    owner=-1;
    const core=piece(ball,red,0,.55,.4,.48,.48,.24);core.name=`smash-core-${p}`;
    const coreRing=piece(shapes.ring(.6,.66,32),neon,0,.55,.7,1,1,1);
    const shock=piece(shapes.ring(.9,1,48),flat('#ffe071',{opacity:1}),0,.55,1.2,1,1,1);shock.name=`smash-blast-${p}`;shock.enabled=false;
    const embers=Array.from({length:8},(_,i)=>{const e=piece(ball,i%2?neon:red,0,.55,.7,.16,.16,.12);e.enabled=false;return {e,motion:null as Debris|null};});
    const armour=PANELS.map((spec,i)=>{
      const e=node(root);e.name=`smash-armour-${p}-${i}`;e.setLocalPosition(spec.x,spec.y,.3);
      const face=node(e,box,p?blue:orange);face.setLocalScale(spec.w,spec.h,.32);
      for(const side of [-1,1]){const rivet=node(e,ball,chrome,[side*spec.w*.36,spec.h*.28,.19]);rivet.setLocalScale(.055,.055,.03);}
      const cracks=[-28,31].map((angle,k)=>{const cut=node(e,box,ink,[k*.15-.07,0,.19]);cut.setLocalScale(.035,spec.h*.7,.02);cut.setLocalEulerAngles(0,0,angle);return cut;});
      const ring=node(root,shapes.ring(.58,.64,32),yellow,[spec.x,spec.y,.65]);
      const shards=[-1,1].map(side=>{const shard=node(root,box,p?blue:orange);shard.setLocalScale(spec.w*.48,spec.h,.18);shard.enabled=false;shard.name=`smash-shard-${p}-${i}-${side}`;return {e:shard,side,homeScale:[spec.w*.48,spec.h,.18] as [number,number,number],motion:null as Debris|null};});
      return {...spec,e,face,cracks,ring,shards,flash:0,shake:0};
    });
    return {root,core,coreRing,shock,embers,parts,wreckage:[...parts,...embers],blast:0,armour,state:bossState(stage,0),arrivalStart:0,ready:false,recoil:0,pose:{x:area.cx(p),y:0,scale},score:0,wave:0,broken:0,kills:0,weak:0,nextWeak:2.4,rebuild:0};
  });
  // Two reusable cargo slots per player, alternating outside the robot's silhouette.
  const incoming=Array.from({length:n*2},(_,i)=>{
    const p=Math.floor(i/2),side=i%2?1:-1,root=node(scene.root);root.name=`smash-incoming-${i}`;
    const body=node(root),kind=i%2?'drone':'crate';
    const shell=node(body,kind==='drone'?ball:box,kind==='drone'?blue:orange);shell.setLocalScale(kind==='drone'?.43:.68,kind==='drone'?.28:.68,.35);
    if(kind==='drone')for(const sign of [-1,1]) {const rotor=node(body,shapes.ring(.16,.23,16),chrome,[sign*.46,.15,.1]);rotor.setLocalScale(1,.4,1);}
    const stripe=node(body,box,yellow,[0,0,.36]);stripe.setLocalScale(kind==='drone'?.5:.1,kind==='drone'?.07:.65,.03);
    const cross=node(body,box,neon,[0,0,.38]);cross.setLocalScale(kind==='drone'?.14:.65,kind==='drone'?.12:.1,.03);
    const ring=node(scene.root,shapes.ring(.56,.61,32),yellow);ring.name=`smash-warning-${i}`;
    const shards=[-1,1].map(sign=>{const e=node(scene.root,box,kind==='drone'?blue:orange);e.setLocalScale(.3,.55,.2);e.enabled=false;return {e,sign,motion:null as Debris|null};});
    root.enabled=false;ring.enabled=false;
    return {root,body,ring,shards,state:incomingState(),kind,p,side,x:0,y:0,scale:1};
  });
  const cargoClock=Array.from({length:n},()=>({next:3.2,slot:0}));
  // Broken pieces become independent world-space objects: later recoil cannot drag settled scrap.
  const detach=(e:Entity,b:typeof bosses[number],side:number,power:number,halfWidth:number,halfHeight:number)=>{
    const position=e.getPosition(), x=position.x,y=position.y,z=position.z, angle=e.getLocalEulerAngles().z;
    const size=e.getLocalScale(),sx=size.x*b.pose.scale,sy=size.y*b.pose.scale,sz=size.z*b.pose.scale;
    e.reparent(scene.root);e.setLocalPosition(x,y,z);e.setLocalScale(sx,sy,sz);e.setLocalEulerAngles(0,0,angle);
    const motion=throwDebris(x,y,z,side,power*b.pose.scale,halfWidth*b.pose.scale,halfHeight*b.pose.scale);motion.angle=angle;return motion;
  };
  const stepLoose=(motion:Debris,p:number,dt:number)=>{
    motion.x-=area.cx(p);debrisStep(motion,dt,n===1?7.5:3.6);motion.x+=area.cx(p);
  };

  let elapsed=-3;
  if(import.meta.env.DEV||sim){Object.assign(window,{__smashBoss:{bosses,area,incoming,get time(){return elapsed;}}});cleanup(()=>{delete (window as Window&{__smashBoss?:unknown}).__smashBoss;});}
  const hands=makeHands(scene,n,area),triggers=Array.from({length:n*2},()=>punchTrigger()),bursts=makeBursts(scene.root);
  const tick=round(hud,ROUND,()=>{music.stop();onEnd(bosses.map(b=>b.score),bosses.map(b=>[`${b.kills} robots demolished`,`${b.broken} armour plates broken`]));});
  music.start('arcade');
  const rebuild=(b:typeof bosses[number],now:number)=>{
    b.state=bossState(stage,b.wave);b.arrivalStart=now;b.ready=false;b.recoil=0;b.root.enabled=true;b.rebuild=0;b.weak=0;b.nextWeak=2.4;
    b.blast=0;b.parts.forEach(q=>{q.motion=null;q.e.reparent(b.root);q.e.setLocalScale(...q.homeScale);q.e.enabled=true;q.e.setLocalPosition(...q.home);q.e.setLocalEulerAngles(...q.angles);});b.embers.forEach(q=>{q.motion=null;q.e.reparent(b.root);q.e.setLocalScale(.16,.16,.12);q.e.setLocalPosition(0,.55,.7);q.e.setLocalEulerAngles(0,0,0);q.e.enabled=false;});
    b.armour.forEach(a=>{a.e.enabled=true;a.e.setLocalPosition(a.x,a.y,.3);a.e.setLocalEulerAngles(0,0,0);a.flash=a.shake=0;a.shards.forEach(q=>{q.motion=null;q.e.reparent(b.root);q.e.setLocalScale(...q.homeScale);q.e.enabled=false;});});
  };
  return(rawDt:number)=>{
    const dt=Math.min(rawDt,.05),t=tick(rawDt);if(t===null)return;elapsed=t;
    // Apply approach and recoil before collision, so contacts follow the visible robot.
    bosses.forEach((b,p)=>{
      if(b.rebuild&&t>=b.rebuild)rebuild(b,t);
      const arrival=robotArrival(t,b.arrivalStart), ease=arrival.progress*arrival.progress*(3-2*arrival.progress);
      b.ready=arrival.ready;b.recoil=Math.max(0,b.recoil-dt);
      if(!b.state.defeated){
        b.pose.x=area.cx(p)+Math.sin(t*1.9+p)*.08*ease;
        b.pose.y=Math.sin(t*2.8+p)*.025*ease;
        b.pose.scale=scale*(.22+.78*ease)*(1-.08*b.recoil/.23);
        b.root.setLocalPosition(b.pose.x,b.pose.y,-5*(1-ease));b.root.setLocalScale(b.pose.scale,b.pose.scale,b.pose.scale);
      }
      const clock=cargoClock[p];
      if(t>=clock.next&&!incoming.some(q=>q.p===p&&q.state.phase!=='idle')){
        const q=incoming[p*2+(clock.slot++%2)];launchIncoming(q.state);
        q.x=area.cx(p)+q.side*(n===1?2.65:2.45);q.y=clock.slot%2?1.55:-.45;
        clock.next=t+5.8;hud.pop(q.x,q.y-.75,'INCOMING!','#ffe071');sfx('powerUp',{vol:.3});
      }
    });
    for(const q of incoming){
      stepIncoming(q.state,dt);const phase=q.state.phase,visible=phase==='approach'||phase==='ready';
      show(q.root,visible);show(q.ring,phase==='warning'||visible);
      q.scale=phase==='approach'?.18+.82*Math.min(1,q.state.age):1;
      q.y+=phase==='ready'?Math.sin(t*3+q.p)*dt*.035:0;
      q.root.setLocalPosition(q.x,q.y,phase==='approach'?-4+5.1*Math.min(1,q.state.age):1.1);q.root.setLocalScale(q.scale,q.scale,q.scale);
      q.body.setLocalEulerAngles(0,0,phase==='approach'?Math.sin(q.state.age*8)*12:Math.sin(t*3)*4);
      q.ring.setLocalPosition(q.x,q.y,.9);const pulse=1+.08*Math.sin(t*8);q.ring.setLocalScale(pulse,pulse,1);
      for(const shard of q.shards){
        show(shard.e,phase==='broken'&&!!shard.motion);
        if(phase==='broken'&&shard.motion){stepLoose(shard.motion,q.p,dt);shard.e.setLocalPosition(shard.motion.x,shard.motion.y,shard.motion.z);shard.e.setLocalEulerAngles(0,0,shard.motion.angle);}
        if(phase==='idle')shard.motion=null;
      }
    }
    const handStates=hands.update(dt);
    handStates.forEach((h,i)=>{
      if(!triggers[i](h.speed,t,h.on)||t<0)return;
      const cargo=incoming.find(q=>q.p===h.p&&q.state.phase==='ready'&&segDist(q.x,q.y,h.px,h.py,h.x,h.y)<.65);
      if(cargo&&hitIncoming(cargo.state)){
        triggers[i].consume(t);const points=cargo.kind==='crate'?3:2;bosses[h.p].score+=points;
        cargo.root.enabled=false;cargo.ring.enabled=false;
        for(const q of cargo.shards){q.motion=throwDebris(cargo.x+q.sign*.15,cargo.y,1.2,q.sign,3,.15,.275);q.e.setLocalPosition(q.motion.x,q.motion.y,q.motion.z);q.e.setLocalEulerAngles(0,0,0);q.e.enabled=true;}
        bursts.burst(cargo.x,cargo.y,1.3,'#ffe071',20,6);hud.pop(cargo.x,cargo.y+.55,`SMASH +${points}`,'#ffe071');hitSound('impactMetal_heavy',0,.55);return;
      }
      const b=bosses[h.p];if(b.state.defeated||!b.ready)return;
      const cx=b.pose.x,cy=b.pose.y,s=b.pose.scale,intact=b.state.armour.some(Boolean);
      if(intact){
        let hit=-1,closest=Infinity;
        b.armour.forEach((a,k)=>{if(!b.state.armour[k])return;const pos=a.e.getLocalPosition(),d=segDist(cx+pos.x*s,cy+pos.y*s,h.px,h.py,h.x,h.y),radius=(Math.max(a.w,a.h)*.45+.2)*s;if(d<radius&&d/radius<closest){closest=d/radius;hit=k;}});
        if(hit<0)return;
        triggers[i].consume(t);
        const a=b.armour[hit],result=plateImpact(b.state,hit,hit===b.weak);b.score+=result.points;a.flash=.2;a.shake=.18;
        b.recoil=.23;const x=cx+a.x*s,y=cy+a.y*s;
        bursts.burst(x,y,.9,result.broken?'#ffe071':'#9af9ee',result.broken?24:9,result.broken?7:4);hitSound(result.broken?'impactMetal_heavy':'impactPunch_medium',b.broken,.65);
        if(result.broken){
          b.broken++;a.shards.forEach(q=>{q.e.setLocalPosition(a.x+q.side*a.w*.22,a.y,.55);q.motion=detach(q.e,b,q.side,3.6,a.w*.24,a.h*.5);q.e.enabled=true;});
          b.parts.filter(q=>q.owner===hit).forEach((q,k)=>{const pos=q.e.getLocalPosition();q.motion=detach(q.e,b,(pos.x||k%2-.5)<0?-1:1,2.4+k%3,q.halfWidth,q.halfHeight);});
          hud.pop(x,y+.4,'SMASH!','#ffe071');hud.shake(.15);
          if(!b.state.armour.some(Boolean)){hud.banner('FINISH THE CORE!',1100);sfx('powerUp',{vol:.65});}
        }else hud.pop(x,y+.3,'CRACK!','#9af9ee');
      }else if(segDist(cx,cy+.55*s,h.px,h.py,h.x,h.y)<.8*s){
        triggers[i].consume(t);
        b.recoil=.23;const result=coreImpact(b.state);b.score+=result.points;hitSound('impactMetal_heavy',b.kills*2,.8);bursts.burst(cx,cy+.55*s,1,'#ff718d',result.defeated?70:16,result.defeated?10:5);
        if(result.defeated){b.kills++;b.wave++;b.rebuild=t+3;b.blast=1.1;
          b.parts.filter(q=>!q.motion).forEach((q,k)=>{q.motion=detach(q.e,b,k%2?1:-1,4+k%3,q.halfWidth,q.halfHeight);});
          b.embers.forEach((q,k)=>{q.e.setLocalPosition(0,.55,.8);q.motion=detach(q.e,b,k%2?1:-1,2+k*.65,.16,.16);q.motion.vy=2+k*.7;q.e.enabled=true;});
          hud.banner('ROBOT DESTROYED!',1400);hud.pop(cx,-.5,'DEMOLITION +10','#ffe071');hud.shake(.65);sfx('confirmation');sfx('impactMetal_heavy',{vol:.8,rate:.6});}
      }
    });
    bosses.forEach((b,p)=>{
      const remaining=b.state.armour.filter(Boolean).length,exposed=remaining===0&&!b.state.defeated;
      if(t>=0)b.nextWeak-=dt;if(b.nextWeak<=0||!b.state.armour[b.weak]){for(let k=1;k<=6;k++){const next=(b.weak+k)%6;if(b.state.armour[next]){b.weak=next;break;}}b.nextWeak=2.4;}
      b.armour.forEach((a,k)=>{
        const hp=b.state.armour[k];a.flash=Math.max(0,a.flash-dt);
        tint(a.face,a.flash>0?'#fff2bd':hp<b.state.maxArmour?'#b76a52':p?'#5fbee9':'#ff9e52','diffuse');
        a.cracks.forEach((cut,j)=>show(cut,hp>0&&hp<b.state.maxArmour-j));
        a.shake=Math.max(0,a.shake-dt);a.e.setLocalPosition(a.x+Math.sin(a.shake*100)*a.shake*.4,a.y,.3);
        for(const q of a.shards)if(q.motion){stepLoose(q.motion,p,dt);q.e.setLocalPosition(q.motion.x,q.motion.y,q.motion.z);q.e.setLocalEulerAngles(0,0,q.motion.angle);}
        show(a.e,hp>0);show(a.ring,t>=0&&hp>0&&k===b.weak);const pulse=1+.07*Math.sin(t*5);a.ring.setLocalScale(pulse,pulse,1);
      });
      show(b.core,exposed);show(b.coreRing,exposed);const pulse=1+.09*Math.sin(t*6);b.core.setLocalScale(.48*pulse,.48*pulse,.24);b.coreRing.rotateLocal(0,0,dt*30);
      for(const q of b.wreckage)if(q.motion){stepLoose(q.motion,p,dt);q.e.setLocalPosition(q.motion.x,q.motion.y,q.motion.z);q.e.setLocalEulerAngles(0,0,q.motion.angle);}
      b.blast=Math.max(0,b.blast-dt);if(show(b.shock,b.blast>0)){const radius=1+(1.1-b.blast)*5;b.shock.setLocalScale(radius,radius,1);fade(b.shock,b.blast/1.1);}
      hud.p('h',p,t<0?'Incoming robots and cargo · punch when close':b.state.defeated?'Demolished! Next robot…':!b.ready?'INCOMING ROBOT · get ready!':incoming.some(q=>q.p===p&&q.state.phase==='ready')?'BONUS CARGO READY · punch the side target!':exposed?`CORE · ${b.state.core} hits left`:`Robot ${b.wave+1} · ${remaining} plates · ${b.armour[b.weak].name}`);
    });
    bursts.update(dt);scoreHud(hud,n,bosses.map(b=>b.score));music.intensity(.35+Math.min(.5,bosses.reduce((a,b)=>a+b.broken,0)*.035));
  };
}
