// The curated MOON release. Legacy game modules and saved sessions stay intact.
export const MOON_GAME_IDS: string[] = ['slice','goalie','freeze','shapeup','jacks','jab'];
export const MOON_CATALOG: Record<string,{name:string;world:string;hook:string;move:string;art:string;steps:string[]}> = {
 slice:{name:'Slice',world:'JUICE THE MOMENT',hook:'Big swings. Juicy chaos.',move:'Swipe · react',art:'slice',steps:['Swipe an open hand through flying fruit.','Chain three fruit in one swing for a bonus.','Avoid bombs. Grab glowing banana power-ups.']},
 goalie:{name:'Goalie',world:'OWN THE GOAL',hook:'Your save. Your spotlight.',move:'Reach · react',art:'goalie',steps:['Watch the ring: that is where the shot will land.','Move your glove into the ring before the ball arrives.','Swat for a flying save. Gold balls are worth three.']},
 freeze:{name:'Freeze',world:'DANCE. STOP. ICON.',hook:'Go all out. Hold the pose.',move:'Dance · freeze',art:'freeze',steps:['Dance freely while the music plays.','When FREEZE appears, stop and hold completely still.','Keep the pose until the music returns to build your chain.']},
 shapeup:{name:'Shape Up',world:'STRIKE YOUR SHAPE',hook:'Make a pose. Make it yours.',move:'Pose · hold',art:'shapeup',steps:['Watch your live view and copy the pose reference.','Hold a good match to lock it and collect stars.','Relax during the reset. Chain the next pose for a combo.']},
 jacks:{name:'Jack Attack',world:'ARMS UP. GAME ON.',hook:'The galaxy is in your hands.',move:'Raise · aim',art:'jacks',steps:['Raise either hand to fire along that arm.','Lower your hand to reload; raise it to fire again.','Point left or right to aim. Clear each wave.']},
 jab:{name:'Jab',world:'FIND YOUR FIGHT',hook:'Gloves on. World off.',move:'Punch · duck',art:'jab',steps:['Punch the pads with the hand on their side.','Gold pads want the opposite hand. Hit hard for a bonus.','Duck under the bar, then come back swinging.']},
};
export const moonArt = (id:string) => `/assets/moon/worlds/${MOON_CATALOG[id]?.art ?? 'slice'}.webp`;
