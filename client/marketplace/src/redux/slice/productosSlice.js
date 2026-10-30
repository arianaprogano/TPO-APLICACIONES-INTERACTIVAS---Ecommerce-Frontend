import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  getPaginaProductos, 
  getProducto, 
  getMisPublicaciones, 
  getDashboard,
  darDeBajaProducto,
  reactivarPublicacion,
  cambiarEstadoPublicacion,
  crearProducto,
  subirFoto,
  actualizarProducto,
  comprarVisibilidad,
  getPlanesVisibilidad
} from "../../api/productos";

export const fetchCatalogo = createAsyncThunk("productos/fetchCatalogo", async ({ filtros, pagina, tamanio }) => {
  return await getPaginaProductos(filtros, pagina, tamanio);
});

export const fetchProductoDetalle = createAsyncThunk("productos/fetchDetalle", async (id) => {
  return await getProducto(id);
});

export const fetchMisPublicaciones = createAsyncThunk("productos/fetchMisPublicaciones", async () => {
  return await getMisPublicaciones(); 
});

export const fetchDashboard = createAsyncThunk("productos/fetchDashboard", async () => {
  return await getDashboard(); 
});

export const alternarPausaProducto = createAsyncThunk("productos/alternarPausa", async ({ id, estadoActual }) => {
  const nuevoEstado = estadoActual === 'PAUSADO' ? 'PUBLICADO' : 'PAUSADO';
  return await cambiarEstadoPublicacion(id, nuevoEstado); 
});

export const bajaProducto = createAsyncThunk("productos/baja", async (id) => {
  await darDeBajaProducto(id); 
  return id;
});

export const reactivarProducto = createAsyncThunk("productos/reactivar", async (id) => {
  return await reactivarPublicacion(id); 
});

export const actualizarPublicacion = createAsyncThunk("productos/actualizar", async ({ id, datos }) => {
  return await actualizarProducto(id, datos); 
});

export const obtenerPlanesVisibilidad = createAsyncThunk("productos/planesVisibilidad", async () => {
  return await getPlanesVisibilidad(); 
});

export const destacarPublicacion = createAsyncThunk("productos/comprarVisibilidad", async ({ id, nivel, meses }) => {
  return await comprarVisibilidad(id, nivel, meses);
});

export const crearPublicacionCompleta = createAsyncThunk("productos/crearCompleta", async ({ datos, fotos }) => {
  const { producto } = await crearProducto(datos);
  const resultadosFotos = await Promise.allSettled(
    fotos.map(foto => subirFoto(producto.id, foto.file))
  );
  
  const fotosProcesadas = resultadosFotos.map((res, index) => ({
    nombre: fotos[index].file.name,
    ok: res.status === "fulfilled",
    mensaje: res.reason?.message || null
  }));

  return { producto, fotosProcesadas };
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const productosSlice = createSlice({
  name: "productos",
  initialState: {
    catalogo: { items: [], total: 0, pagina: 0, totalPaginas: 0 },
    productoActual: null,
    misPublicaciones: [],
    dashboard: null,
    planesVisibilidad: [],
    loading: false,
    error: null,
  },
  reducers: {
    limpiarProductoActual: (state) => {
      state.productoActual = null;
    },

    limpiarMisPublicacionesLocal: (state) => {
      state.misPublicaciones = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogo.pending, handlePending)
      .addCase(fetchCatalogo.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogo = action.payload;
      })
      .addCase(fetchCatalogo.rejected, handleRejected)

      .addCase(fetchProductoDetalle.pending, handlePending)
      .addCase(fetchProductoDetalle.fulfilled, (state, action) => {
        state.loading = false;
        state.productoActual = action.payload;
      })
      .addCase(fetchProductoDetalle.rejected, handleRejected)

      .addCase(fetchMisPublicaciones.pending, handlePending)
      .addCase(fetchMisPublicaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.misPublicaciones = action.payload;
      })
      .addCase(fetchMisPublicaciones.rejected, handleRejected)

      .addCase(fetchDashboard.pending, handlePending)
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, handleRejected)
      
      .addCase(bajaProducto.fulfilled, (state, action) => {
        const index = state.misPublicaciones.findIndex(p => p.id === action.payload);
        if (index !== -1) state.misPublicaciones[index].activo = false;
      })
      
      .addCase(reactivarProducto.fulfilled, (state, action) => {
        const index = state.misPublicaciones.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.misPublicaciones[index] = action.payload;
      })
      
      .addCase(alternarPausaProducto.fulfilled, (state, action) => {
        const index = state.misPublicaciones.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.misPublicaciones[index] = action.payload;
      })

      .addCase(obtenerPlanesVisibilidad.fulfilled, (state, action) => {
        state.planesVisibilidad = action.payload;
      });
  },
});

export const { limpiarProductoActual, limpiarMisPublicacionesLocal } = productosSlice.actions;
export default productosSlice.reducer;