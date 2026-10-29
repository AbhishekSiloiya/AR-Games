import {keeperArt} from './goalie-stages.ts';
import {jabStage} from './jab-presentation.ts';
// The curated MOON release. Legacy game modules and saved sessions stay intact.
export const MOON_GAME_IDS: string[] = ['slice','goalie','freeze','shapeup','jacks','jab'];
export const MOON_CATALOG: Record<string,{name:string;world:string;hook:string;move:string;art:string;steps:string[]}> = {
 slice:{name:'Slice',world:'JUICE THE MOMENT',hook:'Big swings. Juicy chaos.',move:'Swipe · react',art:'slice',steps:['Swipe an open hand through flying fruit.','Chain three fruit in one swing for a bonus.','Avoid bombs. Grab glowing banana power-ups.']},
 goalie:{name:'Goalie',world:'OWN THE GOAL',hook:'Your save. Your spotlight.',move:'Reach · react',art:'goalie',steps:['Follow the ball and direction cue. Optional rings show its landing spot.','Move either glove to meet the ball. Choose your speed in Difficulty.','Either glove can save. Build a streak; gold balls are worth three.']},
 freeze:{name:'Freeze',world:'DANCE. STOP. ICON.',hook:'Find your groove. Own the freeze.',move:'Dance · freeze',art:'freeze',steps:['Dance with Rizzquake while the music plays.','When it stops, hold still or match the named pose.','Fill the hold bar for points. Chain clean holds for a bonus.']},
 shapeup:{name:'Shape Up',world:'STRIKE YOUR SHAPE',hook:'Make a pose. Make it yours.',move:'Pose · hold',art:'shapeup',steps:['Copy Rizzquake beside your live view.','Green joint markers mean matched. Hold briefly to bank stars.','Relax between poses. Chain all eight for the gold finish.']},
 jacks:{name:'Jack Attack',world:'ARMS UP. GAME ON.',hook:'The galaxy is in your hands.',move:'Raise · aim',art:'jacks',steps:['Raise either hand to fire along that arm.','Lower your hand to reload; raise it to fire again.','Point left or right to aim. Clear each wave.']},
 jab:{name:'Jab',world:'FIND YOUR FIGHT',hook:'Gloves on. World off.',move:'Punch · duck',art:'jab',steps:['Follow LEFT or RIGHT. Extend that arm toward the raised outer mitt.','Land four punches to complete a combination. Reset between hits.','When DUCK appears, bend your knees. Then return to guard.']},
};
const WORLD_ART:Record<string,string>={slice:'juice',goalie:'stadium',freeze:'club',shapeup:'galaxy',jacks:'galaxy',jab:'boxing'};
export const moonArt = (id:string,stage=1) => id==='shapeup'?'/assets/moon/shapeup/pavilion-v1.png':id==='slice'?'/assets/moon/slice/orchard-v1.png':id==='freeze'?'/assets/moon/freeze/studio-v1.png':id==='goalie'?keeperArt(stage):id==='jab'?jabStage(stage).art:`/assets/moon/play/${WORLD_ART[id] ?? 'galaxy'}.webp`;
export const moonBuddy = (id:string) => ['jab','goalie','freeze','slice','shapeup'].includes(id)?'/assets/moon/crew/rizzquake.webp':`/assets/moon/play/${['goalie','jacks','jab'].includes(id)?'moodi-action':'fuzzbyte-cheer'}.webp`;
