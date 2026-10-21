// Sprint's riverside loop: one background draw, no downloaded scenery or per-frame entities.
// Distance moves the trail and trees; the sky stays calm while the runner takes a breather.
import { ShaderMaterial, SEMANTIC_POSITION } from 'playcanvas';
import { node, own, shapes, type Scene } from './engine.ts';
import { audio, musicOut } from './audio.ts';

export function scenicTrack(scene: Scene, lanes: number) {
  const material = own(new ShaderMaterial({
    uniqueName: 'riverside-sprint-track',
    attributes: { vertex_position: SEMANTIC_POSITION },
    vertexGLSL: `attribute vec3 vertex_position; uniform mat4 matrix_model; uniform mat4 matrix_viewProjection; varying vec2 vUv;
      void main(void) { vUv = vertex_position.xy / vec2(16.0, 9.0) + 0.5; gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0); }`,
    fragmentGLSL: `#include "gammaPS"
      varying vec2 vUv; uniform float uTime; uniform float uDistance; uniform float uLanes;
      float triangle(float x) { return 1.0 - abs(fract(x) * 2.0 - 1.0); }
      float segment(vec2 p, vec2 a, vec2 b) { vec2 q = b-a; return length(p-a-q*clamp(dot(p-a,q)/dot(q,q),0.0,1.0)); }
      void main(void) {
        vec2 uv = vUv; float horizon = 0.539, ground = step(uv.y,horizon);
        vec3 c = mix(vec3(0.60,0.86,0.94),vec3(0.23,0.60,0.86),smoothstep(horizon,1.0,uv.y));
        vec2 sun = (uv-vec2(0.79,0.83))*vec2(1.78,1.0);
        c += vec3(0.40,0.29,0.08)*exp(-dot(sun,sun)*40.0);
        c = mix(c,vec3(1.0,0.89,0.57),1.0-smoothstep(0.033,0.038,length(sun)));
        // Clouds drift slowly, independently of the player's pace.
        float cloudX = fract(uv.x*2.1-uTime*0.004);
        float cloud = (1.0-smoothstep(0.11,0.15,length(vec2((cloudX-0.5)*0.45,(uv.y-0.88)*2.0))));
        c = mix(c,vec3(0.97,0.99,1.0),cloud*0.68);
        float farPeak=horizon+0.04+0.15*triangle(uv.x*3.6+0.1+uDistance*0.0001);
        float midPeak=horizon+0.025+0.12*triangle(uv.x*4.4+0.66+uDistance*0.0002);
        float farMask=1.0-smoothstep(farPeak-0.002,farPeak+0.002,uv.y);
        c=mix(c,vec3(0.39,0.61,0.67),farMask);
        float snow=farMask*smoothstep(horizon+0.13,horizon+0.17,uv.y);
        c=mix(c,vec3(0.88,0.95,0.95),snow);
        c=mix(c,vec3(0.28,0.51,0.47),1.0-smoothstep(midPeak-0.002,midPeak+0.002,uv.y));
        float hill=horizon+0.018+0.018*sin(uv.x*15.0+uDistance*0.0005);
        c=mix(c,vec3(0.38,0.62,0.30),1.0-smoothstep(hill-0.003,hill+0.003,uv.y));
        if(ground>0.5) {
          float d=clamp((horizon-uv.y)/(horizon+0.02),0.0,1.0), depth=pow(d,0.417);
          c=mix(vec3(0.39,0.65,0.31),vec3(0.24,0.51,0.20),d);
          c+=vec3(0.015)*sin((depth*48.0-uDistance*0.7)*6.2832);
          float riverX=0.54+0.36*pow(d,0.72)+0.025*sin(depth*9.0-uDistance*0.0005)*d;
          float riverWidth=0.004+0.085*d;
          float river=1.0-smoothstep(riverWidth,riverWidth+0.007,abs(uv.x-riverX));
          float sparkle=pow(max(0.0,sin(uv.x*210.0+depth*63.0+uTime*2.0)),14.0);
          vec3 water=mix(vec3(0.10,0.55,0.67),vec3(0.33,0.79,0.87),d)+sparkle*0.14;
          c=mix(c,water,river);
          float halfWidth=(uLanes>1.5?0.014:0.018)+(uLanes>1.5?0.195:0.40)*d;
          float laneA=uLanes>1.5?0.25:0.5, laneB=uLanes>1.5?0.75:0.5;
          // Each lane converges to its original Sprint horizon: obstacles keep their exact old hit positions.
          float laneDx=min(abs(uv.x-laneA),abs(uv.x-laneB));
          float path=1.0-smoothstep(halfWidth,halfWidth+0.005,laneDx);
          vec3 dirt=mix(vec3(0.77,0.66,0.46),vec3(0.64,0.50,0.31),d);
          float stripe=1.0-smoothstep(0.0015+0.003*d,0.0035+0.004*d,laneDx);
          float dash=step(0.60,fract(depth*15.0-uDistance*0.20));
          dirt=mix(dirt,vec3(0.98,0.92,0.70),stripe*dash*0.75);
          float edge=1.0-smoothstep(0.002,0.004,abs(laneDx-(halfWidth-0.008*d)));
          dirt=mix(dirt,vec3(0.93,0.85,0.64),edge*0.6);
          c=mix(c,dirt,path);
        }
        // Five recycled pairs of trees. A fixed loop gives constant work and no object churn.
        for(int i=0;i<10;i++) {
          float id=float(i), side=mod(id,2.0)*2.0-1.0;
          float s=fract(floor(id/2.0)*0.2+uDistance*0.0075), k=pow(s,2.4);
          float x=0.5+side*(0.035+0.57*k), y=horizon-(horizon+0.12)*k;
          float height=0.012+0.19*k, width=height*0.36;
          vec2 q=uv-vec2(x,y);
          float trunk=step(abs(q.x),width*0.16)*step(0.0,q.y)*step(q.y,height*0.35);
          c=mix(c,vec3(0.31,0.23,0.13),trunk);
          float leaf=step(0.18*height,q.y)*step(q.y,height)*step(abs(q.x),width*(1.0-(q.y-height*0.18)/(height*0.82)));
          vec3 leafColor=mix(vec3(0.16,0.39,0.25),vec3(0.21,0.49,0.28),mod(id,3.0)/2.0);
          c=mix(c,leafColor,leaf);
        }
        for(int i=0;i<4;i++) {
          float id=float(i), bx=fract(id*0.28+uTime*(0.012+id*0.001)), by=0.75+0.037*sin(id*2.7)+0.008*sin(uTime+id);
          vec2 q=(uv-vec2(bx,by))*vec2(1.78,1.0);
          float flap=0.005+0.006*sin(uTime*5.0+id*1.8);
          float wing=min(segment(q,vec2(-0.018,flap),vec2(0.0,0.0)),segment(q,vec2(0.0,0.0),vec2(0.018,flap)));
          c=mix(c,vec3(0.12,0.26,0.29),1.0-smoothstep(0.001,0.002,wing));
        }
        gl_FragColor=vec4(gammaCorrectOutput(max(c,0.0)),1.0);
      }`,
  }));
  material.setParameter('uTime', 0); material.setParameter('uDistance', 0); material.setParameter('uLanes', lanes); material.update();
  const e = node(scene.root, shapes.quad(16,9), material,[0,0,-20]); e.name='scenic-riverside-track';
  let time=0, nextBird=1.3;
  const singing=new Set<OscillatorNode>();
  scene.cleanup(()=>{for(const o of singing){try{o.stop();}catch{ /* Already ended. */ }o.disconnect();}singing.clear();});
  return {
    drive(distance:number,dt:number) {
      time+=dt; material.setParameter('uDistance',distance); material.setParameter('uTime',time);
      if((nextBird-=dt)>0)return;
      nextBird=2.8+Math.random()*2.4;
      // Original, quiet birdsong: no third-party recordings or licensing dependency.
      const context=audio(); if(context.state!=='running')return;
      for(let i=0;i<3;i++) {
        const at=context.currentTime+i*.12, o=context.createOscillator(), gain=context.createGain();
        o.type='sine';o.frequency.setValueAtTime(2000+i*170,at);o.frequency.exponentialRampToValueAtTime(3400-i*230,at+.045);o.frequency.exponentialRampToValueAtTime(2200+i*110,at+.11);
        gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.035,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+.12);
        o.connect(gain).connect(musicOut());singing.add(o);o.onended=()=>{singing.delete(o);o.disconnect();gain.disconnect();};o.start(at);o.stop(at+.13);
      }
    },
  };
}
