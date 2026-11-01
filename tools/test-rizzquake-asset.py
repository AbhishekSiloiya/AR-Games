"""Validate a deployable character rig, not just a model with an animation clock."""
import json
import struct
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'public/assets/moon/jab/rizzquake.glb'
assert path.exists(), 'Jab needs its own skinned Rizzquake GLB; concept art is not a character asset'
raw = path.read_bytes()
magic, version, length = struct.unpack_from('<III', raw)
assert magic == 0x46546C67 and version == 2 and length == len(raw)
json_len, _ = struct.unpack_from('<II', raw, 12)
doc = json.loads(raw[20:20+json_len])
binary = raw[28+json_len:]

def values(index):
    a = doc['accessors'][index]
    view = doc['bufferViews'][a['bufferView']]
    count = a['count'] * {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    fmt = {5126:'f',5123:'H',5125:'I'}[a['componentType']]
    return struct.unpack_from('<'+fmt*count, binary, view.get('byteOffset',0)+a.get('byteOffset',0))

skin = doc['skins'][0]
names = {n.get('name','') for n in doc['nodes']}
assert {'Head','Spine','UpperArm.L','LowerArm.L','Hand.L','UpperArm.R','LowerArm.R','Hand.R','Foot.L','Foot.R','Eye.L','Eye.R','Brow.L','Brow.R','Smile'} <= names
assert len(values(skin['inverseBindMatrices'])) == len(skin['joints'])*16
vertices = triangles = blended = 0
for primitive in doc['meshes'][0]['primitives']:
    attrs = primitive['attributes']
    assert {'POSITION','NORMAL','JOINTS_0','WEIGHTS_0'} <= attrs.keys()
    positions, weights, joints = values(attrs['POSITION']), values(attrs['WEIGHTS_0']), values(attrs['JOINTS_0'])
    vertices += len(positions)//3
    triangles += len(values(primitive['indices']))//3
    assert max(joints) < len(skin['joints'])
    for i in range(0,len(weights),4):
        w = weights[i:i+4]
        assert abs(sum(w)-1)<1e-5 and min(w)>=0
        blended += sum(v>0 for v in w)>1
assert 5000 < vertices < 80000, vertices
assert 8000 < triangles < 120000, triangles
assert blended > 200, 'limbs must deform across joints rather than move as rigid cutouts'
clips = {a['name']:a for a in doc['animations']}
assert {'Ready','PresentLeft','PresentRight','ImpactLeft','ImpactRight','Celebrate'} <= clips.keys()
for name in ['PresentLeft','PresentRight','ImpactLeft','ImpactRight']:
    clip = clips[name]
    moving = [c for c in clip['channels'] if doc['nodes'][c['target']['node']]['name'].startswith(('UpperArm','LowerArm'))]
    assert moving, name
    assert any(len(set(values(clip['samplers'][c['sampler']]['output'])))>4 for c in moving), name
assert len(raw)<4_000_000, len(raw)
print(f'PASS Rizzquake: {vertices} vertices, {triangles} triangles, {blended} blended vertices, {len(clips)} authored clips, {len(raw)//1024} KB')
