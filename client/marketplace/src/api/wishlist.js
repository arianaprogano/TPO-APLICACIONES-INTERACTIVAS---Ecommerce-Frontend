import { api } from './client'
import { adaptarResumen } from './productos'

// Igual que el carrito: cada operacion devuelve la lista completa. Cada item
// queda con los datos del producto mas idItem, que es lo que pide el DELETE.
const adaptarWishlist = (wishlist) =>
  wishlist.items.map((item) => ({
    ...adaptarResumen(item.producto),
    idItem: item.id,
  }))

export const getWishlist = async () => adaptarWishlist(await api.get('/wishlist'))

export const agregarAWishlist = async (idProducto) =>
  adaptarWishlist(await api.post('/wishlist/items', { idProducto }))

export const quitarDeWishlist = async (idItem) =>
  adaptarWishlist(await api.delete(`/wishlist/items/${idItem}`))

export const vaciarWishlist = async () => adaptarWishlist(await api.delete('/wishlist'))
