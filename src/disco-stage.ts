import { ShaderMaterial, SEMANTIC_POSITION } from 'playcanvas';
import { node, own, shapes, type Scene } from './engine.ts';
// One background draw: a lit dance floor, moving spotlights and a mirrored disco ball.
export function discoStage(scene: Scene) {
  const m=own(new ShaderMaterial({uniqueName:'beat-disco-floor',attributes:{vertex_position:SEMANTIC_POSITION},
    vertexGLSL:`attribute vec3 vertex_position;uniform mat4 matrix_model;uniform mat4 matrix_viewProjection;varying vec2 vUv;
      void main(){vUv=vertex_position.xy/vec2(16.0,9.0)+.5;gl_Position=matrix_viewProjection*matrix_model*vec4(vertex_position,1.0);}`,
    fragmentGLSL:`#include "gammaPS"
      varying vec2 vUv;uniform float uBeat;
      vec3 palette(float k){return .52+.45*cos(vec3(0.,2.1,4.2)+k);}
      void main(){vec2 uv=vUv;vec3 c=mix(vec3(.035,.025,.10),vec3(.13,.035,.21),uv.y);float pulse=.65+.35*pow(.5+.5*cos(uBeat*6.28318),3.);
        if(uv.y<.43){float depth=max(.035,.43-uv.y);vec2 grid=vec2((uv.x-.5)/depth*2.,1./depth);vec2 cell=floor(grid);vec2 edge=min(fract(grid),1.-fract(grid));float inner=smoothstep(.025,.065,min(edge.x,edge.y));vec3 col=palette(cell.x*.7+cell.y*.5+floor(uBeat*.25));c=mix(vec3(.025,.015,.05),col*(.35+.32*pulse),inner);c*=.65+.35*(1.-uv.y/.43);}
        for(int i=0;i<4;i++){float id=float(i);vec2 from=vec2(.12+id*.25,.96);float aim=.5+.32*sin(uBeat*.12+id*1.7);float x=from.x+(aim-from.x)*clamp((.96-uv.y)/.8,0.,1.);float width=.012+(.96-uv.y)*.10;float beam=exp(-pow((uv.x-x)/width,2.))*smoothstep(.15,.95,uv.y);c+=palette(id*1.6)*beam*.18*pulse;}
        vec2 q=(uv-vec2(.5,.85))*vec2(1.78,1.);float r=length(q);if(r<.075){float z=sqrt(max(0.,.075*.075-r*r));vec3 n=normalize(vec3(q,z));vec2 tile=floor(vec2(atan(n.x,n.z)*12.+uBeat*.12,asin(n.y)*14.));float shine=.5+.5*sin(tile.x*7.+tile.y*17.);c=vec3(.4,.55,.7)+shine*.35;}
        c+=vec3(.2,.35,.5)*exp(-r*r*120.)*.25;gl_FragColor=vec4(gammaCorrectOutput(c),1.);}`,
  }));m.setParameter('uBeat',0);m.update();const e=node(scene.root,shapes.quad(16,9),m,[0,0,-18]);e.name='disco-dance-floor';
  return (beat:number)=>m.setParameter('uBeat',beat);
}
