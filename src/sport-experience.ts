import type { Scene } from './engine.ts';
import { effects, pace } from './pace.ts';
import { players } from './pose.ts';
import { mascotPuppet } from './mascot-puppet.ts';
import { mascotPose } from './mascot-motion.ts';
import { combinationProgress } from './sport-rules.ts';
import './sport-experience.css';
const put=(e:Element,value:string)=>{if(e.textContent!==value)e.textContent=value;};
// Every moving layer follows the game clock, so pause/tracking-loss freezes the whole arena.
export function sportExperience(scene:Scene,n:number,kind:'goalie'|'jab') {
  const stage=document.querySelector<HTMLElement>('.stage');
  const root=document.createElement('div');root.className=`moon-sport moon-sport--${kind}`;root.dataset.players=String(n);
  root.innerHTML='<div class="moon-sport__lights" aria-hidden="true"><i></i><i></i><i></i></div><div class="moon-sport__host" aria-hidden="true"><div class="moon-sport__actor"></div><span>MOODI / YOUR CORNER</span></div><div class="moon-sport__identity">MOON / '+(kind==='goalie'?'STADIUM NIGHTS':'THE CORNER CLUB')+'</div>';
  const host=root.querySelector<HTMLElement>('.moon-sport__host')!,puppet=mascotPuppet(host.querySelector('.moon-sport__actor')!,'moodi','Moodi helps you reach and celebrates your saves'),lights=[...root.querySelectorAll<HTMLElement>('.moon-sport__lights i')];

  const seats=Array.from({length:n},(_,p)=>{
    const e=document.createElement('div');e.className='moon-sport__seat';e.dataset.player=String(p);
    e.innerHTML='<small></small><strong role="status" aria-live="polite"></strong><div class="moon-sport__track"><i></i><b></b><b></b><b></b></div><span></span>';
    root.append(e);return {e,label:e.querySelector('small')!,cue:e.querySelector('strong')!,hint:e.querySelector('span')!,fill:e.querySelector<HTMLElement>('.moon-sport__track i')!,event:'',until:0};
  });
  stage?.classList.add('moon-sport-stage',`moon-sport-stage--${kind}`);stage?.append(root);
  scene.cleanup(()=>{root.remove();stage?.classList.remove('moon-sport-stage',`moon-sport-stage--${kind}`);});
  let activeUntil=0;
  return {
    react(p:number,text:string,t:number,good:boolean){const s=seats[p];s.event=text;s.until=t+1.25;s.e.dataset.reaction=good?'good':'miss';activeUntil=t+1.25;},
    update(t:number,combos:number[],present:boolean[],cues:string[],details:string[]){
      const motion=effects.on&&!pace.lean&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
      const active=t<activeUntil&&t>=0;
      host.hidden=!present[0];puppet.update(active?mascotPose([2.1,1.6,1,1.5,-1.66,-1.57,-1.48,-1.57]):players[0].rig,t,0);
      host.style.transform=motion?`translateY(${Math.sin(Math.max(0,t)*3)*.55}%) rotate(${active?-3:Math.sin(t)*1.2}deg)`:'none';
      root.dataset.active=String(active);root.dataset.motion=String(motion);
      lights.forEach((e,i)=>{e.style.transform=motion?`rotate(${Math.sin(t*.7+i*1.8)*(kind==='goalie'?13:20)}deg)`:'none';});
      seats.forEach((s,p)=>{
        const progress=combinationProgress(combos[p]);s.e.dataset.present=String(present[p]);
        put(s.label,n===1?(kind==='goalie'?'YOUR SAVE STREAK':'YOUR COMBINATION'):`PLAYER ${p+1} / ${kind==='goalie'?'KEEPER':'BOXER'}`);
        put(s.cue,!present[p]?'STEP INTO VIEW':s.until>t?s.event:t<0?'GET READY':cues[p]);
        put(s.hint,!present[p]?'Keep your hands visible':s.until>t?details[p]:kind==='goalie'?details[p]:progress.remaining===0?'Four clean hits. Keep it going.':`${progress.remaining} clean ${progress.remaining===1?'punch':'punches'} to complete the combination`);
        s.fill.style.transform=`scaleX(${kind==='goalie'?Math.min(1,combos[p]/5):progress.fill})`;
        if(s.until<=t)s.e.dataset.reaction='';
      });
    },
  };
}
