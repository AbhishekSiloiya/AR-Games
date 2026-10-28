import {useState} from 'react';
import {DANCE_TRACKS,chooseDance,danceChoice} from './dance-music.ts';
import {freezeLesson,FREEZE_POSES} from './freeze-studio-rules.ts';
export function PartyOptions({stage=1}:{stage?:number}){
 const [track,setTrack]=useState<string>(()=>danceChoice().id),lesson=freezeLesson(stage);
 return <div className="moon-party-options freeze-studio-options"><div><p className="moon-eyebrow">STAGE {stage} / {lesson.title}</p><p>{stage===1?'Dance, then freeze in any pose.':`Dance, then ${FREEZE_POSES[lesson.pose(0)].title.toLowerCase()}.`} Hold steady to fill the bar. A wobble resets the bar; settle and try again.</p></div><fieldset className="setup-view"><legend>Dance soundtrack</legend>{DANCE_TRACKS.map(t=><button key={t.id} aria-pressed={track===t.id} onClick={()=>{chooseDance(t.id);setTrack(t.id);}}>{t.name}</button>)}<p className="dim">{DANCE_TRACKS.find(t=>t.id===track)?.by} · {track==='synth'?'original synth':<a href={DANCE_TRACKS.find(t=>t.id===track)?.source} target="_blank" rel="noreferrer">CC0 · source</a>}</p></fieldset></div>;
}
