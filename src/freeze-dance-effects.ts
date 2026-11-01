import {flat,node,shapes,lit,fade,type Scene} from './engine.ts';
import {newDanceEffects,stepDanceEffects,outsideFreezeCamera,type DanceEffectSample} from './freeze-dance-effects-rules.ts';
const COLOURS=['#e795b5','#72c9bd','#e2bc5f','#b59ed9'];
export function freezeDanceEffects(scene:Scene,width:number,height:number){
 const state=newDanceEffects(),root=node(scene.root);root.name='freeze-earned-dance-effects';
 const cable=node(root,shapes.quad(.025,.52),flat('#998a7b'),[-5.2,3.68,.1]);
 const ball=node(root,shapes.facets(.38,2),lit('#d6e6df',{emissive:'#2b3e3a',opacity:1}),[-5.2,3.02,.1]);ball.name='freeze-earned-disco-ball';
 const shine=Array.from({length:6},(_,i)=>{const look=flat(COLOURS[i%4],{opacity:0}),e=node(root,shapes.quad(.025,.19),look,[-5.2,3.02,.3]);e.enabled=false;return e;});
 const particles=Array.from({length:40},(_,i)=>{const e=node(root,i%3?shapes.quad(.065,.1):shapes.circle(.035,8),flat(COLOURS[i%4],{opacity:.8}));e.enabled=false;return {e,life:0,x:0,y:0,vx:0,vy:0,angle:0};});
 let sequence=0;
 return {state:{get earned(){return state.earned;},get angle(){return state.angle;},get strength(){return state.strength;},get particles(){return particles.filter(p=>p.e.enabled).length;},get cameraExcluded(){return particles.every(p=>!p.e.enabled||outsideFreezeCamera(p.x,p.y,width,height));},get ballVisible(){return ball.enabled;}},
  update(dt:number,dancing:boolean,samples:DanceEffectSample[],motion:boolean){
   const bursts=stepDanceEffects(state,dt,dancing,samples,motion);ball.setLocalEulerAngles(12,state.angle,0);fade(ball,.66+state.strength*.28);cable.enabled=true;
   shine.forEach((e,i)=>{e.enabled=motion&&dancing&&state.strength>.05;const a=(state.angle+i*60)*Math.PI/180;e.setLocalPosition(-5.2+Math.cos(a)*.55,3.02+Math.sin(a)*.55,.3);e.setLocalEulerAngles(0,0,state.angle+i*60);fade(e,state.strength*.75);});
   for(const player of bursts)for(let i=0;i<12;i++){const q=particles[(sequence++)%particles.length],a=(i*.83+player*.7);q.life=.8+(i%4)*.15;q.x=-5.2+Math.sin(a)*.4;q.y=-.7+(i%3)*.18;q.vx=Math.sin(a)*.8;q.vy=1.2+(i%4)*.4;q.angle=i*37;q.e.enabled=true;}
   for(const p of particles){if(!dancing||!motion){p.life=0;p.e.enabled=false;continue;}if(p.life<=0)continue;p.life=Math.max(0,p.life-dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=2.1*dt;p.angle+=dt*90;p.e.enabled=p.life>0&&outsideFreezeCamera(p.x,p.y,width,height);if(p.e.enabled){p.e.setLocalPosition(p.x,p.y,.5);p.e.setLocalEulerAngles(0,0,p.angle);fade(p.e,Math.min(.85,p.life*1.8));}}
  },
 };
}
