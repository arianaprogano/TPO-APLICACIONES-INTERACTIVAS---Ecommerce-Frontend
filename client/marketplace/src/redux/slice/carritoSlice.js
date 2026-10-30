import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCarrito, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito } from "../../api/carrito";

export const fetchCarrito = createAsyncThunk("carrito/fetch", async () => {
  return await getCarrito();
});

export const agregarItem = createAsyncThunk(
  "carrito/agregar", 
  async ({ idProducto, cantidad }, { rejectWithValue }) => {
    return agregarAlCarrito(idProducto, cantidad)
      .then(res => res)
      .catch(error => {
        const errorData = error.response?.data || { message: error.message || 'Error al agregar al carrito' };
        return rejectWithValue(errorData);
      });
  }
);

export const cambiarCantidadItem = createAsyncThunk("carrito/cambiarCantidad", async ({ idItem, cantidad }) => {
  return await cambiarCantidad(idItem, cantidad);
});

export const quitarItem = createAsyncThunk("carrito/quitar", async (idItem) => {
  return await quitarDelCarrito(idItem);
});

export const vaciar = createAsyncThunk("carrito/vaciar", async () => {
  return await vaciarCarrito();
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
  state.error = action.payload?.message || action.error.message;
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
      .addCase(agregarItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Error al agregar al carrito";
      })
      
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