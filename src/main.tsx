import {goalieSettings,keeperVariant,keeperFromVariant,keeperDifficulty} from './goalie-settings.ts';
// Shell: start → home → briefing (stage, goals) → play → results (stars, XP, badges) → stats / badges.
// Driven by hand, touch or keyboard. A tap or click during a game pauses it and offers the way home.
import './moon.css';
import {HandCursor,menuSelectionView} from './hand-cursor.tsx';
import { PlayerPicker } from './player-picker.tsx';
import { crewOf } from './moon-profile.ts';
import { MOON_GAME_IDS, MOON_CATALOG, moonArt, moonBuddy } from './moon-catalog.ts';
import {JabOptions} from './jab-options.tsx';
import {GoalieOptions} from './goalie-options.tsx';
import { PartyOptions } from './party-options.tsx';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { assessPose, readiness, stablePose, standingPose, supportedView, trackingGate } from './calibration.ts';
import { CameraView, PlayerSetup, samplePlayer, type PlayerView } from './setup.tsx';
import { createRoot } from 'react-dom/client';
import { cutout, grip, measureDelay, perf, players, record, setPlayers, sim, startPose, track, tuning } from './pose.ts';
import { report } from './report.ts';
import { DAY_GOAL, load, save, summary, type Session } from './stats.ts';
import { BADGES, CHALLENGE_XP, STAGES, badgeCatalog, badgesOf, bestScore, bestStars, dailyChallenges, levelOf, sessionXp, starGoals, starsFor, totalStars, unlockedStage, variantOf, xpOf } from './meta.ts';
import { loadAudio, setAudioPaused } from './audio.ts';
import { PLAYER_COLORS, Shell, effects, jingle, paceSummary, play, say, sfx, type Playable } from './stage.tsx';
// Each game is its own chunk: its code (and, for two of them, the physics engine) is fetched the first time it is played.
const Slice = play(() => import('./games/slice.ts')), Run = play(() => import('./games/run.ts')), Jab = play(() => import('./games/jab.ts')), Beat = play(() => import('./games/beat.ts'));
const ShapeUp = play(() => import('./games/shapeup.ts')), Goalie = play(() => import('./games/goalie.ts')), Smash = play(() => import('./games/smash.ts'));
const Sprint = play(() => import('./games/sprint.ts')), Forge = play(() => import('./games/forge.ts')), Jacks = play(() => import('./games/jacks.ts')), Lumber = play(() => import('./games/lumber.ts'));
const Pulse = play(() => import('./games/pulse.ts'));
const Leaks = play(() => import('./games/leaks.ts')), Keepy = play(() => import('./games/keepy.ts'));
const Rocket = play(() => import('./games/rocket.ts')), Freeze = play(() => import('./games/freeze.ts')), Wipe = play(() => import('./games/wipe.ts'));

