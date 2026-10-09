import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png' 
import './Navigation.css'

function Navigation({ 
  searchTerm, setSearchTerm, 
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  favoritesCount,
  user,
  setUser
}) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  
  // Estados para el Modal de Publicación
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishForm, setPublishForm] = useState({
    title: '', category: 'Maquinaria', subcategory: 'Tractor', condition: 'Nuevo', price: '', stock: '', description: ''
  })

  const handleCategoryClick = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory('')
      setSelectedSubcategory('')
    } else {
      setSelectedCategory(cat)
      setSelectedSubcategory('')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
    navigate('/home')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
  }

  const handlePublishSubmit = () => {
    // CAMBIO: Nuevo mensaje de error
    if (!publishForm.title || !publishForm.price || !publishForm.stock || !publishForm.description) {
      setPublishError('No se puede publicar un producto con los campos vacíos.')
      return
    }
    setPublishError('')
    setIsPublishOpen(false)
    setPublishForm({ title: '', category: 'Maquinaria', subcategory: 'Tractor', condition: 'Nuevo', price: '', stock: '', description: '' })
    alert("¡Producto publicado con éxito!")
  }

  const subcategoriesMap = {
    'Maquinaria': ['Tractor', 'Cosechadora'],
    'Insumos': ['Semillas', 'Fertilizantes']
  }

  const canPublish = user && user.role === 'vendedor'
  const canShop = user?.role !== 'admin' && user?.role !== 'despachante'

  const notifications = user ? [{ id: 1, text: "Bienvenido de nuevo.", time: "Hace 1 min", unread: true }] : [];

  return (
    <>
      <header className="header-main">
        {/* ... (Todo el header sigue exactamente igual, no tocamos nada de la navegación) ... */}
        <div className="header-top">
          <Link to={user?.role === 'despachante' ? '/despachante' : '/home'} className="header-logo" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory(''); }}>
            <img src={logoImg} alt="AgroMarket Logo" className="logo-img" />
            <span>AgroMarket</span>
          </Link>

          {user?.role !== 'despachante' && (
            <div className="header-search">
              <input type="text" placeholder="Buscar maquinaria, tractor, insumos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <i className="fa-solid fa-search"></i>
            </div>
          )}

          <div className="header-actions">
            {canShop && (
              <button className="action-btn btn-heart" title="Lista de Deseos" onClick={() => navigate('/favoritos')}>
                <i className="fa-regular fa-heart"></i>
                {favoritesCount > 0 && <span className="badge-counter">{favoritesCount}</span>}
              </button>
            )}

            {user && (
              <div className="notif-menu-container">
                <button className="action-btn btn-bell" onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}>
                  <i className="fa-regular fa-bell"></i>
                  {notifications.some(n => n.unread) && <span className="badge-counter notif-badge">!</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <h4>Notificaciones</h4><span className="mark-read">Marcar leídas</span>
                    </div>
                    <div className="notif-list">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                          <div className="notif-icon"><i className="fa-solid fa-circle-info"></i></div>
                          <div className="notif-content"><p>{notif.text}</p><span>{notif.time}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {canShop && <button className="action-btn btn-cart" title="Carrito"><i className="fa-solid fa-cart-shopping"></i></button>}

            {user ? (
              <div className="user-menu-container">
                <button className="action-login-btn user-logged-in" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}>
                  <span className="user-greeting">Hola, <strong>{user.username}</strong></span>
                  <i className="fa-regular fa-user"></i>
                </button>

                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-email">{user.username.toLowerCase().replace(/ /g, '')}@test.com</span>
                      <span className="dropdown-role">{user.role.toUpperCase()}</span>
                    </div>
                    <ul className="dropdown-list">
                      <li><button onClick={() => handleNavigation('/perfil')}><i className="fa-regular fa-id-badge"></i> Mis Datos</button></li>
                      {user.role === 'admin' && <li><button onClick={() => handleNavigation('/admin')}><i className="fa-solid fa-gear"></i> Gestión General</button></li>}
                      {user.role === 'despachante' && <li><button onClick={() => handleNavigation('/despachante')}><i className="fa-solid fa-truck-fast"></i> Gestión de Envíos</button></li>}
                      {user.role === 'vendedor' && (
                        <>
                          <li><button><i className="fa-solid fa-bag-shopping"></i> Mis Compras</button></li>
                          <li><button onClick={() => handleNavigation('/vendedor')}><i className="fa-solid fa-tags"></i> Mis Publicaciones</button></li>
                        </>
                      )}
                      <li className="logout-item"><button onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</button></li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button className="action-login-btn" onClick={() => navigate('/login')}><i className="fa-regular fa-user"></i> <span>Ingresar</span></button>
            )}
          </div>
        </div>

        {user?.role !== 'despachante' && (
          <div className="header-categories-bar">
            <div className="categories-container">
              <div className="categories-list">
                <span className="categories-badge">Categorías</span>
                <button className={`category-item ${selectedCategory === 'Maquinaria' ? 'active-cat' : ''}`} onClick={() => handleCategoryClick('Maquinaria')}>Maquinaria</button>
                <button className={`category-item ${selectedCategory === 'Insumos' ? 'active-cat' : ''}`} onClick={() => handleCategoryClick('Insumos')}>Insumos</button>
              </div>
              <div>
                {canPublish && <button className="btn-publish" onClick={() => setIsPublishOpen(true)}><i className="fa-solid fa-plus"></i> Publicar Producto</button>}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MODAL DE PUBLICAR PRODUCTO */}
      {isPublishOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="publish-modal-content">
            <div className="publish-modal-header">
              <div className="modal-title-with-icon">
                <i className="fa-solid fa-box-open" style={{ color: '#16a34a' }}></i> Publicar Producto
              </div>
              <button className="close-modal-btn" onClick={() => { setIsPublishOpen(false); setPublishError(''); }}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="publish-modal-body">
              {publishError && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{publishError}</div>}
              
              <div className="form-group full-width">
                <label>TÍTULO</label>
                <input type="text" value={publishForm.title} onChange={e => setPublishForm({...publishForm, title: e.target.value})} />
              </div>

              <div className="publish-modal-grid">
                <div className="form-group">
                  <label>CATEGORÍA</label>
                  <select value={publishForm.category} onChange={e => setPublishForm({...publishForm, category: e.target.value})}>
                    <option>Maquinaria</option>
                    <option>Insumos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>SUBCATEGORÍA</label>
                  <select value={publishForm.subcategory} onChange={e => setPublishForm({...publishForm, subcategory: e.target.value})}>
                    <option>Tractor</option>
                    <option>Cosechadora</option>
                    <option>Semillas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>CONDICIÓN</label>
                  <select value={publishForm.condition} onChange={e => setPublishForm({...publishForm, condition: e.target.value})}>
                    <option>Nuevo</option>
                    <option>Usado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>PRECIO (U$S)</label>
                  <input type="number" value={publishForm.price} onChange={e => setPublishForm({...publishForm, price: e.target.value})} />
                </div>
              </div>

              <div className="form-group full-width">
                <label>STOCK</label>
                <input type="number" value={publishForm.stock} onChange={e => setPublishForm({...publishForm, stock: e.target.value})} />
              </div>

              <div className="form-group full-width">
                <label>SUBIR IMÁGENES (LOCAL)</label>
                {/* CAMBIO: Se agregó "multiple" para permitir varias fotos */}
                <input type="file" multiple className="custom-file-input" />
              </div>

              <div className="form-group full-width">
                <label>DESCRIPCIÓN</label>
                <textarea rows="4" value={publishForm.description} onChange={e => setPublishForm({...publishForm, description: e.target.value})}></textarea>
              </div>
            </div>

            <div className="publish-modal-footer">
              <button className="btn-cancelar" onClick={() => { setIsPublishOpen(false); setPublishError(''); }}>Cancelar</button>
              <button className="btn-guardar" onClick={handlePublishSubmit}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation