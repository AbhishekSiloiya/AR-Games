import { useEffect, useRef, useState } from 'react';
import { assessPose, gameSetup, jointName, movementDone, neutralPose, standingPose, stablePose, readiness, visibleJoint } from './calibration.ts';
import { cameraReach, captureStanding, feed, players, sim, trackingSeen } from './pose.ts';

export type PlayerView = 'live' | 'classic' | 'cutout';
export const samplePlayer = (i: number) => ({ present: players[i].present, body: players[i].body, seenAt: trackingSeen[i] });
const BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];

// One rendering path for setup, recovery and Run's inset. Fit, never crop, the camera.
export function CameraView({ game, n, guide = false, compact = false }: { game: string; n: number; guide?: boolean; compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
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
        const x = n === 1 ? .5 : p ? .73 : .27, size = n === 1 ? .68 : .41;
        g.strokeStyle = '#bfefff'; g.lineWidth = 2; g.setLineDash([8,8]);
        g.strokeRect(ox+(x-size/2)*fw,oy+.06*fh,size*fw,(config.upper?.66:.9)*fh); g.setLineDash([]);
        // A pose guide stays visible before the first detection.
        g.globalAlpha = .35; g.lineWidth = 5;
        const point = (a: number,b: number) => [ox+a*fw,oy+b*fh];
        const line = (a: number[],b: number[]) => {g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();};
        g.beginPath();g.arc(ox+x*fw,oy+.18*fh,.045*fh,0,Math.PI*2);g.stroke();
        line(point(x,.24),point(x,.56)); line(point(x-size*.32,.36),point(x+size*.32,.36));
        if (!config.upper) {line(point(x,.56),point(x-size*.14,.89));line(point(x,.56),point(x+size*.14,.89));}
        g.globalAlpha = 1;
        const b = players[p].body, fresh = players[p].present && performance.now()-trackingSeen[p] <= 600;
        if (!fresh) continue;
        g.lineWidth = 2; g.strokeStyle = '#73f5dc';
        for (const [a,z] of BONES) if (config.joints.includes(a)&&config.joints.includes(z)&&visibleJoint(b,a)&&visibleJoint(b,z)) line(point(b[a][0],b[a][1]),point(b[z][0],b[z][1]));
        for (const j of config.joints) {
          const q = b[j]; if (!q || !Number.isFinite(q[0]+q[1])) continue;
          const good = visibleJoint(b,j,.025), [px,py] = point(q[0],q[1]);
          g.fillStyle = good ? '#73f5dc' : '#ffb86b';g.beginPath();g.arc(px,py,compact?3:6,0,Math.PI*2);g.fill();
        }
      }
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, [game,n,guide,compact]);
  return <canvas ref={canvas} className={compact ? 'camera-view compact' : 'camera-view'} aria-label={guide ? 'Mirrored camera preview with positioning guide and tracked joints' : 'Live mirrored player camera'} />;
}

