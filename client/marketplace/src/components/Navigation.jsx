import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import logoImg from '../assets/logo.png' 
import { fetchCategoriasArbol, fetchNotificaciones, marcarNotificacionLeida } from '../redux/slice/uiSlice'
import { ICONOS_NOTIFICACION } from '../api/notificaciones'
import { limpiarCarritoLocal, fetchCarrito } from '../redux/slice/carritoSlice' 
import { limpiarWishlistLocal, fetchWishlist } from '../redux/slice/wishlistSlice'
import { limpiarMisPublicacionesLocal } from '../redux/slice/productosSlice' 
import './Navigation.css'

function Navigation({ 
  searchTerm, setSearchTerm, 
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  user, setUser
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  // DATOS DESDE REDUX
  const { categorias, notificaciones, noLeidas } = useSelector(state => state.ui)
  const cart = useSelector(state => state.carrito.items)
  const wishlist = useSelector(state => state.wishlist.items)
  
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)
  const favoritesCount = wishlist.length

  useEffect(() => {
    dispatch(fetchCategoriasArbol())
  }, [dispatch])

  useEffect(() => {
    if (!user) return
    dispatch(fetchNotificaciones())
    dispatch(fetchWishlist()) 
    dispatch(fetchCarrito())
    
    const timer = setInterval(() => dispatch(fetchNotificaciones()), 20000)
    return () => clearInterval(timer)
  }, [user, dispatch])

  useEffect(() => {
    if (!isNotifOpen && !isDropdownOpen) return
    const cerrarSiEsAfuera = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', cerrarSiEsAfuera)
    return () => document.removeEventListener('mousedown', cerrarSiEsAfuera)
  }, [isNotifOpen, isDropdownOpen])


  useEffect(() => {
    if (!user) {
      dispatch(limpiarCarritoLocal()) 
      dispatch(limpiarWishlistLocal())
      dispatch(limpiarMisPublicacionesLocal())
    }
  }, [user, dispatch])

  const elegirCategoria = (cat, sub = '') => {
    setSelectedCategory(cat)
    setSelectedSubcategory(sub)
    navigate('/productos')
  }

  const handleLogout = () => {
    setUser(null)
    dispatch(limpiarCarritoLocal()) 
    dispatch(limpiarWishlistLocal())
    dispatch(limpiarMisPublicacionesLocal()) 
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
    navigate('/home')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsDropdownOpen(false)
    setIsNotifOpen(false)
  }
  
  const categoriaActiva = categorias.find(c => c.id === selectedCategory)
  const enListado = location.pathname === '/productos'
  const canPublish = user && user.role === 'cliente'
  const canShop = user?.role !== 'admin' && user?.role !== 'despachante'

  const abrirNotificaciones = () => {
    setIsNotifOpen(!isNotifOpen)
    setIsDropdownOpen(false)
  }

  const leer = (notif) => {
    if (!notif.leida) {
      dispatch(marcarNotificacionLeida(notif.id))
    }
    if (notif.ruta) {
      setIsNotifOpen(false)
      navigate(notif.ruta)
    }
  }

  const handleMarcarLeidas = () => {
    const pendientes = notificaciones.filter(n => !n.leida)
    pendientes.forEach(n => dispatch(marcarNotificacionLeida(n.id)))
  }

  return (
    <>
      <header className="header-main">
        <div className="header-top">
          <Link to={user?.role === 'despachante' ? '/despachante' : '/home'} className="header-logo" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory(''); }}>
            <img src={logoImg} alt="AgroMarket Logo" className="logo-img" />
            <span>AgroMarket</span>
          </Link>

          {user?.role !== 'despachante' && (
            <form className="header-search" onSubmit={(e) => { e.preventDefault(); navigate('/productos') }}>
              <input type="text" placeholder="Busca el producto que necesites" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <div className="notif-menu-container" ref={notifRef}>
                <button className="action-btn btn-bell" title="Notificaciones" onClick={abrirNotificaciones}>
                  <i className="fa-regular fa-bell"></i>
                  {noLeidas > 0 && <span className="badge-counter notif-badge">{noLeidas > 9 ? '9+' : noLeidas}</span>}
                </button>

                {isNotifOpen && (
                  <aside className="notif-dropdown">
                    <header className="notif-header">
                      <h4>Notificaciones</h4>
                      {noLeidas > 0 && <span className="mark-read" onClick={handleMarcarLeidas} style={{ cursor: 'pointer' }}>Marcar leídas</span>}
                    </header>
                    
                    <div className="notif-list">
                      {notificaciones.length === 0 ? (
                        <div className="notif-empty">No tenés notificaciones.</div>
                      ) : notificaciones.map(notif => {
                        
                        // 1. Busca el ícono en tu diccionario (ej: VENTA traerá 'fa-sack-dollar'). Si no hay, usa 'fa-receipt'.
                        let iconoFinal = ICONOS_NOTIFICACION[notif.tipo] || 'fa-receipt';

                        // 2. Única excepción: Si es un mensaje de chat camuflado de ORDEN_ACTUALIZADA
                        if (notif.tipo === 'ORDEN_ACTUALIZADA' && notif.mensaje && notif.mensaje.toLowerCase().includes('chat')) {
                            iconoFinal = 'fa-comments';
                        }

                        return (
                          <article key={notif.id} className={`notif-item ${notif.leida ? '' : 'unread'}`} onClick={() => leer(notif)}>
                            <div className="notif-icon">
                              <i className={`fa-solid ${iconoFinal}`}></i>
                            </div>
                            <div className="notif-content">
                              <p>{notif.mensaje}</p>
                              <span>{notif.hace}</span>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                  </aside>
                )}
              </div>
            )}

            {canShop && (
              <button className="action-btn btn-cart" title="Carrito" onClick={() => navigate('/carrito')}>
                <i className="fa-solid fa-cart-shopping"></i>
                {cartCount > 0 && <span className="badge-counter">{cartCount}</span>}
              </button>
            )}

            {user ? (
              <div className="user-menu-container" ref={userMenuRef}>
                <button className="action-btn user-logged-in" title={user.username} aria-label="Mi cuenta" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}>
                  <i className="fa-regular fa-circle-user"></i>
                </button>

                {isDropdownOpen && (
                  <aside className="user-dropdown">
                    <header className="dropdown-header">
                      <span className="dropdown-email">{user.mail}</span>
                      <span className="dropdown-role">{user.role.toUpperCase()}</span>
                    </header>
                    <ul className="dropdown-list">
                      <li><button onClick={() => handleNavigation('/perfil')}><i className="fa-regular fa-id-badge"></i> Mis Datos</button></li>
                      
                      {canShop && (
                        <li><button onClick={() => handleNavigation('/mis-compras')}><i className="fa-solid fa-bag-shopping"></i> Mis Compras</button></li>
                      )}

                      {user.role === 'admin' && <li><button onClick={() => handleNavigation('/admin')}><i className="fa-solid fa-gear"></i> Gestión General</button></li>}
                      {user.role === 'despachante' && <li><button onClick={() => handleNavigation('/despachante')}><i className="fa-solid fa-truck-fast"></i> Gestión de Envíos</button></li>}
                      {user.role === 'cliente' && (
                        <>
                          <li><button onClick={() => handleNavigation('/vendedor')}><i className="fa-solid fa-tags"></i> Mis Publicaciones</button></li>
                          <li><button onClick={() => handleNavigation('/ofertas')}><i className="fa-solid fa-hand-holding-dollar"></i> Mis Ofertas</button></li>
                          <li><button onClick={() => handleNavigation(`/vendedor/${user.username}`)}><i className="fa-regular fa-address-card"></i> Mi perfil público</button></li>
                        </>
                      )}
                      <li className="logout-item"><button onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</button></li>
                    </ul>
                  </aside>
                )}
              </div>
            ) : (
              <button className="action-login-btn" onClick={() => navigate('/login')}><i className="fa-regular fa-circle-user"></i> <span>Ingresar</span></button>
            )}

            {(!user || canPublish) && (
              <button className="btn-publish" onClick={() => navigate(user ? '/publicar' : '/login')}>
                Publicar Producto
              </button>
            )}
          </nav>
        </div>

        {user?.role !== 'despachante' && (
          <nav className="header-categories-bar">
            <div className="categories-container">
              <div className="categories-list-dynamic">
                
                <span className="cat-title-static">
                  <i className="fa-solid fa-bars"></i> CATEGORÍAS:
                </span>

                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    className={`cat-main-item ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => elegirCategoria(cat.id)}
                  >
                    {cat.nombre}
                  </button>
                ))}

              </div>
            </div>
          </nav>
        )}

        {user?.role !== 'despachante' && enListado && categoriaActiva?.subcategorias.length > 0 && (
          <nav className="header-subcategories-bar">
            <div className="subcategories-container">
              <div className="subcat-label">{categoriaActiva.nombre.toUpperCase()}:</div>
              {categoriaActiva.subcategorias.map(sub => (
                <button key={sub.id} className={`subcat-pill ${selectedSubcategory === sub.id ? 'active-pill' : ''}`} onClick={() => setSelectedSubcategory(selectedSubcategory === sub.id ? '' : sub.id)}>{sub.nombre}</button>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

export default Navigation