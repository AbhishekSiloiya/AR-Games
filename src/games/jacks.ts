// Tracked orbital gauntlets, travelling shots, and a barrage earned through real hits.
import type {Entity,Vec3} from 'playcanvas';
import {players,sim,trackingSeen} from '../pose.ts';
import {hardness} from '../meta.ts';
import {damageDrone} from '../galaxy-rules.ts';
import {newRapid,grantRapid,stepRapid} from '../jack-rapid.ts';
import {jackInput} from '../jack-input.ts';
import {newJackPower,earnJackPower,resetJackGesture,stepJackPower,jackHandsHigh} from '../jack-power.ts';
import {jackFormation,pulseContact,jackDivePoint,pilotContact,JACK_PULSE_SPEED,JACK_DIVE_LINE,jackDescentSpeed,jackAttackIn,type DroneKind} from '../jack-combat.ts';
import {jackPilot} from '../jack-pilot.ts';
import {jackArena} from '../jack-arena.ts';
import {jackHud} from '../jack-hud.ts';
import {effects,pace} from '../pace.ts';
import {flat,lit,node,shapes,show,fade} from '../engine.ts';
import {bestLine,bursts as makeBursts,hitSound,music,round,sfx,zoneHalf,zoneX,type Game} from '../kit.ts';
const ROUND=70,REST=3,POOL=40;
type Home={position:Vec3;scale:Vec3;rotation:Vec3};
type Drone={diving:boolean;diveAge:number;diveX:number;diveY:number;targetP:number;on:boolean;zone:number;x:number;y:number;hp:number;row:number;boss:boolean;kind:DroneKind;bonus:boolean;hurt:number;dead:number;age:number;delay:number;entryX:number;entryY:number;toX:number;toY:number;e:Entity;body:Entity;badge:Entity;skin:Entity[];home:Home[]};
export default async function jacks({n,stage,team,best,onEnd,hud,scene}:Game){
 let disposed=false;scene.cleanup(()=>{disposed=true;});
 const [arena,...loaded]=await Promise.all([jackArena(scene),...Array.from({length:n},(_,p)=>jackPilot(scene,p,n,team))]);
 if(disposed||!arena||loaded.some(p=>!p))return()=>{};
 const bodies=loaded as NonNullable<Awaited<ReturnType<typeof jackPilot>>>[],overlay=jackHud(n,team,stage),hard=hardness(stage),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const bonusHull=lit('#b77aef'),bonusGold=flat('#ffe28a');
 const hull=lit('#d8e8eb'),glass=lit('#164454',{emissive:'#164454',glow:.2}),energy=flat('#a1edf2'),warm=flat('#ffd09e'),pearl=shapes.sphere(.4,24),pod=shapes.sphere(.17,16);
 const invaders:Drone[]=Array.from({length:POOL},(_,i)=>{
  const kind=(['scout','dart','orb'] as const)[i%3],e=node(scene.root);e.name=`jack-drone-${i}`;
  const body=node(e,pearl,hull),skin=[body];body.setLocalScale(kind==='orb'?.9:kind==='dart'?.8:1.2,kind==='orb'?.9:kind==='dart'?.48:.65,kind==='orb'?.9:.7);
  const core=node(e,shapes.sphere(.25,20),glass,[0,0,.28]);core.setLocalScale(1,.7,.5);skin.push(core,node(e,shapes.circle(.09,24),energy,[0,0,.43]));
  for(const side of [-1,1]){
   const wing=node(e,kind==='dart'?shapes.cone(.2,.7,24):kind==='orb'?shapes.sphere(.12,16):shapes.box(.3,.05,.22),kind==='orb'?glass:hull,[side*(kind==='orb'?.36:.48),kind==='dart'?-.05:0,0]);wing.setLocalEulerAngles(0,0,kind==='dart'?side*60:side*14);skin.push(wing);
   skin.push(node(e,pod,glass,[side*(kind==='orb'?.36:.61),-.03,0]),node(e,shapes.circle(.06,16),warm,[side*(kind==='orb'?.36:.61),-.03,.18]));
  }
  const badge=node(e,shapes.ring(.48,.53,32),bonusGold,[0,0,.48]);badge.name=`jack-power-halo-${i}`;badge.enabled=false;const bolt=node(badge,shapes.box(.065,.24,.01),bonusGold,[0,0,.03]);bolt.setLocalEulerAngles(0,0,-24);node(badge,shapes.box(.16,.055,.01),bonusGold,[0,0,.04]);
  const home=skin.map(part=>({position:part.getLocalPosition().clone(),scale:part.getLocalScale().clone(),rotation:part.getLocalEulerAngles().clone()}));e.enabled=false;
  return {bonus:false,body,badge,diving:false,diveAge:0,diveX:0,diveY:0,targetP:0,on:false,zone:0,x:0,y:0,hp:1,row:0,boss:false,kind,hurt:0,dead:0,age:0,delay:0,entryX:0,entryY:0,toX:0,toY:0,e,skin,home};
 });
 const pulseLooks=[flat('#9af4f5'),flat('#ffca91'),flat('#ffe391'),flat('#d6a2ff')],trailLooks=[flat('#8bdadd',{opacity:.45}),flat('#e3b47e',{opacity:.45}),flat('#edc065',{opacity:.5}),flat('#c594ea',{opacity:.5})];
 const pulses=Array.from({length:96},(_,i)=>{const root=node(scene.root),e=node(root,shapes.sphere(.09,16),pulseLooks[0]),trail=node(root,shapes.quad(1,1),trailLooks[0]);root.name=`jack-pulse-${i}`;root.enabled=false;return {on:false,root,e,trail,x:0,y:0,dx:0,dy:1,life:0,p:0,zone:0,power:false};});
 const markers=Array.from({length:n*2},(_,i)=>{const root=node(scene.root);root.name=`jack-aim-${i}`;const look=flat(i>>1?'#ffca91':'#a1edf2');node(root,shapes.ring(.11,.14,32),look);node(root,shapes.box(.08,.018,.01),look,[-.19,0,0]);node(root,shapes.box(.08,.018,.01),look,[.19,0,0]);root.enabled=false;return root;});
 const rays=Array.from({length:n*2},()=>{const e=node(scene.root,shapes.quad(2,2),flat('#9aefff',{opacity:.2}));e.enabled=false;return e;});
 const bursts=makeBursts(scene.root),passed=bestLine(hud,best);
 const crews=(team?[[0,1].slice(0,n)]:Array.from({length:n},(_,p)=>[p])).map((who,k)=>({who,x:team?0:zoneX(n,k),half:team?7:zoneHalf(n)-.6,wave:0,shields:3,rest:1.4,score:0,cleared:0,inWave:false,kills:0,size:0,invulnerable:0,hits:0,lastHit:-Infinity,hitPlayer:-1}));
 const me=Array.from({length:n},()=>({input:jackInput(),rapid:newRapid(),power:newJackPower(),reps:0,hits:0,powerShots:0,powerHits:0,volley:0,last:-9}));
 let time=-3,forced=0,guard=0,lastWall=performance.now();
 const reset=()=>{me.forEach(m=>{m.input.reset();resetJackGesture(m.power);});guard=performance.now()+150;lastWall=performance.now();};
 const keyReset=(e:KeyboardEvent)=>{if(e.code==='Escape'||e.code==='Space')reset();};window.addEventListener('keydown',keyReset,true);window.addEventListener('click',reset,true);
 scene.cleanup(()=>{overlay.dispose();music.stop();window.removeEventListener('keydown',keyReset,true);window.removeEventListener('click',reset,true);delete(window as Window&{__jacks?:unknown}).__jacks;delete(window as Window&{advanceTime?:unknown}).advanceTime;});
 const snapshot=()=>({coordinates:'world units; centre origin, x right, y up',time,stage,arena,players:bodies.map((b,p)=>({...b.state(),shots:me[p].reps,hits:me[p].hits,power:{...me[p].power},powerShots:me[p].powerShots,powerHits:me[p].powerHits,rapid:{...me[p].rapid}})),crews:crews.map((c,k)=>({...c,attackIn:jackAttackIn(invaders.filter(v=>v.zone===k),c.wave,hard)})),drones:invaders.filter(v=>v.on||v.dead>0).map(v=>({x:v.x,y:v.y,hp:v.hp,boss:v.boss,bonus:v.bonus,kind:v.kind,zone:v.zone,state:!v.on?'breaking':v.diving?'diving':v.age<1+v.delay?'arriving':'active',diveAge:v.diveAge,targetPlayer:v.diving?v.targetP:null,parts:v.skin.length})),projectiles:pulses.filter(p=>p.on).map(p=>({x:p.x,y:p.y,dx:p.dx,dy:p.dy,player:p.p,zone:p.zone,power:p.power})),motion:effects.on&&!pace.lean&&!reduced});
 const advance=(ms:number)=>{for(let i=0;i<Math.ceil(ms/(1000/60));i++){forced++;update(1/60);}};
 Object.assign(window,{__jacks:{crews,me,invaders,bodies,pulses,snapshot,advance},advanceTime:advance});
 const tick=round(hud,ROUND,()=>{music.stop();onEnd(team?Array(n).fill(crews[0].score):crews.map(c=>c.score),me.map((m,p)=>[`${m.reps} gauntlet shots`,m.reps?`${Math.round(100*m.hits/m.reps)}% hit rate`:'',`${m.power.serial} Starfall barrages`,`${crews[team?0:p].cleared} perfect waves`].filter(Boolean)));});music.start('cosmic',undefined,.42);
 const spawnWave=(c:typeof crews[number],k:number,t:number)=>{
  const formation=jackFormation(c.wave,n,team,c.x,c.half);c.inWave=true;c.kills=0;c.size=formation.length;overlay.cue(formation.some(v=>v.boss)?'COMMANDER APPROACHING':`WAVE ${c.wave+1} · INBOUND`,t);
  formation.forEach((f,row)=>{const v=invaders.find(q=>!q.on&&q.dead<=0&&q.kind===f.kind)??invaders.find(q=>!q.on&&q.dead<=0);if(!v)return;Object.assign(v,{diving:false,diveAge:0,targetP:c.who[row%c.who.length],on:true,zone:k,x:f.entryX,y:f.entryY,row,boss:f.boss,bonus:f.bonus,hp:f.boss?8:1,hurt:0,dead:0,age:0,delay:f.delay,entryX:f.entryX,entryY:f.entryY,toX:f.x,toY:f.y});});
 };
 const destroy=(v:Drone)=>{v.on=false;v.dead=.72;};
 const launch=(p:number,hand:number,dx:number,dy:number,power=false,rapid=false)=>{
  const pulse=pulses.find(q=>!q.on);if(!pulse)return;const muzzle=bodies[p].muzzle(hand),len=Math.max(.01,Math.hypot(dx,dy)),look=power?2:rapid?3:p;
  Object.assign(pulse,{on:true,x:muzzle.x,y:muzzle.y,dx:dx/len,dy:dy/len,life:1.8,p,zone:team?0:p,power});pulse.e.render!.meshInstances[0].material=pulseLooks[look];pulse.trail.render!.meshInstances[0].material=trailLooks[look];pulse.root.enabled=true;bodies[p].fire(hand);if(power)me[p].powerShots++;
 };
 const impact=(v:Drone,p:number,power:boolean,t:number,motion:boolean)=>{
  const m=me[p],c=crews[team?0:p],damage=damageDrone(v.hp,v.boss);v.hp=damage.hp;v.hurt=.18;
  if(power)m.powerHits++;else{m.hits++;earnJackPower(m.power);}
  if(motion)bursts.burst(v.x,v.y,1.4,power?'#ffe096':'#a6eced',damage.destroyed?9:4,damage.destroyed?3:1.5);
  if(!damage.destroyed){sfx('impactMetal_light',{vol:.12});return;}
  destroy(v);c.kills++;if(v.bonus){grantRapid(m.rapid);overlay.cue('RAPID FIRE · 5 SECONDS',t,1.6);sfx('powerUp',{vol:.4});}const other=c.who.find(q=>q!==p),sync=!power&&team&&other!==undefined&&t-me[other].last<.33,points=damage.points+(sync?2:0);c.score+=points;
  hud.pop(v.x,v.y+.3,sync?`Together +${points}`:`+${points}`,power?'#ffe096':'#f3fff4');sfx(v.boss?'impactPlate_heavy':'impactMetal_light',{vol:v.boss?.45:.2});
 };
 const update=(rawDt:number)=>{
  if(disposed)return;const dt=Math.min(rawDt,.05),t=tick(rawDt);if(t===null)return;time=t;const now=performance.now();if(now-lastWall>180&&forced===0)reset();lastWall=now;forced=0;
  const fresh=players.slice(0,n).map((pl,p)=>pl.present&&(sim||trackingSeen[p]>0&&now-trackingSeen[p]<=180)&&now>=guard),motion=effects.on&&!pace.lean&&!reduced;
  bodies.forEach((b,p)=>b.update(players[p].rig,fresh[p],dt,t,motion,players[p].lift));
  crews.forEach((c,k)=>{
   const mine=invaders.filter(v=>v.on&&v.zone===k);
   if(!c.who.some(p=>fresh[p])){c.who.forEach(p=>{me[p].input.reset();resetJackGesture(me[p].power);});return;}
   c.invulnerable=Math.max(0,c.invulnerable-dt);
   if(c.shields<=0){c.who.forEach(p=>me[p].input.reset());c.rest-=dt;if(c.rest<=0){c.shields=3;c.invulnerable=1.2;c.rest=1;overlay.cue('SHIELDS RESTORED · BACK IN THE FIGHT',t);}return;}
   if(t>=0&&!mine.length&&!c.inWave&&(c.rest-=dt)<=0){spawnWave(c,k,t);c.rest=REST;}
   for(const v of mine){
    if(v.diving){
     if(!fresh[v.targetP])continue;
     const target=bodies[v.targetP].shieldTarget(),before={x:v.x,y:v.y};v.diveAge+=dt;
     const next=jackDivePoint({x:v.diveX,y:v.diveY},target,v.diveAge/.95);v.x=next.x;v.y=next.y;
     if(pilotContact(before,next,target)){
      destroy(v);bodies[v.targetP].react('shield',t);
      if(c.invulnerable<=0){c.shields=Math.max(0,c.shields-1);c.hits++;c.lastHit=t;c.hitPlayer=v.targetP;c.invulnerable=1.25;overlay.hit(v.targetP,t,c.shields);overlay.cue(c.shields?`SHIELD HIT · ${c.shields} LEFT`:'SHIELDS DOWN · REGROUP',t,1.5);sfx('impactMetal_heavy',{vol:.28});if(motion)bursts.burst(target.x,target.y,1.6,'#ffcba7',12,2.8);
       if(c.shields<=0){mine.forEach(destroy);c.inWave=false;c.score=Math.max(0,c.score-5);c.rest=2.5;break;}
      }
     }
     continue;
    }
    v.age+=dt;const entry=Math.max(0,Math.min(1,(v.age-v.delay)/1));if(entry<1){const u=1-(1-entry)**3;v.x=v.entryX+(v.toX-v.entryX)*u;v.y=v.entryY+(v.toY-v.entryY)*u;}else{v.y-=jackDescentSpeed(c.wave,hard,v.boss)*dt;v.x+=Math.sin(t*1.2+v.row)*.22*dt;}
    if(v.age>=1+v.delay&&v.y<JACK_DIVE_LINE){const ready=c.who.filter(p=>fresh[p]);v.targetP=ready[(v.row+c.wave)%ready.length];v.diving=true;v.diveAge=0;v.diveX=v.x;v.diveY=v.y;overlay.cue('INCOMING · SHOOT THE DIVING SHIP',t,1);}
   }
   c.who.forEach(p=>{
    const m=me[p],pl=players[p];if(fresh[p])stepRapid(m.rapid,dt);const shots=m.input.sample(pl.rig,t,fresh[p]&&t>=0,m.rapid.remaining>0),high=jackHandsHigh(pl.rig);
    for(const shot of shots){const muzzle=bodies[p].muzzle(shot.hand);m.reps++;m.last=t;launch(p,shot.hand,muzzle.dx,Math.max(.01,muzzle.dy),false,m.rapid.remaining>0);hitSound('laser',Math.min(8,m.reps%8),.2);}
    const started=stepJackPower(m.power,dt,{t,fresh:fresh[p]&&t>=0,lift:pl.lift,liftV:pl.liftV,high});if(started){m.volley=0;overlay.cue('STARFALL · LET IT FLY',t,2.4);sfx('powerUp',{vol:.45});}
    m.volley-=dt;if(m.power.active>0&&fresh[p]&&m.volley<=0){m.volley=.2;const targets=invaders.filter(v=>v.on&&v.zone===k&&v.age>=1+v.delay);for(const hand of [0,1]){const target=targets[(m.powerShots+hand)%Math.max(1,targets.length)],muzzle=bodies[p].muzzle(hand);if(target)launch(p,hand,target.x-muzzle.x,target.y-muzzle.y,true);else launch(p,hand,(hand?1:-1)*.3,1,true);}}
    hud.p('h',p,'');
   });hud.p('s',team?0:k,String(c.score));
  });
  for(const pulse of pulses){
   if(!pulse.on)continue;const x=pulse.x,y=pulse.y,speed=pulse.power?19:JACK_PULSE_SPEED;pulse.x+=pulse.dx*speed*dt;pulse.y+=pulse.dy*speed*dt;pulse.life-=dt;
   const hit=pulseContact(invaders.filter(v=>v.on&&v.zone===pulse.zone&&v.age>=1+v.delay).map(v=>({x:v.x,y:v.y,r:v.boss?1.05:v.kind==='orb'?.46:.57,v})),x,y,pulse.x,pulse.y);
   if(hit){impact(hit.v,pulse.p,pulse.power,t,motion);pulse.on=false;}
   if(pulse.life<=0||Math.abs(pulse.x)>9||pulse.y>6||pulse.y<-5)pulse.on=false;
   show(pulse.root,pulse.on);if(pulse.on){pulse.root.setLocalPosition(pulse.x,pulse.y,1.5);pulse.e.setLocalScale(pulse.power?1.3:1,pulse.power?1.3:1,1);pulse.trail.setLocalPosition(-pulse.dx*.23,-pulse.dy*.23,-.01);pulse.trail.setLocalEulerAngles(0,0,Math.atan2(pulse.dy,pulse.dx)*180/Math.PI);pulse.trail.setLocalScale(.5,.035,1);}
  }
  crews.forEach((c,k)=>{if(c.shields<=0||!c.inWave||invaders.some(v=>v.on&&v.zone===k))return;c.inWave=false;const perfect=c.kills===c.size;if(perfect){c.score+=10;c.cleared++;sfx('confirmation',{vol:.4});}c.wave++;c.rest=REST;overlay.cue(perfect?'SECTOR CLEAR · +10':'NEXT SECTOR · HANDS READY',t,2.5);});
  for(const v of invaders){if(!show(v.e,v.on||v.dead>0))continue;v.body.render!.meshInstances[0].material=v.bonus?bonusHull:hull;v.badge.enabled=v.on&&v.bonus;v.hurt=Math.max(0,v.hurt-dt);const s=(v.boss?1.8:1)*(1+v.hurt*.4);v.e.setLocalPosition(v.x,v.y,.9);v.e.setLocalScale(s,s,s);v.e.setLocalEulerAngles(v.diving?Math.min(35,v.diveAge*30):0,motion?Math.sin(t*1.8+v.row)*14:0,v.diving?Math.atan2(bodies[v.targetP].shieldTarget().y-v.y,bodies[v.targetP].shieldTarget().x-v.x)*180/Math.PI+90:motion?Math.sin(t*2+v.x)*4:0);if(v.dead>0)v.dead=Math.max(0,v.dead-dt);
   v.skin.forEach((part,j)=>{const home=v.home[j];if(v.on){part.setLocalPosition(home.position);part.setLocalScale(home.scale);part.setLocalEulerAngles(home.rotation);}else{const a=1-v.dead/.72,side=j%2?-1:1;part.setLocalPosition(home.position.x+(motion?side*a*(.5+j*.06):0),home.position.y+(motion?a*.7-a*a*2:0),home.position.z);part.setLocalEulerAngles(home.rotation.x,home.rotation.y,motion?home.rotation.z+side*a*160:home.rotation.z);const k=Math.max(0,1-a*a);part.setLocalScale(home.scale.x*k,home.scale.y*k,home.scale.z*k);}});
  }
  rays.forEach((ray,i)=>{const p=i>>1,h=i%2,target=bodies[p].aim(h),on=fresh[p]&&!!target?.ready;show(markers[i],on);if(on){markers[i].setLocalPosition(target!.x,target!.y,2.9);const k=1+me[p].input.progress(h)*.5;markers[i].setLocalScale(k,k,1);}if(!show(ray,on))return;const m=bodies[p].muzzle(h),len=Math.min(1.8,Math.hypot(target!.x-m.x,target!.y-m.y));ray.setLocalPosition(m.x+m.dx*len/2,m.y+m.dy*len/2,2.8);ray.setLocalEulerAngles(0,0,Math.atan2(m.dy,m.dx)*180/Math.PI);ray.setLocalScale(len/2,.006,1);fade(ray,.2);});
  overlay.update(t,crews.map((c,k)=>({...c,attackIn:jackAttackIn(invaders.filter(v=>v.zone===k),c.wave,hard),bossHp:invaders.find(v=>v.on&&v.boss&&v.zone===k)?.hp??0})),fresh,bodies.map(b=>[0,1].map(h=>!!b.aim(h)?.ready)),invaders.filter(v=>v.on).length,me.map(m=>m.power),me.map(m=>m.rapid));bursts.update(dt);passed(Math.max(...crews.map(c=>c.score)));music.intensity(me.some(m=>m.power.active>0)?.7:.3+Math.min(.4,invaders.filter(v=>v.on&&v.y<2).length/8));
 };
 return update;
}
