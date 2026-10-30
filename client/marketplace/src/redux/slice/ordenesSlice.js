import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMisCompras, getMisVentas, getOrden, cancelarOrden, crearOrden } from "../../api/ordenes"; 

export const fetchMisCompras = createAsyncThunk("ordenes/fetchCompras", async () => {
  return await getMisCompras(); 
});

export const fetchMisVentas = createAsyncThunk("ordenes/fetchVentas", async () => {
  return await getMisVentas(); 
});

export const fetchOrdenDetalle = createAsyncThunk("ordenes/fetchDetalle", async (id) => {
  return await getOrden(id); 
});

export const cancelarMiOrden = createAsyncThunk("ordenes/cancelar", async (id) => {
  return await cancelarOrden(id); 
});

export const crearNuevaOrden = createAsyncThunk("ordenes/crear", async (datosEntrega) => {
  return await crearOrden(datosEntrega); 
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
      .addCase(fetchMisCompras.pending, handlePending)
      .addCase(fetchMisCompras.fulfilled, (state, action) => { state.loading = false; state.compras = action.payload; })
      .addCase(fetchMisCompras.rejected, handleRejected)

      .addCase(fetchMisVentas.pending, handlePending)
      .addCase(fetchMisVentas.fulfilled, (state, action) => { state.loading = false; state.ventas = action.payload; })
      .addCase(fetchMisVentas.rejected, handleRejected)

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