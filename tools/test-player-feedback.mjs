const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/player-feedback';fs.mkdirSync(out,{recursive:true});
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
 if(window.__testMode==='run'){const j=Math.floor(performance.now()/230)%2;b[25+j][1]=.58;}
 if(window.__testMode==='armUp'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];}
 if(window.__testMode==='jack'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];b[27]=[.25,.88,1];b[28]=[.75,.88,1];}
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
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


// Leaving during a cold avatar load must not attach late objects or leak into the next round.
let releaseRobot;const robotRequested=new Promise(resolve=>{page.route('**/assets/robot.glb',route=>{releaseRobot=()=>route.continue();resolve();});});
await mode('noHands');await page.getByRole('button',{name:/Sprint/}).first().click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await robotRequested;
await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();await releaseRobot();await page.unroute('**/assets/robot.glb');await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>!!window.__pc.root.findByName('sprint-model-player-0')),false);assert.equal(await page.evaluate(()=>typeof window.__sprint),'undefined');
await enter('Sprint','sprint-model-player-0');const idle=await page.evaluate(()=>window.__sprint());await page.waitForTimeout(900);const drifting=await page.evaluate(()=>window.__sprint());assert.ok(drifting.scenery>idle.scenery);assert.equal(drifting.players[0].metres,0,'ambient movement does not earn distance');await page.screenshot({path:out+'/sprint-idle-runner.png'});
await mode('run');await page.waitForFunction(()=>window.__sprint().players[0].metres>1&&window.__sprint().players[0].clip==='Running',null,{timeout:10000});await page.screenshot({path:out+'/sprint-moving-runner.png'});await mode('neutral');await home();assert.equal(await page.evaluate(()=>typeof window.__sprint),'undefined');
await enter('Forge','forge-model-player-0');await page.waitForFunction(()=>Number(document.querySelector('.hud.clock').textContent)<75,null,{timeout:10000});await page.screenshot({path:out+'/forge-standing-model.png'});await mode('squat');await page.waitForFunction(()=>window.__forge().players[0].depth>.6&&window.__forge().players[0].clip==='Sitting',null,{timeout:10000});await page.screenshot({path:out+'/forge-squat-model.png'});await mode('neutral');await home();
await enter('Beat','disco-dance-floor');await page.locator('.beat-cues__current:not([hidden])').first().waitFor();const cue=await page.locator('.beat-cues__current').first().textContent();assert.ok(/Raise LEFT hand|Raise RIGHT hand|BOTH hands up|SQUAT|JUMP/.test(cue)&&cue.includes('WHITE LINE'));assert.equal(await page.locator('.beat-cues__note').count(),0);assert.equal(await page.locator('.beat-cues__key span').count(),5);await page.screenshot({path:out+'/beat-labelled-actions.png'});await home();assert.equal(await page.locator('.beat-cues').count(),0,'instructions clean up');
await enter('Shape Up','.shapeup-coach-card');assert.equal((await page.evaluate(()=>JSON.parse(window.render_game_to_text()))).view,'live');assert.equal(await page.locator('.player-inset').count(),0);assert.equal(await page.locator('.shapeup-coach-classic').count(),0);assert.equal(await page.evaluate(()=>!!window.__pc.root.findByName('shapeup-live-pose-0')),false,'actual player is camera, not stick figure');assert.equal(await page.locator('.shapeup-countdown').count(),1);await page.screenshot({path:out+'/shapeup-live-camera.png'});await home();assert.equal(await page.locator('.shapeup-coach').count(),0);
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});await enter('Shape Up','.shapeup-coach-card');assert.equal(await page.locator('.shapeup-coach-card').count(),2);await page.screenshot({path:out+'/shapeup-two-live-players.png'});await home();
await enter('Beat','disco-dance-floor');await page.locator('.beat-cues__current[data-player="2"]:not([hidden])').first().waitFor();await page.screenshot({path:out+'/beat-two-player-instructions.png'});
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['visible authored runner','idle scenic drift without free score','knee movement drives run animation/metres','authored Forge squat','large top Beat instructions','five-move legend','full live Shape Up','circular coach timers','two-player camera/coaches','overlay cleanup'],errors,screenshots:out},null,2));
}finally{await browser.close();}
