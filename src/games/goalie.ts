// Goalie — real ballistics (Rapier). Shots are rigid bodies fired on an arc at a spot in your goal; your gloves are
// kinematic colliders, so a save is a real deflection — swat it and it flies, just get there and it drops.
// A shot that crosses the line is a goal. Hands are body-relative across your own goal: together-play is compact.
import { footballMaterial } from '../football.ts';
import { hardness } from '../meta.ts';
import { players, sim } from '../pose.ts';
import { effects, pace } from '../pace.ts';
import { sportExperience } from '../sport-experience.ts';
import { keeperCue, saveAward } from '../sport-rules.ts';
import { physics } from '../physics.ts';
import { fade, flat, lit, node, shapes, show, tint, type View } from '../engine.ts';
import { PLAYER_COLORS, bursts as makeBursts, comboText, hands as makeHands, hitSound, music, round, scoreHud, sfx, type Game } from '../kit.ts';

const ROUND = 60, FAR = -32, GRAV = 9.8, BALL_R = 0.5, GLOVE_R = 0.85, PER_ZONE = 5, FLOOR = -3.2;

type Shot = { state: 'off' | 'windup' | 'in' | 'saved' | 'goal'; x0:number; contactUntil:number; zone: number; tx: number; ty: number; left: number; dur: number; gold: boolean; age: number };

export const view: View = { position: [0, 0.4, 9.5], fov: 50, near: 0.1, far: 120 };

