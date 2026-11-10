import { API_URL } from './client'

// Las rutas de fotos llegan relativas ("/fotos/1/contenido"); el <img> necesita
// la URL completa del backend.
export const urlFoto = (ruta) => (ruta ? `${API_URL}${ruta}` : null)

export const adaptarFoto = (f) => ({ ...f, url: urlFoto(f.url) })

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
  fotos: (p.fotos ?? []).map(adaptarFoto),
  reviews: (p.ultimasResenas ?? []).map(adaptarResena),
})

// Los filtros vacios no se mandan al backend.
export const sinVacios = (filtros = {}) =>
  Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''))
