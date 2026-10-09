import React, { useState } from 'react'
import './AdminPanel.css'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('ordenes')
  
  // Estado para el modal de usuarios
  const [isModalOpen, setIsModalOpen] = useState(false) 
  
  // Estados para la Gestión de Categorías
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [catForm, setCatForm] = useState({ id: null, name: '', subcategories: '' })

  // Datos simulados de categorías
  const mockCategories = [
    { id: 1, name: 'Maquinaria', subcategories: 'Tractor, Cosechadora' },
    { id: 2, name: 'Insumos', subcategories: 'Semillas, Fertilizantes' }
  ]

  const openNewCategoryModal = () => {
    setCatForm({ id: null, name: '', subcategories: '' })
    setIsCatModalOpen(true)
  }

  const openEditCategoryModal = (cat) => {
    setCatForm(cat)
    setIsCatModalOpen(true)
  }

  const handleSaveCategory = () => {
    // Aquí a futuro se enviaría al Backend
    setIsCatModalOpen(false)
    alert(catForm.id ? "¡Categoría editada con éxito!" : "¡Categoría creada con éxito!")
  }

  return (
    <div className="panel-container">
      <div className="panel-tabs">
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Gestión de Órdenes</button>
        <button className={activeTab === 'productos' ? 'active' : ''} onClick={() => setActiveTab('productos')}>Productos Pendientes</button>
        <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>Gestión de Usuarios</button>
        <button className={activeTab === 'categorias' ? 'active' : ''} onClick={() => setActiveTab('categorias')}>Gestión de Categorías</button>
      </div>

      <div className="panel-content">
        
        {/* --- TABLA DE ÓRDENES --- */}
        {activeTab === 'ordenes' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-state">No hay órdenes</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'productos' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>PRECIO</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="empty-state">No hay productos pendientes</td>
              </tr>
            </tbody>
          </table>
        )}

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

        {activeTab === 'categorias' && (
          <div className="users-section">
            <div className="users-toolbar">
              <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Buscar categoría..." />
              </div>
              <button className="btn-new-user" onClick={openNewCategoryModal}>
                <i className="fa-solid fa-folder-plus"></i> NUEVA CATEGORÍA
              </button>
            </div>
            
            <table className="panel-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE DE LA CATEGORÍA</th>
                  <th>SUBCATEGORÍAS</th>
                  <th className="text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {mockCategories.map(cat => (
                  <tr key={cat.id}>
                    <td><strong className="text-gray-500">#{cat.id}</strong></td>
                    <td><strong>{cat.name}</strong></td>
                    <td>
                  
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {cat.subcategories.split(',').map((sub, index) => (
                          <span key={index} className="subcat-badge">{sub.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <button onClick={() => openEditCategoryModal(cat)} className="btn-icon-edit" title="Editar">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn-icon-delete" title="Eliminar">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {isCatModalOpen && (
        <div className="modal-overlay">
          <div className="user-modal-content" style={{ maxWidth: '400px' }}>
            <div className="user-modal-header">
              <div className="modal-title-with-icon">
                <i className="fa-solid fa-folder-tree" style={{ color: '#16a34a' }}></i> 
                {catForm.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </div>
              <button className="close-modal-btn" onClick={() => setIsCatModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="user-modal-body">
              <div className="form-group full-width">
                <label>NOMBRE DE LA CATEGORÍA *</label>
                <input 
                  type="text" 
                  placeholder="Ej. Herramientas" 
                  value={catForm.name}
                  onChange={(e) => setCatForm({...catForm, name: e.target.value})}
                />
              </div>
              
              <div className="form-group full-width" style={{ marginTop: '8px' }}>
                <label>SUBCATEGORÍAS (Separadas por coma)</label>
                <textarea 
                  rows="3" 
                  placeholder="Ej. Palas, Rastrillos, Mangueras" 
                  value={catForm.subcategories}
                  onChange={(e) => setCatForm({...catForm, subcategories: e.target.value})}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                ></textarea>
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Escribe las subcategorías separadas por comas (,).</p>
              </div>
            </div>

            <div className="user-modal-footer">
              <button className="btn-cancelar" onClick={() => setIsCatModalOpen(false)}>Cancelar</button>
              <button className="btn-guardar" onClick={handleSaveCategory}>
                <i className="fa-solid fa-check"></i> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel