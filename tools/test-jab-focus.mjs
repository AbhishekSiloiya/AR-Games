import {jabPunch} from './jab-contact.mjs';
const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/jab-focus';fs.mkdirSync(out,{recursive:true});
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
 }catch(e){window.__testError=e.message;}};window.__inject=setInterval(window.__injectPose,30);
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






await enter('Jab','.jab-session');
assert.equal(await page.locator('.mascot-puppet').count(),0,'no raster puppet in the focused game');
await page.waitForFunction(()=>window.__jab?.states[0].phase==='strike'&&window.__jab.time>.8);
await page.screenshot({path:out+'/jab-play.png'});
const pixels=JSON.parse(execFileSync('python3',['-c',`from PIL import Image
import json,sys
im=Image.open(sys.argv[1]).convert('RGB');w,h=im.size
print(json.dumps({'top':im.getpixel((round(w*.35),round(h*.22))),'floor':im.getpixel((round(w*.2),round(h*.82)))}))`,out+'/jab-play.png'],{encoding:'utf8'}));
assert.ok(pixels.top[0]>pixels.top[2]+15,'warm pavilion architecture actually renders at the top, not white or upside-down');
assert.ok(pixels.floor[1]>pixels.floor[0]+10,'teal mat renders at the bottom');
assert.ok(await page.evaluate(()=>window.__pc.root.findByName('jab-pavilion-backplate').render.meshInstances[0].mesh.vertexBuffer.format.elements.some(e=>e.name==='TEXCOORD0')));
const punch=(seat=0,wrong=false)=>jabPunch(page,seat,wrong);
await punch(0,true);await punch();await page.screenshot({path:out+'/jab-contact.png'});
for(let i=0;i<3;i++)await punch();
assert.equal(await page.evaluate(()=>window.__jab.states[0].completed),1);
assert.equal(await page.evaluate(()=>window.__jab.states[0].streak),4);
await page.screenshot({path:out+'/jab-combo.png'});
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__jab.actors[0].state());await page.waitForTimeout(350);assert.deepEqual(await page.evaluate(()=>window.__jab.actors[0].state()),paused,'pause freezes character and mitts');await page.getByRole('button',{name:'Keep playing'}).click();
await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(250);await page.screenshot({path:out+'/jab-tablet.png'});
await page.setViewportSize({width:640,height:360});await page.waitForTimeout(250);await page.screenshot({path:out+'/jab-small-landscape.png'});
await page.setViewportSize({width:1440,height:900});
await mode('lost');const lostScore=await page.evaluate(()=>window.__jab.states[0].score);await page.waitForTimeout(1300);assert.equal(await page.evaluate(()=>window.__jab.states[0].score),lostScore,'absent player cannot score');await mode('neutral');await page.waitForFunction(()=>!JSON.parse(window.render_game_to_text()).trackingLost,null,{timeout:6000});
await page.evaluate(()=>window.__jab.advance(12000));await punch();await page.waitForFunction(()=>window.__jab.states[0].phase==='duckWarn');await page.screenshot({path:out+'/jab-duck-warning.png'});
const duckScore=await page.evaluate(()=>window.__jab.states[0].score);await page.evaluate(()=>{window.__testMode='squat';window.__injectPose();if(window.__romp.players[0].lift!==-.85)throw new Error('crouch fixture was not injected');window.__jab.advance(2300);});assert.equal(await page.evaluate(()=>window.__jab.states[0].score),duckScore+3,'real crouch earns exactly one duck bonus');await mode('neutral');
await page.evaluate(()=>window.__jab.advance(70000));await page.getByRole('button',{name:'Play again',exact:true}).waitFor();await page.waitForTimeout(1000);assert.equal(await page.locator('.moon-results .result h2').first().evaluate(el=>getComputedStyle(el).color),'rgb(32, 51, 56)','player name stays readable on the daylight results card');await page.screenshot({path:out+'/jab-results.png'});assert.equal(await page.locator('.jab-session').count(),0);await page.getByRole('button',{name:'Home',exact:true}).click();
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;window.__jabHands=[];});await enter('Jab','.jab-session');
assert.equal(await page.evaluate(()=>window.__jab.states.length),2);await punch(1);assert.equal(await page.evaluate(()=>window.__jab.states[0].score),0,'second seat cannot award first seat');assert.ok(await page.evaluate(()=>window.__jab.states[1].score)>0);
await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(100);await page.screenshot({path:out+'/jab-two-player.png'});
await home();assert.equal(await page.locator('.jab-session').count(),0);assert.equal(await page.evaluate(()=>document.body.classList.contains('jab-focus-live')),false);assert.equal(await page.evaluate(()=>window.__pc.root.findByName('jab-rizzquake-0')),null);
assert.deepEqual(errors,[]);console.log('PASS Jab actual glove travel, wrong hand rejection, contact, four-hit combination, pause, tablet/mobile and cleanup');
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(await page.evaluate(()=>({ui:window.render_game_to_text?.(),jab:window.__jab?.states,error:window.__testError})));throw error;}finally{await browser.close();}
