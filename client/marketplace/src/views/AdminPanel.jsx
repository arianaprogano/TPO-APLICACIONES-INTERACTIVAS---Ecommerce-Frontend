import React, { useState } from 'react'
import UserForm from '../components/UserForm'
import CategoryForm from '../components/CategoryForm'
import './PanelStyles.css'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('ordenes')
  
  // Estado para el modal de usuarios
  const [isModalOpen, setIsModalOpen] = useState(false) 
  
  // Estados para la Gestión de Categorías
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [editingCategory, setEditingCategory] = useState(null) // Guardamos qué categoría estamos editando

  // Datos simulados de categorías
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

  // Esta función se la pasamos al CategoryForm para que la ejecute al dar "Guardar"
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
                <input type="text" placeholder="Buscar por email, usuario o rol..." />
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
                {categoriasFiltradas.map(cat => (
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
                      <button className="btn-icon-delete" title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* --- RENDERIZADO DE LOS COMPONENTES EXTERNOS --- */}
      
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
    </div>
  )
}

export default AdminPanel