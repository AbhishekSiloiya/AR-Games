"""Original MOON Rizzquake mesh/skin/animation authoring. Standard-library only.

The user's original concept is the identity reference. Geometry, weights, materials
and clips below are authored for this project; no stock character or bitmap puppet.
Regenerate with python3 tools/build-rizzquake.py.
"""
import json, math, random, struct
from pathlib import Path
from collections import defaultdict

random.seed(19)
PI=math.pi
def add(a,b): return [a[i]+b[i] for i in range(3)]
def sub(a,b): return [a[i]-b[i] for i in range(3)]
def mul(a,k): return [v*k for v in a]
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def cross(a,b): return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def norm(a): return mul(a,1/max(1e-9,math.sqrt(dot(a,a))))
def mix(a,b,t): return add(mul(a,1-t),mul(b,t))
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a))); return t*t*(3-2*t)

nodes=[]; joints=[]; absolute=[]
def bone(name,pos,parent=None):
 i=len(nodes); ap=pos if parent is None else add(absolute[parent],pos)
 nodes.append({'name':name,'translation':pos});absolute.append(ap);joints.append(i)
 if parent is not None: nodes[parent].setdefault('children',[]).append(i)
 return i
root=bone('Root',[0,0,0]);pelvis=bone('Pelvis',[0,1.35,0],root)
spine=bone('Spine',[0,.72,0],pelvis);head=bone('Head',[0,.95,0],spine)
arms=[];legs=[]
for side,sign in [('L',-1),('R',1)]:
 a=bone('UpperArm.'+side,[sign*.77,.48,0],spine)
 b=bone('LowerArm.'+side,[sign*.74,0,0],a)
 c=bone('Hand.'+side,[sign*.76,0,0],b); arms.append((a,b,c))
 h=bone('Thigh.'+side,[sign*.39,-.12,0],pelvis)
 k=bone('Shin.'+side,[0,-.54,0],h);f=bone('Foot.'+side,[0,-.45,.08],k)
 legs.append((h,k,f))

eyeBones=[bone('Eye.'+side,[sign*.278,.25,.56],head) for side,sign in [('L',-1),('R',1)]]
browBones=[bone('Brow.'+side,[sign*.278,.61,.48],head) for side,sign in [('L',-1),('R',1)]]
smileBone=bone('Smile',[0,-.155,.59],head)

materials=[]; groups=defaultdict(lambda:{'p':[],'n':[],'uv':[],'j':[],'w':[],'i':[]})
def material(name,hex,rough=.8,metal=0):
 rgb=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
 # glTF factors are linear; enter authored swatches as sRGB.
 rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
 materials.append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':rgb+[1],'roughnessFactor':rough,'metallicFactor':metal}})
 return len(materials)-1
green=material('Rizz / moss knit','#8bba39',.92)
inner=material('Rizz / warm moss','#71962e',.94)
hair=material('Rizz / charcoal curls','#292122',.94)
white=material('Rizz / eye ivory','#fff7df',.28)
iris=material('Rizz / amber iris','#623c24',.28)
black=material('Rizz / pupil and smile','#201a1b',.34)
shine=material('Rizz / catchlights','#ffffff',.12)
purple=material('Rizz / plum sports fabric','#633d80',.9)
seam=material('Rizz / fabric seams','#966d9f',.95)
gold=material('Rizz / warm yellow belt','#edb93c',.7)
goldDark=material('Rizz / belt edging','#bc8730',.85)

def rigid(j):return lambda p: [(j,1)]
def body_weight(p):
 y=p[1];h=smooth(2.45,3.18,y);s=smooth(1.38,2.2,y)*(1-h)
 return [(pelvis,1-h-s),(spine,s),(head,h)]
def limb_weight(chain,axis):
 a,b,c=chain;pa,pb,pc=[absolute[j][axis] for j in chain]
 def at(p):
  q=p[axis]
  if pa>pc: q=-q;aa,bb,cc=-pa,-pb,-pc
  else:aa,bb,cc=pa,pb,pc
  u=smooth(bb-.22,bb+.22,q);v=smooth(cc-.18,cc+.12,q)
  return [(a,1-u),(b,u*(1-v)),(c,u*v)]
 return at

def emit(mat,positions,normals,indices,weights,uv=None):
 g=groups[mat];offset=len(g['p'])//3
 for p,n in zip(positions,normals):
  ws=[(j,w) for j,w in weights(p) if w>1e-7];total=sum(w for _,w in ws)
  ws=sorted(ws,key=lambda x:-x[1])[:4];ws += [(0,0)]*(4-len(ws))
  g['p'].extend(p);g['n'].extend(norm(n));g['j'].extend(j for j,_ in ws);g['w'].extend(w/total for _,w in ws)
 g['uv'].extend(uv if uv is not None else [0,0]*(len(positions)))
 g['i'].extend(v+offset for v in indices)

