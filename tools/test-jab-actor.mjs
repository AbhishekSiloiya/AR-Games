import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.AR_TEST_OUTPUT||'test-results/jab-focus';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:810}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto((process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5183')+'/tools/jab-proof.html');
 await page.waitForFunction(()=>window.__jabProof);await page.waitForTimeout(800);
 const before=await page.evaluate(()=>window.__jabProof.state());await page.screenshot({path:out+'/proof-ready.png'});
 const skin=()=>page.evaluate(()=>window.__jabProof.actor.model.findComponents('render').flatMap(r=>r.meshInstances).filter(m=>m.skinInstance).map(m=>Array.from(m.skinInstance.matrixPalette)));
 const a=await skin();assert.ok(a.length>0,'character actually renders skinned geometry');
 await page.evaluate(()=>window.__jabProof.setMode('present'));await page.waitForTimeout(1300);
 const after=await page.evaluate(()=>window.__jabProof.state());assert.notEqual(after.leftArm,before.leftArm,'presentation moves the arm joint');assert.ok(after.feet.every((foot,i)=>foot.every((v,j)=>Math.abs(v-before.feet[i][j])<.002)),'feet stay planted during presentation');
 assert.notDeepEqual(await skin(),a,'GPU skin palette changes with real joint articulation');await page.screenshot({path:out+'/proof-present.png'});
 await page.evaluate(()=>{window.__jabProof.actor.hit(0);});await page.waitForTimeout(70);await page.screenshot({path:out+'/proof-impact.png'});
 await page.evaluate(()=>window.__jabProof.setMode('celebrate'));await page.waitForTimeout(350);await page.screenshot({path:out+'/proof-celebrate.png'});
 await page.evaluate(()=>window.__jabProof.setMode('duck'));await page.waitForTimeout(250);const crouched=await page.evaluate(()=>window.__jabProof.state());assert.ok(crouched.feet.every((foot,i)=>foot.every((v,j)=>Math.abs(v-before.feet[i][j])<.005)),'feet stay planted during the crouch');await page.screenshot({path:out+'/proof-duck.png'});
 await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(100);await page.screenshot({path:out+'/proof-tablet.png'});
 assert.deepEqual(errors,[]);console.log('PASS authored skinned Rizzquake, real GPU joint changes, presentation, planted feet, impact, celebration and tablet frame');
}finally{await browser.close();}
