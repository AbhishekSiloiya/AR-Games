import type {Session} from './stats.ts';
export type GoalieSettings={reach:'comfort'|'full';practice:boolean;speed:number;circles:boolean};
const KEY='moon.goalie.settings.v1';
export function normalizeGoalie(value:Partial<GoalieSettings>|null|undefined):GoalieSettings{return {reach:value?.reach==='full'?'full':'comfort',practice:value?.practice!==false,speed:Number.isFinite(value?.speed)?Math.max(75,Math.min(125,Math.round(value!.speed!/5)*5)):100,circles:value?.circles!==false};}
export function goalieSettings():GoalieSettings{try{return normalizeGoalie(JSON.parse(localStorage.getItem(KEY)??'{}'));}catch{return normalizeGoalie({});}}
export function saveGoalieSettings(s:Partial<GoalieSettings>){try{localStorage.setItem(KEY,JSON.stringify(normalizeGoalie(s)));}catch{/* session choices still work */}}
export function keeperPreset(s:GoalieSettings,preset:'Chill'|'Sport'|'Pro'):GoalieSettings{return {...s,speed:preset==='Chill'?85:preset==='Pro'?115:100,circles:preset!=='Pro'};}
export function keeperDifficulty(s:Pick<GoalieSettings,'speed'|'circles'>){return s.speed===85&&s.circles?'Chill':s.speed===100&&s.circles?'Sport':s.speed===115&&!s.circles?'Pro':'Custom';}
export function keeperVariant(s:GoalieSettings){return s.speed===100&&s.circles&&s.reach==='comfort'?'':`keeper:${s.speed}:${s.circles?1:0}:${s.reach}`;}
export function keeperFromVariant(variant:string){const m=/^keeper:(\d+):([01]):(comfort|full)$/.exec(variant);return normalizeGoalie(m?{speed:Number(m[1]),circles:m[2]==='1',reach:m[3] as GoalieSettings['reach']}:{});}
export const keeperSetupLabel=(s:GoalieSettings)=>`${keeperDifficulty(s)} · ${s.speed}% speed · circles ${s.circles?'on':'off'}`;
export const keeperInstruction=(stage:number,circles:boolean,original:string)=>circles?original:stage===4?'Read the bend. Follow the ball.':'Read the direction. Get a glove to the ball.';
export function keeperStageStars(sessions:Session[],who:string,stage:number){return Math.max(0,...sessions.filter(s=>s.game==='goalie'&&s.who===who&&(s.stage??1)===stage&&(!s.variant||/^keeper:\d+:[01]:(comfort|full)$/.test(s.variant))).map(s=>s.stars??0));}
