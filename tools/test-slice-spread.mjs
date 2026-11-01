const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out=process.env.AR_TEST_OUTPUT || 'test-results/slice-spread';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'slice',variant:'',stage,score:300,points:0,stars:3,xp:0}))}));Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
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
 pose.players[i].body=bb;if(window.__testMode==='dance'&&(!window.__danceSeat||window.__danceSeat[i]))pose.players[i].energy+=.16;pose.players[i].lift=window.__testMode==='squat'?-.85:0;pose.players[i].liftV=window.__testMode==='rise'?3:0;
 const pairs=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];pose.players[i].angles=window.__matchShape&&i===0&&window.__shapeup?[...window.__shapeup.order[window.__shapeup.index][1]]:pairs.map(([a,z])=>Math.atan2(bb[a][1]-bb[z][1],(bb[z][0]-bb[a][0])*4/3));
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
async function enterSlice(modeName='Arcade',court=false,versus=false){await mode('noHands');await page.getByRole('button',{name:/Slice/}).first().click();await page.locator('.node').first().click();await page.getByRole('button',{name:modeName,exact:true}).click();if(versus)await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('button',{name:court?'Orchard court + hand trails':'See yourself',exact:true}).click();await mode('neutral');await page.evaluate(()=>window.__sliceTips=[{x:-3,y:0},{x:5,y:-3},{x:3,y:0},{x:6,y:-3}]);await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__slice?.snapshot().time>0);await page.evaluate(()=>window.__slice.state.spawnIn.fill(9999));}
await enterSlice();
async function pairedArc(label,z=0){
 await page.evaluate(z=>{window.__sliceTips=Array.from({length:4},()=>({x:-7,y:-4,vx:0}));window.__injectPose();window.__testPose.players.forEach(p=>p.hands.forEach(h=>h.seen=false));const s=window.__slice;s.pieces.forEach(p=>p.state='off');s.state.spawnIn.fill(9999);s.state.spawnIn[z]=0;window.__nativeRandom=Math.random;Math.random=()=>.8;s.advance(17);s.state.spawnIn.fill(9999);window.__arc=s.pieces.filter(p=>p.state==='whole'||p.state==='wait');window.__starts=window.__arc.map(p=>({x:p.x,y:p.y}));s.advance(1250);Math.random=window.__nativeRandom;},z);
 const arc=await page.evaluate(async z=>{const {cameraLaunchArea}=await import('/src/calibration.ts');const p=window.__testPose;const {cameraReach}=await import('/src/pose.ts');const r=cameraReach[z];const a=window.__slice.snapshot().arena.source==='live-camera'&&r?cameraLaunchArea(r.left,r.right,p.players[z].frame.aspect,.75):{centre:window.__pair?(z-.5)*8:0,half:(window.__pair?4:8)-.45};return {a,starts:window.__starts,apex:window.__arc.map(p=>({x:p.x,y:p.y,state:p.state,zone:p.zone}))};},z);
 await page.screenshot({path:out+'/'+label+'.png'});fs.writeFileSync(out+'/'+label+'.json',JSON.stringify(arc,null,2));
 assert.ok(arc.apex.length>=2,'natural pair launches');assert.ok(arc.apex.every(p=>p.state==='whole'),'observer hands cannot cut sampled fruit');
 assert.ok(Math.min(...arc.apex.map(p=>p.x))<arc.a.centre-arc.a.half*.55,'left fruit stays visibly left near apex');
 assert.ok(Math.max(...arc.apex.map(p=>p.x))>arc.a.centre+arc.a.half*.55,'right fruit stays visibly right near apex');
}
await pairedArc('live-spread');
const openings=await page.evaluate(()=>{const s=window.__slice;const old=Math.random;Math.random=()=>.01;const xs=[];for(let i=0;i<6;i++){s.pieces.forEach(p=>p.state='off');s.state.spawnIn.fill(9999);s.state.spawnIn[0]=0;s.advance(17);s.state.spawnIn.fill(9999);xs.push(s.pieces.find(p=>p.state==='whole'||p.state==='wait').x);}Math.random=old;return xs;});assert.ok(Math.min(...openings)<-1.2&&Math.max(...openings)>1.2,'successive compact phrases alternate across usable camera width');fs.writeFileSync(out+'/opening-origins.json',JSON.stringify(openings));await home();await enterSlice('Arcade',true);await pairedArc('court-spread');await home();await page.getByRole('button',{name:'Together',exact:true}).click();await page.evaluate(()=>{window.__pair=true;window.__secondReady=true;});for(const court of [false,true]){await enterSlice('Arcade',court,true);await pairedArc((court?'court-':'live-')+'paired-left',0);assert.ok(await page.evaluate(()=>window.__arc.every(p=>p.zone===0&&p.x<0)),'left rival fruit stays in its lane');await pairedArc((court?'court-':'live-')+'paired-right',1);assert.ok(await page.evaluate(()=>window.__arc.every(p=>p.zone===1&&p.x>0)),'right rival fruit stays in its lane');await home();}assert.deepEqual(errors,[]);console.log('PASS natural Slice alternating origins/apex spread in live/court views and independent paired lanes');
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();}
