"""Rendus 3D du matériel pour la planche Nolan.Arc.
Modèles génériques (aucune marque, aucun logo), matières physiques, éclairage studio identique pour tous.
Usage : python3 gear3d.py <nom|all> <taille_px> <samples> [dossier_sortie]
"""
import bpy, bmesh, math, sys, os, time
from mathutils import Vector

OUT = sys.argv[4] if len(sys.argv) > 4 else '/tmp/r3d/out'
K = float(os.environ.get('GEAR_K', '1'))   # réglage global de l'éclairage
os.makedirs(OUT, exist_ok=True)
R = math.radians


# ---------------------------------------------------------------- couleurs et matières
def lin(c, a=1.0):
    if isinstance(c, str):
        c = c.lstrip('#'); c = tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (f(c[0]), f(c[1]), f(c[2]), a)


KEYS = {'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness', 'trans': 'Transmission Weight', 'ior': 'IOR',
        'film': 'Thin Film Thickness', 'film_ior': 'Thin Film IOR', 'sheen': 'Sheen Weight', 'aniso': 'Anisotropic',
        'emit': 'Emission Strength', 'spec': 'Specular IOR Level', 'sss': 'Subsurface Weight'}


def bsdf(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def mat(name, color, rough=0.5, metal=0.0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = bsdf(m)
    b.inputs['Base Color'].default_value = lin(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k, v in kw.items():
        if k == 'emit_color':
            b.inputs['Emission Color'].default_value = lin(v); continue
        if KEYS[k] in b.inputs: b.inputs[KEYS[k]].default_value = v
    return m


def grain(m, scale=600.0, strength=0.2, detail=3.0, distance=0.0003, rough_var=0.0):
    """Grain de surface (plastique moulé, caoutchouc, papier) par relief procédural."""
    nt = m.node_tree; b = bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = detail
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = distance
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    if rough_var:
        mr = nt.nodes.new('ShaderNodeMapRange'); base = b.inputs['Roughness'].default_value
        mr.inputs['To Min'].default_value = max(0.02, base - rough_var); mr.inputs['To Max'].default_value = min(1.0, base + rough_var)
        nt.links.new(nz.outputs[0], mr.inputs['Value']); nt.links.new(mr.outputs[0], b.inputs['Roughness'])
    return m


def ribs(m, axis='X', count=140, strength=0.6, distance=0.0006):
    """Cannelures parallèles à l'axe (bagues de zoom et de mise au point, molettes)."""
    nt = m.node_tree; b = bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs[0])
    a, c = {'X': ('Y', 'Z'), 'Y': ('X', 'Z'), 'Z': ('X', 'Y')}[axis]
    at = nt.nodes.new('ShaderNodeMath'); at.operation = 'ARCTAN2'
    nt.links.new(sep.outputs[a], at.inputs[0]); nt.links.new(sep.outputs[c], at.inputs[1])
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = count
    sn = nt.nodes.new('ShaderNodeMath'); sn.operation = 'SINE'
    nt.links.new(at.outputs[0], mul.inputs[0]); nt.links.new(mul.outputs[0], sn.inputs[0])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = distance
    nt.links.new(sn.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def library():
    L = {}
    L['body'] = grain(mat('body', '#1b1a19', 0.52), 1400, 0.12, 4, 0.0002, 0.05)             # magnésium peint
    L['rubber'] = grain(mat('rubber', '#0e0d0c', 0.78), 900, 0.5, 5, 0.0005, 0.06)             # caoutchouc de poignée
    L['satin'] = grain(mat('satin', '#141312', 0.38), 2200, 0.06, 2, 0.0001, 0.04)             # plastique satiné
    L['gloss'] = mat('gloss', '#060606', 0.08, coat=1.0, coat_rough=0.03)                      # noir laqué
    L['ano'] = grain(mat('ano', '#161514', 0.36, 0.9), 2600, 0.05, 2, 0.0001, 0.05)            # aluminium anodisé noir
    L['silver'] = grain(mat('silver', '#cfc9c1', 0.28, 1.0, aniso=0.5), 3000, 0.04, 2, 0.0001, 0.05)
    L['steel'] = mat('steel', '#8f8a84', 0.22, 1.0)
    L['gold'] = mat('gold', '#d4a640', 0.25, 1.0)
    L['ember'] = mat('ember', '#cc460c', 0.35, coat=0.4)
    L['white'] = mat('white', '#f4f1ec', 0.2, coat=0.6, coat_rough=0.08, sss=0.05)             # plastique blanc brillant
    L['whitematte'] = grain(mat('whitematte', '#ece8e1', 0.5), 2500, 0.05, 2, 0.0001)
    L['hole'] = mat('hole', '#010101', 0.9)
    L['sensor'] = mat('sensor', '#0c2a2c', 0.12, 0.6, film=420.0, film_ior=1.45, coat=1.0, coat_rough=0.02)
    L['zoomring'] = ribs(mat('zoomring', '#0d0c0b', 0.8), 'X', 110, 0.9, 0.0009)
    L['focusring'] = ribs(mat('focusring', '#0d0c0b', 0.78), 'X', 190, 0.8, 0.0006)
    L['knurlY'] = ribs(mat('knurlY', '#1a1918', 0.45, 0.6), 'Y', 46, 0.9, 0.0006)
    L['teal'] = mat('teal', '#0f3b39', 0.3, emit=1.6, emit_color='#3fb7a8', coat=1.0, coat_rough=0.05)
    return L


# ---------------------------------------------------------------- géométrie
def finish(o, m=None, bevel=None, segs=4):
    if m: o.data.materials.append(m)
    if bevel:
        b = o.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = segs
        b.limit_method = 'ANGLE'; b.angle_limit = R(40)
    for p in o.data.polygons: p.use_smooth = True
    wn = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); wn.keep_sharp = True
    return o


def box(name, size, loc, m, bevel=0.002, segs=4, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, m, bevel, segs)


def cyl(name, r, depth, loc, m, rot=(0, 0, 0), bevel=0.0008, segs=3, verts=96, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    return finish(o, m, bevel, segs)


def ball(name, scale, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o


def rslab(name, w, h, t, radius, m, z0=0.0, loc=(0, 0), bevel=0.0008, segs=3, steps=14, uv=False):
    """Plaque à coins arrondis (tablette, façade d'appareil) : contour arrondi extrudé."""
    bm = bmesh.new(); pts = []
    for cx, cy, a0 in ((w / 2 - radius, h / 2 - radius, 0), (-w / 2 + radius, h / 2 - radius, 90), (-w / 2 + radius, -h / 2 + radius, 180), (w / 2 - radius, -h / 2 + radius, 270)):
        for i in range(steps + 1):
            a = R(a0 + 90 * i / steps); pts.append((cx + radius * math.cos(a), cy + radius * math.sin(a)))
    bot = [bm.verts.new((x + loc[0], y + loc[1], z0)) for x, y in pts]
    top = [bm.verts.new((x + loc[0], y + loc[1], z0 + t)) for x, y in pts]
    n = len(pts)
    ftop = bm.faces.new(top); bm.faces.new(bot[::-1])
    for i in range(n): bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if uv:
        layer = bm.loops.layers.uv.new('UVMap')
        for f in bm.faces:
            for lp in f.loops:
                lp[layer].uv = ((lp.vert.co.x - loc[0]) / w + 0.5, (lp.vert.co.y - loc[1]) / h + 0.5)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    return finish(o, m, bevel, segs)


def lathe(name, profile, m, axis='X', verts=128, bevel=0.0006, segs=2):
    """Pièce de révolution : profile = [(position le long de l'axe, rayon), ...]."""
    bm = bmesh.new(); rings = []
    for pos, r in profile:
        ring = []
        for i in range(verts):
            a = 2 * math.pi * i / verts; u, v = r * math.cos(a), r * math.sin(a)
            co = {'X': (pos, u, v), 'Y': (u, pos, v), 'Z': (u, v, pos)}[axis]
            ring.append(bm.verts.new(co))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(verts): bm.faces.new((a[i], a[(i + 1) % verts], b[(i + 1) % verts], b[i]))
    bm.faces.new(rings[0]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    return finish(o, m, bevel, segs)


def cut(target, cutter):
    """Découpe réelle (booléen) placée avant le chanfrein pour que l'arête coupée accroche la lumière."""
    mod = target.modifiers.new('cut', 'BOOLEAN'); mod.object = cutter; mod.operation = 'DIFFERENCE'
    try: mod.solver = 'EXACT'
    except Exception: pass
    while target.modifiers.find('cut') > 0:
        with bpy.context.temp_override(object=target): bpy.ops.object.modifier_move_up(modifier='cut')
    cutter.hide_render = True; cutter.hide_viewport = True


def group(objs, rot_z=0.0, loc=(0, 0, 0)):
    bpy.ops.object.empty_add(location=(0, 0, 0)); e = bpy.context.object
    for o in objs: o.parent = e
    e.rotation_euler = (0, 0, R(rot_z)); e.location = loc
    return e


# ---------------------------------------------------------------- objets
def camera(L):
    """Boîtier hybride posé sur le dos, monture vers le haut."""
    cx, cy = 0.010, -0.003
    body = rslab('body', 0.128, 0.084, 0.046, 0.012, L['body'], 0.0, bevel=0.0035, segs=5)
    top = rslab('toplate', 0.120, 0.012, 0.040, 0.004, L['body'], 0.003, loc=(0.002, 0.044), bevel=0.002)
    evf = rslab('evf', 0.042, 0.026, 0.044, 0.007, L['body'], 0.002, loc=(0.004, 0.054), bevel=0.003, segs=4)
    box('shoe', (0.021, 0.005, 0.019), (0.004, 0.0685, 0.024), L['steel'], 0.0008)
    grip = rslab('grip', 0.038, 0.086, 0.066, 0.015, L['rubber'], 0.0, loc=(-0.047, -0.001), bevel=0.009, segs=7)
    rslab('pad', 0.026, 0.046, 0.0016, 0.006, L['rubber'], 0.0455, loc=(0.047, -0.014), bevel=0.0008)
    # commandes du dessus, vues par la tranche
    cyl('shutter_ring', 0.0105, 0.006, (-0.047, 0.045, 0.047), L['knurlY'], rot=(R(90), 0, 0))
    cyl('shutter', 0.006, 0.004, (-0.047, 0.0495, 0.047), L['steel'], rot=(R(90), 0, 0), bevel=0.001)
    cyl('dial1', 0.012, 0.008, (0.036, 0.0525, 0.026), L['knurlY'], rot=(R(90), 0, 0))
    cyl('dial2', 0.0105, 0.007, (0.055, 0.052, 0.022), L['knurlY'], rot=(R(90), 0, 0))
    cyl('frontdial', 0.0055, 0.012, (-0.036, 0.036, 0.062), L['knurlY'], rot=(0, R(90), 0), verts=48)
    # monture : bague métal, gorge réellement creusée, capteur au fond
    ring = cyl('mount', 0.0335, 0.0045, (cx, cy, 0.0470), L['silver'], bevel=0.0009, verts=128)
    inner = cyl('mount_in', 0.0285, 0.0030, (cx, cy, 0.0478), L['steel'], bevel=0.0006, verts=128)
    throat = cyl('throat', 0.0238, 0.050, (cx, cy, 0.046), None, bevel=None, verts=96)
    for o in (body, ring, inner): cut(o, throat)
    cyl('well', 0.0236, 0.0006, (cx, cy, 0.0212), L['hole'], bevel=None)
    box('frame', (0.040, 0.028, 0.0012), (cx, cy, 0.0220), L['satin'], 0.0004)
    box('sensor', (0.036, 0.024, 0.0008), (cx, cy, 0.0230), L['sensor'], 0.0002)
    for i in range(10): box(f'pin{i}', (0.0011, 0.0022, 0.0008), (cx - 0.0081 + i * 0.0018, cy - 0.0195, 0.030), L['gold'], None)
    box('pinbar', (0.022, 0.0036, 0.0016), (cx, cy - 0.0195, 0.0292), L['satin'], 0.0004)
    cyl('dot', 0.0013, 0.0006, (cx, cy + 0.0312, 0.0494), L['white'], bevel=None, verts=24)
    for k in range(4):
        a = R(45 + 90 * k); cyl(f'screw{k}', 0.0011, 0.0005, (cx + 0.0262 * math.cos(a), cy + 0.0262 * math.sin(a), 0.0494), L['hole'], bevel=None, verts=16)
    cyl('release', 0.0058, 0.004, (0.052, -0.004, 0.0468), L['gloss'], bevel=0.001, verts=48)
    cyl('lamp', 0.0036, 0.0016, (-0.022, 0.030, 0.0462), L['ember'], bevel=0.0005, verts=32)
    for sx in (-1, 1): box(f'lug{sx}', (0.005, 0.009, 0.004), (sx * 0.0655 + 0.0, 0.032, 0.030), L['steel'], 0.001)


def lens(L):
    """Zoom standard posé sur le flanc, axe le long de X."""
    z = 0.0445
    parts = [
        ('mount', [(-0.0660, 0.0290), (-0.0660, 0.0312), (-0.0585, 0.0312), (-0.0585, 0.0290)], L['silver']),
        ('rear', [(-0.0585, 0.0345), (-0.0585, 0.0368), (-0.0370, 0.0385), (-0.0370, 0.0350)], L['satin']),
        ('zoom', [(-0.0370, 0.0380), (-0.0370, 0.0408), (0.0050, 0.0408), (0.0050, 0.0380)], L['zoomring']),
        ('mid', [(0.0050, 0.0370), (0.0050, 0.0393), (0.0205, 0.0393), (0.0205, 0.0370)], L['satin']),
        ('accent', [(0.0205, 0.0380), (0.0205, 0.0396), (0.0222, 0.0396), (0.0222, 0.0380)], L['ember']),
        ('focus', [(0.0222, 0.0385), (0.0222, 0.0414), (0.0455, 0.0414), (0.0455, 0.0385)], L['focusring']),
        ('front', [(0.0455, 0.0400), (0.0455, 0.0428), (0.0600, 0.0440), (0.0635, 0.0445), (0.0635, 0.0400)], L['satin']),
        ('rim', [(0.0635, 0.0405), (0.0635, 0.0436), (0.0650, 0.0436), (0.0650, 0.0405)], L['ano']),
    ]
    for name, prof, m in parts:
        o = lathe(name, prof, m); o.location = (0, 0, z)
    box('switch_base', (0.012, 0.020, 0.003), (-0.047, 0.0, z + 0.0372), L['body'], 0.0008)
    box('switch', (0.005, 0.008, 0.003), (-0.047, 0.003, z + 0.0386), L['whitematte'], 0.0008)
    for i in range(7): box(f'tick{i}', (0.0006, 0.0040 if i % 3 == 0 else 0.0022, 0.0004), (0.0085 + i * 0.0016, 0.0, z + 0.0392), L['whitematte'], None)


def mic(L):
    """Micro canon : tube à interférences fendu, corps, connecteur."""
    z = 0.0102
    lathe('tube', [(-0.128, 0.0), (-0.128, 0.0088), (-0.1265, 0.0098), (0.060, 0.0098), (0.060, 0.0)], L['ano'], verts=96, bevel=0.0004).location = (0, 0, z)
    lathe('body', [(0.060, 0.0), (0.060, 0.0106), (0.114, 0.0106), (0.114, 0.0)], L['ano'], verts=96, bevel=0.0005).location = (0, 0, z)
    for x in (0.060, 0.114):
        lathe(f'ring{x}', [(x - 0.0008, 0.0), (x - 0.0008, 0.0109), (x + 0.0008, 0.0109), (x + 0.0008, 0.0)], L['steel'], verts=96, bevel=None).location = (0, 0, z)
    lathe('xlr', [(0.114, 0.0), (0.114, 0.0096), (0.1265, 0.0096), (0.128, 0.0088), (0.128, 0.0)], L['silver'], verts=96, bevel=0.0004).location = (0, 0, z)
    for row, ang in enumerate((-34, 0, 34)):
        a = R(ang)
        for i in range(12):
            box(f'slot{row}_{i}', (0.0105, 0.0019, 0.0012), (-0.116 + i * 0.0142 + (0.0071 if row == 1 else 0), 0.0096 * math.sin(a), z + 0.0096 * math.cos(a)), L['hole'], 0.0006, 3, rot=(-a, 0, 0))
    box('switch', (0.010, 0.0042, 0.0018), (0.082, 0.0, z + 0.0108), L['satin'], 0.0006)
    box('led', (0.0022, 0.0022, 0.0008), (0.098, 0.0, z + 0.0106), L['ember'], 0.0004)


def gimbal(L):
    """Stabilisateur trois axes replié, posé à plat : poignée, trois moteurs, bras, plateau."""
    zc = 0.022
    cyl('grip', 0.0205, 0.088, (0, -0.066, zc), L['rubber'], rot=(R(90), 0, 0), bevel=0.006, segs=5)
    cyl('base', 0.0215, 0.012, (0, -0.114, zc), L['ano'], rot=(R(90), 0, 0), bevel=0.003)
    rslab('head', 0.046, 0.066, 0.042, 0.012, L['ano'], 0.001, loc=(0, 0.010), bevel=0.006, segs=5)
    rslab('screen', 0.026, 0.019, 0.0008, 0.003, L['teal'], 0.043, loc=(0, 0.024), bevel=0.0003)
    cyl('stick', 0.0062, 0.004, (0, 0.0015, 0.0445), L['rubber'], bevel=0.0012, verts=48)
    cyl('rec', 0.0048, 0.002, (-0.010, -0.012, 0.0438), L['ember'], bevel=0.0006, verts=48)
    cyl('btn', 0.0042, 0.002, (0.010, -0.012, 0.0438), L['satin'], bevel=0.0006, verts=48)
    cyl('pan', 0.027, 0.038, (0, 0.060, 0.027), L['ano'], rot=(R(90), 0, 0), bevel=0.004, segs=4)
    rslab('arm1', 0.112, 0.024, 0.016, 0.006, L['ano'], 0.012, loc=(0.052, 0.088), bevel=0.003)
    cyl('roll', 0.0265, 0.036, (0.104, 0.094, 0.022), L['ano'], bevel=0.004, segs=4)
    cyl('rollcap', 0.0175, 0.002, (0.104, 0.094, 0.0405), L['gloss'], bevel=0.0006)
    rslab('arm2', 0.024, 0.092, 0.016, 0.006, L['ano'], 0.012, loc=(0.104, 0.140), bevel=0.003)
    cyl('tilt', 0.0245, 0.034, (0.104, 0.186, 0.022), L['ano'], bevel=0.004, segs=4)
    cyl('tiltcap', 0.016, 0.002, (0.104, 0.186, 0.0395), L['gloss'], bevel=0.0006)
    rslab('plate', 0.150, 0.034, 0.012, 0.006, L['ano'], 0.014, loc=(0.034, 0.186), bevel=0.003)
    rslab('rail', 0.094, 0.014, 0.0012, 0.004, L['hole'], 0.0258, loc=(0.016, 0.186), bevel=0.0004)
    cyl('knob', 0.0085, 0.006, (-0.030, 0.186, 0.029), L['knurlY'], bevel=0.0015, verts=48)
    for x, y in ((0.066, 0.088), (0.104, 0.124), (0.104, 0.158)):
        box(f'lock{x}{y}', (0.011, 0.006, 0.004), (x, y, 0.029), L['ember'], 0.0012)


def earbuds(L):
    """Écouteurs sans fil : boîtier blanc brillant et deux écouteurs."""
    case = rslab('case', 0.047, 0.055, 0.0215, 0.016, L['white'], 0.0, bevel=0.0075, segs=8)
    seam = box('seam', (0.08, 0.0007, 0.08), (0, 0.011, 0.02), None, None)
    cut(case, seam)
    box('hinge', (0.016, 0.0022, 0.0016), (0, 0.0262, 0.0115), L['steel'], 0.0005)
    cyl('led', 0.0011, 0.0006, (0, -0.006, 0.0216), L['ember'], bevel=None, verts=24)

    def bud(side):
        parts = [ball('head', (0.0086, 0.0092, 0.0072), (0, 0.012, 0.0072), L['white']),
                 cyl('stem', 0.0033, 0.030, (0, -0.006, 0.0036), L['white'], rot=(R(90), 0, 0), bevel=0.0012, verts=48),
                 cyl('tip', 0.00335, 0.003, (0, -0.0205, 0.0036), L['steel'], rot=(R(90), 0, 0), bevel=0.0006, verts=48),
                 ball('mesh', (0.0038, 0.0030, 0.0012), (side * 0.0022, 0.0155, 0.0132), L['hole'])]
        return group(parts, rot_z=side * -16, loc=(side * 0.045, 0.004, 0))
    bud(-1); bud(1)


def tablet(L, screen_png='/tmp/r3d/screen.png'):
    """Grande tablette, écran allumé sur un storyboard, stylet posé à côté."""
    rslab('chassis', 0.3264, 0.2086, 0.0052, 0.0125, L['ano'], 0.0, bevel=0.0016, segs=4)
    rslab('glass', 0.3240, 0.2062, 0.0006, 0.0115, L['gloss'], 0.0051, bevel=0.0003)
    sm = bpy.data.materials.new('screen'); sm.use_nodes = True; b = bsdf(sm)
    b.inputs['Base Color'].default_value = (0.004, 0.004, 0.004, 1); b.inputs['Roughness'].default_value = 0.06
    b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.02
    tex = sm.node_tree.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(screen_png)
    sm.node_tree.links.new(tex.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 1.15
    rslab('screen', 0.3120, 0.1942, 0.0001, 0.0060, sm, 0.0057, bevel=None, uv=True)
    cyl('cam', 0.0014, 0.0002, (0, 0.1004, 0.0057), L['hole'], bevel=None, verts=24)
    pen = [cyl('pen', 0.0041, 0.132, (0, 0.004, 0.0041), L['whitematte'], rot=(R(90), 0, 0), bevel=0.0012, verts=48),
           cyl('pentip', 0.0036, 0.011, (0, -0.0675, 0.0041), L['satin'], rot=(R(90), 0, 0), bevel=None, verts=48, r2=0.0006),
           box('penflat', (0.0022, 0.020, 0.0006), (0, 0.030, 0.0080), L['steel'], 0.0003)]
    group(pen, rot_z=-7, loc=(0.186, 0.0, 0))


def paper_mat(name, color, rough=0.82):
    m = mat(name, color, rough, sheen=0.25)
    return grain(m, 1700, 0.28, 6, 0.00012, 0.04)


def note(L, color):
    """Post-it : feuille carrée dont un coin se soulève."""
    m = paper_mat('note', color)
    bm = bmesh.new(); n = 40; s = 0.076
    bmesh.ops.create_grid(bm, x_segments=n, y_segments=n, size=s / 2)
    for v in bm.verts:
        d = (v.co.x - v.co.y) / s            # 0 au centre, ~1 au coin bas-droit
        lift = max(0.0, d - 0.25)
        v.co.z = 0.0010 + 0.050 * lift ** 2 + 0.0004 * math.sin(v.co.x * 90) * math.cos(v.co.y * 70)
    me = bpy.data.meshes.new('note'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('note', me); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    sol = o.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.00012


def strip(L, color, w, h, seed):
    """Bande de papier déchirée aux deux bouts, âme blanche visible à la déchirure."""
    import random; rnd = random.Random(seed)

    def outline(grow=0.0):
        pts = []; k = 26
        for i in range(k + 1): pts.append((-w / 2 + w * i / k, h / 2 + grow + rnd.uniform(-1, 1) * h * 0.012))
        for i in range(1, k): pts.append((w / 2 + grow + rnd.uniform(-1, 1) * h * 0.10 + (h * 0.06 if i % 2 else 0), h / 2 - h * i / k))
        for i in range(k + 1): pts.append((w / 2 - w * i / k, -h / 2 - grow + rnd.uniform(-1, 1) * h * 0.012))
        for i in range(1, k): pts.append((-w / 2 - grow + rnd.uniform(-1, 1) * h * 0.10 - (h * 0.06 if i % 2 else 0), -h / 2 + h * i / k))
        return pts

    def sheet(name, pts, z, m):
        bm = bmesh.new(); f = bm.faces.new([bm.verts.new((x, y, z)) for x, y in pts])
        bmesh.ops.triangulate(bm, faces=[f])
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(m)
        sol = o.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.00025
        return o
    rnd2 = random.Random(seed); state = rnd.getstate()
    sheet('core', outline(h * 0.035), 0.0003, paper_mat('core', '#fbf9f5', 0.9))
    rnd.setstate(state); rnd.seed(seed)
    sheet('face', outline(0.0), 0.0006, paper_mat('face', color))


def mat_board(L, size=(0.90, 0.75)):
    """Tapis de découpe orange : surface grenée, quadrillage imprimé tous les 1 cm et 5 cm."""
    bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.object; o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(scale=True)
    m = bpy.data.materials.new('mat'); m.use_nodes = True; nt = m.node_tree; b = bsdf(m)
    b.inputs['Roughness'].default_value = 0.72; b.inputs['Specular IOR Level'].default_value = 0.22
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs[0])

    def lines(axis, step, width):
        mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 1.0 / step
        add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'; add.inputs[1].default_value = 100.5
        fr = nt.nodes.new('ShaderNodeMath'); fr.operation = 'FRACT'
        sub = nt.nodes.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'; sub.inputs[1].default_value = 0.5
        ab = nt.nodes.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'
        lt = nt.nodes.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = width / step / 2
        nt.links.new(sep.outputs[axis], mul.inputs[0]); nt.links.new(mul.outputs[0], add.inputs[0]); nt.links.new(add.outputs[0], fr.inputs[0])
        nt.links.new(fr.outputs[0], sub.inputs[0]); nt.links.new(sub.outputs[0], ab.inputs[0]); nt.links.new(ab.outputs[0], lt.inputs[0])
        return lt.outputs[0]

    def mx(a, c, scale=1.0):
        n = nt.nodes.new('ShaderNodeMath'); n.operation = 'MAXIMUM'
        if scale != 1.0:
            s = nt.nodes.new('ShaderNodeMath'); s.operation = 'MULTIPLY'; s.inputs[1].default_value = scale; nt.links.new(c, s.inputs[0]); c = s.outputs[0]
        nt.links.new(a, n.inputs[0]); nt.links.new(c, n.inputs[1]); return n.outputs[0]
    minor = mx(lines('X', 0.01, 0.00045), lines('Y', 0.01, 0.00045))
    major = mx(lines('X', 0.05, 0.0011), lines('Y', 0.05, 0.0011))
    fac = mx(major, minor, 0.36)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9.0; nz.inputs['Detail'].default_value = 5.0
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    base = nt.nodes.new('ShaderNodeMix'); base.data_type = 'RGBA'
    base.inputs['A'].default_value = lin('#c9430b'); base.inputs['B'].default_value = lin('#d9530f'); nt.links.new(nz.outputs[0], base.inputs['Factor'])
    ink = nt.nodes.new('ShaderNodeMix'); ink.data_type = 'RGBA'; ink.inputs['B'].default_value = lin('#f2cfa6')
    nt.links.new(base.outputs['Result'], ink.inputs['A']); nt.links.new(fac, ink.inputs['Factor'])
    nt.links.new(ink.outputs['Result'], b.inputs['Base Color'])
    fine = nt.nodes.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 2600.0; fine.inputs['Detail'].default_value = 3.0
    nt.links.new(tc.outputs['Object'], fine.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.22; bp.inputs['Distance'].default_value = 0.0002
    nt.links.new(fine.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    o.data.materials.append(m)


def phone(L):
    """Téléphone générique posé à plat. L'écran est rendu transparent : la page y place la vidéo."""
    ti = grain(mat('titanium', '#2b2a29', 0.34, 1.0, aniso=0.4), 3200, 0.05, 2, 0.0001, 0.05)
    rslab('body', 0.0745, 0.158, 0.0078, 0.0118, ti, 0.0, bevel=0.0014, segs=5)
    rslab('glass', 0.0733, 0.1568, 0.0005, 0.0112, L['gloss'], 0.0077, bevel=0.0002)
    hm = bpy.data.materials.new('holdout'); hm.use_nodes = True; nt = hm.node_tree
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'); ho = nt.nodes.new('ShaderNodeHoldout')
    nt.links.new(ho.outputs[0], out.inputs['Surface'])
    rslab('screen', 0.0695, 0.153, 0.0002, 0.0092, hm, 0.00825, bevel=None)
    box('power', (0.0014, 0.013, 0.0030), (0.0377, 0.028, 0.0040), ti, 0.0005)
    box('volup', (0.0014, 0.009, 0.0030), (-0.0377, 0.040, 0.0040), ti, 0.0005)
    box('voldown', (0.0014, 0.009, 0.0030), (-0.0377, 0.027, 0.0040), ti, 0.0005)


def stage(L):
    """Table rouge profond éclairée par un seul disque de lumière chaude : le décor des vidéos sociales."""
    bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.object; o.scale = (1.40, 1.00, 1)
    bpy.ops.object.transform_apply(scale=True)
    m = mat('stage', '#8c1407', 0.62, sheen=0.15, spec=0.15); nt = m.node_tree; b = bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 6.0
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['A'].default_value = lin('#a81505'); mix.inputs['B'].default_value = lin('#d02c0a')
    nt.links.new(nz.outputs[0], mix.inputs['Factor']); nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    fine = nt.nodes.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 1800.0; fine.inputs['Detail'].default_value = 4.0
    nt.links.new(tc.outputs['Object'], fine.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.3; bp.inputs['Distance'].default_value = 0.0003
    nt.links.new(fine.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    o.data.materials.append(m)
    bpy.ops.object.light_add(type='SPOT', location=(0.0, 0.05, 1.25)); sp = bpy.context.object
    sp.data.energy = 88 * K / 0.15; sp.data.spot_size = R(64); sp.data.spot_blend = 0.85; sp.data.shadow_soft_size = 0.2; sp.data.color = (1.0, 0.86, 0.72)


# ---------------------------------------------------------------- scène, lumière, rendu
def setup(samples, transparent=True):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'; s.cycles.device = 'CPU'; s.cycles.samples = samples
    s.cycles.use_denoising = True; s.cycles.use_adaptive_sampling = True; s.cycles.adaptive_threshold = 0.03
    s.render.film_transparent = transparent; s.render.resolution_percentage = 100
    s.render.image_settings.file_format = 'PNG'; s.render.image_settings.color_mode = 'RGBA'; s.render.image_settings.color_depth = '8'
    s.view_settings.view_transform = 'Standard'   # couleurs fidèles à la charte (l'orange du tapis doit rester l'orange de la marque)
    try: s.view_settings.look = 'None'
    except Exception: pass
    w = bpy.data.worlds.new('w'); s.world = w; w.use_nodes = True
    bg = next((n for n in w.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg: bg.inputs[0].default_value = (0.95, 0.86, 0.78, 1); bg.inputs[1].default_value = 0.22
    return s


def light(name, loc, target, power, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object; l.name = name
    l.data.energy = power * K; l.data.size = size; l.data.color = color
    l.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return l


def bounds():
    lo = Vector((1e9, 1e9, 1e9)); hi = Vector((-1e9, -1e9, -1e9))
    dg = bpy.context.evaluated_depsgraph_get()
    for o in bpy.context.scene.objects:
        if o.type != 'MESH' or o.hide_render or o.get('catcher'): continue
        ev = o.evaluated_get(dg)
        for c in ev.bound_box:
            p = ev.matrix_world @ Vector(c)
            for i in range(3): lo[i] = min(lo[i], p[i]); hi[i] = max(hi[i], p[i])
    return lo, hi


def render(name, build, px, samples, catcher=True, margin=0.16, exposure=0.0, dscale=2.2, rot_z=0.0, studio=1.0, catch_color='#c9430b', ambient=0.22):
    t = time.time(); s = setup(samples, transparent=catcher)
    bgn = next((n for n in s.world.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bgn: bgn.inputs[1].default_value = ambient
    L = library(); build(L)
    if rot_z:
        bpy.ops.object.empty_add(location=(0, 0, 0)); pivot = bpy.context.object
        for o in list(bpy.context.scene.objects):
            if o is not pivot and o.parent is None: o.parent = pivot
        pivot.rotation_euler = (0, 0, R(rot_z))
    bpy.context.view_layer.update(); lo, hi = bounds()
    cx, cy = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2; w, h = hi.x - lo.x, hi.y - lo.y; span = max(w, h, 0.05)
    if catcher:
        # plan qui reçoit l'ombre ; sa teinte orange renvoie la couleur du tapis sous les objets
        bpy.ops.mesh.primitive_plane_add(size=6, location=(cx, cy, 0)); p = bpy.context.object; p['catcher'] = 1
        p.is_shadow_catcher = True; p.data.materials.append(mat('catch', catch_color, 0.7))
        pad = margin * span + 0.012 + hi.z * 0.55
        w2, h2 = w + 2 * pad, h + 2 * pad; ox, oy = cx + hi.z * 0.22, cy - hi.z * 0.22   # l'ombre part en bas à droite
    else:
        w2, h2, ox, oy = w, h, cx, cy
    d = max(span * dscale, 0.5)
    light('key', (cx - d * 0.62, cy + d * 0.55, d * 1.05), (cx, cy, 0), 95 * d * d * studio, d * 0.85, (1.0, 0.96, 0.9))
    light('fill', (cx + d * 0.8, cy - d * 0.5, d * 0.9), (cx, cy, 0), 16 * d * d * studio, d * 1.6, (0.9, 0.94, 1.0))
    light('top', (cx, cy, d * 1.6), (cx, cy, 0), 22 * d * d * studio, d * 2.2)
    bpy.ops.object.camera_add(location=(ox, oy, 3.0)); c = bpy.context.object; c.data.type = 'ORTHO'; c.data.clip_end = 10
    if w2 >= h2: s.render.resolution_x = px; s.render.resolution_y = max(8, round(px * h2 / w2)); c.data.ortho_scale = w2
    else: s.render.resolution_y = px; s.render.resolution_x = max(8, round(px * w2 / h2)); c.data.ortho_scale = h2
    s.camera = c; s.view_settings.exposure = exposure
    s.render.filepath = f'{OUT}/{name}.png'; bpy.ops.render.render(write_still=True)
    print(f'RENDU {name} {s.render.resolution_x}x{s.render.resolution_y} mm_par_px={1000 * max(w2, h2) / px:.4f} objet_mm={1000 * w:.0f}x{1000 * h:.0f} en {time.time() - t:.0f}s', flush=True)


SIZE = {'tablet': 1.0, 'camera': 0.60, 'lens': 0.56, 'mic': 0.80, 'gimbal': 0.78, 'earbuds': 0.50, 'note': 0.27, 'strip': 0.80, 'mat': 2.10}
JOBS = {
    'camera': lambda px, sp: render('camera', camera, round(px * SIZE['camera']), sp, rot_z=-5),
    'lens': lambda px, sp: render('lens', lens, round(px * SIZE['lens']), sp, rot_z=14),
    'mic': lambda px, sp: render('mic', mic, round(px * SIZE['mic']), sp, rot_z=-3),
    'gimbal': lambda px, sp: render('gimbal', gimbal, round(px * SIZE['gimbal']), sp, rot_z=-10),
    'earbuds': lambda px, sp: render('earbuds', earbuds, round(px * SIZE['earbuds']), sp, rot_z=10),
    'tablet': lambda px, sp: render('tablet', tablet, round(px * SIZE['tablet']), sp, rot_z=6),
    'note-sun': lambda px, sp: render('note-sun', lambda L: note(L, '#f3c531'), round(px * SIZE['note']), sp),
    'note-teal': lambda px, sp: render('note-teal', lambda L: note(L, '#1b7262'), round(px * SIZE['note']), sp),
    'note-paper': lambda px, sp: render('note-paper', lambda L: note(L, '#f3eee4'), round(px * SIZE['note']), sp),
    'strip-1': lambda px, sp: render('strip-1', lambda L: strip(L, '#070606', 0.150, 0.040, 11), round(px * SIZE['strip']), sp, margin=0.06),
    'strip-2': lambda px, sp: render('strip-2', lambda L: strip(L, '#f3eee4', 0.250, 0.032, 23), round(px * SIZE['strip']), sp, margin=0.05),
    'strip-3': lambda px, sp: render('strip-3', lambda L: strip(L, '#f8f4ed', 0.200, 0.042, 37), round(px * SIZE['strip']), sp, margin=0.05),
    'phone': lambda px, sp: render('phone', phone, round(px * 1.3), sp, catch_color='#8c1407'),
    'stage': lambda px, sp: render('stage', stage, round(px * 1.74), max(24, sp // 2), catcher=False, studio=0.0, ambient=0.02),
    'mat': lambda px, sp: render('mat', mat_board, round(px * SIZE['mat']), max(24, sp // 2), catcher=False, dscale=1.15),
    'mat-mobile': lambda px, sp: render('mat-mobile', lambda L: mat_board(L, (0.47, 1.0105)), round(px * 1.75), max(24, sp // 2), catcher=False, dscale=1.15),
}

if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'; px = int(sys.argv[2]) if len(sys.argv) > 2 else 480; sp = int(sys.argv[3]) if len(sys.argv) > 3 else 16
    for job in (JOBS if which == 'all' else which.split(',')):
        try: JOBS[job](px, sp)
        except Exception as e:
            import traceback; print('ECHEC', job, repr(e), flush=True); traceback.print_exc()
