import {ShaderMaterial,SEMANTIC_POSITION,BLEND_NORMAL,CULLFACE_NONE} from 'playcanvas';
import {node,own,shapes,type Scene} from './engine.ts';
// A single transparent draw behind the dancer. The full camera rectangle is
// explicitly excluded, so neither haze nor lighting can dim or tint the player.
export function freezeAtmosphere(scene:Scene,width:number,height:number){
 const material=own(new ShaderMaterial({uniqueName:'moon-freeze-studio-atmosphere',attributes:{vertex_position:SEMANTIC_POSITION},
  vertexGLSL:`attribute vec3 vertex_position;uniform mat4 matrix_model;uniform mat4 matrix_viewProjection;varying vec2 vStage;
   void main(){vStage=vertex_position.xy;gl_Position=matrix_viewProjection*matrix_model*vec4(vertex_position,1.0);}`,
  fragmentGLSL:`varying vec2 vStage;uniform float uTime;uniform vec2 uCamera;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
   void main(){vec2 p=vStage;vec2 camera=abs(p-vec2(1.8,-0.3));if(camera.x<uCamera.x*0.5+0.10&&camera.y<uCamera.y*0.5+0.10)discard;
    float t=uTime,depth=clamp((3.8-p.y)/8.0,0.0,1.0);vec3 sum=vec3(0.0);float opacity=0.0;
    for(int i=0;i<4;i++){float k=float(i),side=i<2?-1.0:1.0;float origin=side*(6.5+mod(k,2.0)*0.6);float aim=side*(4.5+0.9*sin(t*0.55+k*1.9));float centre=mix(origin,aim,depth);float spread=0.10+depth*0.70;float beam=exp(-pow((p.x-centre)/spread,2.0))*(1.0-smoothstep(3.2,4.4,p.y))*(0.14+0.04*sin(t*0.85+k));vec3 color=mod(k,2.0)<0.5?vec3(0.40,0.94,0.85):vec3(1.0,0.64,0.76);sum+=color*beam;opacity+=beam;}
    float billow=0.45+0.55*noise(vec2(p.x*1.7-t*0.3,p.y*3.2+t*0.12));float fog=0.0;for(int i=0;i<5;i++){float k=float(i),x=-7.3+k*3.6+0.35*sin(t*0.33+k),y=-3.85+0.14*sin(t*0.4+k*1.7);vec2 q=(p-vec2(x,y))/vec2(2.0,0.48);float plume=exp(-dot(q,q)*1.3);fog+=plume*billow*0.42;}
    sum+=vec3(0.87,0.96,0.94)*fog;opacity+=fog;float alpha=min(0.48,opacity);if(alpha<0.004)discard;gl_FragColor=vec4(sum/max(opacity,0.001),alpha);
   }`,
 }));
 material.blendType=BLEND_NORMAL;material.depthWrite=false;material.cull=CULLFACE_NONE;material.setParameter('uCamera',[width,height]);material.setParameter('uTime',0);material.update();
 const layer=node(scene.root,shapes.quad(16,9),material,[0,0,-.4]);layer.name='freeze-studio-atmosphere';layer.enabled=false;
 const state={enabled:false,time:0};return {state,update(t:number,on:boolean){state.enabled=on;state.time=t;layer.enabled=on;material.setParameter('uTime',t);}};
}
