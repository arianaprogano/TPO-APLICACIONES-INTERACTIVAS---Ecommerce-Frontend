// Visibilidad paga: la cobra el admin por afuera y la registra aca. Con
// NINGUNO se saca. Los destacados salen primero en el catalogo.
export const NIVELES_DESTACADO = {
  NINGUNO: 'Sin destacar',
  BASICO: 'Básico',
  DESTACADO: 'Destacado',
  PREMIUM: 'Premium',
}

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '')

export const adaptarDestacado = (d) => ({ ...d, desde: fecha(d.desde), hasta: fecha(d.hasta) })
