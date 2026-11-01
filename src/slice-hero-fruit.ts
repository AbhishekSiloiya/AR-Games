import {Entity,Mesh,SphereGeometry,CylinderGeometry,StandardMaterial,Texture,Color} from 'playcanvas';
import {app,node,own} from './engine.ts';
// Three smooth hero fruits. Geometry, albedo and peel texture are authored here;
// all swipes still clip the actual mesh, including these curved surfaces.
export function sliceHeroFruit(kind:string,size:number){
 const root=own(new Entity('slice-hero-'+kind)),radius=size/2,geometry=new SphereGeometry({radius,latitudeBands:32,longitudeBands:48});
 if(kind==='apple'){const p=geometry.positions;for(let i=0;i<p.length;i+=3){const y=p[i+1]/radius,a=Math.atan2(p[i+2],p[i]),lobe=1+.035*Math.cos(a*5)*(1-y*y);p[i]*=lobe*.96;p[i+2]*=lobe*.96;const d=(p[i]*p[i]+p[i+2]*p[i+2])/(radius*radius);p[i+1]=p[i+1]*.94-Math.sign(y)*Math.exp(-d*12)*radius*.12;}geometry.calculateNormals();}
 if(kind==='watermelon'){for(let i=0;i<geometry.positions.length;i+=3){geometry.positions[i]*=1.08;geometry.positions[i+1]*=.86;geometry.positions[i+2]*=.86;}geometry.calculateNormals();}
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d')!,image=ctx.createImageData(128,64);
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){const u=x/128,v=y/64,noise=((x*73+y*151+x*y*19)%101)/101,grain=.94+noise*.06;let rgb:number[];
  if(kind==='watermelon'){const stripe=.5+.5*Math.sin(u*Math.PI*20+Math.sin(v*12)*.9),k=Math.min(1,Math.max(0,(stripe-.25)*3));rgb=[21+k*39,83+k*51,43+k*13];}
  else if(kind==='orange')rgb=[250,117+noise*18,24+noise*8];else{const blush=.5+.5*Math.sin(u*9+v*4);rgb=[209+blush*26,40+blush*16,37+blush*8];}
  const i=(y*128+x)*4;for(let c=0;c<3;c++)image.data[i+c]=rgb[c]*grain;image.data[i+3]=255;}
 ctx.putImageData(image,0,0);const texture=own(new Texture(app.graphicsDevice,{name:'slice-'+kind+'-skin',mipmaps:true}));texture.setSource(canvas);
 const skin=own(new StandardMaterial());skin.diffuse=new Color(1,1,1);skin.diffuseMap=texture;skin.useMetalness=false;skin.useSkybox=false;skin.specular=new Color(.18,.15,.12);skin.gloss=kind==='orange'?.3:.48;skin.update();node(root,own(Mesh.fromGeometry(app.graphicsDevice,geometry)),skin).name='smooth-'+kind;
 if(kind!=='watermelon'){const stem=own(new StandardMaterial());stem.diffuse=new Color(.25,.13,.05);stem.useMetalness=false;stem.update();node(root,own(Mesh.fromGeometry(app.graphicsDevice,new CylinderGeometry({radius:radius*.035,height:radius*.28,capSegments:10}))),stem,[0,radius*.92,0]).setLocalEulerAngles(0,0,-12);const leaf=own(new StandardMaterial());leaf.diffuse=new Color(.14,.42,.16);leaf.useMetalness=false;leaf.update();const e=node(root,own(Mesh.fromGeometry(app.graphicsDevice,new SphereGeometry({radius:1,latitudeBands:8,longitudeBands:16}))),leaf,[radius*.16,radius*.91,0]);e.setLocalScale(radius*.25,radius*.035,radius*.1);e.setLocalEulerAngles(15,0,25);}
 return root;
}
