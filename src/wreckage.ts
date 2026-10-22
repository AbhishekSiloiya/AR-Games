export type Debris={x:number;y:number;z:number;vx:number;vy:number;vz:number;angle:number;spin:number;halfWidth:number;halfHeight:number};
export function throwDebris(x:number,y:number,z:number,side:number,power=4,halfWidth=.2,halfHeight=.2):Debris{return {x,y,z,vx:side*power,vy:3.6,vz:.7,angle:0,spin:side*160,halfWidth,halfHeight};}
export function debrisStep(q:Debris,dt:number,edge:number,surface=-3.2){
  dt=Math.max(0,Math.min(.05,dt));q.vy-=11*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z=Math.min(1.8,q.z+q.vz*dt);q.angle+=q.spin*dt;
  const angle=q.angle*Math.PI/180,support=Math.abs(Math.sin(angle))*q.halfWidth+Math.abs(Math.cos(angle))*q.halfHeight,floor=surface+support;
  if(Math.abs(q.x)>edge){q.x=Math.sign(q.x)*edge;q.vx*=-.3;}
  if(q.y<floor){q.y=floor;q.vy=Math.abs(q.vy)>.6?-q.vy*.28:0;q.vx*=.8;q.spin*=.7;}
  return q;
}
