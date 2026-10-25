import { toScreen, type Scene } from './engine.ts';
import { effects } from './pace.ts';
import { sliceMomentum } from './moon-experience.ts';
const text=(node:Element,value:string)=>{if(node.textContent!==value)node.textContent=value;};
import './moon-slice.css';

export function moonSlice(scene:Scene,n:number,team:boolean){
  const stage=document.querySelector('.stage');stage?.classList.add('moon-stage','moon-slice-stage');
  const root=document.createElement('div');root.className='moon-slice';root.dataset.players=String(n);
  root.innerHTML='<div class="moon-arena-brand">MOON / SLICE</div><div class="moon-slice__phase"></div><div class="moon-slice__instruction" role="status" aria-live="polite">SWIPE FRUIT. SKIP BOMBS.</div>';
  const phase=root.querySelector<HTMLElement>('.moon-slice__phase')!,instruction=root.querySelector<HTMLElement>('.moon-slice__instruction')!;
  const seats=Array.from({length:team?1:n},(_,p)=>{
    const e=document.createElement('div');e.className='moon-slice__momentum';e.dataset.player=String(p);
    e.innerHTML='<span class="moon-slice__label"></span><strong></strong><div class="moon-slice__track"><i></i></div><small></small>';root.append(e);
    return {e,label:e.querySelector('span')!,value:e.querySelector('strong')!,fill:e.querySelector('i')!,next:e.querySelector('small')!};
  });
  const flashes=Array.from({length:10},()=>{
    const e=document.createElement('div');e.className='moon-slice__impact';e.hidden=true;e.setAttribute('aria-hidden','true');
    e.innerHTML='<svg viewBox="0 0 160 100"><ellipse cx="80" cy="50" rx="49" ry="24"/><path d="M4 59L62 46 23 20 78 39 102 4 97 40 155 26 109 50 152 82 96 62 72 98 69 61Z"/><path class="moon-slice__cut" d="M2 72L158 28"/></svg><b></b>';root.append(e);return {e,text:e.querySelector('b')!,life:0,x:0,y:0,angle:0};
  });
  stage?.append(root);scene.cleanup(()=>{root.remove();stage?.classList.remove('moon-stage','moon-slice-stage');});
  let next=0;
  return {
    impact(x:number,y:number,combo:number,kind:'cut'|'bomb'|'power'|'slash',direction=0){
      if(!effects.on)return;
      const at=toScreen(x,y,0);if(!at)return;
      const f=flashes[next++%flashes.length];f.x=at[0]*100;f.y=at[1]*100;f.life=kind==='cut'?.28:.7;f.angle=direction;
      f.e.dataset.kind=kind;f.text.textContent=kind==='bomb'?'RESET':kind==='power'?'POWER UP':kind==='slash'?`${combo} IN ONE!`:combo>0&&combo%5===0?`${combo} STREAK`:'';
    },
    update(dt:number,t:number,mode:string,combos:number[],powers:({name:string;seconds:number}|null)[],finale:boolean){
      root.dataset.phase=finale?'finale':mode==='zen'?'zen':t<0?'ready':t>50&&mode===''?'frenzy':'play';
      text(phase,finale?'FINAL CUT':mode==='zen'?'ZEN SESSION':mode==='classic'?'CLASSIC':t<0?'GET READY':t>50?'FRENZY':'CITRUS CLUB');
      const action=finale?'SMASH THE MELON':t<6?'SWIPE FRUIT. SKIP BOMBS.':'CHAIN YOUR NEXT CUT';if(instruction.textContent!==action)text(instruction,action);
      seats.forEach((s,p)=>{const combo=team?Math.min(...combos.slice(0,n)):combos[p],m=sliceMomentum(combo),power=powers[team?0:p];text(s.label,team?'TEAM FLOW':n>1?`PLAYER ${p+1}`:'YOUR FLOW');text(s.value,power?power.name:m.label);s.fill.style.transform=`scaleX(${m.fill})`;text(s.next,power?`${Math.ceil(power.seconds)}s remaining · ${combo} streak`:`${combo} streak · ${m.next} to next milestone`);});
      for(const f of flashes){f.life=Math.max(0,f.life-dt);f.e.hidden=f.life<=0;if(f.life>0){f.e.style.left=`${f.x}%`;f.e.style.top=`${f.y}%`;f.e.style.opacity=String(Math.min(1,f.life*7));f.e.style.transform=`translate(-50%,-50%) rotate(${f.angle}deg) scale(${1+(1-Math.min(1,f.life/.28))*.3})`;}}
    },
  };
}
