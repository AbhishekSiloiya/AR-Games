export type DroneKind='scout'|'dart'|'orb';
/** First circle crossed by a moving pulse, even when a low-FPS frame crosses it completely. */
export function pulseContact<T extends {x:number;y:number;r:number}>(targets:T[],x0:number,y0:number,x1:number,y1:number){
 const dx=x1-x0,dy=y1-y0,a=dx*dx+dy*dy;let first=Infinity,result:T|undefined;
 for(const target of targets){const fx=x0-target.x,fy=y0-target.y,c=fx*fx+fy*fy-target.r*target.r;let t=Infinity;if(c<=0)t=0;else if(a>1e-9){const b=2*(fx*dx+fy*dy),disc=b*b-4*a*c;if(disc>=0)t=(-b-Math.sqrt(disc))/(2*a);}if(t>=0&&t<=1&&t<first){first=t;result=target;}}
 return result;
}
export function jackFormation(wave:number,n:number,team:boolean,x:number,half:number){
 const boss=wave%3===2,cols=team?8:n===2?4:6,rows=wave===0?1:boss?2:Math.min(3,1+Math.floor((wave+1)/2));
 const out:{x:number;y:number;kind:DroneKind;boss:boolean;entryX:number;entryY:number;delay:number}[]=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const side=col%2?1:-1;out.push({x:x+((col+.5)/cols-.5)*half*1.65,y:2.65+row*.72,kind:(['scout','dart','orb'] as const)[(col+row+wave)%3],boss:false,entryX:Math.max(-8.2,Math.min(8.2,x+side*(half+2))),entryY:4.8+row*.2,delay:col*.09+row*.12});}
 if(boss)out.push({x,y:2.05,kind:'scout',boss:true,entryX:x,entryY:6,delay:.5});return out;
}
