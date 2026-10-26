import type { Scene } from './engine.ts';
import { effects, pace } from './pace.ts';
import { mascotPuppet } from './mascot-puppet.ts';
import { mascotPose, MASCOT_STAND } from './mascot-motion.ts';
import './jab-coach.css';
type Pad={zone:number;x:number;y:number;life:number;pop:number;hand:number;cross:boolean};
export function jabCoach(scene:Scene,n:number){
 const stage=document.querySelector<HTMLElement>('.stage'),root=document.createElement('div');root.className='jab-coaches';root.dataset.players=String(n);stage?.append(root);stage?.classList.add('jab-character-stage');
 const crew=Array.from({length:n},(_,p)=>{const wrap=document.createElement('div');wrap.className='jab-coach';wrap.dataset.player=String(p);root.append(wrap);const puppet=mascotPuppet(wrap,'rizzquake',`Rizzquake holds the targets for player ${p+1}`);puppet.world(n===1?0:p===0?-4:4,-.4,n===1?.9:.8);const cue=document.createElement('div');cue.className='jab-coach-cue';cue.innerHTML='<strong>HIT THE MITTS</strong><span>Four clean hits. One combo.</span><div><i></i><i></i><i></i><i></i></div>';cue.style.left=`${n===1?50:p?75:25}%`;root.append(cue);return {puppet,cue,title:cue.querySelector('strong')!,hint:cue.querySelector('span')!,dots:[...cue.querySelectorAll('i')],until:-1,recoil:0,event:'',combo:0};});
 scene.cleanup(()=>{root.remove();stage?.classList.remove('jab-character-stage');});
 return {react(p:number,kind:'hit'|'duck'|'miss',combo:number,t:number){const c=crew[p];c.until=t+.9;c.recoil=kind==='hit'?1:.4;c.event=kind==='duck'?'SMOOTH DUCK!':kind==='miss'?'RESET. NEXT ONE.':combo%4===0?'COMBO!':'NICE HIT!';c.combo=combo;},
 update(t:number,dt:number,pads:Pad[],combos:number[],barIn:number,present:boolean[]){crew.forEach((c,p)=>{const center=n===1?0:p===0?-4:4,scale=n===1?.9:.8,rig=mascotPose(MASCOT_STAND),bob=effects.on&&!pace.lean&&!matchMedia('(prefers-reduced-motion: reduce)').matches?Math.sin(t*3)*.07:0;
  rig[0][0]+=bob;rig[0][1]+=bob;
  for(const side of [0,1]){const pad=pads.find(q=>q.zone===p&&q.hand===side&&q.life>0);if(pad){rig[15+side]=[(pad.x-center)/scale,(pad.y+.4)/(.8*scale),1];rig[13+side]=[(rig[11+side][0]+rig[15+side][0])*.5,-.15,1];}else{rig[15+side]=[(side?1:-1)*1.25,.7,1];rig[13+side]=[(side?1:-1)*.9,-.3,1];}}
  const duck=barIn<=0&&barIn>-.7;if(duck){for(const j of [0,11,12,13,14,15,16,23,24])rig[j][1]-=.65;}
  c.recoil=Math.max(0,c.recoil-dt*4);c.puppet.update(rig,t,c.recoil);root.dataset.combo=String(Math.max(...combos));c.cue.dataset.reward=String(t<c.until&&c.event==='COMBO!');
  const warning=barIn<1.5&&barIn>-.7;c.title.textContent=!present[p]?'STEP INTO VIEW':warning?'DUCK!':t<c.until?c.event:'HIT THE MITTS';c.hint.textContent=warning?'Bend your knees under the bar':t<c.until&&c.event==='COMBO!'?'Rizzquake felt that one!':'Gold mitt? Use the opposite glove.';
  const count=combos[p]>0&&combos[p]%4===0?4:combos[p]%4;c.dots.forEach((dot,i)=>dot.dataset.on=String(i<count));c.cue.dataset.hits=String(combos[p]);
 });},};
}
