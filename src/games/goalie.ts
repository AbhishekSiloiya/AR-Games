// One readable shot at a time. Arcade flight and a continuous glove sweep share the rendered coordinates.
import {footballMaterial} from '../football.ts';
import {players,sim} from '../pose.ts';
import {effects,pace} from '../pace.ts';
import {flat,node,shapes,show,fade,tint,type View} from '../engine.ts';
import {music,round,sfx,hitSound,type Game} from '../kit.ts';
import {goalieArena} from '../goalie-arena.ts';
import {goalieStriker} from '../goalie-striker.ts';
import {keeperGloves} from '../goalie-gloves.ts';
import {keeperCoach} from '../goalie-coach.ts';
import {newKeeper,stepKeeper,keeperLayout,keeperReport} from '../goalie-rules.ts';
import {goalieSettings,saveGoalieSettings,keeperFromVariant,keeperSetupLabel} from '../goalie-settings.ts';
import {keeperCrowd} from '../goalie-audio.ts';
import {keeperStage,keeperShot,keeperProgress} from '../goalie-stages.ts';
import {starGoals} from '../meta.ts';
export const view:View={position:[0,0,10.5],fov:45,near:.1,far:100};
export default async function goalie({n,stage,mode,best,onEnd,hud,scene}:Game){
 const lesson=keeperStage(stage),goals=starGoals('goalie',stage,mode),settings={...keeperFromVariant(mode),practice:goalieSettings().practice},reach=settings.reach==='comfort'?.8:1,states=Array.from({length:n},(_,p)=>newKeeper(stage,p,n,reach,settings.speed/100)),coach=keeperCoach(scene,n,stage,best,settings,mode);
 const [arena,actors]=await Promise.all([goalieArena(scene,n,stage),Promise.all(Array.from({length:n},(_,p)=>goalieStriker(scene,p,n)))]);if(!arena||actors.some(a=>!a))return()=>{};
 const gloves=keeperGloves(scene,n),crowd=keeperCrowd(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.cleanup(()=>{music.stop();crowd.stop();});
 const ballLook=footballMaterial(),shadowLook=flat('#123d29',{opacity:.2}),ringLook=flat('#fff9df',{opacity:.9}),coral=flat('#e68265',{opacity:.9}),teal=flat('#3c9292',{opacity:.9}),gold=flat('#f1bd58',{opacity:.95}),pulseLook=flat('#fff4d5',{opacity:.8});
 const balls=states.map((_,p)=>{const mesh=node(scene.root,shapes.sphere(.38,48),ballLook);mesh.name=`goalie-ball-${p}`;const shadow=node(scene.root,shapes.circle(1,40),shadowLook);shadow.setLocalEulerAngles(-90,0,0);const ring=node(scene.root,shapes.ring(.83,.87,64),ringLook),inner=node(scene.root,shapes.ring(.89,.95,64),p===0?coral:teal),flash=node(scene.root,shapes.ring(.85,.9,64),pulseLook);flash.enabled=false;return {mesh,shadow,ring,inner,flash};});
 let practicing=settings.practice,practiceTime=0,time=-3;
 const finishPractice=()=>{if(!practicing)return;practicing=false;states.forEach((s,p)=>Object.assign(s,newKeeper(stage,p,n,reach,settings.speed/100)));gloves.all.forEach(g=>g.was=false);saveGoalieSettings({...settings,practice:false});};coach.onSkip(finishPractice);
 const tick=round(hud,60,()=>{music.stop();onEnd(states.map(s=>s.score),states.map(s=>{const r=keeperReport(s);return [r.rate===null?'Save rate — no resolved shots':`Save rate ${r.rate}% · ${s.saves}/${r.resolved}`,`${s.saves} ${s.saves===1?'save':'saves'} · ${s.misses} ${s.misses===1?'goal':'goals'} conceded`,`Best streak ${s.best}`,`${settings.reach==='comfort'?'Comfortable':'Full stretch'} reach`,`${lesson.title} · Stage ${stage}/5`,keeperSetupLabel(settings)];}));},.8);
 music.start(lesson.music,undefined,lesson.level);
 const snapshot=()=>({time,stage,settings:{...settings},mode,world:lesson.world,lesson:lesson.title,art:arena.art,rendering:'baked stadium / realtime skinned striker, gloves, ball and reactive net',practice:practicing,practiceLeft:practicing?Math.max(0,12-practiceTime):0,reach:settings.reach,music:music.diagnostics,seats:states.map((s,p)=>({phase:s.phase,age:s.age,target:{x:s.tx,y:s.ty,z:.25},ball:{...s.position},gold:s.gold,duration:s.duration,bend:s.bend,drill:s.drill,finale:s.finale,progress:keeperProgress(s.score,goals,stage===5),score:s.score,saves:s.saves,misses:s.misses,streak:s.streak,practiceSaves:s.practiceSaves,report:keeperReport(s),actor:actors[p]!.state(),gloves:gloves.all.slice(p*2,p*2+2).map(g=>({...g.state}))}))});
 const advance=(ms:number)=>{for(let i=0;i<Math.ceil(ms/(1000/60));i++)update(1/60);};
 if(import.meta.env.DEV||sim){const debug={states,actors,gloves,arena,balls,snapshot,advance,get time(){return time;},get practicing(){return practicing;}};Object.assign(window,{__goalie:debug,advanceTime:advance});scene.cleanup(()=>{delete(window as Window&{__goalie?:unknown}).__goalie;delete(window as Window&{advanceTime?:unknown}).advanceTime;});}
 const update=(rawDt:number)=>{
  const dt=Math.min(.05,rawDt);let t:number|null;
  if(practicing){if(players.slice(0,n).some(p=>p.present))practiceTime+=dt;if(practiceTime>=12||states.every(s=>s.practiceSaves>=2))finishPractice();if(practicing){t=-4;hud('clock','');hud('big','');}else t=tick(0);}else t=tick(rawDt);
  if(t===null)return;time=t;const hands=gloves.update(dt),motion=effects.on&&!pace.lean&&!reduced,clock=practicing?practiceTime:t;
  states.forEach((s,p)=>{
   if((practicing||t>=0)&&t<60){const event=stepKeeper(s,dt,Math.max(0,t),players[p].present,hands.slice(p*2,p*2+2),practicing);if(event==='kick'){actors[p]!.kick();sfx('impactPunch_medium',{vol:.22,rate:.7});}if(event==='save'){gloves.hit(p,s.hand);hitSound('impactSoft_heavy',s.streak,.62);sfx('impactPunch_medium',{vol:.22,rate:.9});if(!practicing&&(s.streak===3||s.streak%5===0))crowd.cheer();}if(event==='miss')sfx('impactSoft_heavy',{vol:.17,rate:.7});}
   actors[p]!.update(s,clock,dt,motion);
   const b=balls[p],active=['windup','flight','saved','miss'].includes(s.phase)&&t<60;show(b.mesh,active);show(b.shadow,active);b.mesh.setLocalPosition(s.position.x,s.position.y,s.position.z);b.mesh.setLocalEulerAngles(clock*390,clock*220,clock*100);tint(b.mesh,s.gold?'#f5c665':'#fff4df','diffuse');b.shadow.setLocalPosition(s.position.x,-3.185,s.position.z);const shade=.28+Math.max(0,s.position.y+3.2)*.035;b.shadow.setLocalScale(shade,shade,1);fade(b.shadow,Math.max(.04,.2-(s.position.y+3.2)*.018));
   const intro=!practicing&&t<0,demo=intro?keeperShot(stage,Math.floor((t+3)/.75),0,false):null,l=keeperLayout(n,p),tx=demo?l.cx+demo.x*l.k*reach:s.tx,ty=demo?demo.y*(n===1?1:.8):s.ty;const cue=settings.circles&&(intro||s.phase==='windup'||s.phase==='flight')&&t<60;show(b.ring,cue);show(b.inner,cue);if(cue){const u=intro||s.phase==='windup'?0:Math.min(1,s.age/s.duration),scale=l.hitRadius*(1.55-u*.55);b.ring.setLocalPosition(tx,ty,.3);b.inner.setLocalPosition(tx,ty,.31);b.ring.setLocalScale(scale,scale,1);b.inner.setLocalScale(scale,scale,1);b.inner.render!.meshInstances[0].material=s.gold&&!intro?gold:tx<l.cx?coral:teal;}
   const impact=s.phase==='saved'&&s.age<.35&&motion;show(b.flash,impact);if(impact){b.flash.setLocalPosition(s.tx,s.ty,.4);const size=keeperLayout(n,p).hitRadius*(1+s.age*2);b.flash.setLocalScale(size,size,1);fade(b.flash,.75*(1-s.age/.35));}
  });
  arena.update(states,motion);coach.update(states,t,players.slice(0,n).map(p=>p.present),practicing?Math.max(0,12-practiceTime):null,motion);music.intensity(practicing?.18:lesson.level+Math.min(.18,Math.max(...states.map(s=>s.streak))*.018)+(stage===5&&t>=50?.08:0));
 };
 return update;
}
