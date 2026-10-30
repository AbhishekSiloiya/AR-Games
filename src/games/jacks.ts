// One tracked pilot, deliberate arm shots, a tangible orbital arcade.
import type {Entity} from 'playcanvas';
import {players,sim,trackingSeen} from '../pose.ts';
import {hardness} from '../meta.ts';
import {galaxyWave,damageDrone} from '../galaxy-rules.ts';
import {aimedTarget} from '../arm-shot.ts';
import {jackInput} from '../jack-input.ts';
import {jackPilot} from '../jack-pilot.ts';
import {jackArena} from '../jack-arena.ts';
import {jackHud} from '../jack-hud.ts';
import {effects,pace} from '../pace.ts';
import {flat,lit,node,shapes,show,fade,glowLook,glowAs} from '../engine.ts';
import {PLAYER_COLORS,bestLine,bursts as makeBursts,hitSound,music,round,sfx,zoneHalf,zoneX,type Game} from '../kit.ts';
const ROUND=70,REST=3,BREACH=.8,TOP=2.65,POOL=40;
type Drone={on:boolean;zone:number;x:number;y:number;hp:number;row:number;boss:boolean;hurt:number;dead:number;e:Entity;skin:Entity[]};
export default async function jacks({n,stage,team,best,onEnd,hud,scene}:Game){
 let disposed=false;scene.cleanup(()=>{disposed=true;});const [arena,...loaded]=await Promise.all([jackArena(scene),...Array.from({length:n},(_,p)=>jackPilot(scene,p,n))]);if(disposed||!arena||loaded.some(p=>!p))return()=>{};
 const bodies=loaded as NonNullable<Awaited<ReturnType<typeof jackPilot>>>[],overlay=jackHud(n,team,stage),hard=hardness(stage),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hull=lit('#d8e8eb'),glass=lit('#164454',{emissive:'#164454',glow:.2}),energy=flat('#b1f7ff'),warm=flat('#ffcf9c'),pearl=shapes.sphere(.4,20),pod=shapes.sphere(.17,16);
 const invaders:Drone[]=Array.from({length:POOL},(_,i)=>{
  const e=node(scene.root);e.name=`jack-drone-${i}`;const skin=[node(e,pearl,hull)];skin[0].setLocalScale(1.2,.65,.7);
  const core=node(e,shapes.sphere(.25,16),glass,[0,0,.28]);core.setLocalScale(1,.7,.5);skin.push(core);skin.push(node(e,shapes.circle(.09,20),energy,[0,0,.43]));
  for(const s of [-1,1]){const wing=node(e,shapes.box(.3,.05,.22),hull,[s*.48,0,0]);wing.setLocalEulerAngles(0,0,s*14);skin.push(wing);skin.push(node(e,pod,glass,[s*.61,-.03,0]));skin.push(node(e,shapes.circle(.06,12),warm,[s*.61,-.03,.18]));}
  e.enabled=false;return {on:false,zone:0,x:0,y:0,hp:1,row:0,boss:false,hurt:0,dead:0,e,skin};
 });
 const beams=Array.from({length:8},(_,i)=>{const e=node(scene.root,shapes.quad(2,2),glowLook('#aaf6ff',.6));e.name=`arm-shot-beam-${i}`;e.enabled=false;return {e,life:0};});
 const rays=Array.from({length:n*2},()=>{const e=node(scene.root,shapes.quad(2,2),flat('#9aefff',{opacity:.25}));e.enabled=false;return e;});
 const bursts=makeBursts(scene.root),passed=bestLine(hud,best),crews=(team?[[0,1].slice(0,n)]:Array.from({length:n},(_,p)=>[p])).map((who,k)=>({who,x:team?0:zoneX(n,k),half:team?7:zoneHalf(n)-.6,wave:0,shields:3,rest:1.4,score:0,cleared:0}));
 const me=Array.from({length:n},()=>({input:jackInput(),reps:0,hits:0,last:-9}));let time=-3,forced=0,guard=0,lastWall=performance.now();
 const reset=()=>{me.forEach(m=>m.input.reset());guard=performance.now()+150;lastWall=performance.now();};const keyReset=(e:KeyboardEvent)=>{if(e.code==='Escape'||e.code==='Space')reset();};window.addEventListener('keydown',keyReset,true);window.addEventListener('click',reset,true);
 scene.cleanup(()=>{overlay.dispose();music.stop();window.removeEventListener('keydown',keyReset,true);window.removeEventListener('click',reset,true);delete(window as Window&{__jacks?:unknown}).__jacks;delete(window as Window&{advanceTime?:unknown}).advanceTime;});
 const snapshot=()=>({coordinates:'world units; centre origin, x right, y up',time,stage,arena,players:bodies.map((b,p)=>({...b.state(),shots:me[p].reps,hits:me[p].hits})),crews:crews.map(c=>({...c})),drones:invaders.filter(v=>v.on||v.dead>0).map(v=>({x:v.x,y:v.y,hp:v.hp,boss:v.boss,zone:v.zone,state:v.on?'active':'breaking',parts:v.skin.length})),beams:beams.filter(b=>b.life>0).length,motion:effects.on&&!pace.lean&&!reduced});
 const advance=(ms:number)=>{for(let i=0;i<Math.ceil(ms/(1000/60));i++){forced++;update(1/60);}};
 Object.assign(window,{__jacks:{crews,me,invaders,bodies,snapshot,advance},advanceTime:advance});
 const tick=round(hud,ROUND,()=>{music.stop();onEnd(team?Array(n).fill(crews[0].score):crews.map(c=>c.score),me.map((m,p)=>[`${m.reps} arm shots`,m.reps?`${Math.round(100*m.hits/m.reps)}% hit rate`:'',`${crews[team?0:p].cleared} waves cleared`].filter(Boolean)));});music.start('cosmic',undefined,.42);
 const spawnWave=(c:typeof crews[number],k:number,t:number)=>{
  const {boss,cols,rows}=galaxyWave(c.wave,n,team);overlay.cue(boss?'COMMANDER APPROACHING':`WAVE ${c.wave+1} · HANDS READY`,t);
  const put=(x:number,y:number,row:number,isBoss=false)=>{const v=invaders.find(q=>!q.on&&q.dead<=0);if(!v)return;Object.assign(v,{on:true,zone:k,x,y,row,boss:isBoss,hp:isBoss?8:1,hurt:0,dead:0});v.skin.forEach((part,j)=>{part.setLocalEulerAngles(0,0,j===3?-14:j===6?14:0);});};
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++)put(c.x+((col+.5)/cols-.5)*c.half*1.65,TOP+r*.72,r);
  if(boss)put(c.x,2.1,0,true);
 };
 const partHomes=invaders[0].skin.map(part=>({position:part.getLocalPosition().clone(),scale:part.getLocalScale().clone(),rotation:part.getLocalEulerAngles().clone()}));
 const destroy=(v:Drone)=>{v.on=false;v.dead=.72;};
 const fire=(x:number,y:number,dx:number,dy:number,target:Drone|undefined,p:number)=>{
  const distance=target?Math.max(.2,(target.x-x)*dx+(target.y-y)*dy):12,beam=beams.find(b=>b.life<=0)??beams[0];beam.life=.18;glowAs(beam.e,PLAYER_COLORS[p]);beam.e.enabled=true;beam.e.setLocalPosition(x+dx*distance/2,y+dy*distance/2,1.5);beam.e.setLocalEulerAngles(0,0,Math.atan2(dy,dx)*180/Math.PI);beam.e.setLocalScale(distance/2,.065,1);
  if(!target)return 0;const damage=damageDrone(target.hp,target.boss);target.hp=damage.hp;target.hurt=.22;bursts.burst(target.x,target.y,1.4,'#a6f2f3',damage.destroyed?16:6,damage.destroyed?5:2);
  if(damage.destroyed){destroy(target);sfx(target.boss?'impactPlate_heavy':'impactMetal_light',{vol:target.boss?.6:.3});return damage.points;}return 0;
 };
 const update=(rawDt:number)=>{
  if(disposed)return;const dt=Math.min(rawDt,.05),t=tick(rawDt);if(t===null)return;time=t;const now=performance.now();if(now-lastWall>180&&forced===0)reset();lastWall=now;forced=0;
  const fresh=players.slice(0,n).map((pl,p)=>pl.present&&(sim||trackingSeen[p]>0&&now-trackingSeen[p]<=180)&&now>=guard),motion=effects.on&&!pace.lean&&!reduced;
  bodies.forEach((b,p)=>b.update(players[p].rig,fresh[p],dt,t,motion));
  crews.forEach((c,k)=>{
   const mine=invaders.filter(v=>v.on&&v.zone===k);if(t>=0&&!mine.length&&(c.rest-=dt)<=0){spawnWave(c,k,t);c.rest=REST;}
   for(const v of mine){v.y-=(.22+c.wave*.035)*hard*dt*(v.boss?.55:1);if(motion)v.x+=Math.sin(t*1.3+v.row)*.2*dt;}
   const low=mine.reduce<Drone|undefined>((a,b)=>!a||b.y<a.y?b:a,undefined);if(low&&low.y<BREACH){destroy(low);c.shields--;overlay.cue(c.shields?`SHIELD LOST · ${c.shields} LEFT`:'REGROUP. YOU’VE GOT THIS.',t);sfx('error',{vol:.45});if(c.shields<=0){mine.forEach(destroy);c.shields=3;c.score=Math.max(0,c.score-5);c.rest=2.5;}}
   c.who.forEach(p=>{const m=me[p],shots=m.input.sample(players[p].rig,t,fresh[p]&&t>=0);for(const shot of shots){m.reps++;bodies[p].react('fire',t);const muzzle=bodies[p].muzzle(shot.hand),dx=muzzle.dx,dy=Math.max(.01,muzzle.dy),len=Math.hypot(dx,dy),targets=invaders.filter(v=>v.on&&v.zone===k),target=aimedTarget(targets,muzzle.x,muzzle.y,dx/len,dy/len),got=fire(muzzle.x,muzzle.y,dx/len,dy/len,target,p),other=c.who.find(q=>q!==p),sync=team&&other!==undefined&&t-me[other].last<.33;m.last=t;if(target){m.hits++;bodies[p].react('hit',t);}c.score+=got+(sync&&got?2:0);hitSound('laser',Math.min(12,m.reps%12),.3);if(target&&got)hud.pop(target.x,target.y+.4,sync?`Together +${got+2}`:`+${got}`,'#f3fff4');
    if(targets.length&&!invaders.some(v=>v.on&&v.zone===k)){c.score+=10;c.cleared++;c.wave++;c.rest=REST;overlay.cue('SECTOR CLEAR · +10',t,2.5);sfx('confirmation',{vol:.5});}
   }hud.p('h',p,'');});hud.p('s',team?0:k,String(c.score));
  });
  for(const v of invaders){if(!show(v.e,v.on||v.dead>0))continue;v.hurt=Math.max(0,v.hurt-dt);const s=(v.boss?1.9:1)*(1+v.hurt*.5);v.e.setLocalPosition(v.x,v.y,.9);v.e.setLocalScale(s,s,s);v.e.setLocalEulerAngles(0,motion?Math.sin(t*1.8+v.row)*14:0,motion?Math.sin(t*2+v.x)*4:0);if(v.dead>0)v.dead=Math.max(0,v.dead-dt);
   v.skin.forEach((part,j)=>{const home=partHomes[j];if(v.on){part.setLocalPosition(home.position);part.setLocalScale(home.scale);part.setLocalEulerAngles(home.rotation);}else{const a=1-v.dead/.72,side=j%2?-1:1;part.setLocalPosition(home.position.x+(motion?side*a*(.5+j*.06):0),home.position.y+(motion?a*.7-a*a*2:0),home.position.z);part.setLocalEulerAngles(home.rotation.x,home.rotation.y,motion?home.rotation.z+side*a*160:home.rotation.z);const k=Math.max(0,1-a*a);part.setLocalScale(home.scale.x*k,home.scale.y*k,home.scale.z*k);}});
  }
  for(const b of beams){b.life=Math.max(0,b.life-dt);show(b.e,b.life>0);if(b.life>0)b.e.setLocalScale(b.e.getLocalScale().x,.03+b.life*.2,1);}
  rays.forEach((ray,i)=>{const p=i>>1,h=i%2,r=players[p].rig,w=r[15+h],s=r[11+h],raised=fresh[p]&&w&&s&&w[1]-s[1]>.3;if(!show(ray,!!raised))return;const m=bodies[p].muzzle(h),len=2.2;ray.setLocalPosition(m.x+m.dx*len/2,m.y+m.dy*len/2,1.2);ray.setLocalEulerAngles(0,0,Math.atan2(m.dy,m.dx)*180/Math.PI);ray.setLocalScale(len/2,.008,1);fade(ray,.25);});
  overlay.update(t,crews.map((c,k)=>({...c,bossHp:invaders.find(v=>v.on&&v.boss&&v.zone===k)?.hp??0})),fresh,players.slice(0,n).map(pl=>[0,1].map(h=>(pl.rig[15+h]?.[1]??-1)-(pl.rig[11+h]?.[1]??0)>.3)),invaders.filter(v=>v.on).length);bursts.update(dt);passed(Math.max(...crews.map(c=>c.score)));music.intensity(.3+Math.min(.5,invaders.filter(v=>v.on&&v.y<2).length/6));
 };
 return update;
}
