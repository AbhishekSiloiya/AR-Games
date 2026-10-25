// Presentation state only. Game scores and input thresholds remain owned by each game.
export function sliceMomentum(value:number){
  const combo=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
  return {label:combo>=20?'Unstoppable':combo>=10?'In the zone':combo>=5?'Juicy streak':combo?'Fresh cuts':'Make your first cut',fill:(combo%5)/5,next:5-combo%5};
}
export type HoldChain={id:number;chain:number;best:number};
export const freshHoldChain=():HoldChain=>({id:-Infinity,chain:0,best:0});
export function holdChain(previous:HoldChain,id:number,success:boolean,present:boolean):HoldChain {
  if(previous.id===id)return previous;
  const chain=success&&present?previous.chain+1:0;
  return {id,chain,best:Math.max(previous.best,chain)};
}
export const PARTY_LOOKS=[{id:'chrome',name:'Chrome',detail:'Sculpted headphones + chrome shades'},{id:'prism',name:'Prism',detail:'Rose visor + crystal earrings'},{id:'minimal',name:'Minimal',detail:'Wrist lights · face stays clear'}] as const;
export type PartyLook=typeof PARTY_LOOKS[number]['id'];
export const validPartyLook=(id:unknown):PartyLook=>PARTY_LOOKS.find(x=>x.id===id)?.id??'chrome';
export function partyLook():PartyLook {try{return validPartyLook(localStorage.getItem('moon.partyLook'));}catch{return 'chrome';}}
export function choosePartyLook(id:PartyLook){try{localStorage.setItem('moon.partyLook',validPartyLook(id));}catch{/* Preferences are optional. */}}
