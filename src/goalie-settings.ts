export type GoalieSettings={reach:'comfort'|'full';practice:boolean};
const KEY='moon.goalie.settings.v1';
export function goalieSettings():GoalieSettings{try{const v=JSON.parse(localStorage.getItem(KEY)??'{}');return {reach:v?.reach==='full'?'full':'comfort',practice:v?.practice!==false};}catch{return {reach:'comfort',practice:true};}}
export function saveGoalieSettings(s:GoalieSettings){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{/* session choices still work */}}
