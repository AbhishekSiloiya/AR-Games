import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {players} from './pose.ts';
import {sfx} from './stage.tsx';
import {menuHandPoint,newMenuHold,stepMenuHold,MENU_HOLD_MS} from './menu-selection.ts';
import './hand-cursor.css';
type Control=HTMLButtonElement|HTMLInputElement;
export const menuSelectionView={visible:false,hand:'right',holdMs:MENU_HOLD_MS,progress:0,locked:false,target:''};
const enabled=(el:Control)=>el.isConnected&&!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&!el.closest('[inert]')&&el.getClientRects().length>0;
const area=(el:Control)=>el instanceof HTMLInputElement?el.labels?.[0]??el:el;
const label=(el:Control|null)=>el?(el.getAttribute('aria-label')??area(el).textContent??'Option').replace(/\s+/g,' ').trim().slice(0,70):'';
function controlAt(x:number,y:number,host:HTMLElement){
 const hit=document.elementFromPoint(x,y)?.closest('button,input[type="checkbox"],input[type="radio"],label');
 const el=hit instanceof HTMLLabelElement?hit.control:hit;
 return (el instanceof HTMLButtonElement||el instanceof HTMLInputElement&&['checkbox','radio'].includes(el.type))&&enabled(el)&&(host===document.body||host.contains(el))?el:null;
}
export function HandCursor(){
 const root=useRef<HTMLDivElement>(null),hold=useRef(newMenuHold<Control>());
 const [host,setHost]=useState<HTMLElement>(document.body);
 // A native modal lives above the document. Keep the pointer in that same top layer.
 useEffect(()=>{const refresh=()=>setHost(document.querySelector<HTMLDialogElement>('dialog[open]')??document.body);refresh();const observer=new MutationObserver(refresh);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});return()=>observer.disconnect();},[]);
 useEffect(()=>{
  const cursor=root.current!,caption=cursor.querySelector('span')!,ring=cursor.querySelector<SVGCircleElement>('.menu-cursor-progress')!;
  let raf=0,last=performance.now(),x=NaN,y=NaN,hot:Element|null=null,selectedAt=-Infinity,manualUntil=0;
  const clearHot=()=>{hot?.classList.remove('hot','menu-option-hot');hot=null;};
  const manual=()=>{manualUntil=performance.now()+750;stepMenuHold(hold.current,null,null,0);clearHot();};
  document.addEventListener('pointerdown',manual);document.addEventListener('keydown',manual,true);
  const loop=(now:number)=>{
   raf=requestAnimationFrame(loop);const ms=now-last;last=now;
   const point=now<manualUntil?null:menuHandPoint(players[0],performance.now(),innerWidth,innerHeight);
   cursor.hidden=!point;menuSelectionView.visible=!!point;
   if(!point){x=y=NaN;stepMenuHold(hold.current,null,null,ms);clearHot();Object.assign(menuSelectionView,{progress:0,target:'',locked:hold.current.fired});return;}
   // Tracking already smooths wrists. Menus add a small dead zone and calm glide, with no game-motion prediction.
   if(!Number.isFinite(x)){x=point.x;y=point.y;}
   else if(Math.hypot(point.x-x,point.y-y)>6){const k=1-Math.exp(-Math.min(ms,50)/1000*9);x+=(point.x-x)*k;y+=(point.y-y)*k;}
   cursor.style.transform=`translate(${x}px, ${y}px)`;
   cursor.dataset.captionTop=String(y>innerHeight-110);caption.style.left=`${Math.max(85,Math.min(innerWidth-85,x))-x+36}px`;
   let over=controlAt(x,y,host);const previous=hold.current.target;
   if(!over&&previous&&enabled(previous)&&(host===document.body||host.contains(previous))){const r=area(previous).getBoundingClientRect();if(x>r.left-18&&x<r.right+18&&y>r.top-18&&y<r.bottom+18)over=previous;}
   const highlight=over?area(over):null;
   if(highlight!==hot){clearHot();hot=highlight;hot?.classList.add(hot instanceof HTMLButtonElement?'hot':'menu-option-hot');}
   const result=stepMenuHold(hold.current,over,{x,y},ms);
   if(result.activate)selectedAt=now;
   const confirmed=hold.current.fired&&now-selectedAt<500;
   cursor.dataset.state=confirmed?'selected':result.locked?'locked':over?'holding':'aiming';
   ring.style.strokeDashoffset=String(confirmed?0:100*(1-result.progress));
   caption.textContent=confirmed?'Selected':result.locked?'Move to continue':over?`Hold ${Math.max(1,Math.ceil((1-result.progress)*3))}s to choose`:'Right hand';
   Object.assign(menuSelectionView,{progress:result.progress,locked:result.locked,target:label(over)});
   if(result.activate&&enabled(result.activate)){sfx('confirmation',{vol:.3});result.activate.click();}
  };
  raf=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(raf);clearHot();document.removeEventListener('pointerdown',manual);document.removeEventListener('keydown',manual,true);Object.assign(menuSelectionView,{visible:false,progress:0,target:''});};
 },[host]);
 return createPortal(<div ref={root} className="menu-cursor" hidden aria-hidden="true"><svg viewBox="0 0 72 72"><circle className="menu-cursor-disc" cx="36" cy="36" r="25"/><circle className="menu-cursor-track" cx="36" cy="36" r="30"/><circle className="menu-cursor-progress" cx="36" cy="36" r="30" pathLength="100"/><g className="menu-cursor-hand" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M27 38V27a2 2 0 0 1 4 0v8-13a2 2 0 0 1 4 0v13-15a2 2 0 0 1 4 0v15-11a2 2 0 0 1 4 0v16l3-4a2 2 0 0 1 3 3l-7 12H31l-7-10a2 2 0 0 1 3-3l3 4"/></g><path className="menu-cursor-check" d="m25 36 8 8 15-16"/></svg><span>Right hand</span></div>,host);
}
