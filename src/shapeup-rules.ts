// Independent scoring for a shared sequence; an absent player cannot bank a pose.
export function shapeVerdict(best: number, streak: number, present: boolean) {
  const quality = present && Number.isFinite(best) ? Math.round(Math.max(0, Math.min(100, best))) : 0;
  const nextStreak = quality >= 60 ? streak + 1 : 0;
  return { quality, streak: nextStreak, points: quality + (nextStreak ? Math.min(nextStreak - 1, 5) * 10 : 0) };
}
