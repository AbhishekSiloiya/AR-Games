// One focused sports round: coach, visible mitt and collision share one target.
import {jabCoach} from '../jab-coach.ts';
import {jabActor} from '../jab-actor.ts';
import {jabArena} from '../jab-arena.ts';
import {jabGloves} from '../jab-gloves.ts';
import {jabTargets,stepJabSeat,strikeJab} from '../jab-pattern.ts';
import {jabSpace,jabStage,JAB_HOME} from '../jab-presentation.ts';
import {isLow,players,sim} from '../pose.ts';
import {effects,pace} from '../pace.ts';
import {flat,lit,node,shapes,show} from '../engine.ts';
import {round,zoneX,swept,music,hitSound,sfx,type Game} from '../kit.ts';
export const view={position:[0,0,11] as [number,number,number],fov:44.5,near:.1,far:80};
export default async function jab({n,stage,onEnd,hud,scene}:Game){
 const ui=jabCoach(scene,n,stage),states=ui.states;
 const world=jabStage(stage),layout=jabSpace(n);
 const [arena,actors]=await Promise.all([jabArena(scene,stage),Promise.all(Array.from({length:n},(_,p)=>jabActor(scene,p,n)))]);
 if(!arena||actors.some(actor=>!actor))return ()=>{};
 const gloves=jabGloves(scene,n);
 // A physical padded training rail, with sleeves and front-facing down marks.
 const barPad=lit('#31595c'),barCream=lit('#fff1d2'),barCoral=lit('#eb8567');
 const barBall=shapes.sphere(1,32),width=n===1?6.2:4.4;
 const bars=states.map((_,p)=>{
  const rail=node(scene.root);rail.name=`jab-duck-rail-${p}`;
  const tube=(x:number,radius:number,length:number,look:typeof barPad)=>{
   const part=node(rail,shapes.cylinder(radius,length,48),look,[x,0,0]);part.setLocalEulerAngles(0,0,90);return part;
  };
  tube(0,.155,width-.31,barPad);
  for(const sign of [-1,1]){
   const cap=node(rail,barBall,barCream,[sign*(width/2-.155),0,0]);cap.setLocalScale(.155,.155,.155);
   tube(sign*(width/2-.36),.166,.17,barCoral);
   tube(sign*(width/2-.5),.16,.035,barCream);
  }
  for(const x of [-.35,.35])for(const sign of [-1,1]){
   const chevron=node(rail,shapes.box(.19,.046,.025),barCream,[x+sign*.062,-.008,.156]);chevron.setLocalEulerAngles(0,0,sign*42);
  }
  rail.setLocalPosition(zoneX(n,p),2,.95);rail.enabled=false;return rail;
 });
 const impactMesh=shapes.ring(1.08,1.13,48),impactLook=flat('#fff5dc',{opacity:.8}),impacts=states.map(()=>node(scene.root,impactMesh,impactLook));impacts.forEach(e=>e.enabled=false);
 const tick=round(hud,60,()=>{music.stop();onEnd(states.map(s=>s.score),states.map(s=>[`${s.completed} clean combinations`,`${s.hits} hits · best streak ${s.best}`,...(s.finaleWon?['Finish challenge +6']:[])]));},1.1);
 music.start(world.theme,undefined,world.intensity);let time=-3;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const advance=(ms:number)=>{for(let i=0;i<Math.ceil(ms/(1000/60));i++)update(1/60);};
 const snapshot=()=>({time,stage,world:world.name,music:music.diagnostics,coordinates:'stage x right, y up; glove/mitt positions in world units',seats:states.map((s,p)=>({phase:s.phase,action:s.action,score:s.score,hits:s.hits,completed:s.completed,finaleStreak:s.finaleStreak,finaleWon:s.finaleWon,mitts:actors[p]!.state().mitts,gloves:gloves.all.slice(p*2,p*2+2).map(g=>({x:g.state.x,y:g.state.y,on:g.state.on}))}))});
 const diagnostic={states,actors,gloves,arena,advance,snapshot,get time(){return time;},get pads(){return states.map((s,p)=>{const target=actors[p]!.state().mitts[s.action.hand];return {...target,zone:p,life:s.phase==='strike'?1:0};});}};
 if(import.meta.env.DEV||sim){Object.assign(window,{__jab:diagnostic,advanceTime:advance});scene.cleanup(()=>{delete(window as Window&{__jab?:unknown}).__jab;delete (window as Window&{advanceTime?:unknown}).advanceTime;});}
 const update=(rawDt:number)=>{
  const t=tick(rawDt);if(t===null)return;time=t;const dt=Math.min(rawDt,.05),hands=gloves.update(dt);
  states.forEach((s,p)=>{
   if(t>=0&&t<60)stepJabSeat(s,dt,t,players[p].present,isLow(players[p]));
   const k=n===1?1:.78,targets=jabTargets(s,zoneX(n,p),k).map(target=>t>=60?{...target,active:false,x:zoneX(n,p)+(target.hand?1:-1)*JAB_HOME*k,y:1.35*k}:target),duck=t>=60?0:s.phase==='duck'?1:s.phase==='duckWarn'?Math.min(1,s.age/1.4)*.4:0;
   const mitts=actors[p]!.update(t,dt,targets,t>=60||s.phase==='combo'||t-s.finaleAt<.9?1:0,duck,effects.on&&!pace.lean&&!reduced),active=mitts[s.action.hand];
   if(t>=0&&t<60&&s.phase==='strike'&&players[p].present){
    const index=p*2+s.action.hand,h=hands[index],glove=gloves.all[index];
    if(h.on&&glove.armed&&swept(h,active.x,active.y,layout.hitRadius,4)&&strikeJab(s,s.action.hand,h.speed)){
     glove.armed=false;actors[p]!.hit(s.impactSide);hitSound('impactPunch_medium',s.streak,.65);if(s.index===4)sfx('confirmation',{vol:.5});
     impacts[p].setLocalPosition(active.x,active.y,.62);show(impacts[p],effects.on);
    }
   }
   if(s.impact>0&&t<60){const k=1+(1-s.impact)*.5;impacts[p].setLocalScale(k,k,1);}else show(impacts[p],false);
   const isBar=s.phase==='duckWarn'||s.phase==='duck';show(bars[p],isBar&&t<60);if(isBar)bars[p].setLocalPosition(zoneX(n,p),s.phase==='duck'?1.4:2.7-s.age/1.4*.9,.95);
  });
  ui.update(states,t,players.slice(0,n).map(p=>p.present));music.intensity(world.intensity+Math.min(.2,Math.max(...states.map(s=>s.streak))*.02)+(t>=50&&t<60?.22:0));
 };
 return update;
}
