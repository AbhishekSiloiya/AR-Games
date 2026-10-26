// Shape Up — match a clear target before the pose timer empties. Each player has
// an independent match figure and score; both see the same poses and timing.
import { hardness } from '../meta.ts';
import { players, poseMatch as match, sim, trackingSeen } from '../pose.ts';
import { shapeClock, shapeDuration, shapeSeat, shapeTrackedBody, shapeRank, stepShape } from '../shapeup-rules.ts';
import { backdrop, mirrorOn } from '../engine.ts';
import { shapeupOverlay } from '../shapeup-overlay.ts';
import { hitSound, music, round, sfx, type Game } from '../kit.ts';

const D = Math.PI / 180, POSES_PER_ROUND = 8;
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
  const seats = Array.from({ length: n }, shapeSeat);
  const matchSeconds = PER_POSE - 1.1;
  let clock = shapeClock(-1, matchSeconds, POSES_PER_ROUND);
  const tick = round(hud, shapeDuration(matchSeconds, POSES_PER_ROUND), () => { music.stop(); onEnd(seats.map(s => s.score), seats.map(s => {const medal=shapeRank(s.stars);return [`${medal.medal} · ${medal.rank}`,`${s.stars}/24 quest stars`,`${s.path.filter(stars=>stars>=2).length}/8 poses matched`,`Best chain ×${s.bestCombo}`];})); });
  music.start('pose', undefined, .5);
  const fresh = (p: number) => players[p].present && (sim || (trackingSeen[p] > 0 && performance.now() - trackingSeen[p] <= 600));
  if (sim || import.meta.env.DEV) {
    Object.assign(window, { __shapeup: { seats, order, perPose: matchSeconds + 2.7, matchSeconds, get phase(){return clock.phase;}, get index(){return clock.index;}, get remaining(){return clock.remaining;} } });
    scene.cleanup(() => { delete (window as Window & { __shapeup?: unknown }).__shapeup; });
  }

  return (rawDt: number) => {
    const t = tick(rawDt);
    if (t === null) return;
    clock = shapeClock(t, matchSeconds, POSES_PER_ROUND);
    const i = clock.index, [name, pose] = order[i % order.length];
    const fraction = clock.phase === 'match' ? clock.remaining / matchSeconds : clock.phase === 'rest' ? clock.remaining / 1.5 : 0;
    music.intensity(clock.phase === 'match' ? .5 : .25);
    seats.forEach((previous, p) => {
      const present = fresh(p);
      const mine = players[p].angles ?? (sim && players[p].hands[1].y > .5 ? pose : STAND);
      const valid = present && (sim || shapeTrackedBody(players[p].body)) && mine.length === 8 && mine.every(Number.isFinite);
      const quality = valid ? match(mine, pose) : 0;
      const update = stepShape(previous, i, clock.phase, quality, valid, t, clock.remaining);
      const seat = seats[p] = update.state;
      coach.quest(p, seat, i, clock.phase);
      if (update.justLocked) hitSound('confirmation', seat.streak * 2, .65);
      if (update.scored && seat.verdict === 'perfect') hitSound('powerUp', seat.streak * 2, .6);
      else if (update.scored && (seat.verdict === 'unmatched' || seat.verdict === 'absent')) sfx('impactWood_heavy', {vol:.25});
      let feedback = 'matching', status = 'Find the shape', detail = 'Copy the reference — hold it briefly';
      if (clock.phase === 'countdown') {feedback='countdown';status='Get ready';detail='Your first pose is coming';}
      else if (clock.phase === 'rest') {feedback='rest';status='Relax & reset';detail=`Next pose in ${Math.ceil(clock.remaining)}…`;}
      else if (clock.phase === 'result' || clock.phase === 'done') {
        feedback = seat.verdict;
        status = seat.verdict === 'perfect' ? '✓ Perfect match!' : seat.verdict === 'matched' ? '✓ Shape matched!' : seat.verdict === 'partial' ? 'Nearly there!' : seat.verdict === 'absent' ? 'We lost your pose' : 'Try the next one';
        detail = seat.verdict === 'absent' ? 'Step back into view' : `${seat.quality}% · ${'★'.repeat(Math.max(0,seat.path[i])) || 'Keep exploring'}${i === POSES_PER_ROUND-1 ? ` · ${shapeRank(seat.stars).medal} finish!` : ''}`;
      } else if (!valid) {feedback='absent';status='Step into view';detail='Keep your body visible';}
      else if (seat.locked) {feedback='matched';status='✓ Shape matched!';detail='You’ve got it — you can relax';}
      else if (seat.holdSince !== null) {feedback='hold';status='Hold that shape…';detail='Just a moment — almost matched';}
      coach.update(p, pose, name, clock.phase === 'result' || clock.phase === 'rest' ? seat.quality : seat.locked ? seat.best : quality, clock.remaining, fraction, i, valid, clock.phase === 'countdown', detail, clock.phase, feedback, status);
      hud.p('h', p, '');
      hud.p('s', p, present ? String(seat.score) : 'Step into view');
    });
  };
}
