import {jabStage} from './jab-presentation.ts';
// The curated MOON release. Legacy game modules and saved sessions stay intact.
export const MOON_GAME_IDS: string[] = ['slice','goalie','freeze','shapeup','jacks','jab'];
export const MOON_CATALOG: Record<string,{name:string;world:string;hook:string;move:string;art:string;steps:string[]}> = {
 slice:{name:'Slice',world:'JUICE THE MOMENT',hook:'Big swings. Juicy chaos.',move:'Swipe · react',art:'slice',steps:['Swipe an open hand through flying fruit.','Chain three fruit in one swing for a bonus.','Avoid bombs. Grab glowing banana power-ups.']},
 goalie:{name:'Goalie',world:'OWN THE GOAL',hook:'Your save. Your spotlight.',move:'Reach · react',art:'goalie',steps:['Watch the ring: that is where the shot will land.','Move your glove into the ring before the ball arrives.','Either glove can save. Build a streak; gold balls are worth three.']},
 freeze:{name:'Freeze',world:'DANCE. STOP. ICON.',hook:'Go all out. Hold the pose.',move:'Dance · freeze',art:'freeze',steps:['Dance freely while the music plays.','When FREEZE appears, stop and hold completely still.','Keep the pose until the music returns to build your chain.']},
 shapeup:{name:'Shape Up',world:'STRIKE YOUR SHAPE',hook:'Make a pose. Make it yours.',move:'Pose · hold',art:'shapeup',steps:['Watch your live view and copy the pose reference.','Hold a good match to lock it and collect stars.','Relax during the reset. Chain the next pose for a combo.']},
 jacks:{name:'Jack Attack',world:'ARMS UP. GAME ON.',hook:'The galaxy is in your hands.',move:'Raise · aim',art:'jacks',steps:['Raise either hand to fire along that arm.','Lower your hand to reload; raise it to fire again.','Point left or right to aim. Clear each wave.']},
 jab:{name:'Jab',world:'FIND YOUR FIGHT',hook:'Gloves on. World off.',move:'Punch · duck',art:'jab',steps:['Follow LEFT or RIGHT. Extend that arm toward the raised outer mitt.','Land four punches to complete a combination. Reset between hits.','When DUCK appears, bend your knees. Then return to guard.']},
};
const WORLD_ART:Record<string,string>={slice:'juice',goalie:'stadium',freeze:'club',shapeup:'galaxy',jacks:'galaxy',jab:'boxing'};
export const moonArt = (id:string,stage=1) => id==='goalie'?'/assets/moon/goalie/stadium-v1.png':id==='jab'?jabStage(stage).art:`/assets/moon/play/${WORLD_ART[id] ?? 'galaxy'}.webp`;
export const moonBuddy = (id:string) => ['jab','goalie'].includes(id)?'/assets/moon/crew/rizzquake.webp':`/assets/moon/play/${['goalie','jacks','jab'].includes(id)?'moodi-action':'fuzzbyte-cheer'}.webp`;
