import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.AR_TEST_OUTPUT||'test-results/release-ui';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage();let failures=[];page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
await page.goto(process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5200/?sim');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
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

try{
 assert.equal(await page.locator('.moon-poster-buddy').count(),0,'six game portraits must replace the repeated orange character sticker');
 const art=await page.locator('.moon-poster-art>img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));assert.equal(art.length,6);assert.equal(new Set(art).size,6);assert.ok(art.every(src=>src.startsWith('/assets/moon/cards/')));await page.locator('.moon-poster-art>img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));await page.waitForTimeout(650);await page.screenshot({path:out+'/select-six.png'});
 await page.getByRole('button',{name:'Together',exact:true}).click();
 for(const [width,height]of [[1440,900],[1024,768],[640,360],[375,812]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.__layoutState({at:'home'}));await page.getByRole('button',{name:/^Jab —/}).click();await page.locator('.node').first().click();
  await page.evaluate(()=>{const s=window.__layoutGet(),variant=[s.mode,s.game.team?'team':''].filter(Boolean).join('+');window.__layoutDb().queue.dispatch(db=>({...db,sessions:db.profiles.map(who=>({who,game:s.game.id,stage:1,variant,score:999,stars:3,points:0,t:Date.now()}))}));window.__layoutState({...s,at:'results',turn:0,scores:[720,430],points:[54,35],rewards:[0,1].map(()=>({stars:2,xp:220,newBest:true,levelUp:0,challenges:[],badges:[]})),notes:[['Actual round details'],['Actual round details']]});});
  await page.getByRole('button',{name:'Next stage →',exact:true}).waitFor();await page.waitForTimeout(1400);for(const name of ['Play again','Next stage →','Home']){const box=await page.getByRole('button',{name,exact:true}).boundingBox();assert.ok(box&&box.height>=55&&box.width>=140&&box.y>=0&&box.y+box.height<=height,`${name} must be a large visible action at${width}x${height}: ${JSON.stringify(box)}`);}
  assert.equal(await page.locator('.moon-results').evaluate(el=>el.scrollHeight<=el.clientHeight+2&&el.scrollWidth<=el.clientWidth+2),true,'results fit without internal scroll');await page.screenshot({path:out+`/actions-${width}.png`});await page.getByRole('button',{name:'Next stage →',exact:true}).click();await page.locator('.player-setup').waitFor();await page.evaluate(()=>window.__layoutState({at:'home'}));
 }
 console.log('PASS six distinct loaded portraits, large reachable replay/next/home actions, correct next-stage route and paired viewport fit');
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();}
