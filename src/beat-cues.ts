import { toScreen, type Scene } from './engine.ts';
import './beat-cues.css';

const ACTIONS = [
  { icon:'L ↑', text:'Raise LEFT hand' },
  { icon:'R ↑', text:'Raise RIGHT hand' },
  { icon:'↑ ↑', text:'BOTH hands up' },
  { icon:'↓', text:'SQUAT' },
  { icon:'↑', text:'JUMP' },
] as const;

// Pooled DOM badges keep every shape readable without adding text textures or per-frame nodes.
export function beatCues(scene: Scene, notes: {move:number}[], n:number) {
  const root=document.createElement('div');root.className='beat-cues';root.dataset.testid='beat-cues';
  root.setAttribute('role','group');root.setAttribute('aria-label','Beat movement instructions');
  const legend=document.createElement('div');legend.className='beat-cues__legend';
  const intro=document.createElement('strong');intro.textContent='MOVE WHEN THE SHAPE TOUCHES THE WHITE LINE';legend.append(intro);
  const key=document.createElement('div');key.className='beat-cues__key';
  ACTIONS.forEach(action=>{const item=document.createElement('span');item.textContent=`${action.icon} ${action.text}`;key.append(item);});legend.append(key);root.append(legend);
  const badge=(move:number,p:number,current=false)=> {
    const e=document.createElement('div');e.className=current?'beat-cues__current':'beat-cues__note';e.hidden=true;
    e.dataset.player=String(p+1);e.dataset.move=String(move);
    const icon=document.createElement('b'), text=document.createElement('strong'), when=document.createElement('small');
    icon.className='beat-cues__icon';text.className='beat-cues__action';when.textContent='AT THE LINE';e.append(icon,text,when);root.append(e);
    return {e,icon,text,when,last:-1};
  };
  const marks=notes.map(note=>Array.from({length:n},(_,p)=>badge(note.move,p)));
  const current=Array.from({length:n},(_,p)=>{const b=badge(0,p,true);b.e.setAttribute('aria-live','polite');b.e.setAttribute('aria-atomic','true');return b;});
  const stage=document.querySelector('.stage');stage?.append(root);
  scene.cleanup(()=>root.remove());
  const place=(b:ReturnType<typeof badge>,move:number,x:number,y:number,color:string,hit=false)=> {
    const pos=toScreen(x,y,.2);b.e.hidden=!pos||pos[0]<0||pos[0]>1||pos[1]<.02||pos[1]>.95;
    if(b.e.hidden||!pos)return;
    b.e.style.left=`${pos[0]*100}%`;b.e.style.top=`${pos[1]*100}%`;b.e.style.setProperty('--cue-color',color);
    b.e.classList.toggle('is-hit',hit);
    if(b.last!==move) {
      b.last=move;const action=ACTIONS[move];b.icon.textContent=action.icon;b.text.textContent=action.text;
      b.e.dataset.move=String(move);b.e.setAttribute('aria-label',`${n===2?`Player ${b.e.dataset.player}: `:''}${action.text} when this shape touches the white line`);
    }
  };
  return {
    note(i:number,p:number,on:boolean,x:number,y:number,color:string,hit:boolean) {
      const b=marks[i][p];if(!on){b.e.hidden=true;return;}place(b,notes[i].move,x,y,color,hit);
    },
    current(p:number,move:number|undefined,x:number,y:number,color:string,seconds:number) {
      const b=current[p];if(move===undefined){b.e.hidden=true;return;}
      place(b,move,x,y,color);b.when.textContent=seconds<=.26?'NOW · AT THE LINE':`NEXT · AT THE LINE${n===2?` · PLAYER ${p+1}`:''}`;
    },
  };
}
