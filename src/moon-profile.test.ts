import assert from 'node:assert/strict';
import { CREW, crewOf, updateIdentity } from './moon-profile.ts';
const original={profiles:['Player 1','Player 2'],sessions:[{who:'Player 1',game:'slice',t:1,score:12,points:2}]};
assert.equal(CREW.length,6);
assert.equal(crewOf('missing').id,'moodi');
let result=updateIdentity(original,'Player 1','  J   Moon  ','ren');
assert.equal(result.ok,true);
if(result.ok){assert.equal(result.name,'J Moon');assert.equal(result.db.profiles[0],'J Moon');assert.equal(result.db.sessions[0].who,'J Moon');assert.equal(result.db.avatars?.['J Moon'],'ren');assert.equal(original.sessions[0].who,'Player 1');}
result=updateIdentity(original,'Player 1','player 2','nova');assert.equal(result.ok,false,'case-insensitive duplicate name does not merge histories');
result=updateIdentity(original,'Player 1','','moodi');assert.equal(result.ok,true);if(result.ok){assert.equal(result.name,'Player 1');assert.equal(result.db.avatars?.['Player 1'],'moodi');}
assert.equal(updateIdentity(original,'Unknown','X','nova').ok,false);
assert.equal(updateIdentity(original,'Player 1','X'.repeat(25),'nova').ok,false);
console.log('MOON identity: six crew choices, normalization, duplicate protection, immutable history migration and guest defaults pass.');
