import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  getTodasLasOrdenes, marcarOrdenPagada, getTodosLosProductos,
  getHistorialDestacados, getFotosPendientes, revisarFoto,
  getUsuarios, getUsuariosInactivos, cambiarRol, darDeBajaUsuario, reactivarUsuario, crearUsuario,
  getCategorias, getCategoriasInactivas, crearCategoria, editarCategoria, darDeBajaCategoria, reactivarCategoria,
  darDeBajaProducto, reactivarProducto, destacarProducto
} from "../../api/admin";

// Órdenes
export const fetchTodasLasOrdenes = createAsyncThunk("admin/fetchOrdenes", async () => await getTodasLasOrdenes()); 
export const pagarOrdenAdmin = createAsyncThunk("admin/pagarOrden", async (id) => await marcarOrdenPagada(id)); 

// Productos y Fotos
export const fetchTodosLosProductos = createAsyncThunk("admin/fetchProductos", async () => await getTodosLosProductos()); 
export const fetchFotosPendientes = createAsyncThunk("admin/fetchFotos", async () => await getFotosPendientes()); 
export const fetchDestacados = createAsyncThunk("admin/fetchDestacados", async () => await getHistorialDestacados()); 
export const resolverFotoAdmin = createAsyncThunk("admin/resolverFoto", async ({ idFoto, aprobada }) => {
  await revisarFoto(idFoto, aprobada); 
  return idFoto; // Devolvemos el ID para sacarlo de la lista local
});
export const bajaProductoAdmin = createAsyncThunk("admin/bajaProducto", async (id) => {
  await darDeBajaProducto(id); 
  return id;
});
export const reactivarProductoAdmin = createAsyncThunk("admin/reactivarProducto", async (id) => await reactivarProducto(id)); 
export const destacarProductoAdmin = createAsyncThunk("admin/destacarProducto", async ({ id, nivel, meses }) => await destacarProducto(id, nivel, meses)); 

// Usuarios
export const fetchUsuarios = createAsyncThunk("admin/fetchUsuarios", async () => {
  const activos = await getUsuarios(); 
  const inactivos = await getUsuariosInactivos(); 
  return { activos, inactivos };
});
export const cambiarRolAdmin = createAsyncThunk("admin/cambiarRol", async ({ id, rol }) => await cambiarRol(id, rol)); 
export const bajaUsuarioAdmin = createAsyncThunk("admin/bajaUsuario", async (id) => {
  await darDeBajaUsuario(id); 
  return id;
});
export const reactivarUsuarioAdmin = createAsyncThunk("admin/reactivarUsuario", async (id) => {
  await reactivarUsuario(id); 
  return id;
});
export const crearNuevoUsuario = createAsyncThunk("admin/crearUsuario", async (datos) => await crearUsuario(datos)); 

// Categorías
export const fetchCategorias = createAsyncThunk("admin/fetchCategorias", async () => {
  const activas = await getCategorias(); 
  const inactivas = await getCategoriasInactivas(); 
  return { activas, inactivas };
});
export const guardarCategoria = createAsyncThunk("admin/guardarCategoria", async ({ id, datos }) => {
  return id ? await editarCategoria(id, datos) : await crearCategoria(datos); 
});
export const bajaCategoriaAdmin = createAsyncThunk("admin/bajaCategoria", async (id) => {
  await darDeBajaCategoria(id); 
  return id;
});
export const reactivarCategoriaAdmin = createAsyncThunk("admin/reactivarCategoria", async (id) => {
  await reactivarCategoria(id);
  return id;
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    ordenes: [],
    productos: [],
    fotosPendientes: [],
    destacados: [],
    usuarios: { activos: [], inactivos: [] },
    categorias: { activas: [], inactivas: [] },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cargas principales
      .addCase(fetchTodasLasOrdenes.pending, handlePending)
      .addCase(fetchTodasLasOrdenes.fulfilled, (state, action) => { state.loading = false; state.ordenes = action.payload; })
      .addCase(fetchTodasLasOrdenes.rejected, handleRejected)

      .addCase(fetchTodosLosProductos.pending, handlePending)
      .addCase(fetchTodosLosProductos.fulfilled, (state, action) => { state.loading = false; state.productos = action.payload; })
      .addCase(fetchTodosLosProductos.rejected, handleRejected)

      .addCase(fetchFotosPendientes.pending, handlePending)
      .addCase(fetchFotosPendientes.fulfilled, (state, action) => { state.loading = false; state.fotosPendientes = action.payload; })
      
      .addCase(fetchUsuarios.pending, handlePending)
      .addCase(fetchUsuarios.fulfilled, (state, action) => { state.loading = false; state.usuarios = action.payload; })
      
      .addCase(fetchCategorias.pending, handlePending)
      .addCase(fetchCategorias.fulfilled, (state, action) => { state.loading = false; state.categorias = action.payload; })

      // Acciones rápidas (optimistas o de reemplazo)
      .addCase(resolverFotoAdmin.fulfilled, (state, action) => {
        state.fotosPendientes = state.fotosPendientes.filter(f => f.id !== action.payload);
      })
      .addCase(pagarOrdenAdmin.fulfilled, (state, action) => {
        const index = state.ordenes.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.ordenes[index] = action.payload;
      });

    
      // El resto de los addCase de Admin (reactivar, baja, etc.) se agregan según necesites reflejar cambios locales o, más fácil aún, 
      // despachar el thunk de "fetchUsuarios" o "fetchCategorias" de nuevo en el componente (lo cual es válido y mantiene la base limpia).
  },
});

export default adminSlice.reducer;