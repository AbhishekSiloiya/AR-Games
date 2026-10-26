import './shapeup-overlay.css';
import { mascotPuppet } from './mascot-puppet.ts';
import { MASCOT_STAND } from './mascot-motion.ts';
import { poseBuild } from './pose-build.ts';
import type { ShapePhase, ShapeSeat } from './shapeup-rules.ts';
const text=(e:Element,s:string)=>{if(e.textContent!==s)e.textContent=s;};
export function shapeupOverlay(n:number,live:boolean){
 const stage=document.querySelector<HTMLElement>('.stage'),root=document.createElement('div');root.className=`shapeup-coach${live?'':' shapeup-coach-classic'}`;root.dataset.players=String(n);stage?.classList.add('shapeup-ar-stage');stage?.append(root);
 const seats=Array.from({length:n},(_,p)=>{
  const seat=document.createElement('section');seat.className='shapeup-seat';seat.style.setProperty('--seat',String(p));seat.style.setProperty('--players',String(n));seat.dataset.player=String(p);
  seat.innerHTML='<div class="shapeup-instruction"><h2>Copy Fuzzbyte</h2><span></span></div><div class="shapeup-coach-card"><div class="shapeup-target"></div><strong></strong></div><div class="shapeup-live-status" role="status" aria-live="polite"><strong></strong><div class="shapeup-match-track"><i></i></div><span></span></div><div class="shapeup-world"><div class="shapeup-tower"></div><img src="/assets/moon/rig/momo.webp" alt="Momo and Bloop climb your earned tower"/><strong>0 / 8</strong></div>';
  root.append(seat);const puppet=mascotPuppet(seat.querySelector('.shapeup-target')!,'fuzzbyte',`Player ${p+1} target pose`),blocks=Array.from({length:8},()=>{const b=document.createElement('i');b.hidden=true;seat.querySelector('.shapeup-tower')!.append(b);return b;});
  return {seat,puppet,title:seat.querySelector('h2')!,count:seat.querySelector('.shapeup-instruction span')!,card:seat.querySelector<HTMLElement>('.shapeup-coach-card')!,name:seat.querySelector('.shapeup-coach-card>strong')!,status:seat.querySelector<HTMLElement>('.shapeup-live-status')!,headline:seat.querySelector('.shapeup-live-status>strong')!,detail:seat.querySelector('.shapeup-live-status>span')!,fill:seat.querySelector<HTMLElement>('.shapeup-match-track i')!,world:seat.querySelector<HTMLElement>('.shapeup-world')!,blocks,buddy:seat.querySelector<HTMLElement>('.shapeup-world img')!,total:seat.querySelector('.shapeup-world>strong')!};
 });
 return {
  update(p:number,pose:number[],name:string,quality:number,remaining:number,fraction:number,index:number,valid:boolean,countdown:boolean,_verdict:string,phase:ShapePhase,feedback:string,statusText:string){
   const s=seats[p];s.seat.dataset.phase=phase;s.card.dataset.phase=phase;s.card.dataset.feedback=feedback;s.card.dataset.match=String(quality);s.card.dataset.pose=String(index);s.card.dataset.remaining=remaining.toFixed(2);s.card.dataset.ready=String(feedback==='matched'||feedback==='perfect');
   const label=name==='T'?'Arms out':name==='Y'?'Arms up & out':name;
   text(s.title,n===2?`P${p+1} · Copy Fuzzbyte`:'Copy Fuzzbyte');text(s.count,`${index+1} / 8`);text(s.name,phase==='rest'?'Relax':label);const blend=countdown||phase==='rest'?0:phase==='match'?Math.min(1,(1-fraction)*8):1;const demonstration=pose.map((angle,i)=>{const from=MASCOT_STAND[i],delta=Math.atan2(Math.sin(angle-from),Math.cos(angle-from));return from+delta*blend;});s.puppet.pose(demonstration,1-fraction);s.puppet.svg.setAttribute('aria-label',`Target pose: ${label}`);
   s.status.dataset.feedback=feedback;text(s.headline,phase==='rest'?'Nice. Take a breath.':statusText==='Find the shape'?'Make this pose':statusText);
   const detail=countdown?'First pose coming up':phase==='rest'?`Next pose in ${Math.ceil(remaining)}`:phase==='result'?quality>=60?'Tower piece earned!':'Fresh pose coming up':feedback==='matched'?'Matched! Relax.':!valid?'Keep hands and feet in view':feedback==='hold'?'Stay there…':`${Math.round(quality)}% match · ${Math.ceil(remaining)}s`;
   text(s.detail,detail);s.fill.style.transform=`scaleX(${phase==='rest'?Math.max(0,fraction):Math.max(0,Math.min(1,quality/80))})`;s.status.dataset.phase=phase;
  },
  quest(p:number,state:ShapeSeat,index:number,phase:ShapePhase){const s=seats[p],build=poseBuild(state.path),cheer=(phase==='result'||phase==='rest')&&state.path[index]>0;s.world.dataset.cells=String(build.cells);s.world.dataset.complete=String(build.complete);s.world.dataset.cheer=String(cheer);s.blocks.forEach((b,i)=>{b.hidden=i>=build.cells;b.style.bottom=`${i*9}%`;});s.buddy.style.bottom=`${8+build.cells*9}%`;s.buddy.style.transform=cheer?'rotate(-8deg)':'none';text(s.total,`${build.cells} / 8`);},
  dispose(){root.remove();stage?.classList.remove('shapeup-ar-stage');},
 };
}
