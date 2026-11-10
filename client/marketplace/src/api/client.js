import axios from 'axios'

// Cliente de axios para hablar con el backend. Los thunks de Redux lo usan
// igual que axios, pero ya trae la direccion del backend y el token.
export const API_URL = 'http://localhost:4002'

const TOKEN_KEY = 'agroMarketToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// App puede registrar aca que hacer cuando el backend rechaza el token
// (vencido o invalido): cerrar la sesion en el front.
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

export const http = axios.create({ baseURL: API_URL })

// Antes de cada pedido: si hay sesion, va el token.
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el backend responde con error, se lanza un ApiError con el mensaje que
// mando el servidor, su codigo y los errores por campo.
http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (!error.response) {
      throw new ApiError('No se pudo conectar con el servidor. ¿Está levantado el backend?', 0)
    }
    const { status, data } = error.response
    if (status === 401 && getToken()) {
      setToken(null)
      onSesionVencida()
    }
    throw new ApiError(data?.message || 'Ocurrió un error con la solicitud.', status, data?.campos)
  }
)

// Pide un listado. El backend responde 404 cuando no hay resultados, que para
// la pantalla es una lista vacia, y algunos listados vienen paginados
// ({ contenido, pagina, ... }).
export const getLista = async (ruta, params) => {
  try {
    const { data } = await http.get(ruta, { params })
    return data.contenido ?? data
  } catch (error) {
    if (error.status === 404) return []
    throw error
  }
}

// createAsyncThunk solo guarda el mensaje de un error. Los formularios
// necesitan tambien los errores por campo: estos thunks los devuelven con
// rejectWithValue.
export const errorConCampos = (error) => ({ message: error.message, campos: error.campos })
