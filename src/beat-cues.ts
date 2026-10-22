import type { Scene } from './engine.ts';
import './beat-cues.css';

const ACTIONS = [
  { icon:'L ↑', text:'Raise LEFT hand' },
  { icon:'R ↑', text:'Raise RIGHT hand' },
  { icon:'↑ ↑', text:'BOTH hands up' },
  { icon:'↓', text:'SQUAT' },
  { icon:'↑', text:'JUMP' },
] as const;

// One fixed headline per player: falling shapes stay clear of text.
export function beatCues(scene: Scene, n:number) {
  const root=document.createElement('div');root.className='beat-cues';root.dataset.testid='beat-cues';root.dataset.players=String(n);
  root.setAttribute('role','group');root.setAttribute('aria-label','Beat movement instructions');
  const current=Array.from({length:n},(_,p)=> {
    const e=document.createElement('section');e.className='beat-cues__current';e.dataset.player=String(p+1);e.style.setProperty('--seat',String(p));e.hidden=true;
    const label=document.createElement('span');label.className='beat-cues__player';label.textContent=n===2?`PLAYER ${p+1}`:'YOUR NEXT MOVE';
    const action=document.createElement('div');action.className='beat-cues__heading';action.setAttribute('aria-live','polite');action.setAttribute('aria-atomic','true');
    const icon=document.createElement('b'), text=document.createElement('strong'), when=document.createElement('small'),result=document.createElement('span');
    icon.className='beat-cues__icon';text.className='beat-cues__action';when.className='beat-cues__when';result.className='beat-cues__result';result.setAttribute('role','status');
    action.append(icon,text);e.append(label,action,when,result);root.append(e);
    return {e,icon,text,when,result,last:-1};
  });
  const legend=document.createElement('div');legend.className='beat-cues__legend';
  const intro=document.createElement('strong');intro.textContent='MOVE WHEN THE SHAPE TOUCHES THE WHITE LINE';legend.append(intro);
  const key=document.createElement('div');key.className='beat-cues__key';
  ACTIONS.forEach(action=>{const item=document.createElement('span');item.textContent=`${action.icon} ${action.text}`;key.append(item);});legend.append(key);root.append(legend);
  const stage=document.querySelector('.stage');stage?.classList.add('beat-stage');stage?.append(root);
  scene.cleanup(()=>{root.remove();stage?.classList.remove('beat-stage');});
  return {
    current(p:number,move:number|undefined,color:string,seconds:number,result:string) {
      const b=current[p];b.e.hidden=move===undefined;
      if(move===undefined)return;
      b.e.style.setProperty('--cue-color',color);
      if(b.last!==move){b.last=move;b.icon.textContent=ACTIONS[move].icon;b.text.textContent=ACTIONS[move].text;b.e.dataset.move=String(move);}
      const now=seconds<=.26;b.e.dataset.timing=now?'now':'next';
      b.when.textContent=now?'NOW — AT THE WHITE LINE':'GET READY · MOVE AT THE WHITE LINE';
      if(b.result.textContent!==result)b.result.textContent=result;
    },
  };
}
