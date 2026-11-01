// Isolated visual/input proof. Full app tests exercise the actual camera route.
import './moon.css';
import {begin,mount,run} from './engine.ts';
import freeze from './games/freeze.ts';
import {players} from './pose.ts';
import type {Hud} from './kit.ts';
const frame=document.createElement('div');frame.className='stage';frame.style.cssText='width:100vw;height:100vh';document.body.append(frame);document.body.style.margin='0';mount(frame);const scene=begin(),clock=document.createElement('div');clock.className='hud clock';frame.append(clock);
const hud=((key,text)=>{if(key==='clock')clock.textContent=text;}) as Hud;Object.assign(hud,{flash(){},shake(){},p(){},banner(){},pop(){}});
let moving=false;window.addEventListener('keydown',e=>{if(e.key==='ArrowRight')moving=true;});window.addEventListener('keyup',e=>{if(e.key==='ArrowRight')moving=false;});
const rig=Array.from({length:33},()=>[0,0,1]);for(const [i,x,y] of [[0,0,1.3],[11,-.5,0],[12,.5,0],[13,-1,-.4],[14,1,-.4],[15,-1.2,-.8],[16,1.2,-.8],[23,-.4,-1.5],[24,.4,-1.5],[25,-.4,-2.5],[26,.4,-2.5],[27,-.4,-3.5],[28,.4,-3.5]])rig[i]=[x,y,1];players[0].rig=rig;players[0].present=true;
const stage=Math.max(1,Math.min(5,Number(new URLSearchParams(location.search).get('stage'))||1));const update=await freeze({n:1,stage,mode:'studio',team:false,best:0,hud,scene,cleanup:scene.cleanup,onEnd(){}});
const debug=()=> (window as Window&{__freeze?:{snapshot:()=>unknown;advance:(ms:number)=>void}}).__freeze;
run(dt=>{if(moving)players[0].energy+=dt*8;update();});Object.assign(window,{render_game_to_text:()=>JSON.stringify(debug()?.snapshot()),advanceTime:(ms:number)=>{for(let f=0;f<Math.ceil(ms/(1000/60));f++){if(moving)players[0].energy+=8/60;debug()?.advance(1000/60);}}});
