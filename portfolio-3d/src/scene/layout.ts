/**
 * Distribución de la habitación (espejo de las constantes de blender/build_room.py — F14).
 * Coordenadas de three.js: Y arriba, Z hacia la cámara, piso en y = 0, paredes en x = -3 y z = -3.
 */
export type Vec3 = [number, number, number]

export const ROOM = { size: 6, height: 3.4, wall: 0.2 }
export const WINDOW = { x: -1.55, y: 1.8, w: 1.4, h: 1.3, z: -3.1 }

export const DESK = { x: 0.35, z: -2.62, w: 1.6, d: 0.75, h: 0.76 }
/** posición base de la silla (rueda a un costado al enfocar la compu) */
export const CHAIR = { x: DESK.x - 0.05, z: DESK.z + 0.92, rot: 0.25 }
export const SCREEN = { w: 0.95, h: 0.575, px: 1280 }
/** centro de la pantalla del monitor (mundo) */
export const SCREEN_CENTER: Vec3 = [DESK.x - 0.05, DESK.h + 0.428, DESK.z - 0.2 + 0.018]
export const PHONE: Vec3 = [DESK.x + 0.55, DESK.h, DESK.z + 0.2]
export const PRINTER_CAB = { x: 1.59, z: -2.77, w: 0.78, d: 0.48, h: 0.62 }
export const SHELF = { x: 2.47, z: -2.8, w: 0.9, d: 0.38, h: 2.0 }
export const TV = { x: -2.96, y: 1.32, z: -1.3, w: 1.12, h: 0.66 }
export const TV_STAND = { x: -2.76, z: -1.3, w: 0.44, d: 1.5, h: 0.42 }
export const BED = { x: -2.3, z0: 0.75, len: 2.0, w: 1.4 }
export const PUFF: Vec3 = [-1.75, 0, -1.0]
export const BASKET = { x: 2.4, z: -1.55, r: 0.24, h: 0.45 }
export const RUG = { x: 0.35, z: 0.55, w: 2.7, d: 1.8 }
export const BALL_HOME: Vec3 = [0.75, 0.11, 0.75]
export const BALL_RADIUS = 0.11
export const MATE: Vec3 = [DESK.x - 0.62, DESK.h, DESK.z + 0.18]
export const CLOCK: Vec3 = [SHELF.x, 2.62, -2.98]
export const DIPLOMAS: Vec3 = [DESK.x, 2.3, -2.98]
export const JERSEY: Vec3 = [-2.965, 1.8, -0.05]
export const CORKBOARD: Vec3 = [-2.975, 1.68, 1.75]
export const PLANT: Vec3 = [-2.62, 0, -2.6]
/** objetos que se pueden voltear con la pelota (F17) */
export const KNOCKABLES_ORIGIN: Vec3 = [2.05, 0, 0.95]

/** Colisionadores estáticos aproximados: [centro, medio-tamaño] */
export const STATIC_COLLIDERS: { pos: Vec3; half: Vec3 }[] = [
  // cama (marco + colchón) y cabecera
  { pos: [BED.x, 0.25, BED.z0 + BED.len / 2], half: [0.7, 0.25, BED.len / 2] },
  { pos: [BED.x, 0.45, BED.z0 + BED.len + 0.03], half: [0.71, 0.45, 0.05] },
  // escritorio: tapa, cajonera, pata
  { pos: [DESK.x, DESK.h - 0.02, DESK.z], half: [DESK.w / 2, 0.02, DESK.d / 2] },
  { pos: [DESK.x - DESK.w / 2 + 0.23, 0.35, DESK.z], half: [0.21, 0.35, 0.34] },
  { pos: [DESK.x + DESK.w / 2 - 0.05, 0.36, DESK.z], half: [0.03, 0.36, 0.33] },
  { pos: [DESK.x + 0.52, 0.25, DESK.z + 0.02], half: [0.11, 0.25, 0.23] },
  // mueble impresora, estante, mueble tele
  { pos: [PRINTER_CAB.x, 0.4, PRINTER_CAB.z], half: [PRINTER_CAB.w / 2, 0.4, PRINTER_CAB.d / 2] },
  { pos: [SHELF.x, SHELF.h / 2, SHELF.z], half: [SHELF.w / 2, SHELF.h / 2, SHELF.d / 2] },
  { pos: [TV_STAND.x, 0.42, TV_STAND.z], half: [TV_STAND.w / 2, 0.42, TV_STAND.d / 2] },
  // planta, mochila
  { pos: [PLANT[0], 0.3, PLANT[2]], half: [0.2, 0.3, 0.2] },
  { pos: [-0.82, 0.2, -2.5], half: [0.18, 0.2, 0.12] },
]
