const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.AR_TEST_OUTPUT || 'test-results/moon';fs.mkdirSync(out,{recursive:true});
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
 if(window.__testMode==='noHands')b[15][2]=b[16][2]=0;
 for(let i=0;i<2;i++){
 const bb=b.map(q=>[...q]);if(window.__pair)for(const q of bb)q[0]=(q[0]-.5)*.5+(i===0?.27:.73);
 pose.players[i].body=bb;if(window.__testMode==='dance')pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=window.__matchShape&&i===0&&window.__shapeup?[...window.__shapeup.order[window.__shapeup.index][1]]:pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
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



assert.equal(await page.title(),'MOON · Move ON');
await enter('Slice','.moon-slice');
assert.equal(await page.locator('.moon-slice__momentum').count(),1);
assert.equal(await page.evaluate(()=>!!window.__pc.root.findByName('equipment-ninja-0')),false);
// Place live fruit on the hand's real stage projection and swing through it. Exercise collision/scoring, not the overlay directly.
await page.evaluate(()=>{window.__hit=(kind='fruit',count=1)=>{const s=window.__slice,pl=window.__romp.players[0];const h=pl.hands[0];h.vx=12;h.vy=0;const aspect=pl.frame.aspect,unit=Math.min(9,16/aspect),r=pl.rig[15],x=(pl.frame.x-aspect/2+r[0]*pl.frame.sw)*unit,y=(.5-pl.frame.y+r[1]*pl.frame.sw)*unit;for(const pc of s.pieces.filter(q=>q.kind===kind).slice(0,count)){pc.state='whole';pc.zone=0;pc.x=x;pc.y=y;pc.vx=0;pc.vy=0;}};});
await page.evaluate(()=>window.__hit('fruit',5));await page.waitForFunction(()=>window.__slice.state.cut[0]>=5);await page.waitForTimeout(150);
assert.match(await page.locator('.moon-slice__momentum strong').textContent(),/Juicy|zone|Unstoppable/);await page.screenshot({path:out+'/slice-earned-streak.png'});
await page.waitForFunction(()=>window.__slice.state.bestSlash[0]>=3);await page.evaluate(()=>window.__hit('bomb'));await page.waitForFunction(()=>window.__slice.state.combo[0]===0);assert.match(await page.locator('.moon-slice__momentum strong').textContent(),/first cut/);await page.screenshot({path:out+'/slice-bomb-reset.png'});await home();assert.equal(await page.locator('.moon-slice').count(),0);
await mode('noHands');await page.getByRole('button',{name:/Freeze/}).first().click();await page.getByRole('button',{name:'Prism',exact:true}).click();await mode('neutral');await page.waitForTimeout(1300);assert.equal(JSON.parse(await page.evaluate(()=>window.render_game_to_text())).screen,'brief','framed players can choose gear without auto-start');assert.equal(await page.getByRole('button',{name:'Prism',exact:true}).getAttribute('aria-pressed'),'true');await page.screenshot({path:out+'/freeze-style-choice.png'});await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.locator('.moon-freeze[data-look="prism"]').waitFor();await page.waitForTimeout(4000);assert.equal(await page.evaluate(()=>window.__pc.root.findByName('disco-fashion-prism').enabled),true);await mode('dance');await page.waitForFunction(()=>window.__freeze.time>0);assert.equal(await page.locator('.moon-freeze__visor').evaluate(e=>e.complete&&e.naturalWidth>0&&!e.hidden),true);assert.equal(await page.getByRole('status').filter({hasText:'DANCE'}).count(),1);await page.screenshot({path:out+'/freeze-prism-dance.png'});await mode('neutral');
await page.waitForFunction(()=>!window.__freeze.dancing,null,{timeout:15000});assert.equal(await page.locator('.moon-freeze__cue strong').textContent(),'FREEZE');const angle=await page.evaluate(()=>window.__freeze.party.angle);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.__freeze.party.angle),angle);await page.screenshot({path:out+'/freeze-hold.png'});
await page.waitForFunction(()=>document.querySelector('.moon-freeze__seat').dataset.reward==='true',null,{timeout:12000});assert.match(await page.locator('.moon-freeze__seat strong').textContent(),/NAILED IT/);await page.screenshot({path:out+'/freeze-earned-chain.png'});
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__freeze.time);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__freeze.time),paused);await page.getByRole('button',{name:'Keep playing'}).click();await home();assert.equal(await page.locator('.moon-freeze,.freeze-party').count(),0);
await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});await page.setViewportSize({width:1024,height:768});await mode('noHands');await page.getByRole('button',{name:/Slice/}).first().click();await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.locator('.moon-slice__momentum[data-player="1"]').waitFor();await page.waitForTimeout(4000);await page.evaluate(()=>window.__slice.state.power.double[1]=8);await page.waitForFunction(()=>document.querySelector('.moon-slice__momentum[data-player="1"] strong').textContent==='Double points!');assert.notEqual(await page.locator('.moon-slice__momentum[data-player="0"] strong').textContent(),'Double points!');assert.match(await page.locator('.moon-slice__momentum[data-player="1"] small').textContent(),/s remaining/);await page.screenshot({path:out+'/slice-rivals-power-tablet.png'});await home();await mode('noHands');await page.getByRole('button',{name:/Freeze/}).first().click();await page.getByRole('button',{name:'Minimal',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.locator('.moon-freeze[data-look="minimal"]').waitFor();await page.waitForTimeout(4000);assert.equal(await page.locator('.moon-freeze__seat').count(),2);assert.equal(await page.evaluate(()=>window.__pc.root.findByName('disco-fashion-minimal').enabled),false);await page.screenshot({path:out+'/freeze-minimal-two-tablet.png'});await home();
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['MOON brand','actual Slice collision/streak/slash','bomb resets momentum','Prism preference and gear','visible Freeze cues','frozen party motion','earned hold chain','pause clock','natural-pose briefing customization','accessible phase cue','independent rival power timer','two-player Minimal tablet','round cleanup'],errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});console.error(JSON.stringify({error:String(error),errors,state:await page.evaluate(()=>window.render_game_to_text?.())},null,2));throw error;}finally{await browser.close();}
