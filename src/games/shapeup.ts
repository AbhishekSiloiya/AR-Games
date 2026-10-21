// Shape Up — match a clear target before the pose timer empties. Each player has
// an independent match figure and score; both see the same poses and timing.
import type { GraphNode } from 'playcanvas';
import { hardness } from '../meta.ts';
import { players, poseMatch as match, sim, trackingSeen } from '../pose.ts';
import { shapeVerdict } from '../shapeup-rules.ts';
import { backdrop, flat, node, shapes, show, tint } from '../engine.ts';
import { bursts as makeBursts, hitSound, music, round, sfx, type Game } from '../kit.ts';

const D = Math.PI / 180, SHOW = 1.1, POSES_PER_ROUND = 8; // SHOW = seconds the verdict stays up
const LEGS = [-95, -90, -85, -90];
// Limb angles in degrees, screen space (0 = pointing right, 90 = up), in pose.ts LIMBS order:
// screen-left upper arm, forearm, screen-right upper arm, forearm, then thigh, shin for each leg.
const POSES: [string, number[]][] = ([
  ['T', [180, 180, 0, 0, ...LEGS]], ['Y', [135, 135, 45, 45, ...LEGS]], ['Reach up', [100, 95, 80, 85, ...LEGS]],
  ['Goalposts', [180, 90, 0, 90, ...LEGS]], ['One up, one out', [100, 95, 0, 0, ...LEGS]], ['One out, one up', [180, 180, 80, 85, ...LEGS]],
  ['Star', [150, 150, 30, 30, -120, -115, -60, -65]], ['Hands on hips', [-135, -45, -45, -135, ...LEGS]], ['Wide squat', [180, 180, 0, 0, -150, -90, -30, -90]],
  ['Diagonal', [135, 135, -45, -45, ...LEGS]], ['Leg out', [100, 95, 80, 85, -135, -130, -85, -90]], ['T with a kick', [180, 180, 0, 0, -95, -90, -45, -50]],
  ['Crossed up high', [45, 45, 135, 135, ...LEGS]], ['Teapot', [180, 90, -45, -135, ...LEGS]], ['Y squat', [135, 135, 45, 45, -150, -90, -30, -90]],
  ['Knee up', [-100, -95, 80, 85, -95, -90, -40, -120]],
] as [string, number[]][]).map(([name, pose]) => [name, pose.map((deg) => deg * D)]);
const STAND = [-100, -95, -80, -85, ...LEGS].map((deg) => deg * D);

// A figure built from 8 limb angles. Same skeleton for target and player, so they are directly comparable.
const JOINTS = [[-0.75, 2], [0, 0], [0.75, 2], [0, 0], [-0.4, 0], [0, 0], [0.4, 0], [0, 0]]; // even slots; odd ones chain on
const LENGTHS = [1.1, 1, 1.1, 1, 1.5, 1.4, 1.5, 1.4];
function makeFigure(parent: GraphNode, width: number, hex: string, opacity: number, z: number) {
  const group = node(parent, undefined, undefined, [0, 0, z]), look = flat(hex, { opacity });
  const limbMesh = shapes.limb(width / 2); // rounded, pivots at its near end
  const limbs = LENGTHS.map((len) => { const e = node(group, limbMesh, look); e.setLocalScale(len, 1, 1); return e; });
  const body = [node(group, shapes.capsule(width * 0.9, 1.5 + width * 0.8), look, [0, 1, 0]), node(group, shapes.circle(0.34 + width * 0.35, 28), look, [0, 2.8, 0])];
  const pose = (angles: number[]) => {
    let x = 0, y = 0;
    angles.forEach((a, i) => {
      if (i % 2 === 0) [x, y] = JOINTS[i];
      limbs[i].setLocalPosition(x, y, 0);
      limbs[i].setLocalEulerAngles(0, 0, a / D);
      x += Math.cos(a) * LENGTHS[i];
      y += Math.sin(a) * LENGTHS[i];
    });
  };
  return { group, limbs, body, pose };
}
const COLD = '#ff4d8d', WARM = '#ffe14d', HOT = '#7dff7a';
const limbError = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) / D;

