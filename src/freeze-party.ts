import { effects } from './pace.ts';
import type { Scene } from './engine.ts';
import { partyMotion, partyReward, stepParty } from './freeze-party-rules.ts';
import { CLUB_BPM, clubScene, stepClub, cheerClub } from './club-groove.ts';
import './freeze-party.css';
const NS='http://www.w3.org/2000/svg',COLOURS=['#ff4eab','#ad65ff','#62f7ed','#ffe55b'];
// Round-owned transparent layers frame the live player. Every light, tile and host uses
// the suspendable game clock; there are no independently running CSS animations.
export function freezeParty(scene:Scene,n:number){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=document.createElement('div');root.className='freeze-party';root.dataset.phase='dance';root.dataset.players=String(n);root.setAttribute('aria-hidden','true');
 root.innerHTML='<div class="freeze-party__world"></div><div class="freeze-party__ceiling"><span>MOON SOCIAL CLUB</span></div><div class="freeze-party__host"><img src="/assets/moon/play/fuzzbyte-idle.webp" alt=""><span>FUZZBYTE / YOUR PARTY PAL</span><strong>MAKE IT YOURS</strong></div>';
 const host=root.querySelector<HTMLImageElement>('.freeze-party__host img')!,hostLabel=root.querySelector('.freeze-party__host strong')!;
 const make=(tag:string,attrs:Record<string,string|number>={})=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
 const sky=make('svg',{viewBox:'0 0 1000 600',preserveAspectRatio:'none',class:'freeze-party__lights'});
 const beams=Array.from({length:6},(_,i)=>{const x=i<3?35+i*60:845+(i-3)*60,g=make('g');g.append(make('polygon',{points:`${x},45 ${x-95},590 ${x+95},590`,fill:COLOURS[i%4],opacity:'.19'}));sky.append(g);return {e:g,x};});
 const floor=make('g',{class:'freeze-party__floor'}),tiles:SVGElement[]=[];
 // Vanishing-point quads make the floor read as a real space instead of a flat grid.
 const rows=[490,505,526,555,600];
 for(let row=0;row<4;row++)for(let col=0;col<12;col++){
  const xa=500+(col/12*1400-700)*(row+1)/4,xb=500+((col+1)/12*1400-700)*(row+1)/4;
  const xc=500+(col/12*1400-700)*(row+2)/4,xd=500+((col+1)/12*1400-700)*(row+2)/4;
  const tile=make('polygon',{points:`${xa},${rows[row]} ${xb},${rows[row]} ${xd},${rows[row+1]} ${xc},${rows[row+1]}`,fill:COLOURS[(row+col)%4],stroke:'#130d29','stroke-width':3,opacity:'.22'});floor.append(tile);tiles.push(tile);
 }
 sky.append(floor);root.append(sky);
 const speakers=Array.from({length:2},(_,side)=>{const e=document.createElement('div');e.className='freeze-party__speaker';e.dataset.side=String(side);e.innerHTML='<i></i><i></i><div>'+Array.from({length:8},()=>'<b></b>').join('')+'</div>';root.append(e);return [...e.querySelectorAll<HTMLElement>('b')];});
 const sparkles=Array.from({length:24},(_,i)=>{const e=document.createElement('span');e.className='freeze-party__confetti';e.hidden=true;e.textContent=i%3?'✦':'●';e.style.color=COLOURS[i%4];root.append(e);return {e,life:0,x:0,y:0,vx:0,vy:0,angle:0};});
 document.querySelector('.stage')?.append(root);scene.cleanup(()=>root.remove());
 const state=partyMotion(),club=clubScene();let celebrations=0;
 const diagnostics={get angle(){return state.angle;},get lightTime(){return state.lightTime;},get dancing(){return state.dancing;},get confetti(){return sparkles.filter(q=>q.life>0).length;},get celebrations(){return celebrations;},get visible(){return root.isConnected;},get host(){return club.cheer>0?'cheer':state.dancing?'dance':'hold';},get visualTime(){return club.time;},get reduced(){return reduced||!effects.on;}};
 return {
  state:diagnostics,
  celebrate(p:number,freezeId:number,present:boolean,still:boolean){
   if(!partyReward(state,p,freezeId,present,still))return;cheerClub(club,p,freezeId,present,still);celebrations++;
   if(reduced||!effects.on)return;const center=n===1?50:p===0?25:75;
   for(let i=p*12;i<p*12+12;i++){const q=sparkles[i];q.life=1.8;q.x=center+(i%5-2)*2;q.y=44+(i%3)*3;q.vx=(i%6-2.5)*4;q.vy=-12-(i%4)*3;q.angle=i*17;}
  },
  update(dancing:boolean,dt:number){
   stepParty(state,dancing,dt);stepClub(club,dancing,dt);root.dataset.phase=dancing?'dance':'freeze';root.dataset.effects=String(effects.on&&!reduced);
   const beat=club.time*CLUB_BPM/60,energy=(1-Math.cos(beat*Math.PI*2))*.5,animated=effects.on&&!reduced;
   beams.forEach((beam,i)=>beam.e.setAttribute('transform',`rotate(${animated?Math.sin(club.time*.48+i*1.7)*12:0} ${beam.x} 45)`));
   tiles.forEach((tile,i)=>tile.setAttribute('opacity',String(animated?.12+((Math.floor(beat)+i)%4===0?.35:.08):.16)));
   speakers.forEach((bars,side)=>bars.forEach((bar,i)=>bar.style.transform=`scaleY(${animated?.2+Math.abs(Math.sin(beat*.7+i*.8+side))*.8:.35})`));
   const cheer=club.cheer>0,next=cheer?'/assets/moon/play/fuzzbyte-cheer.webp':'/assets/moon/play/fuzzbyte-idle.webp';if(host.getAttribute('src')!==next)host.src=next;
   host.style.transform=animated?`translateY(${-energy*(cheer?8:4)}px) rotate(${Math.sin(beat*Math.PI)*(cheer?3:1.4)}deg)`:'none';
   const words=cheer?'CLEAN HOLD. BIG CHEER!':dancing?'FIND YOUR GROOVE':'HOLD THAT LOOK';if(hostLabel.textContent!==words)hostLabel.textContent=words;
   for(const q of sparkles){if(q.life>0&&dancing){q.life=Math.max(0,q.life-dt);q.vy+=17*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.angle+=dt*65;}q.e.hidden=q.life<=0||!animated;if(q.life>0){q.e.style.left=`${q.x}%`;q.e.style.top=`${q.y}%`;q.e.style.transform=`rotate(${q.angle}deg)`;q.e.style.opacity=String(Math.min(1,q.life));}}
  },
 };
}
