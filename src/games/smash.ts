// Smash — break a scrapyard robot's armour, then finish its exposed core.
// Contact is swept along deliberate hand swings; visual debris needs no physics world.
import { bossState, coreImpact, plateImpact, punchTrigger } from '../demolition-rules.ts';
import { sim } from '../pose.ts';
import { backdrop, flat, lit, node, shapes, show, tint } from '../engine.ts';
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
    const piece=(mesh:typeof box,look:typeof steel,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(root,mesh,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
    piece(box,dark,0,.45,-.1,1.55,2.15,.5);piece(box,steel,0,2.1,-.1,1.35,.9,.5);
    piece(box,chrome,0,-.7,.1,1.65,.22,.5);piece(box,steel,0,1.58,0,.4,.3,.3);
    for(const side of [-1,1]){
      piece(ball,dark,side*1.05,1.05,-.1,.35,.35,.3);
      piece(limb,steel,side*1.4,.3,-.1,1,1,1).setLocalEulerAngles(0,0,side*12);
      piece(ball,dark,side*1.6,-.45,.0,.37,.4,.3);
      piece(limb,steel,side*.65,-1.8,-.1,1,1.2,1);
      piece(box,dark,side*.65,-2.8,.05,1.02,.4,.7);
      piece(box,neon,side*.65,-2.65,.43,.6,.06,.04);
      piece(ball,chrome,side*.83,2.15,-.1,.16,.28,.22);
      piece(box,neon,side*.26,1.91,.53,.3,.08,.04);
    }
    piece(box,ink,0,1.8,.25,.55,.05,.04);piece(box,chrome,0,2.85,-.1,.07,.55,.08);piece(ball,neon,0,3.13,-.1,.13,.13,.12);
    const core=piece(ball,red,0,.55,.4,.48,.48,.24);core.name=`smash-core-${p}`;
    const coreRing=piece(shapes.ring(.6,.66,32),neon,0,.55,.7,1,1,1);
    const armour=PANELS.map((spec,i)=>{
      const e=node(root);e.name=`smash-armour-${p}-${i}`;e.setLocalPosition(spec.x,spec.y,.3);
      const face=node(e,box,p?blue:orange);face.setLocalScale(spec.w,spec.h,.32);
      for(const side of [-1,1]){const rivet=node(e,ball,chrome,[side*spec.w*.36,spec.h*.28,.19]);rivet.setLocalScale(.055,.055,.03);}
      const cracks=[-28,31].map((angle,k)=>{const cut=node(e,box,ink,[k*.15-.07,0,.19]);cut.setLocalScale(.035,spec.h*.7,.02);cut.setLocalEulerAngles(0,0,angle);return cut;});
      const ring=node(root,shapes.ring(.58,.64,32),yellow,[spec.x,spec.y,.65]);
      return {...spec,e,face,cracks,ring,fall:0,vx:0,vy:0,flash:0};
    });
    return {root,core,coreRing,armour,state:bossState(stage,0),score:0,wave:0,broken:0,kills:0,weak:0,nextWeak:2.4,rebuild:0};
  });
  if(import.meta.env.DEV||sim){Object.assign(window,{__smashBoss:{bosses,area}});cleanup(()=>{delete (window as Window&{__smashBoss?:unknown}).__smashBoss;});}
  const hands=makeHands(scene,n,area),triggers=Array.from({length:n*2},()=>punchTrigger()),bursts=makeBursts(scene.root);
  const tick=round(hud,ROUND,()=>{music.stop();onEnd(bosses.map(b=>b.score),bosses.map(b=>[`${b.kills} robots demolished`,`${b.broken} armour plates broken`]));});
  music.start('arcade');
  const rebuild=(b:typeof bosses[number])=>{
    b.state=bossState(stage,b.wave);b.root.enabled=true;b.rebuild=0;b.weak=0;b.nextWeak=2.4;
    b.armour.forEach(a=>{a.e.enabled=true;a.e.setLocalPosition(a.x,a.y,.3);a.e.setLocalEulerAngles(0,0,0);a.fall=a.flash=0;});
  };
  return(rawDt:number)=>{
    const dt=Math.min(rawDt,.05),t=tick(rawDt);if(t===null)return;
    const handStates=hands.update(dt);
    handStates.forEach((h,i)=>{
      if(!triggers[i](h.speed,t,h.on)||t<0)return;
      const b=bosses[h.p];if(b.state.defeated)return;
      const cx=area.cx(h.p),intact=b.state.armour.some(Boolean);
      if(intact){
        let hit=-1,closest=Infinity;
        b.armour.forEach((a,k)=>{if(!b.state.armour[k])return;const d=segDist(cx+a.x*scale,a.y*scale,h.px,h.py,h.x,h.y),radius=(Math.max(a.w,a.h)*.45+.2)*scale;if(d<radius&&d/radius<closest){closest=d/radius;hit=k;}});
        if(hit<0)return;
        triggers[i].consume(t);
        const a=b.armour[hit],result=plateImpact(b.state,hit,hit===b.weak);b.score+=result.points;a.flash=.16;
        const x=cx+a.x*scale,y=a.y*scale;
        bursts.burst(x,y,.9,result.broken?'#ffe071':'#9af9ee',result.broken?24:9,result.broken?7:4);hitSound(result.broken?'impactMetal_heavy':'impactPunch_medium',b.broken,.65);
        if(result.broken){b.broken++;a.fall=1.25;a.vx=(a.x<0?-1:1)*(1.4+Math.random());a.vy=2.4;hud.pop(x,y+.4,`Plate off! +${result.points}`,'#ffe071');if(!b.state.armour.some(Boolean)){hud.banner('Core exposed!',1100);sfx('powerUp',{vol:.65});}}
      }else if(segDist(cx,.55*scale,h.px,h.py,h.x,h.y)<.8*scale){
        triggers[i].consume(t);
        const result=coreImpact(b.state);b.score+=result.points;hitSound('impactMetal_heavy',b.kills*2,.8);bursts.burst(cx,.55*scale,1,'#ff718d',result.defeated?70:16,result.defeated?10:5);
        if(result.defeated){b.kills++;b.wave++;b.rebuild=t+1.6;hud.pop(cx,1.2,'Demolished! +10','#ffe071');hud.shake(.4);sfx('confirmation');}
      }
    });
    bosses.forEach((b,p)=>{
      if(b.rebuild&&t>=b.rebuild)rebuild(b);
      const remaining=b.state.armour.filter(Boolean).length,exposed=remaining===0&&!b.state.defeated;
      if(t>=0)b.nextWeak-=dt;if(b.nextWeak<=0||!b.state.armour[b.weak]){for(let k=1;k<=6;k++){const next=(b.weak+k)%6;if(b.state.armour[next]){b.weak=next;break;}}b.nextWeak=2.4;}
      b.armour.forEach((a,k)=>{
        const hp=b.state.armour[k];a.flash=Math.max(0,a.flash-dt);
        tint(a.face,a.flash>0?'#fff2bd':hp<b.state.maxArmour?'#b76a52':p?'#5fbee9':'#ff9e52','diffuse');
        a.cracks.forEach((cut,j)=>show(cut,hp>0&&hp<b.state.maxArmour-j));
        if(a.fall>0){a.fall-=dt;a.vy-=9*dt;a.e.translateLocal(a.vx*dt,a.vy*dt,-dt*.3);a.e.rotateLocal(0,0,a.vx*dt*65);}
        show(a.e,hp>0||a.fall>0);show(a.ring,t>=0&&hp>0&&k===b.weak);const pulse=1+.07*Math.sin(t*5);a.ring.setLocalScale(pulse,pulse,1);
      });
      show(b.core,exposed);show(b.coreRing,exposed);const pulse=1+.09*Math.sin(t*6);b.core.setLocalScale(.48*pulse,.48*pulse,.24);b.coreRing.rotateLocal(0,0,dt*30);
      if(b.state.defeated){b.root.setLocalScale(scale*(1-.035*Math.sin(t*25)),scale,scale);}else b.root.setLocalScale(scale,scale,scale);
      hud.p('h',p,t<0?'Punch the marked armour · then the core':b.state.defeated?'Demolished! Next robot…':exposed?`CORE · ${b.state.core} hits left`:`Robot ${b.wave+1} · ${remaining} plates · ${b.armour[b.weak].name}`);
    });
    bursts.update(dt);scoreHud(hud,n,bosses.map(b=>b.score));music.intensity(.35+Math.min(.5,bosses.reduce((a,b)=>a+b.broken,0)*.035));
  };
}
