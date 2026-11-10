import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista } from "../../api/client";
import { adaptarEnvio, fecha } from "../../api/envios";

// Comprador o vendedor: los envios de sus compras y ventas.
// Despachante: los que cargo y todavia no entrego.
export const fetchMisEnvios = createAsyncThunk("envios/fetchMis", async () => {
  const lista = await getLista("/envios/mios", { tamanio: 100 });
  return lista.map(adaptarEnvio);
});

// Solo ADMIN: el sistema entero.
export const fetchTodosLosEnvios = createAsyncThunk("envios/fetchTodos", async () => {
  const lista = await getLista("/envios/todos", { tamanio: 100 });
  return lista.map(adaptarEnvio);
});

// Solo DESPACHANTE: lo que ya entrego (numero y fecha, sin direcciones).
export const fetchHistorial = createAsyncThunk("envios/fetchHistorial", async () => {
  const lista = await getLista("/envios/historial", { tamanio: 100 });
  return lista.map((e) => ({ ...e, fechaEntrega: fecha(e.fechaEntrega) }));
});

// El despachante carga el numero de la etiqueta: con eso toma el envio.
export const ingresarPaqueteThunk = createAsyncThunk("envios/ingresar", async (numero) => {
  const { data } = await http.post("/envios/recibir", null, { params: { numero: numero.trim() } });
  return adaptarEnvio(data);
});

export const cambiarEstadoEnvioThunk = createAsyncThunk("envios/cambiarEstado", async ({ id, estado }) => {
  const { data } = await http.put(`/envios/${id}/estado`, null, { params: { estado } });
  return adaptarEnvio(data);
});

const enviosSlice = createSlice({
  name: "envios",
  initialState: {
    enCurso: [],
    todos: [],
    historial: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisEnvios.fulfilled, (state, action) => { state.enCurso = action.payload; })
      .addCase(fetchTodosLosEnvios.fulfilled, (state, action) => { state.todos = action.payload; })
      .addCase(fetchHistorial.fulfilled, (state, action) => { state.historial = action.payload; })
      .addCase(ingresarPaqueteThunk.fulfilled, (state, action) => {
        state.enCurso = [action.payload, ...state.enCurso.filter(e => e.id !== action.payload.id)];
      })
      .addCase(cambiarEstadoEnvioThunk.fulfilled, (state, action) => {
        const index = state.enCurso.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.enCurso[index] = action.payload;
      });
  }
});

export default enviosSlice.reducer;
