import assert from 'node:assert/strict';
export async function jabGuardFeint(page){
 await page.waitForFunction(()=>{const s=window.__jab.states[0];return s.phase==='strike'&&s.age<.25;});
 const {target,hand,before}=await page.evaluate(()=>{const j=window.__jab,s=j.states[0];return {target:j.actors[0].state().mitts[s.action.hand],hand:s.action.hand,before:s.hits};});
 const sign=Math.sign(target.x)||1,y=(target.y-1.05)/2.4;
 await page.evaluate(({hand,sign,y})=>{window.__jabHands??=[];window.__jabHands[hand]={x:sign*.18,y,vx:0,vy:0};},{hand,sign,y});await page.waitForTimeout(120);
 let peak=0;
 for(let k=1;k<=4;k++){
  await page.evaluate(({hand,sign,y,k})=>{window.__jabHands[hand]={x:sign*(.18+k*.03),y,vx:sign*2,vy:0};},{hand,sign,y,k});await page.waitForTimeout(15);
  peak=Math.max(peak,await page.evaluate(hand=>window.__jab.gloves.all[hand].state.speed,hand));
 }
 assert.ok(peak>4.5,'short guard stroke exceeds punch speed threshold');
 assert.equal(await page.evaluate(()=>window.__jab.states[0].hits),before,'fast short guard movement cannot reach the outer mitt');
 await page.evaluate(hand=>window.__jabHands[hand].vx=0,hand);await page.waitForTimeout(100);
}
export async function jabPunch(page,seat=0,wrong=false,practice=false){
 // Start on a fresh presentation, rather than racing the end of an old window.
 await page.waitForFunction(({p,practice})=>{const s=window.__jab.states[p];return s.phase==='strike'&&(practice||s.age<.25);},{p:seat,practice});
 const count=()=>page.evaluate(({p,practice})=>practice?window.__jab.practiceSeats[p].hits:window.__jab.states[p].hits,{p:seat,practice});
 const hitCount=await count();
 const {target,hand,n}=await page.evaluate(({p,wrong})=>{const j=window.__jab,s=j.states[p],hand=wrong?1-s.action.hand:s.action.hand;return {hand,target:j.actors[p].state().mitts[s.action.hand],n:j.states.length};},{p:seat,wrong});
 const cx=n===1?0:seat===0?-4:4,hw=n===1?3.3:2.64,index=seat*2+hand,sign=Math.sign(target.x-cx)||1;
 const point=k=>({x:(target.x-cx-sign*1.3*(1-k/8))/hw,y:(target.y-.8*(1-k/8)-1.05)/2.4,vx:k?sign*1.8:0,vy:k?1.8:0});
 for(let k=0;k<=8;k++){const p=point(k);assert.ok(Math.abs(p.x)<=1&&Math.abs(p.y)<=1,'punch fixture stays within real tracker bounds');}
 await page.evaluate(({index,start})=>{window.__jabHands??=[];window.__jabHands[index]=start;},{index,start:point(0)});
 await page.waitForTimeout(120);
 for(let k=1;k<=8;k++){
  await page.evaluate(({index,value})=>{window.__jabHands[index]=value;},{index,value:point(k)});await page.waitForTimeout(35);
 }
 await page.evaluate(index=>{window.__jabHands[index].vx=0;window.__jabHands[index].vy=0;},index);
 if(wrong)assert.equal(await count(),hitCount,'wrong hand cannot earn a hit');
 else assert.equal(await count(),hitCount+1,'traveling glove hits visible mitt');
}
