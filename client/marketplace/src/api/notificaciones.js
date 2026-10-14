import { api, listarPaginado } from './client'

const hace = (f) => {
  const minutos = Math.round((Date.now() - new Date(f).getTime()) / 60000)
  if (minutos < 1) return 'Recién'
  if (minutos < 60) return `Hace ${minutos} min`
  if (minutos < 1440) return `Hace ${Math.round(minutos / 60)} h`
  return new Date(f).toLocaleDateString('es-AR')
}

export const ICONOS_NOTIFICACION = {
  BAJA_DE_PRECIO: 'fa-tag',
  POCO_STOCK: 'fa-triangle-exclamation',
  DISPONIBLE_OTRA_VEZ: 'fa-box',
  OFERTA_RECIBIDA: 'fa-hand-holding-dollar',
  OFERTA_RESPONDIDA: 'fa-handshake',
  VENTA: 'fa-sack-dollar',
  ORDEN_ACTUALIZADA: 'fa-receipt',
  ENVIO_ACTUALIZADO: 'fa-truck-fast',
  OPINA_TU_COMPRA: 'fa-star',
  FOTO_VERIFICADA: 'fa-image',
  FOTO_PENDIENTE: 'fa-images',
  MENSAJE: 'fa-comments',
}

// El backend arma los links con sus propias rutas; aca se pasan a las del front.
const rutaFront = (link) => {
  if (!link) return null
  const producto = link.match(/^\/productos\/(\d+)/)
  if (producto) return `/product/${producto[1]}`
  const orden = link.match(/^\/ordenes\/(\d+)/)
  if (orden) return `/orden/${orden[1]}`
  if (link.startsWith('/ofertas')) return '/ofertas'
  if (link.startsWith('/ordenes') || link.startsWith('/opinar')) return '/mis-compras'
  if (link.startsWith('/ventas')) return '/vendedor?tab=ordenes'
  if (link.startsWith('/mis-publicaciones')) return '/vendedor?tab=publicaciones'
  if (link.startsWith('/fotos/pendientes')) return '/admin?tab=productos'
  return null
}

export const getNotificaciones = () =>
  listarPaginado('/notificaciones', (n) => ({ ...n, hace: hace(n.fecha), ruta: rutaFront(n.link) }), 30)

export const contarNoLeidas = async () => (await api.get('/notificaciones/no-leidas')).cantidad

export const marcarLeida = (id) => api.put(`/notificaciones/${id}/leida`)
