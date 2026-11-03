import { configureStore } from "@reduxjs/toolkit";
import carritoReducer from "./slice/carritoSlice";
import wishlistReducer from "./slice/wishlistSlice";
import productosReducer from "./slice/productosSlice";
import adminReducer from "./slice/adminSlice";
import ordenesReducer from "./slice/ordenesSlice";
import ofertasReducer from "./slice/ofertasSlice";
import enviosReducer from "./slice/enviosSlice";
import uiReducer from "./slice/uiSlice";
import chatReducer from "./slice/chatSlice";

export const store = configureStore({
  reducer: {
    carrito: carritoReducer,
    wishlist: wishlistReducer,
    productos: productosReducer,
    admin: adminReducer,
    ordenes: ordenesReducer,
    ofertas: ofertasReducer,
    envios: enviosReducer,
    ui: uiReducer,
    chat: chatReducer,
  },
});