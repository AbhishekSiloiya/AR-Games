import assert from 'node:assert/strict';
import {cameraFrames} from './camera-frames.ts';
let callback:(...args:any[])=>void=()=>{},cancelled=0,requests=0;
const video={readyState:2,videoWidth:1280,videoHeight:720,currentTime:0,requestVideoFrameCallback(fn:(...args:any[])=>void){callback=fn;return ++requests;},cancelVideoFrameCallback(_id:number){cancelled++;}};
const c=cameraFrames(video);assert.equal(c.take(),true);for(let i=0;i<60;i++)assert.equal(c.take(),false,'unchanged camera frame must not upload at render cadence');
for(let frame=1;frame<=10;frame++){video.currentTime=frame/10;callback(100*frame,{});assert.equal(c.take(),true);for(let draw=0;draw<5;draw++)assert.equal(c.take(),false);}
video.videoWidth=640;assert.equal(c.take(),true,'camera resize updates once even between callbacks');assert.equal(c.take(),false);const pending=callback;c.stop();pending(2000,{});assert.equal(c.take(),false);assert.equal(cancelled,1);assert.equal(requests,11,'late callbacks after disposal cannot schedule again');
const source={readyState:1,videoWidth:640,videoHeight:360,currentTime:0},f=cameraFrames(source);assert.equal(f.take(),false);source.readyState=2;assert.equal(f.take(),true);assert.equal(f.take(),false);source.currentTime=.033;assert.equal(f.take(),true);source.currentTime=0;assert.equal(f.take(),true,'restarted media clock can update');f.stop();assert.equal(f.take(),false);
console.log('PASS camera-frame-driven uploads, currentTime fallback, dimensions and late-callback disposal');
