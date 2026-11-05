import {useEffect,useState} from 'react';
import './performance-panel.css';
import {pace,qualitySettings,setQualityMode} from './pace.ts';
import type {QualityMode} from './render-quality.ts';
import {trackerDiagnostics,track,perf} from './pose.ts';
export function PerformancePanel(){
 const [mode,setMode]=useState(qualitySettings.mode),[stats,setStats]=useState(()=>trackerDiagnostics());
 useEffect(()=>{const timer=setInterval(()=>setStats(trackerDiagnostics()),1000);return()=>clearInterval(timer);},[]);
 const download=()=>{const snapshot={version:1,at:new Date().toISOString(),browser:navigator.userAgent,screen:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},quality:{requested:qualitySettings.mode,active:pace.profile,grade:pace.grade,pixelRatio:pace.pixelRatio,renderSize:[pace.renderWidth,pace.renderHeight],shadows:pace.shadows,bloom:pace.bloom,downgrades:pace.downgrades},frames:pace.lastRound,tracker:trackerDiagnostics(),timing:{trackerFps:perf.fps,cameraFps:track.camFps,modelMs:track.modelMs,copyMs:track.grabMs,lagMs:track.lag}};
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=`moon-performance-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className="performance-settings" aria-label="Performance settings"><h2>Performance</h2><p className="dim">Auto adjusts the graphics budget. Performance reduces shadows and effects for smoother play. Changes apply to your next round.</p><div className="row"><label htmlFor="moon-graphics-profile">Graphics</label><select id="moon-graphics-profile" value={mode} onChange={e=>{const next=e.target.value as QualityMode;setQualityMode(next);setMode(next);}}><option value="auto">Auto · recommended</option><option value="quality">Quality</option><option value="performance">Performance</option></select></div><p className="dim num">Tracker: {stats.status} · {stats.route} · {stats.actualModel || 'starting'} · recoveries {stats.recoveries}</p><p className="dim">After playing, export a performance snapshot. It contains timings and device details; camera images and body landmarks are excluded.</p><button onClick={download}>Export performance snapshot</button></section>;
}
