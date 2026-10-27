import type {Scene} from './engine.ts';
import {newJabSeat,jabWindow,type JabSeat} from './jab-pattern.ts';
import {jabStage} from './jab-presentation.ts';
import './jab-coach.css';
export function jabCoach(scene:Scene,n:number,stage:number){
 const host=document.querySelector<HTMLElement>('.stage'),root=document.createElement('div');root.className='jab-session';root.dataset.players=String(n);host?.classList.add('jab-focus-stage');host?.append(root);document.body.classList.add('jab-focus-live');
 const world=jabStage(stage);root.dataset.lighting=stage>=3?'evening':'day';if(host)host.dataset.jabLighting=root.dataset.lighting;
 const caption=document.createElement('small');caption.className='jab-session-world';root.append(caption);
 const brand=document.createElement('div');brand.className='jab-session-brand';brand.innerHTML='<span>MOON</span><b>JAB</b>';root.append(brand);
 const seats=Array.from({length:n},(_,p)=>{
  const el=document.createElement('div');el.className='jab-session-seat';el.dataset.player=String(p);el.style.setProperty('--seat',String(p));
  el.innerHTML='<div class="jab-session-score"><b>0</b><span>BUILD A COMBO</span></div><div class="jab-session-cue"><strong>READY</strong><div class="jab-session-pattern" aria-label="Four-punch combination"><span>L</span><span>R</span><span>L</span><span>R</span></div><div class="jab-session-window"><i></i></div></div><div class="jab-session-feedback" role="status" aria-live="polite"></div>';
  root.append(el);return {el,score:el.querySelector('b')!,sub:el.querySelector('.jab-session-score>span')!,cue:el.querySelector('strong')!,dots:[...el.querySelectorAll<HTMLElement>('.jab-session-pattern>span')],window:el.querySelector<HTMLElement>('.jab-session-window>i')!,feedback:el.querySelector('.jab-session-feedback')!,last:''};
 });
 scene.cleanup(()=>{root.remove();host?.classList.remove('jab-focus-stage');if(host)delete host.dataset.jabLighting;document.body.classList.remove('jab-focus-live');});
 return {seats,states:Array.from({length:n},()=>newJabSeat(stage)),update(states:JabSeat[],t:number,present:boolean[]){
 caption.textContent=t>=50&&t<60?'FINAL 10 · FOUR CLEAN HITS':`${world.name} · ${world.stage}/5`;root.dataset.finale=String(t>=50&&t<60);
 seats.forEach((ui,p)=>{
   const s=states[p],duck=s.phase==='duck'||s.phase==='duckWarn';
   const label=t>=60?'ROUND COMPLETE':!present[p]?'STEP INTO VIEW':t<0?'GLOVES UP':duck?'DUCK':s.phase==='combo'?'COMBO COMPLETE':s.phase==='reset'?'RESET YOUR GUARD':s.phase==='recover'?'NICE HIT':`${s.action.cross?'CROSS · ':''}${s.action.hand===0?'LEFT':'RIGHT'} JAB`;
   ui.cue.textContent=label;ui.score.textContent=String(s.score);ui.sub.textContent=t>=50&&t<60?s.finaleWon?'FINISH BONUS +6':`FINISH ${s.finaleStreak}/4 · BONUS +6`:s.completed?`${s.completed} COMBO${s.completed===1?'':'S'} · BEST STREAK ${s.best}`:'FOUR CLEAN HITS · ONE COMBO';
   ui.el.dataset.phase=s.phase;ui.el.dataset.hand=String(s.action.hand);ui.el.dataset.combo=String(s.completed);
   ui.dots.forEach((dot,i)=>{const seq=s.roundAt<12?[0,1,0,1]:[[0,1,0,1],[0,0,1,1],[1,0,1,0]][s.pattern%3];dot.textContent=seq[i]===0?'L':'R';dot.dataset.state=i<s.index?'done':i===s.index?'current':'next';});
   ui.window.style.transform=`scaleX(${s.phase==='strike'?Math.max(0,1-s.age/jabWindow(s)):0})`;
   const feedback=t-s.finaleAt<1.2?'FINISH BONUS +6':s.phase==='combo'?'FOUR FOR FOUR':s.phase==='reset'?s.feedback:s.phase==='recover'?s.feedback:'';if(ui.last!==feedback){ui.feedback.textContent=feedback;ui.last=feedback;}
  });}};
}
