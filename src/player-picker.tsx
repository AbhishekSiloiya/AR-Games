import { useEffect, useRef, useState } from 'react';
import type { Db } from './stats.ts';
import { CREW, crewOf, updateIdentity } from './moon-profile.ts';
import './player-picker.css';
export function PlayerPicker({db,current,slot,onSave,onSwitch,onClose}:{db:Db;current:string;slot:number;onSave:(db:Db)=>void;onSwitch:(index:number)=>void;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [nickname,setNickname]=useState(current.startsWith('Player ')||current==='Guest'?'':current);
  const [avatar,setAvatar]=useState<string>(crewOf(db.avatars?.[current]).id);
  const [error,setError]=useState('');
  useEffect(()=>{const d=dialog.current!;d.showModal();return()=>d.close();},[]);
  const save=()=>{const result=updateIdentity(db,current,nickname,avatar);if(!result.ok){setError(result.error);return;}onSave(result.db);onClose();};
  return <dialog ref={dialog} className="moon-player-picker" aria-labelledby="picker-title" onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>e.stopPropagation()}>
    <form onSubmit={e=>{e.preventDefault();save();}}>
      <header><div><p className="moon-eyebrow">PLAYER {slot+1} / YOUR CREW</p><h2 id="picker-title">Who’s making moves?</h2></div><button type="button" className="ghost" onClick={onClose} aria-label="Close player picker">Close</button></header>
      <div className="moon-identity-main"><figure style={{'--crew-tone':crewOf(avatar).tone} as React.CSSProperties}><img src={crewOf(avatar).art} alt={crewOf(avatar).name} /><figcaption><b>{crewOf(avatar).name}</b><span>{crewOf(avatar).tag}</span></figcaption></figure>
        <div className="moon-identity-options"><label htmlFor="moon-nickname">Your nickname <small>optional</small></label><input id="moon-nickname" value={nickname} placeholder={current} maxLength={20} autoComplete="off" onChange={e=>{setNickname(e.target.value);setError('');}} /><p>Pick your character. Your moves do the rest.</p>
          <div className="moon-crew-grid" role="group" aria-label="Choose your character">{CREW.map(c=><button key={c.id} type="button" aria-label={c.name} aria-pressed={avatar===c.id} onClick={()=>setAvatar(c.id)}><img src={c.art} alt="" /><span>{c.name}</span></button>)}</div>
        </div>
      </div>
      {error&&<p className="error" role="alert">{error}</p>}
      <footer><div><span>Already in the crew?</span><div className="moon-existing-players">{db.profiles.filter(p=>p!==current).map(p=><button type="button" key={p} onClick={()=>{onSwitch(db.profiles.indexOf(p));onClose();}}><img src={crewOf(db.avatars?.[p]).art} alt="" />{p}</button>)}</div></div><button type="submit" className="primary">Let’s play ↗</button></footer>
    </form>
  </dialog>;
}
