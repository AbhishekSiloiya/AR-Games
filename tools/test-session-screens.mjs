import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.AR_TEST_OUTPUT||'test-results/session-layout';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage();let failures=[];page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
await page.goto(process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5200/?sim');await page.evaluate(()=>document.fonts.ready);
// Drive only shell state, never gameplay: this keeps layout fixtures deterministic and inexpensive.
await page.evaluate(()=>{
 const root=document.querySelector('#root'),key=Object.keys(root).find(k=>k.startsWith('__reactContainer'));
 const current=()=>{const container=root[key];return container.stateNode.current.child;};
 const app=()=>{let f=current();while(f&&f.type?.name!=='App')f=f.child;return f;};
 window.__layoutState=(value)=>{const f=app();let s=f.memoizedState.next;s.queue.dispatch(value);};
 window.__layoutGet=()=>app().memoizedState.next.memoizedState;
 window.__layoutDb=()=>{let h=app().memoizedState;for(let i=0;i<3;i++)h=h.next;return h;};
 window.__layoutDb().queue.dispatch({profiles:['Alexandra Moonlight Player','Christopher Moonlight Player'],sessions:[],avatars:{}});
 window.__layoutState({at:'home'});
});
await page.getByRole('button',{name:/^Goalie —/}).waitFor();
if(process.env.AR_PAIR==='1')await page.getByRole('button',{name:'Together',exact:true}).click();
const sizes=process.env.AR_SHORT==='1'?[[640,360]]:[[1366,768],[1024,768],[1280,720],[768,1024],[640,360]];
async function fit(selector,label,actions){await page.waitForTimeout(selector==='.moon-results'?1400:260);const m=await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return {h:el.clientHeight,scroll:el.scrollHeight,w:el.clientWidth,sw:el.scrollWidth,top:r.top,bottom:r.bottom};});let okay=m.scroll<=m.h+2&&m.sw<=m.w+2;for(const a of actions){const b=await page.getByRole('button',{name:a,exact:true}).boundingBox();okay&&=!!b&&b.y>=0&&b.y+b.height<=await page.evaluate(()=>innerHeight)&&b.height>=43;}
if(!okay)failures.push({label,...m});await page.screenshot({path:`${out}/${label}.png`});}
try{
for(const [width,height] of sizes){await page.setViewportSize({width,height});
 for(const game of ['Goalie','Jab','Freeze','Shape Up','Slice','Jack Attack']){
  await page.evaluate(()=>window.__layoutState({at:'home'}));await page.waitForTimeout(50);await page.getByRole('button',{name:new RegExp(`^${game} —`)}).click();await fit('.moon-brief',`${width}x${height}-${game.replaceAll(' ','')}-brief`,['Play']);
  if(process.env.AR_BASELINE!=='1'&&['Goalie','Jab','Freeze'].includes(game)){
   await page.getByRole('button',{name:'Game settings',exact:true}).click();await page.getByRole('dialog').waitFor();
   const done=await page.getByRole('button',{name:'Close game settings',exact:true}).boundingBox();assert.ok(done.y>=0&&done.y+done.height<=height&&done.height>=43);
   if(game==='Goalie'){await page.getByRole('button',{name:'Pro',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Pro',exact:true}).getAttribute('aria-pressed'),'true');await page.getByRole('checkbox',{name:'Show target circles',exact:true}).check();assert.equal(await page.getByRole('checkbox',{name:'Show target circles',exact:true}).isChecked(),true);await page.getByRole('checkbox',{name:/Practice first/}).uncheck();}
   if(game==='Jab'){await page.getByRole('button',{name:'Full stretch',exact:true}).click();await page.getByRole('checkbox',{name:/Practice first/}).uncheck();}
   if(game==='Freeze'){await page.getByRole('button',{name:'City Lights',exact:true}).click();assert.equal(await page.getByRole('button',{name:'City Lights',exact:true}).getAttribute('aria-pressed'),'true');}
   if(width===640||width===1024)await page.screenshot({path:`${out}/${width}x${height}-${game.replaceAll(' ','')}-settings.png`});
   await page.getByRole('button',{name:'Close game settings',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);
  }
  await page.getByRole('button',{name:'Play',exact:true}).click();await fit('.player-setup',`${width}x${height}-${game.replaceAll(' ','')}-setup`,['Start game']);
  await page.getByRole('button',{name:'← Back',exact:true}).click();
  await page.evaluate(()=>{const s=window.__layoutGet();window.__layoutState({...s,at:'results',turn:0,scores:[720,430],points:[54,35],rewards:[0,1].map(i=>({stars:i===0?3:1,xp:220,newBest:true,levelUp:4,challenges:['Play three different games','Move for ten minutes'],badges:['first','stars10']})),notes:[['Perfect saves: 15','Longest streak: 8','Accuracy: 96%','A long round note that retains its complete wording'],['Perfect saves: 8','Longest streak: 4']]});});
  // Badge fixtures must use real IDs from the app's catalog.
  await fit('.moon-results',`${width}x${height}-${game.replaceAll(' ','')}-results`,['Play again','Home']);
  if(process.env.AR_BASELINE!=='1'){
   await page.getByRole('button',{name:'Round details',exact:true}).first().click();const detail=page.getByRole('dialog');await detail.waitFor();assert.match(await detail.textContent(),/Move for ten minutes/);assert.match(await detail.textContent(),/Star collector/);assert.match(await detail.textContent(),/Accuracy: 96%/);
   if(game==='Goalie'&&(width===640||width===1024))await page.screenshot({path:`${out}/${width}x${height}-round-details.png`});
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).paused),false,'dialog Escape does not pause the shell');
   await page.evaluate(()=>window.__layoutState({...window.__layoutGet(),at:'next'}));await fit('.session-handoff',`${width}x${height}-${game.replaceAll(' ','')}-handoff`,['Ready']);
  }
 }
}
console.log(JSON.stringify({failures},null,2));if(process.env.AR_BASELINE!=='1')assert.deepEqual(failures,[]);else assert.ok(failures.length>0,'baseline must reproduce overflow');
}finally{await browser.close();}
