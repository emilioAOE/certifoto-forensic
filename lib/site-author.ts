/**
 * Autor visible de los artículos y "founder" en el esquema de la organización.
 *
 * Google y los asistentes de IA confían más en contenido firmado por una
 * persona identificable que en "Equipo CertiFoto". Un solo lugar para cambiar
 * nombre, cargo, bio y perfiles (los perfiles se agregan cuando estén
 * confirmados; un sameAs roto resta más de lo que suma).
 */

export const SITE_AUTHOR = {
  name: "Emilio Pfeffer",
  jobTitle: "Fundador de CertiFoto",
  /** Página donde se presenta: hoy /sobre; cuando exista, /sobre/emilio. */
  path: "/sobre",
  bio: "Fundador de CertiFoto. Escribe sobre entrega de propiedades, arriendos y evidencia digital en Chile, a partir de los casos que ve en la plataforma.",
  /** Perfiles públicos confirmados (LinkedIn, Instagram…). */
  sameAs: [] as string[],
};
