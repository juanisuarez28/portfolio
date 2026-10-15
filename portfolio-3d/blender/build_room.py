"""
Construye la habitación del portfolio 3D en Blender y la exporta a GLB (F13 / F14).

Uso (desde portfolio-3d/):
  blender -b --factory-startup -P blender/build_room.py -- [--preview out.png] [--bake] [--export]

- Todo se modela en coordenadas de three.js (Y arriba, Z hacia la cámara) dentro de un empty ROOT
  rotado 90° en X; al exportar con +Y arriba el GLB queda en las mismas coordenadas que la escena web.
- Los materiales solo llevan NOMBRE (y un color para el render de prueba). En la web `useRoomMaterials`
  los reemplaza por materiales PBR. Convenciones de nombres:
    · Nombres fijos (Floor, Wall, Oak, Walnut, Linen, ...)  → material con textura
    · C_<hex>[_<rugosidad>]                                  → color liso
    · Mallas IMG_* / SCREEN_* / PAPER_*                      → planos con textura de canvas (UV 0..1)
    · Mallas LED_* / RGB_* / BULB_*                          → emisivos animados desde la web
    · GLASS_*                                                → vidrio
- El AO se hornea en Cycles a un atlas compartido (2.º set de UVs "AO") → blender/out/room_ao.png.
- Salida en blender/out/; `npm run model:optimize` la comprime (meshopt + WebP) a public/models/.
"""
import bpy
import bmesh
import math
import os
import random
import sys
from mathutils import Euler, Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ARGS = {'preview': None, 'bake': False, 'export': False}
for i, a in enumerate(argv):
    if a == '--preview':
        ARGS['preview'] = argv[i + 1]
    elif a == '--bake':
        ARGS['bake'] = True
    elif a == '--export':
        ARGS['export'] = True

random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
SCN = bpy.context.scene
COL = SCN.collection

ROOT = bpy.data.objects.new('ROOT', None)
COL.objects.link(ROOT)
ROOT.rotation_euler = (math.radians(90), 0, 0)

# objetos que NO se hornean (se mueven, son imágenes o vidrio)
NO_BAKE = set()

# ───────────────────────────── materiales ─────────────────────────────

PREVIEW_COLORS = {
    'Floor': '#b8875a', 'Wall': '#e8dccb', 'WallLeft': '#dfd1bd', 'WallTrim': '#f4ede2', 'Slab': '#c9a77c',
    'Oak': '#d7b48a', 'Walnut': '#6b4630', 'WhitePaint': '#f1ede6', 'Linen': '#f3efe8', 'Blanket': '#2f4566',
    'Curtain': '#c8674a', 'Velvet': '#e0a43a', 'Leather': '#1d1f24', 'LeatherAccent': '#00b8e0',
    'Metal': '#b9bec7', 'BlackMetal': '#22252b', 'Plastic': '#1d1f24', 'PlasticWhite': '#eceae6',
    'Gold': '#d4a72c', 'Plant': '#4f8a4b', 'PlantDark': '#356b3a', 'Terracotta': '#d9825b', 'Ceramic': '#f1efe9',
    'Paper': '#fbf7ef', 'Cork': '#c49a6c', 'Rug': '#24324a', 'Denim': '#3d5a80', 'Jacket': '#2b3a55',
    'Rubber': '#202020', 'Wicker': '#c7a271', 'Gourd': '#7a5236', 'Termo': '#2d6a4f', 'Jersey': '#1f6fd1',
    'Glass': '#cfe8ff', 'Screen': '#0b0f18', 'Soil': '#3b2a1e', 'Yerba': '#6b8f2a',
}
_mats = {}


