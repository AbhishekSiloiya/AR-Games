import type { Db } from './stats.ts';
export const CREW = [
  {id:'moodi',name:'Moodi & Quack',tag:'Unbothered. Unstoppable.',art:'/assets/moon/play/moodi-idle.webp',tone:'#e8d6b8'},
  {id:'fuzzbyte',name:'Fuzzbyte',tag:'A little chaos. A lot of heart.',art:'/assets/moon/play/fuzzbyte-idle.webp',tone:'#cfb9ff'},
  {id:'momo',name:'Momo & Bloop',tag:'Better together',art:'/assets/moon/crew/momo.webp',tone:'#ffbd79'},
  {id:'rizzquake',name:'Rizzquake',tag:'Big friendly energy',art:'/assets/moon/crew/rizzquake.webp',tone:'#deff75'},
  {id:'nova',name:'Nova',tag:'Bright ideas. Big moves.',art:'/assets/moon/play/nova-idle.webp',tone:'#f6a7e1'},
  {id:'ren',name:'Ren',tag:'Always up for a challenge',art:'/assets/moon/play/ren-idle.webp',tone:'#c9b9ff'},
] as const;
export const crewOf = (id?:string) => CREW.find(c=>c.id===id) ?? CREW[0];
type IdentityResult = {ok:true;db:Db;name:string}|{ok:false;error:string};
export function updateIdentity(db:Db,current:string,nickname:string,avatar:string):IdentityResult {
  const name=nickname.trim().replace(/\s+/g,' ') || current;
  if(!db.profiles.includes(current))return {ok:false,error:'Choose a player first.'};
  if(name.length>20)return {ok:false,error:'Keep your nickname to 20 characters.'};
  if(db.profiles.some(p=>p!==current&&p.toLocaleLowerCase()===name.toLocaleLowerCase()))return {ok:false,error:'That nickname belongs to another player. Try a different one.'};
  const previous={...db.avatars};delete previous[current];const avatars={...previous,[name]:crewOf(avatar).id};
  return {ok:true,name,db:{...db,avatars,profiles:db.profiles.map(p=>p===current?name:p),sessions:db.sessions.map(s=>s.who===current?{...s,who:name}:s)}};
}
