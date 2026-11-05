type FrameVideo={readyState:number;videoWidth:number;videoHeight:number;currentTime:number;requestVideoFrameCallback?:(callback:(now:number,meta:unknown)=>void)=>number;cancelVideoFrameCallback?:(id:number)=>void};
/** One upload ticket per observed video frame, independent of the renderer's cadence. */
export function cameraFrames(video:FrameVideo){
 let stopped=false,seq=0,taken=-1,time=NaN,width=0,height=0,id=0;
 const callback=()=>{if(stopped)return;seq++;id=video.requestVideoFrameCallback!(callback);};
 const observed=typeof video.requestVideoFrameCallback==='function'&&typeof video.cancelVideoFrameCallback==='function';
 if(observed)id=video.requestVideoFrameCallback!(callback);
 return {take(){if(stopped||video.readyState<2||!video.videoWidth||!video.videoHeight)return false;const changed=width!==video.videoWidth||height!==video.videoHeight||(observed?taken!==seq:time!==video.currentTime);if(!changed)return false;width=video.videoWidth;height=video.videoHeight;taken=seq;time=video.currentTime;return true;},stop(){if(stopped)return;stopped=true;if(observed)video.cancelVideoFrameCallback!(id);}};
}