type GameMode = { id: string; name: string; blurb: string }; // id '' is the standard mode
// `team`: the game knows how to be played by two as one team (a shared score); otherwise two players are always rivals.
type Game = { id: string; name: string; icon: string; tone: [string, string]; blurb: string; how: string; maxPlayers: 1 | 2; Play: Playable; modes?: GameMode[]; team?: boolean; crew?: boolean }; // crew: two players are ALWAYS one team (there is no versus)
// The library. A new game = one component + one row here (+ its star goals in meta.ts). maxPlayers 2 only for
// compact-footprint games (PLAN §3); a wide game is still playable by two through "Take turns".
const LEGACY_GAMES: Game[] = [
  { id: 'pulse', name: 'Pulse', icon: '🎧', tone: ['#22d3ee', '#c026d3'], blurb: 'Hit the music. A neon tunnel, three songs.', how: 'Notes fly down the tunnel onto two rings: cyan is your left hand, pink your right. You never aim. An arrow means swing that hand that way as it lands. A plain orb means swing it any way. A gold diamond means clap. A note with a tail means throw that arm up and hold it. In the break, duck the bar and lean away from the wall.', maxPlayers: 2, Play: Pulse, team: true,
    modes: [{ id: '', name: 'Neon Drive', blurb: '112 bpm · the one to learn on' }, { id: 'afterglow', name: 'Afterglow', blurb: '124 bpm · quick doubles' }, { id: 'hyperline', name: 'Hyperline', blurb: '138 bpm · fast and relentless' }] },
  { id: 'run', name: 'Run', icon: '🏃', tone: ['#ff8a3d', '#ff3d6e'], blurb: 'Endless runner. Lean, jump, duck.', how: 'Lean left or right to change lane. Jump the barrels and duck the beams. Never run into a crate stack. Grab coins and power-ups in the lanes.', maxPlayers: 2, Play: Run },
  { id: 'slice', name: 'Slice', icon: '🍉', tone: ['#3ddc84', '#0e9aa7'], blurb: 'Cut the fruit, dodge the bombs.', how: 'Swipe fast through the fruit. One swing through three or more pays extra, and so does a really hard cut. Glowing bananas are power-ups. Never touch a bomb.', maxPlayers: 2, Play: Slice, team: true,
    modes: [{ id: '', name: 'Arcade', blurb: '60 seconds, power-ups, bombs cost points' }, { id: 'classic', name: 'Classic', blurb: 'Three lives. Drop a fruit or hit a bomb and lose one' }, { id: 'zen', name: 'Zen', blurb: '90 calm seconds, no bombs. A good cool-down' }] },
  { id: 'keepy', name: 'Keepy-Uppy', icon: '🎈', tone: ['#f472b6', '#7c3aed'], blurb: 'Keep the balloon off the floor.', how: 'Keep the balloons and beach balls airborne with anything. Headers, knees and kicks pay more than hands. Do not use the same part twice running. Together, pass it across the line: every crossing is a rally point.', maxPlayers: 2, Play: Keepy, team: true, crew: true,
    modes: [{ id: '', name: 'Arcade', blurb: '60 seconds, more balloons, wind, and a storm to pop at the end' }, { id: 'classic', name: 'Classic', blurb: 'Three lives. Every balloon that lands costs one' }] },
  { id: 'leaks', name: 'Leaks', icon: '💦', tone: ['#22d3ee', '#1d4ed8'], blurb: 'Plug the cracks with your whole body.', how: 'Cover a crack with a hand, a foot, a knee or your head. Hold it until the ring closes. Several open at once, so spread out. Do not let the water reach the top.', maxPlayers: 2, Play: Leaks, team: true, crew: true },
  { id: 'sprint', name: 'Sprint', icon: '⚡', tone: ['#fb923c', '#be123c'], blurb: 'A scenic race. Chase stars. Go turbo.', how: 'Race for 45 seconds. Jog on the spot or pump your arms to accelerate. Collect stars, pass checkpoints and build a turbo boost. Keep moving to earn distance; the runner’s warm-up animation earns no points. Race solo, as a team or side by side.', maxPlayers: 2, Play: Sprint, team: true },
  { id: 'jacks', name: 'Jack Attack', icon: '👾', tone: ['#4ade80', '#0e7490'], blurb: 'Raise your arms. Aim. Fire.', how: 'Raise either hand to fire along that arm. Lower it to reload, then raise again. Point left or right to aim. No jumping needed. Clear the invaders and breathe between waves.', maxPlayers: 2, Play: Jacks, team: true },
  { id: 'forge', name: 'Forge', icon: '🔨', tone: ['#f59e0b', '#7f1d1d'], blurb: 'Hold the squat. Strike when it glows.', how: 'Sink into a squat and hold it to heat the blade. Deeper heats faster. When it glows white, drive up hard to strike. Rest while it is quenched. Every blade wants a longer hold.', maxPlayers: 2, Play: Forge, team: true },
  { id: 'lumber', name: 'Lumberjack', icon: '🪓', tone: ['#65a30d', '#713f12'], blurb: 'Chop along the stripe.', how: 'Wind up high on one side and chop down across your body to the other, along the stripe on the log. Chop hard for a clean split. The stripe changes sides. Thick logs take two.', maxPlayers: 2, Play: Lumber, team: true },
  { id: 'smash', name: 'Smash', icon: '🤖', tone: ['#fbbf24', '#c2570c'], blurb: 'Demolish the robot. Expose its core.', how: 'Punch the armour plates. The yellow ring marks a weak spot that takes extra damage. Break all six plates, then strike the glowing core. Slow your hand between punches to reload. Each demolished robot brings a tougher one.', maxPlayers: 2, Play: Smash },
  { id: 'goalie', name: 'Goalie', icon: '🧤', tone: ['#38bdf8', '#2f55e0'], blurb: 'Get a hand to every shot.', how: 'The ring shows where the shot will land. Get a glove there in time. Swat it and it flies. Gold balls are worth 3. Each stage brings a new shot pattern.', maxPlayers: 2, Play: Goalie },
  { id: 'jab', name: 'Jab', icon: '🥊', tone: ['#ff5a76', '#a3154a'], blurb: 'Punch the pads, duck the bar.', how: 'Punch each pad with the hand on its side. Gold pads want the opposite hand. Punch hard for extra. Squat when the bar comes.', maxPlayers: 2, Play: Jab },
  { id: 'beat', name: 'Beat', icon: '🎵', tone: ['#c084fc', '#6d28d9'], blurb: 'Hit the moves on the beat.', how: 'Hold the move as its shape reaches the line. Left hand up, right hand up, both up, squat, or jump. On the beat is Perfect.', maxPlayers: 2, Play: Beat },
  { id: 'rocket', name: 'Rocket', icon: '🚀', tone: ['#818cf8', '#3b2fb0'], blurb: 'Every squat is a burn.', how: 'Squat to fire the engine. Deeper squats burn harder. Stop and gravity wins. Highest altitude is your score.', maxPlayers: 2, Play: Rocket },
  { id: 'freeze', name: 'Freeze', icon: '🧊', tone: ['#67e8f9', '#0f7f9c'], blurb: 'Dance, then hold dead still.', how: 'Dance under the disco ball while the music and lights move. When they stop, freeze. Any wobble costs points. Hold still to earn a bonus and a party celebration when the music returns.', maxPlayers: 2, Play: Freeze },
  { id: 'wipe', name: 'Wipe', icon: '🧽', tone: ['#fde047', '#d97706'], blurb: 'Scrub the screen clean.', how: 'Sweep both hands across the grime. It creeps back, so keep moving. Clear your whole side for a bonus and a tougher layer.', maxPlayers: 2, Play: Wipe },
  { id: 'shapeup', name: 'Shape Up', icon: '🤸', tone: ['#fb7185', '#b0186a'], blurb: 'Eight poses. Collect stars. Build a combo.', how: 'Watch yourself live and copy the pose reference. Hold a good match briefly to lock it. Earn up to three stars per pose and chain matches for combo rewards. Relax during the reset countdown, then try the next pose. Play solo, take turns or compete side by side.', maxPlayers: 2, Play: ShapeUp },
];
const GAMES = MOON_GAME_IDS.map(id => LEGACY_GAMES.find(g => g.id === id)!);
const NAMES = Object.fromEntries(GAMES.map((g) => [g.id, g.name]));
const BADGE_ICON: Record<string, string> = { first: '👟', explorer: '🧭', century: '💯', double: '🔥', streak3: '📅', streak7: '🗓️', streak30: '⚡', stars10: '⭐', stars40: '🌟', stars100: '🌌', flawless: '💎', summit: '🏔️', five: '🖐️', level5: '💪', level10: '🏅', early: '🌅', squats: '🦵', runner: '🏁' };

const MODES = { solo: 'Solo', together: 'Together', turns: 'Take turns' } as const;
type Mode = keyof typeof MODES;
type Reward = { stars: number; xp: number; newBest: boolean; levelUp: number; badges: string[]; challenges: string[] };
type Round = { game: Game; stage: number; mode: string; turn: number; scores: number[]; points: number[]; rewards: Reward[]; notes: string[][] };
type Screen = { at: 'start' | 'home' | 'stats' | 'badges' | 'tracking' } | { at: 'brief'; game: Game; stage: number; mode: string } | ({ at: 'setup' | 'play' | 'next' | 'results' } & Round);

const vars = (v: Record<string, string | number>) => v as CSSProperties; // CSS custom properties for inline style
const toneOf = (g: Game) => vars({ '--a': g.tone[0], '--b': g.tone[1] });
const Stars = ({ n, of = 3 }: { n: number; of?: number }) => <span className="stars">{'★'.repeat(n)}<i>{'★'.repeat(of - n)}</i></span>;
const Logo = ({ huge = false }) => <span className={huge ? 'logo huge' : 'logo'}>{[...'MOON'].map((ch, i) => <span key={i} style={vars({ '--i': i })}>{ch}</span>)}</span>;

