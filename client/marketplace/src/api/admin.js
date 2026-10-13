import { api, listarPaginado } from './client'
import { adaptarOrden } from './ordenes'
import { adaptarDetalle, urlFoto } from './productos'

// Todo lo de este archivo pide token de ADMIN: el backend responde 403 a
// cualquier otro rol.

// --- Ordenes ---
export const getTodasLasOrdenes = () => listarPaginado('/ordenes/todas', adaptarOrden)

// Sin pasarela de pago, solo el admin puede confirmar que la plata entro.
// Al pagarse, el backend crea el envio.
export const marcarOrdenPagada = async (idOrden) =>
  adaptarOrden(await api.put(`/ordenes/${idOrden}/estado?estado=PAGADA`))

// --- Productos y fotos ---
// Incluye inactivos, borradores y pausados.
export const getTodosLosProductos = () => listarPaginado('/productos/todos', adaptarDetalle)

export const darDeBajaProducto = (id) => api.put(`/productos/${id}/baja`)
export const reactivarProducto = async (id) => adaptarDetalle(await api.put(`/productos/${id}/reactivar`))

// Visibilidad paga: la cobra el admin por afuera y la registra aca. Con
// NINGUNO se saca. Los destacados salen primero en el catalogo.
export const NIVELES_DESTACADO = {
  NINGUNO: 'Sin destacar',
  BASICO: 'Básico',
  DESTACADO: 'Destacado',
  PREMIUM: 'Premium',
}

export const destacarProducto = async (id, nivel, meses = 1) =>
  adaptarDetalle(await api.put(`/productos/${id}/destacar?nivel=${nivel}&meses=${meses}`))

// El admin ve el de todos; un vendedor, el de sus productos.
export const getHistorialDestacados = () =>
  listarPaginado('/destacados', (d) => ({
    ...d,
    desde: d.desde ? new Date(d.desde).toLocaleDateString('es-AR') : '',
    hasta: d.hasta ? new Date(d.hasta).toLocaleDateString('es-AR') : '',
  }))

// Fotos que la IA no pudo resolver (o no respondio): esperan que un admin las
// mire. Aprobar una publica su producto si estaba en borrador.
export const getFotosPendientes = () =>
  listarPaginado('/fotos/pendientes', (f) => ({ ...f, url: urlFoto(f.url) }))

export const revisarFoto = (idFoto, aprobada) =>
  api.put(`/fotos/${idFoto}/revision?aprobada=${aprobada}`)

// --- Usuarios ---
// Solo los activos: el backend no lista los dados de baja.
export const getUsuarios = () => listarPaginado('/usuarios')

export const cambiarRol = (idUsuario, rol) => api.put(`/usuarios/${idUsuario}/rol?rol=${rol}`)
export const darDeBajaUsuario = (idUsuario) => api.put(`/usuarios/${idUsuario}/baja`)

// El registro siempre crea un CLIENTE. Para otro rol se crea y despues se le
// cambia. El token que devuelve el registro es el de la cuenta nueva: se
// descarta, el admin sigue con su sesion.
export const crearUsuario = async ({ rol, ...datos }) => {
  await api.post('/auth/registro', datos)
  if (rol === 'CLIENTE') return
  const creado = (await getUsuarios()).find((u) => u.mail === datos.mail)
  if (creado) await cambiarRol(creado.id, rol)
}

// --- Categorias ---
// Lista plana: cada una dice quien es su padre.
export const getCategorias = () => api.get('/categorias')

export const crearCategoria = (datos) => api.post('/categorias', datos)
export const editarCategoria = (id, datos) => api.put(`/categorias/${id}`, datos)

// Solo se puede dar de baja una categoria vacia: sin hijas y sin productos.
export const darDeBajaCategoria = (id) => api.put(`/categorias/${id}/baja`)
