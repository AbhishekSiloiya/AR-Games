export function poseBuild(path:number[]){
 const earned=path.filter(n=>Number.isFinite(n)&&n>0),cells=Math.min(8,earned.length),stars=earned.reduce((a,b)=>a+Math.min(3,b),0);
 return {cells,stars,energy:cells/8,complete:cells===8};
}
