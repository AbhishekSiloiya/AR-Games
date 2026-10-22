// Sprint-only input: direct knee heights for the authored robot, edge-triggered steps for distance.
// No animation cycle, cadence averaging or render-frame smoothing sits between a knee and its on-screen leg.
export function sprintCanVault(present:boolean,air:boolean,rig:number[][],hands:{seen:boolean;y:number}[]) {
  return present&&((air&&[23,24,25,26,27,28].every(j=>rig[j]?.[2]>.4))||hands.length===2&&hands.every(h=>h.seen&&h.y>.6));
}
export function sprintMotion() {
  const standing=[0,0], armed=[false,false], previous=[0,0];
  let lastStep=-Infinity,lastMotion=-Infinity,pace=0;
  const result={left:0,right:0,steps:0,cadence:0};
  return(rig:number[][],t:number,active=true)=>{
    result.steps=0;let tracked=0;
    for(let side=0;side<2;side++) {
      const hip=rig[23+side],knee=rig[25+side];
      if(!hip||!knee||hip[2]<.4||knee[2]<.4||!Number.isFinite(hip[1]+knee[1])) {
        armed[side]=false;previous[side]=0;if(side===0)result.left=0;else result.right=0;continue;
      }
      tracked++;
      const drop=hip[1]-knee[1];standing[side]=Math.max(drop,standing[side]);
      const lift=Math.max(0,Math.min(1,(standing[side]-drop)/Math.max(.2,standing[side]*.8)));
      if(Math.abs(lift-previous[side])>.012)lastMotion=t;
      previous[side]=lift;if(side===0)result.left=lift;else result.right=lift;
      if(!active){armed[side]=false;continue;}
      if(lift<.1)armed[side]=true;
      else if(armed[side]&&lift>.25){armed[side]=false;result.steps++;}
    }
    if(!tracked||!active){pace=0;lastStep=-Infinity;lastMotion=-Infinity;}
    else if(result.steps){pace=Number.isFinite(lastStep)?Math.min(6,1/Math.max(.12,t-lastStep)):2;lastStep=t;}
    // A held knee keeps its exact pose but does not keep the character/world running after movement stops.
    result.cadence=active&&tracked&&t-lastMotion<.16?pace:0;
    return result;
  };
}
