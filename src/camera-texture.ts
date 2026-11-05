import {Texture,PIXELFORMAT_RGBA8,FILTER_LINEAR,ADDRESS_CLAMP_TO_EDGE,type GraphicsDevice} from 'playcanvas';
import {cameraFrames} from './camera-frames.ts';
/** Round-owned texture; dispose the frame observer before destroying its GPU resource. */
export function cameraTexture(device:GraphicsDevice,video:HTMLVideoElement,cleanup:(fn:()=>void)=>void,name='Live camera'){
 const texture=new Texture(device,{name,width:video.videoWidth||1,height:video.videoHeight||1,format:PIXELFORMAT_RGBA8,mipmaps:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE}),frames=cameraFrames(video);
 let uploads=0,disposed=false;cleanup(()=>{disposed=true;frames.stop();texture.destroy();});
 return {texture,get uploads(){return uploads;},update(){if(disposed||!frames.take())return false;texture.setSource(video);uploads++;return true;}};
}
