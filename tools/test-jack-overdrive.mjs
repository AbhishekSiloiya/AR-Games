const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/jack-overdrive';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'jacks',variant:'',stage,score:300,points:0,stars:3,xp:0}))}));// This landmark fixture intentionally terminates inference workers. Use copied frames so an abandoned direct stream cannot retain VideoFrames.
Object.defineProperty(globalThis,'MediaStreamTrackProcessor',{value:undefined,configurable:true});Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
// Static deployments have no optional /report collector; stub only that endpoint.
await page.route('**/report',route=>route.fulfill({status:204,body:''}));
await page.goto(process.env.AR_GAME_TEST_URL || 'http://127.0.0.1:5180/');
await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/start-desktop.png'});
for(const width of [320,375,414,768]){await page.setViewportSize({width,height:900});await page.screenshot({path:out+`/start-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
await page.setViewportSize({width:1440,height:900});
await page.getByRole('button',{name:'Start',exact:true}).click();
await page.getByRole('button',{name:/Tracking/}).waitFor({timeout:60000});await page.waitForFunction(()=>window.__romp.track.frames==='copied',null,{timeout:60000});
await page.evaluate(async()=>{
 window.__testWorkers.forEach(w=>w.terminate());
 document.querySelector('video').requestVideoFrameCallback=()=>0;
 const pose=window.__romp;window.__testPose=pose;window.__testMode='neutral';
 window.__neutral=()=>{
 const b=Array.from({length:33},()=>[.5,.5,1]);
 for(const [j,x,y] of [[0,.5,.15],[11,.42,.3],[12,.58,.3],[13,.35,.4],[14,.65,.4],[15,.3,.5],[16,.7,.5],[23,.44,.55],[24,.56,.55],[25,.44,.72],[26,.56,.72],[27,.44,.9],[28,.56,.9]])b[j]=[x,y,1];return b;};
 window.__injectPose=()=>{try {window.__testWorkers.forEach(w=>w.terminate());
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
 if(window.__testMode==='upperOnly')for(const j of [23,24,25,26,27,28])b[j][2]=0;
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance'&&(!window.__danceSeat||window.__danceSeat[i]))pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=window.__matchShape&&i===0&&window.__shapeup?[...window.__shapeup.order[window.__shapeup.index][1]]:pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
 const aspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;
 const sw=Math.abs(bb[11][0]-bb[12][0])*aspect, fx=(bb[11][0]+bb[12][0])/2*aspect, fy=(bb[11][1]+bb[12][1])/2;
 pose.players[i].frame={x:fx,y:fy,sw,aspect};
 pose.players[i].rig=bb.map(q=>[(q[0]*aspect-fx)/sw,(fy-q[1])/sw,q[2],0,0]);
if(window.__sliceTips){const unit=Math.min(9,16/aspect);for(let hand=0;hand<2;hand++){const tip=window.__sliceTips[i*2+hand];if(tip){pose.players[i].rig[15+hand]=[(tip.x/unit+aspect/2-fx)/sw,(tip.y/unit-.5+fy)/sw,1,0,0];pose.players[i].hands[hand].vx=tip.vx??0;pose.players[i].hands[hand].vy=0;}}}
 if(window.__jacks?.bodies[i]){
  const pilot=window.__jacks.bodies[i],r=pose.players[i].rig;
  for(const h of [0,1]){const side=h?1:-1;r[11+h]=[side*.5,0,1];r[13+h]=[side*.6,-.7,1];r[15+h]=[side*.7,-1.4,1];}
  if(!window.__jackIdle?.includes(i)&&(window.__testMode==='aim'||window.__testMode==='held'||window.__testMode==='miss')){
   const target=window.__jacks.invaders.find(v=>v.on&&v.age>=1+v.delay&&v.zone===(window.__pair&&!window.__team?i:0));const h=target&&target.x<pilot.at.x?0:1;
   if(window.__testMode!=='held')window.__aimHand=h;
   const hand=window.__testMode==='held'?(window.__aimHand??1):h,shoulder=pilot.model.findByName('UpperArm.'+(hand?'R':'L')).getPosition(),dx=window.__testMode==='miss'?20:target?target.x-shoulder.x:0,dy=target?target.y-shoulder.y:4,len=Math.hypot(dx,dy),side=hand?1:-1;
   r[13+hand]=[side*.5+dx/len,dy/len,1];r[15+hand]=[side*.5+dx/len*2,dy/len*2,1];
  }
 }


 if(['powerHigh','powerHidden'].includes(window.__testMode)&&!window.__jackIdle?.includes(i)){const r=pose.players[i].rig;for(const h of [0,1]){const side=h?1:-1;r[13+h]=[side*.6,.8,1];r[15+h]=[side*.7,1.6,window.__testMode==='powerHidden'?0:1];}}if(window.__jumpSeat===i){pose.players[i].lift=.45;pose.players[i].liftV=1.8;}
 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:r[2]>.5&&!!document.querySelector('.stage'),t:performance.now()});}
if(window.__jabHands)for(let h=0;h<2;h++){const q=window.__jabHands[i*2+h];if(q)Object.assign(pose.players[i].hands[h],q,{seen:true,t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}};window.__inject=setInterval(window.__injectPose,30);
});


async function mode(v){await page.evaluate(v=>{window.__testMode=v;window.__injectPose();},v);}
async function enter(versus=false){await mode('noHands');await page.getByRole('button',{name:/Jack Attack/}).first().click();await page.locator('.node').first().click();if(versus)await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__jacks?.snapshot().time>0);await page.waitForTimeout(200);}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}
async function stepShot(){return page.evaluate(()=>{window.__testMode='neutral';window.__injectPose();window.__jacks.advance(350);window.__testMode='aim';window.__injectPose();window.__jacks.advance(50);window.__testMode='held';window.__injectPose();window.__jacks.advance(550);return window.__jacks.snapshot();});}
async function charge(){for(let i=0;i<45&&await page.evaluate(()=>window.__jacks.me[0].power.charge<8);i++){await page.evaluate(()=>{if(!window.__jacks.invaders.some(v=>v.on)){window.__testMode='neutral';window.__injectPose();window.__jacks.advance(4500);}else if(window.__jacks.invaders.some(v=>v.on&&v.age<1+v.delay)){window.__testMode='neutral';window.__injectPose();window.__jacks.advance(1800);}});await stepShot();}assert.equal(await page.evaluate(()=>window.__jacks.me[0].power.charge),8,'charge is earned through eight actual normal impacts');}
await enter();await page.waitForFunction(()=>window.__jacks.invaders.some(v=>v.on));let snap=await page.evaluate(()=>window.__jacks.snapshot());assert.equal(snap.drones.filter(v=>v.state!=='breaking').length,6);assert.equal(new Set(snap.drones.map(v=>v.kind)).size,3);assert.ok(snap.drones.some(v=>v.state==='arriving'));await page.screenshot({path:out+'/arrival.png'});await page.waitForFunction(()=>window.__jacks.invaders.every(v=>!v.on||v.age>=1+v.delay));
const model=await page.evaluate(()=>window.__jacks.snapshot());assert.ok(model.players[0].scale>1);assert.equal(model.players[0].gear.length,2);assert.equal(await page.evaluate(()=>!!window.__pc.root.findByName('jack-gauntlet-0-0')),true);await page.screenshot({path:out+'/gauntlets.png'});
const launch=await page.evaluate(()=>{window.__testMode='neutral';window.__injectPose();window.__jacks.advance(350);window.__testMode='aim';window.__injectPose();const hits=window.__jacks.me[0].hits;window.__jacks.advance(1000/60);const state=window.__jacks.snapshot(),pulse=state.projectiles.find(p=>p.player===0),gear=state.players[0].gear;return {hits,current:state.players[0].hits,pulse,gear};});assert.ok(launch.pulse,'shot is a real travelling projectile');assert.equal(launch.current,launch.hits,'score does not change at launch');assert.ok(launch.gear.some(g=>Math.hypot(g.muzzle[0]-launch.pulse.x,g.muzzle[1]-launch.pulse.y)<.25),'pulse begins at a visible gauntlet muzzle');await page.screenshot({path:out+'/pulse-in-flight.png'});await page.waitForFunction(h=>window.__jacks.me[0].hits>h,launch.hits);await page.screenshot({path:out+'/real-destruction.png'});
await mode('held');const reps=await page.evaluate(()=>window.__jacks.me[0].reps);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__jacks.me[0].reps),reps);
await charge();await mode('neutral');await page.waitForTimeout(250);await mode('powerHigh');await page.waitForTimeout(300);await mode('powerHidden');await page.waitForTimeout(350);await mode('powerHigh');await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__jacks.me[0].power.serial),0,'unobserved wrists break a partial high-hands hold');await mode('neutral');await page.waitForTimeout(250);await page.screenshot({path:out+'/starfall-ready.png'});await mode('stale');await page.waitForTimeout(250);await page.evaluate(()=>{window.__jumpSeat=0;window.__injectPose();window.__jacks.advance(50);});assert.equal(await page.evaluate(()=>window.__jacks.me[0].power.serial),0,'stale tracking cannot launch an earned power');await page.evaluate(()=>window.__jumpSeat=undefined);await mode('neutral');await page.waitForTimeout(300);await page.evaluate(()=>{window.__jumpSeat=0;window.__injectPose();});await page.waitForFunction(()=>window.__jacks.me[0].power.serial===1);await page.evaluate(()=>window.__jumpSeat=undefined);await page.waitForFunction(()=>window.__jacks.me[0].powerShots>=8);const power=await page.evaluate(()=>window.__jacks.snapshot());assert.equal(power.players[0].power.charge,0);assert.ok(power.projectiles.some(p=>p.power));await page.screenshot({path:out+'/starfall-barrage.png'});
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__jacks.snapshot());await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>window.__jacks.snapshot()),paused,'barrage and projectile positions freeze on pause');await page.getByRole('button',{name:'Keep playing'}).click();await mode('neutral');await page.waitForTimeout(250);await page.evaluate(()=>window.__jacks.advance(2600));assert.equal(await page.evaluate(()=>window.__jacks.me[0].power.charge),0,'barrage contacts never recharge the ability');
await charge();await mode('neutral');await page.waitForTimeout(250);await mode('powerHigh');await page.waitForFunction(()=>window.__jacks.me[0].power.serial===2);await page.screenshot({path:out+'/no-jump-power.png'});await mode('neutral');await page.evaluate(()=>window.__jacks.advance(3000));for(let attempt=0;attempt<65&&await page.evaluate(()=>window.__jacks.crews[0].wave<3);attempt++){await page.evaluate(()=>{if(!window.__jacks.invaders.some(v=>v.on)){window.__testMode='neutral';window.__injectPose();window.__jacks.advance(3200);}else if(window.__jacks.invaders.some(v=>v.on&&v.age<1+v.delay)){window.__testMode='neutral';window.__injectPose();window.__jacks.advance(1800);}});await stepShot();}assert.equal(await page.evaluate(()=>window.__jacks.crews[0].wave>=3),true,'real shots destroy the eight-hit commander and clear its sector');for(const [width,height]of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.screenshot({path:out+'/layout-'+width+'.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}await home();assert.equal(await page.locator('.jack-hud').count(),0);assert.equal(await page.evaluate(()=>!!window.__jacks),false);
await page.setViewportSize({width:1024,height:768});await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__team=true;window.__jackIdle=[1];});await page.emulateMedia({reducedMotion:'reduce'});await enter();await charge();assert.equal(await page.evaluate(()=>window.__jacks.me[1].power.charge),0,'other player earns no automatic charge');assert.equal(await page.locator('[aria-label="Starfall charge"]').count(),2);assert.equal(await page.evaluate(()=>window.__jacks.snapshot().motion),false);await mode('neutral');await page.waitForTimeout(250);await page.evaluate(()=>{window.__jumpSeat=0;window.__injectPose();});await page.waitForFunction(()=>window.__jacks.me[0].power.serial===1);assert.equal(await page.evaluate(()=>window.__jacks.me[1].power.serial),0);await page.screenshot({path:out+'/paired-independent-power.png'});await page.evaluate(()=>{window.__jumpSeat=undefined;window.__jacks.advance(70000);});await page.locator('.moon-results').waitFor();assert.equal(await page.locator('.jack-hud').count(),0);await page.getByRole('button',{name:'Home',exact:true}).click();await page.evaluate(()=>{window.__team=false;window.__jackIdle=[1];});await enter(true);await charge();await mode('neutral');await page.waitForTimeout(250);await mode('powerHigh');await page.waitForFunction(()=>window.__jacks.me[0].power.serial===1);await page.evaluate(()=>window.__jacks.advance(2400));assert.equal(await page.evaluate(()=>window.__jacks.crews[1].score),0,'rival sector receives no points or damage from player-one barrage');assert.equal(await page.evaluate(()=>window.__jacks.me[1].power.serial),0);for(const [width,height]of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.screenshot({path:out+'/paired-layout-'+width+'.png'});}await home();assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__testError),undefined);console.log('PASS mixed arrivals, larger real pilot/gauntlets, muzzle-origin travel-before-impact, real hits, earned jump and no-jump Starfall, no self-recharge, paused projectiles, paired independent power, reduced motion, layout and teardown');
}catch(e){await page.screenshot({path:out+'/failure.png'});console.error(JSON.stringify(await page.evaluate(()=>({state:window.__jacks?.snapshot(),error:window.__testError})),null,2));throw e;}finally{await browser.close();}
