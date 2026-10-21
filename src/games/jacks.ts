// Jack Attack — raise either arm to fire along it; lower it to reload. No jumping required.
import type { Entity } from 'playcanvas';
import { players } from '../pose.ts';
import { spaceRanger } from '../space-ranger.ts';
import { hardness } from '../meta.ts';
import { armShooter, aimedTarget } from '../arm-shot.ts';
import { backdrop, flat, glowAs, glowLook, node, shapes, show, tint } from '../engine.ts';
import { PLAYER_COLORS, bestLine, bursts as makeBursts, hitSound, hitStop, music, round, say, sfx, zoneHalf, zoneX, type Game } from '../kit.ts';

const ROUND = 70, REST = 4, BREACH = 1.0, TOP = 4.0, POOL = 40;
const ROWS = ['#f472b6', '#fb923c', '#fde047', '#4ade80', '#38bdf8'];
type Invader = { on: boolean; zone: number; x: number; y: number; hp: number; row: number; boss: boolean; hurt: number; e: Entity; skin: Entity[] };

export default function jacks({ n, stage, team, best, onEnd, hud, scene }: Game) {
  const hard = hardness(stage);
  backdrop(scene, 'orbit', true);
  const bodies = Array.from({ length: n }, (_, p) => spaceRanger(scene, p, { x: zoneX(n, p), y: -0.35, scale: 0.95 }));
  const round_ = shapes.circle(0.42, 20), eye = shapes.circle(0.1, 10), leg = shapes.quad(0.12, 0.3), white = flat('#ffffff'), ink = flat('#0f0a2a'), skin = flat('#ffffff');
  const invaders: Invader[] = Array.from({ length: POOL }, () => {
    const e = node(scene.root, undefined, undefined, [0, 0, 0.9]), parts = [node(e, round_, skin)], pupil = shapes.circle(0.05, 8);
    for (const s of [-1, 1]) { node(e, eye, white, [s * 0.16, 0.06, 0.02]); node(e, pupil, ink, [s * 0.16, 0.04, 0.03]); parts.push(node(e, leg, skin, [s * 0.22, -0.46, -0.01])); }
    e.enabled = false;
    return { on: false, zone: 0, x: 0, y: 0, hp: 1, row: 0, boss: false, hurt: 0, e, skin: parts };
  });
  const beams = Array.from({ length: 6 }, (_,i) => { const e = node(scene.root, shapes.quad(2, 2), glowLook('#ffffff', 1), [0, 0, 1]); e.name=`arm-shot-beam-${i}`;e.enabled = false; return { e, life: 0 }; });
  const bursts = makeBursts(scene.root), passed = bestLine(hud, best);
  const crews = (team ? [[0, 1].slice(0, n)] : Array.from({ length: n }, (_, p) => [p])).map((who, k) => ({ who, x: team ? 0 : zoneX(n, k), half: team ? 7 : zoneHalf(n) - 0.6, wave: 0, shields: 3, rest: 1.5, score: 0, cleared: 0 }));
  const me = Array.from({ length: n }, () => ({ shoot: armShooter(), reps: 0, hits: 0, last: -9 }));
  const tick = round(hud, ROUND, () => {
    music.stop();
    onEnd(team ? Array.from({ length: n }, () => crews[0].score) : crews.map((c) => c.score), me.map((m, p) => [`${m.reps} arm shots`, m.reps ? `${Math.round((100 * m.hits) / m.reps)}% hit rate` : '', `${crews[team ? 0 : p].cleared} waves cleared`].filter(Boolean)));
  });
  music.start('arcade');

  const spawnWave = (c: (typeof crews)[number], k: number) => {
    const boss = c.wave % 3 === 2, cols = team ? 8 : n === 2 ? 4 : 6, rows = boss ? 2 : Math.min(4, 2 + Math.floor(c.wave / 2));
    const put = (x: number, y: number, row: number, isBoss = false) => { const v = invaders.find((q) => !q.on); if (v) { Object.assign(v, { on: true, zone: k, x, y, row, boss: isBoss, hp: isBoss ? 8 : 1, hurt: 0 }); for (const part of v.skin) tint(part, isBoss ? '#ef4444' : ROWS[row % ROWS.length]); } };
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) put(c.x + ((col + 0.5) / cols - 0.5) * c.half * 1.7, TOP + 0.6 + r * 1.05, r);
    if (boss) { put(c.x, TOP + 3.4, 0, true); hud.banner('Boss wave!', 1500); say('final_round'); } else hud.banner(`Wave ${c.wave + 1}`, 1100);
  };
  const fire = (fromX: number, fromY: number, toX: number, toY: number, v: Invader | undefined, hex: string) => {
    const beam = beams.find((b) => b.life <= 0) ?? beams[0], dx = toX - fromX, dy = toY - fromY, len = Math.hypot(dx, dy);
    beam.life = 0.14; beam.e.enabled = true; glowAs(beam.e,hex);
    beam.e.setLocalPosition(fromX + dx / 2, fromY + dy / 2, 1); beam.e.setLocalEulerAngles(0, 0, Math.atan2(dy, dx) * 57.3); beam.e.setLocalScale(len / 2 + 0.3, 0.32, 1);
    if (!v) return 0;
    if (--v.hp <= 0) { v.on = false; bursts.burst(v.x, v.y, 1, v.boss ? '#ef4444' : ROWS[v.row % ROWS.length], v.boss ? 70 : 16, v.boss ? 13 : 7); if (v.boss) { hitStop(160); hud.shake(1.6); hud.flash('#ef4444'); sfx('impactPlate_heavy'); } return v.boss ? 10 : 1; }
    v.hurt = 0.15; bursts.burst(v.x, v.y, 1, '#ffffff', 8, 5);
    return 0;
  };

  return (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05), t = tick(rawDt);
    if (t === null) return;
    bodies.forEach((b) => b.update());
    crews.forEach((c, k) => {
      const mine = invaders.filter((v) => v.on && v.zone === k);
      if (t >= 0 && !mine.length && (c.rest -= dt) <= 0) { spawnWave(c, k); c.rest = REST; }
      // They come down faster the longer the wave lasts, and faster on later waves.
      const fall = (0.22 + c.wave * 0.035) * hard;
      for (const v of mine) { v.y -= fall * dt * (v.boss ? 0.55 : 1); v.x += Math.sin(t * 1.3 + v.row) * 0.25 * dt; }
      const low = mine.sort((a, b) => a.y - b.y);
      if (low[0] && low[0].y < BREACH) { // one got through
        low[0].on = false; c.shields--; hud.flash('#ef4444'); hud.shake(1); sfx('error', { vol: 0.8 }); hud.pop(low[0].x, BREACH + 0.4, c.shields > 0 ? `Shield down · ${c.shields} left` : 'Overrun!', '#ef4444');
        if (c.shields <= 0) { for (const v of mine) v.on = false; c.shields = 3; c.score = Math.max(0, c.score - 5); c.rest = 2.5; }
      }
      c.who.forEach((p) => {
        const pl = players[p], m = me[p];
        const shots=m.shoot(pl.present?pl.rig:[],t);
        if(t<0 || !pl.present)return;
        for(const shot of shots) {
          m.reps++;
          const at=bodies[p].at, x=at.x+shot.x*at.scale, y=at.y+shot.y*.8*at.scale;
          const length=Math.hypot(shot.dx,shot.dy*.8), dx=shot.dx/length, dy=shot.dy*.8/length;
          const targets=invaders.filter(v=>v.on&&v.zone===k), target=aimedTarget(targets,x,y,dx,dy);
          const distance=target?Math.hypot(target.x-x,target.y-y):12;
          const got=fire(x,y,x+dx*distance,y+dy*distance,target,PLAYER_COLORS[p]);
          const other=c.who.find(q=>q!==p), sync=team&&other!==undefined&&t-me[other].last<.33;
          m.last=t;
          if(target)m.hits++;
          c.score+=got+(sync&&got?2:0);
          hitSound('laser',Math.min(12,m.reps%12),.45);
          if(target&&got)hud.pop(target.x,target.y+.5,sync?`Together! +${got+2}`:`+${got}`,sync?'#fde047':'#ffffff');
          if(targets.length&&!invaders.some(v=>v.on&&v.zone===k)) {c.score+=10;c.cleared++;c.wave++;c.rest=REST;hud.banner('Wave clear · +10 · breathe',1800);sfx('confirmation');say('objective_achieved');}
        }
      });
      c.who.forEach((p) => hud.p('h', p, t < 0 ? 'Raise an arm to fire · lower to reload' : !invaders.some((v) => v.on && v.zone === k) ? `Breathe · next wave in ${Math.max(1, Math.ceil(c.rest))}` : `${'◆'.repeat(c.shields)}${'◇'.repeat(3 - c.shields)} · ${me[p].reps} shots · aim your arm`));
      hud.p('s', team ? 0 : k, players[c.who[0]].present ? String(c.score) : 'Step into view');
    });
    for (const v of invaders) { if (!show(v.e, v.on)) continue; v.hurt = Math.max(0, v.hurt - dt); const s = (v.boss ? 2.6 : 1) * (1 + v.hurt * 2) * (1 + 0.06 * Math.sin(t * 6 + v.x)); v.e.setLocalPosition(v.x, v.y, 0.9); v.e.setLocalScale(s, s, 1); }
    for (const b of beams) if (b.life > 0 && (b.life -= dt) <= 0) b.e.enabled = false;
    bursts.update(dt);
    passed(Math.max(...crews.map((c) => c.score)));
    music.intensity(0.35 + Math.min(0.6, invaders.filter((v) => v.on && v.y < 2.2).length / 6));
  };
}
