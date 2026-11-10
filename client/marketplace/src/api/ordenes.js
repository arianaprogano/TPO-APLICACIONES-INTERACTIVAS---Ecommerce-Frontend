// Provincias que acepta el backend (enum Provincia), con su nombre para mostrar.
export const PROVINCIAS = [
  ['BUENOS_AIRES', 'Buenos Aires'], ['CABA', 'Ciudad Autónoma de Buenos Aires'],
  ['CATAMARCA', 'Catamarca'], ['CHACO', 'Chaco'], ['CHUBUT', 'Chubut'],
  ['CORDOBA', 'Córdoba'], ['CORRIENTES', 'Corrientes'], ['ENTRE_RIOS', 'Entre Ríos'],
  ['FORMOSA', 'Formosa'], ['JUJUY', 'Jujuy'], ['LA_PAMPA', 'La Pampa'],
  ['LA_RIOJA', 'La Rioja'], ['MENDOZA', 'Mendoza'], ['MISIONES', 'Misiones'],
  ['NEUQUEN', 'Neuquén'], ['RIO_NEGRO', 'Río Negro'], ['SALTA', 'Salta'],
  ['SAN_JUAN', 'San Juan'], ['SAN_LUIS', 'San Luis'], ['SANTA_CRUZ', 'Santa Cruz'],
  ['SANTA_FE', 'Santa Fe'], ['SANTIAGO_DEL_ESTERO', 'Santiago del Estero'],
  ['TIERRA_DEL_FUEGO', 'Tierra del Fuego'], ['TUCUMAN', 'Tucumán'],
]

export const nombreProvincia = (clave) => PROVINCIAS.find(([c]) => c === clave)?.[1] ?? clave

export const adaptarOrden = (o) => ({
  id: o.id,
  fecha: o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleDateString('es-AR') : '',
  estado: o.estado,
  metodoEntrega: o.metodoEntrega,
  entrega: o.entrega,
  comprador: o.comprador,
  vendedor: o.vendedor,
  total: Number(o.total),
  items: (o.items ?? []).map((d) => ({
    id: d.id,
    idProducto: d.idProducto,
    nombre: d.nombre,
    cantidad: d.cantidad,
    precioFinal: Number(d.precioFinal),
    total: Number(d.total),
  })),
})
