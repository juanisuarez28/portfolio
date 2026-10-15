import { Ball, Corkboard, Jersey } from './AboutCorner'
import { Computer } from './Computer'
import { Bed, Poster, TallPlant, WallClock, Plant } from './Decor'
import { Desk } from './Desk'
import { Chair, DeskLamp, Phone } from './DeskItems'
import { Bookshelf, Diplomas } from './Education'
import { GamingCorner } from './GamingCorner'
import { Printer } from './Printer'

/** Todos los objetos de la habitación (ver specs/scene-layout.md) */
export function Furniture() {
  return (
    <group>
      {/* Escritorio → Proyectos / Contacto */}
      <Desk />
      <Computer />
      <Phone />
      <DeskLamp />
      <Chair />
      {/* Formación */}
      <Diplomas />
      <Bookshelf />
      {/* CV */}
      <Printer />
      {/* Sobre mí / Skills */}
      <Jersey />
      <Corkboard />
      <Ball />
      {/* Rincón gamer */}
      <GamingCorner />
      {/* Decoración */}
      <Bed />
      <TallPlant position={[-2.62, 0, -2.6]} />
      <Plant position={[-1.05, 1.17, -2.88]} scale={0.45} />
      <Poster position={[-2.985, 1.95, -2.45]} />
      <WallClock position={[2.45, 2.62, -2.98]} />
    </group>
  )
}
