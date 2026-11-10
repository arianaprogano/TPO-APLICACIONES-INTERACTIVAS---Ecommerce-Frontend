import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista } from "../../api/client";
import { adaptarOrden } from "../../api/ordenes";

export const fetchMisCompras = createAsyncThunk("ordenes/fetchCompras", async () => {
  const lista = await getLista("/ordenes/mis-compras", { tamanio: 100 });
  return lista.map(adaptarOrden);
});

export const fetchMisVentas = createAsyncThunk("ordenes/fetchVentas", async () => {
  const lista = await getLista("/ordenes/mis-ventas", { tamanio: 100 });
  return lista.map(adaptarOrden);
});

// Una orden puntual: la ven su comprador, su vendedor y el admin.
export const fetchOrdenDetalle = createAsyncThunk("ordenes/fetchDetalle", async (id) => {
  const { data } = await http.get(`/ordenes/${id}`);
  return adaptarOrden(data);
});

// Comprador o vendedor pueden cancelar una orden PENDIENTE; repone el stock.
export const cancelarMiOrden = createAsyncThunk("ordenes/cancelar", async (id) => {
  const { data } = await http.put(`/ordenes/${id}/estado`, null, { params: { estado: "CANCELADA" } });
  return adaptarOrden(data);
});

// El contenido sale del carrito del usuario en el backend; aca solo va a
// donde se despacha. Devuelve una orden por cada vendedor y metodo de entrega.
export const crearNuevaOrden = createAsyncThunk("ordenes/crear", async ({ provinciaEntrega, localidadEntrega, direccionEntrega }) => {
  const { data } = await http.post("/ordenes", { provinciaEntrega, localidadEntrega, direccionEntrega });
  return data.map(adaptarOrden);
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const ordenesSlice = createSlice({
  name: "ordenes",
  initialState: {
    compras: [],
    ventas: [],
    ordenActual: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Casos para Mis Compras
      .addCase(fetchMisCompras.pending, handlePending)
      .addCase(fetchMisCompras.fulfilled, (state, action) => {
        state.loading = false;
        state.compras = action.payload;
      })
      .addCase(fetchMisCompras.rejected, handleRejected)

      // Casos para Mis Ventas
      .addCase(fetchMisVentas.pending, handlePending)
      .addCase(fetchMisVentas.fulfilled, (state, action) => {
        state.loading = false;
        state.ventas = action.payload;
      })
      .addCase(fetchMisVentas.rejected, handleRejected)

      .addCase(fetchOrdenDetalle.pending, handlePending)
      .addCase(fetchOrdenDetalle.fulfilled, (state, action) => {
        state.loading = false;
        state.ordenActual = action.payload;
      })
      .addCase(fetchOrdenDetalle.rejected, handleRejected)

      .addCase(cancelarMiOrden.fulfilled, (state, action) => {
        // Actualizamos localmente sin necesidad de recargar todo
        const indexCompra = state.compras.findIndex(c => c.id === action.payload.id);
        if (indexCompra !== -1) state.compras[indexCompra] = action.payload;

        const indexVenta = state.ventas.findIndex(v => v.id === action.payload.id);
        if (indexVenta !== -1) state.ventas[indexVenta] = action.payload;
      });
  },
});

export default ordenesSlice.reducer;
