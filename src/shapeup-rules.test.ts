import assert from 'node:assert/strict';
import { shapeVerdict } from './shapeup-rules.ts';
assert.deepEqual(shapeVerdict(100, 4, false), { quality: 0, streak: 0, points: 0 });
assert.deepEqual(shapeVerdict(80, 2, true), { quality: 80, streak: 3, points: 100 });
assert.deepEqual(shapeVerdict(59, 8, true), { quality: 59, streak: 0, points: 59 });
assert.equal(shapeVerdict(100, 30, true).points, 150);
const first = shapeVerdict(90, 1, true), second = shapeVerdict(40, 0, true);
assert.equal(first.points, 100); assert.equal(second.points, 40);
console.log('Shape Up: independent streaks, missing-player guard, score and bonus cap pass.');