def M(name):
    if name in _mats:
        return _mats[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    hexc = PREVIEW_COLORS.get(name)
    if name.startswith('C_'):
        hexc = '#' + name.split('_')[1]
    if hexc:
        c = tuple(int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
        bsdf.inputs['Base Color'].default_value = (c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2, 1)
    bsdf.inputs['Roughness'].default_value = 0.7
    _mats[name] = m
    return m


# ───────────────────────────── utilidades de malla ─────────────────────────────

def _finish(name, bm, mat, parent, pos, rot, uv_box=True, bevel=0.0, subsurf=0, solidify=0.0, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    ob.parent = parent or ROOT
    ob.rotation_mode = 'ZYX'  # equivale al orden 'XYZ' de three.js
    ob.location = pos
    ob.rotation_euler = rot
    if mat:
        me.materials.append(M(mat))
    if solidify:
        mod = ob.modifiers.new('solid', 'SOLIDIFY')
        mod.thickness = solidify
        mod.offset = 0
    if bevel:
        mod = ob.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = 'ANGLE'
        mod.harden_normals = False
    if subsurf:
        mod = ob.modifiers.new('subsurf', 'SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf
    if smooth or subsurf:
        for p in me.polygons:
            p.use_smooth = True
    if uv_box:
        box_uv(ob)
    return ob


def box_uv(ob, scale=1.0):
    """UV de caja en coordenadas de la habitación (1 unidad UV = 1 m) para texturas que se repiten."""
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name='UVMap')
    uv = me.uv_layers['UVMap'].data
    mw = ob.matrix_parent_inverse @ ob.matrix_basis if ob.parent else ob.matrix_basis
    # transformación local respecto de ROOT (padres intermedios incluidos)
    mats = []
    p = ob
    while p is not None and p.name != 'ROOT':
        mats.append(p.matrix_basis.copy())
        p = p.parent
    mw = Matrix.Identity(4)
    for m in reversed(mats):
        mw = mw @ m
    rot = mw.to_3x3()
    for poly in me.polygons:
        n = rot @ poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            co = mw @ me.vertices[me.loops[li].vertex_index].co
            if ax == 0:
                u, v = co.z, co.y
            elif ax == 1:
                u, v = co.x, co.z
            else:
                u, v = co.x, co.y
            uv[li].uv = (u * scale, v * scale)


def group(name, pos=(0, 0, 0), rot=(0, 0, 0), parent=None):
    ob = bpy.data.objects.new(name, None)
    COL.objects.link(ob)
    ob.parent = parent or ROOT
    ob.rotation_mode = 'ZYX'
    ob.location = pos
    ob.rotation_euler = rot
    return ob


def box(name, size, pos, mat, rot=(0, 0, 0), bevel=0.006, parent=None, subsurf=0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    return _finish(name, bm, mat, parent, pos, rot, bevel=bevel, subsurf=subsurf)


def cyl(name, r1, r2, h, pos, mat, rot=(0, 0, 0), seg=32, parent=None, bevel=0.0, cap=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h)
    # create_cone es en Z: lo paso a Y (vertical de three)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(-90), 3, 'X'))
    ob = _finish(name, bm, mat, parent, pos, rot, bevel=bevel, smooth=True)
    for p in ob.data.polygons:
        if abs(p.normal.y) > 0.9:
            p.use_smooth = False
    return ob


def sphere(name, r, pos, mat, scale=(1, 1, 1), parent=None, seg=24, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
    return _finish(name, bm, mat, parent, pos, rot, smooth=True)


def lathe(name, profile, pos, mat, seg=32, parent=None, rot=(0, 0, 0), cap_top=False, cap_bottom=True):
    """Superficie de revolución alrededor del eje Y. profile = [(radio, altura), ...] de abajo hacia arriba."""
    bm = bmesh.new()
    rings = []
    for r, y in profile:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            ring.append(bm.verts.new((math.cos(a) * r, y, math.sin(a) * r)))
        rings.append(ring)
    for j in range(len(rings) - 1):
        for i in range(seg):
            a, b = rings[j][i], rings[j][(i + 1) % seg]
            c, d = rings[j + 1][(i + 1) % seg], rings[j + 1][i]
            bm.faces.new((a, d, c, b))
    if cap_bottom and profile[0][0] > 0:
        bm.faces.new(list(reversed(rings[0])))
    if cap_top and profile[-1][0] > 0:
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _finish(name, bm, mat, parent, pos, rot, smooth=True)


def grid(name, nu, nv, fn, pos, mat, parent=None, rot=(0, 0, 0), solidify=0.0, subsurf=0, uv01=False, flip=False):
    """Superficie paramétrica fn(u, v) -> (x, y, z), u y v en [0, 1]."""
    bm = bmesh.new()
    verts = [[bm.verts.new(fn(i / nu, j / nv)) for i in range(nu + 1)] for j in range(nv + 1)]
    bm.verts.ensure_lookup_table()
    uvl = bm.loops.layers.uv.new('UVMap') if uv01 else None
    for j in range(nv):
        for i in range(nu):
            quad = (verts[j][i], verts[j][i + 1], verts[j + 1][i + 1], verts[j + 1][i])
            f = bm.faces.new(tuple(reversed(quad)) if flip else quad)
            if uvl:
                for loop, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                    loop[uvl].uv = (a / nu, b / nv)
    ob = _finish(name, bm, mat, parent, pos, rot, uv_box=not uv01, solidify=solidify, subsurf=subsurf, smooth=True)
    return ob


def image_plane(name, w, h, pos, rot=(0, 0, 0), parent=None):
    """Plano con UV 0..1 que mira a +Z local. Recibe una textura de canvas en la web."""
    bm = bmesh.new()
    vs = [bm.verts.new((x * w / 2, y * h / 2, 0)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    f = bm.faces.new(vs)
    uvl = bm.loops.layers.uv.new('UVMap')
    for loop, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uvl].uv = uv
    ob = _finish(name, bm, 'Screen' if name.startswith('SCREEN') else 'Paper', parent, pos, rot, uv_box=False)
    NO_BAKE.add(ob.name)
    return ob


def tube(name, pts, r, mat, parent=None, seg=8):
    """Cable: barre un círculo a lo largo de una polilínea."""
    bm = bmesh.new()
    pts = [Vector(p) for p in pts]
    rings = []
    for k, p in enumerate(pts):
        t = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
        a = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0))
        n1 = t.cross(a).normalized()
        n2 = t.cross(n1).normalized()
        rings.append([bm.verts.new(p + (n1 * math.cos(2 * math.pi * i / seg) + n2 * math.sin(2 * math.pi * i / seg)) * r) for i in range(seg)])
    for j in range(len(rings) - 1):
        for i in range(seg):
            bm.faces.new((rings[j][i], rings[j][(i + 1) % seg], rings[j + 1][(i + 1) % seg], rings[j + 1][i]))
    return _finish(name, bm, mat, parent, (0, 0, 0), (0, 0, 0), smooth=True)


def bezier(p0, p1, p2, n=12):
    return [tuple((1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i] for i in range(3)) for t in (k / n for k in range(n + 1))]


def leaf(name, length, width, pos, rot, mat, parent=None, droop=0.25):
    def fn(u, v):
        x = (u - 0.5) * width * math.sin(math.pi * v) ** 0.8 * 2
        z = v * length
        y = -droop * (v ** 2) * length + abs(x) * 0.15
        return (x, y, z)
    return grid(name, 6, 10, fn, pos, mat, parent=parent, rot=rot, solidify=0.004)


def framed_image(name, img_name, w, h, pos, rot, frame_mat='Walnut', depth=0.03, border=0.03, parent=None):
    g = group(name, pos, rot, parent)
    box(name + '_Frame', (w + border * 2, h + border * 2, depth), (0, 0, 0), frame_mat, parent=g, bevel=0.004)
    image_plane(img_name, w, h, (0, 0, depth / 2 + 0.0015), parent=g)
    return g


# ───────────────────────────── estructura ─────────────────────────────
H, T = 3.4, 0.2
WIN = dict(x=-1.55, y=1.8, w=1.4, h=1.3)
wl, wr = WIN['x'] - WIN['w'] / 2, WIN['x'] + WIN['w'] / 2
wb, wt = WIN['y'] - WIN['h'] / 2, WIN['y'] + WIN['h'] / 2

box('Slab', (6 + T, 0.3, 6 + T), (-T / 2, -0.15, -T / 2), 'Slab', bevel=0.02)
floor = grid('Floor', 24, 24, lambda u, v: (-3 + 6 * u, 0.002, -3 + 6 * v), (0, 0, 0), 'Floor', flip=True)  # normal hacia arriba
bz = -3 - T / 2
box('WallBack_L', (wl + 3 + T, H, T), ((wl - 3 - T) / 2, H / 2, bz), 'Wall', bevel=0.003)
box('WallBack_R', (3 - wr, H, T), ((wr + 3) / 2, H / 2, bz), 'Wall', bevel=0.003)
box('WallBack_B', (WIN['w'], wb, T), (WIN['x'], wb / 2, bz), 'Wall', bevel=0.003)
box('WallBack_T', (WIN['w'], H - wt, T), (WIN['x'], (wt + H) / 2, bz), 'Wall', bevel=0.003)
box('WallLeft', (T, H, 6), (-3 - T / 2, H / 2, 0), 'WallLeft', bevel=0.003)
box('Baseboard_B', (6, 0.09, 0.02), (0, 0.045, -2.99), 'WallTrim', bevel=0.003)
box('Baseboard_L', (0.02, 0.09, 6), (-2.99, 0.045, 0), 'WallTrim', bevel=0.003)

# ventana
wz = -3 - T / 2
f = 0.06
for nm, s, p in (
    ('WinFrame_T', (WIN['w'] + f, f, T + 0.04), (WIN['x'], wt, wz)),
    ('WinFrame_B', (WIN['w'] + f, f, T + 0.04), (WIN['x'], wb, wz)),
    ('WinFrame_L', (f, WIN['h'], T + 0.04), (wl, WIN['y'], wz)),
    ('WinFrame_R', (f, WIN['h'], T + 0.04), (wr, WIN['y'], wz)),
    ('WinMullion_V', (0.035, WIN['h'], 0.05), (WIN['x'], WIN['y'], wz)),
    ('WinMullion_H', (WIN['w'], 0.035, 0.05), (WIN['x'], WIN['y'] + 0.12, wz)),
    ('WinSill', (WIN['w'] + 0.24, 0.05, 0.24), (WIN['x'], wb - 0.02, -2.92)),
):
    box(nm, s, p, 'WallTrim', bevel=0.008)
glass = image_plane('GLASS_Window', WIN['w'], WIN['h'], (WIN['x'], WIN['y'], wz))
glass.data.materials.clear()
glass.data.materials.append(M('Glass'))

# barral y cortinas con pliegues
box('CurtainRod', (WIN['w'] + 1.0, 0.025, 0.025), (WIN['x'], wt + 0.22, -2.86), 'BlackMetal', bevel=0.01)
for side, sx in (('L', -1), ('R', 1)):
    x0 = WIN['x'] + sx * (WIN['w'] / 2 + 0.22)

    def curtain(u, v, x0=x0):
        w = 0.5
        x = x0 + (u - 0.5) * w
        flare = 1 + (1 - v) * 0.25
        z = -2.86 + 0.035 * math.sin(u * w * 2 * math.pi / 0.1) * flare + 0.02
        y = 0.35 + v * (wt + 0.2 - 0.35)
        return (x, y, z)
    grid('Curtain_' + side, 30, 12, curtain, (0, 0, 0), 'Curtain', solidify=0.006, subsurf=1)

# ───────────────────────────── escritorio (F14: más angosto) ─────────────────────────────
DX, DZ, DW, DD, DH = 0.35, -2.62, 1.6, 0.75, 0.76
box('Desk_Top', (DW, 0.04, DD), (DX, DH - 0.02, DZ), 'Oak', bevel=0.01)
dg = group('Desk_Drawers', (DX - DW / 2 + 0.23, 0, DZ + 0.01))
box('Drawers_Body', (0.42, 0.7, 0.66), (0, 0.35, 0), 'WhitePaint', parent=dg, bevel=0.008)
for i in range(3):
    box(f'Drawer_{i}', (0.38, 0.2, 0.012), (0, 0.13 + i * 0.22, 0.333), 'WhitePaint', parent=dg, bevel=0.004)
    box(f'Drawer_{i}_H', (0.12, 0.014, 0.02), (0, 0.19 + i * 0.22, 0.345), 'Metal', parent=dg, bevel=0.006)
lx = DX + DW / 2 - 0.05
for z in (DZ - DD / 2 + 0.06, DZ + DD / 2 - 0.06):
    box('DeskLeg', (0.04, DH - 0.04, 0.04), (lx, (DH - 0.04) / 2, z), 'BlackMetal', bevel=0.006)
box('DeskLeg_Bar', (0.03, 0.03, DD - 0.12), (lx, 0.12, DZ), 'BlackMetal', bevel=0.006)
box('DeskMat', (0.95, 0.004, 0.36), (DX + 0.02, DH + 0.002, DZ + 0.18), 'C_2c3038_0.95', bevel=0.002)

# monitor
mg = group('Monitor', (DX - 0.05, DH, DZ - 0.2))
box('Monitor_Base', (0.28, 0.014, 0.19), (0, 0.007, 0), 'BlackMetal', parent=mg, bevel=0.006)
box('Monitor_Arm', (0.05, 0.32, 0.03), (0, 0.17, -0.05), 'BlackMetal', parent=mg, bevel=0.01)
box('Monitor_Body', (0.99, 0.62, 0.035), (0, 0.42, 0), 'Plastic', parent=mg, bevel=0.01)
box('Monitor_Back', (0.5, 0.3, 0.05), (0, 0.42, -0.03), 'Plastic', parent=mg, bevel=0.02)
image_plane('SCREEN_Monitor', 0.95, 0.575, (0, 0.428, 0.0182), parent=mg)

# teclado + mouse
kg = group('Keyboard', (DX - 0.1, DH + 0.012, DZ + 0.2))
box('Keyboard_Base', (0.46, 0.02, 0.15), (0, 0, 0), 'Plastic', parent=kg, bevel=0.006)
for r in range(5):
    for c in range(14 if r < 4 else 3):
        if r == 4:
            box(f'Key_{r}_{c}', (0.07 if c != 1 else 0.2, 0.01, 0.022), (-0.12 + c * 0.12, 0.013, -0.056 + r * 0.028), 'C_3b4150', parent=kg, bevel=0.003)
        else:
            box(f'Key_{r}_{c}', (0.026, 0.01, 0.022), (-0.195 + c * 0.03, 0.013, -0.056 + r * 0.028), 'C_3b4150', parent=kg, bevel=0.003)
image_plane('RGB_Kb', 0.48, 0.16, (0, -0.0105, 0), rot=(math.radians(90), 0, 0), parent=kg)
sphere('Mouse', 1, (DX + 0.3, DH + 0.018, DZ + 0.22), 'Plastic', scale=(0.034, 0.018, 0.058))

# torre
tg = group('Tower', (DX + 0.52, 0, DZ + 0.02))
box('Tower_Case', (0.22, 0.48, 0.46), (0, 0.25, 0), 'Plastic', parent=tg, bevel=0.012)
box('Tower_Feet', (0.2, 0.012, 0.42), (0, 0.006, 0), 'Rubber', parent=tg, bevel=0.004)
glass_t = image_plane('GLASS_Tower', 0.38, 0.38, (0.111, 0.27, 0), rot=(0, math.radians(90), 0), parent=tg)
for i in range(3):
    lathe(f'RGB_Fan_{i}', [(0.043, -0.004), (0.05, 0.0), (0.043, 0.004)], (0, 0.12 + i * 0.13, 0.232), 'C_111111', parent=tg, rot=(math.radians(90), 0, 0), seg=28, cap_bottom=False)
image_plane('RGB_Strip', 0.012, 0.36, (0.112, 0.27, 0.17), rot=(0, math.radians(90), 0), parent=tg)

# celular en soporte (F22)
pg = group('Phone', (DX + 0.55, DH, DZ + 0.2), (0, -0.4, 0))
box('Phone_Stand', (0.09, 0.012, 0.08), (0, 0.006, 0), 'PlasticWhite', parent=pg, bevel=0.004)
box('Phone_StandBack', (0.09, 0.09, 0.01), (0, 0.05, -0.02), 'PlasticWhite', rot=(-0.35, 0, 0), parent=pg, bevel=0.003)
pb = group('Phone_Body', (0, 0.088, -0.006), (-0.35, 0, 0), parent=pg)
box('Phone_Case', (0.078, 0.16, 0.009), (0, 0, 0), 'Plastic', parent=pb, bevel=0.004)
image_plane('SCREEN_Phone', 0.07, 0.148, (0, 0, 0.0052), parent=pb)

# lámpara (alterna día/noche)
lg = group('Lamp', (DX + 0.66, DH, DZ - 0.22))
cyl('Lamp_Base', 0.08, 0.09, 0.025, (0, 0.0125, 0), 'BlackMetal', parent=lg)
tube('Lamp_Arm', [(0, 0.02, 0), (0.02, 0.25, 0.0), (-0.08, 0.45, 0.04), (-0.2, 0.5, 0.08)], 0.011, 'BlackMetal', parent=lg)
lh = group('Lamp_Head', (-0.22, 0.5, 0.09), (0.5, 0, 0.7), parent=lg)
lathe('Lamp_Shade', [(0.09, -0.07), (0.07, -0.02), (0.035, 0.05), (0.02, 0.07)], (0, 0, 0), 'C_e0a43a_0.5', parent=lh, cap_bottom=False, cap_top=True)
sphere('BULB_Lamp', 0.032, (0, -0.045, 0), 'C_fff4d6', parent=lh)

# mate y termo (F14)
mg2 = group('Mate', (DX - 0.62, DH, DZ + 0.18))
lathe('Mate_Gourd', [(0.0, 0.0), (0.03, 0.004), (0.045, 0.025), (0.048, 0.05), (0.04, 0.075), (0.033, 0.09), (0.035, 0.1)], (0, 0, 0), 'Gourd', parent=mg2, cap_bottom=False)
cyl('Mate_Yerba', 0.032, 0.032, 0.004, (0, 0.095, 0), 'Yerba', parent=mg2)
tube('Mate_Bombilla', [(0.005, 0.03, 0), (0.012, 0.12, 0.01), (0.03, 0.16, 0.02)], 0.004, 'Metal', parent=mg2)
tg2 = group('Termo', (DX - 0.5, DH, DZ - 0.15))
cyl('Termo_Body', 0.045, 0.045, 0.3, (0, 0.15, 0), 'Termo', parent=tg2, bevel=0.004)
cyl('Termo_Cap', 0.038, 0.042, 0.06, (0, 0.33, 0), 'C_1e1e1e', parent=tg2, bevel=0.004)
tube('Termo_Handle', [(0.045, 0.27, 0), (0.08, 0.24, 0), (0.08, 0.14, 0), (0.045, 0.11, 0)], 0.01, 'C_1e1e1e', parent=tg2)

# auriculares sobre el escritorio
hg = group('Headphones', (DX + 0.33, DH + 0.03, DZ - 0.12), (math.radians(90), 0, 0.4))
band = [(math.cos(a) * 0.09, math.sin(a) * 0.09, 0) for a in [math.pi * k / 16 for k in range(17)]]
tube('Headphones_Band', band, 0.009, 'Plastic', parent=hg, seg=10)
for s in (-1, 1):
    cyl(f'Headphones_Cup_{s}', 0.042, 0.042, 0.035, (s * 0.09, -0.01, 0), 'Plastic', rot=(0, 0, math.radians(90)), parent=hg, bevel=0.008)
    cyl(f'Headphones_Pad_{s}', 0.038, 0.038, 0.02, (s * 0.07, -0.01, 0), 'Leather', rot=(0, 0, math.radians(90)), parent=hg, bevel=0.006)

# portarretrato con foto
fg = group('PhotoFrame', (DX - 0.68, DH, DZ - 0.24), (0, 0.35, 0))
box('PhotoFrame_Body', (0.2, 0.185, 0.015), (0, 0.093, 0), 'Walnut', rot=(-0.12, 0, 0), parent=fg, bevel=0.004)
image_plane('IMG_Photo', 0.165, 0.151, (0, 0.095, 0.0085), rot=(-0.12, 0, 0), parent=fg)

# cables
tube('Cable_Monitor', [(DX - 0.05, DH + 0.3, DZ - 0.26), (DX - 0.05, DH + 0.05, DZ - 0.33), (DX + 0.1, DH - 0.05, DZ - 0.36), (DX + 0.4, 0.3, -2.97), (DX + 0.5, 0.02, -2.97)], 0.006, 'Rubber')
tube('Cable_Tower', bezier((DX + 0.52, 0.2, DZ - 0.21), (DX + 0.6, 0.02, -2.95), (1.1, 0.02, -2.98)), 0.007, 'Rubber')

# ───────────────────────────── silla gamer (se mueve en la web) ─────────────────────────────
cg = group('Chair', (DX - 0.05, 0, DZ + 0.92), (0, 0.25, 0))
for i in range(5):
    a = i / 5 * 2 * math.pi
    leg = group(f'Chair_LegG{i}', (0, 0, 0), (0, a, 0), parent=cg)
    box(f'Chair_Leg{i}', (0.04, 0.035, 0.3), (0, 0.07, 0.15), 'BlackMetal', parent=leg, bevel=0.01)
    sphere(f'Chair_Wheel{i}', 0.03, (0, 0.03, 0.29), 'Plastic', parent=leg)
cyl('Chair_Gas', 0.03, 0.03, 0.34, (0, 0.25, 0), 'Metal', parent=cg)
box('Chair_Seat', (0.54, 0.1, 0.52), (0, 0.47, 0), 'Leather', parent=cg, bevel=0.035)
for s in (-1, 1):
    box(f'Chair_SeatWing{s}', (0.06, 0.12, 0.5), (s * 0.26, 0.53, 0), 'LeatherAccent', parent=cg, bevel=0.025)
    box(f'Chair_ArmPost{s}', (0.04, 0.2, 0.04), (s * 0.3, 0.6, 0.02), 'Plastic', parent=cg, bevel=0.008)
    box(f'Chair_ArmPad{s}', (0.08, 0.03, 0.26), (s * 0.3, 0.71, 0.02), 'Rubber', parent=cg, bevel=0.012)
bk = group('Chair_Back', (0, 0.95, 0.25), (0.12, 0, 0), parent=cg)
box('Chair_BackMain', (0.52, 0.8, 0.1), (0, 0, 0), 'Leather', parent=bk, bevel=0.04)
box('Chair_BackStripe', (0.16, 0.74, 0.02), (0, 0, 0.05), 'LeatherAccent', parent=bk, bevel=0.008)
for s in (-1, 1):
    box(f'Chair_BackWing{s}', (0.08, 0.6, 0.12), (s * 0.27, -0.05, -0.02), 'Leather', parent=bk, bevel=0.03)
box('Chair_Pillow', (0.3, 0.12, 0.08), (0, 0.3, -0.08), 'C_2c3038', parent=bk, subsurf=2)


def jacket(u, v):
    # campera colgada del respaldo: cae por detrás (+z local del respaldo)
    x = (u - 0.5) * 0.46
    t = v * 0.62
    y = 0.42 - max(0, t - 0.1) * 0.9 + 0.015 * math.sin(u * 9)
    z = -0.06 + min(t, 0.1) * 1.2 + 0.025 * math.sin(u * 13 + v * 4) + max(0, t - 0.1) * 0.1
    return (x, y, z)


grid('Chair_Jacket', 16, 12, jacket, (0, 0, 0), 'Jacket', parent=bk, solidify=0.012, subsurf=1)
NO_BAKE.update(o.name for o in cg.children_recursive)

# ───────────────────────────── impresora contra la pared (F14) ─────────────────────────────
PX, PZ = 1.59, -2.77
pc = group('PrinterCabinet', (PX, 0, PZ))
box('PrinterCab_Body', (0.74, 0.59, 0.45), (0, 0.295, 0), 'WhitePaint', parent=pc, bevel=0.01)
box('PrinterCab_Top', (0.78, 0.03, 0.48), (0, 0.605, 0.01), 'Oak', parent=pc, bevel=0.008)
for i in range(2):
    box(f'PrinterCab_Door{i}', (0.35, 0.5, 0.012), (-0.18 + i * 0.36, 0.3, 0.226), 'WhitePaint', parent=pc, bevel=0.004)
    box(f'PrinterCab_Knob{i}', (0.014, 0.1, 0.02), (-0.03 + i * 0.06, 0.36, 0.24), 'Walnut', parent=pc, bevel=0.006)
pr = group('Printer', (PX + 0.02, 0.62, PZ + 0.02))
box('Printer_Body', (0.46, 0.18, 0.34), (0, 0.09, 0), 'PlasticWhite', parent=pr, bevel=0.025)
box('Printer_Top', (0.44, 0.03, 0.3), (0, 0.195, -0.01), 'C_2c3038', parent=pr, bevel=0.012)
box('Printer_Tray', (0.3, 0.16, 0.02), (0, 0.24, -0.15), 'C_2c3038', rot=(-0.35, 0, 0), parent=pr, bevel=0.006)
box('Printer_Sheets', (0.26, 0.14, 0.006), (0, 0.25, -0.13), 'Paper', rot=(-0.35, 0, 0), parent=pr, bevel=0.002)
box('Printer_Slot', (0.32, 0.015, 0.02), (0, 0.07, 0.166), 'Plastic', parent=pr, bevel=0.004)
box('Printer_Panel', (0.1, 0.035, 0.01), (0.14, 0.15, 0.171), 'C_6b7280', parent=pr, bevel=0.003)
image_plane('LED_Printer', 0.016, 0.016, (0.19, 0.15, 0.1765), parent=pr)
paper = image_plane('PAPER_CV', 0.26, 0.36, (0, 0.072, -0.03), rot=(-math.pi / 2 + 0.06, 0, 0), parent=pr)

# ───────────────────────────── diplomas, estante, reloj ─────────────────────────────
DIP_W = 0.74
for i, dip in enumerate(('tudai', 'duia')):
    framed_image(f'Diploma_{dip}', f'IMG_Diploma_{dip}', DIP_W, DIP_W / 1.414, (DX - 0.45 + i * 0.9, 2.3, -3 + 0.02), (0, 0, (i - 0.5) * 0.02), frame_mat='Walnut', depth=0.035)

SX, SZ, SW, SD, SH = 2.47, -2.8, 0.9, 0.38, 2.0
sg = group('Bookshelf', (SX, 0, SZ))
t = 0.03
box('Shelf_SideL', (t, SH, SD), (-SW / 2 + t / 2, SH / 2, 0), 'WhitePaint', parent=sg, bevel=0.004)
box('Shelf_SideR', (t, SH, SD), (SW / 2 - t / 2, SH / 2, 0), 'WhitePaint', parent=sg, bevel=0.004)
box('Shelf_Top', (SW, t, SD), (0, SH - t / 2, 0), 'WhitePaint', parent=sg, bevel=0.004)
box('Shelf_Back', (SW, SH, 0.01), (0, SH / 2, -SD / 2 + 0.005), 'Oak', parent=sg, bevel=0.002)
SHELVES = (0.06, 0.52, 0.98, 1.44)
for i, y in enumerate(SHELVES):
    box(f'Shelf_{i}', (SW - 2 * t, t, SD - 0.01), (0, y, 0.005), 'WhitePaint', parent=sg, bevel=0.004)
    if i > 0:
        image_plane(f'LED_Shelf_{i}', SW - 2 * t - 0.04, 0.01, (0, y - t / 2 - 0.006, SD / 2 - 0.004), parent=sg)


def books(prefix, x0, y0, n, parent, seed):
    rnd = random.Random(seed)
    cols = ['e9c46a', '2a9d8f', '264653', 'e76f51', '6d597a', '577590', 'f4a261', 'c8553d', '3d5a80', 'ffffff']
    x = x0
    for k in range(n):
        w = rnd.uniform(0.035, 0.06)
        h = rnd.uniform(0.24, 0.33)
        tilt = 0.22 if k == n - 1 else 0
        box(f'{prefix}{k}', (w, h, rnd.uniform(0.2, 0.26)), (x + w / 2, y0 + h / 2 + (0.02 if tilt else 0), 0.02), 'C_' + cols[(k + seed) % len(cols)] + '_0.6', rot=(0, 0, tilt), parent=parent, bevel=0.004)
        x += w + 0.004


# estante 0 (abajo): planta y caja (antes estaban arriba)
pl0 = group('Shelf_Plant', (-0.24, SHELVES[0] + t / 2, 0.03), parent=sg)
lathe('ShelfPlant_Pot', [(0.0, 0.0), (0.055, 0.0), (0.07, 0.13), (0.072, 0.14)], (0, 0, 0), 'Terracotta', parent=pl0)
cyl('ShelfPlant_Soil', 0.066, 0.066, 0.01, (0, 0.13, 0), 'Soil', parent=pl0)
for k in range(9):
    leaf(f'ShelfPlant_Leaf{k}', 0.16, 0.05, (0, 0.13, 0), (math.radians(-55 + (k % 3) * 12), k * 2.3, 0), 'Plant' if k % 2 else 'PlantDark', parent=pl0)
box('Shelf_Box', (0.3, 0.22, 0.26), (0.18, SHELVES[0] + t / 2 + 0.11, 0.02), 'Oak', parent=sg, bevel=0.01)
# estante 1: libros (antes abajo) + caja azul
books('Book_A', -0.4, SHELVES[1] + t / 2, 8, sg, 3)
box('Shelf_Bin', (0.26, 0.2, 0.26), (0.26, SHELVES[1] + t / 2 + 0.1, 0.02), 'Denim', parent=sg, bevel=0.012)
# estante 2: trofeo + libros apilados
tro = group('Trophy', (-0.2, SHELVES[2] + t / 2, 0.03), parent=sg)
box('Trophy_Base', (0.12, 0.05, 0.12), (0, 0.025, 0), 'C_1e1e1e', parent=tro, bevel=0.006)
lathe('Trophy_Cup', [(0.015, 0.05), (0.02, 0.1), (0.03, 0.12), (0.07, 0.2), (0.075, 0.23)], (0, 0, 0), 'Gold', parent=tro, cap_bottom=False)
for s in (-1, 1):
    tube(f'Trophy_Handle{s}', [(s * 0.065, 0.21, 0), (s * 0.1, 0.19, 0), (s * 0.09, 0.15, 0), (s * 0.045, 0.14, 0)], 0.007, 'Gold', parent=tro)
for k in range(3):
    box(f'Shelf_Stack{k}', (0.3 - k * 0.03, 0.045, 0.22), (0.2, SHELVES[2] + t / 2 + 0.0225 + k * 0.046, 0.02), 'C_' + ['c8674a', '3d5a80', 'e0a43a'][k] + '_0.6', rot=(0, k * 0.12, 0), parent=sg, bevel=0.005)
# estante 3 (el más alto): certificados (pedido de Juani)
CERT_AR = (512 / 332, 512 / 363, 512 / 365)
for k, ar in enumerate(CERT_AR):
    cw = 0.25
    ch = cw / ar
    framed_image(f'Cert_{k}', f'IMG_Cert_{k}', cw, ch, (-0.28 + k * 0.28, SHELVES[3] + t / 2 + ch / 2 + 0.02, 0.02), (-0.08, (1 - k) * 0.08, 0), frame_mat='C_1e1e1e_0.4', depth=0.02, border=0.015, parent=sg)
# arriba: globo terráqueo
gl = group('Globe', (0.15, SH, 0), parent=sg)
cyl('Globe_Base', 0.06, 0.07, 0.02, (0, 0.01, 0), 'Walnut', parent=gl)
tube('Globe_Ring', [(math.cos(a) * 0.135, 0.16 + math.sin(a) * 0.135, 0) for a in [math.pi * (k / 12 - 0.5) for k in range(13)]], 0.006, 'Gold', parent=gl)
sphere('Globe_Ball', 0.12, (0, 0.16, 0), 'C_4a90c2_0.5', parent=gl)

cg2 = group('Clock', (SX, 2.62, -2.98))
cyl('Clock_Body', 0.2, 0.2, 0.035, (0, 0, 0), 'Plastic', rot=(math.radians(90), 0, 0), parent=cg2, bevel=0.01)
image_plane('IMG_ClockFace', 0.36, 0.36, (0, 0, 0.0185), parent=cg2)

# ───────────────────────────── pared izquierda ─────────────────────────────
RY = (0, math.radians(90), 0)  # mirando hacia +x
framed_image('Poster', 'IMG_Poster', 0.48, 0.672, (-2.985, 1.95, -2.45), RY, frame_mat='C_1e1e1e_0.4', depth=0.02, border=0.02)

TZ = -1.3
st = group('TVStand', (-2.76, 0, TZ))
box('TVStand_Body', (0.44, 0.38, 1.5), (0, 0.23, 0), 'Walnut', parent=st, bevel=0.012)
for k in (-1, 0, 1):
    box(f'TVStand_Door{k}', (0.012, 0.32, 0.47), (0.226, 0.23, k * 0.5), 'Oak', parent=st, bevel=0.004)
for s in (-1, 1):
    for q in (-1, 1):
        box(f'TVStand_Leg{s}{q}', (0.03, 0.04, 0.03), (q * 0.17, 0.02, s * 0.68), 'BlackMetal', parent=st, bevel=0.006)
con = group('Console', (0.03, 0.42, -0.4), parent=st)
box('Console_Body', (0.26, 0.07, 0.32), (0, 0.035, 0), 'PlasticWhite', parent=con, bevel=0.02)
box('Console_Mid', (0.27, 0.02, 0.33), (0, 0.035, 0), 'Plastic', parent=con, bevel=0.006)
image_plane('LED_Console', 0.012, 0.012, (0.1361, 0.05, 0.1), rot=RY, parent=con)
box('Speaker', (0.16, 0.26, 0.16), (0, 0.55, 0.58), 'Plastic', parent=st, bevel=0.02)
cyl('Speaker_Cone', 0.05, 0.05, 0.01, (0.081, 0.58, 0.58), 'C_333333', rot=(0, 0, math.radians(90)), parent=st)
# joystick
jg = group('Gamepad', (0.05, 0.44, 0.2), (0, -0.6, 0), parent=st)
box('Gamepad_Body', (0.16, 0.04, 0.09), (0, 0, 0), 'Plastic', parent=jg, bevel=0.018)
for s in (-1, 1):
    sphere(f'Gamepad_Grip{s}', 0.03, (s * 0.065, -0.006, 0.03), 'Plastic', scale=(1, 1, 1.6), parent=jg)
# control remoto (F19)
rm = group('Remote', (0.12, 0.425, 0.45), (0, 0.3, 0), parent=st)
box('Remote_Body', (0.05, 0.02, 0.17), (0, 0, 0), 'Plastic', parent=rm, bevel=0.008)
for k in range(6):
    cyl(f'Remote_Btn{k}', 0.006, 0.006, 0.006, (-0.012 + (k % 2) * 0.024, 0.011, -0.05 + (k // 2) * 0.03), 'C_e63946' if k == 0 else 'C_6b7280', parent=rm, seg=12)

tv = group('TV', (-2.96, 1.32, TZ), RY)
box('TV_Body', (1.12, 0.66, 0.045), (0, 0, 0), 'Plastic', parent=tv, bevel=0.01)
box('TV_Mount', (0.3, 0.2, 0.04), (0, 0, -0.04), 'BlackMetal', parent=tv, bevel=0.006)
image_plane('SCREEN_TV', 1.08, 0.61, (0, 0, 0.0232), parent=tv)

# camiseta enmarcada (Sobre mí)
jz = -0.05
jf = group('Jersey', (-2.965, 1.8, jz), RY)
box('Jersey_Frame', (0.78, 0.8, 0.06), (0, 0, 0), 'C_1e1e1e_0.4', parent=jf, bevel=0.008)
box('Jersey_Backing', (0.7, 0.72, 0.01), (0, 0, 0.026), 'C_e7e2d8', parent=jf, bevel=0.002)
outline = [(-0.07, 0.25), (0, 0.215), (0.07, 0.25), (0.17, 0.22), (0.3, 0.1), (0.24, 0.02), (0.17, 0.07), (0.17, -0.28),
           (-0.17, -0.28), (-0.17, 0.07), (-0.24, 0.02), (-0.3, 0.1), (-0.17, 0.22)]
bm = bmesh.new()
face = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in outline])
ext = bmesh.ops.extrude_face_region(bm, geom=[face])
bmesh.ops.translate(bm, verts=[e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)], vec=(0, 0, 0.025))
bmesh.ops.triangulate(bm, faces=bm.faces)
jer = _finish('Jersey_Shirt', bm, 'Jersey', jf, (0, 0, 0.035), (0, 0, 0), bevel=0.006)
image_plane('IMG_JerseyBack', 0.3, 0.3, (0, -0.03, 0.0612), parent=jf)

# corcho (Skills)
framed_image('Corkboard', 'IMG_Corkboard', 1.3, 1.3 / 1.4, (-2.975, 1.68, 1.75), RY, frame_mat='Oak', depth=0.035, border=0.035)

# cama invertida: cabecera hacia el frente (F14)
BX, BZ0, BL = -2.3, 0.75, 2.0
bed = group('Bed', (BX, 0, 0))
box('Bed_Frame', (1.4, 0.28, BL), (0, 0.16, BZ0 + BL / 2), 'Walnut', parent=bed, bevel=0.015)
for s in (-1, 1):
    for q in (-1, 1):
        box(f'Bed_Leg{s}{q}', (0.06, 0.04, 0.06), (s * 0.62, 0.02, BZ0 + BL / 2 + q * 0.92), 'Walnut', parent=bed, bevel=0.01)
box('Bed_Mattress', (1.34, 0.18, BL - 0.06), (0, 0.39, BZ0 + BL / 2 - 0.02), 'Linen', parent=bed, bevel=0.05)
box('Bed_Headboard', (1.42, 0.82, 0.08), (0, 0.45, BZ0 + BL + 0.03), 'Walnut', parent=bed, bevel=0.02)
box('Bed_HeadPanel', (1.3, 0.46, 0.03), (0, 0.6, BZ0 + BL - 0.005), 'Oak', parent=bed, bevel=0.012)
for s, dx in ((-1, -0.3), (1, 0.32)):
    box(f'Bed_Pillow{s}', (0.56, 0.12, 0.36), (dx, 0.54, BZ0 + BL - 0.27), 'Linen', rot=(-0.28, 0.04 * s, 0), parent=bed, subsurf=2)
box('Bed_Cushion', (0.32, 0.27, 0.11), (0.1, 0.6, BZ0 + BL - 0.45), 'Velvet', rot=(0.25, 0.3, 0), parent=bed, subsurf=2)


def blanket(u, v):
    # u cruza el ancho (desde la pared hacia la habitación), v va desde la almohada hacia los pies
    W, Hh, L, Hf = 1.34, 0.3, 1.25, 0.3
    s = u * (W + Hh)
    tt = v * (L + Hf)
    ax, hx = min(s, W), max(0.0, s - W)
    az, hz = min(tt, L), max(0.0, tt - L)

    def sm(x):
        x = max(0.0, min(1.0, x))
        return x * x * (3 - 2 * x)
    # pliegues suaves solo en las partes que cuelgan + ondulación leve arriba
    x = -0.68 + ax + 0.03 * sm(hx / 0.08) + 0.01 * math.sin(tt * 7) * sm(hx / 0.25)
    z = BZ0 + 1.3 - az - 0.03 * sm(hz / 0.08) + 0.01 * math.sin(s * 7) * sm(hz / 0.25)
    y = 0.495 - max(hx, hz) - 0.35 * min(hx, hz) + 0.01 * math.sin(s * 6 + tt * 4) * (1 - sm((hx + hz) / 0.05))
    return (x, y, z)


grid('Bed_Blanket', 34, 32, blanket, (0, 0, 0), 'Blanket', parent=bed, solidify=0.014, subsurf=1)
box('Bed_SheetFold', (1.38, 0.035, 0.16), (0, 0.5, BZ0 + 1.33), 'Linen', parent=bed, bevel=0.015)

# guirnalda de luces sobre la cama (se prenden de noche)
fairy = [(-2.95, 2.55 - 0.18 * math.sin(math.pi * k / 24) ** 0.7 - 0.05 * math.sin(math.pi * k / 6) ** 2, 0.55 + 2.3 * k / 24) for k in range(25)]
tube('Fairy_Wire', fairy, 0.003, 'C_222222', seg=6)
for k, p in enumerate(fairy[1:-1:2]):
    sphere(f'LED_Fairy_{k}', 0.018, (p[0] + 0.01, p[1] - 0.025, p[2]), 'C_fff1c9', scale=(1, 1.3, 1))

# botines y medias (F14)
for k, (bx, bz, ry) in enumerate(((-1.95, 0.42, 0.3), (-1.78, 0.5, 0.75))):
    sh = group(f'Boot_{k}', (bx, 0, bz), (0, ry, 0))
    box(f'Boot_{k}_Upper', (0.1, 0.08, 0.27), (0, 0.055, 0), 'C_1d1f24_0.4', parent=sh, subsurf=2)
    box(f'Boot_{k}_Sole', (0.095, 0.014, 0.27), (0, 0.017, 0), 'C_f3efe8_0.6', parent=sh, bevel=0.006)
    box(f'Boot_{k}_Stripe', (0.102, 0.02, 0.08), (0, 0.06, 0.02), 'C_00d2ff_0.5', parent=sh, subsurf=1)
    for q in range(6):
        cyl(f'Boot_{k}_Stud{q}', 0.009, 0.007, 0.012, ((q % 2 - 0.5) * 0.05, 0.004, -0.1 + (q // 2) * 0.09), 'C_cccccc_0.4', parent=sh, seg=10)
for k, (sx, sz) in enumerate(((-1.42, 1.85), (-1.33, 1.98))):
    sphere(f'Sock_{k}', 0.05, (sx, 0.035, sz), 'C_f1efe9_0.95', scale=(1.6, 0.6, 0.9), rot=(0, k * 0.8, 0))

# figurita del Mundial escondida (F21)
fig = group('Figurita', (-1.58, 0.003, 2.42), (0, 0.5, 0))
image_plane('IMG_Figurita', 0.055, 0.075, (0, 0, 0), rot=(-math.pi / 2, 0, 0), parent=fig)

# rincón: puff, plantas, cesto, mochila
lathe('Puff', [(0.0, 0.0), (0.3, 0.005), (0.38, 0.08), (0.36, 0.2), (0.3, 0.28), (0.18, 0.33), (0.0, 0.345)], (-1.75, 0, -1.0), 'Velvet', seg=40)

tp = group('TallPlant', (-2.62, 0, -2.6))
lathe('TallPlant_Pot', [(0.0, 0.0), (0.15, 0.0), (0.2, 0.36), (0.205, 0.42)], (0, 0, 0), 'Ceramic', parent=tp)
cyl('TallPlant_Soil', 0.19, 0.19, 0.01, (0, 0.405, 0), 'Soil', parent=tp)
for k in range(12):
    h = 0.55 + (k % 5) * 0.17
    stem = bezier((0, 0.4, 0), (math.cos(k * 2.4) * 0.05, 0.4 + h * 0.6, math.sin(k * 2.4) * 0.05), (math.cos(k * 2.4) * 0.22, 0.4 + h, math.sin(k * 2.4) * 0.22), 8)
    tube(f'TallPlant_Stem{k}', stem, 0.008, 'PlantDark', parent=tp, seg=6)
    leaf(f'TallPlant_Leaf{k}', 0.34 + (k % 3) * 0.06, 0.13, stem[-1], (math.radians(-35), math.pi / 2 - k * 2.4, 0), 'Plant' if k % 2 else 'PlantDark', parent=tp, droop=0.35)

sp = group('SillPlant', (WIN['x'] + 0.5, wb + 0.005, -2.9))
lathe('SillPlant_Pot', [(0.0, 0.0), (0.04, 0.0), (0.05, 0.07), (0.052, 0.08)], (0, 0, 0), 'Terracotta', parent=sp)
cyl('SillPlant_Cactus', 0.03, 0.025, 0.12, (0, 0.13, 0), 'Plant', parent=sp)
sphere('SillPlant_Arm', 0.018, (0.035, 0.15, 0), 'Plant', scale=(1, 1.8, 1), parent=sp)

bk2 = group('Basket', (2.4, 0, -1.55))
lathe('Basket_Body', [(0.0, 0.0), (0.2, 0.0), (0.24, 0.42), (0.245, 0.45)], (0, 0, 0), 'Wicker', parent=bk2, seg=40)
lathe('Basket_Inner', [(0.0, 0.02), (0.185, 0.02), (0.225, 0.44)], (0, 0, 0), 'C_8a6a45', parent=bk2, seg=40)
tube('Basket_Rim', [(math.cos(a) * 0.245, 0.45, math.sin(a) * 0.245) for a in [2 * math.pi * k / 40 for k in range(41)]], 0.012, 'Wicker', parent=bk2)
box('Basket_Shirt', (0.3, 0.1, 0.22), (0.05, 0.43, 0.06), 'C_e63946_0.9', rot=(0.5, 0.6, 0.3), parent=bk2, subsurf=2)

bp = group('Backpack', (-0.82, 0, -2.5), (0, 0.4, 0))
box('Backpack_Body', (0.32, 0.42, 0.18), (0, 0.22, 0), 'Denim', rot=(-0.12, 0, 0), parent=bp, subsurf=2)
box('Backpack_Pocket', (0.24, 0.16, 0.06), (0, 0.13, 0.1), 'C_24324a_0.9', rot=(-0.12, 0, 0), parent=bp, subsurf=2)
tube('Backpack_Handle', [(-0.05, 0.42, 0), (0, 0.47, 0), (0.05, 0.42, 0)], 0.01, 'C_1d1f24', parent=bp)

# alfombra (el dibujo lo pone la web)
box('Rug_Base', (2.7, 0.012, 1.8), (0.35, 0.006, 0.55), 'Rug', bevel=0.004)
image_plane('IMG_Rug', 2.66, 1.76, (0.35, 0.0125, 0.55), rot=(-math.pi / 2, 0, 0))
NO_BAKE.discard('IMG_Rug')  # la alfombra sí recibe AO

# ───────────────────────────── luces de preview / bake ─────────────────────────────


def to_world(p):
    return ROOT.matrix_world @ Vector(p)


def add_preview_rig():
    world = bpy.data.worlds.new('W')
    SCN.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.82, 0.78, 0.72, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    sun = bpy.data.lights.new('Sun', 'SUN')
    sun.energy = 3.5
    sun.angle = math.radians(6)
    so = bpy.data.objects.new('Sun', sun)
    COL.objects.link(so)
    so.rotation_euler = (math.radians(50), 0, math.radians(135))
    cam = bpy.data.cameras.new('Cam')
    cam.lens_unit = 'FOV'
    cam.sensor_fit = 'VERTICAL'
    cam.angle = math.radians(30)
    co = bpy.data.objects.new('Cam', cam)
    COL.objects.link(co)
    co.location = to_world((7.4, 5.6, 8.4))
    d = to_world((-0.15, 1.0, -0.35)) - co.location
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    SCN.camera = co


bpy.context.view_layer.update()

if ARGS['preview']:
    add_preview_rig()
    SCN.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = dev.type == 'CUDA'
    SCN.cycles.device = 'GPU'
    SCN.cycles.samples = 48
    SCN.cycles.use_denoising = True
    SCN.render.resolution_x, SCN.render.resolution_y = 1280, 720
    SCN.render.filepath = os.path.abspath(ARGS['preview'])
    bpy.ops.render.render(write_still=True)
    print('PREVIEW', SCN.render.filepath)

# ───────────────────────────── horneado de AO ─────────────────────────────
if ARGS['bake']:
    meshes = [o for o in COL.objects if o.type == 'MESH']
    bake_objs = [o for o in meshes if o.name not in NO_BAKE and not o.name.startswith(('IMG_', 'SCREEN_', 'LED_', 'RGB_', 'BULB_', 'GLASS_', 'PAPER_'))]
    bake_objs.append(bpy.data.objects['IMG_Rug'])
    # lo que no se hornea tampoco proyecta AO (silla, vidrio)
    for o in meshes:
        if o not in bake_objs and (o.name in NO_BAKE or o.name.startswith('GLASS_')):
            o.hide_render = True
    # aplicar modificadores para que el AO coincida con la geometría exportada
    bpy.ops.object.select_all(action='DESELECT')
    for o in bake_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = bake_objs[0]
    bpy.ops.object.convert(target='MESH')
    # objetos con mallas compartidas no hay; agrego UV "AO" y empaqueto todo en un atlas
    for o in bake_objs:
        if 'AO' not in o.data.uv_layers:
            o.data.uv_layers.new(name='AO')
        o.data.uv_layers.active = o.data.uv_layers['AO']
    print('UV pack...', len(bake_objs), 'objetos', flush=True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    # proyección + empaquetado en C (lightmap_pack en Python es demasiado lento con tantas piezas)
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.002, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.average_islands_scale()
    bpy.ops.uv.pack_islands(udim_source='CLOSEST_UDIM', rotate=True, margin=0.0025)
    bpy.ops.object.mode_set(mode='OBJECT')
    SIZE = 2048
    img = bpy.data.images.new('room_ao', SIZE, SIZE, alpha=False, float_buffer=False)
    img.generated_color = (1, 1, 1, 1)
    for o in bake_objs:
        for slot in o.material_slots:
            nt = slot.material.node_tree
            node = nt.nodes.get('AO_BAKE') or nt.nodes.new('ShaderNodeTexImage')
            node.name = 'AO_BAKE'
            node.image = img
            nt.nodes.active = node
    SCN.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = dev.type == 'CUDA'
    SCN.cycles.device = 'GPU'
    SCN.cycles.samples = 96
    SCN.world = SCN.world or bpy.data.worlds.new('W')
    SCN.world.light_settings.distance = 0.55
    SCN.render.bake.margin = 6
    print('bake...', flush=True)
    bpy.ops.object.bake(type='AO', use_clear=True, margin=6)
    img.filepath_raw = os.path.join(OUT, 'room_ao.png')
    img.file_format = 'PNG'
    img.save()
    print('BAKED', img.filepath_raw)
    for o in meshes:
        o.hide_render = False
        o.data.uv_layers.active = o.data.uv_layers[0] if o.data.uv_layers else None
    for o in bake_objs:
        o.data.uv_layers['UVMap'].active_render = True

# ───────────────────────────── export ─────────────────────────────
if ARGS['export']:
    for o in COL.objects:
        o.select_set(o.type in ('MESH', 'EMPTY'))
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUT, 'room_raw.glb'),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        export_image_format='NONE',
        export_yup=True,
        export_extras=False,
    )
    print('EXPORTED', os.path.join(OUT, 'room_raw.glb'))