export default async function goalie({ n, stage, onEnd, hud, scene, cleanup }: Game) {
  const hard = hardness(stage);
  const { RAPIER, world, step } = await physics(-GRAV);
  cleanup(() => world.free());
  scene.fog('#123343', 23, 65);
  const experience=sportExperience(scene,n,'goalie');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const goal = { cx: (p: number) => (n === 1 ? 0 : (p - 0.5) * 6.8), hw: n === 1 ? 5.6 : 3, hh: 3, cy: 0.2 };
  const shots: Shot[] = Array.from({ length: PER_ZONE * n }, (_, i) => ({ state: 'off', x0:0, contactUntil:0, zone: i % n, tx: 0, ty: 0, left: 0, dur: 1, gold: false, age: 0 }));

  // The pitch, and a frame for each goal: what you see, and the same boxes again for the ball to hit.
  node(scene.root, shapes.floor(44, 60), lit('#166534'), [0, FLOOR, -20]);
  const fixed = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  world.createCollider(RAPIER.ColliderDesc.cuboid(30, 0.5, 40).setTranslation(0, FLOOR - 0.5, -20).setRestitution(0.6).setFriction(0.8), fixed);
  const unit = shapes.box(1, 1, 1), postLook = lit('#e4e4e7', { emissive: '#e4e4e7', glow: 0.25 });
  for (let p = 0; p < n; p++) {
    for (const side of [-1, 1]) world.createCollider(RAPIER.ColliderDesc.cuboid(0.15, goal.hh + 0.3, 0.15).setTranslation(goal.cx(p) + side * (goal.hw + 0.3), goal.cy, 0).setRestitution(0.5), fixed);
    world.createCollider(RAPIER.ColliderDesc.cuboid(goal.hw + 0.4, 0.15, 0.15).setTranslation(goal.cx(p), goal.cy + goal.hh + 0.4, 0).setRestitution(0.5), fixed);
    for (const [x, y, w, h] of [[-goal.hw - 0.3, goal.cy, 0.3, goal.hh * 2 + 0.6], [goal.hw + 0.3, goal.cy, 0.3, goal.hh * 2 + 0.6], [0, goal.cy + goal.hh + 0.4, goal.hw * 2 + 0.9, 0.3]])
      node(scene.root, unit, postLook, [goal.cx(p) + x, y, 0]).setLocalScale(w, h, 0.3);
  }

  // Stadium seats and goal net read as football even before the first shot.
  const seatLook=lit('#2563a3'), seatMesh=shapes.box(3.6,.4,1.2), netLook=flat('#c8efff',{opacity:.3});
  for(const side of [-1,1]) for(let row=0;row<4;row++) for(let col=0;col<5;col++) node(scene.root,seatMesh,seatLook,[side*(10+row*.7),FLOOR+row*.55,-7-col*4]);
  for(let p=0;p<n;p++) {
    for(let k=0;k<=12;k++) node(scene.root,shapes.quad(.025,goal.hh*2),netLook,[goal.cx(p)-goal.hw+2*goal.hw*k/12,goal.cy,-1]);
    for(let k=0;k<=7;k++) node(scene.root,shapes.quad(goal.hw*2,.025),netLook,[goal.cx(p),goal.cy-goal.hh+2*goal.hh*k/7,-1]);
  }
  // Stadium light strips, moving crowd cards and one readable striker per keeper lane.
  const boardLook=flat('#63dfff',{fog:false}),crowdLook=flat('#d8f46b',{opacity:.8,fog:false});
  const crowds=Array.from({length:24},(_,i)=>node(scene.root,shapes.quad(.5,.65),crowdLook,[(i<12?-1:1)*(10+(i%3)*.55),-1+(i%3)*.5,-6-(i%12)*1.7]));
  for(const side of [-1,1])node(scene.root,shapes.box(.12,.15,30),boardLook,[side*9,FLOOR+.6,-16]);
  const strikerLook=lit('#152c4f',{emissive:'#214a82',glow:.3}),skin=lit('#c98265'),shoeLook=lit('#f0ff91');
  const strikers=Array.from({length:n},()=>{
    const actor=node(scene.root),torso=node(actor,shapes.box(.85,1.1,.4),strikerLook,[0,1.6,0]);
    node(actor,shapes.sphere(.36,12),skin,[0,2.48,0]);
    node(actor,shapes.box(.85,.12,.44),boardLook,[0,1.7,.03]);
    for(const side of [-1,1])node(actor,shapes.capsule(.12,.9),skin,[side*.58,1.57,0]).setLocalEulerAngles(0,0,side*16);
    const leg=node(actor,shapes.capsule(.17,1),strikerLook,[.25,.55,0]);
    node(actor,shapes.capsule(.17,1),strikerLook,[-.25,.55,0]);
    const boot=node(actor,shapes.box(.34,.22,.65),shoeLook,[.25,.12,.16]);
    actor.setLocalPosition(0,FLOOR,FAR);return {actor,torso,leg,boot,kick:0};
  });
  const ballMesh = shapes.sphere(BALL_R, 16), ballLook = footballMaterial(), ringMesh = shapes.ring(0.9, 1, 40), ringLook = flat('#fafafa', { opacity: 1 });
  const balls = shots.map((_, i) => {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, -30 - i, 0).setCcdEnabled(true).setLinearDamping(0.05));
    const collider=world.createCollider(RAPIER.ColliderDesc.ball(BALL_R).setRestitution(0.75).setFriction(0.4).setDensity(0.6), body);
    body.setEnabled(false);
    const mesh = node(scene.root, ballMesh, ballLook), ring = node(scene.root, ringMesh, ringLook);
    mesh.name=`goalie-ball-${i}`;
    mesh.enabled = ring.enabled = false;
    return { body, mesh, ring, collider };
  });
  const gloves = Array.from({ length: n * 2 }, () => {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -40, 0.2));
    const collider=world.createCollider(RAPIER.ColliderDesc.ball(GLOVE_R).setRestitution(0.4), body);
    return {body,collider};
  });

  const g = { spawnIn: [1, 1.5], scores: [0, 0], combo: [0, 0] };
  const hands = makeHands(scene, n, { ...goal, equipment:'keeper' }), bursts = makeBursts(scene.root);
  if (import.meta.env.DEV || sim) { const debug={shots,goal,g,balls};Object.assign(window,{__goalie:debug});cleanup(()=>{if((window as unknown as {__goalie:unknown}).__goalie===debug)delete (window as unknown as {__goalie?:unknown}).__goalie;}); } // test hook: lets a headless run aim the glove at the ring
  const tick = round(hud, ROUND, () => { music.stop(); onEnd(g.scores.slice(0, n)); });
  music.start('stadium');

  return (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05), t = tick(rawDt);
    if (t === null) return;
    const ease = Math.max(0, t) / ROUND;

    const handState=hands.update(dt);
    handState.forEach((h, i) => {
      // A keeper's hands close on the ball by themselves in the last instant. So does the glove: if it is already near
      // where a shot is about to land, it is drawn onto the spot — which also swallows the tracker's last few cm of noise.
      let x = h.x, y = h.y;
      for (const s of shots) {
        const d = Math.hypot(s.tx - x, s.ty - y);
        if (s.state !== 'in' || s.zone !== h.p || s.left > 0.45 || d > GLOVE_R * 2) continue;
        const pull = 0.65 * (1 - s.left / 0.45);
        x += (s.tx - x) * pull; y += (s.ty - y) * pull;
      }
      hands.placeEquipment(i,x,y,.2);
      gloves[i].body.setNextKinematicTranslation({ x: h.on ? x : 0, y: h.on ? y : -40, z: 0.2 });
    });

    if (t >= 0)
      for (let z = 0; z < n; z++) {
        if (!players[z].present || (g.spawnIn[z] -= dt) > 0) continue;
        g.spawnIn[z] = (1.8 - 0.8 * ease + Math.random() * 0.3) / Math.sqrt(hard);
        const i = shots.findIndex((s) => s.zone === z && s.state === 'off');
        if (i < 0) continue;
        const s = shots[i], x0 = goal.cx(z) + (Math.random() * 2 - 1) * 7;
        Object.assign(s, { state: 'windup', x0, contactUntil:-1, gold: Math.random() < 0.15, age: 0, tx: goal.cx(z) + (Math.random() * 2 - 1) * goal.hw * 0.82, ty: goal.cy + (Math.random() * 2 - 1) * goal.hh * 0.8 });
        s.dur = s.left = (s.gold ? 1.25 : 1.7 - 0.5 * ease) / Math.sqrt(hard);
        s.left=.6;
        strikers[z].actor.setLocalPosition(x0,FLOOR,FAR);
      }
    shots.forEach((s,i)=>{
      if(s.state!=='windup')return;
      s.left-=dt;
      if(s.left>0)return;
      const {body}=balls[i],x0=s.x0,y0=FLOOR+BALL_R;
      s.state='in';s.left=s.dur;strikers[s.zone].kick=.5;
        // Solve the launch velocity that lands the ball on (tx, ty, 0) after `dur` seconds under gravity.
        body.setEnabled(true);
        body.setTranslation({ x: x0, y: y0, z: FAR }, true);
        body.setLinvel({ x: (s.tx - x0) / s.dur, y: (s.ty - y0) / s.dur + 0.5 * GRAV * s.dur, z: -FAR / s.dur }, true);
        body.setAngvel({ x: -8, y: 0, z: Math.random() * 6 - 3 }, true);
        sfx('impactPunch_medium', { vol: 0.35, rate: 0.7 }); // the kick, far away
    });
    step(dt);
    strikers.forEach((actor,p)=>{actor.kick=Math.max(0,actor.kick-dt);const windup=shots.some(s=>s.zone===p&&s.state==='windup');const angle=windup?-28:actor.kick>0?Math.sin(actor.kick/.5*Math.PI)*65:0;actor.leg.setLocalEulerAngles(angle,0,0);actor.boot.setLocalPosition(.25,.12+Math.abs(Math.sin(angle*Math.PI/180))*.4,.16-Math.sin(angle*Math.PI/180)*.8);actor.torso.setLocalEulerAngles(windup?8:-angle*.08,0,0);});
    if(effects.on&&!pace.lean&&!reduced)crowds.forEach((e,i)=>e.setLocalPosition((i<12?-1:1)*(10+(i%3)*.55),-1+(i%3)*.5+Math.sin(t*5+i)*(.06+Math.min(.2,Math.max(...g.combo)*.025)),-6-(i%12)*1.7));

    shots.forEach((s, i) => {
      const { body, mesh, ring } = balls[i];
      if (s.state === 'off' && body.isEnabled()) body.setEnabled(false); // parked bodies must not fall forever
      if (s.state !== 'off'&&s.state!=='windup') {
        const pos = body.translation(), vel = body.linvel(), p = s.zone;
        s.left -= dt; s.age += dt;
        if(s.state==='in'&&players[p].present)for(let k=p*2;k<p*2+2;k++){if(!handState[k].on)continue;world.contactPair(balls[i].collider,gloves[k].collider,manifold=>{if(manifold.numContacts()>0)s.contactUntil=t+.2;});}
        if (s.state === 'in' && pos.z > 1.4) { // over the line
          s.state = 'goal'; g.combo[p] = 0;
          experience.react(p,'NEXT SAVE IS YOURS',t,false);
          sfx('error', { vol: 0.7 }); hud.flash('#ef4444'); hud.shake(0.7);
        } else if (s.state === 'in' && pos.z > -6 && vel.z < 1) { // turned back, or killed dead, this side of the box
          s.state = 'saved';
          const earned=saveAward({present:players[p].present,contact:s.contactUntil>=t,gold:s.gold,combo:g.combo[p]});
          if(earned>0){g.scores[p]+=earned;g.combo[p]++;experience.react(p,s.gold?'GOLDEN SAVE!':g.combo[p]%5===0?'WALL MODE · 5 SAVES':'WHAT A SAVE!',t,true);hud.pop(pos.x,pos.y,`+${earned}`,s.gold?'#fde047':'#a6f5ff',pos.z);}
          if(earned>0)hitSound('impactPunch_heavy', g.combo[p]);
          if(earned>0&&effects.on)bursts.burst(pos.x, pos.y, pos.z + 0.5, s.gold ? '#fde047' : PLAYER_COLORS[p], s.gold ? 30 : 16, 8);
        }
        if (s.age > s.dur + 2.2 || pos.y < -12) { s.state = 'off'; body.setEnabled(false); }
        const r = body.rotation();
        mesh.setLocalPosition(pos.x, pos.y, pos.z);
        mesh.setLocalRotation(r.x, r.y, r.z, r.w);
      }
      if (show(mesh, s.state !== 'off'&&s.state!=='windup')) { tint(mesh, s.gold ? '#fde047' : '#fafafa', 'diffuse'); tint(mesh, s.gold ? '#a16207' : '#000000', 'emissive'); }
      if (!show(ring, s.state === 'in'||s.state==='windup')) return;
      const k = GLOVE_R * (1 + 2.2 * Math.max(0, (s.state==='windup'?1:s.left / s.dur))); // closes to glove size as the ball arrives
      ring.setLocalPosition(s.tx, s.ty, 0);
      ring.setLocalScale(k, k, 1);
      fade(ring, 0.25 + 0.75 * (1 - Math.max(0, (s.state==='windup'?1:s.left / s.dur))));
      tint(ring, s.gold ? '#fde047' : '#fafafa');
    });
    experience.update(t,g.combo,players.slice(0,n).map(p=>p.present),Array.from({length:n},(_,p)=>{const s=shots.find(s=>s.zone===p&&(s.state==='windup'||s.state==='in'));return s?keeperCue(s.state as 'windup'|'in',s.gold):'OWN YOUR GOAL';}),Array.from({length:n},(_,p)=>g.combo[p]?`${g.combo[p]} ${g.combo[p]===1?'save':'saves'} in a row · Gold balls earn more`:'Move your gloves to the shrinking ring'));
    bursts.update(dt);
    music.intensity(0.3 + Math.max(g.combo[0], g.combo[1]) / 12);
    scoreHud(hud, n, g.scores);
    for (let p = 0; p < n; p++) hud.p('h', p, comboText(g.combo[p]));
  };
}
