// Local visual proof only; not an entry in the production build.
import './moon.css';
import {begin,mount,run} from './engine.ts';
import goalie,{view} from './games/goalie.ts';
import {players} from './pose.ts';
import {saveGoalieSettings} from './goalie-settings.ts';
import type {Hud} from './kit.ts';
document.body.style.cssText='margin:0;background:#dfe8dd';
const frame=document.createElement('div');frame.className='stage';frame.style.cssText='width:100vw;height:100vh';document.body.append(frame);mount(frame);
const scene=begin(view),clock=document.createElement('div'),big=document.createElement('div');clock.className='hud clock';big.className='hud big';frame.append(clock,big);
const hud=((key,text)=>{if(key==='clock')clock.textContent=text;if(key==='big')big.textContent=text;}) as Hud;Object.assign(hud,{flash(){},shake(){},p(){},banner(){},pop(){}});
saveGoalieSettings({reach:'comfort',practice:false});players[0].present=true;
let x=.5,y=-.65;window.addEventListener('pointermove',e=>{x=e.clientX/innerWidth*2-1;y=1-e.clientY/innerHeight*2;});
const input=()=>players[0].hands.forEach((hand,i)=>Object.assign(hand,{x:i?x:-.8,y:i?y:-.85,seen:true,t:performance.now(),vx:0,vy:0,ax:0,ay:0}));
const stage=Math.max(1,Math.min(5,Number(new URLSearchParams(location.search).get('stage'))||1));
const update=await goalie({n:1,stage,mode:'',team:false,best:0,hud,scene,cleanup:scene.cleanup,onEnd(){}});
run(dt=>{input();update(dt);});
const debug=()=> (window as Window&{__goalie?:{snapshot:()=>unknown;advance:(ms:number)=>void}}).__goalie;
Object.assign(window,{render_game_to_text:()=>JSON.stringify(debug()?.snapshot()),advanceTime:(ms:number)=>{input();debug()?.advance(ms);}});