export function PlayerSetup({ game, title, n, view, onView, onReady, onBack }: { game: string; title: string; n: number; view: PlayerView; onView: (v: PlayerView) => void; onReady: () => void; onBack: () => void }) {
  const config = gameSetup(game), [phase,setPhase] = useState<'frame'|'move'|'hold'>('frame');
  const [status,setStatus] = useState({ message:'Step into view of the camera', progress:0, checks:[] as boolean[] });
  const ready = useRef(onReady); ready.current = onReady;
  useEffect(() => {
    let raf = 0, last = 0, since: number|null = null, current: typeof phase = 'frame', finished = false;
    let baseline: number[][][] = [], done: boolean[] = [], previous: number[][][] = [];
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick); if (now-last < 80 || finished) return; const elapsed=now-last;last=now;
      const samples = Array.from({length:n},(_,i)=>samplePlayer(i));
      const checks = samples.map((s,i)=>assessPose(game,s,now,true,i,n)), ok = checks.every(c=>c.ok);
      let message = checks.map((c,i)=>!c.ok ? `${n===2?`Player ${i+1}: `:''}${c.message}` : '').find(Boolean) || '';
      let progress = 0;
      if (current === 'frame') {
        const standing=ok&&samples.every(s=>standingPose(game,s.body));
        const stable=standing&&samples.every((s,i)=>stablePose(game,s.body,previous[i]??[],elapsed));
        const hold = readiness(since,stable,now,700); since=hold.since; progress=hold.progress;
        if (ok) message=standing?'Position found. Stand naturally for a moment':'Stand tall with your knees straight';
        if (hold.ready) { baseline=samples.map(s=>s.body.map(q=>[...q])); done=samples.map(()=>false); current='move';since=null;setPhase('move'); }
      } else if (current === 'move') {
        if (ok) samples.forEach((s,i)=>{
          if (!done[i] && movementDone(config.movement,s.body,baseline[i])) {
            done[i]=true;
            if (config.movement === 'reach') cameraReach[i]={left:Math.min(s.body[15][0],s.body[16][0]),right:Math.max(s.body[15][0],s.body[16][0])};
          }
        });
        if (ok) message=n===2 ? `${config.cue} · ${done.filter(Boolean).length}/2 ready` : config.cue;
        if (ok && done.every(Boolean)) {current='hold';since=null;setPhase('hold');}
      } else {
        const neutral = ok && samples.every((s,i)=>neutralPose(game,s.body,baseline[i])&&standingPose(game,s.body)&&stablePose(game,s.body,previous[i]??[],elapsed));
        const hold = readiness(since,neutral,now); since=hold.since;progress=hold.progress;
        if (ok) message=neutral ? 'Position locked. Hold steady…' : 'Return to your starting position and stand tall';
        if (hold.ready) {finished=true;captureStanding();ready.current();}
      }
      previous=samples.map(s=>s.body.map(q=>[...q]));
      setStatus({message,progress,checks:config.joints.map(j=>samples.every(s=>s.present&&now-s.seenAt<=600&&visibleJoint(s.body,j,.025)))});
    };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  }, [game,n]);
  const pilot=['slice','keepy','run'].includes(game);
  return <div className="player-setup">
    <header className="setup-heading"><div><p className="setup-eyebrow">GET READY · {title}</p><h1>Find your play space</h1></div><button className="ghost" onClick={onBack}>← Back</button></header>
    <div className="setup-workspace">
      <div className="setup-camera"><CameraView game={game} n={n} guide /><span className="camera-label">{sim?'SIMULATOR · camera checks need a real camera':'LIVE CAMERA · stays on your device'}</span><div className="setup-prompt" role="status" aria-live="polite"><strong>{status.message}</strong><div className="setup-progress" role="progressbar" aria-label="Position readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(status.progress*100)}><i style={{width:`${status.progress*100}%`}} /></div></div></div>
      <aside className="setup-instructions">
        <ol className="setup-phases">{['Fit in the frame','Try the movement','Hold to lock'].map((text,i)=><li key={text} className={i===['frame','move','hold'].indexOf(phase)?'active':''}><span>{i+1}</span>{text}</li>)}</ol>
        <p>{config.upper?'Keep your head, shoulders and both hands visible. Your feet can be outside the frame.':'Keep your head, hands, knees and feet visible, with space above and beside you.'}</p>
        <div className="joint-checks">{config.joints.filter(j=>j===0||j%2===1).map(j=><span key={j} className={status.checks[config.joints.indexOf(j)]&&(j===0||status.checks[config.joints.indexOf(j+1)])?'ready':''}>{status.checks[config.joints.indexOf(j)]&&(j===0||status.checks[config.joints.indexOf(j+1)])?'✓':'○'} {j===27?'Feet':`${jointName(j)}${j===0?'':'s'}`}</span>)}</div>
        {pilot && <fieldset className="setup-view"><legend>During the game</legend><button aria-pressed={view==='live'} onClick={()=>onView('live')}>{game==='run'?'Runner + live preview':'See yourself'}</button><button aria-pressed={view==='classic'} onClick={()=>onView('classic')}>Classic view</button>{game==='keepy'&&n===1&&<button aria-pressed={view==='cutout'} onClick={()=>onView('cutout')}>Player cut-out</button>}</fieldset>}
        <p className="dim">The game starts automatically once you are ready. Brief tracking gaps are allowed; longer gaps pause play.</p>
        {sim&&<button onClick={()=>ready.current()}>Continue in simulator</button>}
      </aside>
    </div>
  </div>;
}
