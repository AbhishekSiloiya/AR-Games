import assert from 'node:assert/strict';
import fs from 'node:fs';
// Exercise the real actor material setup against PlayCanvas's uniform contract,
// without loading character assets or creating a graphics device.
if(process.env.AR_MATERIALS_ONLY==='1'){
 const {StandardMaterial,Color,Vec2,ADDRESS_REPEAT}=await import('playcanvas');
 const root=process.env.AR_MATERIAL_SOURCE_ROOT||process.cwd();
 for(const file of ['src/jab-actor.ts','src/goalie-striker.ts','src/freeze-dancer.ts']){
  const source=fs.readFileSync(root+'/'+file,'utf8'),start=source.indexOf(file.includes('jab-')?'const shiny=':'m.useSkybox=false'),end=source.indexOf('m.update();',start),setup=source.slice(start,end);
  for(const name of ['Rizz / moss knit','Rizz / charcoal curls','Rizz / belt edging','Rizz / eye ivory','Rizz / catchlights']){
   const original=new StandardMaterial();original.name=name;const m=original.clone(),wool={},fabric={};
   new Function('m','original','wool','fabric','Color','Vec2','ADDRESS_REPEAT',setup)(m,original,wool,fabric,Color,Vec2,ADDRESS_REPEAT);
   m.updateUniforms({},{});
   if(m.useSheen){assert.ok(m.getParameter('material_sheen'),file+': enabled sheen must upload its colour uniform');assert.ok(m.getParameter('material_sheenGloss'),file+': enabled sheen must upload its gloss uniform');}
   assert.equal(m.useLighting,true,'material remains lit');assert.equal(m.useMetalness,false,'the existing specular workflow is retained');
   if(!/eye|iris|pupil|catchlight/.test(name))assert.equal(m.diffuseMap,file.includes('jab-')?wool:fabric,'the original fabric texture remains attached');
   m.destroy();original.destroy();
  }
 }
 console.log('PASS Jab / Goalie / Freeze actual actor material setup: complete optional shader uniforms, lit fabric retained.');process.exit(0);
}
const { chromium } = await import(process.env.AR_PLAYWRIGHT_MODULE || 'playwright');
const out=process.env.AR_TEST_OUTPUT || 'test-results/render-effects';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['camera']});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const warnings=[];page.on('console',m=>{if(m.type()==='warning'||m.type()==='warn')warnings.push(m.text());});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text()!=='INFO: Created TensorFlow Lite XNNPACK delegate for CPU.') errors.push(m.text());});
try {
await page.addInitScript(()=>{if(!localStorage.getItem('romp.v1'))localStorage.setItem('romp.v1',JSON.stringify({profiles:['Player 1','Player 2'],sessions:[1,2,3,4].map(stage=>({t:Date.now(),who:'Player 1',game:'slice',variant:'',stage,score:300,points:0,stars:3,xp:0}))}));Element.prototype.requestFullscreen=()=>Promise.resolve();const Native=window.Worker;window.__testWorkers=[];window.Worker=class extends Native {constructor(...args){super(...args);window.__testWorkers.push(this);}};});
// Static deployments have no optional /report collector; stub only that endpoint.
await page.route('**/report',route=>route.fulfill({status:204,body:''}));
await page.goto(process.env.AR_GAME_TEST_URL || 'http://127.0.0.1:5180/');
await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/start-desktop.png'});
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
async function park(){await page.evaluate(()=>{window.__jabHands=Array.from({length:4},(_,i)=>({x:i%2?1:-1,y:-1,vx:0,vy:0}));window.__injectPose();});}
async function enter(practice=true,reach='comfort',stage=1){await mode('noHands');await page.getByRole('button',{name:/Goalie/}).first().click();await page.locator('.node').nth(stage-1).click();await page.getByRole('button',{name:'Game settings',exact:true}).click();await page.getByRole('button',{name:reach==='comfort'?'Comfortable':'Full stretch',exact:true}).click();await page.getByRole('checkbox',{name:/Practice first/}).setChecked(practice);await page.getByRole('button',{name:'Close game settings',exact:true}).click();await page.waitForFunction(stage=>document.querySelector('.keeper-lesson small')?.textContent?.startsWith('STAGE '+stage+' /'),stage);await page.locator('.moon-brief-art>img').first().evaluate(img=>img.decode());await page.waitForTimeout(250);await page.screenshot({path:out+`/briefing-stage-${stage}.png`});await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await park();await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__goalie);await page.waitForTimeout(100);}
async function home(){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Back to home',exact:true}).click();}
async function save(p=0,hand=0){await page.waitForFunction(p=>['windup','flight'].includes(window.__goalie.states[p].phase),p);const before=await page.evaluate(p=>({hits:window.__goalie.states[p].saves,lesson:window.__goalie.states[p].practiceSaves,practice:window.__goalie.practicing}),p);await page.evaluate(({p,hand})=>{const s=window.__goalie.states[p],n=window.__goalie.states.length,cx=n===1?0:p===0?-3.35:3.35,gain=n===1?5.1:2.85,vertical=n===1?2.8:2.15;window.__jabHands[p*2+hand]={x:(s.tx-cx)/gain,y:(s.ty-.1)/vertical,vx:0,vy:0};window.__injectPose();},{p,hand});await page.waitForFunction(({p,before})=>before.practice?window.__goalie.states[p].practiceSaves>before.lesson||!window.__goalie.practicing:window.__goalie.states[p].saves>before.hits,{p,before});if(!before.practice)assert.ok(await page.evaluate(p=>window.__goalie.states[p].velocity.z<0,p),'saved ball deflects toward the pitch');}
async function enterFreeze(stage=1){await mode('noHands');await page.getByRole('button',{name:/Freeze/}).first().click();await page.locator('.node').nth(stage-1).click();await page.getByRole('button',{name:'Play',exact:true}).click();await mode('neutral');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__freeze?.studio);}