export default function shapeUp({ n, stage, onEnd, hud, scene }: Game) {
  const PER_POSE = Math.max(3.2, 5.2 / hardness(stage));
  backdrop(scene, 'studio');
  const order = [...POSES].sort(() => Math.random() - 0.5);
  const seats = Array.from({ length: n }, (_, p) => {
    const cx = n === 1 ? 0 : (p - .5) * 8;
    const world = node(scene.root, undefined, undefined, [cx, -.65, 0]);
    const scale = n === 1 ? .82 : .68;
    world.setLocalScale(scale, scale, scale);
    const target = makeFigure(world, .62, COLD, .9, 0);
    target.group.name = `shapeup-target-${p}`;
    const mini = node(scene.root, undefined, undefined, [cx + (n === 1 ? 5.15 : 2.75), 1.65, 1]);
    mini.setLocalScale(.26, .26, .26);
    const me = makeFigure(mini, .24, p ? '#ffb675' : '#3de1ff', 1, 0);
    me.group.name = `shapeup-live-pose-${p}`;
    const barWidth = n === 1 ? 9 : 5.6;
    node(scene.root, shapes.quad(barWidth, .16), flat('#283448'), [cx, 3.35, .1]);
    const timer = node(scene.root, shapes.quad(1, .16), flat('#ffe14d'), [cx, 3.35, .2]);
    timer.name = `shapeup-pose-timer-${p}`;
    return { cx, world, target, me, timer, barWidth, bursts: makeBursts(world), score: 0, best: 0, streak: 0 };
  });
  let judged = -1;
  const tick = round(hud, POSES_PER_ROUND * PER_POSE, () => { music.stop(); onEnd(seats.map(s => s.score)); });
  music.start('dance', undefined, .5);
  const fresh = (p: number) => players[p].present && (sim || (trackingSeen[p] > 0 && performance.now() - trackingSeen[p] <= 600));
  if (sim) Object.assign(window, { __shapeup: { seats, order, perPose: PER_POSE } });

  return (rawDt: number) => {
    const dt = Math.min(rawDt, .05), t = tick(rawDt);
    if (t === null) return;
    const i = Math.floor(Math.max(0, t) / PER_POSE), into = Math.max(0, t) - i * PER_POSE;
    const [name, pose] = order[i % order.length], matching = into < PER_POSE - SHOW;
    const remaining = Math.max(0, PER_POSE - SHOW - into), fraction = remaining / (PER_POSE - SHOW);
    music.intensity(.4 + (1 - fraction) * .5);
    seats.forEach((seat, p) => {
      const present = fresh(p);
      const mine = players[p].angles ?? (sim && players[p].hands[1].y > .5 ? pose : STAND);
      const valid = present && mine.length === 8 && mine.every(Number.isFinite);
      const quality = valid ? match(mine, pose) : 0;
      seat.target.pose(pose);
      seat.me.pose(valid ? mine : STAND);
      show(seat.me.group, valid);
      show(seat.target.group, t >= 0);
      show(seat.timer, t >= 0 && matching);
      seat.timer.setLocalScale(Math.max(.001, seat.barWidth * fraction), 1, 1);
      seat.timer.setLocalPosition(seat.cx - seat.barWidth * (1 - fraction) / 2, 3.35, .2);
      seat.target.limbs.forEach((limb, k) => {
        const err = valid ? limbError(mine[k], pose[k]) : Infinity;
        tint(limb, err < 18 ? HOT : err < 40 ? WARM : COLD);
      });
      for (const part of seat.target.body) tint(part, quality >= 80 ? HOT : quality >= 50 ? WARM : COLD);
      if (t < 0) hud.p('h', p, 'Match the target · your pose is at top right');
      else if (matching) {
        if (into > PER_POSE - SHOW - .6 && valid) seat.best = Math.max(seat.best, quality);
        hud.p('h', p, `${name} · ${quality}% · ${remaining.toFixed(1)}s`);
      } else if (judged !== i) {
        const result = shapeVerdict(seat.best, seat.streak, valid);
        seat.streak = result.streak; seat.score += result.points; seat.best = 0;
        hud.p('h', p, result.quality >= 90 ? `Perfect! ${result.quality}%` : result.quality >= 60 ? `Nice! ${result.quality}%${seat.streak > 1 ? ` · streak ×${seat.streak}` : ''}` : valid ? `Try the next one · ${result.quality}%` : 'Step into view for the next pose');
        if (result.quality >= 60) {
          hitSound(result.quality >= 90 ? 'powerUp' : 'confirmation', seat.streak * 2, .6);
          for (const limb of seat.target.limbs) { const at = limb.getLocalPosition(); seat.bursts.burst(at.x, at.y, 1.5, result.quality >= 90 ? WARM : HOT, 8, 7); }
        } else sfx('impactWood_heavy', {vol:.35});
      }
      seat.bursts.update(dt);
      hud.p('s', p, present ? String(seat.score) : 'Step into view');
    });
    if (t >= 0 && !matching) judged = i;
  };
}
