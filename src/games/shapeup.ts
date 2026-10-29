// One clear pose, the live player, and a genuinely earned match before a short reset.
import {players,sim,trackingSeen} from '../pose.ts';
import {shapeTrackedBody,shapeRank} from '../shapeup-rules.ts';
import {newShapeQuest,stepShapeQuest,resetShapeHold,shapeGuidance,SHAPE_POSES,SHAPE_STAND} from '../shape-quest.ts';
import {shapeArena} from '../shape-arena.ts';
import {shapeCoach} from '../shape-coach.ts';
import {shapeupOverlay} from '../shapeup-overlay.ts';
import {audio,music,hitSound,sfx,type Game} from '../kit.ts';
import {effects,pace} from '../pace.ts';
export default async function shapeUp({n,stage,onEnd,hud,scene}:Game){
 let disposed=false;scene.cleanup(()=>{disposed=true;});const [world,actor]=await Promise.all([shapeArena(scene,n),shapeCoach(scene)]);if(disposed||!world||!actor)return()=>{};
 const quest=newShapeQuest(stage,n),coach=shapeupOverlay(n,stage),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=audio().currentTime+3;music.start('pose',undefined,.38);
 let forced=0,last=-3,lastWall=performance.now(),guard=0,ended=false;
 const reset=()=>{resetShapeHold(quest);guard=performance.now()+150;lastWall=performance.now();};window.addEventListener('keydown',reset,true);window.addEventListener('click',reset,true);
 scene.cleanup(()=>{coach.dispose();music.stop();window.removeEventListener('keydown',reset,true);window.removeEventListener('click',reset,true);delete(window as Window&{__shapeup?:unknown}).__shapeup;delete(window as Window&{advanceTime?:unknown}).advanceTime;});
 const snapshot=()=>({time:quest.time,stage,phase:quest.phase,index:quest.index,pose:SHAPE_POSES[quest.index][0],target:SHAPE_POSES[quest.index][1],remaining:quest.remaining,matchSeconds:quest.matchSeconds,camera:{...world.state},character:actor.state(),held:[...quest.held],quality:[...quest.quality],seats:quest.seats.map(s=>({...s,path:[...s.path]}))});
 const advance=(ms:number)=>{for(let f=0;f<Math.ceil(ms/(1000/60));f++){forced+=1/60;update();}};
 Object.assign(window,{__shapeup:{quest,actor,snapshot,advance,order:SHAPE_POSES,get seats(){return quest.seats;},get index(){return quest.index;},get phase(){return quest.phase;},get remaining(){return quest.remaining;}},advanceTime:advance});
 const update=()=>{
  if(disposed||ended)return;const now=performance.now(),t=audio().currentTime-start+forced,dt=Math.max(0,t-last);last=t;if(now-lastWall>180)reset();lastWall=now;
  const target=SHAPE_POSES[quest.index][1],valid=players.slice(0,n).map((p,i)=>p.present&&(sim||now-trackingSeen[i]<=180&&trackingSeen[i]>0&&shapeTrackedBody(p.body))&&now>=guard);
  const guidance=players.slice(0,n).map(p=>shapeGuidance(p.angles??(sim&&p.hands[1].y>.5?target:SHAPE_STAND),target));const before=quest.seats.map(s=>s.score);
  stepShapeQuest(quest,dt,t,guidance.map((s,p)=>({...s,valid:valid[p]})));
  quest.seats.forEach((s,p)=>{if(s.score>before[p])hitSound(s.verdict==='perfect'?'powerUp':'confirmation',s.combo*2,.5);else if(s.judged&&s.score===before[p]&&s.verdict==='absent'&&quest.phase==='result'&&quest.remaining===1.2)sfx('impactWood_heavy',{vol:.15});hud.p('s',p,String(s.score));hud.p('h',p,'');});
  if(quest.done){ended=true;music.stop();onEnd(quest.seats.map(s=>s.score),quest.seats.map(s=>[`${shapeRank(s.stars).medal} · ${shapeRank(s.stars).rank}`,`${s.stars}/24 pose stars`,`${s.path.filter(v=>v>=2).length}/8 poses matched`,`Best chain ×${s.bestCombo}`]));return;}
  const motion=effects.on&&!pace.lean&&!reduced;music.intensity(quest.phase==='match'?.42:.18);actor.update(quest.phase==='rest'||quest.phase==='countdown'?SHAPE_STAND:SHAPE_POSES[quest.index][1],Math.min(.05,dt),t,quest.serial,motion);world.update(guidance.map(s=>s.groups),valid,quest.seats.map(s=>s.locked));coach.update(quest,SHAPE_POSES[quest.index][0],guidance,valid,motion);hud('clock',String(Math.ceil(quest.remaining)));
 };
 return update;
}
