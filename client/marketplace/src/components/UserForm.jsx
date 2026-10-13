import { useState } from 'react'
import { crearUsuario } from '../api/admin'
import './AdminModals.css'

const vacio = { mail: '', nombreUsuario: '', rol: 'CLIENTE', contrasena: '', nombre: '', apellido: '', direccion: '' }

function UserForm({ onClose, onSave }) {
  const [form, setForm] = useState(vacio)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await crearUsuario(form)
      onSave()
    } catch (err) {
      setError(err.message)
      setErrores(err.campos || {})
    } finally {
      setGuardando(false)
    }
  }

  const campo = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label htmlFor={`user-${name}`}>{label}</label>
      <input id={`user-${name}`} type={type} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)}
        autoComplete={type === 'password' ? 'new-password' : 'off'} />
      {errores[name] && <span className="form-error-campo">{errores[name]}</span>}
    </div>
  )

  return (
    <div className="user-modal-content">
      <header className="user-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-user-plus"></i> Registrar Nuevo Usuario
        </div>
        <button type="button" className="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="user-modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="full-width">{campo('mail', 'CORREO ELECTRÓNICO *', 'email', 'ejemplo@test.com')}</div>

          <div className="user-modal-grid">
            {campo('nombreUsuario', 'USUARIO *', 'text', 'usuario1')}
            <div className="form-group">
              <label htmlFor="user-rol">ROL *</label>
              <select id="user-rol" value={form.rol} onChange={e => set('rol', e.target.value)}>
                <option value="CLIENTE">Cliente (compra y vende)</option>
                <option value="DESPACHANTE">Despachante</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div className="full-width">{campo('contrasena', 'CONTRASEÑA *', 'password', 'Contraseña')}</div>

          <div className="user-modal-grid">
            {campo('nombre', 'NOMBRE *', 'text', 'Nombre')}
            {campo('apellido', 'APELLIDO *', 'text', 'Apellido')}
          </div>

          <div className="full-width">{campo('direccion', 'DIRECCIÓN', 'text', 'Calle 123, Localidad')}</div>
        </div>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar" disabled={guardando}>
            <i className="fa-solid fa-check"></i> {guardando ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </footer>
      </form>
    </div>
  )
}

export default UserForm
