import { flat, lit, mirrorOn, node, shapes, show, tint, type Scene } from './engine.ts';
import { players, trackingSeen } from './pose.ts';
import { headAnchor } from './gear-motion.ts';
import { partyLook } from './moon-experience.ts';

// Sculpted accessories share the real head/wrist projection; no segmentation or body cut-out.
export function discoGear(scene:Scene,p:number){
  const look=partyLook(),root=node(scene.root);root.name=`disco-player-${p}`;
  const head=node(root);head.name=`disco-fashion-${look}`;
  const chrome=lit('#e2e9f0',{fog:false}),shadow=lit('#242638',{fog:false}),light=flat('#ffffff');
  const accent=look==='prism'?'#ff8cbb':'#c9a6ff',neon=lit(accent,{emissive:accent,glow:.3,fog:false});
  const lens=lit(look==='prism'?'#e89bd3':'#63778c',{opacity:.7,fog:false});
  const ball=shapes.sphere(1,24),bar=shapes.box(1,1,1);
  const piece=(parent:typeof head,mesh:typeof ball,material:typeof chrome,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const e=node(parent,mesh,material,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  if(look==='chrome'){
    const band=piece(head,shapes.arch(.47,.045),chrome,0,.28,.01);band.setLocalEulerAngles(0,0,180);
    const lining=piece(head,shapes.arch(.435,.027),shadow,0,.28,.03);lining.setLocalEulerAngles(0,0,180);
    for(const side of [-1,1]){
      piece(head,ball,shadow,side*.49,.1,.02,.12,.24,.11);
      piece(head,ball,chrome,side*.505,.1,.1,.10,.20,.065);
      piece(head,bar,neon,side*.505,.1,.165,.025,.23,.015);
      for(let j=0;j<3;j++)piece(head,bar,shadow,side*.505,.07+j*.025,.171,.09,.008,.01);
      // Slim, continuous oval frames instead of opaque hexagon cut-outs.
      piece(head,ball,chrome,side*.205,.105,.09,.215,.105,.035);
      piece(head,ball,lens,side*.205,.105,.125,.185,.077,.025);
      piece(head,bar,light,side*.205-.06,.13,.15,.11,.009,.008).setLocalEulerAngles(0,0,18);
    }
    piece(head,bar,chrome,0,.115,.12,.09,.023,.023);
  }else if(look==='prism'){
    // A rose wraparound lens with a lifted chrome brow and small crystal drops.
    for(const side of [-1,1]){
      piece(head,bar,chrome,side*.42,.09,.04,.025,.055,.025);
      piece(head,shapes.ring(.045,.055,20),chrome,side*.40,-.1,.08);
      piece(head,shapes.facets(.06,1),neon,side*.40,-.21,.08);
    }
  }
  const cuffs=[0,1].map(i=>{const group=node(root);group.name=`disco-cuff-${i}`;piece(group,shapes.ring(.10,.145,24),chrome,0,0,0);piece(group,shapes.ring(.146,.16,24),neon,0,0,.02);return group;});
  root.enabled=false;
  return(dancing:boolean,wobble:boolean,dt:number)=>{
    const pl=players[p],anchor=headAnchor(pl.body,pl.frame.aspect),fresh=performance.now()-trackingSeen[p]<800;
    if(!show(root,mirrorOn()&&pl.present&&fresh))return;
    if(show(head,look!=='minimal'&&!!anchor)&&anchor){const pos=head.getLocalPosition(),k=1-Math.exp(-Math.max(.001,dt)*18);head.setLocalPosition(pos.x+(anchor.x-pos.x)*k,pos.y+(anchor.y-pos.y)*k,.8);head.setLocalScale(anchor.scale*.65,anchor.scale*.65,anchor.scale*.65);head.setLocalEulerAngles(0,0,anchor.angle);}
    const unit=Math.min(9,16/pl.frame.aspect),scale=pl.frame.sw*unit;
    cuffs.forEach(e=>{const h=cuffs.indexOf(e),q=pl.rig[15+h];if(!show(e,!!q&&q[2]>=.35))return;e.setLocalPosition((pl.frame.x-pl.frame.aspect/2+q[0]*pl.frame.sw)*unit,(.5-pl.frame.y+q[1]*pl.frame.sw)*unit,1);e.setLocalScale(scale,scale,1);});
    cuffs.forEach(e=>tint(e,dancing?accent:wobble?'#ff8c9c':'#c9f5f2','emissive'));
  };
}
