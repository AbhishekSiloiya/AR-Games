// Jack Attack's own player: a rounded toy astronaut, articulated by the tracked body.
// All meshes/materials belong to the current scene through engine helpers; update creates no entities.
import type { Entity, Material } from 'playcanvas';
import { flat, node, shapes, show, W, type Scene } from './engine.ts';
import { playerCount, players, sim } from './pose.ts';
import type { Pad } from './kit.ts';
import { rangerDisplayRig, rangerSegment, type RangerSegment } from './ranger-pose.ts';

export function spaceRanger(scene: Scene, p: number, at: { x: number; y: number; scale: number }) {
  const group = node(scene.root), home = { x: at.x, y: at.y };
  group.name=`space-ranger-${p}`;
  const seat = playerCount() === 2 ? .27 + .46 * p : .5;
  const suit = flat(p ? '#fb923c' : '#38bdf8'), dark = flat('#153551'), white = flat('#f1f9ff');
  const accent = flat(p ? '#fef08a' : '#a3e635'), blue = flat('#225472'), shine = flat('#8cdef4');
  const ball = shapes.sphere(1,10), capsule = shapes.capsule(.5,1.25);
  const orb = (parent: Entity, material: Material, x: number, y: number, z: number, sx: number, sy: number, sz = .22) => {
    const e = node(parent,ball,material,[x,y,z]); e.setLocalScale(sx,sy,sz); return e;
  };
  // Backpack remains visible around the edges of the suit.
  const torso = node(group);
  orb(torso,dark,0,0,-.16,.65,.85,.25);
  for (const side of [-1,1]) { orb(torso,blue,side*.53,-.1,-.1,.18,.62); orb(torso,accent,side*.53,-.65,-.09,.12,.16); }
  orb(torso,suit,0,0,0,.59,.77,.31);
  orb(torso,white,0,.08,.27,.4,.46,.1);
  orb(torso,dark,0,-.06,.38,.25,.25,.04);
  orb(torso,accent,0,-.06,.43,.17,.17,.03);
  node(torso,shapes.quad(.18,.055),white,[0,-.06,.47]);
  node(torso,shapes.quad(.055,.18),white,[0,-.06,.47]);
  for (const side of [-1,1]) orb(torso,accent,side*.2,-.45,.29,.055,.055,.035);
  const belt = node(group); orb(belt,dark,0,0,0,.51,.22,.25); orb(belt,accent,0,0,.24,.16,.12,.035);

  // A rounded helmet with ears, coloured visor, bright eyes and a smiling mouth.
  const neck = node(group,capsule,dark);
  const helmet = node(group);
  orb(helmet,dark,0,-.4,-.03,.34,.12);
  orb(helmet,white,0,0,0,.55,.58,.3);
  for (const side of [-1,1]) { orb(helmet,suit,side*.53,-.04,.02,.13,.23); orb(helmet,accent,side*.55,-.04,.18,.07,.12,.035); }
  orb(helmet,dark,0,-.01,.29,.45,.35,.10);
  orb(helmet,blue,0,.01,.37,.40,.28,.025);
  orb(helmet,shine,-.24,.16,.40,.1,.04,.015);
  for (const side of [-1,1]) {
    orb(helmet,white,side*.16,.015,.41,.075,.105,.02);
    orb(helmet,dark,side*.15,.005,.44,.035,.06,.015);
  }
  const smile = node(helmet,shapes.ring(.105,.135,16,Math.PI),accent,[0,-.095,.42]); smile.setLocalScale(1,.6,1);
  node(helmet,shapes.quad(.045,.25),dark,[.33,.61,-.02]); orb(helmet,accent,.33,.76,.02,.085,.085,.07);
  const limbs = [
    [11,13,.23,suit],[13,15,.25,white],[12,14,.23,suit],[14,16,.25,white],
    [23,25,.25,suit],[25,27,.23,white],[24,26,.25,suit],[26,28,.23,white],
  ].map(([a,b,width,material]) => ({ a:a as number,b:b as number,width:width as number,e:node(group,capsule,material as Material), pose:{x:0,y:0,length:0,angle:0,seen:false} as RangerSegment }));
  const joints = [11,12,13,14,25,26].map(j => ({j,e:orb(group,dark,0,0,.09,j<13?.27:.20,j<13?.27:.20)}));
  const tips = [15,16,27,28].map((j,i) => {
    const e = node(group), boot = i>=2;
    orb(e,dark,0,boot?-.08:0,.05,boot?.30:.28,boot?.29:.30,.22);
    orb(e,boot?suit:accent,0,boot?-.045:.015,.20,boot?.25:.23,boot?.22:.25,.09);
    if (boot) node(e,shapes.quad(.48,.07),accent,[0,-.27,.27]);
    else node(e,shapes.quad(.23,.055),white,[0,.035,.31]);
    return {j,e};
  });
  const spot = node(scene.root,shapes.circle(1,24),flat('#000000',{opacity:.25}),[home.x,home.y-3.35*at.scale,.2]);
  spot.setLocalScale(1.3*at.scale,.16*at.scale,1);
  const pad: Pad = {part:'head',side:0,x:0,y:0,vx:0,vy:0,seen:false}, pads = [pad];
  const visualRig=Array.from({length:33},()=>[0,0,0,0,0]);
  const visible = (rig: number[][], j: number) => !!rig[j] && rig[j][2]>.45 && Number.isFinite(rig[j][0]+rig[j][1]);
  return { at, pads, update() {
    const pl=players[p], rig=rangerDisplayRig(pl.rig,visualRig);
    if (!show(group,pl.present && pl.rig.length===33)) { pad.seen=false; show(spot,false); return pads; }
    const off=sim?pl.lean*1.5:(pl.frame.x/pl.frame.aspect-seat)*W*.9;
    at.x=Math.max(-W/2+1.2,Math.min(W/2-1.2,home.x+off)); at.y=home.y+pl.lift*at.scale;
    group.setLocalPosition(at.x,at.y,.6); group.setLocalScale(at.scale,at.scale,at.scale);
    show(spot,true); spot.setLocalPosition(at.x,home.y-3.35*at.scale,.2);
    const core=visible(rig,11)&&visible(rig,12)&&visible(rig,23)&&visible(rig,24);
    if(show(torso,core)) {
      const sx=(rig[11][0]+rig[12][0])/2, sy=(rig[11][1]+rig[12][1])/2;
      const hx=(rig[23][0]+rig[24][0])/2, hy=(rig[23][1]+rig[24][1])/2;
      torso.setLocalPosition((sx+hx)/2,(sy+hy)/2,0);
      torso.setLocalEulerAngles(0,0,Math.atan2(sy-hy,sx-hx)*180/Math.PI-90);
      torso.setLocalScale(1,Math.max(.65,Math.min(1.35,Math.hypot(sx-hx,sy-hy)/1.55)),1);
      belt.setLocalPosition(hx,hy,.08);
    }
    show(belt,core);
    if(show(neck,core && visible(rig,0))) {
      const sx=(rig[11][0]+rig[12][0])/2, sy=(rig[11][1]+rig[12][1])/2;
      const hx=rig[0][0], hy=rig[0][1]-.3, dx=hx-sx, dy=hy-sy;
      neck.setLocalPosition((sx+hx)/2,(sy+hy)/2,-.03);
      neck.setLocalEulerAngles(0,0,Math.atan2(dy,dx)*180/Math.PI-90);
      neck.setLocalScale(.38,Math.max(.15,Math.hypot(dx,dy))/.9,.3);
    }
    if(show(helmet,visible(rig,0))) {
      const head=rig[0]; helmet.setLocalPosition(head[0],head[1]+.04,.15);
      Object.assign(pad,{x:at.x+head[0]*at.scale,y:at.y+head[1]*at.scale,vx:(head[3]??0)*at.scale,vy:(head[4]??0)*at.scale,seen:true});
    } else pad.seen=false;
    for(const limb of limbs) {
      const s=rangerSegment(rig,limb.a,limb.b,limb.pose);
      if(!show(limb.e,s.seen))continue;
      limb.e.setLocalPosition(s.x,s.y,.01); limb.e.setLocalEulerAngles(0,0,s.angle);
      limb.e.setLocalScale(limb.width*2,s.length/1.25,.34);
    }
    for(const joint of joints) if(show(joint.e,visible(rig,joint.j))) joint.e.setLocalPosition(rig[joint.j][0],rig[joint.j][1],.10);
    for(const tip of tips) if(show(tip.e,visible(rig,tip.j))) tip.e.setLocalPosition(rig[tip.j][0],rig[tip.j][1],.14);
    return pads;
  }};
}
