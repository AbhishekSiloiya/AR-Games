import './shapeup-overlay.css';
import type { ShapePhase } from './shapeup-rules.ts';
const NS='http://www.w3.org/2000/svg';
const JOINTS=[[-.75,2],[0,0],[.75,2],[0,0],[-.4,0],[0,0],[.4,0],[0,0]];
const LENGTHS=[1.1,1,1.1,1,1.5,1.4,1.5,1.4];
const svgNode=(name:string,attrs:Record<string,string>)=>{const e=document.createElementNS(NS,name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
export function shapeupOverlay(n:number,live:boolean){
  const host=document.querySelector<HTMLElement>('.stage');
  const root=document.createElement('div');root.className=`shapeup-coach${live?'':' shapeup-coach-classic'}`;root.dataset.players=String(n);
  host?.classList.add('shapeup-ar-stage');host?.append(root);
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
    dispose(){root.remove();host?.classList.remove('shapeup-ar-stage');},
  };
}
