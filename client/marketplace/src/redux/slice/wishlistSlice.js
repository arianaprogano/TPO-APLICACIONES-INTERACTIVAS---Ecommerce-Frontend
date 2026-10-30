import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getWishlist, agregarAWishlist, quitarDeWishlist, vaciarWishlist } from "../../api/wishlist";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async () => {
  return await getWishlist();
});

export const agregarFavorito = createAsyncThunk("wishlist/agregar", async (idProducto) => {
  return await agregarAWishlist(idProducto);
});

export const quitarFavorito = createAsyncThunk("wishlist/quitar", async (idItem) => {
  return await quitarDeWishlist(idItem);
});

export const vaciarFavoritos = createAsyncThunk("wishlist/vaciar", async () => {
  return await vaciarWishlist();
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.items = action.payload; // El backend de wishlist devuelve un array directo de items
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
  reducers: {},
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

export default wishlistSlice.reducer;