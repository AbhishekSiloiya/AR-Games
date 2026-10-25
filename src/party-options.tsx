import { useState } from 'react';
import { PARTY_LOOKS, choosePartyLook, partyLook } from './moon-experience.ts';
import { DANCE_TRACKS, chooseDance, danceChoice } from './dance-music.ts';
export function PartyOptions(){
  const [look,setLook]=useState(()=>partyLook()),[track,setTrack]=useState<string>(()=>danceChoice().id);
  const selected=PARTY_LOOKS.find(item=>item.id===look)!;
  return <div className="moon-party-options">
    <fieldset className="setup-view"><legend>Your party look</legend><div className="moon-style-options">{PARTY_LOOKS.map(item=><button key={item.id} aria-pressed={look===item.id} onClick={()=>{choosePartyLook(item.id);setLook(item.id);}}>{item.name}</button>)}</div></fieldset>
    <figure className="moon-party-preview"><img src={`/assets/moon/${look==='prism'?'prism-visor.png':`${look}-preview.svg`}`} alt={`${selected.name} accessory preview`} /><figcaption>{selected.detail}</figcaption></figure>
    <fieldset className="setup-view"><legend>Dance soundtrack</legend>{DANCE_TRACKS.map(t=><button key={t.id} aria-pressed={track===t.id} onClick={()=>{chooseDance(t.id);setTrack(t.id);}}>{t.name}</button>)}<p className="dim">Music: {DANCE_TRACKS.find(t=>t.id===track)?.by} · {track==='synth'?'original synth':<a href={DANCE_TRACKS.find(t=>t.id===track)?.source} target="_blank" rel="noreferrer">CC0 · source</a>}</p></fieldset>
  </div>;
}
