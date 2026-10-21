const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/player-setup';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
try {
await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
// Static deployments have no optional /report collector; stub only that endpoint.
await page.route('**/report',route=>route.fulfill({status:204,body:''}));
await page.goto(process.env.AR_GAME_TEST_URL || 'http://127.0.0.1:5180/');
await page.getByRole('button',{name:'Start',exact:true}).click();
await page.getByRole('button',{name:/Tracking/}).waitFor({timeout:60000});
await page.evaluate(async()=>{
 window.__testWorkers.forEach(w=>w.terminate());
 document.querySelector('video').requestVideoFrameCallback=()=>0;
 const pose=window.__romp;window.__testPose=pose;window.__testMode='neutral';
 window.__neutral=()=>{
 const b=Array.from({length:33},()=>[.5,.5,1]);
 for(const [j,x,y] of [[0,.5,.15],[11,.42,.3],[12,.58,.3],[13,.35,.4],[14,.65,.4],[15,.3,.5],[16,.7,.5],[23,.44,.55],[24,.56,.55],[25,.44,.72],[26,.56,.72],[27,.44,.9],[28,.56,.9]])b[j]=[x,y,1];return b;};
 window.__inject=setInterval(()=>{try {
 const b=window.__neutral();if(window.__testMode==='reach'){b[15]=[.2,.3,1];b[16]=[.8,.3,1];}
 if(window.__testMode==='moving'){for(const j of [11,12,13,14,15,16,23,24,25,26])b[j][0]+=(Math.floor(performance.now()/100)%2)*.08;}
 if(window.__testMode==='squat'){b[11][1]+=.08;b[12][1]+=.08;}
 if(window.__testMode==='noFeet')b[27][2]=b[28][2]=0;
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;
 const aspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;
 const sw=Math.abs(bb[11][0]-bb[12][0])*aspect, fx=(bb[11][0]+bb[12][0])/2*aspect, fy=(bb[11][1]+bb[12][1])/2;
 pose.players[i].frame={x:fx,y:fy,sw,aspect};
 pose.players[i].rig=bb.map(q=>[(q[0]*aspect-fx)/sw,(fy-q[1])/sw,q[2],0,0]);
 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:true,t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}},30);
});
async function state(){return page.evaluate(()=>JSON.parse(window.render_game_to_text()));}
async function setup(name){console.log('SETUP',name);await page.getByRole('button',{name:new RegExp(name)}).first().click();await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('heading',{name:'Find your play space'}).waitFor();}
async function move(kind){await page.waitForTimeout(1000);await page.evaluate(k=>window.__testMode=k,kind);await page.waitForTimeout(450);await page.evaluate(()=>window.__testMode='neutral');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).screen==='play',{timeout:10000});}
await setup('Slice');
await page.evaluate(()=>window.__testMode='noFeet');await page.waitForTimeout(1000);
assert.match(await page.locator('.setup-prompt').innerText(),/Spread/);
await page.screenshot({path:out+'/slice-setup-desktop.png'});
await move('reach');
assert.equal((await state()).game,'slice');
await page.waitForTimeout(6500);await page.screenshot({path:out+'/slice-live.png'});
await page.evaluate(()=>window.__testMode='lost');await page.getByRole('heading',{name:'Let’s find you again'}).waitFor();
assert.equal((await state()).trackingLost,true);
await page.screenshot({path:out+'/tracking-recovery.png'});
await page.evaluate(()=>window.__testMode='moving');await page.waitForTimeout(2300);assert.equal((await state()).trackingLost,true);
await page.evaluate(()=>window.__testMode='reach');await page.waitForTimeout(250);await page.evaluate(()=>window.__testMode='noHands');await page.waitForTimeout(300);assert.equal((await state()).trackingLost,true);
await page.evaluate(()=>window.__testMode='neutral');await page.waitForFunction(()=>!JSON.parse(window.render_game_to_text()).trackingLost);
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Keep playing'}).click();assert.equal((await state()).paused,false);
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();
await setup('Keepy-Uppy');
await page.evaluate(()=>window.__testMode='noFeet');await page.waitForTimeout(1100);assert.match(await page.locator('.setup-prompt').innerText(),/feet/);
await page.getByRole('button',{name:'Player cut-out',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();await setup('Slice');assert.equal(await page.getByRole('button',{name:'See yourself',exact:true}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'← Back',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();await setup('Keepy-Uppy');await page.evaluate(()=>window.__testMode='noFeet');await page.waitForTimeout(200);
await page.setViewportSize({width:1024,height:768});await page.screenshot({path:out+'/keepy-setup-tablet.png'});
await page.evaluate(()=>window.__testMode='neutral');await move('reach');await page.waitForTimeout(3500);await page.screenshot({path:out+'/keepy-live.png'});
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();
await page.setViewportSize({width:1440,height:900});await setup('Run');await move('squat');await page.locator('.player-inset').waitFor();await page.waitForTimeout(3500);await page.screenshot({path:out+'/run-live.png'});
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();
// Every other game uses the same setup route, with no simulator escape in real mode.
for(const name of ['Pulse','Leaks','Sprint','Jack Attack','Forge','Lumberjack','Smash','Goalie','Jab','Beat','Rocket','Freeze','Wipe','Shape Up']){
 await setup(name);assert.equal(await page.getByRole('button',{name:'Continue in simulator'}).count(),0);await page.getByRole('button',{name:'← Back',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();
}
await page.getByRole('button',{name:'Together',exact:true}).click();
await page.evaluate(()=>{window.__pair=true;window.__secondReady=false;});await setup('Keepy-Uppy');await page.waitForTimeout(1100);assert.match(await page.locator('.setup-prompt').innerText(),/Player 2/);
await page.evaluate(()=>window.__secondReady=true);await move('reach');assert.equal((await state()).players,2);
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();
await page.getByRole('button',{name:'Take turns',exact:true}).click();await page.evaluate(()=>window.__pair=false);await setup('Slice');await move('reach');
assert.deepEqual(errors,[]);
console.log(JSON.stringify({result:'PASS',checks:['all 17 setup routes','hands-only without feet','full-body missing-feet block','movement + neutral hold','live Slice/Keepy/Run','loss and stable recovery','manual pause/resume/home','two-player gate','turn-mode first setup'],errors,screenshots:out},null,2));
} finally { await browser.close(); }
