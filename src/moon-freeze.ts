import { players, trackingSeen } from './pose.ts';
import { headAnchor } from './gear-motion.ts';
import { mirrorOn, toScreen, type Scene } from './engine.ts';
import { freshHoldChain, holdChain, partyLook } from './moon-experience.ts';
const text=(node:Element,value:string)=>{if(node.textContent!==value)node.textContent=value;};
import './moon-freeze.css';
export function moonFreeze(scene:Scene,n:number){
  const stage=document.querySelector('.stage');stage?.classList.add('moon-stage','moon-freeze-stage');
  const root=document.createElement('div');root.className='moon-freeze';root.dataset.look=partyLook();root.dataset.players=String(n);
  root.innerHTML='<div class="moon-arena-brand">MOON / FREEZE</div><div class="moon-freeze__edition">AFTER HOURS</div><div class="moon-freeze__cue"><small>THE MUSIC IS YOUR SIGNAL</small><strong role="status" aria-live="polite">GET READY</strong><span aria-hidden="true">Make room. Find your groove.</span></div>';
  const title=root.querySelector<HTMLElement>('.moon-freeze__cue strong')!,hint=root.querySelector<HTMLElement>('.moon-freeze__cue span')!,label=root.querySelector<HTMLElement>('.moon-freeze__cue small')!;
  const visors=partyLook()==='prism'?Array.from({length:n},()=>{const image=document.createElement('img');image.src='/assets/moon/prism-visor.png';image.className='moon-freeze__visor';image.alt='';image.hidden=true;root.append(image);return image;}):[];
  const seats=Array.from({length:n},(_,p)=>{const e=document.createElement('div');e.className='moon-freeze__seat';e.dataset.player=String(p);e.setAttribute('aria-hidden','true');e.innerHTML='<span></span><strong>FIRST HOLD AHEAD</strong><div class="moon-freeze__track"><i></i></div>';root.append(e);return {e,label:e.querySelector('span')!,chain:e.querySelector('strong')!,fill:e.querySelector('i')!,state:freshHoldChain(),reward:0};});
  stage?.append(root);scene.cleanup(()=>{root.remove();stage?.classList.remove('moon-stage','moon-freeze-stage');});
  return{
    complete(id:number,success:boolean[],present:boolean[]){seats.forEach((s,p)=>{const next=holdChain(s.state,id,success[p],present[p]);if(next!==s.state&&next.chain>s.state.chain)s.reward=1.8;s.state=next;});},
    update(t:number,dancing:boolean,remaining:number,duration:number,wobbles:boolean[],present:boolean[],dt:number){
      root.dataset.phase=t<0?'ready':dancing?'dance':'freeze';const phaseTitle=t<0?'GET READY':dancing?'DANCE':'FREEZE';if(title.textContent!==phaseTitle)title.textContent=phaseTitle;
      visors.forEach((image,p)=>{const pl=players[p],a=headAnchor(pl.body,pl.frame.aspect),at=a?toScreen(a.x,a.y+a.scale*.065,.9):null;image.hidden=!mirrorOn()||!present[p]||!a||!at||performance.now()-trackingSeen[p]>800;if(!image.hidden&&a&&at){image.style.left=`${at[0]*100}%`;image.style.top=`${at[1]*100}%`;image.style.width=`${a.scale*.72/16*100}%`;image.style.transform=`translate(-50%,-43%) rotate(${-a.angle}deg)`;}});
      text(label,t<0?'YOUR PARTY STARTS IN A MOMENT':dancing?'MUSIC ON · LIGHTS ON':'MUSIC OFF · HOLD YOUR POSE');
      text(hint,t<0?'Find your groove.':dancing?'Make it yours.':`${Math.max(1,Math.ceil(remaining))}s · Stay still. You've got this.`);
      seats.forEach((s,p)=>{s.reward=Math.max(0,s.reward-dt);s.e.dataset.reward=String(s.reward>0);s.e.dataset.wobble=String(wobbles[p]);text(s.label,n===1?'YOUR HOLD CHAIN':`PLAYER ${p+1} · HOLD CHAIN`);text(s.chain,!present[p]?'STEP INTO VIEW':s.reward>0?`NAILED IT · ${s.state.chain} IN A ROW`:s.state.chain?`${s.state.chain} CLEAN ${s.state.chain===1?'HOLD':'HOLDS'}`:t<0||dancing?'FIRST HOLD AHEAD':wobbles[p]?'RESET · TRY THE NEXT ONE':'HOLD STEADY');s.fill.style.transform=`scaleX(${t<0||dancing?0:Math.min(1,Math.max(0,1-remaining/Math.max(.1,duration)))})`;});
    },
  };
}
