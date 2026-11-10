import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista } from "../../api/client";
import { armarArbolCategorias } from "../../api/categorias";
import { adaptarNotificacion } from "../../api/notificaciones";

export const fetchCategoriasArbol = createAsyncThunk("ui/fetchCategorias", async () => {
  const { data } = await http.get("/categorias");
  return armarArbolCategorias(data);
});

export const fetchNotificaciones = createAsyncThunk("ui/fetchNotificaciones", async () => {
  const [lista, { data: contador }] = await Promise.all([
    getLista("/notificaciones", { tamanio: 30 }),
    http.get("/notificaciones/no-leidas"),
  ]);
  return { lista: lista.map(adaptarNotificacion), noLeidas: contador.cantidad };
});

export const marcarNotificacionLeida = createAsyncThunk("ui/marcarLeida", async (id) => {
  await http.put(`/notificaciones/${id}/leida`);
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
