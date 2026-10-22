import type { Scene } from './engine.ts';
import { partyMotion, partyReward, stepParty } from './freeze-party-rules.ts';
import './freeze-party.css';
const NS='http://www.w3.org/2000/svg';
const COLOURS=['#9c80ff','#ff70cf','#70eaff','#ffe27d'];

// A transparent round-owned DOM layer sits ABOVE the camera, rather than behind its opaque video plane.
export function freezeParty(scene:Scene,n:number){
  const root=document.createElement('div');root.className='freeze-party';root.dataset.phase='dance';root.setAttribute('aria-hidden','true');
  const make=(tag:string,attrs:Record<string,string|number>={})=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  const sky=make('svg',{viewBox:'0 0 1000 600',preserveAspectRatio:'none',class:'freeze-party__lights'});
  const defs=make('defs');const gradient=make('linearGradient',{id:'freeze-party-beam',x1:'0',y1:'0',x2:'0',y2:'1'});
  gradient.append(make('stop',{offset:'0%','stop-color':'white','stop-opacity':'.05'}),make('stop',{offset:'100%','stop-color':'white','stop-opacity':'.65'}));defs.append(gradient);sky.append(defs);
  const beams=Array.from({length:4},(_,i)=>{
    const x=70+i*285,g=make('g');const shape=make('polygon',{points:`${x},12 ${x-125},600 ${x+125},600`,fill:COLOURS[i],opacity:'.17'});g.append(shape);sky.append(g);return {e:g,x};
  });
  const floor=make('g',{class:'freeze-party__floor'});
  for(let i=0;i<14;i++)floor.append(make('path',{d:`M ${i*72},600 L ${500+(i*72-500)*.75},552`,stroke:COLOURS[i%4],'stroke-width':2,opacity:'.6'}));
  for(const y of [554,570,594])floor.append(make('path',{d:`M 0,${y} L 1000,${y}`,stroke:'#90e9ff','stroke-width':2,opacity:'.7'}));
  for(let i=0;i<14;i++)floor.append(make('rect',{x:i*72+4,y:574,width:62,height:17,fill:COLOURS[i%4],opacity:'.18',rx:3}));sky.append(floor);root.append(sky);
  const ball=make('svg',{viewBox:'0 0 120 145',class:'freeze-party__ball'});
  ball.append(make('path',{d:'M 60 0 L 60 38',stroke:'#c9e7ff','stroke-width':2}));
  const clips=make('defs'),clip=make('clipPath',{id:'freeze-party-globe'});clip.append(make('circle',{cx:60,cy:81,r:38}));clips.append(clip);ball.append(clips);
  ball.append(make('circle',{cx:60,cy:81,r:42,fill:'#98cfff',opacity:'.10'}),make('circle',{cx:60,cy:81,r:38,fill:'#405676',stroke:'#e2f3ff','stroke-width':2}));
  const facetClip=make('g',{'clip-path':'url(#freeze-party-globe)'}),facets=make('g',{class:'freeze-party__facets'});
  for(let row=0;row<8;row++)for(let col=-1;col<11;col++)facets.append(make('rect',{x:col*9+15,y:row*10+42,width:7,height:8,rx:1,fill:(col+row)%3===0?'#ffffff':(col+row)%2?'#a6cdeb':'#688ba8',opacity:.55+((row*3+col*7+50)%5)*.1}));facetClip.append(facets);ball.append(facetClip);
  ball.append(make('path',{d:'M 43 59 L 43 73 M 36 66 L 50 66',stroke:'white','stroke-width':2,'stroke-linecap':'round'}));root.append(ball);
  const sparkles=Array.from({length:24},(_,i)=>{
    const e=document.createElement('span');e.className='freeze-party__confetti';e.hidden=true;e.textContent=i%3?'✦':'●';e.hidden=true;e.style.color=COLOURS[i%4];root.append(e);return {e,life:0,x:0,y:0,vx:0,vy:0,angle:0};
  });
  document.querySelector('.stage')?.append(root);scene.cleanup(()=>root.remove());
  const state=partyMotion();let celebrations=0;
  const diagnostics={get angle(){return state.angle;},get lightTime(){return state.lightTime;},get dancing(){return state.dancing;},get confetti(){return sparkles.filter(q=>q.life>0).length;},get celebrations(){return celebrations;},get visible(){return root.isConnected;}};
  return {
    state:diagnostics,
    celebrate(p:number,freezeId:number,present:boolean,still:boolean){
      if(!partyReward(state,p,freezeId,present,still))return;
      celebrations++;const center=n===1?50:p===0?25:75;
      for(let i=p*12;i<p*12+12;i++){const q=sparkles[i];q.life=1.8;q.x=center+(i%5-2)*2;q.y=44+(i%3)*3;q.vx=(i%6-2.5)*4;q.vy=-12-(i%4)*3;q.angle=i*17;}
    },
    update(dancing:boolean,dt:number){
      stepParty(state,dancing,dt);root.dataset.phase=dancing?'dance':'freeze';
      // Motion is driven by the same suspendable game clock as the soundtrack; no CSS animation timers.
      facets.setAttribute('transform',`rotate(${state.angle} 60 81)`);
      ball.style.transform=`rotate(${Math.sin(state.angle*Math.PI/180)*4}deg)`;
      beams.forEach((beam,i)=>beam.e.setAttribute('transform',`rotate(${Math.sin(state.lightTime*.38+i*1.7)*13} ${beam.x} 12)`));
      for(const q of sparkles){if(q.life>0&&dancing){q.life=Math.max(0,q.life-dt);q.vy+=17*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.angle+=dt*65;}q.e.hidden=q.life<=0;if(q.life>0){q.e.style.left=`${q.x}%`;q.e.style.top=`${q.y}%`;q.e.style.transform=`rotate(${q.angle}deg)`;q.e.style.opacity=String(Math.min(1,q.life));}}
    },
  };
}
