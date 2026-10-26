import assert from 'node:assert/strict';
import { MOON_GAME_IDS, MOON_CATALOG } from './moon-catalog.ts';
import { dailyChallenges, BADGES, badgeCatalog } from './meta.ts';
import type { Session } from './stats.ts';
assert.deepEqual(MOON_GAME_IDS,['slice','goalie','freeze','shapeup','jacks','jab']);
assert.equal(new Set(MOON_GAME_IDS).size,6);
assert.ok(MOON_GAME_IDS.every(id=>MOON_CATALOG[id].steps.length===3));
const names=Object.fromEntries(MOON_GAME_IDS.map(id=>[id,MOON_CATALOG[id].name]));
for(let d=0;d<365;d++)for(const c of dailyChallenges([], 'Player', names, Date.UTC(2026,0,1+d))){
 const game=c.id.match(/:(?:stars|play):(.+)$/)?.[1];
 if(game)assert.ok(MOON_GAME_IDS.includes(game),`unavailable daily challenge: ${game}`);
}
const sessions=MOON_GAME_IDS.map(game=>({game,who:'Player',score:10,points:1,t:0} as Session));
assert.equal(BADGES.find(b=>b.id==='explorer')!.test({all:sessions,who:'Player',games:sessions,now:0}),true);
console.log('MOON catalogue: exactly six games, three-step briefings, playable daily challenges and reachable Explorer badge.');
const mastered=MOON_GAME_IDS.flatMap(game=>Array.from({length:5},(_,i)=>({game,stage:i+1,stars:3,who:'Player',score:9999,points:1,t:0} as Session)));
for(const badge of BADGES.filter(b=>b.id.startsWith('stars')))assert.equal(badge.test({all:mastered,games:mastered,who:'Player',now:0}),true,`${badge.name} must be reachable with six games`);

assert.equal(badgeCatalog([], 'Player').length, BADGES.length-2);
const legacy=[{game:'rocket',who:'Player',score:150,points:1,t:0} as Session];
assert.ok(badgeCatalog(legacy,'Player').some(b=>b.id==='squats'),'earned legacy badges stay visible');
console.log('Curated milestones are attainable; badge totals match visible goals and legacy credit survives.');
