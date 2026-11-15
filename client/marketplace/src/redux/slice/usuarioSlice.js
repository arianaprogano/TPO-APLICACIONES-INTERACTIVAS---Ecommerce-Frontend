import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, setToken } from "../../api/client";
import { adaptarUsuario } from "../../api/auth";

// Con el token ya guardado, trae los datos del usuario logueado.
const traerUsuarioActual = async () => {
  const { data } = await http.get("/usuarios/me");
  return adaptarUsuario(data);
};

export const login = createAsyncThunk("usuario/login", async ({ mail, contrasena }) => {
  const { data } = await http.post("/auth/login", { mail, contrasena });
  setToken(data.access_token);
  return await traerUsuarioActual();
});

export const registrar = createAsyncThunk("usuario/registrar", async (datos) => {
  const { data } = await http.post("/auth/registro", datos);
  setToken(data.access_token);
  return await traerUsuarioActual();
});

// PUT /usuarios/me pide el usuario completo, contrasena incluida, y devuelve
// un token nuevo: el token lleva el mail adentro, asi que si el mail cambia
// el anterior deja de servir.
export const actualizarPerfil = createAsyncThunk("usuario/actualizarPerfil", async (datos) => {
  const { data } = await http.put("/usuarios/me", datos);
  setToken(data.access_token);
  return await traerUsuarioActual();
});

// Baja logica de la cuenta propia: arrastra sus publicaciones.
export const darmeDeBaja = createAsyncThunk("usuario/darmeDeBaja", async () => {
  await http.put("/usuarios/me/baja");
  setToken(null);
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleFulfilled = (state) => {
  state.loading = false;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.error.message;
};

const usuarioSlice = createSlice({
  name: "usuario",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)

      .addCase(registrar.pending, handlePending)
      .addCase(registrar.fulfilled, handleFulfilled)
      .addCase(registrar.rejected, handleRejected)

      .addCase(actualizarPerfil.pending, handlePending)
      .addCase(actualizarPerfil.fulfilled, handleFulfilled)
      .addCase(actualizarPerfil.rejected, handleRejected)

      .addCase(darmeDeBaja.rejected, handleRejected);
  },
});

export default usuarioSlice.reducer;
