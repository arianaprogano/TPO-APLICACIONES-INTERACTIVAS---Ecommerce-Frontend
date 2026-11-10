// El backend devuelve el usuario con sus nombres (nombreUsuario, rol en
// mayusculas). El resto del front usa username y role en minusculas, asi que
// lo adaptamos en un solo lugar. Los roles del backend son admin, cliente y
// despachante: cualquier cliente puede comprar y tambien publicar.
export const adaptarUsuario = (usuario) => ({
  ...usuario,
  username: usuario.nombreUsuario,
  role: usuario.rol?.toLowerCase(),
})
