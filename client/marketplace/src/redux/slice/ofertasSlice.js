import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMisOfertas, crearOferta, aceptarOferta, rechazarOferta, cancelarOferta } from "../../api/ofertas"; 

export const fetchMisOfertas = createAsyncThunk("ofertas/fetch", async () => {
  return await getMisOfertas(); 
});

export const enviarOferta = createAsyncThunk("ofertas/crear", async (datos) => {
  return await crearOferta(datos); 
});

export const aceptarOfertaThunk = createAsyncThunk("ofertas/aceptar", async (id) => {
  return await aceptarOferta(id); 
});

export const rechazarOfertaThunk = createAsyncThunk("ofertas/rechazar", async (id) => {
  return await rechazarOferta(id); 
});

export const retirarOfertaThunk = createAsyncThunk("ofertas/retirar", async (id) => {
  return await cancelarOferta(id); 
});

const ofertasSlice = createSlice({
  name: "ofertas",
  initialState: {
    lista: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisOfertas.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMisOfertas.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchMisOfertas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Reemplazo optimista para aceptar/rechazar/cancelar
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && ['ofertas/aceptar', 'ofertas/rechazar', 'ofertas/retirar'].includes(action.type.replace('/fulfilled', '')),
        (state, action) => {
          const index = state.lista.findIndex(o => o.id === action.payload.id);
          if (index !== -1) state.lista[index] = action.payload;
        }
      );
  },
});

export default ofertasSlice.reducer;