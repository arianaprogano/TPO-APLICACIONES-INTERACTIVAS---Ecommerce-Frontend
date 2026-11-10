import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, getLista, errorConCampos } from "../../api/client";
import { adaptarOrden } from "../../api/ordenes";
import { adaptarDetalle, adaptarFoto } from "../../api/productos";
import { adaptarDestacado } from "../../api/admin";

// Todo lo de este slice pide token de ADMIN: el backend responde 403 a
// cualquier otro rol.

// Órdenes
export const fetchTodasLasOrdenes = createAsyncThunk("admin/fetchOrdenes", async () => {
  const lista = await getLista("/ordenes/todas", { tamanio: 100 });
  return lista.map(adaptarOrden);
});

// Sin pasarela de pago, solo el admin confirma que la plata entro. Al pagarse,
// el backend crea el envio.
export const pagarOrdenAdmin = createAsyncThunk("admin/pagarOrden", async (id) => {
  const { data } = await http.put(`/ordenes/${id}/estado`, null, { params: { estado: "PAGADA" } });
  return adaptarOrden(data);
});

// Productos y Fotos
// Incluye inactivos, borradores y pausados.
export const fetchTodosLosProductos = createAsyncThunk("admin/fetchProductos", async () => {
  const lista = await getLista("/productos/todos", { tamanio: 100 });
  return lista.map(adaptarDetalle);
});

// Fotos que la IA no pudo resolver: esperan que un admin las mire.
export const fetchFotosPendientes = createAsyncThunk("admin/fetchFotos", async () => {
  const lista = await getLista("/fotos/pendientes", { tamanio: 100 });
  return lista.map(adaptarFoto);
});

export const fetchDestacados = createAsyncThunk("admin/fetchDestacados", async () => {
  const lista = await getLista("/destacados", { tamanio: 100 });
  return lista.map(adaptarDestacado);
});

// Aprobar una foto publica su producto si estaba en borrador.
export const resolverFotoAdmin = createAsyncThunk("admin/resolverFoto", async ({ idFoto, aprobada }) => {
  await http.put(`/fotos/${idFoto}/revision`, null, { params: { aprobada } });
  return idFoto; // Devolvemos el ID para sacarlo de la lista local
});

export const bajaProductoAdmin = createAsyncThunk("admin/bajaProducto", async (id) => {
  await http.put(`/productos/${id}/baja`);
  return id;
});

export const reactivarProductoAdmin = createAsyncThunk("admin/reactivarProducto", async (id) => {
  const { data } = await http.put(`/productos/${id}/reactivar`);
  return adaptarDetalle(data);
});

// Visibilidad paga: la cobra el admin por afuera y la registra aca.
export const destacarProductoAdmin = createAsyncThunk("admin/destacarProducto", async ({ id, nivel, meses = 1 }) => {
  const { data } = await http.put(`/productos/${id}/destacar`, null, { params: { nivel, meses } });
  return adaptarDetalle(data);
});

// Usuarios
export const fetchUsuarios = createAsyncThunk("admin/fetchUsuarios", async () => {
  const activos = await getLista("/usuarios", { tamanio: 100 });
  const inactivos = await getLista("/usuarios/inactivos", { tamanio: 100 });
  return { activos, inactivos };
});

export const cambiarRolAdmin = createAsyncThunk("admin/cambiarRol", async ({ id, rol }) => {
  const { data } = await http.put(`/usuarios/${id}/rol`, null, { params: { rol } });
  return data;
});

export const bajaUsuarioAdmin = createAsyncThunk("admin/bajaUsuario", async (id) => {
  await http.put(`/usuarios/${id}/baja`);
  return id;
});

export const reactivarUsuarioAdmin = createAsyncThunk("admin/reactivarUsuario", async (id) => {
  await http.put(`/usuarios/${id}/reactivar`);
  return id;
});

// El registro siempre crea un CLIENTE. Para otro rol se crea y despues se le
// cambia. El token que devuelve el registro es el de la cuenta nueva: se
// descarta, el admin sigue con su sesion.
export const crearNuevoUsuario = createAsyncThunk("admin/crearUsuario", async ({ rol, ...datos }, { rejectWithValue }) => {
  try {
    await http.post("/auth/registro", datos);
    if (rol === "CLIENTE") return;
    const usuarios = await getLista("/usuarios", { tamanio: 100 });
    const creado = usuarios.find((u) => u.mail === datos.mail);
    if (creado) await http.put(`/usuarios/${creado.id}/rol`, null, { params: { rol } });
  } catch (error) {
    return rejectWithValue(errorConCampos(error));
  }
});

// Categorías
export const fetchCategorias = createAsyncThunk("admin/fetchCategorias", async () => {
  const activas = await getLista("/categorias");
  const inactivas = await getLista("/categorias/inactivas");
  return { activas, inactivas };
});

export const guardarCategoria = createAsyncThunk("admin/guardarCategoria", async ({ id, datos }) => {
  const { data } = id ? await http.put(`/categorias/${id}`, datos) : await http.post("/categorias", datos);
  return data;
});

// Solo se puede dar de baja una categoria vacia: sin hijas y sin productos.
export const bajaCategoriaAdmin = createAsyncThunk("admin/bajaCategoria", async (id) => {
  await http.put(`/categorias/${id}/baja`);
  return id;
});

// 409 si su categoria padre sigue dada de baja: hay que reactivar esa primero.
export const reactivarCategoriaAdmin = createAsyncThunk("admin/reactivarCategoria", async (id) => {
  await http.put(`/categorias/${id}/reactivar`);
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

      .addCase(fetchTodasLasOrdenes.pending, handlePending)
      .addCase(fetchTodasLasOrdenes.fulfilled, (state, action) => { state.loading = false; state.ordenes = action.payload; })
      .addCase(fetchTodasLasOrdenes.rejected, handleRejected)

      .addCase(fetchTodosLosProductos.pending, handlePending)
      .addCase(fetchTodosLosProductos.fulfilled, (state, action) => { state.loading = false; state.productos = action.payload; })
      .addCase(fetchTodosLosProductos.rejected, handleRejected)

      .addCase(fetchFotosPendientes.pending, handlePending)
      .addCase(fetchFotosPendientes.fulfilled, (state, action) => { state.loading = false; state.fotosPendientes = action.payload; })

      .addCase(fetchDestacados.pending, handlePending)
      .addCase(fetchDestacados.fulfilled, (state, action) => { state.loading = false; state.destacados = action.payload; })
      .addCase(fetchDestacados.rejected, handleRejected)

      .addCase(fetchUsuarios.pending, handlePending)
      .addCase(fetchUsuarios.fulfilled, (state, action) => { state.loading = false; state.usuarios = action.payload; })

      .addCase(fetchCategorias.pending, handlePending)
      .addCase(fetchCategorias.fulfilled, (state, action) => { state.loading = false; state.categorias = action.payload; })

      .addCase(resolverFotoAdmin.fulfilled, (state, action) => {
        state.fotosPendientes = state.fotosPendientes.filter(f => f.id !== action.payload);
      })
      .addCase(pagarOrdenAdmin.fulfilled, (state, action) => {
        const index = state.ordenes.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.ordenes[index] = action.payload;
      });
  },
});

export default adminSlice.reducer;
