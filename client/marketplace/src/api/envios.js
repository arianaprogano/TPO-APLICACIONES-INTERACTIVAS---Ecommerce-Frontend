// Recorrido de un envio (lo arma el backend cuando la orden se paga):
//   A domicilio:  PENDIENTE -> DESPACHADO (vendedor, se genera el numero)
//                 -> EN_TRANSITO (despachante carga el numero)
//                 -> ENTREGADO (ese mismo despachante)
//   A coordinar:  PENDIENTE -> ENTREGADO (lo confirma el comprador)
export const ESTADOS_ENVIO = {
  PENDIENTE: { texto: 'Preparando', color: '#f59e0b', icono: 'fa-box' },
  DESPACHADO: { texto: 'Despachado', color: '#3b82f6', icono: 'fa-box-open' },
  EN_TRANSITO: { texto: 'En camino', color: '#6366f1', icono: 'fa-truck-fast' },
  ENTREGADO: { texto: 'Entregado', color: '#16a34a', icono: 'fa-circle-check' },
}

export const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '')

export const adaptarEnvio = (e) => ({
  ...e,
  fechaCreacion: fecha(e.fechaCreacion),
  fechaDespacho: fecha(e.fechaDespacho),
  fechaEntrega: fecha(e.fechaEntrega),
})
