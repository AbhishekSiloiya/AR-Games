const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required','--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>{
  const create=AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource=function(){
   const context=this,source=create.call(context),connect=source.connect.bind(source),stop=source.stop.bind(source);
   source.connect=(target,...args)=>{if(source.loop){window.__audio=context;window.__songSource=source;window.__songGain=target;}return connect(target,...args);};
   source.stop=(...args)=>{if(source.loop)window.__songStopped=true;return stop(...args);};return source;
  };
 });
 await page.goto(process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5181/?sim');
 await page.evaluate(async()=>{window.__dance=await import('/src/dance-music.ts');});
 for(const id of ['funky','city']){
  await page.evaluate(id=>{window.__dance.chooseDance(id);window.__songGain=null;window.__songStopped=false;window.__song=window.__dance.startDanceTrack(0);window.__song.gate(true);},id);
  await page.waitForFunction(()=>window.__songGain?.gain.value>.3&&window.__songSource.buffer.duration>10,null,{timeout:30000});
  await page.evaluate(()=>window.__song.gate(false));await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>window.__songGain.gain.value<.01),'Freeze gates recording to silence');
  await page.evaluate(()=>window.__song.gate(true));await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>window.__songGain.gain.value>.4),'dance phase resumes recording');
  await page.evaluate(()=>window.__audio.suspend());const t=await page.evaluate(()=>window.__audio.currentTime);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__audio.currentTime),t,'pause freezes shared audio clock');
  await page.evaluate(async()=>{await window.__audio.resume();window.__song.stop();});assert.equal(await page.evaluate(()=>window.__songStopped),true,'leaving round stops recorded source');
 }
 assert.deepEqual(errors,[]);console.log('PASS: both CC0 recordings decode, dance/freeze gating, audio pause/resume and round cleanup.');
}finally{await browser.close();}
