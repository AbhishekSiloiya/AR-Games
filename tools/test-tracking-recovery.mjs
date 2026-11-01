const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/tracking-recovery';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{localStorage.setItem('romp.look','camera');Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
// Static deployments have no optional /report collector; stub only that endpoint.
await page.route('**/report',route=>route.fulfill({status:204,body:''}));
await page.goto(process.env.AR_GAME_TEST_URL || 'http://127.0.0.1:5180/');
await page.getByRole('button',{name:'Start',exact:true}).click();
await page.getByRole('button',{name:/Tracking/}).waitFor({timeout:60000});
assert.equal(await page.evaluate(()=>window.__romp.tuning.look),'shadow');
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
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;
 const aspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;
 const sw=Math.abs(bb[11][0]-bb[12][0])*aspect, fx=(bb[11][0]+bb[12][0])/2*aspect, fy=(bb[11][1]+bb[12][1])/2;
 pose.players[i].frame={x:fx,y:fy,sw,aspect};
 pose.players[i].rig=bb.map(q=>[(q[0]*aspect-fx)/sw,(fy-q[1])/sw,q[2],0,0]);
 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:r[2]>.5&&!!document.querySelector('.stage'),t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}},30);
});
async function state(){return page.evaluate(()=>JSON.parse(window.render_game_to_text()));}
async function mode(value){await page.evaluate(v=>window.__testMode=v,value);}
async function scenePixels(label){const png=await page.locator('.stage canvas').screenshot();fs.writeFileSync(out+'/'+label+'.png',png);return JSON.parse(execFileSync('python3',['-c',`import sys,json,io
from PIL import Image
im=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB');w,h=im.size;im=im.crop((int(w*.1),int(h*.32),int(w*.9),int(h*.65)));print(json.dumps({'colors':len(im.getcolors(im.width*im.height) or [])}))`],{input:png}).toString());}


await mode('noHands');await page.getByRole('button',{name:/^Freeze —/}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).screen==='play');await page.waitForFunction(()=>window.__freeze?.time>0);
const activePixels=await scenePixels('active-world');assert.ok(activePixels.colors>20,'actual game scene is drawn before pausing');
const lossAt=await page.evaluate(()=>{window.__testMode='noFeet';return performance.now();});
await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).trackingLost);
const lostAt=await page.evaluate(()=>performance.now());assert.ok(lostAt-lossAt>=750,'existing 800ms loss guard remains');
const failures=[],resizedPixels=[];
const pausedPixels=await scenePixels('paused-world');
for(const [width,height] of [[1024,768],[640,360]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(150);
 const card=page.locator('.tracking-recovery-strip,.tracking-recovery .panel');const box=await card.boundingBox();
 const okay=box&&box.height<height*.3&&box.y>=0&&box.y+box.height<=height&&box.x>=0&&box.x+box.width<=width;
 if(!okay)failures.push({width,height,box});
 await page.screenshot({path:out+`/recovery-${width}.png`});resizedPixels.push({width,...await scenePixels(`paused-resized-world-${width}`)});
}
if(process.env.AR_BASELINE==='1'){assert.ok(failures.length>0,'baseline must reproduce oversized recovery');console.log(JSON.stringify({baseline:'RED reproduced',failures},null,2));}
else if(process.env.AR_RESIZE_RED==='1'){assert.ok(resizedPixels.some(p=>p.colors<=20),'baseline must reproduce cleared paused game canvas');console.log(JSON.stringify({resize:'RED reproduced',activePixels,pausedPixels,resizedPixels},null,2));}
else{
 assert.ok(resizedPixels.every(p=>p.colors>20),'paused resize redraws the actual world');
 assert.deepEqual(failures,[],'recovery card occupies less than 30% of viewport height');
 const strip=page.locator('.tracking-recovery-strip');assert.equal(await page.locator('.moon-game').getAttribute('inert'),'','game buttons are inert during tracking recovery');assert.match(await strip.textContent(),/feet are visible/);assert.equal(await page.locator('.pause.tracking-recovery').count(),0,'no full-screen recovery scrim');
 assert.equal(await page.locator('.tracking-recovery-preview canvas').count(),1,'paused in-game camera has just one compact live framing thumbnail');assert.equal(await page.locator('.tracking-recovery-preview canvas').evaluate(c=>c.clientWidth),112);
 const before=await page.evaluate(()=>({time:window.__freeze.time,scores:[...window.__freeze.scores],visual:window.__freeze.snapshot().visualTime}));const image=await page.locator('.tracking-recovery-preview canvas').evaluate(c=>c.toDataURL());
 await mode('moving');await page.waitForTimeout(1500);
 assert.equal((await state()).trackingLost,true,'valid but moving players cannot resume');
 assert.deepEqual(await page.evaluate(()=>({time:window.__freeze.time,scores:[...window.__freeze.scores],visual:window.__freeze.snapshot().visualTime})),before,'round time, scoring and game motion stay paused during recovery');
 assert.ok(Number(await page.getByRole('progressbar',{name:'Ready to resume'}).getAttribute('aria-valuenow'))<100,'moving fixture never completes steady recovery');assert.notEqual(await page.locator('.tracking-recovery-preview canvas').evaluate(c=>c.toDataURL()),image,'small framing camera continues updating while game render is paused');
 const recoveredAt=await page.evaluate(()=>{window.__testMode='neutral';return performance.now();});await page.waitForFunction(()=>!JSON.parse(window.render_game_to_text()).trackingLost);assert.ok(await page.evaluate(()=>performance.now())-recoveredAt>=950,'existing one-second steady guard remains');assert.equal(await strip.count(),0);assert.equal(await page.locator('.moon-game').getAttribute('inert'),null,'game controls return after steady recovery');const resumed=await page.evaluate(()=>window.__freeze.time);await page.waitForTimeout(200);assert.ok(await page.evaluate(t=>window.__freeze.time>t,resumed));
 await mode('noFeet');await strip.waitFor();await page.getByRole('button',{name:'Back to home',exact:true}).click();await page.getByRole('button',{name:/^Goalie —/}).waitFor();assert.equal(await page.locator('.tracking-recovery-strip,.stage').count(),0,'Home clears both the recovery strip and round');
 await mode('noHands');await page.getByRole('button',{name:/^Goalie —/}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).screen==='play');await page.locator('.keeper-session').waitFor();
 await mode('noHands');await page.locator('.tracking-recovery-strip').waitFor();assert.equal(await page.locator('.tracking-recovery-preview').count(),0,'existing live inset is reused instead of duplicated');assert.equal(await page.locator('.player-inset canvas').count(),1);
 for(const [width,height] of [[1024,768],[640,360]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);const card=await page.locator('.tracking-recovery-strip').boundingBox(),inset=await page.locator('.player-inset').boundingBox();assert.ok(card.height<height*.3&&card.y>=0&&card.y+card.height<=height);assert.ok(card.x+card.width<inset.x,'recovery copy leaves the existing live inset visible');await page.screenshot({path:out+`/inset-recovery-${width}.png`});}
 await page.getByRole('button',{name:'Back to home',exact:true}).click();
 assert.deepEqual(errors,[]);console.log('PASS compact recovery: both viewport bounds, exact feet guidance, updating thumbnail, paused clock/input/visuals, unchanged loss/steady guards, resume and Home cleanup');
}
}finally{await browser.close();}
