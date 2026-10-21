import { ShaderMaterial, SEMANTIC_NORMAL, SEMANTIC_POSITION } from 'playcanvas';
import { own } from './engine.ts';
export function beachBallMaterial(){
  const m=own(new ShaderMaterial({uniqueName:'beach-ball-stripes',attributes:{vertex_position:SEMANTIC_POSITION,vertex_normal:SEMANTIC_NORMAL},
    vertexGLSL:`attribute vec3 vertex_position;attribute vec3 vertex_normal;uniform mat4 matrix_model;uniform mat4 matrix_viewProjection;varying vec3 vNormal;void main(){vNormal=vertex_normal;gl_Position=matrix_viewProjection*matrix_model*vec4(vertex_position,1.);}`,
    fragmentGLSL:`#include "gammaPS"
      varying vec3 vNormal;void main(){vec3 n=normalize(vNormal);float sector=(atan(n.x,n.z)+3.141593)*.95493;float band=mod(floor(sector),6.);vec3 c=vec3(.98);if(band<1.)c=vec3(.95,.12,.2);else if(band>1.5&&band<2.5)c=vec3(1.,.7,.05);else if(band>3.5&&band<4.5)c=vec3(.05,.55,.95);float seam=min(fract(sector),1.-fract(sector));c*=mix(.8,1.,smoothstep(0.,.025,seam));c*=.6+.4*max(0.,dot(n,normalize(vec3(-.3,.5,.8))));c+=pow(max(0.,dot(n,normalize(vec3(-.3,.5,.8)))),32.)*.3;gl_FragColor=vec4(gammaCorrectOutput(c),1.);}`,
  }));m.update();return m;
}
