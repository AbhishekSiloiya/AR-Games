// One shared description for briefing, lesson cues, scenery, music and authored shots.
export const KEEPER_STAGES=[
 {title:'Find your hands',instruction:'Left. Right. Get a glove into the ring.',short:'Near left / right',world:'Sunlit Stadium',art:'stadium-v1.png',music:'stadium',level:.3,sky:'#b9d5de',ambient:'#fff1d7',sun:'#fff2d6',power:1.1},
 {title:'Own the corners',instruction:'Reach into the upper corners. Reset between shots.',short:'Upper corners / wide resets',world:'Golden Hour',art:'stadium-v1.png',music:'keeperCorners',level:.4,sky:'#b9d5de',ambient:'#fff0d6',sun:'#ffe6bb',power:1.1},
 {title:'High. Low. Hero.',instruction:'Stretch to the top corners, then reset for the low ball.',short:'High / low combinations',world:'Sunset Stadium',art:'stadium-sunset-v1.png',music:'keeperHeights',level:.5,sky:'#e2b5a2',ambient:'#ffe8df',sun:'#ffd1ae',power:1.05},
 {title:'Read the curve',instruction:'Read the bigger bend. The ring stays on the true landing spot.',short:'Curved approaches',world:'Under the Lights',art:'stadium-floodlit-v1.png',music:'keeperCurve',level:.57,sky:'#7286ad',ambient:'#e6efff',sun:'#eef4ff',power:1.2},
 {title:'The final wall',instruction:'Mix it up. Own the final ten seconds.',short:'Mixed saves / final showdown',world:'Finals Night',art:'stadium-floodlit-v1.png',music:'keeperFinal',level:.64,sky:'#7286ad',ambient:'#e6efff',sun:'#eef4ff',power:1.2},
] as const;
export const keeperStage=(stage:number)=>KEEPER_STAGES[Math.max(0,Math.min(4,Math.floor(stage)-1))];
export const keeperArt=(stage=1)=>'/assets/moon/goalie/'+keeperStage(stage).art;
type Target=readonly [number,number,number?];
const NEAR:Target[]=[[-1.8,.5],[1.8,.6],[-1.3,.2],[1.3,.4],[0,.5],[-1.8,.3],[1.8,.4]];
const CORNERS:Target[]=[[-2.6,.5],[2.6,.5],[-3.9,1.8],[3.9,1.8],[-4.1,1.9],[4.1,1.9],[-2.9,.2],[2.9,.4]];
const HEIGHTS:Target[]=[[-4.2,2.25],[2,-1.15],[-2,-1.2],[4.2,2.25],[-3.5,1.8],[3.5,-1.25],[0,2.15],[0,-1.2]];
const CURVES:Target[]=[[-3.7,1.9,1.15],[3.7,1.9,-1.15],[-4.1,2.2,1.35],[4.1,-.8,-1.35],[-2,-1.1,1.4],[2,2.1,-1.4]];
const MIXED:Target[]=[[-1.8,.5],[1.8,.6],[-4.2,2.25],[3.5,-1.2],[-3.8,2.1,1.3],[3.5,-1.2,-1.3],[0,2.2],[-3.7,.4],[4.2,2.25]];
const FINALE:Target[]=[[-4.2,2.25,1.35],[3.5,-1.2,-1.35],[0,2.2],[-3.5,-1.2],[4.2,2.25]];
export function keeperShot(stage:number,index:number,t:number,practice:boolean){
 const finale=!practice&&stage===5&&t>=50,pattern=practice?NEAR.slice(0,2):finale?FINALE:[NEAR,CORNERS,HEIGHTS,CURVES,MIXED][Math.max(0,Math.min(4,stage-1))];
 const [x,y,bend=0]=pattern[index%pattern.length];return {x,y,bend,finale,drill:practice?'Practice':finale?'Final showdown':keeperStage(stage).short};
}
export function keeperProgress(score:number,goals:number[],finalStage:boolean){
 const stars=goals.filter(goal=>score>=goal).length,goal=goals[Math.min(stars,2)],remaining=Math.max(0,goal-score);
 return {stars,goal,remaining,fill:Math.min(1,Math.max(0,score/goals[2])),unlocked:!finalStage&&stars>=2};
}
