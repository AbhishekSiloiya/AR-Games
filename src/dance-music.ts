import { audio, music, musicOut } from './audio.ts';
export const DANCE_TRACKS = [
  {id:'funky',name:'Funky Disco',by:'Fupi',file:'/assets/music/funky-disco.mp3',source:'https://opengameart.org/content/funky-disco-beats-to-boogiewoogie-to'},
  {id:'city',name:'City Lights',by:'wipics',file:'/assets/music/city-loop.mp3',source:'https://opengameart.org/content/city-loop-0'},
  {id:'synth',name:'Original synth',by:'MOON',file:'',source:''},
] as const;
export function danceChoice(){try{return DANCE_TRACKS.find(t=>t.id===localStorage.getItem('romp.danceTrack'))??DANCE_TRACKS[0];}catch{return DANCE_TRACKS[0];}}
export function chooseDance(id:string){try{localStorage.setItem('romp.danceTrack',id);}catch{/* Session still works without saved preferences. */}}
const decoded=new Map<string,AudioBuffer>();
// Synth remains audible until a recording is decoded. All playback uses the same suspendable audio clock.
export function startDanceTrack(at:number) {
  music.start('dance',at,.9);
  const track=danceChoice();let stopped=false,on=false,source:AudioBufferSourceNode|undefined,gain:GainNode|undefined;
  if(track.file)void(async()=>{
    try {
      let buffer=decoded.get(track.file);
      if(!buffer){const response=await fetch(track.file);if(!response.ok)throw Error('music unavailable');buffer=await audio().decodeAudioData(await response.arrayBuffer());decoded.set(track.file,buffer);}
      if(stopped)return;
      const c=audio();source=c.createBufferSource();gain=c.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=on?.48:0;
      source.connect(gain).connect(musicOut());const start=Math.max(at,c.currentTime);source.start(start,Math.max(0,start-at)%buffer.duration);music.gate(false);
    }catch{/* Keep the synchronized procedural fallback. */}
  })();
  return {
    gate(active:boolean){on=active;if(gain){gain.gain.setTargetAtTime(on?.48:0,audio().currentTime,.005);music.gate(false);}else music.gate(on);},
    stop(){if(stopped)return;stopped=true;try{source?.stop();}catch{/* Already stopped. */}source?.disconnect();gain?.disconnect();music.stop();},
  };
}
