import {players,predict} from './pose.ts';
import {lit,node,shapes,show,type Scene} from './engine.ts';
import {keeperLayout,type KeeperHand} from './goalie-rules.ts';
export function keeperGloves(scene:Scene,n:number){
 const cream=lit('#fff0d3'),ink=lit('#23494c'),tones=[lit('#e27c63'),lit('#478f91')],ball=shapes.sphere(1,32);
 const all=Array.from({length:n*2},(_,i)=>{
  const root=node(scene.root);root.name=`goalie-glove-${i}`;const side=i%2,part=(look:typeof cream,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(root,ball,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  part(cream,0,0,0,.48,.52,.24);part(tones[side],0,-.05,-.16,.45,.44,.1);
  for(let f=0;f<4;f++){const finger=part(cream,(f-1.5)*.195,.49+(f===0||f===3?-.06:.03),.025,.125,.36,.145);finger.setLocalEulerAngles(0,0,(1.5-f)*-4);part(tones[side],(f-1.5)*.195,.57,-.1,.075,.15,.035);}
  const thumb=part(cream,(side?-1:1)*.44,-.03,.08,.18,.32,.18);thumb.setLocalEulerAngles(0,0,(side?-1:1)*-35);part(ink,0,-.5,-.015,.36,.18,.23);part(tones[side],0,-.52,.06,.34,.13,.21);part(cream,0,-.52,.25,.23,.025,.02);
  const l=keeperLayout(n,i>>1);root.setLocalScale(l.gloveScale,l.gloveScale,l.gloveScale);return {root,impact:0,was:false,state:{x:0,y:0,z:.25,px:0,py:0,on:false,vx:0,vy:0} as KeeperHand};
 });
 const reset=()=>all.forEach(g=>g.was=false);let renderedAt=performance.now();
 window.addEventListener('keydown',reset,true);window.addEventListener('click',reset,true);scene.cleanup(()=>{window.removeEventListener('keydown',reset,true);window.removeEventListener('click',reset,true);});
 return {all,update(dt:number){const now=performance.now();if(now-renderedAt>100)reset();renderedAt=now;return all.map((g,i)=>{const p=i>>1,h=players[p].hands[i%2],l=keeperLayout(n,p),s=g.state;s.on=players[p].present&&h.seen&&performance.now()-h.t<350;show(g.root,s.on);if(!s.on){g.was=false;return s;}const at=predict(h,undefined,.08),x=l.cx+at.x*l.gain,y=.1+at.y*l.vertical;s.px=g.was?s.x:x;s.py=g.was?s.y:y;s.x=x;s.y=y;s.vx=h.vx*l.gain;s.vy=h.vy*l.vertical;g.was=true;g.impact=Math.max(0,g.impact-dt*6);g.root.setLocalPosition(x,y,.25+g.impact*.12);g.root.setLocalEulerAngles(-g.impact*17,(i%2?-1:1)*-7,Math.max(-12,Math.min(12,-s.vx*.5)));g.root.setLocalScale(l.gloveScale*(1+g.impact*.08),l.gloveScale*(1-g.impact*.08),l.gloveScale);return s;});},hit(p:number,hand:number){all[p*2+hand].impact=1;}};
}
