import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.AR_TEST_OUTPUT||'test-results/goalie-stages';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[];
try{
 for(let stage=1;stage<=5;stage++){
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:stage===4?'reduce':'no-preference'});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto((process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5184/')+`tools/goalie-proof.html?sim&stage=${stage}`);
  await page.waitForFunction(()=>window.__goalie);await page.evaluate(()=>document.fonts.ready);
  const titles=['Find your hands','Own the corners','High. Low. Hero.','Read the curve','The final wall'];
  assert.equal(await page.evaluate(()=>window.__goalie.snapshot().stage),stage,'stage selection reaches the actual gameplay');
  assert.match(await page.locator('.keeper-brand').textContent(),new RegExp(titles[stage-1].replaceAll('.','\\.')));
  await page.screenshot({path:`${out}/stage-${stage}-intro.png`});
  await page.evaluate(()=>window.advanceTime(3200));
  await page.waitForFunction(()=>['windup','flight'].includes(window.__goalie.states[0].phase));
  const s=await page.evaluate(()=>window.__goalie.snapshot());
  assert.equal(s.lesson,titles[stage-1]);assert.equal(s.music.theme,['stadium','keeperCorners','keeperHeights','keeperCurve','keeperFinal'][stage-1]);
  assert.ok(s.seats[0].progress.goal>0);assert.equal(s.seats[0].score,0);
  if(stage>=4)assert.match(s.art,/floodlit/);else if(stage===3)assert.match(s.art,/sunset/);
  await page.screenshot({path:`${out}/stage-${stage}-play.png`});
  const actual=[];
  // Drive the real input via pointer movement; actual collision rules earn each save.
  for(let i=0;i<5;i++){
   await page.waitForFunction(i=>window.__goalie.states[0].index>=i+1&&['windup','flight'].includes(window.__goalie.states[0].phase),i);
   const q=await page.evaluate(()=>{const s=window.__goalie.states[0];return {x:s.tx,y:s.ty,bend:s.bend,saves:s.saves,score:s.score};});actual.push(q);
   await page.mouse.move((q.x/5.1+1)*720,(1-(q.y-.1)/2.8)*450);
   await page.waitForFunction(hits=>window.__goalie.states[0].saves>hits,q.saves);
   if(i===2){assert.match(await page.locator('.keeper-cue strong').textContent(),/HAT.TRICK/);await page.screenshot({path:`${out}/stage-${stage}-streak.png`});}
   if(i<4)await page.evaluate(()=>window.advanceTime(1300));
  }
  assert.equal(await page.evaluate(()=>window.__goalie.states[0].saves),5);assert.match(await page.locator('.keeper-cue strong').textContent(),/THE WALL/);
  if(stage===4){assert.ok(actual.some(s=>s.bend>0)&&actual.some(s=>s.bend<0));assert.equal(await page.locator('.keeper-session').getAttribute('data-motion'),'false');}
  if(stage===5){await page.evaluate(()=>window.advanceTime(35000));await page.waitForFunction(()=>window.__goalie.time>=50);await page.waitForFunction(()=>window.__goalie.states[0].finale);assert.match(await page.locator('.keeper-cue small').textContent(),/FINAL SHOWDOWN/);await page.screenshot({path:`${out}/final-showdown.png`});}
  fs.writeFileSync(`${out}/stage-${stage}.json`,JSON.stringify({s,actual},null,2));
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS five stage introductions, actual scene/music, pointer-driven saves and streaks, curved shots, reduced motion and final showdown');
}finally{await browser.close();}
