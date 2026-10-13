import { api, listarPaginado } from './client'
import { adaptarResena } from './productos'

// Solo el comprador de la orden, una vez por producto, y cuando el envio ya
// figura entregado. Si no se cumple, el backend responde con el motivo.
export const crearResena = ({ idOrden, idProducto, puntaje, comentario }) =>
  api.post('/resenas', { idOrden, idProducto, puntaje, comentario })

// Todas las de un producto, las mas nuevas primero. La ficha trae solo las
// ultimas; esto es para "ver todas".
export const getResenasDeProducto = (idProducto) =>
  listarPaginado(`/resenas/producto/${idProducto}`, adaptarResena)

// Promedio, cantidad y nivel (BRONCE, ORO, PLATINO) de un vendedor.
export const getCalificacionVendedor = (nombreUsuario) =>
  api.get(`/resenas/vendedor/${encodeURIComponent(nombreUsuario)}`)

export const NIVELES_VENDEDOR = {
  SIN_CALIFICAR: { texto: 'Sin calificar', color: '#9ca3af', icono: 'fa-user' },
  BRONCE: { texto: 'Vendedor Bronce', color: '#b45309', icono: 'fa-medal' },
  ORO: { texto: 'Vendedor Oro', color: '#ca8a04', icono: 'fa-medal' },
  PLATINO: { texto: 'Vendedor Platino', color: '#6366f1', icono: 'fa-gem' },
}