def grid(mat,fn,nu,nv,weights):
 p=[];n=[];idx=[];uv=[]
 for j in range(nv+1):
  for i in range(nu+1):
   u=i/nu;v=j/nv;pt=fn(u,v);eps=.00005
   a=sub(fn(u+eps,v),fn(u-eps,v));b=sub(fn(u,v+eps),fn(u,v-eps))
   p.append(pt);n.append(cross(a,b));uv.extend([u,v])
 for j in range(nv):
  for i in range(nu):
   k=j*(nu+1)+i;idx.extend([k,k+1,k+nu+2,k,k+nu+2,k+nu+1])
 emit(mat,p,n,idx,weights,uv)

def sphere(mat,c,r,weights,nu=32,nv=20,rotation=0,texture=0):
 co,si=math.cos(rotation),math.sin(rotation)
 def fn(u,v):
  a=u*2*PI;b=v*PI;x=math.sin(b)*math.cos(a)*r[0];y=math.cos(b)*r[1];z=math.sin(b)*math.sin(a)*r[2]
  micro=1+texture*math.sin(a*17+b*23)*math.sin(b*37-a*11)
  return add(c,[(x*co-y*si)*micro,(x*si+y*co)*micro,z*micro])
 # Sphere u/v orientation points outward with descending polar angle.
 grid(mat,fn,nu,nv,weights)

