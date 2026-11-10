import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http } from "../../api/client";
import { adaptarWishlist } from "../../api/wishlist";

// Igual que el carrito: cada operacion devuelve la lista completa.
export const fetchWishlist = createAsyncThunk("wishlist/fetch", async () => {
  const { data } = await http.get("/wishlist");
  return adaptarWishlist(data);
});

export const agregarFavorito = createAsyncThunk("wishlist/agregar", async (idProducto) => {
  const { data } = await http.post("/wishlist/items", { idProducto });
  return adaptarWishlist(data);
});

export const quitarFavorito = createAsyncThunk("wishlist/quitar", async (idItem) => {
  const { data } = await http.delete(`/wishlist/items/${idItem}`);
  return adaptarWishlist(data);
});

export const vaciarFavoritos = createAsyncThunk("wishlist/vaciar", async () => {
  const { data } = await http.delete("/wishlist");
  return adaptarWishlist(data);
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Limpia la pantalla sin borrar los datos del servidor
    limpiarWishlistLocal: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, handlePending)
      .addCase(fetchWishlist.fulfilled, handleFulfilled)
      .addCase(fetchWishlist.rejected, handleRejected)

      .addCase(agregarFavorito.pending, handlePending)
      .addCase(agregarFavorito.fulfilled, handleFulfilled)
      .addCase(agregarFavorito.rejected, handleRejected)

      .addCase(quitarFavorito.pending, handlePending)
      .addCase(quitarFavorito.fulfilled, handleFulfilled)
      .addCase(quitarFavorito.rejected, handleRejected)

      .addCase(vaciarFavoritos.pending, handlePending)
      .addCase(vaciarFavoritos.fulfilled, handleFulfilled)
      .addCase(vaciarFavoritos.rejected, handleRejected);
  },
});

export const { limpiarWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
