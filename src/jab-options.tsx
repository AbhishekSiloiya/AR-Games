import {useState} from 'react';
import {jabSettings,saveJabSettings,type JabReach} from './jab-settings.ts';
import {jabDrill} from './jab-pattern.ts';
import './jab-options.css';
export function JabOptions({stage}:{stage:number}){
 const [settings,setSettings]=useState(jabSettings);
 const reach=(value:JabReach)=>{const next={...settings,reach:value};saveJabSettings(next);setSettings(next);};
 return <div className="jab-options">
  <fieldset><legend>Your reach</legend><div className="seg"><button type="button" aria-pressed={settings.reach==='comfort'} onClick={()=>reach('comfort')}>Comfortable</button><button type="button" aria-pressed={settings.reach==='full'} onClick={()=>reach('full')}>Full stretch</button></div><p>{settings.reach==='full'?'The wide pads you know. Extend, punch, return to guard.':'Closer targets, with the same large pads.'}</p></fieldset>
  <label className="jab-practice-choice"><input type="checkbox" checked={settings.practice} onChange={event=>{const next={...settings,practice:event.target.checked};saveJabSettings(next);setSettings(next);}}/> Practice first <small>15 seconds · no score</small></label>
  <p className="jab-drill"><b>{jabDrill(stage).name}</b><span>{jabDrill(stage).detail}</span></p>
 </div>;
}
