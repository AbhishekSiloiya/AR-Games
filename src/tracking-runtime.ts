export const freshTrackingResult=(capture:number,receipt:number)=>Number.isFinite(capture+receipt)&&capture<=receipt+1&&receipt-capture<=180;
export function trackingEpoch(){let value=0;return {next:()=>++value,is:(v:number)=>v===value};}
/** One allocation OR one inference, never a queue of old camera images. */
export function trackingWork(now:()=>number,failed:()=>void){
 let closed=false,started=0,replied=false;
 const state={captureInFlight:0,inferenceInFlight:0,captures:0,skipped:0};
 const fail=()=>{if(closed)return;closed=true;state.inferenceInFlight=0;failed();};
 return {state,async capture<T extends {close:()=>void}>(make:()=>Promise<T>,send:(frame:T)=>void){
  if(closed||state.captureInFlight||state.inferenceInFlight){state.skipped++;return false;}
  state.captureInFlight=1;started=now();let frame:T|undefined;
  try{frame=await make();if(closed){frame.close();return false;}state.captures++;state.inferenceInFlight=1;started=now();send(frame);frame=undefined;return true;}
  catch{frame?.close();fail();return false;}finally{state.captureInFlight=0;}
 },reply(){replied=true;state.inferenceInFlight=0;},resume(){started=now();},poll(){if(!closed&&(state.inferenceInFlight||state.captureInFlight)&&now()-started>(state.inferenceInFlight&&!replied?15000:2500))fail();},close(){closed=true;state.inferenceInFlight=0;}};
}
/** At most15Hz and half-duty inference after warm-up. Cold shader compilation gets a bounded extra pause. */
export function inlinePacer(){let next=-Infinity,first=true;return {due:(now:number)=>now>=next,finish(start:number,ms:number){next=first&&ms>500?start+ms+200:start+Math.max(1000/15,ms*2);first=false;}};}
