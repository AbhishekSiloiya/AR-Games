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
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'slice',variant:'',stage,score:300,points:0,stars:3,xp:0}))}));Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
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
if(window.__sliceTips){const unit=Math.min(9,16/aspect);for(let hand=0;hand<2;hand++){const tip=window.__sliceTips[i*2+hand];if(tip){pose.players[i].rig[15+hand]=[(tip.x/unit+aspect/2-fx)/sw,(tip.y/unit-.5+fy)/sw,1,0,0];pose.players[i].hands[hand].vx=tip.vx??0;pose.players[i].hands[hand].vy=0;}}}
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

async function enterSlice(modeName='Arcade',court=false,versus=false){await mode('noHands');await page.getByRole('button',{name:/Slice/}).first().click();await page.locator('.node').first().click();await page.getByRole('button',{name:modeName,exact:true}).click();if(versus)await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();if(court)await page.getByRole('button',{name:'Orchard court + hand trails',exact:true}).click();await mode('neutral');await page.evaluate(()=>window.__sliceTips=[{x:-3,y:0},{x:5,y:-3},{x:3,y:0},{x:6,y:-3}]);await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__slice?.snapshot().time>0);await page.evaluate(()=>window.__slice.state.spawnIn.fill(9999));}
async function plant(kind='fruit',count=3,zone=0,x=0){await page.evaluate(({kind,count,zone,x})=>{const pcs=window.__slice.pieces;pcs.forEach(pc=>pc.state='off');for(const [i,pc] of pcs.filter(pc=>pc.kind===kind).slice(0,count).entries())Object.assign(pc,{state:'whole',zone,x:x+i*.35,y:window.__slice.snapshot().arena.source==='orchard'?window.__slice.snapshot().hands[0].y:0,vx:0,vy:0,age:0,power:'double'});},{kind,count,zone,x});}
async function swipe(p=0){await page.evaluate(p=>{window.__sliceTips[p*2]={x:-3,y:0,vx:0};window.__injectPose();},p);await page.waitForTimeout(170);await page.evaluate(p=>{window.__sliceTips[p*2]={x:3,y:0,vx:8};window.__injectPose();},p);await page.waitForTimeout(100);await page.evaluate(p=>{window.__sliceTips[p*2].vx=0;},p);}
await enterSlice();assert.equal(await page.evaluate(()=>window.__slice.snapshot().arena.source),'live-camera');assert.equal(await page.evaluate(()=>window.__pc.root.findByName('slice-natural-camera').render.meshInstances[0].material.getParameter('uNatural').data),1);assert.equal(await page.locator('.mascot-puppet,.moon-slice__juice').count(),0);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__slice.actor.state().visible),false,'coach only appears for intro or earned reaction');
await plant();await swipe();await page.waitForFunction(()=>window.__slice.state.cut[0]>=3);await page.screenshot({path:out+'/live-cut-halves.png'});assert.equal(await page.evaluate(()=>window.__slice.pieces.filter(p=>p.state==='cut').every(p=>p.halves.length===2&&p.halves.every(h=>h.obj.enabled))),true);await page.waitForFunction(()=>window.__slice.state.bestSlash[0]>=3);assert.ok(await page.evaluate(()=>window.__slice.snapshot().feedback.coach.visible));const skin=()=>page.evaluate(()=>window.__slice.actor.model.findComponents('render').flatMap(r=>r.meshInstances).filter(mi=>mi.skinInstance).map(mi=>Array.from(mi.skinInstance.matrixPalette)));const palette=await skin();await page.waitForTimeout(160);assert.notDeepEqual(await skin(),palette,'earned cheer deforms real skin');await page.screenshot({path:out+'/earned-combo.png'});const cuts=await page.evaluate(()=>window.__slice.state.cut[0]);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__slice.state.cut[0]),cuts,'halves cannot score again');
await page.waitForTimeout(500);await page.evaluate(()=>{window.__sliceTips[0]={x:0,y:0,vx:0};});await page.waitForTimeout(300);const restBefore=await page.evaluate(()=>window.__slice.state.cut[0]);await plant('fruit',1);await page.waitForTimeout(140);assert.equal(await page.evaluate(()=>window.__slice.state.cut[0]),restBefore,'resting hand cannot cut');
await plant('bomb',1);const before=await page.evaluate(()=>window.__slice.state.scores[0]);await swipe();assert.ok(await page.evaluate(b=>window.__slice.state.scores[0]<=Math.max(0,b-5),before));assert.equal(await page.evaluate(()=>window.__slice.state.combo[0]),0);
await plant('power',1);await swipe();await page.waitForFunction(()=>window.__slice.state.power.double[0]>0);await page.screenshot({path:out+'/power-up.png'});
await page.evaluate(()=>window.__sliceTips[0]={x:-3,y:0,vx:0});await page.waitForTimeout(300);await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__slice.snapshot());await page.waitForTimeout(200);assert.deepEqual(await page.evaluate(()=>window.__slice.snapshot()),paused);await page.evaluate(()=>{window.__sliceTips[0]={x:3,y:0,vx:0};});await page.waitForTimeout(100);await plant('fruit',1,0,2.7);const cutBefore=await page.evaluate(()=>window.__slice.state.cut[0]);await page.getByRole('button',{name:'Keep playing'}).click();await page.waitForTimeout(220);assert.equal(await page.evaluate(()=>window.__slice.state.cut[0]),cutBefore,'pause movement is not a swipe');
await mode('stale');await page.waitForTimeout(230);await plant('fruit',1);await swipe();assert.equal(await page.evaluate(()=>window.__slice.state.cut[0]),cutBefore,'stale tracking cannot cut');await mode('neutral');await page.waitForTimeout(300);
for(const [width,height] of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.screenshot({path:out+`/layout-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}await page.evaluate(()=>window.__slice.advance(70000));await page.getByRole('button',{name:'Play again',exact:true}).waitFor();await page.getByRole('button',{name:'Home',exact:true}).click();assert.equal(await page.evaluate(()=>window.__pc.root.findByName('slice-rizzquake')),null);
await enterSlice('Zen',true);assert.equal(await page.evaluate(()=>window.__slice.snapshot().arena.source),'orchard');await page.screenshot({path:out+'/orchard-zen.png'});await page.evaluate(()=>{window.__slice.state.spawnIn.fill(0);window.__slice.advance(12000);});assert.equal(await page.evaluate(()=>window.__slice.pieces.some(p=>p.kind==='bomb'&&p.state==='whole')),false);await home();
await enterSlice('Classic',true);assert.equal(await page.evaluate(()=>window.__slice.state.lives),3);await plant('bomb',1);await swipe();assert.equal(await page.evaluate(()=>window.__slice.state.lives),2);await home();
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});await enterSlice();await plant('fruit',3,0,-.3);await swipe();await page.waitForFunction(()=>window.__slice.state.cut[0]>=3);await page.screenshot({path:out+'/two-player.png'});await home();await enterSlice('Arcade',false,true);const panels=await page.locator('.slice-flow').all();assert.ok((await panels[0].boundingBox()).x<(await panels[1].boundingBox()).x,'player flow panels follow left/right lane ownership');await plant('fruit',1,1);await swipe(0);assert.equal(await page.evaluate(()=>window.__slice.state.cut[0]),0,'wrong player cannot cut rival fruit');await plant('fruit',1,1);await swipe(1);await page.waitForFunction(()=>window.__slice.state.cut[1]===1);assert.equal(await page.evaluate(()=>window.__slice.state.scores[0]),0);await page.screenshot({path:out+'/rival-cut.png'});await home();assert.equal(await page.locator('.moon-slice').count(),0);assert.deepEqual(errors,[]);console.log('PASS Slice natural camera, actual skinned reward/halves/cuts, passive/stale/pause rejection, combos/powers/bombs, modes/results, paired layout and cleanup');
}catch(e){await page.screenshot({path:out+'/failure.png'});console.error(await page.evaluate(()=>({state:window.__slice?.snapshot(),errors:window.__testError})));throw e;}finally{await browser.close();}
