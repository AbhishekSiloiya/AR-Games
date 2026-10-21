const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/smash-boss';fs.mkdirSync(out,{recursive:true});
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
 if(window.__testMode==='relaxed'){for(const q of b)q[0]-=.2;b[13][2]=b[14][2]=.2;b[15][2]=b[16][2]=.4;}
 if(window.__testMode==='noHead')b[0][2]=0;
 if(window.__testMode==='armUp'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];}
 if(window.__testMode==='jack'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];b[27]=[.25,.88,1];b[28]=[.75,.88,1];}
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
 const aspect=document.querySelector('video').videoWidth/document.querySelector('video').videoHeight;
 const sw=Math.abs(bb[11][0]-bb[12][0])*aspect, fx=(bb[11][0]+bb[12][0])/2*aspect, fy=(bb[11][1]+bb[12][1])/2;
 pose.players[i].frame={x:fx,y:fy,sw,aspect};
 pose.players[i].rig=bb.map(q=>[(q[0]*aspect-fx)/sw,(fy-q[1])/sw,q[2],0,0]);
 for(let h=0;h<2;h++){const r=pose.players[i].rig[15+h];Object.assign(pose.players[i].hands[h],{x:r[0]/pose.tuning.reachX[window.__pair?1:0],y:(r[1]-pose.tuning.centerY)/pose.tuning.reachY,seen:true,t:performance.now()});}
if(window.__bossAims?.[i]){const a=window.__bossAims[i];Object.assign(pose.players[i].hands[0],{x:a.x,y:a.y,vx:a.fast?1.4:0,vy:0,ax:0,ay:0,t:performance.now()});}
pose.players[i].present=window.__testMode!=='lost'&&(!window.__pair||i===0||window.__secondReady);
 if(window.__testMode!=='stale')pose.trackingSeen[i]=performance.now();
 }
 }catch(e){window.__testError=e.message;}},30);
});

async function mode(v){await page.evaluate(v=>window.__testMode=v,v);}
async function enter(name,entity){
 await mode('noHands');console.log('VISUAL',name);
 await page.getByRole('button',{name:new RegExp(name)}).first().click();
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await mode(name==='Jack Attack'?'noFeet':'neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await page.waitForFunction(name=>!!window.__pc?.root.findByName(name),entity,{timeout:30000});
 await page.waitForTimeout(4500);
 assert.equal(await page.evaluate(name=>window.__pc.root.findByName(name).enabled,entity),true);
}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}


async function aim(p,x,y,fast=false){await page.evaluate(({p,x,y,fast})=>{window.__bossAims??=[];const a=window.__smashBoss.area;window.__bossAims[p]={x:(x-a.cx(p))/a.hw,y:(y-a.cy)/a.hh,fast};},{p,x,y,fast});}
async function punch(p,x,y){await aim(p,x,y);await page.waitForTimeout(350);await aim(p,x,y,true);await page.waitForTimeout(180);await aim(p,x,y);await page.waitForTimeout(250);}
const bossState=()=>page.evaluate(()=>{const b=window.__smashBoss.bosses[0];return {armour:[...b.state.armour],core:b.state.core,defeated:b.state.defeated,score:b.score,wave:b.wave};});
await enter('Smash','smash-robot-0');await page.locator('.player-inset').waitFor();await page.screenshot({path:out+'/robot-armour.png'});
await page.waitForFunction(()=>Number(document.querySelector('.hud.clock').textContent)<45,null,{timeout:15000});
const initial=await bossState();
await punch(0,0,.55*1.05);assert.equal((await bossState()).core,initial.core,'core remains protected before all armour breaks');
// Start fast away from the robot, then reach armour without slowing: exactly one impact.
await aim(0,-3,2.3*1.05);await page.waitForTimeout(500);const before=(await bossState()).armour[0];
await aim(0,-3,2.3*1.05,true);await page.waitForTimeout(200);await aim(0,0,2.3*1.05,true);await page.waitForTimeout(350);
const after=(await bossState()).armour[0];assert.ok(after<before,'travelling punch is retained until contact');
await page.waitForTimeout(450);assert.equal((await bossState()).armour[0],after,'held velocity cannot repeat an impact');await aim(0,0,2.3*1.05);
await page.screenshot({path:out+'/armour-breaking.png'});
for(let k=0;k<6;k++)for(let attempts=0;(await bossState()).armour[k]>0&&attempts<5;attempts++){
 const at=await page.evaluate(k=>{const a=window.__smashBoss.bosses[0].armour[k];return {x:a.x*1.05,y:a.y*1.05};},k);await punch(0,at.x,at.y);
}
assert.ok((await bossState()).armour.every(hp=>hp===0),'all six plates break via hand input');await page.waitForTimeout(1100);await page.screenshot({path:out+'/core-exposed.png'});
while(!(await bossState()).defeated)await punch(0,0,.55*1.05);
await page.screenshot({path:out+'/robot-demolished.png'});assert.ok((await bossState()).score>=28);
await page.waitForFunction(()=>window.__smashBoss.bosses[0].wave===1&&!window.__smashBoss.bosses[0].state.defeated,null,{timeout:10000});assert.ok((await bossState()).armour[0]>initial.armour[0],'next robot is tougher');await home();
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__bossAims=[];});await enter('Smash','smash-robot-1');
await page.waitForFunction(()=>Number(document.querySelector('.hud.clock').textContent)<45,null,{timeout:15000});await punch(0,-4,.35*.92);
const scores=await page.evaluate(()=>window.__smashBoss.bosses.map(b=>b.score));assert.ok(scores[0]>0);assert.equal(scores[1],0,'players have independent collision zones and scores');await page.screenshot({path:out+'/two-player-robots.png'});
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['protected core','sustained-speed contact','single impact per swing','six plates break','core defeat','tougher rebuild','two-player score isolation','live tracking inset'],errors,screenshots:out},null,2));
}finally{await browser.close();}
