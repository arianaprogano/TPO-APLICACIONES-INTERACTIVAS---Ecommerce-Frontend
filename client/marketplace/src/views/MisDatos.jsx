import React, { useState, useEffect } from 'react'
import './MisDatos.css'

function MisDatos({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '', email: '', firstName: '', lastName: '', address: ''
  })

  useEffect(() => {
    if (user) {
      const nameParts = user.username.split(' ');
      setFormData({
        username: user.username,
        email: `${user.username.toLowerCase().replace(/ /g, '')}@test.com`,
        firstName: nameParts[0] || 'Nombre',
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Apellido',
        address: user.role === 'despachante' ? 'Sucursal Central' : (user.role === 'admin' ? 'Oficina Central' : 'Campo de Ventas')
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsEditing(false)
    // A futuro se enviaría la data al Backend
  }

  return (

    <form className="perfil-container" onSubmit={handleSave}>
      
      <header className="perfil-header-top">
        <h2 className="perfil-title">Mis Datos Personales</h2>
        {isEditing ? (
          <button type="submit" className="btn-guardar-datos">GUARDAR DATOS</button>
        ) : (
          <button 
            type="button" 
            className="btn-editar-datos" 
            onClick={(e) => {
              e.preventDefault(); // Evitamos que por error intente guardar al tocar "Editar"
              setIsEditing(true);
            }}
          >
            EDITAR DATOS
          </button>
        )}
      </header>

      <section className="perfil-card">
        <div className="perfil-grid">
          <div className="form-group">
            <label>NOMBRE DE USUARIO</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} />
          </div>
          
          <div className="form-group">
            <label>CORREO ELECTRÓNICO</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} />
          </div>
          
          <div className="form-group">
            <label>NOMBRE</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} />
          </div>
          
          <div className="form-group">
            <label>APELLIDO</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>DIRECCIÓN DE ENVÍO / FACTURACIÓN</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} readOnly={!isEditing} className={!isEditing ? 'input-readonly' : ''} />
        </div>
      </section>

    </form>
  )
}

export default MisDatos