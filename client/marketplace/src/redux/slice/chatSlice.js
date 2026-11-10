import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { http, getLista } from '../../api/client'
import { adaptarMensaje } from '../../api/mensajes'

// Los mensajes viven en el backend: asi los ven el comprador y el vendedor,
// cada uno desde su compu.
export const cargarMensajes = createAsyncThunk('chat/cargar', async (idOrden) => {
  const lista = await getLista(`/ordenes/${idOrden}/mensajes`)
  return lista.map(adaptarMensaje)
})

// 403 si no sos parte de la orden, 409 si no esta pagada o ya se entrego.
export const enviarMensaje = createAsyncThunk('chat/enviar', async ({ idOrden, texto }) => {
  const { data } = await http.post(`/ordenes/${idOrden}/mensajes`, { texto })
  return adaptarMensaje(data)
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    idOrden: null,
    mensajes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarMensajes.pending, (state, action) => {
        // Al cambiar de orden no se muestran los mensajes de la anterior.
        if (state.idOrden !== action.meta.arg) state.mensajes = []
        state.idOrden = action.meta.arg
        state.loading = true
        state.error = null
      })
      .addCase(cargarMensajes.fulfilled, (state, action) => {
        state.loading = false
        state.mensajes = action.payload
      })
      .addCase(cargarMensajes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(enviarMensaje.fulfilled, (state, action) => {
        state.mensajes.push(action.payload)
      })
  },
})

export default chatSlice.reducer