// Drifting neon blobs and rising shapes behind every menu. Fixed random layout, pure CSS motion.
const BITS = Array.from({ length: 14 }, (_, i) => vars({
  '--x': `${(i * 37) % 100}%`, '--s': `${1.2 + ((i * 7) % 5) * 0.5}rem`, '--r': i % 3 ? '0.4rem' : '50%', '--d': `${14 + (i % 5) * 4}s`, '--w': `${-i * 2.3}s`,
  '--c': ['var(--pink)', 'var(--cyan)', 'var(--yellow)', 'var(--lime)'][i % 4],
}));
const Backdrop = ({ ingame }: { ingame: boolean }) => (
  <div className={ingame ? 'backdrop ingame' : 'backdrop'}>
    <div className="blob a" /><div className="blob b" /><div className="blob c" />
    {!ingame && BITS.map((style, i) => <div key={i} className="bit" style={style} />)}
  </div>
);

// Avatar whose ring is the XP bar: it fills toward the next level.
function Player({ sessions, who, tone }: { sessions: Session[]; who: string; tone: string }) {
  const lv = levelOf(xpOf(sessions, who)), s = summary(sessions, who);
  return (
    <span className="player">
      <span className="avatar" style={vars({ '--pct': (100 * lv.into) / lv.span, '--tone': tone })}>{who[0]?.toUpperCase()}<small>Lv {lv.level}</small></span>
      <span className="who">
        <b>{who}</b>
        <span className="dim num">{lv.title} · {lv.span - lv.into} XP to level {lv.level + 1}</span>
        <span className="dim num"><span className="flame">🔥 {s.streak}</span> day streak · {s.today} / {DAY_GOAL} today</span>
      </span>
    </span>
  );
}

// What the tracker actually sees: shoulders, hips and both palms drawn over the live picture, each palm with a
// short trail — hold a hand still and the size of the scribble IS the tracking noise.
function TrackingView() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    grip.want = true; // this screen shows what the hand model reads, so it has to be running here too
    const trails: number[][][] = [[], [], [], []];
    let raf = requestAnimationFrame(function draw() {
      raf = requestAnimationFrame(draw);
      const c = canvas.current!, video = document.querySelector('video')!, g = c.getContext('2d')!;
      c.width = innerWidth; c.height = innerHeight;
      // The picture is shown with object-fit: cover, so frame coordinates map through the same crop.
      const k = Math.max(c.width / (video.videoWidth || 1), c.height / (video.videoHeight || 1));
      const at = ([x, y]: number[]) => [(x - 0.5) * video.videoWidth * k + c.width / 2, (y - 0.5) * video.videoHeight * k + c.height / 2];
      grip.hand = 1; // Menu selection and the diagnostic hand model both use the right hand.
      players.forEach((pl, i) => {
        if (!pl.present || !pl.body.length) return void (trails[i * 2].length = trails[i * 2 + 1].length = 0);
        const [ls, rs, lh, rh, lp, rp] = [pl.body[11], pl.body[12], pl.body[23], pl.body[24], ...pl.palms].map(at);
        g.strokeStyle = g.fillStyle = PLAYER_COLORS[i]; g.lineWidth = 5; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(ls[0], ls[1]); g.lineTo(rs[0], rs[1]); g.lineTo(rh[0], rh[1]); g.lineTo(lh[0], lh[1]); g.closePath(); g.stroke();
        [lp, rp].forEach((palm, h) => {
          const trail = trails[i * 2 + h];
          if (!pl.hands[h].seen) return void (trail.length = 0);
          trail.push(palm); if (trail.length > 45) trail.shift();
          g.lineWidth = 3; g.strokeStyle = '#ffe14d'; g.beginPath(); trail.forEach(([x, y], n) => (n ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
          g.fillStyle = '#ffe14d'; g.beginPath(); g.arc(palm[0], palm[1], 14, 0, 7); g.fill();
        });
      });
    });
    return () => { cancelAnimationFrame(raf); grip.want = false; };
  }, []);
  return <canvas ref={canvas} style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }} />;
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const k = Math.max(0, Math.min(1, (now - t0) / 900));
      setV(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}</>;
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 80 }, (_, i) => vars({
    '--x': `${Math.random() * 100}%`, '--d': `${2.2 + Math.random() * 2}s`, '--w': `${Math.random() * 1.2}s`, '--sway': `${(Math.random() - 0.5) * 30}vw`, '--spin': `${(Math.random() - 0.5) * 1800}deg`,
    '--c': ['var(--pink)', 'var(--cyan)', 'var(--yellow)', 'var(--lime)', 'var(--orange)', 'var(--violet)'][i % 6],
  })), []);
  return <div className="confetti">{bits.map((style, i) => <i key={i} style={style} />)}</div>;
}

// A quiet live preview on briefings: the player, rather than a proxy mannequin.
function Presence({ small }: { small: boolean }) {
  return <div className={small ? 'presence small moon-presence' : 'presence moon-presence'}><CameraView game="slice" n={2} compact /><span>YOU / LIVE</span></div>;
}

function Fps() {
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((v) => v + 1), 1000); return () => clearInterval(id); }, []);
  return <>tracker {perf.delegate} · {perf.fps.toFixed(0)} fps · {track.lag.toFixed(0)} ms</>;
}
function TrackerDetail() {
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((v) => v + 1), 500); return () => clearInterval(id); }, []);
  const blind = performance.now() - grip.seenAt > 1500;
  return <>camera {track.camFps.toFixed(0)} fps · frames {track.frames === 'direct' ? 'direct' : `copied ${track.grabMs.toFixed(0)} ms`} · model {track.modelMs.toFixed(0)} ms{track.fps2 > 0.5 ? ` · player two's tracker (${track.partner}) ${track.fps2.toFixed(0)} fps, ${track.model2.toFixed(0)} ms` : ''} · hand: {blind ? 'not found' : `${grip.closed ? 'FIST' : 'open'} (curl ${grip.curl.toFixed(2)})`}</>;
}

