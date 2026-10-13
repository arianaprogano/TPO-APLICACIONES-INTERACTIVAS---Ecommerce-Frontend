import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png' 
import PublishProductForm from './PublishProductForm'
import './Navigation.css'

function Navigation({ 
  searchTerm, setSearchTerm, 
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  favoritesCount,
  user, setUser,
  cartCount, openCart,
  clearCart, clearFavorites 
}) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isPublishOpen, setIsPublishOpen] = useState(false)

  const handleCategoryClick = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory('')
      setSelectedSubcategory('')
    } else {
      setSelectedCategory(cat)
      setSelectedSubcategory('')
    }
  }

  // MAGIA AQUÍ: Limpiamos todo al salir
  const handleLogout = () => {
    setUser(null)
    if (clearCart) clearCart()
    if (clearFavorites) clearFavorites()
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
    navigate('/home')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
  }

  const subcategoriesMap = { 'Maquinaria': ['Tractor', 'Cosechadora'], 'Insumos': ['Semillas', 'Fertilizantes'] }
  const canPublish = user && user.role === 'vendedor'
  const canShop = user?.role !== 'admin' && user?.role !== 'despachante'
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (user) {
      setNotifications([
        { id: 1, text: `Bienvenido de nuevo a AgroMarket, ${user.username}.`, time: "Recién", unread: true }
      ]);
    } else {
      setNotifications([]);
    }
  }, [user]); 
  
  const handleMarcarLeidas = () => {
    const actualizadas = notifications.map(notif => ({ ...notif, unread: false }));
    setNotifications(actualizadas);
    setIsNotifOpen(false);
  };

  return (
    <>
      <header className="header-main">
        <div className="header-top">
          <Link to={user?.role === 'despachante' ? '/despachante' : '/home'} className="header-logo" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory(''); }}>
            <img src={logoImg} alt="AgroMarket Logo" className="logo-img" />
            <span>AgroMarket</span>
          </Link>

          {user?.role !== 'despachante' && (
            <form className="header-search" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Buscar maquinaria, tractor, insumos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <i className="fa-solid fa-search"></i>
            </form>
          )}

          <nav className="header-actions">
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
                  {notifications.some(n => n.unread) && <span className="badge-counter notif-badge">1</span>}
                </button>

                {isNotifOpen && (
                  <aside className="notif-dropdown">
                    <header className="notif-header">
                      <h4>Notificaciones</h4><span className="mark-read" onClick={handleMarcarLeidas} style={{ cursor: 'pointer' }}>Marcar leídas</span>
                    </header>
                    <div className="notif-list">
                      {notifications.map(notif => (
                        <article key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                          <div className="notif-icon"><i className="fa-solid fa-circle-info"></i></div>
                          <div className="notif-content"><p>{notif.text}</p><span>{notif.time}</span></div>
                        </article>
                      ))}
                    </div>
                  </aside>
                )}
              </div>
            )}

            {canShop && (
              <button className="action-btn btn-cart" title="Carrito" onClick={openCart}>
                <i className="fa-solid fa-cart-shopping"></i>
                {cartCount > 0 && <span className="badge-counter">{cartCount}</span>}
              </button>
            )}

            {user ? (
              <div className="user-menu-container">
                <button className="action-login-btn user-logged-in" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}>
                  <span className="user-greeting">Hola, <strong>{user.username}</strong></span>
                  <i className="fa-regular fa-user"></i>
                </button>

                {isDropdownOpen && (
                  <aside className="user-dropdown">
                    <header className="dropdown-header">
                      <span className="dropdown-email">{user.username.toLowerCase().replace(/ /g, '')}@test.com</span>
                      <span className="dropdown-role">{user.role.toUpperCase()}</span>
                    </header>
                    <ul className="dropdown-list">
                      <li><button onClick={() => handleNavigation('/perfil')}><i className="fa-regular fa-id-badge"></i> Mis Datos</button></li>
                      
                      {canShop && (
                        <li><button onClick={() => handleNavigation('/mis-compras')}><i className="fa-solid fa-bag-shopping"></i> Mis Compras</button></li>
                      )}

                      {user.role === 'admin' && <li><button onClick={() => handleNavigation('/admin')}><i className="fa-solid fa-gear"></i> Gestión General</button></li>}
                      {user.role === 'despachante' && <li><button onClick={() => handleNavigation('/despachante')}><i className="fa-solid fa-truck-fast"></i> Gestión de Envíos</button></li>}
                      {user.role === 'vendedor' && (
                        <li><button onClick={() => handleNavigation('/vendedor')}><i className="fa-solid fa-tags"></i> Mis Publicaciones</button></li>
                      )}
                      <li className="logout-item"><button onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</button></li>
                    </ul>
                  </aside>
                )}
              </div>
            ) : (
              <button className="action-login-btn" onClick={() => navigate('/login')}><i className="fa-regular fa-user"></i> <span>Ingresar</span></button>
            )}
          </nav>
        </div>

        {user?.role !== 'despachante' && (
          <nav className="header-categories-bar">
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
          </nav>
        )}

        {user?.role !== 'despachante' && selectedCategory && subcategoriesMap[selectedCategory] && (
          <nav className="header-subcategories-bar">
            <div className="subcategories-container">
              <div className="subcat-label"><i className="fa-solid fa-angle-right"></i> {selectedCategory.toUpperCase()}:</div>
              {subcategoriesMap[selectedCategory].map(sub => (
                <button key={sub} className={`subcat-pill ${selectedSubcategory === sub ? 'active-pill' : ''}`} onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)}>{sub}</button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {isPublishOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <PublishProductForm onClose={() => setIsPublishOpen(false)} />
        </div>
      )}
    </>
  )
}

export default Navigation