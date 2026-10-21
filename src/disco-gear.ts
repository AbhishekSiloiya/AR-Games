import { flat, lit, mirrorOn, node, shapes, show, tint, type Scene } from './engine.ts';
import { players, trackingSeen } from './pose.ts';
import { headAnchor } from './gear-motion.ts';

export function discoGear(scene: Scene, p: number) {
  const root=node(scene.root);root.name=`disco-player-${p}`;
  const gold=lit('#ffe580',{fog:false}), neon=lit(p?'#ff799c':'#69eee4',{emissive:p?'#ff799c':'#69eee4',glow:.5,fog:false});
  const dark=lit('#202442',{fog:false}), glass=flat('#a78bfa',{opacity:.55,fog:false});
  const ring=shapes.ring(.14,.195,18), lens=shapes.circle(.14,18), ball=shapes.sphere(1,10), bar=shapes.box(1,1,1);
  const head=node(root);head.name='disco-headphones-and-glasses';
  const piece=(parent: typeof head,mesh: typeof ball,material:typeof gold,x:number,y:number,z:number,sx=1,sy=1,sz=1) => {const e=node(parent,mesh,material,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;};
  for(const side of [-1,1]) {
    piece(head,ring,gold,side*.205,.08,.1);
    piece(head,lens,glass,side*.205,.08,.105);
    piece(head,ball,dark,side*.49,.12,.03,.13,.24,.1);
    piece(head,ball,neon,side*.5,.12,.1,.09,.17,.08);
    for(let k=0;k<3;k++) piece(head,bar,gold,side*.205+(k-1)*.075,.1,.12,.025,.1,.015);
  }
  piece(head,bar,gold,0,.08,.11,.09,.035,.025);
  const arch=piece(head,shapes.arch(.46,.035),neon,0,.25,.02);arch.setLocalEulerAngles(0,0,0);
  const crown=piece(head,shapes.facets(.1),gold,0,.75,.04);crown.setLocalEulerAngles(0,0,45);
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
    crown.rotateLocal(0,0,dt*(dancing?70:0));
  };
}
