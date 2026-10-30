// Async game construction can finish after the player has left. A closed round disposes
// anything registered late immediately, rather than lending it to the next round.
export function roundLifetime() {
  let closed=false;
  const pending:(()=>void)[]=[];
  return {
    get closed(){return closed;},
    add(dispose:()=>void){if(closed)dispose();else pending.push(dispose);},
    close(){if(closed)return;closed=true;const batch=pending.splice(0);for(const dispose of batch)dispose();},
  };
}
