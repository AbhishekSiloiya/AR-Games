// One draw per ball: twelve pentagonal patches generated in the material, no extra panel meshes.
import { ShaderMaterial, SEMANTIC_NORMAL, SEMANTIC_POSITION } from 'playcanvas';
import { own } from './engine.ts';
export function footballMaterial() {
  const m=own(new ShaderMaterial({uniqueName:'football-panels',attributes:{vertex_position:SEMANTIC_POSITION,vertex_normal:SEMANTIC_NORMAL},
    vertexGLSL:`attribute vec3 vertex_position;attribute vec3 vertex_normal;uniform mat4 matrix_model;uniform mat4 matrix_viewProjection;varying vec3 vNormal;
      void main(){vNormal=vertex_normal;gl_Position=matrix_viewProjection*matrix_model*vec4(vertex_position,1.0);}`,
    fragmentGLSL:`#include "gammaPS"
      varying vec3 vNormal;uniform vec3 material_diffuse;
      void main(){vec3 n=normalize(vNormal);float panelMask=0.0;
        for(int i=0;i<12;i++){float y=1.0-2.0*(float(i)+0.5)/12.0;float a=float(i)*2.399963;float r=sqrt(1.0-y*y);vec3 d=vec3(cos(a)*r,y,sin(a)*r);
          vec3 u=normalize(cross(d,abs(d.z)>.9?vec3(0,1,0):vec3(0,0,1)));vec3 v=cross(d,u);
          vec2 q=vec2(dot(n,u),dot(n,v));float angle=atan(q.y,q.x);float edge=.235*cos(.628319)/cos(mod(angle+.628319,1.256637)-.628319);
          panelMask=max(panelMask,(1.0-smoothstep(edge-.012,edge+.012,length(q)))*step(.75,dot(n,d)));}
        vec3 c=mix(material_diffuse,vec3(.018,.035,.055),panelMask);c*=.6+.4*max(0.0,dot(n,normalize(vec3(.3,.6,.8))));gl_FragColor=vec4(gammaCorrectOutput(c),1.0);}`,
  }));m.setParameter('material_diffuse',[1,1,1]);m.update();return m;
}
