import React from 'react'
import './AdminModals.css'

function UserForm({ onClose, onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí a futuro se enviará la data al backend real
    alert("Usuario guardado con éxito")
    onSave() // Cierra el modal desde el componente padre
  }

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
      
      <form onSubmit={handleSubmit}>
        <div className="user-modal-body">
          <div className="form-group full-width">
            <label>CORREO ELECTRÓNICO *</label>
            <input type="email" placeholder="ejemplo@test.com" required />
          </div>
          
          <div className="user-modal-grid">
            <div className="form-group">
              <label>USUARIO *</label>
              <input type="text" placeholder="usuario1" required />
            </div>
            <div className="form-group">
              <label>ROL *</label>
              <select>
                <option>Vendedor</option>
                <option>Despachante</option>
                <option>Administrador</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>CONTRASEÑA</label>
            <input type="password" placeholder="Contraseña" />
          </div>

          <div className="user-modal-grid">
            <div className="form-group">
              <label>NOMBRE</label>
              <input type="text" placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label>APELLIDO</label>
              <input type="text" placeholder="Apellido" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>DIRECCIÓN</label>
            <input type="text" placeholder="Calle 123, Provincia" />
          </div>
        </div>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar">
            <i className="fa-solid fa-check"></i> Guardar Usuario
          </button>
        </footer>
      </form>
    </div>
  )
}

export default UserForm