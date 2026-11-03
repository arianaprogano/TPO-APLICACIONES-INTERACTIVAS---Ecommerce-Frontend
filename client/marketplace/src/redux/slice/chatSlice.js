import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    mensajes: [],
  },
  reducers: {
    // Carga los mensajes desde el almacenamiento del navegador
    cargarMensajes: (state, action) => {
      const idOrden = action.payload
      const guardados = localStorage.getItem(`chat_orden_${idOrden}`)
      state.mensajes = guardados ? JSON.parse(guardados) : []
    },
    // Agrega el mensaje al estado y lo guarda
    agregarMensaje: (state, action) => {
      const { idOrden, user, texto } = action.payload
      
      const nuevoMensaje = {
        id: Date.now(),
        idAutor: user?.id || 999,
        nombreUsuarioAutor: user?.nombreUsuario || 'Usuario',
        texto: texto,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      state.mensajes.push(nuevoMensaje)
      localStorage.setItem(`chat_orden_${idOrden}`, JSON.stringify(state.mensajes))
    }
  }
})

export const { cargarMensajes, agregarMensaje } = chatSlice.actions
export default chatSlice.reducer