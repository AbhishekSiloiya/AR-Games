const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/goalie-focus';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'freeze',variant:'studio',stage,score:300,points:0,stars:3,xp:0}))}));Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
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
 if(window.__testMode==='aim'&&window.__jacks){const rig=pose.players[i].rig,at=window.__jacks.bodies[i].at,target=window.__jacks.invaders.find(v=>v.on&&v.zone===0);if(target){const sx=rig[12][0],sy=rig[12][1],dx=target.x-at.x-sx*at.scale,dy=(target.y-at.y-sy*.8*at.scale)/.8,len=Math.hypot(dx,dy);rig[16]=[sx+dx/len*1.9,sy+dy/len*1.9,1,0,0];}}

 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:r[2]>.5&&!!document.querySelector('.stage'),t:performance.now()});}
if(window.__jabHands)for(let h=0;h<2;h++){const q=window.__jabHands[i*2+h];if(q)Object.assign(pose.players[i].hands[h],q,{seen:true,t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}};window.__inject=setInterval(window.__injectPose,30);
});

async function mode(v){await page.evaluate(v=>window.__testMode=v,v);}
async function park(){await page.evaluate(()=>{window.__jabHands=Array.from({length:4},(_,i)=>({x:i%2?1:-1,y:-1,vx:0,vy:0}));window.__injectPose();});}
async function enter(practice=true,reach='comfort',stage=1){await mode('noHands');await page.getByRole('button',{name:/Goalie/}).first().click();await page.locator('.node').nth(stage-1).click();await page.getByRole('button',{name:reach==='comfort'?'Comfortable':'Full stretch',exact:true}).click();await page.getByRole('checkbox',{name:/Practice first/}).setChecked(practice);await page.waitForFunction(stage=>document.querySelector('.keeper-lesson small')?.textContent?.startsWith('STAGE '+stage+' /'),stage);await page.locator('.moon-brief-art>img').first().evaluate(img=>img.decode());await page.waitForTimeout(250);await page.screenshot({path:out+`/briefing-stage-${stage}.png`});await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await park();await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__goalie);await page.waitForTimeout(100);}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}
async function save(p=0,hand=0){await page.waitForFunction(p=>['windup','flight'].includes(window.__goalie.states[p].phase),p);const before=await page.evaluate(p=>({hits:window.__goalie.states[p].saves,lesson:window.__goalie.states[p].practiceSaves,practice:window.__goalie.practicing}),p);await page.evaluate(({p,hand})=>{const s=window.__goalie.states[p],n=window.__goalie.states.length,cx=n===1?0:p===0?-3.35:3.35,gain=n===1?5.1:2.85,vertical=n===1?2.8:2.15;window.__jabHands[p*2+hand]={x:(s.tx-cx)/gain,y:(s.ty-.1)/vertical,vx:0,vy:0};window.__injectPose();},{p,hand});await page.waitForFunction(({p,before})=>before.practice?window.__goalie.states[p].practiceSaves>before.lesson||!window.__goalie.practicing:window.__goalie.states[p].saves>before.hits,{p,before});if(!before.practice)assert.ok(await page.evaluate(p=>window.__goalie.states[p].velocity.z<0,p),'saved ball deflects toward the pitch');}
async function enterFreeze(stage=1){await mode('noHands');await page.getByRole('button',{name:/Freeze/}).first().click();await page.locator('.node').nth(stage-1).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__freeze?.studio);}
await enterFreeze();assert.equal(await page.locator('.freeze-party,.moon-freeze__visor,.moon-sport').count(),0,'legacy puppets/overlays removed only for Freeze');assert.equal(await page.evaluate(()=>window.__freeze.snapshot().character.character),'rizzquake');assert.equal(await page.evaluate(()=>window.__freeze.snapshot().camera.filter),'none');assert.deepEqual(errors,[],'natural camera shader must compile');await page.waitForFunction(()=>window.__freeze.time>0);
const arm=await page.evaluate(()=>window.__freeze.snapshot().character.arm);const skin=()=>page.evaluate(()=>window.__freeze.actor.model.findComponents('render').flatMap(r=>r.meshInstances).filter(m=>m.skinInstance).map(m=>Array.from(m.skinInstance.matrixPalette)));const beforeSkin=await skin();await mode('armUp');await page.waitForTimeout(200);assert.notEqual(await page.evaluate(()=>window.__freeze.snapshot().character.arm),arm);assert.notDeepEqual(await skin(),beforeSkin,'tracked arms deform actual skinned mesh');await mode('dance');await page.waitForFunction(()=>window.__freeze.scores[0]>3);await page.screenshot({path:out+'/dance-studio.png'});
await page.waitForFunction(()=>!window.__freeze.dancing);await mode('neutral');const frozen=await page.evaluate(()=>({visual:window.__freeze.snapshot().visualTime,arm:window.__freeze.snapshot().character.arm}));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>({visual:window.__freeze.snapshot().visualTime,arm:window.__freeze.snapshot().character.arm})),frozen,'floor/disco/character stop with music');await page.waitForFunction(()=>window.__freeze.studio.seats[0].locked);await page.screenshot({path:out+'/earned-lock.png'});assert.equal(await page.evaluate(()=>window.__freeze.studio.seats[0].holds),1);const score=await page.evaluate(()=>window.__freeze.scores[0]);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__freeze.scores[0]),score,'hold pays once');
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__freeze.snapshot());await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>window.__freeze.snapshot()),paused);await page.getByRole('button',{name:'Keep playing'}).click();
for(const [width,height] of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);await page.screenshot({path:out+`/layout-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>window.__freeze.advance(70000));await page.getByRole('button',{name:'Play again',exact:true}).waitFor();assert.match(await page.locator('.freeze-result-notes').textContent(),/Clean holds.*Best chain/);await page.getByRole('button',{name:'Home',exact:true}).click();
await enterFreeze(3);await page.waitForFunction(()=>window.__freeze.time>0);await mode('dance');await page.waitForTimeout(1100);await page.waitForFunction(()=>!window.__freeze.dancing);await mode('neutral');await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>window.__freeze.studio.seats[0].match),false);await mode('armUp');await page.waitForFunction(()=>window.__freeze.studio.seats[0].locked);await page.screenshot({path:out+'/hands-high-lock.png'});await home();
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__danceSeat=[true,true];});await enterFreeze();await page.waitForFunction(()=>window.__freeze.time>0);await mode('dance');await page.waitForFunction(()=>!window.__freeze.dancing);await page.evaluate(()=>window.__danceSeat=[true,false]);await page.waitForFunction(()=>window.__freeze.studio.seats[1].locked);assert.equal(await page.evaluate(()=>window.__freeze.studio.seats[0].holds),0);assert.equal(await page.evaluate(()=>window.__freeze.studio.seats[1].holds),1);await page.screenshot({path:out+'/independent-pair.png'});await home();assert.equal(await page.locator('.freeze-studio').count(),0);assert.equal(await page.evaluate(()=>window.__pc.root.findByName('freeze-rizzquake')),null);assert.deepEqual(errors,[]);console.log('PASS Freeze live unfiltered camera, skinned tracking, dance/stop/lock, later pose match, paused clocks, result metrics, paired isolation/layouts and cleanup');
}catch(e){await page.screenshot({path:out+'/failure.png'});console.error(await page.evaluate(()=>window.__freeze?.snapshot?.()));throw e;}finally{await browser.close();}
