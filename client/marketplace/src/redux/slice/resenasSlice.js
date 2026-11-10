import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista } from "../../api/client";
import { adaptarResena } from "../../api/productos";

// Solo el comprador de la orden, una vez por producto, y cuando el envio ya
// figura entregado. Si no se cumple, el backend responde con el motivo.
export const crearResena = createAsyncThunk("resenas/crear", async ({ idOrden, idProducto, puntaje, comentario }) => {
  const { data } = await http.post("/resenas", { idOrden, idProducto, puntaje, comentario });
  return data;
});

// Todas las de un producto, las mas nuevas primero.
export const fetchResenasDeProducto = createAsyncThunk("resenas/fetchDeProducto", async (idProducto) => {
  const lista = await getLista(`/resenas/producto/${idProducto}`, { tamanio: 100 });
  return lista.map(adaptarResena);
});

// Promedio, cantidad y nivel (BRONCE, ORO, PLATINO) de un vendedor.
export const fetchCalificacionVendedor = createAsyncThunk("resenas/fetchCalificacionVendedor", async (nombreUsuario) => {
  const { data } = await http.get(`/resenas/vendedor/${encodeURIComponent(nombreUsuario)}`);
  return data;
});

const resenasSlice = createSlice({
  name: "resenas",
  initialState: {
    calificacionVendedor: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalificacionVendedor.pending, (state) => {
        state.calificacionVendedor = null;
      })
      .addCase(fetchCalificacionVendedor.fulfilled, (state, action) => {
        state.calificacionVendedor = action.payload;
      })
      .addCase(crearResena.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearResena.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(crearResena.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default resenasSlice.reducer;
