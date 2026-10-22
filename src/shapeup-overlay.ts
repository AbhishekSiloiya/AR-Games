import './shapeup-overlay.css';
import type { ShapePhase, ShapeSeat } from './shapeup-rules.ts';
const NS='http://www.w3.org/2000/svg';
const JOINTS=[[-.75,2],[0,0],[.75,2],[0,0],[-.4,0],[0,0],[.4,0],[0,0]];
const LENGTHS=[1.1,1,1.1,1,1.5,1.4,1.5,1.4];
const svgNode=(name:string,attrs:Record<string,string>)=>{const e=document.createElementNS(NS,name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
export function shapeupOverlay(n:number,live:boolean){
  const host=document.querySelector<HTMLElement>('.stage');
  const root=document.createElement('div');root.className=`shapeup-coach${live?'':' shapeup-coach-classic'}`;root.dataset.players=String(n);
  host?.classList.add('shapeup-ar-stage');host?.append(root);
  const quests=Array.from({length:n},(_,p)=>{
    const quest=document.createElement('section');quest.className='shapeup-quest';quest.dataset.player=String(p);quest.style.setProperty('--seat',String(p));quest.style.setProperty('--players',String(n));quest.setAttribute('aria-label',`Player ${p+1} eight-pose quest`);
    const header=document.createElement('div');header.className='shapeup-quest-header';
    const title=document.createElement('strong');title.textContent=n===2?`P${p+1} · POSE QUEST`:'POSE QUEST';
    const goal=document.createElement('span');goal.textContent='8 poses · collect 24 stars';header.append(title,goal);
    const path=document.createElement('div');path.className='shapeup-quest-path';
    const steps=Array.from({length:8},(_,i)=>{const step=document.createElement('span');step.className='shapeup-quest-step';const number=document.createElement('b');number.textContent=String(i+1);const stars=document.createElement('small');stars.textContent='·';step.append(number,stars);path.append(step);return {step,stars};});
    const totals=document.createElement('div');totals.className='shapeup-quest-totals';const earned=document.createElement('strong'),combo=document.createElement('span'),score=document.createElement('span');totals.append(earned,combo,score);quest.append(header,path,totals);
    const reward=document.createElement('div');reward.className='shapeup-reward';reward.hidden=true;reward.dataset.player=String(p);reward.style.setProperty('--seat',String(p));reward.style.setProperty('--players',String(n));reward.setAttribute('role','status');
    root.append(quest,reward);return {quest,steps,earned,combo,score,reward,celebrated:-1};
  });
  const cards=Array.from({length:n},(_,p)=>{
    const card=document.createElement('section');card.className='shapeup-coach-card';card.dataset.player=String(p);card.style.setProperty('--seat',String(p));card.style.setProperty('--players',String(n));
    card.setAttribute('aria-label',`Player ${p+1} pose coach`);
    const label=document.createElement('p');label.className='shapeup-coach-label';label.textContent=n===2?`PLAYER ${p+1} · MATCH THIS`:'MATCH THIS';
    const title=document.createElement('h2');title.textContent='Get ready';
    const figure=svgNode('svg',{viewBox:'-3.3 -3.3 6.6 6.6',class:'shapeup-reference',role:'img','aria-label':'Target pose reference'});
    const body=svgNode('g',{transform:'scale(1,-1)',fill:'none','stroke-linecap':'round','stroke-linejoin':'round','stroke-width':'.24',stroke:'#a3f6e3'});
    body.append(svgNode('path',{d:'M0 .05 V2 M-.75 2 H.75'}),svgNode('circle',{cx:'0',cy:'2.78',r:'.32'}));
    const limbs=LENGTHS.map(()=>svgNode('line',{x1:'0',y1:'0',x2:'0',y2:'0'}));body.append(...limbs);figure.append(body);
    const footer=document.createElement('div');footer.className='shapeup-coach-footer';
    const dial=svgNode('svg',{viewBox:'0 0 64 64',class:'shapeup-countdown','aria-hidden':'true'});
    dial.append(svgNode('circle',{cx:'32',cy:'32',r:'27',class:'shapeup-dial-track'}));
    const arc=svgNode('circle',{cx:'32',cy:'32',r:'27',class:'shapeup-dial-arc',pathLength:'100','stroke-dasharray':'100','stroke-dashoffset':'0'});dial.append(arc);
    const numeral=svgNode('text',{x:'32',y:'37','text-anchor':'middle',class:'shapeup-dial-number'});dial.append(numeral);
    const info=document.createElement('div'),match=document.createElement('strong'),round=document.createElement('span');match.className='shapeup-match';round.className='shapeup-round';info.append(match,round);footer.append(dial,info);
    const verdict=document.createElement('p');verdict.className='shapeup-verdict';verdict.setAttribute('role','status');verdict.setAttribute('aria-live','polite');
    const status=document.createElement('div');status.className='shapeup-live-status';status.style.setProperty('--seat',String(p));status.style.setProperty('--players',String(n));status.dataset.player=String(p);
    const headline=document.createElement('strong'),detail=document.createElement('span');status.append(headline,detail);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    card.append(label,title,figure,footer,verdict);root.append(card,status);
    return {card,title,figure,limbs,arc,numeral,match,round,verdict,status,headline,detail,pose:null as number[]|null};
  });
  return {
    update(p:number,pose:number[],name:string,quality:number,remaining:number,fraction:number,index:number,valid:boolean,countdown:boolean,verdict:string,phase:ShapePhase,feedback:string,statusText:string){
      const c=cards[p];
      if(c.pose!==pose){
      c.pose=pose;c.figure.setAttribute('aria-label',`Target pose: ${name}`);
      let x=0,y=0;
      pose.forEach((a,i)=>{if(i%2===0)[x,y]=JOINTS[i];const nx=x+Math.cos(a)*LENGTHS[i],ny=y+Math.sin(a)*LENGTHS[i];const limb=c.limbs[i];limb.setAttribute('x1',String(x));limb.setAttribute('y1',String(y));limb.setAttribute('x2',String(nx));limb.setAttribute('y2',String(ny));x=nx;y=ny;});
      }
      c.title.textContent=phase==='rest'?'Take a breath':name;
      c.arc.setAttribute('stroke-dashoffset',String(100*(1-Math.max(0,Math.min(1,fraction)))));
      c.numeral.textContent=countdown?'…':phase==='result'||phase==='done'?(feedback==='matched'||feedback==='perfect'?'✓':'—'):String(Math.ceil(remaining));
      c.match.textContent=countdown?'Find your space':phase==='rest'?'Next pose soon':valid?`${quality}% match`:'Step into view';c.round.textContent=`POSE ${Math.min(8,index+1)} / 8`;
      if(c.verdict.textContent!==verdict)c.verdict.textContent=verdict;
      if(c.headline.textContent!==statusText)c.headline.textContent=statusText;
      if(c.detail.textContent!==verdict)c.detail.textContent=verdict;
      c.status.dataset.feedback=feedback;c.card.dataset.phase=phase;c.card.dataset.feedback=feedback;
      c.card.dataset.ready=String(feedback==='matched'||feedback==='perfect');c.card.dataset.match=String(quality);c.card.dataset.pose=String(index);c.card.dataset.remaining=remaining.toFixed(2);
    },
    quest(p:number,state:ShapeSeat,index:number,phase:ShapePhase){
      const q=quests[p];q.earned.textContent=`★ ${state.stars} / 24`;q.combo.textContent=state.combo?`CHAIN ×${state.combo}`:'Match to build a chain';q.score.textContent=`${state.score} points`;
      q.quest.dataset.stars=String(state.stars);q.quest.dataset.combo=String(state.combo);q.quest.dataset.score=String(state.score);
      q.steps.forEach((item,i)=>{const earned=state.path[i];item.step.dataset.state=earned>=0?'earned':i===index?'current':'next';item.stars.textContent=earned<0?'·':earned===0?'—':'★'.repeat(earned);item.step.setAttribute('aria-label',`Pose ${i+1}: ${earned<0?'upcoming':`${earned} stars`}`);});
      if(state.judged&&q.celebrated!==index){
        q.celebrated=index;q.reward.dataset.stars=String(state.path[index]);q.reward.dataset.milestone=String(state.milestone);
        q.reward.textContent=state.path[index]>0?`${'★'.repeat(state.path[index])}  +${state.rewardPoints} points${state.milestone?` · CHAIN ×${state.combo} +${state.milestone} bonus!`:''}`:'A new pose. A new chance.';
        q.reward.classList.remove('celebrate');void q.reward.offsetWidth;q.reward.classList.add('celebrate');
        if(state.path[index]>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches)q.steps[index].step.animate([{transform:'scale(1)'},{transform:'scale(1.2)',offset:.4},{transform:'scale(1)'}],{duration:550});
      }
      q.reward.hidden=phase!=='result'&&phase!=='rest';
    },
    dispose(){root.remove();host?.classList.remove('shapeup-ar-stage');},
  };
}
