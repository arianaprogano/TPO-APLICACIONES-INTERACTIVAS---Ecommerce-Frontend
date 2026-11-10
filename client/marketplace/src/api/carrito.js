import { adaptarResumen } from './productos'

// Cada operacion del backend devuelve el carrito completo, asi que todas
// pasan por el mismo adaptador y el front siempre muestra lo que hay en la
// base. Cada item queda con los datos del producto (id = id del producto) mas
// idItem, que es lo que piden PUT y DELETE.
export const adaptarCarrito = (carrito) => ({
  items: carrito.items.map((item) => ({
    ...adaptarResumen(item.producto),
    idItem: item.id,
    qty: item.cantidad,
  })),
  total: Number(carrito.total),
})
