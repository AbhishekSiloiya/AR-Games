import type {JabAction,JabSeat} from './jab-pattern.ts';
export type JabPractice={index:number;age:number;mode:'cue'|'success';done:boolean;hits:number};
export const newPractice=():JabPractice=>({index:0,age:0,mode:'cue',done:false,hits:0});
export const practiceAction=(p:JabPractice):JabAction=>({hand:p.index===0?0:1,cross:p.index===2,height:p.index===0?.9:1.36});
const next=(p:JabPractice)=>{p.index++;p.age=0;p.mode='cue';p.done=p.index>=4;};
export function stepPractice(p:JabPractice,dt:number,present:boolean,low:boolean){
 if(!present||p.done)return;p.age+=dt;
 if(p.mode==='success'){if(p.age>=.7)next(p);return;}
 if(p.index===3&&p.age>=.8&&low){p.mode='success';p.age=0;return;}
 if(p.age>=3.1)next(p);
}
export function hitPractice(p:JabPractice,hand:number,speed:number){
 if(p.done||p.mode!=='cue'||p.index>=3||p.age<.28||practiceAction(p).hand!==hand||speed<4.5)return false;
 p.hits++;p.mode='success';p.age=0;return true;
}
export function applyPractice(p:JabPractice,s:JabSeat){
 s.action=practiceAction(p);
 s.phase=p.done?'combo':p.mode==='success'?'recover':p.index===3?p.age<.8?'duckWarn':'duck':p.age<.28?'present':'strike';
 s.age=p.mode==='cue'&&p.index<3&&p.age>=.28?p.age-.28:p.age;
}
