import { api, API_URL, listarPaginado } from './client'

// Las rutas de fotos llegan relativas ("/fotos/1/contenido"); el <img> necesita
// la URL completa del backend.
export const urlFoto = (ruta) => (ruta ? `${API_URL}${ruta}` : null)

const tieneDescuento = (p) => Number(p.descuento) > 0

// Vista reducida del catalogo (GET /productos) al formato de PostCard.
export const adaptarResumen = (p) => ({
  id: p.id,
  title: p.nombre,
  price: Number(p.precioFinal),
  precioOriginal: Number(p.precio),
  enOferta: tieneDescuento(p),
  porcentajeDescuento: p.descuento,
  condition: p.condicion === 'NUEVO' ? 'Nuevo' : 'Usado',
  anio: p.anio,
  provincia: p.provincia,
  location: p.ubicacion,
  image: urlFoto(p.foto),
  rating: p.calificacion,
  cantidadResenas: p.cantidadResenas,
  sales: p.vendidos,
  disponible: p.disponible,
  conEnvio: p.admiteEnvio,
  nivelVendedor: p.nivelVendedor,
  nivelDestacado: p.nivelDestacado,
})

export const adaptarResena = (r) => ({
  id: r.id,
  estrellas: r.puntaje,
  texto: r.comentario,
  autor: r.autor?.nombreUsuario ?? 'Anónimo',
  fecha: r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR') : '',
})

// Ficha completa (GET /productos/{id}).
export const adaptarDetalle = (p) => ({
  ...adaptarResumen({ ...p, foto: p.fotos?.[0]?.url }),
  body: p.descripcion,
  stock: p.stock,
  disponible: p.stock > 0,
  aceptaOfertas: p.aceptaOfertas,
  estadoPublicacion: p.estadoPublicacion,
  activo: p.activo,
  destacadoHasta: p.destacadoHasta ? new Date(p.destacadoHasta).toLocaleDateString('es-AR') : null,
  categoria: p.categoria,
  vendedor: p.vendedor,
  fotos: (p.fotos ?? []).map((f) => ({ ...f, url: urlFoto(f.url) })),
  reviews: (p.ultimasResenas ?? []).map(adaptarResena),
})

// filtros: { idCategoria, nombre, enOferta, admiteEnvio, condicion, provincia,
// precioMin, precioMax, anioDesde, anioHasta, orden }. Los vacios no se
// mandan. El backend responde 404 cuando no hay resultados: para la grilla eso
// es simplemente una pagina vacia.
export const getPaginaProductos = async (filtros = {}, pagina = 0, tamanio = 12) => {
  const params = new URLSearchParams({ pagina, tamanio })
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, valor)
  })
  try {
    const respuesta = await api.get(`/productos?${params}`)
    return {
      items: respuesta.contenido.map(adaptarResumen),
      pagina: respuesta.pagina,
      totalPaginas: respuesta.totalPaginas,
      total: respuesta.total,
    }
  } catch (err) {
    if (err.status === 404) return { items: [], pagina: 0, totalPaginas: 0, total: 0 }
    throw err
  }
}

// Para las filas de la portada: una sola tanda, sin paginar.
export const getProductos = async (filtros = {}) => (await getPaginaProductos(filtros, 0, 20)).items

export const getProducto = async (id) => adaptarDetalle(await api.get(`/productos/${id}`))

// Hasta 8 parecidas y disponibles. 404 si no hay ninguna.
export const getSimilares = async (id) => {
  try {
    return (await api.get(`/productos/${id}/similares`)).map(adaptarResumen)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// Lo que tiene publicado un vendedor, con las mismas reglas que el catalogo.
export const getProductosDeVendedor = (nombreUsuario) =>
  listarPaginado(`/productos/vendedor/${encodeURIComponent(nombreUsuario)}`, adaptarResumen)

// Todas las fotos de un producto. Su vendedor ve tambien las que estan en
// revision o rechazadas; el resto, solo las aprobadas. 404 si no tiene.
export const getFotosDeProducto = async (idProducto) => {
  try {
    return (await api.get(`/fotos?idProducto=${idProducto}`)).map((f) => ({ ...f, url: urlFoto(f.url) }))
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// Baja de una foto. Si era la ultima aprobada, el producto vuelve a BORRADOR.
export const eliminarFoto = (idFoto) => api.put(`/fotos/${idFoto}/baja`)

// Tablero del vendedor: lo que requiere accion, la plata, el rendimiento y la
// reputacion.
export const getDashboard = () => api.get('/dashboard')

// Incluye borradores y pausados, no los dados de baja. Paginado como el
// catalogo; 404 si todavia no hay ninguna, que para la pantalla es lista vacia.
export const getMisPublicaciones = async () => {
  try {
    return (await api.get('/productos/mis-publicaciones?tamanio=100')).contenido.map(adaptarDetalle)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// PUT reemplaza todos los datos: se manda el producto completo. No toca ni
// el estado de publicacion ni las fotos.
export const actualizarProducto = async (id, datos) =>
  adaptarDetalle(await api.put(`/productos/${id}`, datos))

// PUBLICADO <-> PAUSADO. De BORRADOR solo se sale subiendo una foto.
export const cambiarEstadoPublicacion = async (id, estado) =>
  adaptarDetalle(await api.put(`/productos/${id}/estado?estado=${estado}`))

// Baja logica: sale del catalogo y de los carritos. En "mis publicaciones"
// sigue apareciendo (en gris) para poder reactivarla.
export const darDeBajaProducto = (id) => api.put(`/productos/${id}/baja`)

// Vuelve a estar activa, en el estado de publicacion que tenia antes de la baja.
export const reactivarPublicacion = async (id) => adaptarDetalle(await api.put(`/productos/${id}/reactivar`))

// El producto nace en BORRADOR: no aparece en el catalogo hasta que se le
// sube una foto. Devuelve { producto, mensaje }.
export const crearProducto = (datos) => api.post('/productos', datos)

// Una foto por pedido. El backend la verifica con IA antes de guardarla, asi
// que puede tardar; si la rechaza responde 409 con el motivo. La primera que
// entra deja el producto PUBLICADO.
export const subirFoto = (idProducto, archivo) => {
  const form = new FormData()
  form.append('file', archivo)
  form.append('idProducto', idProducto)
  return api.post('/fotos', form)
}

// Planes de visibilidad con su precio por mes (publico).
export const getPlanesVisibilidad = () => api.get('/destacados/planes')

// El vendedor compra visibilidad para su producto. No hay pasarela: el pago es
// simulado y el backend registra lo cobrado.
export const comprarVisibilidad = async (id, nivel, meses) =>
  adaptarDetalle(await api.put(`/productos/${id}/destacar?nivel=${nivel}&meses=${meses}`))
