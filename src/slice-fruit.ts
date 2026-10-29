import {Color,type Entity,type MeshInstance,type StandardMaterial} from 'playcanvas';
import {own} from './engine.ts';
// Local to Slice: preserve the original real cut geometry while adding a subtle
// satin skin and procedural flesh detail to the clipped interior lining.
export function sliceFruit(e:Entity,fruit:string,inside=false){
 for(const r of e.findComponents('render') as unknown as {meshInstances:MeshInstance[];entity:Entity}[])for(const mi of r.meshInstances){const m=own((mi.material as StandardMaterial).clone());m.useMetalness=false;m.useSkybox=false;m.specular=new Color(.16,.13,.09);m.gloss=.36;
  if(inside&&r.entity.name==='lining'){const melon=fruit==='watermelon'||fruit==='strawberry',citrus=fruit==='orange'||fruit==='lemon';m.getShaderChunks('glsl').set('litUserMainEndPS',`
    vec2 fleshUV=vPositionW.xy*5.0;float grain=.96+.04*sin(fleshUV.x*9.0+sin(fleshUV.y*5.0));
    ${melon?'vec2 cell=fract(fleshUV*.7)-.5;float seed=(1.0-smoothstep(.08,.14,length(cell*vec2(1.0,1.8))))*.62;gl_FragColor.rgb*=grain*(1.0-seed);':citrus?'float pulp=.90+.10*abs(sin(fleshUV.x*2.0+fleshUV.y*3.0));gl_FragColor.rgb*=grain*pulp;':'gl_FragColor.rgb*=grain;'}
   `);m.specular=new Color(.02,.02,.02);}
  m.update();mi.material=m;}
}
