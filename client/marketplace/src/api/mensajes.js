import { api } from './client'

const adaptarMensaje = (m) => ({
  ...m,
  hora: new Date(m.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
})

// El chat de una orden. Sin mensajes el backend responde 404: aca es una
// conversacion vacia.
export const getMensajes = async (idOrden) => {
  try {
    return (await api.get(`/ordenes/${idOrden}/mensajes`)).map(adaptarMensaje)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// Solo con la orden pagada (409 si no) y solo comprador o vendedor (403).
export const enviarMensaje = async (idOrden, texto) =>
  adaptarMensaje(await api.post(`/ordenes/${idOrden}/mensajes`, { texto }))
