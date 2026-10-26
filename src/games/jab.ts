// Jab — punch the pads before they close, duck under the bar. A pad wants the hand on its own side;
// a gold "cross" pad wants the opposite hand, so you twist. Hard punches score extra.
// Pads sit inside each player's own zone, so together-play stays shoulder-wide.
import { sportExperience } from '../sport-experience.ts';
import { isLow, players, sim } from '../pose.ts';
import { hardness } from '../meta.ts';
import { fade, flat, lit, node, shapes, show, tint } from '../engine.ts';
import { bursts as makeBursts, comboText, divider, hands as makeHands, hitSound, hitStop, music, round, scoreHud, sfx, swept, zoneHalf, zoneX, type Game } from '../kit.ts';

const ROUND = 60, PAD_R = 0.9, PAD_LIFE = 1.6, PADS = 6;
const PUNCH_SPEED = 5; // stage units/s a hand must be moving when it lands — tune on device
const BAR_EVERY = 8, BAR_WARN = 1.5, BAR_LIVE = 0.7;

export default function jab({ n, stage, onEnd, hud, scene }: Game) {
  const hard = hardness(stage);
  const experience=sportExperience(scene,n,'jab');
  const padMesh = shapes.circle(PAD_R, 32), ringMesh = shapes.ring(0.94, 1, 48), padLook = lit('#f43f5e', { opacity: 1,emissive:'#55182e',glow:.3 }), ringLook = flat('#fafafa');
  const pads = Array.from({ length: PADS * n }, (_, i) => ({ zone: i % n, x: 0, y: 0, life: 0, pop: 0, hand: 0, cross: false, pad: node(scene.root, padMesh, padLook), back:node(scene.root,shapes.sphere(PAD_R,20),lit('#251b30')),target:node(scene.root,shapes.ring(.27,.34,32),flat('#fff7de')), ring: node(scene.root, ringMesh, ringLook) }));
  const barLook = flat('#fbbf24', { opacity: 1 });
  const bars = Array.from({ length: n }, (_, p) => node(scene.root, shapes.quad(zoneHalf(n) * 1.9, 0.5), barLook, [zoneX(n, p), 2.6, 0.2]));
  for (const e of [...pads.flatMap((p) => [p.pad, p.ring,p.back,p.target]), ...bars]) e.enabled = false;
  divider(scene, n);

  const g = { spawnIn: [0.5, 0.5], side: [1, -1], scores: [0, 0], combo: [0, 0], barAt: BAR_EVERY, ducked: [false, false] };
  const hands = makeHands(scene, n, {cx:p=>zoneX(n,p),hw:zoneHalf(n),hh:4.5,equipment:'boxing'}), bursts = makeBursts(scene.root);
  const said = [{ text: '', until: 0 }, { text: '', until: 0 }];
  if(import.meta.env.DEV||sim){Object.assign(window,{__jab:{g,pads}});scene.cleanup(()=>{delete(window as Window&{__jab?:unknown}).__jab;});}
  const tick = round(hud, ROUND, () => { music.stop(); onEnd(g.scores.slice(0, n)); });
  music.start('boxing');

  return (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05), t = tick(rawDt);
    if (t === null) return;

    if (t >= 0)
      for (let z = 0; z < n; z++) {
        if (!players[z].present || (g.spawnIn[z] -= dt) > 0) continue;
        g.spawnIn[z] = (0.95 - 0.45 * (t / ROUND)) / hard;
        const pad = pads.find((p) => p.zone === z && p.life <= 0 && p.pop <= 0);
        if (!pad) continue;
        g.side[z] = -g.side[z];
        const cross = t > 10 && Math.random() < 0.25, side = g.side[z] < 0 ? 0 : 1;
        Object.assign(pad, { cross, hand: cross ? 1 - side : side, life: (PAD_LIFE * (cross ? 1.3 : 1)) / Math.sqrt(hard), x: zoneX(n, z) + g.side[z] * zoneHalf(n) * (0.3 + Math.random() * 0.35), y: Math.random() * 3.2 - 0.2 });
      }

    hands.update(dt).forEach((h, i) => {
      if (!h.on || h.speed < PUNCH_SPEED) return;
      const pad = pads.find((p) => p.zone === h.p && p.life > 0 && p.hand === (i & 1) && swept(h, p.x, p.y, PAD_R * 1.1, 4)); // a punch travels ~half a pad per frame: test the path, not the point
      if (!pad) return;
      const pow = h.speed > PUNCH_SPEED * 2.2;
      pad.life = 0;
      pad.pop = 0.2;
      g.scores[h.p] += (pad.cross ? 3 : 1) + (pow ? 1 : 0) + Math.floor(++g.combo[h.p] / 5);
      hitSound(pow ? 'impactPunch_heavy' : 'impactPunch_medium', g.combo[h.p], pow ? 1 : 0.7);
      if (pow) { hud.shake(0.5); hitStop(70); }
      bursts.burst(pad.x, pad.y, 0.5, pad.cross ? '#fde047' : '#f43f5e', pow ? 28 : 12, pow ? 10 : 6);
      experience.react(h.p,g.combo[h.p]%4===0?'COMBINATION COMPLETE!':pad.cross?'CLEAN CROSS!':pow?'POWER PUNCH!':'NICE HIT!',t,true);
      if (pow) said[h.p] = { text: 'Pow!', until: t + 0.6 };
    });

    // The bar: warn, go live, and anyone who crouched at any moment while it was live is safe.
    const barIn = g.barAt - t, live = barIn <= 0 && barIn > -BAR_LIVE;
    for (let p = 0; p < n; p++) {
      if (live && isLow(players[p])) g.ducked[p] = true;
      const cross = pads.some((pad) => pad.zone === p && pad.life > 0 && pad.cross);
      hud.p('h', p, barIn < BAR_WARN && barIn > -BAR_LIVE ? 'Duck!' : said[p].until > t ? said[p].text : cross ? 'Cross!' : comboText(g.combo[p]));
      if (show(bars[p], barIn < BAR_WARN && barIn > -BAR_LIVE)) fade(bars[p], live ? 1 : 0.35);
    }
    if (barIn <= -BAR_LIVE) {
      for (let p = 0; p < n; p++) {
        if (!players[p].present) continue;
        if (g.ducked[p]) { g.scores[p] += 3; sfx('phaseJump', { vol: 0.5 }); } else { g.scores[p] = Math.max(0, g.scores[p] - 2); g.combo[p] = 0; sfx('impactMetal_heavy'); hud.flash('#fbbf24'); hud.shake(); }
      }
      g.ducked = [false, false];
      g.barAt = t + BAR_EVERY;
    }

    for (const pad of pads) {
      if (pad.life > 0 && (pad.life -= dt) <= 0) g.combo[pad.zone] = 0; // closed unpunched
      if (pad.pop > 0) pad.pop -= dt;
      if (show(pad.ring, pad.life > 0)) {
        const k = PAD_R * (1 + (2 * pad.life) / PAD_LIFE); // closes onto the pad as time runs out
        pad.ring.setLocalPosition(pad.x, pad.y, 0.1);
        pad.ring.setLocalScale(k, k, 1);
      }
      const visible=pad.life>0||pad.pop>0;show(pad.back,visible);show(pad.target,visible);
      if (!show(pad.pad, visible)) continue;
      const k = pad.pop > 0 ? 1 + (0.2 - pad.pop) * 4 : 1;
      pad.pad.setLocalPosition(pad.x, pad.y, .2);
      pad.back.setLocalPosition(pad.x,pad.y,-.05);pad.back.setLocalScale(k,k,pad.pop>0?.12:.22);
      pad.target.setLocalPosition(pad.x,pad.y,.23);pad.target.setLocalScale(k,k,1);
      pad.pad.setLocalScale(k, k, 1);
      fade(pad.pad, pad.pop > 0 ? pad.pop * 5 : 0.85);
      tint(pad.pad, pad.cross ? '#fde047' : pad.zone ? '#34d399' : '#f43f5e');
    }
    experience.update(t,g.combo,players.slice(0,n).map(p=>p.present),Array.from({length:n},()=>barIn<BAR_WARN&&barIn>-BAR_LIVE?'DUCK THE BAR':'HIT THE PADS'),Array.from({length:n},()=> 'Gold pads want the opposite hand'));
    bursts.update(dt);
    music.intensity(0.3 + Math.max(g.combo[0], g.combo[1]) / 14);
    scoreHud(hud, n, g.scores);
  };
}
