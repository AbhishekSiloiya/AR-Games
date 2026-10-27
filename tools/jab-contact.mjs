import assert from 'node:assert/strict';
export async function jabPunch(page,seat=0,wrong=false){
 await page.waitForFunction(p=>window.__jab.states[p].phase==='strike',seat);
 const hitCount=await page.evaluate(p=>window.__jab.states[p].hits,seat);
 const {target,hand,n}=await page.evaluate(({p,wrong})=>{const j=window.__jab,s=j.states[p],hand=wrong?1-s.action.hand:s.action.hand;return {hand,target:j.actors[p].state().mitts[s.action.hand],n:j.states.length};},{p:seat,wrong});
 const cx=n===1?0:seat===0?-4:4,hw=n===1?4:2.4,index=seat*2+hand;
 await page.evaluate(({index,target,cx,hw})=>{window.__jabHands??=[];window.__jabHands[index]={x:(target.x-cx-1.3)/hw,y:(target.y-.8-1.05)/2.4,vx:0,vy:0};},{index,target,cx,hw});
 await page.waitForTimeout(120);
 for(let k=1;k<=8;k++){
  await page.evaluate(({index,target,cx,hw,k})=>{window.__jabHands[index]={x:(target.x-cx-1.3*(1-k/8))/hw,y:(target.y-.8*(1-k/8)-1.05)/2.4,vx:1.8,vy:1.8};},{index,target,cx,hw,k});await page.waitForTimeout(35);
 }
 await page.evaluate(index=>{window.__jabHands[index].vx=0;window.__jabHands[index].vy=0;},index);
 if(wrong)assert.equal(await page.evaluate(p=>window.__jab.states[p].hits,seat),hitCount,'wrong hand cannot earn a hit');
 else assert.equal(await page.evaluate(p=>window.__jab.states[p].hits,seat),hitCount+1,'traveling glove hits visible mitt');
}
