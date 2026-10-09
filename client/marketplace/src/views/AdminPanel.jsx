import React, { useState } from 'react'
import './AdminPanel.css'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para el modal

  return (
    <div className="panel-container">
      <div className="panel-tabs">
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Gestión de Órdenes</button>
        <button className={activeTab === 'productos' ? 'active' : ''} onClick={() => setActiveTab('productos')}>Productos Pendientes</button>
        <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>Gestión de Usuarios</button>
      </div>

      <div className="panel-content">
        {/* ... Tablas de órdenes y productos ... */}
        
        {activeTab === 'usuarios' && (
          <div className="users-section">
            <div className="users-toolbar">
              <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Buscar por email, usuario, nombre o rol..." />
              </div>
              <button className="btn-new-user" onClick={() => setIsModalOpen(true)}>
                <i className="fa-solid fa-user-plus"></i> NUEVO USUARIO
              </button>
            </div>
            
            <table className="panel-table">
              <thead>
                <tr>
                  <th>USUARIO / EMAIL</th>
                  <th>NOMBRE COMPLETO</th>
                  <th>ROL</th>
                  <th>DIRECCIÓN</th>
                  <th className="text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-info">
                      <div className="avatar">A</div>
                      <div><strong>admin</strong><br/><span>admin@test.com</span></div>
                    </div>
                  </td>
                  <td>Admin Principal</td>
                  <td><span className="badge-role admin">ADMINISTRADOR</span></td>
                  <td>Oficina Central</td>
                  <td className="text-right action-text italic">Sesión activa</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL NUEVO USUARIO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <div className="modal-title-with-icon">
                <i className="fa-solid fa-user-plus"></i> Registrar Nuevo Usuario
              </div>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="user-modal-body">
              <div className="form-group full-width">
                <label>CORREO ELECTRÓNICO *</label>
                <input type="email" placeholder="ejemplo@test.com" />
              </div>
              
              <div className="user-modal-grid">
                <div className="form-group">
                  <label>USUARIO *</label>
                  <input type="text" placeholder="usuario1" />
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

            <div className="user-modal-footer">
              <button className="btn-cancelar" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-guardar"><i className="fa-solid fa-check"></i> Guardar Usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel