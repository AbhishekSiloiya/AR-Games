// Rounded working characters follow the original rig; contact pads and exercise rules remain unchanged.
import type { Entity } from 'playcanvas';
import { flat, node, shapes, show } from './engine.ts';
import { rangerSegment, type RangerSegment } from './ranger-pose.ts';
export type Costume = 'diver'|'smith';
export function trackedCostume(parent: Entity, kind: Costume, p: number) {
  const root=node(parent);root.name=`costume-${kind}-${p}`;
  const suit=flat(kind==='diver'?(p?'#ffac62':'#42d5d1'):'#8cb9e3'), dark=flat('#153449'), cream=flat('#fff1cb'), accent=flat(kind==='diver'?'#ffe574':'#c57d45'), visor=flat('#5abbd9');
  const sphere=shapes.sphere(1,10), capsule=shapes.capsule(.5,1.25), box=shapes.box(1,1,1);
  const piece=(parent:Entity,mesh:typeof sphere,look:typeof suit,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const e=node(parent,mesh,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  const torso=node(root), head=node(root);
  piece(torso,sphere,suit,0,0,0,.58,.85,.23);
  piece(torso,box,accent,0,-.12,.24,.8,1.02,.1);
  if(kind==='diver') {
    for(const side of [-1,1])piece(torso,sphere,dark,side*.51,.02,-.05,.17,.72,.17);
    piece(torso,sphere,cream,0,.16,.35,.19,.19,.06);
    piece(head,sphere,cream,0,0,0,.59,.6,.25);
    piece(head,sphere,dark,0,.02,.24,.49,.3,.08);
    piece(head,sphere,visor,0,.04,.31,.41,.21,.04);
    piece(head,sphere,dark,0,-.25,.3,.17,.16,.08);
    for(const side of [-1,1])piece(head,sphere,accent,side*.58,0,.05,.1,.17,.06);
  }else{
    piece(head,sphere,cream,0,0,0,.45,.51,.22);
    piece(head,sphere,dark,0,.33,0,.5,.2,.25);
    piece(head,box,dark,0,.29,.22,.96,.11,.18);
    for(const side of [-1,1])piece(head,sphere,dark,side*.14,.05,.23,.045,.065,.03);
    piece(head,sphere,accent,0,-.2,.2,.3,.2,.06);
    piece(torso,box,dark,0,-.27,.31,.5,.22,.05);
  }
  const limbs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]].map(([a,b],i)=>({a,b,e:node(root,capsule,i%2?dark:suit),pose:{x:0,y:0,length:0,angle:0,seen:false} as RangerSegment}));
  const tips=[15,16,27,28].map((j,i)=>({j,e:piece(root,sphere,i<2?accent:dark,0,0,.1,i<2?.25:.31,i<2?.27:.2,.2)}));
  const seen=(rig:number[][],j:number)=>!!rig[j]&&rig[j][2]>.45&&Number.isFinite(rig[j][0]+rig[j][1]);
  return (rig:number[][])=>{
    const core=[11,12,23,24].every(j=>seen(rig,j));
    if(show(torso,core)){
      const sx=(rig[11][0]+rig[12][0])/2,sy=(rig[11][1]+rig[12][1])/2,hx=(rig[23][0]+rig[24][0])/2,hy=(rig[23][1]+rig[24][1])/2;
      torso.setLocalPosition((sx+hx)/2,(sy+hy)/2,0);torso.setLocalScale(1,Math.max(.6,Math.hypot(sx-hx,sy-hy)/1.65),1);torso.setLocalEulerAngles(0,0,Math.atan2(sy-hy,sx-hx)*180/Math.PI-90);
    }
    if(show(head,seen(rig,0)))head.setLocalPosition(rig[0][0],rig[0][1]+.03,.12);
    for(const limb of limbs){const q=rangerSegment(rig,limb.a,limb.b,limb.pose);if(show(limb.e,q.seen)){limb.e.setLocalPosition(q.x,q.y,0);limb.e.setLocalEulerAngles(0,0,q.angle);limb.e.setLocalScale(.34,q.length/1.25,.3);}}
    for(const t of tips)if(show(t.e,seen(rig,t.j)))t.e.setLocalPosition(rig[t.j][0],rig[t.j][1],.1);
  };
}
