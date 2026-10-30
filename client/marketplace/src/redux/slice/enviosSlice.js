import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMisEnvios, getHistorialEntregas, recibirEnvio, cambiarEstadoEnvio } from "../../api/envios";

export const fetchMisEnvios = createAsyncThunk("envios/fetchMis", async () => await getMisEnvios());
export const fetchHistorial = createAsyncThunk("envios/fetchHistorial", async () => await getHistorialEntregas());
export const ingresarPaqueteThunk = createAsyncThunk("envios/ingresar", async (numero) => await recibirEnvio(numero));
export const cambiarEstadoEnvioThunk = createAsyncThunk("envios/cambiarEstado", async ({ id, estado }) => await cambiarEstadoEnvio(id, estado));

const enviosSlice = createSlice({
  name: "envios",
  initialState: {
    enCurso: [],
    historial: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisEnvios.fulfilled, (state, action) => { state.enCurso = action.payload; })
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