// Jogging can be modest knee lifts, alternating arm pumps, or a visible body bounce.
// Only fresh source frames can produce an edge. Ambient running animation never enters this calculation.
export function jogDetector(){
  const stand=[0,0],lowArm=[Infinity,Infinity],kneeArmed=[false,false],armArmed=[false,false];
  let lastFrame=-Infinity,lastBeat=-Infinity,pace=0,lastArm=-1,bodyAnchor:number|undefined,bodyDirection=0,beat=0;
  const seen=(rig:number[][],...joints:number[])=>joints.every(j=>rig[j]?.[2]>=.4&&Number.isFinite(rig[j][0]+rig[j][1]));
  return(rig:number[][],time:number,frameId:number,present:boolean,bodyY:number,bodyScale:number)=>{
    if(!present){kneeArmed.fill(false);armArmed.fill(false);bodyAnchor=undefined;bodyDirection=0;pace=0;lastBeat=-Infinity;lastFrame=frameId;return{beat,pace:0,moving:false,source:'none'};}
    let source='none';
    if(frameId!==lastFrame){
      lastFrame=frameId;let knee=false,arm=-1,bob=false;
      for(let side=0;side<2;side++){
        if(seen(rig,23+side,25+side)){
          const drop=rig[23+side][1]-rig[25+side][1];stand[side]=Math.max(stand[side],drop);
          const lift=(stand[side]-drop)/Math.max(.3,stand[side]);
          if(lift<.06)kneeArmed[side]=true;
          else if(lift>.13&&kneeArmed[side]){kneeArmed[side]=false;knee=true;}
        }else kneeArmed[side]=false;
        if(seen(rig,11+side,15+side)){
          const height=rig[15+side][1]-rig[11+side][1];lowArm[side]=Math.min(lowArm[side],height);
          if(height<lowArm[side]+.08)armArmed[side]=true;
          else if(height>lowArm[side]+.20&&armArmed[side]){armArmed[side]=false;if(side!==lastArm)arm=side;}
        }else armArmed[side]=false;
      }
      if(seen(rig,11,12,23,24)&&Number.isFinite(bodyY+bodyScale)){
        bodyAnchor??=bodyY;
        const delta=(bodyY-bodyAnchor)/Math.max(.06,bodyScale),direction=Math.sign(delta);
        if(Math.abs(delta)>.11&&direction!==bodyDirection){bob=true;bodyDirection=direction;bodyAnchor=bodyY;}
        else if(direction===bodyDirection)bodyAnchor=bodyDirection>0?Math.max(bodyAnchor,bodyY):Math.min(bodyAnchor,bodyY);
      }else bodyAnchor=undefined;
      if((knee||arm>=0||bob)&&time-lastBeat>=.14){
        pace=Number.isFinite(lastBeat)?Math.max(1.2,Math.min(5,1/Math.max(.2,time-lastBeat))):2;
        lastBeat=time;beat++;source=knee?'knees':arm>=0?'arms':'bounce';if(arm>=0)lastArm=arm;
      }
    }
    const moving=time-lastBeat<.72;
    return{beat,pace:moving?pace:0,moving,source};
  };
}
export type RaceState={metres:number;steps:number;stars:number;charge:number;boost:number;boosts:number;checkpoints:number;lastBeat:number};
export const raceState=():RaceState=>({metres:0,steps:0,stars:0,charge:0,boost:0,boosts:0,checkpoints:0,lastBeat:0});
export function raceAdvance(previous:RaceState,beat:number,dt:number):RaceState{
  const state={...previous,boost:Math.max(0,previous.boost-Math.max(0,dt))};
  if(beat<=state.lastBeat)return state;
  const earned=beat-state.lastBeat;state.lastBeat=beat;state.steps+=earned;state.metres+=earned*2.2*(state.boost>0?1.6:1);
  state.stars=Math.floor((state.metres+1e-8)/6);state.checkpoints=Math.floor(state.metres/30);
  // A turbo is a short earned peak, not a timer that refreshes forever from its own extra distance.
  if(state.boost===0){state.charge+=state.stars-previous.stars;if(state.charge>=3){state.charge=0;state.boost=5;state.boosts++;}}
  return state;
}
export const raceMedal=(metres:number)=>metres>=120?'Gold':metres>=80?'Silver':metres>=40?'Bronze':'Explorer';
