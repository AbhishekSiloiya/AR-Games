import { MASCOT_LIMBS, mascotFrame, mascotSegment, mascotPose, mascotDisplayRig } from './mascot-motion.ts';
import './mascot-puppet.css';
export type MascotKind='moodi'|'fuzzbyte'|'rizzquake';
const NS='http://www.w3.org/2000/svg';
const make=(tag:string,attrs:Record<string,string|number>={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
// One small shared atlas supplies textured parts; SVG transforms articulate each joint independently.
export function mascotPuppet(parent:Element,kind:MascotKind,label:string){
 const svg=make('svg',{viewBox:'-3.4 -2.9 6.8 7',class:'mascot-puppet',role:'img','aria-label':label}),actor=make('g',{visibility:'hidden'});svg.append(actor);parent.append(svg);
 const source=`/assets/moon/rig/${kind}.webp`;
 const rects={moodi:[[20,45,600,590],[695,160,495,395],[210,680,240,520],[795,770,305,390]],fuzzbyte:[[10,55,770,555],[780,190,405,410],[225,695,200,460],[850,735,255,410]],rizzquake:[[50,55,570,560],[645,90,585,520],[185,645,290,560],[765,710,345,465]]}[kind];
 const part=(tile:number,name:string)=>{const box=[...rects[tile]];const limbIndex=name.startsWith('limb-')?Number(name.slice(5)):-1;if(limbIndex>=0&&limbIndex%2===0){box[3]*=.67;}if(tile===3&&kind==='rizzquake'){box[1]+=150;box[3]-=150;}
 const g=make('g',{'data-part':name}),crop=make('svg',{viewBox:box.join(' '),preserveAspectRatio:tile===0?'xMidYMid meet':'none',overflow:'hidden'}),image=make('image',{href:source,width:1254,height:1254});crop.append(image);g.append(crop);actor.append(g);return {g,crop};};
 const limbs=MASCOT_LIMBS.map((_,i)=>part(i<4||i%2===0?2:3,`limb-${i}`));
 const torso=part(1,'torso'),head=part(0,'head');
 const position=(piece:ReturnType<typeof part>,x:number,y:number,w:number,h:number,angle=0)=>{piece.g.setAttribute('transform',`translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${angle.toFixed(2)})`);for(const[k,v]of Object.entries({x:-w/2,y:-h/2,width:w,height:h}))piece.crop.setAttribute(k,String(v));};
 let frame=0;
 return {svg,kind,
  world(x:number,y:number,scale:number){svg.setAttribute('viewBox','-8 -4.5 16 9');actor.setAttribute('transform',`translate(${x} ${-y}) scale(${scale})`);},
  update(rig:number[][],t:number,recoil=0){const display=mascotDisplayRig(rig);const f=mascotFrame(display);for(const [hip,knee,foot]of [[23,25,27],[24,26,28]])for(const j of [knee,foot])if(display[j]&&display[hip]){display[j][0]=display[hip][0]+(display[j][0]-display[hip][0])*.65;display[j][1]=display[hip][1]+(display[j][1]-display[hip][1])*.65;}svg.dataset.visible=String(f.visible);actor.setAttribute('visibility',f.visible?'visible':'hidden');if(!f.visible)return;
   limbs.forEach((part,i)=>{const[a,b]=MASCOT_LIMBS[i],s=mascotSegment(display,a,b);part.g.setAttribute('visibility',s.visible?'visible':'hidden');if(s.visible)position(part,s.x,s.y,i<4?.64:.7,Math.max(.3,s.length+.32),s.angle);});
   position(torso,f.x,f.y,f.width*1.65,f.height*1.45,f.angle);
   position(head,f.headX+Math.sin(recoil*11)*recoil*.15,f.headY-.05-recoil*.15,f.width*2.15,f.width*2.0,f.headAngle+Math.sin(recoil*9)*recoil*9);
   svg.dataset.frame=String(++frame);svg.dataset.leftArm=limbs[1].g.getAttribute('transform')!;svg.dataset.rightArm=limbs[3].g.getAttribute('transform')!;svg.dataset.time=t.toFixed(3);
  },
  pose(angles:readonly number[],t=0,recoil=0){this.update(mascotPose(angles),t,recoil);},
  remove(){svg.remove();},
 };
}
