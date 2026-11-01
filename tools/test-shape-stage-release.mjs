const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/shape-stage-release';fs.mkdirSync(out,{recursive:true});
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

const orders=[];
for(const stage of [1,2,5]){
 await enter(stage);await page.evaluate(()=>window.__shapeFlags=[false,false]);
 const snap=await page.evaluate(()=>window.__shapeup.snapshot());orders.push(snap.order);
 assert.equal(snap.stage,stage);assert.equal(snap.order.length,8);assert.equal(snap.camera.source,'live-camera');
 assert.match(await page.locator('.shape-brand>span').textContent(),new RegExp('STAGE '+stage));
 await page.screenshot({path:out+'/stage-'+stage+'-ready.png'});
 const count=stage===5?8:3;
 for(let i=0;i<count;i++){
  await page.waitForFunction(i=>window.__shapeup.index===i&&window.__shapeup.phase==='match',i);
  const before=await page.evaluate(()=>window.__shapeup.seats[0].score);
  if(stage===2&&i===0){await page.evaluate(()=>window.__badLimb=0);await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].locked),false,'hidden limb never awards');await page.evaluate(()=>window.__badLimb=undefined);}
  await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForFunction(()=>window.__shapeup.seats[0].locked);
  const locked=await page.evaluate(()=>window.__shapeup.snapshot());assert.ok(locked.seats[0].score>before);assert.equal(locked.seats[0].path[i],3);
  await page.evaluate(()=>window.__shapeFlags=[false,false]);
  if(i===2){assert.equal(locked.seats[0].milestone,20);assert.match(await page.locator('.shape-earned-bonus').textContent(),/3 CHAIN.*20 BONUS/);await page.screenshot({path:out+'/stage-'+stage+'-chain.png'});}
  if(i<count-1){await page.waitForFunction(i=>window.__shapeup.index===i+1,i);const next=await page.evaluate(()=>window.__shapeup.snapshot());assert.ok(next.time-locked.time<1.65,'next target arrives quickly after genuine lock');assert.equal(next.seats[0].score,locked.seats[0].score);}
 }
 if(stage===5){await page.waitForSelector('.moon-results');await page.waitForFunction(()=>document.querySelector('.moon-results .score')?.textContent?.trim()==='1165');assert.match(await page.locator('.moon-results .notes').textContent(),/Stage 5.*Own the pose/);assert.match(await page.locator('.moon-results .notes').textContent(),/24\/24 pose stars/);await page.screenshot({path:out+'/stage-five-results.png'});await page.getByRole('button',{name:'Home',exact:true}).click();}else await home();
}
assert.notDeepEqual(orders[0],orders[1]);assert.notDeepEqual(orders[1],orders[2]);
await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__shapeFlags=[false,false];});await enter(2);
await page.evaluate(()=>window.__shapeFlags=[true,false]);await page.waitForFunction(()=>window.__shapeup.seats[0].locked);assert.equal(await page.evaluate(()=>window.__shapeup.seats[1].score),0);assert.equal(await page.evaluate(()=>window.__shapeup.phase),'match');
await page.evaluate(()=>window.__shapeFlags=[false,true]);await page.waitForFunction(()=>window.__shapeup.seats[1].locked);
for(const [width,height]of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.screenshot({path:out+'/paired-'+width+'.png'});const boxes=await page.locator('.shape-seat').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));assert.ok(boxes[0].right<boxes[1].x);assert.ok(boxes.every(r=>r.x>=0&&r.y>=0&&r.right<=width&&r.bottom<=height));}
assert.equal(await page.locator('.shapeup-coach').getAttribute('data-motion'),'false');await home();assert.equal(await page.locator('.shapeup-coach').count(),0);assert.deepEqual(errors,[]);console.log('PASS Shape release actual tracked limb poses, distinct stage schedules, earned chain bonus, quick next target, missing wrist, independent pair, reduced motion, layouts, final schedule summary and cleanup');
}catch(e){await page.screenshot({path:out+'/failure.png'});console.error(await page.evaluate(()=>({state:window.__shapeup?.snapshot(),error:window.__testError})));throw e;}finally{await browser.close();}
