import type {QualityMode} from './render-quality.ts';
// The few things the menus and the renderer both need, kept apart so the menus never import the renderer.
export const PLAYER_COLORS = ['#818cf8', '#34d399'];

// Decorative effects preference is independent of the measured rendering budget.
export const effects = { on: (() => { try { return localStorage.getItem('romp.fx') !== 'off'; } catch { return true; } })() };

// Frame pacing, measured where it matters — on the device, during a real round. Read out by the shell after each game.
// `lean`: the shared budget disabled heavy effects/shadows and reduced resolution.
const storedMode=()=>{try{return localStorage.getItem('moon.performance');}catch{return null;}};
const saved=storedMode();
export const qualitySettings={mode:(saved==='quality'||saved==='performance'?saved:'auto') as QualityMode};
export function setQualityMode(mode:QualityMode){qualitySettings.mode=mode;try{localStorage.setItem('moon.performance',mode);}catch{/* Session preference still works when storage is unavailable. */}}
export const pace = {dts:[] as number[],shaders:0,late:0,lean:false,grade:0,downgrades:0,profile:'auto' as QualityMode,game:'',stage:0,renderWidth:0,renderHeight:0,pixelRatio:1,shadows:true,bloom:true,lastRound:null as Record<string,unknown>|null};
export function paceSummary() {
  const d = [...pace.dts].sort((a, b) => a - b), at = (q: number) => +(d[Math.floor((d.length - 1) * q)] ?? 0).toFixed(1);
  const out = { frames: d.length, p50: at(0.5), p95: at(0.95), p99: at(0.99), worst: at(1), over34ms: d.filter((v) => v > 34).length, shadersBuiltMidRound: pace.late, lean: pace.lean, renderer: 'playcanvas' };
  pace.lastRound={...out,game:pace.game,stage:pace.stage,quality:{profile:pace.profile,grade:pace.grade,pixelRatio:pace.pixelRatio,renderSize:[pace.renderWidth,pace.renderHeight],shadows:pace.shadows,bloom:pace.bloom}};
  pace.dts = [];
  return out;
}
