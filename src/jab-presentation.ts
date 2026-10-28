import type {Theme} from './audio.ts';

/** Reach is deliberately less amplified than the shared arcade hand mapping. */
export const JAB_HOME=2.2;
export const JAB_OUTER=3.234;
export const jabSpace=(n:number)=>({
 gloveGain:n===1?3.3:2.64,
 gloveZ:.46,
 padScale:n===1?1.664:1.664*.78,
 hitRadius:n===1?1.12:.91,
});
export const jabMapHand=(x:number,y:number,cx:number,n:number)=>({x:cx+x*jabSpace(n).gloveGain,y:1.05+y*2.4});

const stages=[
 {name:'Daylight Training',art:'pavilion',theme:'boxing',ambient:'#fff6e5',key:'#fff3dd',intensity:.32,accent:'#67c5bc'},
 {name:'Golden Hour',art:'pavilion-sunset',theme:'jabSunset',ambient:'#fff0d9',key:'#ffdab1',intensity:.42,accent:'#edaa62'},
 {name:'City Lights',art:'pavilion-evening',theme:'jabNight',ambient:'#e8efff',key:'#fff1d9',intensity:.5,accent:'#70d2d7'},
 {name:'Main Event',art:'pavilion-evening',theme:'jabMain',ambient:'#eeeaff',key:'#fff0dc',intensity:.54,accent:'#ec9ca6'},
 {name:'Championship',art:'pavilion-evening',theme:'jabFinal',ambient:'#fff0dc',key:'#ffead0',intensity:.58,accent:'#f4cc7f'},
] as const;
export function jabStage(value:number){
 const stage=Math.max(1,Math.min(5,Number.isFinite(value)?Math.round(value):1));
 const config=stages[stage-1];
 return {...config,stage,theme:config.theme as Theme,art:`/assets/moon/jab/${config.art}.webp`};
}
