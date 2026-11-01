import { effects } from './pace.ts';
import { players } from './pose.ts';
import { mascotPuppet } from './mascot-puppet.ts';
import type { Scene } from './engine.ts';
import { partyMotion, partyReward, stepParty } from './freeze-party-rules.ts';
import { clubScene, stepClub, cheerClub } from './club-groove.ts';
import './freeze-party.css';
export function freezeParty(scene:Scene,n:number){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.createElement('div');root.className='freeze-party';root.dataset.players=String(n);root.setAttribute('aria-hidden','true');
 root.innerHTML='<div class="freeze-party__world"></div><div class="freeze-party__ceiling">MOON SOCIAL CLUB</div><div class="freeze-party__host"><span>FUZZBYTE · MOVES WITH YOU</span></div>';
 const host=root.querySelector('.freeze-party__host')!,puppet=mascotPuppet(host,'fuzzbyte','Fuzzbyte dance partner');
 const sparkles=Array.from({length:16},()=>{const e=document.createElement('span');e.className='freeze-party__confetti';e.hidden=true;e.textContent='✦';root.append(e);return {e,life:0,x:0,y:0,vx:0,vy:0};});
 document.querySelector('.stage')?.append(root);scene.cleanup(()=>root.remove());const state=partyMotion(),club=clubScene();let celebrations=0;
 const diagnostics={get angle(){return state.angle;},get lightTime(){return state.lightTime;},get dancing(){return state.dancing;},get confetti(){return sparkles.filter(q=>q.life>0).length;},get celebrations(){return celebrations;},get visible(){return root.isConnected;},get host(){return club.cheer>0?'cheer':state.dancing?'dance':'hold';},get visualTime(){return club.time;},get reduced(){return reduced||!effects.on;}};
 return {state:diagnostics,
  celebrate(p:number,id:number,present:boolean,still:boolean){if(!partyReward(state,p,id,present,still))return;cheerClub(club,p,id,present,still);celebrations++;if(reduced||!effects.on)return;for(let i=0;i<8;i++){const q=sparkles[p*8+i];q.life=1.4;q.x=n===1?50:p?75:25;q.y=15;q.vx=(i-3.5)*3;q.vy=5+i;}},
  update(dancing:boolean,dt:number){stepParty(state,dancing,dt);stepClub(club,dancing,dt);root.dataset.phase=dancing?'dance':'freeze';root.dataset.effects=String(effects.on&&!reduced);root.style.setProperty('--party-glow',dancing&&effects.on&&!reduced?['#ffb7df','#91f4ed','#e2b0ff'][Math.floor(club.time*2.1)%3]:'#d9edff');host.setAttribute('data-cheer',String(club.cheer>0));
   const pl=players[0];puppet.svg.style.visibility=pl.present?'visible':'hidden';if(dancing&&pl.present)puppet.update(pl.rig,club.time,club.cheer>0&&!reduced?.18:0);
   for(const q of sparkles){if(q.life>0&&dancing){q.life=Math.max(0,q.life-dt);q.x+=q.vx*dt;q.y+=q.vy*dt;}q.e.hidden=q.life<=0||reduced||!effects.on;q.e.style.left=`${q.x}%`;q.e.style.top=`${q.y}%`;q.e.style.opacity=String(Math.min(1,q.life));}
  },
 };
}
