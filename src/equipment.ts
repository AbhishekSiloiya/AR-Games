// Small, round-owned toy equipment. Local origin is the same contact point used by the game.
import type { GraphNode } from 'playcanvas';
import { flat, lit, node, shapes } from './engine.ts';
export type Equipment = 'ninja' | 'keeper' | 'sponge' | 'boxing';
export function equipmentFactory(kind: Equipment) {
  const ball=shapes.sphere(1,20), box=shapes.box(1,1,1), pill=shapes.capsule(.12,.5);
  const cream=lit('#fff6dc',{fog:false}), ink=lit('#18243a',{fog:false}), coral=lit('#ff6b68',{fog:false}), cyan=lit('#45d8de',{fog:false}), yellow=lit('#ffe16b',{fog:false});
  const green=lit('#119b84',{fog:false}), foam=flat('#e3ffff',{opacity:.78,fog:false});
  return (parent: GraphNode, side: number, tone: string) => {
    const root=node(parent);root.name=`equipment-${kind}-${side}`;
    const part=(mesh: typeof ball, look: typeof cream, x: number,y: number,z: number,sx: number,sy: number,sz: number) => {
      const e=node(root,mesh,look,[x,y,z]);e.setLocalScale(sx,sy,sz);return e;
    };
    if (kind==='boxing') {
      const glove=lit(side?'#3f91f5':'#f25a79',{fog:false});
      part(ball,glove,0,.15,0,.6,.68,.3);
      part(ball,glove,side===0?-.42:.42,-.06,.1,.26,.35,.24);
      part(box,ink,0,-.43,.01,.84,.32,.4);
      part(box,cream,0,-.43,.23,.56,.12,.04);
      part(ball,cream,-.13,.36,.27,.17,.08,.02);
      for(let k=0;k<4;k++)part(ball,glove,(k-1.5)*.22,.4,.24,.13,.2,.06);
      part(box,coral,0,-.43,.255,.62,.055,.02);
      for(const side of [-1,1])part(box,cream,side*.28,-.43,.26,.025,.16,.02);
      part(ball,glove,.08,.12,.29,.3,.28,.04);
    } else if (kind==='sponge') {
      part(box,green,0,-.2,0,1.35,.26,.4);
      part(box,yellow,0,.04,.05,1.35,.48,.46);
      for (let k=0;k<6;k++) part(ball,cream,(k%3-1)*.34,Math.floor(k/3)*.17-.04,.3,.055,.04,.02);
      for (let k=0;k<5;k++) part(ball,foam,(k-2)*.24,.38+(k%2)*.08,.04,.1+(k%2)*.04,.1+(k%2)*.04,.09);
    } else if (kind==='keeper') {
      part(ball,cream,0,.08,0,.57,.59,.24);
      const sign=side===0?-1:1;
      for(let k=0;k<4;k++) part(pill,k%2?cream:cyan,(k-1.5)*.25,.55+(.06-Math.abs(k-1.5)*.045),.01,1,1,.9);
      const thumb=part(pill,cream,sign*.55,.05,0,1,1,.9);thumb.setLocalEulerAngles(0,0,-sign*48);
      part(box,ink,0,-.46,.01,.84,.3,.38);
      part(box,coral,0,-.46,.22,.75,.1,.03);
      part(box,cyan,0,.05,.25,.65,.17,.03);
      part(box,ink,0,.06,.275,.13,.35,.02);
    } else {
      const colour=lit(tone,{fog:false});
      part(ball,ink,0,0,0,.54,.56,.28);
      part(box,colour,0,-.38,.02,.88,.32,.45);
      part(box,cream,0,-.38,.26,.65,.075,.025);
      for(let k=0;k<3;k++) part(box,k===1?coral:cream,(k-1)*.25,.18,.28,.19,.43,.14).setLocalEulerAngles(0,0,(k-1)*-7);
      const thumb=part(ball,colour,(side===0?-.5:.5),-.03,.03,.23,.32,.24);thumb.setLocalEulerAngles(0,0,side===0?-25:25);
      part(box,cyan,0,-.08,.31,.62,.1,.04);
    }
    root.enabled=false;
    return root;
  };
}
