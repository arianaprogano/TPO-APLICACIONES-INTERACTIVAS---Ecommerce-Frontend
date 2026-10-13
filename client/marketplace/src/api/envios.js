import { api, listarPaginado } from './client'

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

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '')

const adaptarEnvio = (e) => ({
  ...e,
  fechaCreacion: fecha(e.fechaCreacion),
  fechaDespacho: fecha(e.fechaDespacho),
  fechaEntrega: fecha(e.fechaEntrega),
})

// Comprador o vendedor: los envios de sus compras y ventas.
// Despachante: los que cargo y todavia no entrego.
export const getMisEnvios = () => listarPaginado('/envios/mios', adaptarEnvio)

// Solo ADMIN: el sistema entero.
export const getTodosLosEnvios = () => listarPaginado('/envios/todos', adaptarEnvio)

// Solo DESPACHANTE: lo que ya entrego (numero y fecha, sin direcciones).
export const getHistorialEntregas = () =>
  listarPaginado('/envios/historial', (e) => ({ ...e, fechaEntrega: fecha(e.fechaEntrega) }))

// El despachante carga el numero de la etiqueta: con eso toma el envio.
export const recibirEnvio = async (numero) =>
  adaptarEnvio(await api.post(`/envios/recibir?numero=${encodeURIComponent(numero.trim())}`))

export const cambiarEstadoEnvio = async (idEnvio, estado) =>
  adaptarEnvio(await api.put(`/envios/${idEnvio}/estado?estado=${estado}`))
