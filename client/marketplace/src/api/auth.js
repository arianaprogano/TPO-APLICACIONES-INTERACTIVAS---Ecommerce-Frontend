import { api, setToken } from './client'

// El backend devuelve el usuario con sus nombres (nombreUsuario, rol en
// mayusculas). El resto del front usa username y role en minusculas, asi que
// lo adaptamos en un solo lugar. Los roles del backend son admin, cliente y
// despachante: cualquier cliente puede comprar y tambien publicar.
export const adaptarUsuario = (usuario) => ({
  ...usuario,
  username: usuario.nombreUsuario,
  role: usuario.rol?.toLowerCase(),
})

export const getUsuarioActual = async () => adaptarUsuario(await api.get('/usuarios/me'))

export const login = async (mail, contrasena) => {
  const { access_token } = await api.post('/auth/login', { mail, contrasena })
  setToken(access_token)
  return getUsuarioActual()
}

export const registrar = async (datos) => {
  const { access_token } = await api.post('/auth/registro', datos)
  setToken(access_token)
  return getUsuarioActual()
}

export const logout = () => setToken(null)

// PUT /usuarios/me pide el usuario completo, contrasena incluida, y devuelve
// un token nuevo: el token lleva el mail adentro, asi que si el mail cambia
// el anterior deja de servir. Se guarda el nuevo y se trae el usuario de nuevo.
export const actualizarPerfil = async (datos) => {
  const { access_token } = await api.put('/usuarios/me', datos)
  setToken(access_token)
  return getUsuarioActual()
}

// Baja logica de la cuenta propia: arrastra sus publicaciones.
export const darmeDeBaja = async () => {
  await api.put('/usuarios/me/baja')
  setToken(null)
}
