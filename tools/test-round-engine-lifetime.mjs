const {chromium}=await import(process.env.AR_PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.AR_GAME_TEST_URL||'http://127.0.0.1:5199/');
 const result=await page.evaluate(async()=>{
  const engine=await import('/src/engine.ts');
  const first=engine.begin(),events=[];first.cleanup(()=>events.push('first'));
  const assets=engine.app.assets,load=assets.loadFromUrl.bind(assets);let release;
  assets.loadFromUrl=(url,type,callback)=>{if(url.includes('lifetime-proof'))release=()=>{assets.loadFromUrl=load;load(url,type,callback);};else load(url,type,callback);};
  const pending=engine.fitted('/assets/food/apple.glb?lifetime-proof',1);
  engine.end(first);const second=engine.begin();second.ambient('#ffffff',.5);second.fog('#ffffff',20,40);
  first.cleanup(()=>events.push('late first'));first.ambient('#000000');first.fog('#000000',1,2);
  release();const template=await pending;
  const proof={events,lateTemplateChildren:template.children.length,ambient:engine.app.scene.ambientLight.r,fogStart:engine.app.scene.fog.start};
  engine.end(first);proof.roundSurvived=engine.app.root.children.includes(second.root);
  engine.end(second);return proof;
 });
 assert.deepEqual(result.events,['first','late first'],'cleanup registered after leaving runs immediately');
 assert.equal(result.lateTemplateChildren,0,'old asynchronous fitted model is destroyed immediately');
 assert.equal(result.ambient,.5,'stale scene cannot repaint the next game ambient light');
 assert.equal(result.fogStart,20,'stale scene cannot change the next game fog');
 assert.equal(result.roundSurvived,true,'stale scene teardown cannot end the current game');
 assert.deepEqual(errors,[]);console.log('PASS closed Scene late cleanup, delayed fitted-resource disposal, stale lighting/fog and round-specific end guard.');
}finally{await browser.close();}
