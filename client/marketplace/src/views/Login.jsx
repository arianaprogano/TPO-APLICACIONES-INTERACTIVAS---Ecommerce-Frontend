import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, registrar } from '../api/auth'
import './Login.css'

const registroVacio = { nombre: '', apellido: '', nombreUsuario: '', mail: '', contrasena: '', direccion: '' }

function Login({ setUser }) {
  const navigate = useNavigate()
  const [modo, setModo] = useState('login')
  const [credenciales, setCredenciales] = useState({ mail: '', contrasena: '' })
  const [registro, setRegistro] = useState(registroVacio)
  const [error, setError] = useState('')
  const [erroresCampos, setErroresCampos] = useState({})
  const [cargando, setCargando] = useState(false)

  const entrar = (usuario) => {
    setUser(usuario)
    navigate(usuario.role === 'despachante' ? '/despachante' : '/home')
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setErroresCampos({})
    setCargando(true)
    try {
      const usuario = modo === 'login'
        ? await login(credenciales.mail, credenciales.contrasena)
        : await registrar(registro)
      entrar(usuario)
    } catch (err) {
      setError(err.message)
      setErroresCampos(err.campos || {})
    } finally {
      setCargando(false)
    }
  }

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login')
    setError('')
    setErroresCampos({})
  }

  const campo = (estado, setEstado, name, label, type = 'text') => (
    <div className="login-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        value={estado[name]}
        onChange={(e) => setEstado({ ...estado, [name]: e.target.value })}
        autoComplete={type === 'password' ? (modo === 'login' ? 'current-password' : 'new-password') : undefined}
      />
      {erroresCampos[name] && <span className="login-field-error">{erroresCampos[name]}</span>}
    </div>
  )

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <i className="fa-solid fa-leaf login-logo-icon"></i>
          <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p>{modo === 'login' ? 'Ingresá con tu mail y contraseña.' : 'Completá tus datos para registrarte.'}</p>
        </div>

        <form className="login-form" onSubmit={enviar} noValidate>
          {error && <div className="login-error">{error}</div>}

          {modo === 'login' ? (
            <>
              {campo(credenciales, setCredenciales, 'mail', 'MAIL', 'email')}
              {campo(credenciales, setCredenciales, 'contrasena', 'CONTRASEÑA', 'password')}
            </>
          ) : (
            <>
              <div className="login-row">
                {campo(registro, setRegistro, 'nombre', 'NOMBRE')}
                {campo(registro, setRegistro, 'apellido', 'APELLIDO')}
              </div>
              {campo(registro, setRegistro, 'nombreUsuario', 'NOMBRE DE USUARIO')}
              {campo(registro, setRegistro, 'mail', 'MAIL', 'email')}
              {campo(registro, setRegistro, 'contrasena', 'CONTRASEÑA', 'password')}
              {campo(registro, setRegistro, 'direccion', 'DIRECCIÓN (opcional)')}
            </>
          )}

          <button type="submit" className="btn-login-submit" disabled={cargando}>
            {cargando ? 'Un momento...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <button type="button" className="btn-login-switch" onClick={cambiarModo}>
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>

        <button type="button" className="btn-login-cancel" onClick={() => navigate('/home')}>
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

export default Login
