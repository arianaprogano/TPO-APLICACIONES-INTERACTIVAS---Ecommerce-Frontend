export const ESTADOS_OFERTA = {
  PENDIENTE: { texto: 'Esperando respuesta', color: '#f59e0b' },
  ACEPTADA: { texto: 'Aceptada', color: '#16a34a' },
  RECHAZADA: { texto: 'Rechazada', color: '#ef4444' },
  CANCELADA: { texto: 'Cancelada', color: '#6b7280' },
  VENCIDA: { texto: 'Vencida', color: '#9ca3af' },
}

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '')

export const adaptarOferta = (o) => ({
  ...o,
  precioDeLista: Number(o.precioDeLista),
  precioOfrecido: Number(o.precioOfrecido),
  total: Number(o.total),
  fechaCreacion: fecha(o.fechaCreacion),
  fechaVencimiento: fecha(o.fechaVencimiento),
})
