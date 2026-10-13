import { api, listarPaginado } from './client'

export const ESTADOS_OFERTA = {
  PENDIENTE: { texto: 'Esperando respuesta', color: '#f59e0b' },
  ACEPTADA: { texto: 'Aceptada', color: '#16a34a' },
  RECHAZADA: { texto: 'Rechazada', color: '#ef4444' },
  CANCELADA: { texto: 'Cancelada', color: '#6b7280' },
  VENCIDA: { texto: 'Vencida', color: '#9ca3af' },
}

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '')

const adaptarOferta = (o) => ({
  ...o,
  precioDeLista: Number(o.precioDeLista),
  precioOfrecido: Number(o.precioOfrecido),
  total: Number(o.total),
  fechaCreacion: fecha(o.fechaCreacion),
  fechaVencimiento: fecha(o.fechaVencimiento),
})

// Precio por unidad, menor al de lista. Si el producto se despacha hay que
// mandar la direccion: si el vendedor acepta, la orden sale con esa entrega.
export const crearOferta = async (datos) => adaptarOferta(await api.post('/ofertas', datos))

// Las que hice y las que me hicieron, juntas.
export const getMisOfertas = () => listarPaginado('/ofertas', adaptarOferta)

// Aceptar crea la orden al precio acordado.
export const aceptarOferta = async (id) => adaptarOferta(await api.put(`/ofertas/${id}/aceptar`))
export const rechazarOferta = async (id) => adaptarOferta(await api.put(`/ofertas/${id}/rechazar`))
export const cancelarOferta = async (id) => adaptarOferta(await api.put(`/ofertas/${id}/cancelar`))
