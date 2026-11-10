import { adaptarResumen } from './productos'

// Igual que el carrito: cada operacion devuelve la lista completa. Cada item
// queda con los datos del producto mas idItem, que es lo que pide el DELETE.
export const adaptarWishlist = (wishlist) =>
  wishlist.items.map((item) => ({
    ...adaptarResumen(item.producto),
    idItem: item.id,
  }))
