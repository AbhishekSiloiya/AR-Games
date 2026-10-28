import {useState} from 'react';
import {goalieSettings,saveGoalieSettings} from './goalie-settings.ts';
import {keeperStage,keeperShot} from './goalie-stages.ts';
import './goalie-options.css';
export function GoalieOptions({stage=1}:{stage?:number}){
 const [settings,setSettings]=useState(goalieSettings),lesson=keeperStage(stage);
 const reach=(value:'comfort'|'full')=>{const next={...settings,reach:value};saveGoalieSettings(next);setSettings(next);};
 return <div className="keeper-options"><div className="keeper-lesson"><div><small>STAGE {stage} / 5 · {lesson.world}</small><h3>{lesson.title}</h3><p>{lesson.instruction}</p></div><svg viewBox="0 0 160 90" role="img" aria-label={lesson.short}><path d="M8 82V10H152V82" fill="none" stroke="currentColor" strokeWidth="3"/>{Array.from({length:4},(_,i)=>{const shot=keeperShot(stage,i,0,false);return <circle key={`${stage}-${i}`} cx={80+shot.x*16} cy={49-shot.y*17} r="8" className="keeper-demo-ring" style={{animationDelay:`${i*.65}s`}}/>;})}</svg></div><fieldset><legend>Your reach</legend><div className="seg"><button type="button" aria-pressed={settings.reach==='comfort'} onClick={()=>reach('comfort')}>Comfortable</button><button type="button" aria-pressed={settings.reach==='full'} onClick={()=>reach('full')}>Full stretch</button></div><p>{settings.reach==='comfort'?'Closer corners. Same full-size gloves.':'Wider corners. Reach across your goal.'}</p></fieldset><label><input type="checkbox" checked={settings.practice} onChange={e=>{const next={...settings,practice:e.target.checked};saveGoalieSettings(next);setSettings(next);}}/> Practice first <small>Up to 12 seconds · no score</small></label><p>60 seconds · one shot at a time · two stars open the next stage.</p></div>;
}
