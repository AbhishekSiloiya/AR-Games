// One shared description for briefing, lesson cues, scenery, music and authored shots.
export const KEEPER_STAGES=[
 {title:'Find your hands',instruction:'Left. Right. Get a glove into the ring.',short:'Near left / right',world:'Sunlit Stadium',art:'stadium-v1.png',music:'stadium',level:.3,sky:'#b9d5de',ambient:'#fff1d7',sun:'#fff2d6',power:1.1},
 {title:'Own the corners',instruction:'Reach wide. Reset between shots.',short:'Wider corners',world:'Golden Hour',art:'stadium-v1.png',music:'keeperCorners',level:.4,sky:'#b9d5de',ambient:'#fff0d6',sun:'#ffe6bb',power:1.1},
 {title:'High. Low. Hero.',instruction:'Follow the ring up high, then down low.',short:'High / low combinations',world:'Sunset Stadium',art:'stadium-sunset-v1.png',music:'keeperHeights',level:.5,sky:'#e2b5a2',ambient:'#ffe8df',sun:'#ffd1ae',power:1.05},
 {title:'Read the curve',instruction:'The ball bends. The ring stays true.',short:'Curved approaches',world:'Under the Lights',art:'stadium-floodlit-v1.png',music:'keeperCurve',level:.57,sky:'#7286ad',ambient:'#e6efff',sun:'#eef4ff',power:1.2},
 {title:'The final wall',instruction:'Mix it up. Own the final ten seconds.',short:'Mixed saves / final showdown',world:'Finals Night',art:'stadium-floodlit-v1.png',music:'keeperFinal',level:.64,sky:'#7286ad',ambient:'#e6efff',sun:'#eef4ff',power:1.2},
] as const;
export const keeperStage=(stage:number)=>KEEPER_STAGES[Math.max(0,Math.min(4,Math.floor(stage)-1))];
export const keeperArt=(stage=1)=>'/assets/moon/goalie/'+keeperStage(stage).art;
type Target=readonly [number,number,number?];
const NEAR:Target[]=[[-1.8,.5],[1.8,.6],[-1.3,.2],[1.3,.4],[0,.5],[-1.8,.3],[1.8,.4]];
const CORNERS:Target[]=[[-2.6,.5],[2.6,.5],[-3.5,.6],[3.5,.5],[-3.7,.4],[3.7,.6],[-2.9,.2],[2.9,.4]];
const HEIGHTS:Target[]=[[-2,1.5],[2,-1.15],[-2,-1.2],[2,1.65],[-3.2,1.5],[3.2,-1.25],[0,1.8],[0,-1.2]];
const CURVES:Target[]=[[-2.6,.5,.65],[2.6,.6,-.65],[-3.5,1.3,.8],[3.5,-.8,-.8],[-2,-1.1,.9],[2,1.6,-.9]];
const MIXED:Target[]=[[-1.8,.5],[1.8,.6],[-3.5,1.5],[3.5,-1.2],[-2.5,1.5,.8],[2.5,-1.2,-.8],[0,1.8],[-3.7,.4],[3.7,.5]];
const FINALE:Target[]=[[-3.5,1.5,.75],[3.5,-1.2,-.75],[0,1.8],[-3.5,-1.2],[3.5,1.5]];
export function keeperShot(stage:number,index:number,t:number,practice:boolean){
 const finale=!practice&&stage===5&&t>=50,pattern=practice?NEAR.slice(0,2):finale?FINALE:[NEAR,CORNERS,HEIGHTS,CURVES,MIXED][Math.max(0,Math.min(4,stage-1))];
 const [x,y,bend=0]=pattern[index%pattern.length];return {x,y,bend,finale,drill:practice?'Practice':finale?'Final showdown':keeperStage(stage).short};
}
export function keeperProgress(score:number,goals:number[],finalStage:boolean){
 const stars=goals.filter(goal=>score>=goal).length,goal=goals[Math.min(stars,2)],remaining=Math.max(0,goal-score);
 return {stars,goal,remaining,fill:Math.min(1,Math.max(0,score/goals[2])),unlocked:!finalStage&&stars>=2};
}
