const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/feedback-round2';fs.mkdirSync(out,{recursive:true});
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
 if(window.__testMode==='kneeL')b[25][1]=.58;
 if(window.__testMode==='kneeR')b[26][1]=.58;
 if(window.__testMode==='run'){const j=Math.floor(performance.now()/230)%2;b[25+j][1]=.58;}
 if(window.__testMode==='armUp'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];}
 if(window.__testMode==='jack'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];b[27]=[.25,.88,1];b[28]=[.75,.88,1];}
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=window.__matchShape&&i===0&&window.__shapeup?[...window.__shapeup.order[window.__shapeup.index][1]]:pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
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

async function mode(v){await page.evaluate(v=>window.__testMode=v,v);}
async function enter(name,entity){
 await mode('noHands');console.log('VISUAL',name);
 await page.getByRole('button',{name:new RegExp(name)}).first().click();
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await mode(name==='Jack Attack'?'noFeet':'neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();
 if(entity.startsWith('.'))await page.locator(entity).first().waitFor();else await page.waitForFunction(name=>!!window.__pc?.root.findByName(name),entity,{timeout:30000});
 await page.waitForTimeout(4500);
 if(!entity.startsWith('.'))assert.equal(await page.evaluate(name=>window.__pc.root.findByName(name).enabled,entity),true);
}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}


await enter('Beat','disco-dance-floor');
await page.locator('.beat-cues__current:not([hidden])').first().waitFor();
const layout=await page.locator('.beat-cues__current').first().evaluate(el=>{const r=el.getBoundingClientRect(),s=document.querySelector('.stage').getBoundingClientRect();return {y:(r.top-s.top)/s.height,size:parseFloat(getComputedStyle(el.querySelector('.beat-cues__action')).fontSize)};});
assert.ok(layout.y<.3,'Beat instruction must be at the top');
assert.ok(layout.size>=32,'Beat instruction must be large enough to read from playing distance');
assert.equal(await page.locator('.beat-cues__note').count(),0,'shapes have no text attached');
await page.screenshot({path:out+'/beat-large-top-cue.png'});await home();assert.equal(await page.locator('.beat-cues').count(),0);
await enter('Sprint','sprint-model-player-0');
await page.waitForFunction(()=>window.__sprint().heat>=0);await mode('neutral');await page.waitForTimeout(200);
const neutral=await page.evaluate(()=>{const m=window.__pc.root.findByName('sprint-model-player-0');return {l:m.findByName('UpperLeg.L').getLocalRotation().toString(),r:m.findByName('UpperLeg.R').getLocalRotation().toString()};});
await mode('kneeL');await page.waitForFunction(()=>window.__sprint().players[0].left>.5&&window.__sprint().players[0].right<.1);
const first=await page.evaluate(()=>window.__sprint().players[0]);assert.equal(first.steps,1,'first knee counts without waiting for another');assert.ok(first.metres>0);
assert.notEqual(await page.evaluate(()=>window.__pc.root.findByName('sprint-model-player-0').findByName('UpperLeg.L').getLocalRotation().toString()),neutral.l,'visible thigh follows left knee');
await page.screenshot({path:out+'/sprint-left-knee.png'});await page.waitForTimeout(250);assert.equal((await page.evaluate(()=>window.__sprint().players[0])).speed,0,'held knee stops pace');assert.equal((await page.evaluate(()=>window.__sprint().players[0])).steps,1);
await mode('kneeR');await page.waitForFunction(()=>window.__sprint().players[0].right>.5&&window.__sprint().players[0].left<.1);
assert.notEqual(await page.evaluate(()=>window.__pc.root.findByName('sprint-model-player-0').findByName('UpperLeg.R').getLocalRotation().toString()),neutral.r);await page.screenshot({path:out+'/sprint-right-knee.png'});await mode('neutral');await home();
await enter('Shape Up','.shapeup-coach-card');await page.evaluate(()=>window.__matchShape=true);
await page.waitForFunction(()=>window.__shapeup.phase==='match'&&window.__shapeup.seats[0].locked);
assert.match(await page.locator('.shapeup-live-status strong').textContent(),/Shape matched/);await page.screenshot({path:out+'/shapeup-matched.png'});
await mode('noHands');await page.waitForFunction(()=>!window.__shapeup.seats[0].locked&&document.querySelector('.shapeup-coach-card').dataset.feedback==='absent');await mode('neutral');await page.waitForFunction(()=>window.__shapeup.seats[0].locked);
const poseIndex=await page.evaluate(()=>window.__shapeup.index);
await page.waitForFunction(i=>window.__shapeup.index===i&&window.__shapeup.phase==='result',poseIndex);const scored=await page.evaluate(()=>window.__shapeup.seats[0].score);assert.ok(scored>=90);await page.screenshot({path:out+'/shapeup-result.png'});
await page.waitForFunction(i=>window.__shapeup.index===i&&window.__shapeup.phase==='rest',poseIndex);assert.match(await page.locator('.shapeup-live-status strong').textContent(),/Relax/);await page.screenshot({path:out+'/shapeup-relax.png'});
await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.__shapeup.index),poseIndex,'old pose holds through relax pause');assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].score),scored,'result never scores twice');
await page.evaluate(()=>window.__matchShape=false);await page.waitForFunction(i=>window.__shapeup.index===i+1&&window.__shapeup.phase==='match',poseIndex);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].locked),false,'new pose resets match');await home();
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});
await enter('Beat','disco-dance-floor');assert.equal(await page.locator('.beat-cues__current:not([hidden])').count(),2);await page.screenshot({path:out+'/beat-two-player-top.png'});
await page.setViewportSize({width:1024,height:768});await page.screenshot({path:out+'/beat-tablet.png'});
const headings=await page.locator('.beat-cues__current').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,overflow:e.scrollWidth>e.clientWidth+2};}));assert.ok(headings[0].right<headings[1].left);assert.ok(headings.every(h=>!h.overflow));await home();
await enter('Shape Up','.shapeup-coach-card');await page.evaluate(()=>window.__matchShape=true);await page.waitForFunction(()=>window.__shapeup.phase==='match'&&window.__shapeup.seats[0].locked);assert.equal(await page.locator('.shapeup-live-status').count(),2);assert.equal(await page.evaluate(()=>window.__shapeup.seats[1].locked),false);await page.screenshot({path:out+'/shapeup-two-player-feedback.png'});await page.evaluate(()=>window.__matchShape=false);await home();
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['large top Beat cue','unobstructed shapes','tablet/two-player layout','direct first/opposite knee and rendered joints','fast stop/no hold scoring','Shape Up lock/result/relax/next','no double score','independent player feedback','cleanup'],errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(JSON.stringify(await page.evaluate(()=>({state:window.render_game_to_text?.(),shape:window.__shapeup?{phase:window.__shapeup.phase,index:window.__shapeup.index,seats:window.__shapeup.seats}:null,testError:window.__testError})),null,2));throw error;}finally{await browser.close();}
