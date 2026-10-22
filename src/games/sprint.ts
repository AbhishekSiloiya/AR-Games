// Sprint — a short scenic race. The authored running loop supplies a clear character,
// while fresh jogging/arm-pump edges earn distance, stars, checkpoints and turbo.
import { Mesh } from 'playcanvas';
import { players, sim, trackingSeen } from '../pose.ts';
import { app, flat, node, own, shapes, show } from '../engine.ts';
import { scenicTrack } from '../scenic-track.ts';
import { modelPlayer } from '../model-player.ts';
import { jogDetector, raceAdvance, raceMedal, raceState } from '../scenic-race.ts';
import { PLAYER_COLORS, bestLine, bursts as makeBursts, hitSound, music, round, sfx, zoneX, type Game } from '../kit.ts';
import '../sprint-race.css';
const LENGTH=45,LINE=-3.2;
const atDepth=(s:number)=>{const k=s**2.4;return {y:.35+(LINE-.35)*k,size:.12+.88*k};};

export default async function sprint({n,team,best,onEnd,hud,scene}:Game){
  let disposed=false;scene.cleanup(()=>{disposed=true;});
  const world=scenicTrack(scene,n);
  const models=await Promise.all(Array.from({length:n},(_,p)=>modelPlayer(scene,{name:`sprint-model-player-${p}`,x:zoneX(n,p),y:LINE-.2,z:.5,height:3.5,yaw:180,color:PLAYER_COLORS[p]})));
  const bodies=models.filter(body=>body!==null);if(disposed||bodies.length!==n)return()=>{};
  bodies.forEach(body=>{body.play('Running',1,true);body.anim.baseLayer!.play('Running');});
  const stage=document.querySelector('.stage'),overlay=document.createElement('div');overlay.className='sprint-race';overlay.dataset.players=String(n);stage?.append(overlay);stage?.classList.add('scenic-race-stage');
  scene.cleanup(()=>{overlay.remove();stage?.classList.remove('scenic-race-stage');});
  const cards=Array.from({length:n},(_,p)=>{
    const card=document.createElement('section');card.className='sprint-race__card';card.dataset.player=String(p);card.style.setProperty('--seat',String(p));
    const title=document.createElement('strong');title.className='sprint-race__title';title.textContent=n===1?'SCENIC STAR RACE':`RUNNER ${p+1} · CHASE THE STARS`;
    const stats=document.createElement('div');stats.className='sprint-race__stats';const distance=document.createElement('b'),stars=document.createElement('span');stats.append(distance,stars);
    const action=document.createElement('p');action.className='sprint-race__action';
    const charge=document.createElement('progress');charge.max=3;charge.setAttribute('aria-label',`Player ${p+1} turbo charge`);
    const next=document.createElement('small');card.append(title,stats,action,charge,next);overlay.append(card);return {card,distance,stars,action,charge,next};
  });
  const starMesh=own(new Mesh(app.graphicsDevice)),positions=[0,0,0],normals=[0,0,1],indices:number[]=[];
  for(let k=0;k<=10;k++){const a=Math.PI/2+k*Math.PI/5,r=k%2?.14:.34;positions.push(Math.cos(a)*r,Math.sin(a)*r,0);normals.push(0,0,1);if(k)indices.push(0,k,k+1);}
  starMesh.setPositions(positions);starMesh.setNormals(normals);starMesh.setIndices(indices);starMesh.update();
  const gold=flat('#ffe071'),mint=flat('#7df4df'),trailLook=flat('#93e7ff',{opacity:.65});
  const runners=Array.from({length:n},(_,p)=>{
    const gate=node(scene.root);gate.name=`sprint-checkpoint-${p}`;
    for(const side of [-1,1]){const post=node(gate,shapes.quad(.10,2.2),mint,[side*1.7,1.1,0]);post.setLocalEulerAngles(0,0,side*-6);}
    node(gate,shapes.quad(3.5,.16),mint,[0,2.2,0]);
    const stars=Array.from({length:3},(_,i)=>{const e=node(scene.root,starMesh,gold);e.name=`sprint-star-${p}-${i}`;return e;});
    const aura=node(scene.root,shapes.ring(.5,.58,28),trailLook,[zoneX(n,p),LINE,.8]);aura.setLocalScale(1.7,.28,1);
    return {state:raceState(),detect:jogDetector(),speed:0,moving:false,source:'none',gate,stars,aura};
  });
  const bursts=makeBursts(scene.root),passed=bestLine(hud,best);let scenery=0,time=-3,started=false;
  const total=()=>team?runners.reduce((sum,r)=>sum+r.state.metres,0):Math.max(...runners.map(r=>r.state.metres));
  const tick=round(hud,LENGTH,()=>{music.stop();onEnd(runners.map(r=>Math.round(team?total():r.state.metres)),runners.map(r=>[`${raceMedal(team?total():r.state.metres)} · Scenic star race`,`${r.state.stars} stars · ${r.state.checkpoints} checkpoints`,`${r.state.boosts} turbo boosts`,`${r.state.steps} movement beats`]));});
  const diagnostics=()=>({time,heat:time<0?-1:0,resting:false,scenery,players:runners.map((r,p)=>({...r.state,speed:r.speed,moving:r.moving,source:r.source,clip:bodies[p].clip,animationTime:bodies[p].anim.baseLayer!.activeStateCurrentTime}))});
  Object.assign(window,{__sprint:diagnostics});scene.cleanup(()=>{delete(window as Window&{__sprint?:unknown}).__sprint;});music.start('run');
  return(rawDt:number)=>{
    const dt=Math.min(.05,rawDt),t=tick(rawDt);if(t===null)return;time=t;
    if(t>=0&&!started){started=true;hud.banner('Chase the stars!',1200);}
    let average=0;
    runners.forEach((r,p)=>{
      const pl=players[p],fresh=pl.present&&(sim||trackingSeen[p]>0&&performance.now()-trackingSeen[p]<600);
      const motion=r.detect(pl.rig,t,sim?Math.floor(t*60):trackingSeen[p],fresh&&t>=0,pl.frame?.y??0,pl.frame?.sw??.2);
      const previous=r.state;r.state=raceAdvance(previous,motion.beat,dt);r.moving=motion.moving;r.source=motion.source;
      r.speed=motion.pace*2.2*(r.state.boost>0?1.6:1);average+=r.speed/n;
      const body=bodies[p];body.show(pl.present);body.place(zoneX(n,p)+Math.max(-.5,Math.min(.5,pl.lean*.35)),LINE-.2);
      // Keep the visible warm-up jog alive. This animation never awards distance or stars.
      body.play('Running',t<0?.8:motion.moving?Math.min(2.4,.95+motion.pace*.22+(r.state.boost>0?.25:0)):.85);
      if(r.state.steps>previous.steps){bursts.burst(body.at.x,LINE,.6,r.state.boost>0?'#93e7ff':'#ffe071',5,3);sfx('footstep_concrete',{vol:.25});}
      if(r.state.stars>previous.stars){bursts.burst(body.at.x,LINE+1.7,.8,'#ffe071',16,5);hud.pop(body.at.x,LINE+1.8,`★ ${r.state.stars}`,'#ffe071');hitSound('select',r.state.stars,.45);}
      if(r.state.checkpoints>previous.checkpoints){hud.pop(body.at.x,1.1,'CHECKPOINT!','#7df4df');sfx('confirmation',{vol:.6});}
      if(r.state.boosts>previous.boosts){hud.pop(body.at.x,.6,'TURBO!','#93e7ff');sfx('powerUp',{vol:.6});}
      const gate=atDepth((r.state.metres%30)/30);r.gate.setLocalPosition(zoneX(n,p),gate.y,.2);r.gate.setLocalScale(gate.size,gate.size,1);
      r.stars.forEach((e,i)=>{const s=((r.state.metres/6+i)/3)%1,pos=atDepth(s);e.setLocalPosition(zoneX(n,p)+Math.sin(i*2.1)*.8*pos.size,pos.y+.7*pos.size,1);e.setLocalScale(pos.size,pos.size,1);e.setLocalEulerAngles(0,0,t*65+i*35);});
      show(r.aura,r.state.boost>0&&motion.moving);r.aura.setLocalPosition(body.at.x,LINE,.8);
      const card=cards[p],boosting=r.state.boost>0&&motion.moving;
      card.distance.textContent=`${Math.round(team?total():r.state.metres)} m`;card.stars.textContent=`★ ${r.state.stars}`;
      card.action.textContent=!fresh?'Step into view':t<0?'Get ready to chase stars':boosting?'TURBO · KEEP IT GOING!':motion.moving?'Great pace — chase the next star!':'Jog or pump your arms to accelerate';
      card.charge.value=r.state.boost>0?3:r.state.charge;card.next.textContent=`${Math.ceil(30-r.state.metres%30)} m to checkpoint · ${r.state.boost>0?`${Math.ceil(r.state.boost)}s turbo`:'3 stars charge turbo'}`;
      card.card.dataset.boost=String(boosting);card.card.dataset.stars=String(r.state.stars);hud.p('s',p,`${Math.round(team?total():r.state.metres)} m`);hud.p('h',p,'');
    });
    scenery+=dt*(4+average*1.4);world.drive(scenery,dt);bursts.update(dt);passed(total());music.intensity(.35+Math.min(.65,average/12));
  };
}
