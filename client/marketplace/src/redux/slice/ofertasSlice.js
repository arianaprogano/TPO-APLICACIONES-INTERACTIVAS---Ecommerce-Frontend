import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista } from "../../api/client";
import { adaptarOferta } from "../../api/ofertas";

// Las que hice y las que me hicieron, juntas.
export const fetchMisOfertas = createAsyncThunk("ofertas/fetch", async () => {
  const lista = await getLista("/ofertas", { tamanio: 100 });
  return lista.map(adaptarOferta);
});

// Precio por unidad, menor al de lista. Si el producto se despacha va la
// direccion: si el vendedor acepta, la orden sale con esa entrega.
export const enviarOferta = createAsyncThunk("ofertas/crear", async (datos) => {
  const { data } = await http.post("/ofertas", datos);
  return adaptarOferta(data);
});

// Aceptar crea la orden al precio acordado.
export const aceptarOfertaThunk = createAsyncThunk("ofertas/aceptar", async (id) => {
  const { data } = await http.put(`/ofertas/${id}/aceptar`);
  return adaptarOferta(data);
});

export const rechazarOfertaThunk = createAsyncThunk("ofertas/rechazar", async (id) => {
  const { data } = await http.put(`/ofertas/${id}/rechazar`);
  return adaptarOferta(data);
});

export const retirarOfertaThunk = createAsyncThunk("ofertas/retirar", async (id) => {
  const { data } = await http.put(`/ofertas/${id}/cancelar`);
  return adaptarOferta(data);
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
      // Aceptar, rechazar o retirar: se reemplaza la oferta en la lista
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