def lathe(mat,sections,weights,nu=48,nv=40,texture=0,offset=(0,0,0)):
 # Hermite interpolation through sculpted horizontal sections: y, x-radius, z-radius, centre-z.
 def sample(t):
  f=max(0,min(len(sections)-1.0000001,t*(len(sections)-1)));i=int(f);u=f-i
  a=sections[max(0,i-1)];b=sections[i];c=sections[i+1];d=sections[min(len(sections)-1,i+2)]
  return [(.5*((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u**3)) for k in range(4)]
 def fn(u,v):
  y,rx,rz,cz=sample(v);a=-u*2*PI
  micro=1+texture*math.sin(a*21+y*29)*math.sin(y*41-a*9)
  return add([math.cos(a)*max(.001,rx)*micro,y,cz+math.sin(a)*max(.001,rz)*micro],offset)
 grid(mat,fn,nu,nv,weights)

def tube(mat,points,r,weights,nu=10,nv=20,taper=False):
 def curve(t):
  f=max(0,min(len(points)-1.0000001,t*(len(points)-1)));i=int(f);u=f-i
  a=points[max(0,i-1)];b=points[i];c=points[i+1];d=points[min(len(points)-1,i+2)]
  return [(.5*((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u**3)) for k in range(3)]
 def fn(u,v):
  c=curve(v);t=norm(sub(curve(min(1,v+.001)),curve(max(0,v-.001))))
  a=norm(cross(t,[0,0,1] if abs(t[2])<.9 else [1,0,0]));b=cross(t,a)
  radius=r*(max(.015,math.sin(PI*max(0,min(1,v)))**.35) if taper else .65+.35*math.sin(PI*v))
  return add(c,add(mul(a,math.cos(u*2*PI)*radius),mul(b,math.sin(u*2*PI)*radius)))
 grid(mat,fn,nu,nv,weights)

# Cohesive organic torso/head silhouette, with smoothly weighted neck/waist.
lathe(green,[[1.23,.08,.08,0],[1.43,.66,.45,0],[1.8,.88,.56,-.015],[2.18,1.02,.61,-.025],[2.52,1.02,.58,-.025],[2.72,.65,.48,.01],[3.08,.79,.58,.025],[3.4,.77,.54,.025],[3.56,.66,.47,0],[3.82,.43,.34,0],[3.91,.01,.01,0]],body_weight,64,64,.002)

for side,(a,b,c) in enumerate(arms):
 sign=-1 if side==0 else 1
 weights=limb_weight((a,b,c),0)
 points=[[sign*.67,2.57,0],[sign*.99,2.57,0],[sign*1.5,2.55,0],[sign*1.96,2.55,.015],[sign*2.3,2.55,.03]]
 tube(green,points,.265,weights,18,32)
 sphere(green,[sign*2.29,2.55,.035],[.29,.30,.22],rigid(c),28,18,texture=.003)
 # thumb sculpt keeps hands recognizable even at mitt connection.
 sphere(green,[sign*2.18,2.34,.17],[.15,.20,.15],rigid(c),20,14,sign*.3)

for side,(h,k,f) in enumerate(legs):
 sign=-1 if side==0 else 1;x=sign*.39;weights=limb_weight((h,k,f),1)
 tube(green,[[x,.30,.03],[x,.55,0],[x,.91,0],[x,1.25,0]],.28,weights,20,24)
 sphere(green,[x,.21,.16],[.37,.24,.47],rigid(f),32,20,texture=.002)
 for toe in range(3):sphere(green,[x+(toe-1)*.19,.16,.48],[.13,.14,.19],rigid(f),16,12)
 lathe(purple,[[.98,.32,.35,0],[1.02,.35,.38,0],[1.28,.38,.42,0],[1.49,.35,.39,0]],rigid(h),32,20,offset=(x,0,0))
 # Double hems and short side stitching, all attached to the thigh.
 for zoff in [0,.018]:
  tube(seam,[[x-.32,.98,.23+zoff],[x,.95,.42+zoff],[x+.32,.98,.23+zoff]],.012,rigid(h),6,20)
lathe(purple,[[1.18,.67,.40,0],[1.37,.75,.47,0],[1.58,.73,.46,0]],rigid(pelvis),48,16)
lathe(gold,[[1.45,.753,.48,0],[1.48,.77,.50,0],[1.62,.75,.48,0],[1.65,.73,.46,0]],rigid(pelvis),48,12)
for sign in [-1,1]:
 sphere(gold,[sign*.55,1.55,.39],[.19,.18,.13],rigid(pelvis),20,14,sign*-.12)
 sphere(purple,[sign*.57,1.55,.51],[.045,.05,.018],rigid(pelvis),16,12)
sphere(goldDark,[0,1.55,.54],[.28,.26,.09],rigid(pelvis),32,20)
sphere(gold,[0,1.56,.58],[.25,.235,.075],rigid(pelvis),32,20)
sphere(purple,[0,1.56,.64],[.192,.18,.025],rigid(pelvis),28,16)
# Lightning badge is actual extruded geometry, no printed brand texture.
outline=[[-.015,.15],[-.115,-.025],[-.025,-.025],[-.055,-.15],[.115,.045],[.015,.045]]
p=[[x,1.56+y,.674] for x,y in outline];n=[[0,0,1]]*len(p)
emit(gold,p,n,[0,1,2,0,2,3,0,3,4,0,4,5],rigid(pelvis))

# Face: separate glossy eyeballs, warm irises, lid rims, brows and a curved smile.
for sign in [-1,1]:
 x=sign*.278
 sphere(inner,[x,3.265,.512],[.274,.323,.14],rigid(head),32,24)
 sphere(white,[x,3.27,.56],[.247,.29,.15],rigid(eyeBones[0 if sign==-1 else 1]),40,28)
 sphere(iris,[x-sign*.012,3.245,.696],[.139,.17,.047],rigid(eyeBones[0 if sign==-1 else 1]),32,24)
 sphere(black,[x-sign*.012,3.245,.737],[.081,.109,.027],rigid(eyeBones[0 if sign==-1 else 1]),28,20)
 sphere(shine,[x-.043,3.31,.758],[.043,.049,.016],rigid(eyeBones[0 if sign==-1 else 1]),16,12)
 sphere(shine,[x+.04,3.205,.76],[.016,.018,.006],rigid(eyeBones[0 if sign==-1 else 1]),12,8)
 tube(hair,[[x-sign*.18,3.63,.47],[x,3.69,.49],[x+sign*.16,3.63,.46]],.044,rigid(browBones[0 if sign==-1 else 1]),10,18)
 sphere(green,[sign*.76,3.19,.035],[.17,.24,.18],rigid(head),28,20,sign*-.15)
 sphere(inner,[sign*.83,3.19,.15],[.075,.12,.045],rigid(head),20,16,sign*-.15)
sphere(green,[0,3.09,.672],[.137,.115,.14],rigid(head),32,20)
tube(black,[[-.30,2.96,.53],[-.20,2.90,.572],[0,2.865,.60],[.20,2.90,.572],[.30,2.96,.53]],.018,rigid(smileBone),8,36)
for sign in [-1,1]:sphere(inner,[sign*.31,2.96,.53],[.037,.033,.016],rigid(head),12,8)

# Sculpted charcoal locks with deliberately irregular curl silhouettes. Combined
# into one material primitive rather than a render entity for every curl.
sphere(hair,[0,3.80,0],[.64,.20,.45],rigid(head),36,20)
for i in range(24):
 a=i*2.39996;r=.15+.49*math.sqrt((i+.5)/24);x=math.cos(a)*r;z=math.sin(a)*r*.72
 y=3.79+.17*(1-r/.75);height=random.uniform(.13,.25)
 points=[[x,y-.06,z],[x+.06*math.cos(a),y+.12,z+.035],[x+.14*math.cos(a+.6),y+height,z+.10*math.sin(a)],[x+.20*math.cos(a+.9),y+height*.90,z+.14*math.sin(a+.3)]]
 tube(hair,points,random.uniform(.09,.13),rigid(head),10,12,True)
for i in range(7):
 x=(i-3)*.17;y=3.73+random.uniform(-.04,.07);z=.36+random.uniform(0,.08)
 tube(hair,[[x,y+.13,z-.08],[x+.08,y+.14,z],[x+.13,y+.01,z+.10],[x+.08,y-.08,z+.09]],.09,rigid(head),10,14,True)

blob=bytearray();views=[];accessors=[]
def accessor(data,typ,component=5126,bounds=False):
 while len(blob)%4:blob.append(0)
 off=len(blob);fmt={5126:'f',5123:'H',5125:'I'}[component];blob.extend(struct.pack('<'+fmt*len(data),*data))
 views.append({'buffer':0,'byteOffset':off,'byteLength':len(blob)-off})
 size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[typ]
 a={'bufferView':len(views)-1,'componentType':component,'count':len(data)//size,'type':typ}
 if bounds:a.update(min=[min(data[i::size]) for i in range(size)],max=[max(data[i::size]) for i in range(size)])
 accessors.append(a);return len(accessors)-1
primitives=[]
for mat,g in sorted(groups.items()):
 primitives.append({'attributes':{'POSITION':accessor(g['p'],'VEC3',bounds=True),'NORMAL':accessor(g['n'],'VEC3'),'TEXCOORD_0':accessor(g['uv'],'VEC2'),'JOINTS_0':accessor(g['j'],'VEC4',5123),'WEIGHTS_0':accessor(g['w'],'VEC4')},'indices':accessor(g['i'],'SCALAR',5125),'material':mat})
inv=[]
for p in absolute:inv.extend([1,0,0,0,0,1,0,0,0,0,1,0,-p[0],-p[1],-p[2],1])
ibm=accessor(inv,'MAT4')
modelNode=len(nodes);nodes.append({'name':'Rizzquake.Mesh','mesh':0,'skin':0})
animations=[]
def qz(degrees):a=math.radians(degrees)/2;return [0,0,math.sin(a),math.cos(a)]
def animation(name,seconds,tracks):
 anim={'name':name,'channels':[],'samplers':[]};times=accessor([0,seconds*.25,seconds*.5,seconds*.75,seconds],'SCALAR',bounds=True)
 for j,path,vals in tracks:
  data=[v for item in vals for v in item];sampler=len(anim['samplers'])
  anim['samplers'].append({'input':times,'output':accessor(data,'VEC4' if path=='rotation' else 'VEC3'),'interpolation':'LINEAR'})
  anim['channels'].append({'sampler':sampler,'target':{'node':j,'path':path}})
 animations.append(anim)
animation('Ready',2.4,[(spine,'rotation',[qz(v) for v in [0,.8,0,-.8,0]]),(head,'rotation',[qz(v) for v in [0,-1,0,1,0]])])
for side,sign in [(0,-1),(1,1)]:
 a,b,c=arms[side];suffix='Left' if side==0 else 'Right'
 animation('Present'+suffix,.6,[(a,'rotation',[qz(sign*v) for v in [65,40,10,-15,-25]]),(b,'rotation',[qz(sign*v) for v in [-90,-70,-35,-10,8]])])
 animation('Impact'+suffix,.34,[(a,'rotation',[qz(sign*v) for v in [-25,-12,-4,-12,-25]]),(b,'rotation',[qz(sign*v) for v in [8,27,35,23,8]]),(head,'rotation',[qz(sign*v) for v in [0,-3,-5,-2,0]])])
animation('Celebrate',1.1,[(head,'rotation',[qz(v) for v in [0,-8,7,-3,0]]),(spine,'rotation',[qz(v) for v in [0,4,-4,2,0]])])
doc={'asset':{'version':'2.0','generator':'MOON original Rizzquake mesh authoring v1'},'scene':0,'scenes':[{'nodes':[root,modelNode]}],'nodes':nodes,'meshes':[{'name':'Rizzquake','primitives':primitives}],'skins':[{'name':'Rizzquake.Rig','joints':joints,'skeleton':root,'inverseBindMatrices':ibm}],'animations':animations,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob.extend(b'\x00'*((-len(blob))%4))
glb=struct.pack('<III',0x46546C67,2,12+8+len(j)+8+len(blob))+struct.pack('<II',len(j),0x4E4F534A)+j+struct.pack('<II',len(blob),0x004E4942)+blob
out=Path(__file__).resolve().parents[1]/'public/assets/moon/jab/rizzquake.glb';out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(glb)
print(f'Authored {out}: {len(glb)//1024} KB, {len(nodes)} nodes, {len(materials)} material groups, {len(animations)} clips')
