import {CameraView} from './setup.tsx';
import type {RecoveryStatus} from './tracking-recovery-status.ts';
import './tracking-recovery.css';

export function TrackingRecovery({game,n,status,preview,onHome}:{game:string;n:number;status:RecoveryStatus;preview:boolean;onHome:()=>void}) {
  return <section className="tracking-recovery-strip" data-preview={preview} aria-label="Tracking recovery">
    {preview&&<div className="tracking-recovery-preview"><CameraView game={game} n={n} guide compact/><span>LIVE FRAMING</span></div>}
    <div className="tracking-recovery-copy">
      <h2>Let’s find you again</h2>
      <strong role="status" aria-live="polite">{status.message}</strong>
      <p>Round paused · resumes when you’re steady.</p>
      <div className="tracking-recovery-progress" role="progressbar" aria-label="Ready to resume" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(status.progress*100)}><i style={{width:`${status.progress*100}%`}}/></div>
    </div>
    <button onClick={onHome} aria-label="Back to home">Home</button>
  </section>;
}
