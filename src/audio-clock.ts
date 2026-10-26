// Native suspend/resume calls must not race: some browsers report running while
// their audio clock stays stalled after overlapping transitions.
type Clock={state:string;suspend:()=>Promise<void>;resume:()=>Promise<void>};
export function clockGate(clock:Clock){
 let wanted=false,pending:Promise<void>|undefined;
 const satisfied=()=>clock.state==='closed'||clock.state===(wanted?'suspended':'running');
 const set=(paused:boolean):Promise<void>=>{
  wanted=paused;
  if(!pending)pending=(async()=>{
   for(;;){const target=wanted;if(clock.state==='closed')return;
    if(target&&clock.state!=='suspended')await clock.suspend();
    else if(!target&&clock.state!=='running')await clock.resume();
    await Promise.resolve();if(wanted===target)return;
   }
  })().then(()=>{
   pending=undefined;
   // A request can arrive after the loop returns but before this continuation.
   // Drain it before resolving callers; do not leave it in an orphaned promise.
   if(!satisfied())return set(wanted);
  },error=>{pending=undefined;throw error;});
  return pending;
 };
 return set;
}
