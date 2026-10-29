const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/shape-focus';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'shapeup',variant:'',stage,score:300,points:0,stars:3,xp:0}))}));Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
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
 const imageAspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;const bb=b.map(q=>[...q]);if(window.__shapeup){const target=window.__shapeup.order[window.__shapeup.index][1],stand=[-100,-95,-80,-85,-95,-90,-85,-90].map(a=>a*Math.PI/180);const a=window.__shapeFlags?.[i]?target:stand;bb[11]=[.42,.32,1];bb[12]=[.58,.32,1];bb[23]=[.45,.56,1];bb[24]=[.55,.56,1];const limbs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];for(let k=0;k<8;k++){const [from,to]=limbs[k],len=k<4?.105:k%2?.15:.14;bb[to]=[bb[from][0]+Math.cos(a[k])*len/imageAspect,bb[from][1]-Math.sin(a[k])*len,1];}if(window.__badLimb===i)bb[15][2]=.1;}if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance'&&(!window.__danceSeat||window.__danceSeat[i]))pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*imageAspect));
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
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}
async function enter(stage=1){await mode('noHands');await page.getByRole('button',{name:/Shape Up/}).first().click();await page.locator('.node').nth(stage-1).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__shapeup?.snapshot().time>0);}
await enter();assert.equal(await page.evaluate(()=>window.__shapeup.snapshot().camera.source),'live-camera');assert.equal(await page.locator('.mascot-puppet,.shapeup-tower,.shapeup-world img').count(),0,'no cutout or tower characters');assert.equal(await page.evaluate(()=>window.__pc.root.findByName('shape-rizzquake')!==null),true);const alignment=await page.evaluate(()=>{const g=window.__shapeup.snapshot(),q=window.__testPose.players[0].body[15],marker=window.__pc.root.findByName('shape-joint-0-15').getPosition();const surface=window.__pc.root.findByName('shape-live-camera');return {actual:[marker.x,marker.y],expected:[g.camera.x+(q[0]-.5)*g.camera.width,g.camera.y+(.5-q[1])*g.camera.height]};});assert.ok(alignment.actual.every((v,i)=>Math.abs(v-alignment.expected[i])<.02),'joint hint and actual camera use the same mirrored coordinates');await page.screenshot({path:out+'/live-ready.png'});
await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForFunction(()=>window.__shapeup.seats[0].locked);const earned=await page.evaluate(()=>window.__shapeup.snapshot());assert.equal(earned.seats[0].stars,3);assert.equal(earned.seats[0].score,100);assert.equal(earned.phase,'result');await page.screenshot({path:out+'/earned-match.png'});const initialSkin=await page.evaluate(()=>window.__shapeup.actor.model.findComponents('render').flatMap(r=>r.meshInstances).filter(mi=>mi.skinInstance).map(mi=>Array.from(mi.skinInstance.matrixPalette)));await page.evaluate(()=>window.__shapeFlags=[false,false]);await page.waitForTimeout(550);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].score),100,'relaxing cannot revoke or duplicate a genuine match');await page.waitForFunction(()=>window.__shapeup.phase==='rest');await page.screenshot({path:out+'/reset.png'});await page.waitForFunction(()=>window.__shapeup.index===1);await page.waitForTimeout(150);assert.equal(JSON.stringify(await page.evaluate(()=>window.__shapeup.actor.model.findComponents('render').flatMap(r=>r.meshInstances).filter(mi=>mi.skinInstance).map(mi=>Array.from(mi.skinInstance.matrixPalette))))===JSON.stringify(initialSkin),false,'reference pose changes actual GPU skin');await page.screenshot({path:out+'/target-y.png'});
await page.evaluate(()=>{window.__shapeFlags=[true,false];window.__badLimb=0;});await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].locked),false,'hidden wrist blocks an otherwise perfect angle match');await page.evaluate(()=>window.__badLimb=undefined);await mode('stale');await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].locked),false,'stale source cannot bank a pose');await mode('neutral');await page.evaluate(()=>window.__shapeFlags=[false,false]);await page.waitForTimeout(300);
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__shapeup.snapshot());await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>window.__shapeup.snapshot()),paused);await page.getByRole('button',{name:'Keep playing'}).click();await page.waitForTimeout(220);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].locked),false,'pause time cannot finish a hold');await page.waitForFunction(()=>window.__shapeup.seats[0].locked);await page.evaluate(()=>window.__shapeFlags=[false,false]);
for(const [width,height]of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.screenshot({path:out+'/layout-'+width+'.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
await page.setViewportSize({width:1440,height:900});await home();assert.equal(await page.locator('.shapeup-coach').count(),0);assert.equal(await page.evaluate(()=>window.__pc.root.findByName('shape-rizzquake')),null);
await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__shapeFlags=[false,false];});await enter();await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForFunction(()=>window.__shapeup.seats[0].locked);assert.equal(await page.evaluate(()=>window.__shapeup.seats[1].score),0);assert.equal(await page.locator('.shapeup-coach').getAttribute('data-motion'),'false');assert.equal(await page.locator('.shape-live-status>strong').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.evaluate(()=>window.__shapeup.phase),'match');await page.screenshot({path:out+'/paired-independent.png'});await page.evaluate(()=>window.__shapeFlags=[false,true]);await page.waitForFunction(()=>window.__shapeup.seats[1].locked);assert.equal(await page.evaluate(()=>window.__shapeup.phase),'result');for(const [width,height]of [[1024,768],[640,360]]){await page.setViewportSize({width,height});const panels=await page.locator('.shape-seat').all();const a=await panels[0].boundingBox(),b=await panels[1].boundingBox();assert.ok(a.x+a.width<b.x,'paired cues stay in separate lanes');await page.screenshot({path:out+'/paired-'+width+'.png'});}await home();
await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(async()=>{const {effects}=await import('/src/pace.ts');effects.on=false;});await page.getByRole('button',{name:'Solo',exact:true}).click();await page.evaluate(()=>{window.__pair=false;window.__shapeFlags=[false,false];});await page.setViewportSize({width:1024,height:768});await enter(5);
for(let i=0;i<8;i++){await page.waitForFunction(i=>window.__shapeup?.index===i&&window.__shapeup.phase==='match',i);await page.waitForTimeout(160);const proof=await page.evaluate(()=>{const s=window.__shapeup,m=s.actor.model,names=['UpperArm.L','LowerArm.L','UpperArm.R','LowerArm.R','Thigh.L','Shin.L','Thigh.R','Shin.R'],ends=['LowerArm.L','Hand.L','LowerArm.R','Hand.R','Shin.L','Foot.L','Shin.R','Foot.R'];const actual=names.map((name,k)=>{const a=m.findByName(name).getPosition(),b=m.findByName(ends[k]).getPosition();return Math.atan2(b.y-a.y,b.x-a.x);});return {state:s.snapshot(),actual};});assert.ok(proof.actual.every((a,k)=>Math.abs(Math.atan2(Math.sin(a-proof.state.target[k]),Math.cos(a-proof.state.target[k])))<.06),'visible coach limb directions match the scored reference');fs.writeFileSync(out+'/pose-'+i+'.json',JSON.stringify(proof));await page.screenshot({path:out+'/pose-'+i+'.png'});await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForFunction(()=>window.__shapeup.seats[0].locked);await page.evaluate(()=>window.__shapeFlags=[false,false]);}
await page.waitForFunction(()=>document.querySelector('.moon-results'),null,{timeout:10000});assert.match(await page.locator('.moon-results .notes').textContent(),/24\/24 pose stars/);await page.waitForFunction(()=>document.querySelector('.moon-results .score')?.textContent?.trim()==='1165');await page.waitForTimeout(600);await page.screenshot({path:out+'/perfect-results.png'});assert.deepEqual(errors,[]);console.log('PASS Shape Up live camera, no cutouts, immediate real match, reset, GPU pose change, absent/stale/pause rejection, paired independence, layouts, eight-pose gold results and cleanup');
}catch(e){await page.screenshot({path:out+'/failure.png'});console.error(await page.evaluate(()=>({state:window.__shapeup?.snapshot(),error:window.__testError})));throw e;}finally{await browser.close();}
