export type QualityMode='auto'|'quality'|'performance';
export function renderQuality(mode:QualityMode,grade:number,width:number,height:number,dpr:number){
 const level=mode==='quality'?0:mode==='performance'?Math.max(1,grade):grade,lean=level>0;
 const maxPixels=level>=2?576000:lean?921600:mode==='quality'?2073600:1500000;
 const ratio=Math.min(Math.max(.1,dpr||1),level>=2?.8:lean?1:1.25,Math.sqrt(maxPixels/Math.max(1,width*height)));
 return {grade:level,lean,ratio,maxPixels,shadows:!lean,bloom:!lean};
}
export function nextQualityGrade(mode:QualityMode,grade:number,slowSeconds:number){
 if(mode==='quality')return grade;const active=mode==='performance'?Math.max(1,grade):grade;
 return slowSeconds>(active===0?2:4)?Math.min(2,active+1):grade;
}
