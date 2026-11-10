import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http } from "../../api/client";
import { adaptarCarrito } from "../../api/carrito";

// Cada operacion devuelve el carrito completo.
export const fetchCarrito = createAsyncThunk("carrito/fetch", async () => {
  const { data } = await http.get("/carrito");
  return adaptarCarrito(data);
});

export const agregarItem = createAsyncThunk("carrito/agregar", async ({ idProducto, cantidad }) => {
  const { data } = await http.post("/carrito/items", { idProducto, cantidad });
  return adaptarCarrito(data);
});

export const cambiarCantidadItem = createAsyncThunk("carrito/cambiarCantidad", async ({ idItem, cantidad }) => {
  const { data } = await http.put(`/carrito/items/${idItem}`, { cantidad });
  return adaptarCarrito(data);
});

export const quitarItem = createAsyncThunk("carrito/quitar", async (idItem) => {
  const { data } = await http.delete(`/carrito/items/${idItem}`);
  return adaptarCarrito(data);
});

export const vaciar = createAsyncThunk("carrito/vaciar", async () => {
  const { data } = await http.delete("/carrito");
  return adaptarCarrito(data);
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.items = action.payload.items;
  state.total = action.payload.total;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const carritoSlice = createSlice({
  name: "carrito",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    limpiarErrorCarrito: (state) => {
      state.error = null;
    },

    limpiarCarritoLocal: (state) => {
      state.items = [];
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, handlePending)
      .addCase(fetchCarrito.fulfilled, handleFulfilled)
      .addCase(fetchCarrito.rejected, handleRejected)

      .addCase(agregarItem.pending, handlePending)
      .addCase(agregarItem.fulfilled, handleFulfilled)
      .addCase(agregarItem.rejected, handleRejected)

      .addCase(cambiarCantidadItem.pending, handlePending)
      .addCase(cambiarCantidadItem.fulfilled, handleFulfilled)
      .addCase(cambiarCantidadItem.rejected, handleRejected)

      .addCase(quitarItem.pending, handlePending)
      .addCase(quitarItem.fulfilled, handleFulfilled)
      .addCase(quitarItem.rejected, handleRejected)

      .addCase(vaciar.pending, handlePending)
      .addCase(vaciar.fulfilled, handleFulfilled)
      .addCase(vaciar.rejected, handleRejected);
  },
});

export const { limpiarErrorCarrito, limpiarCarritoLocal } = carritoSlice.actions;
export default carritoSlice.reducer;
