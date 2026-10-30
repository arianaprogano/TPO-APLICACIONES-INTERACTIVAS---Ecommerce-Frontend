import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getArbolCategorias } from "../../api/categorias"; 
import { getNotificaciones, contarNoLeidas, marcarLeida } from "../../api/notificaciones"; 

export const fetchCategoriasArbol = createAsyncThunk("ui/fetchCategorias", async () => {
  return await getArbolCategorias(); 
});

export const fetchNotificaciones = createAsyncThunk("ui/fetchNotificaciones", async () => {
  const [lista, noLeidas] = await Promise.all([getNotificaciones(), contarNoLeidas()]); 
  return { lista, noLeidas };
});

export const marcarNotificacionLeida = createAsyncThunk("ui/marcarLeida", async (id) => {
  await marcarLeida(id); 
  return id;
});

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    categorias: [],
    notificaciones: [],
    noLeidas: 0,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriasArbol.fulfilled, (state, action) => {
        state.categorias = action.payload;
      })
      .addCase(fetchNotificaciones.fulfilled, (state, action) => {
        state.notificaciones = action.payload.lista;
        state.noLeidas = action.payload.noLeidas;
      })
      .addCase(marcarNotificacionLeida.fulfilled, (state, action) => {
        const notif = state.notificaciones.find(n => n.id === action.payload);
        if (notif && !notif.leida) {
          notif.leida = true;
          state.noLeidas = Math.max(0, state.noLeidas - 1);
        }
      });
  },
});

export default uiSlice.reducer;