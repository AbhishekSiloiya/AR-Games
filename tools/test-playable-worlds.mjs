import {jabPunch} from './jab-contact.mjs';
const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/worlds';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
// Static deployments have no optional /report collector; stub only that endpoint.
await page.route('**/report',route=>route.fulfill({status:204,body:''}));
await page.goto(process.env.AR_GAME_TEST_URL || 'http://127.0.0.1:5180/');
await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/start-desktop.png'});
for(const width of [320,375,414,768]){await page.setViewportSize({width,height:900});await page.screenshot({path:out+`/start-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
await page.setViewportSize({width:1440,height:900});
await page.getByRole('button',{name:'Start',exact:true}).click();
await page.getByRole('button',{name:/Tracking/}).waitFor({timeout:60000});
await page.evaluate(async()=>{
 window.__testWorkers.forEach(w=>w.terminate());
 document.querySelector('video').requestVideoFrameCallback=()=>0;
 const pose=window.__romp;window.__testPose=pose;window.__testMode='neutral';
 window.__neutral=()=>{
 const b=Array.from({length:33},()=>[.5,.5,1]);
 for(const [j,x,y] of [[0,.5,.15],[11,.42,.3],[12,.58,.3],[13,.35,.4],[14,.65,.4],[15,.3,.5],[16,.7,.5],[23,.44,.55],[24,.56,.55],[25,.44,.72],[26,.56,.72],[27,.44,.9],[28,.56,.9]])b[j]=[x,y,1];return b;};
 window.__inject=setInterval(()=>{try {window.__testWorkers.forEach(w=>w.terminate());
 const b=window.__neutral();if(window.__testMode==='reach'){b[15]=[.2,.3,1];b[16]=[.8,.3,1];}
 if(window.__testMode==='moving'){for(const j of [11,12,13,14,15,16,23,24,25,26])b[j][0]+=(Math.floor(performance.now()/100)%2)*.08;}
 if(window.__testMode==='squat'){b[11][1]+=.08;b[12][1]+=.08;}
 if(window.__testMode==='noFeet')b[27][2]=b[28][2]=0;
 if(window.__testMode==='relaxed'){for(const q of b)q[0]-=.2;b[13][2]=b[14][2]=.2;b[15][2]=b[16][2]=.4;}
 if(window.__testMode==='noHead')b[0][2]=0;
 if(window.__testMode==='kneeL')b[25][1]=.58;
 if(window.__testMode==='kneeR')b[26][1]=.58;
 if(window.__testMode==='run'){const j=Math.floor(performance.now()/230)%2;b[25+j][1]=.58;}
 if(window.__testMode==='pump'){const side=Math.floor(performance.now()/240)%2;b[15+side][1]=.35;}
 if(window.__testMode==='armUp'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];}
 if(window.__testMode==='jack'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];b[27]=[.25,.88,1];b[28]=[.75,.88,1];}
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance')pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=window.__matchShape&&i===0&&window.__shapeup?[...window.__shapeup.order[window.__shapeup.index][1]]:pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
 const aspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;
 const sw=Math.abs(bb[11][0]-bb[12][0])*aspect, fx=(bb[11][0]+bb[12][0])/2*aspect, fy=(bb[11][1]+bb[12][1])/2;
 pose.players[i].frame={x:fx,y:fy,sw,aspect};
 pose.players[i].rig=bb.map(q=>[(q[0]*aspect-fx)/sw,(fy-q[1])/sw,q[2],0,0]);
 if(window.__testMode==='aim'&&window.__jacks?.bodies[i]){const r=pose.players[i].rig,pilot=window.__jacks.bodies[i],target=window.__jacks.invaders.find(v=>v.on&&v.zone===(window.__pair?i:0));if(target){const h=target.x<pilot.at.x?0:1,shoulder=pilot.model.findByName('UpperArm.'+(h?'R':'L')).getPosition(),dx=target.x-shoulder.x,dy=target.y-shoulder.y,len=Math.hypot(dx,dy),side=h?1:-1;r[11+h]=[side*.5,0,1];r[13+h]=[side*.5+dx/len,dy/len,1];r[15+h]=[side*.5+dx/len*2,dy/len*2,1];}}


 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:r[2]>.5&&!!document.querySelector('.stage'),t:performance.now()});}
if(window.__jabHands)for(let h=0;h<2;h++){const q=window.__jabHands[i*2+h];if(q)Object.assign(pose.players[i].hands[h],q,{seen:true,t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}},30);
});

async function mode(v){await page.evaluate(v=>window.__testMode=v,v);}
async function enter(name,entity){
 await mode('noHands');console.log('VISUAL',name);
 await page.getByRole('button',{name:new RegExp(name)}).first().click();
 if(name==='Jack Attack'&&await page.evaluate(()=>!!window.__versus))await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();
 if(['Goalie','Jab'].includes(name)){await page.getByRole('button',{name:'Game settings',exact:true}).click();await page.getByRole('checkbox',{name:/Practice first/}).setChecked(false);await page.getByRole('button',{name:'Close game settings',exact:true}).click();}
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await mode(name==='Jack Attack'?'noFeet':'neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();
 if(entity.startsWith('.'))await page.locator(entity).first().waitFor();else await page.waitForFunction(name=>!!window.__pc?.root.findByName(name),entity,{timeout:30000});
 await page.waitForTimeout(4500);
 if(!entity.startsWith('.'))assert.equal(await page.evaluate(name=>window.__pc.root.findByName(name).enabled,entity),true);
}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}





assert.equal(await page.locator('.moon-poster').count(),6);
assert.ok((await page.locator('.moon-posters').boundingBox()).y<300,'compact header brings games into view');
await page.getByRole('button',{name:'Choose player 1: Player 1',exact:true}).click();await page.getByRole('dialog').waitFor();
assert.equal(await page.locator('.moon-crew-grid button').count(),6);await page.getByRole('button',{name:'Fuzzbyte',exact:true}).click();await page.getByLabel('Your nickname').fill('J');await page.screenshot({path:out+'/identity-desktop.png'});await page.getByRole('button',{name:'Let’s play ↗',exact:true}).click();
assert.equal(await page.getByRole('dialog').count(),0);assert.ok(await page.getByRole('button',{name:'Choose player 1: J',exact:true}).count());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('romp.v1')).avatars.J),'fuzzbyte');
await page.getByRole('button',{name:'Choose player 1: J',exact:true}).click();await page.getByLabel('Your nickname').fill('Player 2');await page.getByRole('button',{name:'Let’s play ↗',exact:true}).click();await page.getByRole('alert').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
for(const width of [1440,1024,768,414,375,320]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);await page.screenshot({path:out+`/home-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
await page.getByRole('button',{name:'Choose player 1: J',exact:true}).click();await page.screenshot({path:out+'/identity-mobile.png'});await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:900});
for(const name of ['Freeze','Jack Attack','Goalie','Jab','Shape Up','Slice']){
 await enter(name,'.stage');await page.waitForTimeout(800);await page.screenshot({path:out+'/'+name.replaceAll(' ','-')+'-actual.png'});
 assert.equal(await page.locator('.stage img').evaluateAll(es=>es.filter(e=>!e.hidden).every(e=>e.complete&&e.naturalWidth>0)),true,'actual game sprites loaded');
 if(name==='Freeze'){
  assert.match(await page.locator('.freeze-studio-partner').textContent(),/RIZZQUAKE/);await page.waitForFunction(()=>window.__freeze?.studio);assert.match(await page.evaluate(async()=> (await import('/src/audio.ts')).music.diagnostics.theme),/dance/);
  await mode('dance');await page.waitForFunction(()=>!window.__freeze.dancing,null,{timeout:15000});await mode('neutral');const held=await page.evaluate(()=>window.__freeze.party.visualTime);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__freeze.party.visualTime),held);await page.screenshot({path:out+'/Freeze-stop.png'});await page.waitForFunction(()=>window.__freeze.studio.seats[0].locked,null,{timeout:15000});assert.equal(await page.locator('.freeze-studio-seat').first().getAttribute('data-locked'),'true');await page.screenshot({path:out+'/Freeze-earned-cheer.png'});
 }
 if(name==='Jack Attack'){
  await page.waitForFunction(()=>window.__jacks?.bodies[0].model);const arm=await page.evaluate(()=>window.__jacks.bodies[0].state().bones);await mode('armUp');await page.waitForTimeout(120);assert.notDeepEqual(await page.evaluate(()=>window.__jacks.bodies[0].state().bones),arm,'tracked arms articulate the skinned character');await mode('neutral');
  for(let k=0;k<18;k++){await mode('neutral');await page.waitForTimeout(230);await mode('aim');await page.waitForTimeout(280);}
  assert.ok(await page.evaluate(()=>window.__jacks.me[0].hits>0));assert.ok(await page.evaluate(()=>window.__jacks.crews[0].score>0));await page.screenshot({path:out+'/Jack-Attack-earned-hits.png'});
 }
 if(name==='Jab'){for(let k=0;k<4;k++)await jabPunch(page);assert.equal(await page.evaluate(()=>window.__jab.states[0].completed),1);await page.screenshot({path:out+'/Jab-combination.png'});await page.evaluate(()=>window.__jabHands=[]);}
 if(name==='Goalie'){
  await page.waitForFunction(()=>['windup','flight'].includes(window.__goalie.states[0].phase));
  const before=await page.evaluate(()=>window.__goalie.states[0].score);
  await page.evaluate(()=>{const s=window.__goalie.states[0];window.__jabHands=[{x:s.tx/5.1,y:(s.ty-.1)/2.8,vx:0,vy:0},{x:1,y:-1,vx:0,vy:0}];});
  await page.waitForFunction(before=>window.__goalie.states[0].score>before,before);await page.screenshot({path:out+'/Goalie-real-save.png'});
  const score=await page.evaluate(()=>window.__goalie.states[0].score);await page.evaluate(()=>{window.__jabHands=[{x:-1,y:-1,vx:0,vy:0},{x:1,y:-1,vx:0,vy:0}];});await page.waitForFunction(()=>window.__goalie.states[0].phase==='miss');assert.equal(await page.evaluate(()=>window.__goalie.states[0].score),score,'off-target gloves never earn a save');await page.evaluate(()=>window.__jabHands=[]);
 }
 if(name==='Shape Up'){
  await page.evaluate(()=>window.__matchShape=true);await page.waitForFunction(()=>Number(document.querySelector('.shapeup-world').dataset.cells)>0,null,{timeout:15000});await page.screenshot({path:out+'/Shape-Up-earned-cell.png'});await page.evaluate(()=>window.__matchShape=false);
 }
 if(name==='Slice'){
  await page.evaluate(()=>{const s=window.__slice,pl=window.__romp.players[0],h=pl.hands[0];h.vx=12;h.vy=0;const aspect=pl.frame.aspect,unit=Math.min(9,16/aspect),r=pl.rig[15],x=(pl.frame.x-aspect/2+r[0]*pl.frame.sw)*unit,y=(.5-pl.frame.y+r[1]*pl.frame.sw)*unit;for(const pc of s.pieces.filter(q=>q.kind==='fruit').slice(0,5)){pc.state='whole';pc.zone=0;pc.x=x;pc.y=y;pc.vx=0;pc.vy=0;}});await page.waitForFunction(()=>window.__slice.state.cut[0]>=3);await page.screenshot({path:out+'/Slice-real-cut.png'});
 }
 await home();assert.equal(await page.locator('.stage,.galaxy-backdrop,.freeze-party,.moon-sport,.shapeup-world').count(),0,'round layers cleaned up');
}
await page.setViewportSize({width:1024,height:768});await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__versus=true;});
for(const name of ['Jack Attack','Goalie','Jab','Shape Up','Freeze','Slice']){
 await enter(name,'.stage');assert.equal(await page.evaluate(()=>window.__romp.players.every(p=>p.present)),true);await page.screenshot({path:out+'/'+name.replaceAll(' ','-')+'-two-tablet.png'});
 if(name==='Jack Attack'){
  await page.waitForFunction(()=>window.__jacks.invaders.filter(v=>v.on).length>=2);
  assert.equal(await page.evaluate(()=>window.__jacks.crews.length),2);assert.equal(await page.evaluate(()=>window.__jacks.bodies.length),2);await page.screenshot({path:out+'/Jack-rival-sectors.png'});
 }
 if(name==='Shape Up'){
  await page.setViewportSize({width:640,height:800});const portals=await page.locator('.shapeup-world').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width})));assert.ok(portals[1].x>portals[0].x+portals[0].w,'mobile two-player towers stay in their own seats');await page.screenshot({path:out+'/Shape-Up-two-small.png'});await page.setViewportSize({width:1024,height:768});
 }
 await home();
}
await page.reload();await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Choose player 1: J',exact:true}).waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('romp.v1')).avatars.J),'fuzzbyte');
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['compact hub','six identity choices','name/duplicate/save/reload','responsive hub/picker','all six actual scenes and sprites','Freeze music/visual stop and earned cheer','Jack arm shots and actual kills','independent rival sectors','Goalie continuous glove save and off-target rejection','Jab earned combination','Shape earned portal cell','Slice actual cuts','all six two-player tablet layouts','mobile independent pose portals','round cleanup'],errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(JSON.stringify({error:String(error),errors,state:await page.evaluate(()=>window.render_game_to_text?.())},null,2));throw error;}finally{await browser.close();}
