// Independent scoring for a shared sequence; an absent player cannot bank a pose.
export function shapeVerdict(best: number, streak: number, present: boolean) {
  const quality = present && Number.isFinite(best) ? Math.round(Math.max(0, Math.min(100, best))) : 0;
  const nextStreak = quality >= 60 ? streak + 1 : 0;
  return { quality, streak: nextStreak, points: quality + (nextStreak ? Math.min(nextStreak - 1, 5) * 10 : 0) };
}

export type ShapePhase='countdown'|'match'|'result'|'rest'|'done';
export const SHAPE_RESULT=1.2, SHAPE_REST=1.5;
export const shapeDuration=(matchSeconds:number,count=8)=>count*(matchSeconds+SHAPE_RESULT+SHAPE_REST)-SHAPE_REST;
export function shapeClock(t:number,matchSeconds:number,count=8){
  const cycle=matchSeconds+SHAPE_RESULT+SHAPE_REST,duration=shapeDuration(matchSeconds,count);
  if(t<0)return {phase:'countdown' as ShapePhase,index:0,remaining:-t,duration};
  if(t+1e-7>=duration)return {phase:'done' as ShapePhase,index:count-1,remaining:0,duration};
  const index=Math.min(count-1,Math.floor((t+1e-7)/cycle)),into=t-index*cycle;
  const phase:ShapePhase=into+1e-7<matchSeconds?'match':into+1e-7<matchSeconds+SHAPE_RESULT?'result':'rest';
  return {phase,index,remaining:Math.max(0,(phase==='match'?matchSeconds:phase==='result'?matchSeconds+SHAPE_RESULT:cycle)-into),duration};
}
export type ShapeSeat={index:number;score:number;streak:number;best:number;holdSince:number|null;locked:boolean;judged:boolean;quality:number;verdict:'waiting'|'matched'|'perfect'|'partial'|'unmatched'|'absent'};
export const shapeSeat=():ShapeSeat=>({index:-1,score:0,streak:0,best:0,holdSince:null,locked:false,judged:false,quality:0,verdict:'waiting'});
export function stepShape(previous:ShapeSeat,index:number,phase:ShapePhase,quality:number,present:boolean,now:number,remaining:number){
  const state:ShapeSeat=previous.index===index?{...previous}:{...shapeSeat(),index,score:previous.score,streak:previous.streak};
  let justLocked=false,scored=false;
  if(phase==='match'){
    if(!present){state.holdSince=null;state.locked=false;state.best=0;}
    else{
      if(quality>=80){state.holdSince??=now;if(!state.locked&&now-state.holdSince>=.3){state.locked=true;justLocked=true;}}
      else state.holdSince=null;
      if(state.locked||remaining<=.6)state.best=Math.max(state.best,quality);
    }
  }else if((phase==='result'||phase==='rest'||phase==='done')&&!state.judged){
    const result=shapeVerdict(state.best,state.streak,present);state.judged=true;scored=true;
    state.quality=result.quality;state.score+=result.points;state.streak=result.streak;
    state.verdict=!present?'absent':state.locked?(result.quality>=90?'perfect':'matched'):result.quality>=60?'partial':'unmatched';
  }
  return {state,justLocked,scored};
}

// Angle estimates may remain finite when MediaPipe loses a limb. Require the source
// limb joints as well, so an inferred/off-camera pose cannot lock or earn points.
export function shapeTrackedBody(body:number[][]){
  return [11,12,13,14,15,16,23,24,25,26,27,28].every(j=>{
    const q=body[j];
    return !!q&&q.length>=3&&Number.isFinite(q[0])&&Number.isFinite(q[1])&&Number.isFinite(q[2])&&q[2]>=.35&&q[0]>=0&&q[0]<=1&&q[1]>=0&&q[1]<=1;
  });
}
