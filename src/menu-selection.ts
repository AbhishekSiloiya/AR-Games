export const MENU_HOLD_MS=3000;
type Point={x:number;y:number};
export type MenuHold<T>={target:T|null;anchor:Point|null;elapsed:number;fired:boolean};
export const newMenuHold=<T>():MenuHold<T>=>({target:null,anchor:null,elapsed:0,fired:false});
// Pose hands are ordered left/right in the mirrored player frame. Menus only use the right wrist.
export function menuHandPoint(player:{present:boolean;hands:{x:number;y:number;seen:boolean;t:number}[]},now:number,width:number,height:number):Point|null{
 const h=player.hands[1];
 if(!player.present||!h?.seen||now-h.t>350||now<h.t||!Number.isFinite(h.x+h.y))return null;
 return {x:Math.max(0,Math.min(width-1,(h.x+1)*width/2)),y:Math.max(0,Math.min(height-1,(1-h.y)*height/2))};
}
export function stepMenuHold<T>(s:MenuHold<T>,target:T|null,point:Point|null,ms:number){
 const result=(activate:T|null=null)=>({progress:s.fired?0:s.elapsed/MENU_HOLD_MS,activate,locked:s.fired});
 if(!point){if(!s.fired){s.target=null;s.anchor=null;s.elapsed=0;}return result();}
 const moved=s.anchor?Math.hypot(point.x-s.anchor.x,point.y-s.anchor.y):Infinity;
 if(s.fired){
  if(target===s.target||moved<40)return result();
  s.fired=false;s.target=null;s.anchor=null;
 }
 if(target!==s.target||!s.anchor||moved>32){s.target=target;s.anchor={...point};s.elapsed=0;return result();}
 if(!target){s.elapsed=0;return result();}
 s.elapsed=Math.min(MENU_HOLD_MS,s.elapsed+Math.max(0,Math.min(50,ms)));
 if(s.elapsed===MENU_HOLD_MS){s.fired=true;s.anchor={...point};return result(target);}
 return result();
}