async function enterSlice(modeName='Arcade',court=false,versus=false){await mode('noHands');await page.getByRole('button',{name:/Slice/}).first().click();await page.locator('.node').first().click();await page.getByRole('button',{name:modeName,exact:true}).click();if(versus)await page.getByRole('button',{name:'⚔️ Versus',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).click();if(court)await page.getByRole('button',{name:'Orchard court + hand trails',exact:true}).click();await mode('neutral');await page.evaluate(()=>window.__sliceTips=[{x:-3,y:0},{x:5,y:-3},{x:3,y:0},{x:6,y:-3}]);await page.getByRole('button',{name:'Start game',exact:true}).click();await page.waitForFunction(()=>window.__slice?.snapshot().time>0);await page.evaluate(()=>window.__slice.state.spawnIn.fill(9999));}
async function plant(kind='fruit',count=3,zone=0,x=0){await page.evaluate(({kind,count,zone,x})=>{const pcs=window.__slice.pieces;pcs.forEach(pc=>pc.state='off');for(const [i,pc] of pcs.filter(pc=>pc.kind===kind).slice(0,count).entries())Object.assign(pc,{state:'whole',zone,x:x+i*.35,y:window.__slice.snapshot().arena.source==='orchard'?window.__slice.snapshot().hands[0].y:0,vx:0,vy:0,age:0,power:'double'});},{kind,count,zone,x});}
async function swipe(p=0){await page.evaluate(p=>{window.__sliceTips[p*2]={x:-3,y:0,vx:0};window.__injectPose();},p);await page.waitForTimeout(170);await page.evaluate(p=>{window.__sliceTips[p*2]={x:3,y:0,vx:8};window.__injectPose();},p);await page.waitForTimeout(100);await page.evaluate(p=>{window.__sliceTips[p*2].vx=0;},p);}


// Software GPU runs normally disable bloom after a slow countdown. Keep the real
// CameraFrame active in this test; destroy() still calls disable() during teardown.
// Every capture also asserts the actual bloom pass and visible skinned meshes.
const transformedEngine=await (await page.request.get(new URL('/src/engine.ts',page.url()).href)).text();
const playcanvasImport=transformedEngine.match(/from\s+["']([^"']*playcanvas[^"']*)["']/)[1];
await page.evaluate(async url=>{const {CameraFrame}=await import(url);const property=Object.getOwnPropertyDescriptor(CameraFrame.prototype,'enabled');Object.defineProperty(CameraFrame.prototype,'enabled',{configurable:true,get:property.get,set(value){if(value!==false)property.set.call(this,value);}});},playcanvasImport);
await page.evaluate(async()=>{const {pace,effects}=await import('/src/pace.ts');effects.on=true;Object.defineProperty(pace,'lean',{configurable:true,get:()=>false,set:()=>{}});});
async function lockFrame(){await page.waitForFunction(()=>window.__pc.root.findByName('camera')?.camera?.framePasses?.[0]?.cameraFrame);return page.evaluate(()=>{const frame=window.__pc.root.findByName('camera').camera.framePasses[0].cameraFrame;window.__frame=frame;return {enabled:frame.enabled,bloom:frame.bloom.intensity};});}
async function capture(label){await page.waitForTimeout(200);const proof=await page.evaluate(()=>{const camera=window.__pc.root.findByName('camera').camera,frame=camera.framePasses?.[0]?.cameraFrame,model=window.__goalie?.actors?.[0]?.model??window.__freeze?.actor.model;return {frameEnabled:frame?.enabled,bloomIntensity:frame?.bloom.intensity,bloomActive:!!frame?.renderPassCamera?.bloomPass,skinnedInstances:model?.findComponents('render').flatMap(r=>r.meshInstances).filter(mi=>mi.skinInstance&&mi.visible).length,materials:model?.findComponents('render').flatMap(r=>r.meshInstances).map(mi=>({node:mi.node.name,material:mi.material.name,sheen:mi.material.useSheen,metalness:mi.material.useMetalness,emissive:mi.material.emissive?.toString(),diffuse:mi.material.diffuse?.toString()}))};});assert.equal(proof.frameEnabled,true,'effect coverage must retain CameraFrame');if(label.includes('bloom'))assert.equal(proof.bloomActive,true,'bloom must actually render');if(!label.startsWith('slice'))assert.ok(proof.skinnedInstances>0,'the actual visible character must still be rendered');fs.writeFileSync(out+'/'+label+'.json',JSON.stringify(proof,null,2));await page.screenshot({path:out+'/'+label+'.png'});}
async function assertAnimated(handle){const before=await page.evaluate(handle=>{const state=window[handle],model=handle==='__goalie'?state.actors[0].model:state.actor.model;return JSON.stringify(Array.from(model.findComponents('render').flatMap(r=>r.meshInstances).find(mi=>mi.skinInstance).skinInstance.matrixPalette));},handle);if(handle==='__freeze')await mode('moving');await page.waitForFunction(({handle,before})=>{const state=window[handle],model=handle==='__goalie'?state.actors[0].model:state.actor.model;return JSON.stringify(Array.from(model.findComponents('render').flatMap(r=>r.meshInstances).find(mi=>mi.skinInstance).skinInstance.matrixPalette))!==before;},{handle,before});}
await enter(false);await lockFrame();await page.waitForFunction(()=>window.__goalie.time>1);await capture('fresh-goalie-bloom');await assertAnimated('__goalie');
await page.evaluate(()=>{window.__frame.bloom.intensity=0;window.__frame.update();});await capture('fresh-goalie-no-effect');
await page.evaluate(()=>{window.__frame.bloom.intensity=.03;window.__frame.update();});await home();
await enterSlice();await lockFrame();
// Prepare a genuine cut at camera cadence without software GPU stalls repeatedly
// resetting Slice's safety gate. This only steps the existing collision update;
// the real scene is rendered with bloom before leaving for the next game.
await page.evaluate(async()=>{const engine=await import('/src/engine.ts');engine.pause(true);window.__jabHands=undefined;window.__slicePump=setInterval(()=>{window.__injectPose();window.__slice.advance(1000/60);},1000/60);});
await page.waitForTimeout(220);await plant();await swipe();await page.waitForFunction(()=>window.__slice.state.cut[0]>=3);await page.evaluate(()=>window.__pc.render());await capture('slice-bloom');await page.evaluate(async()=>{clearInterval(window.__slicePump);(await import('/src/engine.ts')).pause(false);});await home();
await enter(false);await lockFrame();await page.waitForFunction(()=>window.__goalie.time>1);await capture('after-slice-goalie-bloom');await assertAnimated('__goalie');
await page.evaluate(()=>{window.__frame.bloom.intensity=0;window.__frame.update();});await capture('after-slice-goalie-no-effect');
await page.evaluate(()=>{window.__frame.bloom.intensity=.03;window.__frame.update();});
await page.waitForFunction(()=>window.__goalie.states[0].phase==='miss');await capture('after-slice-goalie-miss-bloom');
await home();await enterFreeze();await lockFrame();await page.waitForFunction(()=>window.__freeze.time>1);await capture('freeze-bloom');await assertAnimated('__freeze');await capture('freeze-moving-bloom');await home();
fs.writeFileSync(out+'/warnings.json',JSON.stringify(warnings,null,2));assert.deepEqual(errors,[]);assert.ok(!warnings.some(w=>/material_sheen/.test(w)),'the chosen matte character material must upload every shader uniform');console.log('PASS fresh / post-Slice Goalie and Freeze with real bloom retained, animated skinned characters and no missing-sheen uniforms.');
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();}
