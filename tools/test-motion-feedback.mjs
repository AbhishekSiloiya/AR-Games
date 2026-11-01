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
 if(window.__testMode==='upperOnly')for(const j of [23,24,25,26,27,28])b[j][2]=0;
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance')pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
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
 }catch(e){window.__testError=e.message;}},30);
});

async function mode(v){await page.evaluate(v=>window.__testMode=v,v);}
async function enter(name,entity){
 await mode('noHands');console.log('VISUAL',name);
 await page.getByRole('button',{name:new RegExp(name)}).first().click();
 if(name==='Jack Attack'&&await page.evaluate(()=>!!window.__versus))await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await mode(name==='Jack Attack'?'noFeet':'neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();
 if(entity.startsWith('.'))await page.locator(entity).first().waitFor();else await page.waitForFunction(name=>!!window.__pc?.root.findByName(name),entity,{timeout:30000});
 await page.waitForTimeout(4500);
 if(!entity.startsWith('.'))assert.equal(await page.evaluate(name=>window.__pc.root.findByName(name).enabled,entity),true);
}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}






await enter('Jack Attack','.stage');await page.waitForTimeout(1000);
const pilot=page.locator('.galaxy-pilot-rig .mascot-puppet').first();
const arms=await pilot.getAttribute('data-right-arm');await mode('armUp');await page.waitForFunction(previous=>document.querySelector('.galaxy-pilot-rig .mascot-puppet').dataset.rightArm!==previous,arms,{timeout:1500});await page.screenshot({path:out+'/arms-raised.png'});
await mode('upperOnly');await page.waitForTimeout(200);assert.equal(await pilot.getAttribute('data-visible'),'true','upper-body player retains Moodi without hips/feet');
await page.keyboard.press('Escape');const paused=await pilot.getAttribute('data-frame');await page.waitForTimeout(250);assert.equal(await pilot.getAttribute('data-frame'),paused);await page.getByRole('button',{name:'Keep playing'}).click();await mode('neutral');await home();
await enter('Freeze','.stage');await page.waitForFunction(()=>window.__freeze?.time>0&&window.__freeze.party.dancing);await mode('armUp');await page.waitForFunction(()=>!!document.querySelector('.freeze-party__host .mascot-puppet').dataset.rightArm);const partner=page.locator('.freeze-party__host .mascot-puppet');const a=await partner.getAttribute('data-right-arm');await mode('neutral');await page.waitForFunction(previous=>document.querySelector('.freeze-party__host .mascot-puppet').dataset.rightArm!==previous,a,{timeout:1500});
const raw=await page.evaluate(()=>{const v=document.querySelector('video'),c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const x=c.getContext('2d');x.drawImage(v,0,0);return [...x.getImageData(c.width/2,c.height/3,1,1).data];});console.log('raw camera sample',raw);await page.screenshot({path:out+'/dance-clear-camera.png'});
await page.waitForFunction(()=>!window.__freeze.dancing,null,{timeout:15000});const stopped=await partner.getAttribute('data-frame');await mode('armUp');await page.waitForTimeout(200);assert.equal(await partner.getAttribute('data-frame'),stopped,'partner stops on Freeze even while test body moves');await page.screenshot({path:out+'/dance-stop.png'});await mode('neutral');await home();
await enter('Shape Up','.stage');assert.equal(await page.locator('.shapeup-quest,.shapeup-portal,.shapeup-reference').count(),0,'old competing panels removed');await page.evaluate(()=>window.__matchShape=true);await page.waitForFunction(()=>Number(document.querySelector('.shapeup-world').dataset.cells)>0,null,{timeout:20000});await page.screenshot({path:out+'/shape-earned-tower.png'});await page.waitForFunction(()=>window.__shapeup.phase==='rest',null,{timeout:10000});assert.match(await page.locator('.shapeup-live-status>span').textContent(),/Next pose/);await page.screenshot({path:out+'/shape-breather.png'});await page.evaluate(()=>window.__matchShape=false);await home();
await enter('Jab','.stage');assert.equal(await page.evaluate(()=>window.__jab.actors[0].state().mesh),'skinned-3d');
for(let k=0;k<4;k++)await jabPunch(page);
assert.equal(await page.evaluate(()=>window.__jab.states[0].completed),1);await page.screenshot({path:out+'/jab-earned-combo.png'});await home();assert.equal(await page.locator('.mascot-puppet,.jab-session').count(),0,'all game actors cleaned up');assert.deepEqual(errors,[]);console.log('PASS movement, clear-camera, pose result/rest, skinned coach, earned combo and cleanup.');
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(error);console.error(await page.evaluate(async()=>({ui:window.render_game_to_text?.(),freeze:window.__freeze?.time,audio:(await import('/src/audio.ts')).audio().state,mode:window.__testMode,injectError:window.__testError})));throw error;}finally{await browser.close();}
