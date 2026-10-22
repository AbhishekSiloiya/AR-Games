import { DANCE_TRACKS, chooseDance, danceChoice } from './dance-music.ts';
import { useEffect, useRef, useState } from 'react';
import { assessPose, gameSetup, jointName, estimatedReach, quickReadiness, standingPose, visibleJoint, type QuickReadiness } from './calibration.ts';
import { cameraReach, captureStanding, feed, players, sim, trackingSeen } from './pose.ts';

export type PlayerView = 'live' | 'classic';
export const samplePlayer = (i: number) => ({ present: players[i].present, body: players[i].body, seenAt: trackingSeen[i] });
const BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];

// One rendering path for setup, recovery and Run's inset. Fit, never crop, the camera.
export function CameraView({ game, n, guide = false, compact = false }: { game: string; n: number; guide?: boolean; compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0, last=0;
    const draw = (now=0) => {
      raf = requestAnimationFrame(draw);
      if(compact&&now-last<66)return;last=now;
      const c = canvas.current, video = feed.video;
      if (!c) return;
      const w = c.clientWidth || 640, h = c.clientHeight || 360;
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const g = c.getContext('2d')!;
      g.fillStyle = '#0d1723'; g.fillRect(0,0,w,h);
      const vw = video?.videoWidth || 16, vh = video?.videoHeight || 9, scale = Math.min(w/vw,h/vh), fw = vw*scale, fh = vh*scale, ox = (w-fw)/2, oy = (h-fh)/2;
      if (video && video.readyState >= 2) { g.save(); g.translate(ox+fw,oy); g.scale(-1,1); g.drawImage(video,0,0,fw,fh); g.restore(); }
      if (!guide) return;
      const config = gameSetup(game);
      for (let p=0;p<n;p++) {
        const point = (a: number,b: number) => [ox+a*fw,oy+b*fh];
        const line = (a: number[],b: number[]) => {g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();};
        if (n===2) {g.strokeStyle='#bfefff66';g.lineWidth=2;line(point(.5,.05),point(.5,.95));}
        const b = players[p].body, fresh = players[p].present && performance.now()-trackingSeen[p] <= 600;
        if (!fresh) continue;
        g.lineWidth = 2; g.strokeStyle = '#73f5dc';
        for (const [a,z] of BONES) if (config.joints.includes(a)&&config.joints.includes(z)&&visibleJoint(b,a)&&visibleJoint(b,z)) line(point(b[a][0],b[a][1]),point(b[z][0],b[z][1]));
        for (const j of config.joints) {
          const q = b[j]; if (!q || !Number.isFinite(q[0]+q[1])) continue;
          const good = visibleJoint(b,j,-.025), [px,py] = point(q[0],q[1]);
          g.fillStyle = good ? '#73f5dc' : '#ffb86b';g.beginPath();g.arc(px,py,compact?3:6,0,Math.PI*2);g.fill();
        }
      }
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, [game,n,guide,compact]);
  return <canvas ref={canvas} className={compact ? 'camera-view compact' : 'camera-view'} aria-label={guide ? 'Mirrored camera preview with positioning guide and tracked joints' : 'Live mirrored player camera'} />;
}

export function PlayerSetup({ game, title, n, view, onView, onReady, onBack }: { game: string; title: string; n: number; view: PlayerView; onView: (v: PlayerView) => void; onReady: () => void; onBack: () => void }) {
  const config = gameSetup(game);
  const [track,setTrack]=useState<string>(()=>danceChoice().id);
  const [status,setStatus] = useState({ message:'Stand naturally in view', progress:0, usable:false, checks:[] as boolean[] });
  const ready = useRef(onReady), finished = useRef(false); ready.current = onReady;
  const startGame = () => {
    const now=performance.now();
    if (finished.current || !Array.from({length:n},(_,i)=>assessPose(game,samplePlayer(i),now,true,i,n).ok&&standingPose(game,players[i].body)).every(Boolean)) return;
    finished.current=true;
    players.slice(0,n).forEach((p,i)=>{cameraReach[i]=estimatedReach(p.body);});
    captureStanding();ready.current();
  };
  const begin = useRef(startGame);begin.current=startGame;
  useEffect(() => {
    let raf = 0, last = 0, gate: QuickReadiness|null = null;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick); if (now-last < 80 || finished.current) return; last=now;
      const samples = Array.from({length:n},(_,i)=>samplePlayer(i));
      const checks = samples.map((s,i)=>assessPose(game,s,now,true,i,n));
      const usable=checks.every(c=>c.ok)&&samples.every(s=>standingPose(game,s.body));
      gate=quickReadiness(gate,usable,now);
      const message=checks.map((c,i)=>!c.ok ? `${n===2?`Player ${i+1}: `:''}${c.message}` : '').find(Boolean)
        || (usable?'Looking good — starting…':'Stand naturally, facing the camera');
      setStatus({message,progress:Math.min(1,gate.goodMs/900),usable,checks:config.joints.map(j=>samples.every(s=>s.present&&now-s.seenAt<=600&&visibleJoint(s.body,j,-.025)))});
      if (gate.ready) begin.current();
    };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  }, [game,n]);
  const pilot=true;
  const viewLabel=game==='shapeup'?'You + pose coach':game==='freeze'?'You + disco gear':['slice','keepy'].includes(game)?'See yourself':'Game + live tracking';
  return <div className="player-setup">
    <header className="setup-heading"><div><p className="setup-eyebrow">GET READY · {title}</p><h1>Stand naturally. Let’s play.</h1></div><button className="ghost" onClick={onBack}>← Back</button></header>
    <div className="setup-workspace">
      <div className="setup-camera"><CameraView game={game} n={n} guide /><span className="camera-label">{sim?'SIMULATOR · camera checks need a real camera':'LIVE CAMERA · stays on your device'}</span><div className="setup-prompt" role="status" aria-live="polite"><strong>{status.message}</strong><div className="setup-progress" role="progressbar" aria-label="Position readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(status.progress*100)}><i style={{width:`${status.progress*100}%`}} /></div></div></div>
      <aside className="setup-instructions">
        <h2>Just step into view</h2>
        <p>{config.upper?'Keep your shoulders and hands in view. No special pose needed.':'Step back enough to see your hands and feet. Relax your arms and face the camera.'}</p>
        <div className="joint-checks">{config.joints.filter(j=>j===11||(j>=15&&j%2===1)).map(j=><span key={j} className={status.checks[config.joints.indexOf(j)]&&(j===0||status.checks[config.joints.indexOf(j+1)])?'ready':''}>{status.checks[config.joints.indexOf(j)]&&(j===0||status.checks[config.joints.indexOf(j+1)])?'✓':'○'} {j===27?'Feet':`${jointName(j)}${j===0?'':'s'}`}</span>)}</div>
        {pilot && <fieldset className="setup-view"><legend>During the game</legend><button aria-pressed={view==='live'} onClick={()=>onView('live')}>{viewLabel}</button><button aria-pressed={view==='classic'} onClick={()=>onView('classic')}>Classic view</button></fieldset>}
        {game==='freeze'&&<fieldset className="setup-view"><legend>Dance soundtrack</legend>{DANCE_TRACKS.map(t=><button key={t.id} aria-pressed={track===t.id} onClick={()=>{chooseDance(t.id);setTrack(t.id);}}>{t.name}</button>)}<p className="dim">Music: {DANCE_TRACKS.find(t=>t.id===track)?.by} · {track==='synth'?'original synth':<a href={DANCE_TRACKS.find(t=>t.id===track)?.source} target="_blank" rel="noreferrer">CC0 · source</a>}</p></fieldset>}
        {game==='jacks'&&<p className="player-style-note">Raise either hand to shoot; lower it to reload. Your space ranger follows along.</p>}
        <button className="primary" disabled={!status.usable} onClick={startGame}>Start game</button>
        <p className="dim">Starts automatically in about a second. You can stand anywhere in view — no need to match a pose.</p>
        {sim&&<button onClick={()=>ready.current()}>Continue in simulator</button>}
      </aside>
    </div>
  </div>;
}
