export type JabReach='full'|'comfort';
export type JabSettings={reach:JabReach;practice:boolean};
const KEY='moon.jab.settings.v1';
export function jabSettings():JabSettings{try{const v=JSON.parse(localStorage.getItem(KEY)??'{}');return {reach:v?.reach==='comfort'?'comfort':'full',practice:v?.practice!==false};}catch{return {reach:'full',practice:true};}}
export function saveJabSettings(value:JabSettings){try{localStorage.setItem(KEY,JSON.stringify(value));}catch{/* session still works if storage is unavailable */}}
export const jabReachFactor=(reach:JabReach)=>reach==='comfort'?.82:1;
export const jabReachName=(reach:JabReach)=>reach==='comfort'?'Comfortable':'Full stretch';
