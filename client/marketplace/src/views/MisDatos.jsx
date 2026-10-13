import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { actualizarPerfil, darmeDeBaja } from '../api/auth'
import './MisDatos.css'

const desdeUsuario = (user) => ({
  nombreUsuario: user?.nombreUsuario ?? '',
  mail: user?.mail ?? '',
  nombre: user?.nombre ?? '',
  apellido: user?.apellido ?? '',
  direccion: user?.direccion ?? '',
  contrasena: '',
})

// Los datos salen del usuario logueado (GET /usuarios/me). El backend pide el
// usuario completo para guardar, contrasena incluida: se puede poner la
// actual para no cambiarla, o una nueva.
function MisDatos({ user, setUser }) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(() => desdeUsuario(user))
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmandoBaja, setConfirmandoBaja] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrores(prev => ({ ...prev, [e.target.name]: undefined }))
  }

  const cancelar = () => {
    setFormData(desdeUsuario(user))
    setErrores({})
    setError('')
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    if (!formData.contrasena) {
      setErrores({ contrasena: 'Escribí tu contraseña (la actual o una nueva) para guardar.' })
      return
    }
    setGuardando(true)
    try {
      // Si cambio el mail, el backend manda un token nuevo; actualizarPerfil lo guarda.
      const actualizado = await actualizarPerfil(formData)
      setUser(actualizado)
      setFormData(desdeUsuario(actualizado))
      setIsEditing(false)
      setMensaje('Tus datos se guardaron correctamente.')
    } catch (err) {
      setError(err.message)
      setErrores(err.campos || {})
    } finally {
      setGuardando(false)
    }
  }

  const handleBaja = async () => {
    try {
      await darmeDeBaja()
      setUser(null)
      navigate('/home')
    } catch (err) {
      setConfirmandoBaja(false)
      setError(err.message)
    }
  }

  const campo = (name, label, type = 'text', extra = {}) => (
    <div className={`form-group ${extra.full ? 'full-width' : ''}`}>
      <label htmlFor={`perfil-${name}`}>{label}</label>
      <input id={`perfil-${name}`} type={type} name={name} value={formData[name]} onChange={handleChange}
        readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} placeholder={extra.placeholder}
        autoComplete={type === 'password' ? 'new-password' : undefined} />
      {errores[name] && <span className="perfil-error-campo">{errores[name]}</span>}
    </div>
  )

  return (
    <form className="perfil-container" onSubmit={handleSave} noValidate>
      <header className="perfil-header-top">
        <h2 className="perfil-title">Mis Datos Personales</h2>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-editar-datos" onClick={cancelar}>CANCELAR</button>
            <button type="submit" className="btn-guardar-datos" disabled={guardando}>{guardando ? 'GUARDANDO...' : 'GUARDAR DATOS'}</button>
          </div>
        ) : (
          <button type="button" className="btn-editar-datos" onClick={() => { setIsEditing(true); setMensaje('') }}>
            EDITAR DATOS
          </button>
        )}
      </header>

      {error && <div className="perfil-alerta error">{error}</div>}
      {mensaje && <div className="perfil-alerta ok">{mensaje}</div>}

      <section className="perfil-card">
        <div className="perfil-grid">
          {campo('nombreUsuario', 'NOMBRE DE USUARIO')}
          {campo('mail', 'CORREO ELECTRÓNICO', 'email')}
          {campo('nombre', 'NOMBRE')}
          {campo('apellido', 'APELLIDO')}
        </div>
        {campo('direccion', 'DIRECCIÓN DE ENVÍO / FACTURACIÓN', 'text', { full: true })}

        {isEditing && (
          <div style={{ marginTop: '16px' }}>
            {campo('contrasena', 'CONTRASEÑA', 'password', { full: true, placeholder: 'Tu contraseña actual, o una nueva si la querés cambiar' })}
          </div>
        )}

        <p className="perfil-rol">Rol: <strong>{user?.role?.toUpperCase()}</strong></p>
      </section>

      {user?.role !== 'admin' && (
        <section className="perfil-card perfil-zona-peligro">
          <div>
            <h3>Dar de baja mi cuenta</h3>
            <p>Tus publicaciones salen del catálogo y de los carritos. Las órdenes se conservan. No se puede deshacer desde acá.</p>
          </div>
          {confirmandoBaja ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-editar-datos" onClick={() => setConfirmandoBaja(false)}>NO, VOLVER</button>
              <button type="button" className="btn-baja-cuenta" onClick={handleBaja}>SÍ, DAR DE BAJA</button>
            </div>
          ) : (
            <button type="button" className="btn-baja-cuenta" onClick={() => setConfirmandoBaja(true)}>DAR DE BAJA</button>
          )}
        </section>
      )}
    </form>
  )
}

export default MisDatos
