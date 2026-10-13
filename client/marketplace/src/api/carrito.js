import { api } from './client'
import { adaptarResumen } from './productos'

// Cada operacion del backend devuelve el carrito completo, asi que todas
// pasan por el mismo adaptador y el front siempre muestra lo que hay en la
// base. Cada item queda con los datos del producto (id = id del producto) mas
// idItem, que es lo que piden PUT y DELETE.
const adaptarCarrito = (carrito) => ({
  items: carrito.items.map((item) => ({
    ...adaptarResumen(item.producto),
    idItem: item.id,
    qty: item.cantidad,
  })),
  total: Number(carrito.total),
})

export const getCarrito = async () => adaptarCarrito(await api.get('/carrito'))

export const agregarAlCarrito = async (idProducto, cantidad) =>
  adaptarCarrito(await api.post('/carrito/items', { idProducto, cantidad }))

export const cambiarCantidad = async (idItem, cantidad) =>
  adaptarCarrito(await api.put(`/carrito/items/${idItem}`, { cantidad }))

export const quitarDelCarrito = async (idItem) =>
  adaptarCarrito(await api.delete(`/carrito/items/${idItem}`))

export const vaciarCarrito = async () => adaptarCarrito(await api.delete('/carrito'))
