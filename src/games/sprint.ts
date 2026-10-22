// Sprint — run on the spot, knees up. Three 14-second heats with a breather between them (the game makes you take it:
// intervals are the workout, and players feel less tired than they are). Your pace is your cadence; the riverside trail rushes
// past at exactly the speed you are making. Heat two adds hurdles — jump them, or throw both arms up to vault if you
// would rather not jump — and the last heat pays double. A marker on the track runs at the pace of your best ever.
// Two players: a team adds its metres together; rivals race side by side.
import { isAir, players } from '../pose.ts';
import { hardness } from '../meta.ts';
import { squatDepth, stepper } from '../reps.ts';
import { fade, flat, node, shapes, show } from '../engine.ts';
import { scenicTrack } from '../scenic-track.ts';
import { modelPlayer } from '../model-player.ts';
import { PLAYER_COLORS, bestLine, bursts as makeBursts, hitSound, hitStop, music, round, say, sfx, zoneHalf, zoneX, type Game } from '../kit.ts';

const HEAT = 14, REST = 7, HEATS = 3, LENGTH = HEAT * HEATS + REST * (HEATS - 1), STRIDE = 1.9, HORIZON = 0.35, LINE = -3.2;
// A thing on the track at depth s (0 = the horizon, 1 = at your feet): where it is on the stage, and how big.
const depth = (s: number) => { const k = s ** 2.4; return { y: HORIZON + (LINE - HORIZON) * k, size: 0.12 + 0.88 * k }; };

