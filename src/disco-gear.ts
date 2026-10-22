import { lit, mirrorOn, node, shapes, show, tint, type Scene } from './engine.ts';
import { players, trackingSeen } from './pose.ts';
import { headAnchor } from './gear-motion.ts';

export function discoGear(scene: Scene, p: number) {
  const root=node(scene.root);root.name=`disco-player-${p}`;
  const gold=lit('#ffe580',{fog:false}), neon=lit(p?'#ff799c':'#69eee4',{emissive:p?'#ff799c':'#69eee4',glow:.5,fog:false});
  const dark=lit('#151b36',{fog:false});
  const ball=shapes.sphere(1,10), bar=shapes.box(1,1,1);
  const head=node(root);head.name='disco-headphones-and-glasses';
  const piece=(parent: typeof head,mesh: typeof ball,material:typeof gold,x:number,y:number,z:number,sx=1,sy=1,sz=1) => {const e=node(parent,mesh,material,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  // Angular chrome shades, slim luminous headphones and small crystal earrings.
  head.name='disco-fashion-visor';
  const chrome=lit('#dceaff',{fog:false}), lensMesh=shapes.circle(.18,6), rimMesh=shapes.ring(.175,.207,6);
  for(const side of [-1,1]) {
    const rim=piece(head,rimMesh,chrome,side*.205,.12,.1,1,.78,1);rim.setLocalEulerAngles(0,0,30);
    const shade=piece(head,lensMesh,dark,side*.205,.12,.105,1,.78,1);shade.setLocalEulerAngles(0,0,30);
    piece(head,bar,neon,side*.205,.2,.12,.25,.022,.02).setLocalEulerAngles(0,0,side*12);
    piece(head,bar,chrome,side*.205-.045,.13,.13,.09,.015,.02).setLocalEulerAngles(0,0,35);
    piece(head,ball,dark,side*.48,.12,.03,.10,.20,.09);
    piece(head,ball,chrome,side*.48,.12,.1,.075,.17,.07);
    piece(head,ball,neon,side*.48,.12,.17,.045,.11,.025);
    piece(head,shapes.facets(.055),neon,side*.43,-.16,.08);
  }
  piece(head,bar,chrome,0,.12,.11,.09,.025,.025);
  const arch=piece(head,shapes.arch(.46,.026),chrome,0,.28,.02);arch.setLocalEulerAngles(0,0,180);
  const cuffs=[0,1].map(i=>{const e=piece(root,shapes.ring(.095,.15,16),neon,0,0,.2);e.name=`disco-cuff-${i}`;return e;});
  root.enabled=false;
  return (dancing: boolean,wobble: boolean,dt: number) => {
    const pl=players[p], anchor=headAnchor(pl.body,pl.frame.aspect), fresh=performance.now()-trackingSeen[p]<800;
    if (!show(root,mirrorOn()&&pl.present&&fresh)) return;
    if (show(head,!!anchor)&&anchor) {
      const pos=head.getLocalPosition(), k=1-Math.exp(-Math.max(.001,dt)*18);
      head.setLocalPosition(pos.x+(anchor.x-pos.x)*k,pos.y+(anchor.y-pos.y)*k,.8);
      head.setLocalScale(anchor.scale*.65,anchor.scale*.65,anchor.scale*.65);head.setLocalEulerAngles(0,0,anchor.angle);
    }
    const unit=Math.min(9,16/pl.frame.aspect), scale=pl.frame.sw*unit;
    cuffs.forEach((e,h)=>{
      const q=pl.rig[15+h];
      if (!show(e,!!q&&q[2]>=.35)) return;
      e.setLocalPosition((pl.frame.x-pl.frame.aspect/2+q[0]*pl.frame.sw)*unit,(.5-pl.frame.y+q[1]*pl.frame.sw)*unit,1);
      e.setLocalScale(scale,scale,1);
    });
    const hue=dancing?(p?'#ff799c':'#69eee4'):wobble?'#ff657d':'#a5efff';
    tint(arch,hue,'diffuse');cuffs.forEach(e=>tint(e,hue,'diffuse'));

  };
}
