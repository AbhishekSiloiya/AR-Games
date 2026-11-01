import { toScreen, type Scene } from './engine.ts';
import { effects, pace } from './pace.ts';
import './galaxy-stage.css';
const setText = (e: Element, text: string) => { if (e.textContent !== text) e.textContent = text; };
export type GalaxyCrew = { wave: number; shields: number; rest: number; cleared: number; bossHp?: number };
export function galaxyStage(scene: Scene, n: number, team: boolean) {
  const stage = document.querySelector<HTMLElement>('.stage');
  stage?.classList.add('moon-galaxy-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const background = document.createElement('div'); background.className = 'galaxy-backdrop'; background.setAttribute('aria-hidden', 'true');
  background.innerHTML = '<div class="galaxy-nebula"></div><div class="galaxy-haze"></div><div class="galaxy-planet"></div><div class="galaxy-horizon"></div>';
  const nebula = background.querySelector<HTMLElement>('.galaxy-nebula')!, planet = background.querySelector<HTMLElement>('.galaxy-planet')!;
  const image = new Image(); image.src = '/assets/moon/play/galaxy.webp'; let gone = false;
  image.onload = () => { if (!gone) { nebula.style.backgroundImage = `url("${image.src}")`; background.dataset.loaded = 'true'; } };
  // No failed-load loop: the original gradient/stars remain playable if the artwork cannot load.
  const stars = Array.from({ length: 44 }, (_, i) => { const el = document.createElement('i'); el.className = 'galaxy-star'; el.style.left = `${(i * 47.7) % 100}%`; el.style.width = el.style.height = `${i % 5 === 0 ? 3 : 1}px`; background.append(el); return el; });
  stage?.prepend(background);
  const root = document.createElement('div'); root.className = 'galaxy-interface'; root.dataset.players = String(n); root.dataset.team = String(team);
  root.innerHTML = '<div class="galaxy-title"><small>JACK ATTACK</small><strong>NEBULA DEFENCE</strong></div><div class="galaxy-mission" role="status" aria-live="polite">LOWER ARMS. THEN RAISE TO FIRE.</div>';
  const mission = root.querySelector<HTMLElement>('.galaxy-mission')!;
  const bosses = Array.from({length:team?1:n},(_,i)=>{const el=document.createElement('div');el.className='galaxy-boss';el.dataset.player=String(i);el.hidden=true;el.innerHTML=`<span>${!team&&n>1?`PILOT ${i+1} / `:''}ECLIPSE COMMANDER</span><div><i></i></div>`;root.append(el);return {el,hp:el.querySelector<HTMLElement>('i')!};});
  const seats = Array.from({ length: team ? 1 : n }, (_, i) => { const el = document.createElement('div'); el.className = 'galaxy-sector'; el.dataset.player = String(i); el.innerHTML = '<small></small><strong></strong><span></span>'; root.append(el); return { el, label: el.querySelector('small')!, value: el.querySelector('strong')!, shields: el.querySelector('span')! }; });
  const sparks = Array.from({ length: 12 }, () => { const el = document.createElement('i'); el.className = 'galaxy-impact'; el.hidden = true; root.append(el); return { el, x: 0, y: 0, life: 0, duration: .6 }; });
  let impactIndex = 0, event = '', eventUntil = 0;
  stage?.append(root);
  scene.cleanup(() => { gone = true; image.onload = null; image.onerror = null; root.remove(); background.remove(); stage?.classList.remove('moon-galaxy-stage'); });
  return {
    cue(text: string, t: number, seconds = 1.8) { event = text; eventUntil = t + seconds; },
    impact(x: number, y: number, kind: 'hit' | 'destroy' | 'boss' | 'breach') {
      const at = toScreen(x, y, 1); if (!at) return;
      const bit = sparks[impactIndex++ % sparks.length]; bit.x = at[0] * 100; bit.y = at[1] * 100; bit.life = bit.duration = kind === 'boss' ? 1.15 : kind === 'destroy' ? .65 : .35; bit.el.dataset.kind = kind;
    },
    update(dt: number, t: number, crews: GalaxyCrew[], active: number) {
      const motion = effects.on && !pace.lean && !reduced;
      root.dataset.motion = String(motion); background.dataset.motion = String(motion);
      nebula.style.transform = motion ? `translate(${Math.sin(t * .065) * 1.2}%,${Math.cos(t * .08) * 1.2}%) scale(1.06)` : 'scale(1.04)';
      planet.style.transform = motion ? `translateY(${Math.sin(t * .15) * 3}px) rotate(${t * .1}deg)` : '';
      stars.forEach((star, i) => { star.style.top = `${((i * 29.3 + (motion ? Math.max(0, t) * (i % 3 + 1) * .45 : 0)) % 105) - 2}%`; });
      const message = t < 0 ? 'LOWER ARMS. THEN RAISE TO FIRE.' : t < eventUntil ? event : active ? 'RAISE TO FIRE / LOWER TO RELOAD' : 'SECTOR CLEAR / CATCH YOUR BREATH';
      setText(mission, message); root.dataset.celebrate = String(t < eventUntil && event.includes('CLEAR'));
      bosses.forEach((boss,i)=>{const hp=crews[i]?.bossHp??0;boss.el.hidden=hp<=0;boss.el.dataset.hp=String(hp);boss.hp.style.transform=`scaleX(${Math.max(0,hp/8)})`;});
      crews.forEach((crew, i) => { const s = seats[i]; if (!s) return; setText(s.label, team ? 'SHARED SECTOR' : n > 1 ? `PILOT ${i + 1}` : 'YOUR SECTOR'); setText(s.value, `WAVE ${crew.wave + 1}`); setText(s.shields, `${'◆'.repeat(crew.shields)}${'◇'.repeat(3 - crew.shields)} SHIELDS`); });
      sparks.forEach(s => { s.life = Math.max(0, s.life - dt); s.el.hidden = s.life <= 0 || !effects.on; if (s.life > 0) { const a = 1 - s.life / s.duration; s.el.style.left = `${s.x}%`; s.el.style.top = `${s.y}%`; s.el.style.opacity = String(Math.min(1, s.life * 5)); s.el.style.transform = `translate(-50%,-50%) scale(${reduced ? 1 : .35 + a * 2}) rotate(${reduced ? 0 : a * 45}deg)`; } });
    },
  };
}
