// Formations and rewards are shared with the visual telemetry; presentation never awards points.
export function galaxyWave(wave: number, n: number, team: boolean) {
  const boss = wave % 3 === 2;
  return { boss, cols: team ? 8 : n === 2 ? 4 : 6, rows: boss ? 2 : Math.min(4, 2 + Math.floor(wave / 2)) };
}
export function damageDrone(hp: number, boss: boolean) {
  const next = Math.max(0, hp - 1), destroyed = hp > 0 && next === 0;
  return { hp: next, destroyed, points: destroyed ? boss ? 10 : 1 : 0 };
}
