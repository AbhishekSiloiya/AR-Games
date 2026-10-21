// Shoulder-relative arm raises, independent of feet: lower to rearm, raise to fire.
export type ArmShot = { hand: number; x: number; y: number; dx: number; dy: number };
export function armShooter() {
  const armed=[false,false], last=[-Infinity,-Infinity];
  return (rig: number[][], t: number): ArmShot[] => {
    const shots: ArmShot[]=[];
    for(let hand=0;hand<2;hand++) {
      const wrist=rig[15+hand], shoulder=rig[11+hand];
      if(!wrist || !shoulder || wrist[2]<.4 || shoulder[2]<.4 || !Number.isFinite(wrist[0]+wrist[1]+shoulder[0]+shoulder[1])) { armed[hand]=false; continue; }
      const height=wrist[1]-shoulder[1];
      if(height<.1)armed[hand]=true;
      if(!armed[hand] || height<.4 || t-last[hand]<.25)continue;
      armed[hand]=false;last[hand]=t;
      const dx=wrist[0]-shoulder[0], dy=Math.max(.25,height), len=Math.hypot(dx,dy);
      shots.push({hand,x:wrist[0],y:wrist[1],dx:dx/len,dy:dy/len});
    }
    return shots;
  };
}

// Forgiving beam width, but never silently redirect a shot to an unrelated low invader.
export function aimedTarget<T extends {x:number;y:number;boss?:boolean}>(targets:T[],x:number,y:number,dx:number,dy:number) {
  let nearest=Infinity, found:T|undefined;
  for(const target of targets) {
    const tx=target.x-x, ty=target.y-y, along=tx*dx+ty*dy, across=Math.abs(tx*dy-ty*dx);
    if(along>0 && along<nearest && across<(target.boss?1.4:.9)) {nearest=along;found=target;}
  }
  return found;
}
