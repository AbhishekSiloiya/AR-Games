// Shape Up — match a clear target before the pose timer empties. Each player has
// an independent match figure and score; both see the same poses and timing.
import { hardness } from '../meta.ts';
import { players, poseMatch as match, sim, trackingSeen } from '../pose.ts';
import { shapeVerdict } from '../shapeup-rules.ts';
import { backdrop, mirrorOn } from '../engine.ts';
import { shapeupOverlay } from '../shapeup-overlay.ts';
import { hitSound, music, round, sfx, type Game } from '../kit.ts';

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

export default function shapeUp({ n, stage, onEnd, hud, scene }: Game) {
  const PER_POSE = Math.max(3.2, 5.2 / hardness(stage));
  backdrop(scene, 'studio', true);
  const coach = shapeupOverlay(n, mirrorOn());
  scene.cleanup(() => coach.dispose());
  const order = [...POSES].sort(() => Math.random() - 0.5);
  const seats = Array.from({ length: n }, () => ({ score: 0, best: 0, streak: 0, verdict: '' }));
  let judged = -1;
  const tick = round(hud, POSES_PER_ROUND * PER_POSE, () => { music.stop(); onEnd(seats.map(s => s.score)); });
  music.start('dance', undefined, .5);
  const fresh = (p: number) => players[p].present && (sim || (trackingSeen[p] > 0 && performance.now() - trackingSeen[p] <= 600));
  if (sim || import.meta.env.DEV) {
    Object.assign(window, { __shapeup: { seats, order, perPose: PER_POSE } });
    scene.cleanup(() => { delete (window as Window & { __shapeup?: unknown }).__shapeup; });
  }

  return (rawDt: number) => {
    const t = tick(rawDt);
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
      if (t < 0) seat.verdict = 'Watch the pose. Be the pose.';
      else if (matching) {
        if (into > PER_POSE - SHOW - .6 && valid) seat.best = Math.max(seat.best, quality);
        seat.verdict = 'Make it yours';
      } else if (judged !== i) {
        const result = shapeVerdict(seat.best, seat.streak, valid);
        seat.streak = result.streak; seat.score += result.points; seat.best = 0;
        seat.verdict = result.quality >= 90 ? `Perfect! ${result.quality}%` : result.quality >= 60 ? `Nice! ${result.quality}%${seat.streak > 1 ? ` · streak ×${seat.streak}` : ''}` : valid ? `Try the next one · ${result.quality}%` : 'Step into view for the next pose';
        if (result.quality >= 60) {
          hitSound(result.quality >= 90 ? 'powerUp' : 'confirmation', seat.streak * 2, .6);
        } else sfx('impactWood_heavy', {vol:.35});
      }
      coach.update(p, pose, name, quality, remaining, fraction, i, valid, t < 0, seat.verdict);
      hud.p('h', p, '');
      hud.p('s', p, present ? String(seat.score) : 'Step into view');
    });
    if (t >= 0 && !matching) judged = i;
  };
}
