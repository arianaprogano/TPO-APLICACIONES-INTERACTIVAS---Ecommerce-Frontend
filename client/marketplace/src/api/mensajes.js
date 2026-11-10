export const adaptarMensaje = (m) => ({
  ...m,
  hora: new Date(m.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
})