export default async function sprint({ n, stage, team, best, onEnd, hud, scene }: Game) {
  let disposed=false;scene.cleanup(()=>{disposed=true;});
  const hard = hardness(stage), world = scenicTrack(scene, n);
  const models = await Promise.all(Array.from({ length: n }, (_, p) => modelPlayer(scene,{name:`sprint-model-player-${p}`,x:zoneX(n,p),y:LINE-.2,z:.5,height:3.5,yaw:180,color:PLAYER_COLORS[p]})));
  const bodies=models.filter(model=>model!==null);
  if(disposed||bodies.length!==n)return()=>{};
  const bar = shapes.quad(1, 0.22), post = shapes.quad(0.1, 0.9), barLook = flat('#f43f5e', { opacity: 1 }), postLook = flat('#f8fafc', { opacity: 1 });
  const hurdles = Array.from({ length: n }, (_, p) => Array.from({ length: 3 }, () => {
    const e = node(scene.root, undefined, undefined, [zoneX(n, p), 0, 0.3]);
    node(e, bar, barLook, [0, 0.55, 0]); node(e, post, postLook, [-0.5, 0.1, 0]); node(e, post, postLook, [0.5, 0.1, 0]);
    e.enabled = false;
    return { e, s: -1, judged: false };
  }));
  const ghost = best > 0 ? node(scene.root, shapes.quad(zoneHalf(n) * 1.5, 0.08), flat('#fde047', { opacity: 0.8 })) : null;
  const bursts = makeBursts(scene.root), passed = bestLine(hud, best);
  const runners = Array.from({ length: n }, () => ({ step: stepper(), speed: 0, metres: 0, steps: 0, top: 0, cleared: 0, stumble: 0, nextHurdle: 2 }));
  const g = { heat: -1, resting: false, scenery:0 };
  const diagnostics=()=>({heat:g.heat,resting:g.resting,scenery:g.scenery,players:runners.map((runner,p)=>({steps:runner.steps,cadence:runner.speed/STRIDE,speed:runner.speed,metres:runner.metres,clip:bodies[p].clip}))});
  Object.assign(window,{__sprint:diagnostics});scene.cleanup(()=>{if((window as unknown as {__sprint?:unknown}).__sprint===diagnostics)delete(window as unknown as {__sprint?:unknown}).__sprint;});
  const total = () => (team ? runners.reduce((a, r) => a + r.metres, 0) : Math.max(...runners.map((r) => r.metres)));
  const tick = round(hud, LENGTH, () => {
    music.stop();
    const scores = team ? runners.map(() => Math.round(total())) : runners.map((r) => Math.round(r.metres));
    onEnd(scores, runners.map((r) => [`Top speed ${r.top.toFixed(1)} m/s`, `${r.steps} steps`, r.cleared ? `${r.cleared} hurdles cleared` : ''].filter(Boolean)));
  });
  music.start('run');

  return (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05), t = tick(rawDt);
    if (t === null) return;
    const slot = Math.max(0, t) % (HEAT + REST), heat = Math.min(HEATS - 1, Math.floor(Math.max(0, t) / (HEAT + REST))), resting = t >= 0 && slot >= HEAT && heat < HEATS - 1, final = heat === HEATS - 1;
    if (t >= 0 && heat !== g.heat) { g.heat = heat; hud.banner(final ? 'Final heat · double metres!' : heat ? 'Heat two · hurdles!' : 'Knees up!', 1600); say(final ? 'final_round' : 'go'); sfx('zapThreeToneUp', { vol: 0.6 }); }
    if (resting !== g.resting) { g.resting = resting; if (resting) { hud.banner('Breathe', 1800); sfx('zapThreeToneDown', { vol: 0.5 }); } }

    let pace = 0;
    runners.forEach((r, p) => {
      const pl = players[p], body = bodies[p], { steps, cadence } = r.step(pl.present?pl.rig:[], Math.max(0, t));
      r.stumble = Math.max(0, r.stumble - dt);
      const want = pl.present && t >= 0 && !resting ? cadence * STRIDE * (r.stumble > 0 ? 0.4 : 1) : 0;
      r.speed += (want - r.speed) * Math.min(1, dt * 4);
      r.metres += r.speed * dt * (final ? 2 : 1); r.top = Math.max(r.top, r.speed); pace += r.speed / n;
      body.show(pl.present);
      body.place(zoneX(n,p)+Math.max(-.65,Math.min(.65,pl.lean*.4)),LINE-.2+Math.max(0,pl.lift)*1.6);
      if(!isAir(pl)&&!resting&&pl.lift<-.35)body.pose('Sitting',squatDepth(pl.lift));
      else body.play(isAir(pl)?'Jump':resting||t<0||r.speed<.5?'Idle':'Running',isAir(pl)?1:Math.max(.65,Math.min(2.4,r.speed/4.3)));
      if (steps && t >= 0 && !resting) { r.steps += steps; bursts.burst(body.at.x, LINE - 0.2, 0.4, '#fed7aa', 4, 2.5); sfx('footstep_concrete', { vol: 0.2 + Math.min(0.3, r.speed / 20) }); }

      // Hurdles, from the second heat: they come out of the distance at the speed you are running.
      if (heat >= 1 && !resting && t >= 0 && (r.nextHurdle -= dt) <= 0) { const free = hurdles[p].find((h) => h.s < 0); r.nextHurdle = (3.6 + Math.random() * 1.6) / Math.sqrt(hard); if (free && r.speed > 1) Object.assign(free, { s: 0, judged: false }); }
      for (const h of hurdles[p]) {
        if (!show(h.e, h.s >= 0)) continue;
        h.s += (0.12 + r.speed * 0.055) * dt;
        const at = depth(Math.min(1.15, h.s)), over = isAir(pl) || (pl.hands[0].seen && pl.hands[1].seen && pl.hands[0].y > 0.6 && pl.hands[1].y > 0.6); // a jump, or both arms thrown up
        h.e.setLocalPosition(body.at.x, at.y, 0.3); h.e.setLocalScale(at.size * 3.4, at.size * 1.6, 1); fade(h.e, Math.min(1, h.s * 4));
        if (!h.judged && h.s > 0.9) {
          h.judged = true;
          if (over) { r.cleared++; r.metres += 5; hitSound('phaseJump', r.cleared, 0.5); hud.pop(body.at.x, LINE + 1.4, 'Cleared! +5 m', '#a3e635'); }
          else { r.stumble = 0.9; sfx('impactWood_heavy', { vol: 0.7 }); hud.shake(0.6); hud.pop(body.at.x, LINE + 1.4, 'Clipped it!', '#ef4444'); bursts.burst(body.at.x, LINE + 0.4, 0.5, '#f43f5e', 18, 7); hitStop(60); }
        }
        if (h.s > 1.12) h.s = -1;
      }
      hud.p('s', team ? 0 : p, !pl.present ? 'Step into view' : `${Math.round(team ? total() : r.metres)} m`);
      hud.p('h', p, t < 0 ? 'Run on the spot, knees up' : resting ? `Breathe · next heat in ${Math.ceil(HEAT + REST - slot)}` : `${r.speed.toFixed(1)} m/s${final ? ' · ×2' : ''}`);
    });
    // A gentle scenic drift keeps a stationary player oriented. It never contributes to metres or scores.
    g.scenery+=dt*((resting||t<0?.15:.6)+pace);
    world.drive(g.scenery, dt);
    if (pace > 3 && Math.random() < pace * dt * 2) bursts.burst((Math.random() - 0.5) * 14, HORIZON + Math.random() * 2, -1, '#ffffff', 1, 0.5); // the air going past
    // Your best ever, as a line on the track: ahead of you, it is further up the track; behind, it slides off the bottom.
    if (ghost) { const lead = (best * Math.max(0, t)) / LENGTH - total(), s = 1 - Math.max(-0.2, Math.min(0.95, lead / 40)) - 0.05; const at = depth(Math.min(1.1, s)); if (show(ghost, t > 0 && s < 1.1)) { ghost.setLocalPosition(0, at.y, 0.2); ghost.setLocalScale(at.size * (n === 1 ? 1 : 2), at.size, 1); } }
    bursts.update(dt);
    passed(total());
    music.intensity(resting ? 0.2 : 0.35 + Math.min(0.65, pace / 9));
  };
}
