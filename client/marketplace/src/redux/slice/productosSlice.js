import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista, errorConCampos } from "../../api/client";
import { adaptarDetalle, adaptarFoto, adaptarResumen, sinVacios } from "../../api/productos";

// filtros: { idCategoria, nombre, enOferta, admiteEnvio, condicion, provincia,
// precioMin, precioMax, anioDesde, anioHasta, orden }. El backend responde
// 404 cuando no hay resultados: para la grilla es una pagina vacia.
export const fetchCatalogo = createAsyncThunk("productos/fetchCatalogo", async ({ filtros, pagina = 0, tamanio = 12 }) => {
  try {
    const { data } = await http.get("/productos", { params: { ...sinVacios(filtros), pagina, tamanio } });
    return {
      items: data.contenido.map(adaptarResumen),
      pagina: data.pagina,
      totalPaginas: data.totalPaginas,
      total: data.total,
    };
  } catch (error) {
    if (error.status === 404) return { items: [], pagina: 0, totalPaginas: 0, total: 0 };
    throw error;
  }
});

// Una fila de la portada (ofertas, mas vistos, una categoria...): una sola
// tanda, sin paginar. Se guarda bajo su clave.
export const fetchFilaInicio = createAsyncThunk("productos/fetchFilaInicio", async ({ clave, filtros }) => {
  const lista = await getLista("/productos", { ...sinVacios(filtros), pagina: 0, tamanio: 20 });
  return { clave, items: lista.map(adaptarResumen) };
});

export const fetchProductoDetalle = createAsyncThunk("productos/fetchDetalle", async (id) => {
  const { data } = await http.get(`/productos/${id}`);
  return adaptarDetalle(data);
});

// Lo que tiene publicado un vendedor, con las mismas reglas que el catalogo.
export const fetchProductosDeVendedor = createAsyncThunk("productos/fetchDeVendedor", async (nombreUsuario) => {
  const lista = await getLista(`/productos/vendedor/${encodeURIComponent(nombreUsuario)}`, { tamanio: 100 });
  return lista.map(adaptarResumen);
});

// Incluye borradores, pausados y dados de baja (estos en gris, para reactivar).
export const fetchMisPublicaciones = createAsyncThunk("productos/fetchMisPublicaciones", async () => {
  const lista = await getLista("/productos/mis-publicaciones", { tamanio: 100 });
  return lista.map(adaptarDetalle);
});

// Tablero del vendedor: lo que requiere accion, la plata y la reputacion.
export const fetchDashboard = createAsyncThunk("productos/fetchDashboard", async () => {
  const { data } = await http.get("/dashboard");
  return data;
});

// PUBLICADO <-> PAUSADO. De BORRADOR solo se sale subiendo una foto.
export const alternarPausaProducto = createAsyncThunk("productos/alternarPausa", async ({ id, estadoActual }) => {
  const estado = estadoActual === 'PAUSADO' ? 'PUBLICADO' : 'PAUSADO';
  const { data } = await http.put(`/productos/${id}/estado`, null, { params: { estado } });
  return adaptarDetalle(data);
});

// Baja logica: sale del catalogo y de los carritos.
export const bajaProducto = createAsyncThunk("productos/baja", async (id) => {
  await http.put(`/productos/${id}/baja`);
  return id;
});

// Vuelve a estar activa, en el estado de publicacion que tenia antes de la baja.
export const reactivarProducto = createAsyncThunk("productos/reactivar", async (id) => {
  const { data } = await http.put(`/productos/${id}/reactivar`);
  return adaptarDetalle(data);
});

// PUT reemplaza todos los datos: se manda el producto completo.
export const actualizarPublicacion = createAsyncThunk("productos/actualizar", async ({ id, datos }, { rejectWithValue }) => {
  try {
    const { data } = await http.put(`/productos/${id}`, datos);
    return adaptarDetalle(data);
  } catch (error) {
    return rejectWithValue(errorConCampos(error));
  }
});

// Planes de visibilidad con su precio por mes (publico).
export const obtenerPlanesVisibilidad = createAsyncThunk("productos/planesVisibilidad", async () => {
  const { data } = await http.get("/destacados/planes");
  return data;
});

// El vendedor compra visibilidad para su producto. El pago es simulado.
export const destacarPublicacion = createAsyncThunk("productos/comprarVisibilidad", async ({ id, nivel, meses }) => {
  const { data } = await http.put(`/productos/${id}/destacar`, null, { params: { nivel, meses } });
  return adaptarDetalle(data);
});

// Una foto por pedido. Si la IA la rechaza, el backend responde 409 con el motivo.
const subirFoto = (idProducto, archivo) => {
  const form = new FormData();
  form.append("file", archivo);
  form.append("idProducto", idProducto);
  return http.post("/fotos", form);
};

// El producto nace en BORRADOR y se publica cuando se aprueba una foto.
export const crearPublicacionCompleta = createAsyncThunk("productos/crearCompleta", async ({ datos, fotos }, { rejectWithValue }) => {
  let producto;
  try {
    const { data } = await http.post("/productos", datos);
    producto = data.producto;
  } catch (error) {
    return rejectWithValue(errorConCampos(error));
  }

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

// Todas las fotos de un producto. Su vendedor ve tambien las que estan en
// revision o rechazadas; el resto, solo las aprobadas.
export const fetchFotosDeProducto = createAsyncThunk("productos/fetchFotos", async (idProducto) => {
  const lista = await getLista("/fotos", { idProducto });
  return lista.map(adaptarFoto);
});

// Varias fotos a la vez: cada una sale bien o mal por su cuenta.
export const subirFotosProducto = createAsyncThunk("productos/subirFotos", async ({ idProducto, archivos }) => {
  await Promise.allSettled(archivos.map(archivo => subirFoto(idProducto, archivo)));
  return idProducto;
});

// Si era la ultima aprobada, el producto vuelve a BORRADOR.
export const eliminarFotoProducto = createAsyncThunk("productos/eliminarFoto", async (idFoto) => {
  await http.put(`/fotos/${idFoto}/baja`);
  return idFoto;
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
    filasInicio: {},
    productoActual: null,
    delVendedor: null,
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

      .addCase(fetchFilaInicio.fulfilled, (state, action) => {
        state.filasInicio[action.payload.clave] = action.payload.items;
      })

      .addCase(fetchProductoDetalle.pending, handlePending)
      .addCase(fetchProductoDetalle.fulfilled, (state, action) => {
        state.loading = false;
        state.productoActual = action.payload;
      })
      .addCase(fetchProductoDetalle.rejected, handleRejected)

      .addCase(fetchProductosDeVendedor.pending, (state) => {
        state.delVendedor = null;
        state.error = null;
      })
      .addCase(fetchProductosDeVendedor.fulfilled, (state, action) => {
        state.delVendedor = action.payload;
      })
      .addCase(fetchProductosDeVendedor.rejected, (state, action) => {
        state.error = action.error.message;
      })

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
