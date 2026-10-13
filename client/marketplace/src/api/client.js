// Cliente unico para hablar con el backend. Todas las llamadas pasan por aca:
// arma la URL, pone el JSON y el token, y convierte los errores del backend en
// excepciones con el mensaje que mando el servidor.
export const API_URL = 'http://localhost:4002'

const TOKEN_KEY = 'agroMarketToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// App registra aca que hacer cuando el backend rechaza el token (vencido o
// invalido): cerrar la sesion en el front.
let onSesionVencida = () => {}
export const configurarSesionVencida = (callback) => {
  onSesionVencida = callback
}

export class ApiError extends Error {
  constructor(message, status, campos) {
    super(message)
    this.status = status
    // Errores de validacion por campo, ej: { mail: "El mail es obligatorio" }
    this.campos = campos
  }
}

export const apiRequest = async (path, options = {}) => {
  const token = getToken()
  const esFormData = options.body instanceof FormData
  const headers = {
    ...(options.body && !esFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está levantado el backend?', 0)
  }

  const text = await response.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = { message: text }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      setToken(null)
      onSesionVencida()
    }
    throw new ApiError(json?.message || 'Ocurrió un error con la solicitud.', response.status, json?.campos)
  }

  return json
}

// Las listas del backend vienen paginadas ({ contenido, pagina, ... }) y
// responden 404 cuando estan vacias: para una pantalla eso es una lista vacia.
export const listarPaginado = async (path, adaptar = (x) => x, tamanio = 100) => {
  const separador = path.includes('?') ? '&' : '?'
  try {
    return (await apiRequest(`${path}${separador}tamanio=${tamanio}`)).contenido.map(adaptar)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// Atajos para no repetir method y JSON.stringify en cada llamada.
export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
}
