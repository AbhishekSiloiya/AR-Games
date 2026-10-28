import {useState} from 'react';
import {goalieSettings,saveGoalieSettings} from './goalie-settings.ts';
import './goalie-options.css';
export function GoalieOptions(){
 const [settings,setSettings]=useState(goalieSettings);
 const reach=(value:'comfort'|'full')=>{const next={...settings,reach:value};saveGoalieSettings(next);setSettings(next);};
 return <div className="keeper-options"><fieldset><legend>Your reach</legend><div className="seg"><button type="button" aria-pressed={settings.reach==='comfort'} onClick={()=>reach('comfort')}>Comfortable</button><button type="button" aria-pressed={settings.reach==='full'} onClick={()=>reach('full')}>Full stretch</button></div><p>{settings.reach==='comfort'?'Closer corners. Same full-size gloves.':'Wider corners. Reach across your goal.'}</p></fieldset><label><input type="checkbox" checked={settings.practice} onChange={e=>{const next={...settings,practice:e.target.checked};saveGoalieSettings(next);setSettings(next);}}/> Practice first <small>Up to 12 seconds · no score</small></label><p>First-round preview · one stadium, faster shots in later stages.</p></div>;
}
