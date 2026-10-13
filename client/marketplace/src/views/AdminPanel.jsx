import React, { useState } from 'react'
import UserForm from '../components/UserForm'
import CategoryForm from '../components/CategoryForm'
import './PanelStyles.css'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('ordenes')
  const [isModalOpen, setIsModalOpen] = useState(false) 
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [editingCategory, setEditingCategory] = useState(null) 

  const [userToDelete, setUserToDelete] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [usuarios, setUsuarios] = useState([
    { id: 1, name: 'Admin Principal', username: 'admin', email: 'admin@test.com', role: 'admin', address: 'Oficina Central', active: true },
    { id: 2, name: 'Juan Vendedor', username: 'juanv', email: 'juan@test.com', role: 'vendedor', address: 'Rosario, Santa Fe', active: false },
    { id: 3, name: 'Pedro Cliente', username: 'pedroc', email: 'pedro@test.com', role: 'cliente', address: 'Capital Federal', active: false }
  ])

  const usuariosFiltrados = usuarios.filter(user => 
    user.email.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    user.username.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    user.role.toLowerCase().includes(busquedaUsuario.toLowerCase())
  )

  const confirmarEliminarUsuario = () => {
    setUsuarios(usuarios.filter(user => user.id !== userToDelete.id))
    setUserToDelete(null)
  }

  const [categorias, setCategorias] = useState([
    { id: 1, name: 'Maquinaria', subcategories: 'Tractor, Cosechadora' },
    { id: 2, name: 'Insumos', subcategories: 'Semillas, Fertilizantes' }
  ]);

  const categoriasFiltradas = categorias.filter(cat => 
    cat.name.toLowerCase().includes(busquedaCategoria.toLowerCase())
  )

  const openNewCategoryModal = () => {
    setEditingCategory({ id: null, name: '', subcategories: '' })
    setIsCatModalOpen(true)
  }

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat)
    setIsCatModalOpen(true)
  }

  const handleSaveCategory = (catForm) => {
    if (catForm.id) {
      const categoriasActualizadas = categorias.map(c => c.id === catForm.id ? catForm : c);
      setCategorias(categoriasActualizadas);
    } else {
      const nuevoId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
      const nuevaCategoria = { ...catForm, id: nuevoId };
      setCategorias([...categorias, nuevaCategoria]);
    }
    setIsCatModalOpen(false);
  }
  
  const confirmarEliminarCategoria = () => {
    setCategorias(categorias.filter(cat => cat.id !== categoryToDelete.id))
    setCategoryToDelete(null)
  }

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Gestión de Órdenes</button>
        <button className={activeTab === 'productos' ? 'active' : ''} onClick={() => setActiveTab('productos')}>Productos Pendientes</button>
        <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>Gestión de Usuarios</button>
        <button className={activeTab === 'categorias' ? 'active' : ''} onClick={() => setActiveTab('categorias')}>Gestión de Categorías</button>
      </nav>

      <main className="panel-content">
        
        {activeTab === 'ordenes' && (
          <table className="panel-table">
            <thead>
              <tr><th>ID</th><th>TOTAL</th><th>ESTADO</th><th className="text-right">ACCIÓN</th></tr>
            </thead>
            <tbody>
              <tr><td colSpan="4" className="empty-state">No hay órdenes</td></tr>
            </tbody>
          </table>
        )}

        {activeTab === 'productos' && (
          <table className="panel-table">
            <thead>
              <tr><th>PRODUCTO</th><th>PRECIO</th><th className="text-right">ACCIÓN</th></tr>
            </thead>
            <tbody>
              <tr><td colSpan="3" className="empty-state">No hay productos pendientes</td></tr>
            </tbody>
          </table>
        )}

        {activeTab === 'usuarios' && (
          <section className="users-section">
            <header className="users-toolbar">
              <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Buscar por email, usuario o rol..." 
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                />
              </div>
              <button className="btn-new-user" onClick={() => setIsModalOpen(true)}>
                <i className="fa-solid fa-user-plus"></i> NUEVO USUARIO
              </button>
            </header>
            
            <table className="panel-table">
              <thead>
                <tr><th>USUARIO / EMAIL</th><th>NOMBRE COMPLETO</th><th>ROL</th><th>DIRECCIÓN</th><th className="text-right">ACCIÓN</th></tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                          <div><strong>{user.username}</strong><br/><span>{user.email}</span></div>
                        </div>
                      </td>
                      <td>{user.name}</td>
                      <td>
                        <span className={`badge-role ${user.role}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{user.address}</td>
                      <td className="text-right">
                        {user.active ? (
                          <span className="action-text italic">Sesión activa</span>
                        ) : (
                          <button 
                            className="btn-icon-delete" 
                            title="Eliminar usuario"
                            onClick={() => setUserToDelete(user)}
                          >
                            <i className="fa-solid fa-trash"></i> Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="empty-state">No se encontraron usuarios.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'categorias' && (
          <section className="users-section">
            <header className="users-toolbar">
              <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Buscar categoría..." value={busquedaCategoria} onChange={(e) => setBusquedaCategoria(e.target.value)} />
              </div>
              <button className="btn-new-user" onClick={openNewCategoryModal}>
                <i className="fa-solid fa-folder-plus"></i> NUEVA CATEGORÍA
              </button>
            </header>
            
            <table className="panel-table">
              <thead>
                <tr><th>ID</th><th>NOMBRE DE LA CATEGORÍA</th><th>SUBCATEGORÍAS</th><th className="text-right">ACCIÓN</th></tr>
              </thead>
              <tbody>
                {categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map(cat => (
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
                        <button onClick={() => openEditCategoryModal(cat)} className="btn-icon-edit" title="Editar"><i className="fa-solid fa-pen"></i></button>
                        <button onClick={() => setCategoryToDelete(cat)} className="btn-icon-delete" title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr><td colSpan="4" className="empty-state">No se encontraron categorías.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <UserForm 
            onClose={() => setIsModalOpen(false)} 
            onSave={() => setIsModalOpen(false)} 
          />
        </div>
      )}

      {isCatModalOpen && (
        <div className="modal-overlay">
          <CategoryForm 
            onClose={() => setIsCatModalOpen(false)} 
            onSave={handleSaveCategory} 
            initialData={editingCategory} 
          />
        </div>
      )}

      {userToDelete && (
        <div className="error-overlay" onClick={() => setUserToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-box">
              <i className="fa-solid fa-user"></i>
            </div>
            <h2 className="error-title">¿Eliminar Usuario?</h2>
            <p className="error-text">¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.username}</strong>?</p>
            
            <div className="panel-modal-actions">
              <button 
                className="error-btn btn-cancel-panel" 
                onClick={() => setUserToDelete(null)}
              >
                Cancelar
              </button>
              <button 
                className="error-btn" 
                onClick={confirmarEliminarUsuario}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="error-overlay" onClick={() => setCategoryToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-box">
              <i className="fa-solid fa-folder-minus"></i>
            </div>
            <h2 className="error-title">¿Eliminar Categoría?</h2>
            <p className="error-text">¿Estás seguro de que deseas eliminar la categoría <strong>{categoryToDelete.name}</strong>?</p>
            
            <div className="panel-modal-actions">
              <button 
                className="error-btn btn-cancel-panel" 
                onClick={() => setCategoryToDelete(null)}
              >
                Cancelar
              </button>
              <button 
                className="error-btn" 
                onClick={confirmarEliminarCategoria}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminPanel