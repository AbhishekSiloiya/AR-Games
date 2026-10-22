const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/party-quest';fs.mkdirSync(out,{recursive:true});
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
 if(window.__testMode==='pump'){const side=Math.floor(performance.now()/240)%2;b[15+side][1]=.35;}
 if(window.__testMode==='armUp'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];}
 if(window.__testMode==='jack'){b[15]=[.3,.08,1];b[16]=[.7,.08,1];b[27]=[.25,.88,1];b[28]=[.75,.88,1];}
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance')pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
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


await enter('Sprint','sprint-model-player-0');
await page.waitForFunction(()=>window.__sprint().players[0].clip==='Running',null,{timeout:6000});
const palette=()=>page.evaluate(()=>{const model=window.__pc.root.findByName('sprint-model-player-0');const mesh=model.findComponents('render').flatMap(r=>r.meshInstances).find(m=>m.skinInstance);return Array.from(mesh.skinInstance.matrixPalette);});
const a=await palette();await page.screenshot({path:out+'/sprint-run-a.png'});await page.waitForTimeout(360);const b=await palette();assert.ok(a.some((x,i)=>Math.abs(x-b[i])>.002),'renderer skin palette must move, not only diagnostic joint state');await page.screenshot({path:out+'/sprint-run-b.png'});
assert.equal((await page.evaluate(()=>window.__sprint().players[0])).metres,0,'warm-up animation earns no distance');
await mode('run');await page.waitForFunction(()=>window.__sprint().players[0].stars>=3&&window.__sprint().players[0].boost>0,null,{timeout:30000});await page.screenshot({path:out+'/sprint-turbo.png'});
await mode('neutral');await page.waitForTimeout(1000);const stopped=await page.evaluate(()=>window.__sprint().players[0]);await page.waitForTimeout(600);assert.equal((await page.evaluate(()=>window.__sprint().players[0])).metres,stopped.metres,'standing cannot coast for score');
await mode('pump');await page.waitForFunction(m=>window.__sprint().players[0].metres>m,stopped.metres,{timeout:15000});await page.screenshot({path:out+'/sprint-arm-pump.png'});
await page.locator('.results').waitFor({timeout:90000});assert.match(await page.locator('.notes').textContent(),/Scenic star race/);await page.screenshot({path:out+'/sprint-finish-medal.png'});await page.getByRole('button',{name:'Home',exact:true}).click();assert.equal(await page.locator('.sprint-race').count(),0);
await enter('Shape Up','.shapeup-coach-card');await page.evaluate(()=>window.__matchShape=true);
assert.equal(await page.locator('.shapeup-quest-step').count(),8);
await page.waitForFunction(()=>window.__shapeup.phase==='result'&&window.__shapeup.seats[0].stars===3,null,{timeout:20000});await page.screenshot({path:out+'/pose-quest-first-stars.png'});const earned=await page.evaluate(()=>window.__shapeup.seats[0].score);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].score),earned);
await page.waitForFunction(()=>window.__shapeup.index===2&&window.__shapeup.phase==='result'&&window.__shapeup.seats[0].combo===3,null,{timeout:40000});assert.equal(await page.evaluate(()=>window.__shapeup.seats[0].milestone),20);assert.equal(await page.locator('.shapeup-quest-step[data-state="earned"]').count(),3);await page.screenshot({path:out+'/pose-quest-combo.png'});
await page.locator('.results').waitFor({timeout:90000});assert.match(await page.locator('.notes').textContent(),/Gold.*Pose master.*24\/24 quest stars/);await page.screenshot({path:out+'/pose-quest-gold-finish.png'});await page.getByRole('button',{name:'Home',exact:true}).click();await page.evaluate(()=>window.__matchShape=false);assert.equal(await page.locator('.shapeup-quest').count(),0);
await enter('Freeze','.freeze-party');assert.equal((await page.evaluate(()=>JSON.parse(window.render_game_to_text()))).view,'live');await mode('dance');
await page.waitForFunction(()=>window.__freeze.dancing&&window.__freeze.time>0);const angle=await page.evaluate(()=>window.__freeze.party.angle);await page.waitForTimeout(300);assert.ok((await page.evaluate(()=>window.__freeze.party.angle))!==angle);await page.screenshot({path:out+'/freeze-live-disco.png'});await mode('neutral');
await page.waitForFunction(()=>!window.__freeze.dancing,null,{timeout:15000});const held=await page.evaluate(()=>({angle:window.__freeze.party.angle,lights:window.__freeze.party.lightTime}));await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>({angle:window.__freeze.party.angle,lights:window.__freeze.party.lightTime})),held,'music stop holds ball and lights');await page.screenshot({path:out+'/freeze-held-party.png'});
await page.waitForFunction(()=>window.__freeze.dancing&&window.__freeze.party.celebrations>0,null,{timeout:15000});assert.ok(await page.locator('.freeze-party__confetti:not([hidden])').count()>0);await page.screenshot({path:out+'/freeze-success-confetti.png'});await home();assert.equal(await page.locator('.freeze-party').count(),0);
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});
await enter('Sprint','sprint-model-player-1');await mode('run');await page.waitForFunction(()=>window.__sprint().players.every(p=>p.stars>0),null,{timeout:15000});assert.equal(await page.locator('.sprint-race__card').count(),2);await page.screenshot({path:out+'/sprint-two-player.png'});await home();
await page.setViewportSize({width:1024,height:768});await enter('Shape Up','.shapeup-coach-card');await page.evaluate(()=>window.__matchShape=true);await page.waitForFunction(()=>window.__shapeup.seats[0].stars===3,null,{timeout:20000});assert.equal(await page.locator('.shapeup-quest').count(),2);assert.equal(await page.locator('.shapeup-quest-step').count(),16);assert.equal(await page.evaluate(()=>window.__shapeup.seats[1].stars),0,'second player has independent quest progress');await page.screenshot({path:out+'/pose-quest-two-tablet.png'});await page.evaluate(()=>window.__matchShape=false);await home();
await enter('Freeze','.freeze-party');assert.equal(await page.locator('.freeze-party__ball').count(),1);await page.screenshot({path:out+'/freeze-two-player-tablet.png'});await home();
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['rendered running skin moves','idle animation earns0','jog stars and turbo','arm-pump fallback','race finish medal','pose quest stars/once-only reward','three-pose chain bonus','full24star/gold quest finish','camera-visible disco ball/lights','freeze holds party motion','success confetti','two-player/tablet quest and race','cleanup'],errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(JSON.stringify(await page.evaluate(()=>({state:window.render_game_to_text?.(),sprint:window.__sprint?.(),shape:window.__shapeup?{phase:window.__shapeup.phase,index:window.__shapeup.index,seats:window.__shapeup.seats}:null,freeze:window.__freeze?{time:window.__freeze.time,dancing:window.__freeze.dancing,scores:window.__freeze.scores}:null,testError:window.__testError})),null,2));throw error;}finally{await browser.close();}
