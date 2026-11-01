import assert from 'node:assert/strict';
import { poseBuild } from './pose-build.ts';
assert.deepEqual(poseBuild([-1,-1,-1]),{cells:0,stars:0,energy:0,complete:false});
assert.deepEqual(poseBuild([3,0,2,-1,-1,-1,-1,-1]),{cells:2,stars:5,energy:.25,complete:false});
assert.equal(poseBuild(Array(8).fill(1)).complete,true);
assert.equal(poseBuild([3,0,0,0,0,0,0,0]).cells,1,'stars are not confused with completed cells');
console.log('Pose portal: only earned matches build cells; star totals and completed portal are distinct.');