function App() {
  const video = useRef<HTMLVideoElement>(null);
  const [screen, setScreen] = useState<Screen>({ at: 'start' });
  const [error, setError] = useState('');
  const [db, setDb] = useState(load);
  const [editingPlayer, setEditingPlayer] = useState<number|null>(null);
  const [who, setWho] = useState([0, 1]); // profile index per player slot
  const [mode, setMode] = useState<Mode>('solo');
  const [fx, setFx] = useState(effects.on);
  const [paused, setPaused] = useState(false);
  const [trackingLost, setTrackingLost] = useState(false);
  const [playerView, setPlayerView] = useState<PlayerView>('live');
  const [coop, setCoop] = useState(true); // two players: one team by default — it is what brings a couple back; rivals by choice
  const n = mode === 'together' ? 2 : 1; // bodies tracked at once; "turns" is two people, one at a time
  const energy0 = useRef([0, 0]);
  const name = (slot: number) => db.profiles[who[slot]];

  useEffect(() => { // every button press clicks, whoever pressed it: finger, mouse or hand
    const click = (e: MouseEvent) => (e.target as Element).closest?.('button') && sfx('click', { vol: 0.5 });
    addEventListener('click', click);
    return () => removeEventListener('click', click);
  }, []);

  // Pause: stop the frame loop (Shell context) and the audio clock, so rhythm games freeze too.
  const shell = useMemo(() => ({ paused: paused || trackingLost, pause: () => { setPaused(true); void setAudioPaused(true); } }), [paused, trackingLost]);
  const resume = () => { setPaused(false); void setAudioPaused(false); };
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && shell.pause();
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [shell]);

  const activeGame = screen.at === 'play' ? screen.game.id : '';
  useEffect(() => {
    if (!activeGame) { setTrackingLost(false); return; }
    if (sim) return;
    let lostSince: number|null = null, recoveredSince: number|null = null, lost = false;
    let previous: number[][][] = [], last=performance.now();
    const timer = setInterval(() => {
      const now = performance.now(), ok = Array.from({length:n},(_,i)=>assessPose(activeGame,samplePlayer(i),now,false).ok).every(Boolean);
      const gate = trackingGate(lostSince,ok,now); lostSince=gate.since;
      if (!lost && gate.lost) {lost=true;setTrackingLost(true);}
      if (lost) {
        const steady=ok&&Array.from({length:n},(_,i)=>standingPose(activeGame,players[i].body)&&stablePose(activeGame,players[i].body,previous[i]??[],now-last)).every(Boolean);
        const hold=readiness(recoveredSince,steady,now,1000);recoveredSince=hold.since;
        if (hold.ready) {lost=false;lostSince=recoveredSince=null;setTrackingLost(false);}
      }
      previous=players.slice(0,n).map(p=>p.body.map(q=>[...q]));last=now;
    },100);
    return ()=>clearInterval(timer);
  }, [activeGame,n,screen.at === 'play' ? screen.turn : -1]);
  useEffect(() => {
    if (screen.at !== 'play') return;
    if (paused || trackingLost) void setAudioPaused(true); else void setAudioPaused(false);
  }, [paused,trackingLost,screen.at]);
  // Pilot choices last for one round; the user's Tracking preference is restored in menus.
  useEffect(() => {
    const previous=tuning.look;
    if (['slice','keepy','freeze','shapeup'].includes(activeGame)) tuning.look=playerView==='live'?'mirror':'shadow';
    else if (activeGame) tuning.look='shadow';
    return ()=>{tuning.look=previous;};
  }, [activeGame,playerView,n]);
  useEffect(() => {
    const render = () => JSON.stringify({screen:screen.at,game:'game' in screen?screen.game.id:null,players:n,paused,trackingLost,view:playerView,selection:menuSelectionView,coordinates:'camera: mirrored x right, y down; stage: x right, y up',...(['jab','goalie'].includes(activeGame)?{play:activeGame==='jab'?(window as Window&{__jab?:{snapshot:()=>unknown}}).__jab?.snapshot():(window as Window&{__goalie?:{snapshot:()=>unknown}}).__goalie?.snapshot()}:{} )});
    Object.assign(window,{render_game_to_text:render});
    return ()=>{delete (window as Window & {render_game_to_text?:()=>string}).render_game_to_text;};
  }, [screen,n,paused,trackingLost,playerView]);

  const update = (next: typeof db) => { save(next); setDb(next); };
  const go = (s: Screen) => {
    setPaused(false);
    if (s.at === 'setup') setPlayerView(v=>s.game.id==='shapeup'?'live':supportedView(s.game.id,n,v));
    if (s.at === 'play') energy0.current = players.map((p) => p.energy);
    if (s.at === 'brief') s.game.Play.warm(); // fetch the renderer and this game's code while the player reads how to play
    setScreen(s);
  };
  const chooseMode = (m: Mode) => { setMode(m); setPlayers(m === 'together' ? 2 : 1); };
  // Tracker settings live in localStorage and are read when the tracker starts, so changing one restarts the app.
  const setTracker = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } location.reload(); };
  const toggleFx = () => { effects.on = !fx; setFx(!fx); try { localStorage.setItem('romp.fx', fx ? 'off' : 'on'); } catch { /* private mode */ } };
  const start = async () => {
    // Fullscreen first: it needs the tap's user-activation, which is gone once the camera prompt and model load finish.
    try { void document.documentElement.requestFullscreen().catch(() => {}); } catch { /* not supported — play windowed */ }
    void setAudioPaused(false); // same reason: games are later started by a hand-dwell, which is not a user gesture
    void loadAudio(); // samples decode in the background; until then sounds fall back to synth blips
    try { await startPose(video.current!); } catch (e) {
      return setError(`Camera or tracker failed: ${(e as Error).message}. Allow the camera — and if this is the http://192.168… address, add it under chrome://flags → “Insecure origins treated as secure” first.`);
    }
    setTimeout(() => report('tracker'), 15000); // once the numbers have settled
    go({ at: 'home' });
  };
  // Ten seconds of raw tracker output, sent to the build machine: the filters get tuned against the real player.
  const [taping, setTaping] = useState('');
  // The screen flashes for ~12s (slowly — about twice a second) while the camera watches the room; see measureDelay.
  const [delay, setDelay] = useState('');
  const calibrate = async () => {
    setDelay('Measuring…');
    const ms = await measureDelay(video.current!);
    if (ms === null) return setDelay('Could not see the screen light the room. Dim the lights or stand closer, and try again.');
    report('delay', { ms });
    setTracker('romp.unseen', String(ms));
  };
  const tape = async () => {
    setTaping('Recording — wave, slice, punch, then hold still…');
    report('tape', await record(12));
    setTaping('Sent. Thank you!');
  };

  // Two people on stage play as one team where the game knows how; what they score is then kept apart from solo scores.
  const teamOf = (game: Game) => n === 2 && !!game.team && (coop || !!game.crew);
  const finish = (run: Round, gameScores: number[], gameNotes: string[][] = []) => {
    const team = teamOf(run.game), variant = variantOf(run.mode, team);
    report('round', { game: run.game.id, stage: run.stage, mode: run.mode, team, players: n, glow: effects.on, look: tuning.look, cutMs: +cutout.ms.toFixed(1), cutDropped: cutout.dropped, ...paceSummary() });
    const earned = gameScores.map((_, i) => Math.round((players[i].energy - energy0.current[i]) / tuning.energyPerPoint));
    const scores = [...run.scores, ...gameScores], points = [...run.points, ...earned], notes = [...run.notes, ...gameScores.map((_, i) => gameNotes[i] ?? [])];
    if (mode === 'turns' && run.turn === 0) return go({ ...run, at: 'next', turn: 1, scores, points, notes });

    // Book the round one player at a time, comparing each player's progress before and after their own row lands.
    const t = Date.now(), id = run.game.id;
    let sessions = db.sessions;
    const rewards = scores.map((score, i): Reward => {
      const me = name(i), best = bestScore(sessions, me, id, run.stage, variant), level = levelOf(xpOf(sessions, me)).level;
      const hadBadges = badgesOf(sessions, me, t), hadDone = dailyChallenges(sessions, me, NAMES, t).filter((c) => c.done).map((c) => c.id);
      const stars = starsFor(id, run.stage, score, variant), newBest = score > best;
      const xp = sessionXp({ points: points[i], stars, stage: run.stage, newBest });
      sessions = [...sessions, { t, game: id, who: me, score, points: points[i], stage: run.stage, stars, xp, ...(variant ? { variant } : {}) }];
      const challenges = dailyChallenges(sessions, me, NAMES, t).filter((c) => c.done && !hadDone.includes(c.id));
      sessions = [...sessions, ...challenges.map((c) => ({ t, game: `bonus:${c.id}`, who: me, score: 0, points: 0, xp: CHALLENGE_XP }))];
      const levelNow = levelOf(xpOf(sessions, me)).level;
      return { stars, xp: xp + challenges.length * CHALLENGE_XP, newBest, levelUp: levelNow > level ? levelNow : 0, badges: badgesOf(sessions, me, t).filter((b) => !hadBadges.includes(b)), challenges: challenges.map((c) => c.text) };
    });
    update({ ...db, sessions });
    go({ ...run, at: 'results', scores, points, rewards, notes });
    rewards.forEach((r) => Array.from({ length: r.stars }, (_, k) => setTimeout(() => sfx('select', { vol: 0.8, rate: 1 + k * 0.25, jitter: 0 }), 500 + k * 350))); // one chime per star as it pops

    if (rewards.some((r) => r.stars)) jingle('win');
    if (rewards.some((r) => r.levelUp)) say('level_up');
    else if (rewards.some((r) => r.challenges.length)) say('mission_completed');
    else if (rewards.some((r) => r.newBest)) say('new_highscore');
    else if (scores.length === 2 && scores[0] === scores[1] && !team) say('its_a_tie');
    else if (rewards.some((r) => r.stars === 3)) say('congratulations');
  };
  const play = (game: Game, stage: number, gameMode: string) => go({ at: 'setup', game, stage, mode: gameMode, turn: 0, scores: [], points: [], rewards: [], notes: [] });


  const slots = mode === 'solo' ? [0] : [0, 1];
  const clash = slots.length === 2 && who[0] === who[1];
  // A stage is open if any of the people about to play has opened it.
  const open = (game: Game, gameMode = '') => Math.max(...slots.map((i) => unlockedStage(db.sessions, name(i), game.id, variantOf(gameMode, teamOf(game)))));
  const party = screen.at === 'results' && screen.rewards.some((r) => r.stars === 3 || r.levelUp || r.newBest);
  return (
    <Shell.Provider value={shell}>
      <video className={screen.at === 'tracking' ? 'mirror bright' : 'mirror'} ref={video} muted playsInline />
      {screen.at !== 'tracking' && screen.at !== 'setup' && <Backdrop ingame={screen.at === 'play'} />}
      {screen.at === 'start' && (
        <div className="screen moon-start">
          <header className="moon-masthead"><Logo /><span className="moon-eyebrow">MOVE ON / FEEL SOMETHING</span><span className="moon-edition">MOVE TOGETHER. PLAY YOUR WAY.</span></header>
          <div className="moon-welcome">
            <div className="moon-welcome-copy"><p className="moon-eyebrow">SIX WORLDS. ONE YOU.</p><h1>YOUR BODY.<br /><span>THE CONTROLLER.</span></h1><p className="moon-intro">Slice the chaos. Own the goal. Dance like the room is yours.</p><button className="primary giant" onClick={start}>Start <span aria-hidden="true">↗</span></button><p className="moon-camera-note">Camera on. Step back. Make your move.<br />Play on your Mac or tablet · no controller needed</p>{error && <p className="error">{error}</p>}</div>
            <div className="moon-welcome-art" aria-label="Original artwork for the MOON movement arcade"><img className="moon-cover-main" src={moonArt('freeze')} alt="Freeze club environment" fetchPriority="high" /><img className="moon-cover-slice" src={moonArt('slice')} alt="Slice fruit world" /><img className="moon-cover-goalie" src={moonArt('goalie')} alt="Goalie stadium world" /><img className="moon-cover-buddy" src={moonBuddy('freeze')} alt="Fuzzbyte, your playful party host" /><span className="moon-art-stamp">MOVE<br />LIKE YOU<br />MEAN IT.</span></div>
          </div>
          <footer className="moon-start-footer"><span>SLICE / GOALIE / FREEZE / SHAPE UP / JACK ATTACK / JAB</span><span>REAL MOVES. GOOD ENERGY.</span></footer>
        </div>
      )}
      {screen.at === 'home' && (
        <div className="screen library moon-playroom">
          <header className="moon-masthead"><Logo /><span className="moon-eyebrow">YOUR PLAYROOM</span><nav aria-label="Playroom tools"><button className="ghost" onClick={toggleFx}>Effects {fx ? 'on' : 'off'}</button><button className="ghost" onClick={() => go({ at: 'tracking' })}>Tracking</button><button className="ghost" onClick={() => go({ at: 'badges' })}>Badges</button><button className="ghost" onClick={() => go({ at: 'stats' })}>Stats</button></nav></header>
          <section className="moon-session moon-session-compact" aria-label="Players and play mode"><div><h1>What are we playing?</h1><div className="seg">{(Object.keys(MODES) as Mode[]).map(m=><button key={m} aria-pressed={mode===m} onClick={()=>chooseMode(m)}>{MODES[m]}</button>)}</div></div><div className="moon-player-slots">{slots.map(i=><button className="moon-player-chip" key={i} onClick={()=>setEditingPlayer(i)} aria-label={`Choose player ${i+1}: ${name(i)}`}><img src={crewOf(db.avatars?.[name(i)]).art} alt="" /><span><b>{name(i)}</b><small>{crewOf(db.avatars?.[name(i)]).name} · Level {levelOf(xpOf(db.sessions,name(i))).level}</small></span><span aria-hidden="true">⌄</span></button>)}</div>{clash&&<p className="error">Pick two different players.</p>}</section>
          <div className="moon-selection-label"><h2>THE SELECT SIX</h2><span>RIGHT HAND · HOLD 3s TO CHOOSE</span></div>
          <div className="moon-posters">
            {GAMES.filter(g => g.maxPlayers >= n).map((g,i) => <button className="moon-poster" data-game={g.id} key={g.id} style={toneOf(g)} disabled={clash} onClick={()=>go({at:'brief',game:g,stage:open(g),mode:g.id==='goalie'?keeperVariant(goalieSettings()):''})} aria-label={`${g.name} — ${MOON_CATALOG[g.id].hook}`}>
              <div className="moon-poster-art"><img src={moonArt(g.id)} alt="" loading={i>2?'lazy':'eager'} /><img className="moon-poster-buddy" src={moonBuddy(g.id)} alt="" loading={i>2?'lazy':'eager'} /><span className="moon-poster-index">0{i+1}</span><span className="moon-poster-arrow" aria-hidden="true">↗</span><span className="moon-poster-world">{MOON_CATALOG[g.id].world}</span></div>
              <div className="moon-poster-copy"><div><h3>{g.name}</h3><p>{MOON_CATALOG[g.id].hook}</p></div><span className="moon-poster-move">{MOON_CATALOG[g.id].move}<small>Stage {open(g)} / {STAGES}</small></span></div>
            </button>)}
          </div>
          <section className="moon-dailies"><div><p className="moon-eyebrow">A LITTLE EXTRA MOTIVATION</p><h2>TODAY’S SIDE QUESTS</h2><p>For {name(0)} · +{CHALLENGE_XP} XP each</p></div><div className="moon-quest-list">{dailyChallenges(db.sessions,name(0),NAMES).map(c=><div key={c.id} className={c.done?'quest done':'quest'}><span className="tick">{c.done?'✓':''}</span><span className="what">{c.text}<small>{c.have} / {c.goal}</small></span><span className="meter"><i style={{width:`${100*c.have/c.goal}%`}} /></span></div>)}</div></section>
          <footer className="moon-room-footer"><Logo /><span>MOve ON. A little further every time.</span><span>{totalStars(db.sessions,name(0))} stars collected</span></footer>
        </div>
      )}
      {editingPlayer!==null&&<PlayerPicker db={db} current={name(editingPlayer)} slot={editingPlayer} onSave={update} onSwitch={index=>setWho(w=>w.map((v,i)=>i===editingPlayer?index:v))} onClose={()=>setEditingPlayer(null)} />}
      {screen.at === 'brief' && (() => {
        const { game } = screen, team = teamOf(game), variant = variantOf(screen.mode, team), opened = open(game, screen.mode);
        return (
          <div className={`screen moon-brief ${game.id==='freeze'?'moon-party-brief':''}`} data-game={game.id} style={toneOf(game)}>
            <header className="moon-masthead"><Logo /><span className="moon-eyebrow">THE SELECT SIX / {game.name}</span><button className="ghost" onClick={() => go({ at: 'home' })}>← Back</button></header>
            <div className="brief">
              <div className="moon-brief-art"><img src={moonArt(game.id,screen.stage)} alt={`${game.name} game environment`} /><img className="moon-brief-buddy" src={moonBuddy(game.id)} alt={['jab','goalie'].includes(game.id)?"Rizzquake":['goalie','jacks'].includes(game.id)?"Moodi and Quack":"Fuzzbyte"} /><div><p className="moon-eyebrow">{MOON_CATALOG[game.id].world}</p><h1>{game.name}</h1><p>{MOON_CATALOG[game.id].hook}</p></div><span className="moon-key-art-label">MEET YOUR WORLD / MEET YOUR CREW</span></div>
              <div className="col" style={{ gap: '1.3rem' }}>
                <div className="moon-how"><p className="moon-eyebrow">THE MOVES / HOW TO PLAY</p>{MOON_CATALOG[game.id].steps.map((step,i)=><p key={step}><span>0{i+1}</span>{step}</p>)}</div>
                {(game.modes || (n === 2 && game.team && !game.crew)) && (
                  <div className="row">
                    {game.modes && <div className="seg">{game.modes.map((m) => <button key={m.id} aria-pressed={screen.mode === m.id} onClick={() => go({ ...screen, mode: m.id, stage: Math.min(screen.stage, open(game, m.id)) })}>{m.name}</button>)}</div>}
                    {n === 2 && game.team && !game.crew && <div className="seg"><button aria-pressed={coop} onClick={() => setCoop(true)}>🤝 Team</button><button aria-pressed={!coop} onClick={() => setCoop(false)}>⚔️ Versus</button></div>}
                    <span className="dim">{[game.modes?.find((m) => m.id === screen.mode)?.blurb, n === 2 && game.team ? (team ? 'One shared score: you win or lose together' : 'Highest score wins') : ''].filter(Boolean).join(' · ')}</span>
                  </div>
                )}
                <p className="moon-eyebrow">CHOOSE YOUR STAGE</p><div className="path">
                  {Array.from({ length: STAGES }, (_, k) => k + 1).map((st) => (
                    <span key={st} className="row" style={{ gap: 0 }}>
                      {st > 1 && <span className={st <= opened ? 'link open' : 'link'} />}
                      <button className="node" aria-pressed={screen.stage === st} disabled={st > opened} onClick={() => go({ ...screen, stage: st })}>
                        {st > opened ? '🔒' : st}
                        {st <= opened && <small><Stars n={bestStars(db.sessions, name(0), game.id, st, variant)} /></small>}
                      </button>
                    </span>
                  ))}
                </div>
                <div className="goals num">
                  {starGoals(game.id, screen.stage, variant).map((goal, k) => <span className="goal" key={k}><Stars n={k + 1} /> {goal}</span>)}
                  <span className="dim">Two stars open the next stage · best here {bestScore(db.sessions, name(0), game.id, screen.stage, variant)}</span>
                </div>
                {game.id==='freeze'&&<PartyOptions />}{game.id==='jab'&&<JabOptions stage={screen.stage}/>}{game.id==='goalie'&&<GoalieOptions stage={screen.stage} mode={screen.mode} onChange={mode=>go({...screen,mode})}/>}<div className="moon-launch"><button className="primary giant" onClick={() => play(game, Math.min(screen.stage, opened), screen.mode)}>Play</button><span>Camera check, then you’re in.<br />{mode==='solo'?'Your next personal best is waiting.':'Make room for your next challenger.'}</span></div>
              </div>
            </div>
          </div>
        );
      })()}
      {screen.at === 'setup' && <PlayerSetup key={`${screen.game.id}-${screen.turn}`} game={screen.game.id} title={`${screen.game.name}${mode==='turns'?` · ${name(screen.turn)}`:''}`} n={n} view={playerView} onView={setPlayerView} onBack={()=>go({at:'brief',game:screen.game,stage:screen.stage,mode:screen.mode})} onReady={()=>go({...screen,at:'play'})} />}
      {screen.at === 'play' && !['slice','keepy','freeze','shapeup'].includes(screen.game.id) && playerView === 'live' && <div className="player-inset"><CameraView game={screen.game.id} n={n} guide compact /><span>You · live tracking</span></div>}
      {screen.at === 'play' && <div data-game={screen.game.id} className={`moon-game ${screen.game.id==='freeze'&&playerView==='live'?'live-dance':screen.game.id==='smash'?'demolition-stage':''}`}><screen.game.Play key={screen.turn} n={n} stage={screen.stage} mode={screen.mode} team={teamOf(screen.game)} best={bestScore(db.sessions, name(mode === 'turns' ? screen.turn : 0), screen.game.id, screen.stage, variantOf(screen.mode, teamOf(screen.game)))} onEnd={(scores, notes) => finish(screen, scores, notes)} /></div>}
      {screen.at === 'play' && trackingLost && !paused && <div className="pause tracking-recovery"><div className="panel"><h1>Let’s find you again</h1><CameraView game={screen.game.id} n={n} guide compact /><p>Stand naturally with your hands and required body parts in view. Hold briefly to resume.</p><p className="dim">Your round is paused. It resumes when tracking is steady.</p><button onClick={()=>go({at:'home'})}>Back to home</button></div></div>}
      {screen.at === 'play' && paused && (
        <div className="pause">
          <div className="panel">
            <h1>Paused</h1>
            <p className="muted">Leave {screen.game.name} and go back to home? This round will not be saved.</p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="primary" onClick={resume}>Keep playing</button>
              <button onClick={() => { resume(); go({ at: 'home' }); }}>Back to home</button>
            </div>
          </div>
        </div>
      )}
      {screen.at === 'next' && (
        <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1>{name(0)} scored <span className="crown num">{screen.scores[0]}</span></h1>
          <h2>{name(1)}, you are up! {name(0)}, step out of view.</h2>
          <button className="primary giant" onClick={() => go({ ...screen, at: 'setup' })}>Ready</button>
        </div>
      )}
      {screen.at === 'results' && (
        <div className="screen moon-results" style={{ alignItems: 'center' }} data-game={screen.game.id}>
          <img className="moon-result-art" src={moonArt(screen.game.id,screen.stage)} alt="" /><p className="moon-eyebrow">MOON / ROUND COMPLETE</p>
          {party && <Confetti />}
          <h1>{screen.game.name}{screen.game.id==='goalie'?` · ${keeperDifficulty(keeperFromVariant(screen.mode))}`:screen.mode ? ` ${screen.game.modes?.find((m) => m.id === screen.mode)?.name}` : ''} · stage {screen.stage}{teamOf(screen.game) ? ' · team' : ''}</h1>
          <div className="results">
            {screen.scores.map((score, i) => {
              const r = screen.rewards[i], top = screen.scores.length === 2 && score > screen.scores[1 - i] && !teamOf(screen.game);
              let toast = 0;
              return (
                <div className="panel result" key={i} style={vars({ '--tone': PLAYER_COLORS[i] })}>
                  <h2>{top && <span className="crown">👑 </span>}{name(i)}</h2>
                  <p className="score num"><CountUp to={score} /></p>
                  <div className="bigstars">{[0, 1, 2].map((k) => <span key={k} className={k < r.stars ? 'on' : ''} style={vars({ '--i': k })}>★</span>)}</div>
                  {screen.notes[i]?.length > 0 && (['jab','goalie'].includes(screen.game.id)?<ul className={`${screen.game.id==='jab'?'jab':'keeper'}-result-notes num`}>{screen.notes[i].map(note=><li key={note}>{note}</li>)}</ul>:<p className="dim num notes">{screen.notes[i].join(' · ')}</p>)}
                  <p className="num">+{r.xp} XP <span className="dim">· +{screen.points[i]} activity points</span></p>
                  <Player sessions={db.sessions} who={name(i)} tone={PLAYER_COLORS[i]} />
                  {r.newBest && <p className="toast gold" style={vars({ '--i': toast++ })}>🏆 New best!</p>}
                  {r.levelUp > 0 && <p className="toast pink" style={vars({ '--i': toast++ })}>⬆️ Level up! You are level {r.levelUp}</p>}
                  {r.challenges.map((c) => <p key={c} className="toast green" style={vars({ '--i': toast++ })}>🎯 Quest done: {c}</p>)}
                  {r.badges.map((b) => <p key={b} className="toast gold" style={vars({ '--i': toast++ })}>{BADGE_ICON[b]} Badge: {BADGES.find((x) => x.id === b)!.name}</p>)}
                  {r.stars < 3 && <p className="dim num">Next star at {starGoals(screen.game.id, screen.stage, variantOf(screen.mode, teamOf(screen.game)))[r.stars]}</p>}
                </div>
              );
            })}
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="primary" onClick={() => play(screen.game, screen.stage, screen.mode)}>Play again</button>
            {screen.stage < open(screen.game, screen.mode) && <button onClick={() => play(screen.game, screen.stage + 1, screen.mode)}>Next stage →</button>}
            <button onClick={() => go({ at: 'home' })}>Home</button>
          </div>
        </div>
      )}
      {screen.at === 'tracking' && (
        <div className="screen">
          <TrackingView />
          <div className="row"><h1 className="grow">🎯 Tracking</h1><button className="ghost" onClick={() => go({ at: 'home' })}>← Back</button></div>
          <div className="panel" style={{ maxWidth: '46rem' }}>
            <p className="num"><Fps /></p>
            <p className="dim num">Camera {track.camera || '—'}</p>
            <p className="dim num"><TrackerDetail /></p>
            <p className="dim">Hold a hand still: the yellow scribble behind the dot is the tracking noise. Wave fast: a smeared, lagging trail means motion blur — add light, or try Sharp motion.</p>
            <div className="row">
              <span className="label">Your look</span>
              <div className="seg">
                <button aria-pressed={tuning.look === 'shadow'} onClick={() => setTracker('romp.look', 'shadow')}>Shadow</button>
                <button aria-pressed={tuning.look === 'mirror'} onClick={() => setTracker('romp.look', 'mirror')}>Mirror</button>
              </div>
              <span className="dim">In full-body games. Shadow: a lightweight player silhouette for the other full-body games. Mirror: the game played over your whole room, dimmed, with you in the light.</span>
            </div>
            <div className="row">
              <span className="label">Model</span>
              <div className="seg">
                <button aria-pressed={tuning.model === 'full'} onClick={() => setTracker('romp.model', 'full')}>Precise</button>
                <button aria-pressed={tuning.model === 'lite'} onClick={() => setTracker('romp.model', 'lite')}>Fast</button>
              </div>
            </div>
            <div className="row"><span className="label">Menu selection</span><span>Right hand · hold for 3 seconds</span><span className="dim">Let the ring fill to choose. Move away to cancel or choose again.</span></div>
            <div className="row">
              <span className="label">Sharp motion</span>
              <div className="seg">
                <button aria-pressed={!tuning.sharp} onClick={() => setTracker('romp.sharp', 'off')}>Off</button>
                <button aria-pressed={tuning.sharp} onClick={() => setTracker('romp.sharp', 'on')}>On</button>
              </div>
              <span className="dim">Caps the shutter at 16 ms: less blur, steady 30 fps.</span>
            </div>
            <div className="row">
              <span className="label">Camera speed</span>
              <div className="seg">
                <button aria-pressed={tuning.fastCam} onClick={() => setTracker('romp.cam', 'fastest')}>Fastest</button>
                <button aria-pressed={!tuning.fastCam} onClick={() => setTracker('romp.cam', 'standard')}>Standard</button>
              </div>
              <span className="dim">60 fps, if the camera can.</span>
            </div>
            <div className="row">
              <span className="label">Frames</span>
              <div className="seg">
                <button aria-pressed={tuning.direct} onClick={() => setTracker('romp.frames', 'direct')}>Direct</button>
                <button aria-pressed={!tuning.direct} onClick={() => setTracker('romp.frames', 'copied')}>Copied</button>
              </div>
              <span className="dim">Compare the ms above.</span>
            </div>
            <div className="row">
              <span className="label">Delay</span>
              <button onClick={calibrate}>Measure ({Math.round(tuning.unseen * 1000)} ms)</button>
              <span className="dim">{delay || 'Screen + camera delay. The screen will flash slowly for 12 s.'}</span>
            </div>
            <div className="row">
              <span className="label">Tuning</span>
              <button disabled={taping.startsWith('Rec')} onClick={tape}>Record 12 s</button>
              <span className="dim">{taping || 'Sends raw tracking to the build machine.'}</span>
            </div>
          </div>
        </div>
      )}
      {screen.at === 'badges' && (
        <div className="screen">
          <div className="row"><h1 className="grow">🏅 Badges · {name(0)} <span className="dim num">{badgesOf(db.sessions, name(0)).length} / {badgeCatalog(db.sessions,name(0)).length}</span></h1><button className="ghost" onClick={() => go({ at: 'home' })}>← Back</button></div>
          <div className="badges">
            {badgeCatalog(db.sessions,name(0)).map((b, i) => {
              const has = badgesOf(db.sessions, name(0)).includes(b.id);
              return <div key={b.id} className={has ? 'badge has' : 'badge'} style={vars({ '--i': i })}><em>{BADGE_ICON[b.id]}</em><b>{b.name}</b><small>{b.how}</small></div>;
            })}
          </div>
        </div>
      )}
      {screen.at === 'stats' && (
        <div className="screen">
          <div className="row"><h1 className="grow">📊 Stats</h1><button className="ghost" onClick={() => go({ at: 'home' })}>← Back</button></div>
          <div className="split">
            <div className="panel">
              <table className="num">
                <thead><tr><th>Player</th><th>Level</th><th>Stars</th><th>Today</th><th>7 days</th><th>Streak</th></tr></thead>
                <tbody>
                  {db.profiles.map((p) => {
                    const s = summary(db.sessions, p);
                    return <tr key={p}><td>{p}</td><td>{levelOf(xpOf(db.sessions, p)).level}</td><td><span className="stars">★</span> {totalStars(db.sessions, p)}</td><td>{s.today} / {DAY_GOAL}</td><td>{s.week}</td><td>🔥 {s.streak}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="panel">
              <table className="num">
                <thead><tr><th>Best score</th>{db.profiles.map((p) => <th key={p}>{p}</th>)}</tr></thead>
                <tbody>
                  {GAMES.map((g) => {
                    const best = db.profiles.map((p) => summary(db.sessions, p).best[g.id] ?? 0), top = Math.max(...best);
                    return <tr key={g.id}><td>{g.icon} {g.name}</td>{best.map((v, i) => <td key={i} className={v && v === top ? 'lead' : ''}>{v || '—'}</td>)}</tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {screen.at === 'brief' && <Presence small={false} />}
      {((screen.at !== 'play' && screen.at !== 'start') || paused) && <HandCursor />}
    </Shell.Provider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
