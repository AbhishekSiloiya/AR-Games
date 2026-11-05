import assert from 'node:assert/strict';
const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const context=await browser.newContext({permissions:['camera']});const page=await context.newPage();page.on('console',m=>{if(m.type()==='error')console.error('BROWSER',m.text());});page.on('pageerror',e=>console.error('PAGE',e.message));
try{
 await page.addInitScript(()=>{
  localStorage.setItem('romp.frames','copied');localStorage.setItem('romp.model','lite');
  const Native=Worker;window.__trackerWorkers=[];window.Worker=class extends Native{constructor(...args){super(...args);window.__trackerWorkers.push(this);}};
  const capture=window.createImageBitmap.bind(window);window.__captureDelay=80;window.__captureActive=0;window.__captureMax=0;
  window.createImageBitmap=async(...args)=>{window.__captureActive++;window.__captureMax=Math.max(window.__captureMax,window.__captureActive);try{await new Promise(r=>setTimeout(r,window.__captureDelay));return await capture(...args);}finally{window.__captureActive--;}};
 });
 await page.route('**/report',r=>r.fulfill({status:204,body:''}));
 await page.goto(process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5240/');
 // Exercise normal camera startup, actual worker/model and menu, without starting a game renderer.
 await page.getByRole('button',{name:'Start',exact:true}).click();
 await page.waitForFunction(()=>window.__romp?.trackerDiagnostics);await page.evaluate(()=>window.__tracking=window.__romp);
 await page.waitForFunction(()=>window.__tracking.trackerDiagnostics().results>=4,null,{timeout:60000});
 let info=await page.evaluate(()=>window.__tracking.trackerDiagnostics());console.log('initial',JSON.stringify(info));
 assert.equal(info.route,'copied');assert.equal(info.actualModel,'lite');assert.ok(info.captures>0&&info.skipped>0);assert.equal(await page.evaluate(()=>window.__captureMax),1,'one capture allocation at a time, even when copying takes80ms');
 await page.evaluate(()=>window.__captureDelay=0);
 for(const expected of [1,2]){
  const previousResults=await page.evaluate(()=>window.__tracking.trackerDiagnostics().results);
  await page.evaluate(()=>{const w=window.__trackerWorkers.at(-1);window.__oldTrackerHandler=w.onmessage;w.terminate();});
  await page.waitForFunction(n=>window.__tracking.trackerDiagnostics().recoveries===n&&window.__tracking.trackerDiagnostics().route==='copied'&&window.__tracking.trackerDiagnostics().captures>0,expected,{timeout:60000});
  await page.waitForFunction(n=>window.__tracking.trackerDiagnostics().results>n,previousResults,{timeout:60000});
  const rejected=await page.evaluate(()=>{const before=window.__tracking.trackerDiagnostics().results;window.__oldTrackerHandler({data:{type:'pose',landmarks:[],t:performance.now(),ms:0}});return window.__tracking.trackerDiagnostics().results===before;});assert.equal(rejected,true,'obsolete worker callback cannot publish into replacement');
 }
 await page.evaluate(()=>window.__trackerWorkers.at(-1).terminate());
 await page.waitForFunction(()=>window.__tracking.trackerDiagnostics().route==='inline',null,{timeout:60000});
 await page.waitForFunction(()=>window.__tracking.trackerDiagnostics().status==='ready',null,{timeout:25000});
 const before=await page.evaluate(()=>window.__tracking.trackerDiagnostics().results);await page.waitForTimeout(1200);info=await page.evaluate(()=>window.__tracking.trackerDiagnostics());
 assert.equal(info.recoveries,2,'finite worker recovery cap');assert.equal(info.requestedModel,'lite');assert.equal(info.actualModel,'lite');assert.ok(info.results>before,'real inline inference continues');assert.ok(info.results-before<=20,'inline inference is paced rather than every60Hz camera frame');
 console.log('PASS actual copied inference, bounded delayed captures, missing replies, finite worker recovery, old callback rejection and real paced inline fallback',JSON.stringify(info));
}finally{await browser.close();}
