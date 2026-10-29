// Bright studio with one skinned dance partner and an unfiltered live-camera surface.
import {players,trackingSeen,sim,tuning} from '../pose.ts';
import {audio,say,sfx,type Game} from '../kit.ts';
import {effects,pace} from '../pace.ts';
import {startDanceTrack} from '../dance-music.ts';
import {newFreezeStudio,stepFreezeStudio,freezeLesson} from '../freeze-studio-rules.ts';
import {freezeStudioScene} from '../freeze-studio-scene.ts';
import {freezeDancer} from '../freeze-dancer.ts';
import {freezeMovement} from '../freeze-movement.ts';
import {freezeStudioCoach} from '../freeze-studio-coach.ts';
export default async function freeze({n,stage,onEnd,hud,scene,cleanup}:Game){
 const [world,actor]=await Promise.all([freezeStudioScene(scene),freezeDancer(scene)]);if(!world||!actor)return()=>{};
 const studio=newFreezeStudio(stage,n),coach=freezeStudioCoach(scene,n,stage),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=audio().currentTime+3,soundtrack=startDanceTrack(start);
 let forced=0,last=-3,lastWall=performance.now(),ended=false;
 const meters=Array.from({length:n},()=>freezeMovement());
 const reset=()=>{meters.forEach(m=>m.reset());lastWall=performance.now()+forced*1000;};window.addEventListener('keydown',reset,true);window.addEventListener('click',reset,true);cleanup(()=>{soundtrack.stop();window.removeEventListener('keydown',reset,true);window.removeEventListener('click',reset,true);delete(window as Window&{__freeze?:unknown}).__freeze;delete(window as Window&{advanceTime?:unknown}).advanceTime;});
 const snapshot=()=>({time:studio.time,stage,lesson:freezeLesson(stage).title,phase:studio.done?'complete':studio.time<0?'ready':studio.dancing?'dance':'freeze',pose:studio.pose,phaseEnd:studio.phaseEnd,visualTime:studio.visualTime,camera:{...world.state},character:actor.state(),seats:studio.seats.map(s=>({...s,score:Math.floor(s.score)}))});
 const advance=(ms:number)=>{for(let f=0;f<Math.ceil(ms/(1000/60));f++){forced+=1/60;update();}};
 Object.assign(window,{__freeze:{studio,actor,snapshot,advance,get time(){return studio.time;},get dancing(){return studio.dancing;},get phaseEnd(){return studio.phaseEnd;},get scores(){return studio.seats.map(s=>s.score);},party:{get visualTime(){return studio.visualTime;},get celebrations(){return studio.seats.reduce((a,s)=>a+s.holds,0);}}},advanceTime:advance});
 const update=()=>{
  if(ended)return;const now=performance.now()+forced*1000,t=audio().currentTime-start+forced,dt=Math.max(0,t-last);if(now-lastWall>150)reset();lastWall=now;last=t;
  const samples=players.slice(0,n).map((p,i)=>{const present=p.present&&(sim||now-trackingSeen[i]<800);const rate=meters[i].sample(p.energy,sim?now:trackingSeen[i],now,present&&t>=0);return {present,rate,rig:p.rig};});
  const dancing=studio.dancing,holds=studio.seats.map(s=>s.holds);stepFreezeStudio(studio,dt,t,samples,tuning.freezeStill);
  if(studio.done){ended=true;soundtrack.stop();say('time_over');onEnd(studio.seats.map(s=>Math.floor(s.score)),studio.seats.map(s=>[`Clean holds ${s.holds}/${s.attempts}`,`Best chain ${s.best}`,`${Math.round(s.danceSeconds)} seconds moving`,freezeLesson(stage).title]));return;}
  soundtrack.gate(studio.dancing&&t>=0);if(dancing!==studio.dancing)sfx(studio.dancing?'zapThreeToneUp':'zapThreeToneDown',{vol:.4,jitter:0});studio.seats.forEach((s,p)=>{if(s.holds>holds[p])sfx('select',{vol:.55,rate:1+Math.min(5,s.chain)*.08,jitter:0});});
  hud('clock',String(Math.ceil(t<0?-t:Math.max(0,60-t))));const motion=effects.on&&!pace.lean&&!reduced,demonstrate=!studio.dancing||studio.phaseEnd-t<1.4;
  actor.update(players[0].rig,studio.dancing&&t>=0,demonstrate?studio.pose:'free',studio.visualTime,Math.max(...studio.seats.map(s=>s.cheer)),motion,players[0].lift);world.update(studio.visualTime,motion);coach.update(studio,samples.map(s=>s.present),motion);
 };
 return update;
}
