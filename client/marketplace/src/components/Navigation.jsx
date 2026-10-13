import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo.png' 
import { getArbolCategorias } from '../api/categorias'
import { contarNoLeidas, getNotificaciones, ICONOS_NOTIFICACION, marcarLeida } from '../api/notificaciones'
import './Navigation.css'

function Navigation({ 
  searchTerm, setSearchTerm, 
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  favoritesCount,
  user, setUser,
  cartCount, openCart
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false)
  const [hoverCat, setHoverCat] = useState(null)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Elegir una categoria (o subcategoria) desde el menu lleva al listado.
  const elegirCategoria = (cat, sub = '') => {
    setSelectedCategory(cat)
    setSelectedSubcategory(sub)
    setIsCatMenuOpen(false)
    navigate('/productos')
  }

  // Accesos rapidos ("Ofertas", "Más vistos"...): listado completo con ese orden.
  const irAlListado = (query) => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    navigate(`/productos${query}`)
  }

  // Al salir App limpia la vista del carrito y la wishlist; lo guardado en el
  // backend no se toca, asi el usuario lo encuentra al volver a entrar.
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

  // Categorias raiz con sus hijas, tal como estan cargadas en el backend.
  const [categorias, setCategorias] = useState([])
  useEffect(() => {
    getArbolCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])
  const categoriaActiva = categorias.find(c => c.id === selectedCategory)
  const categoriaMenu = categorias.find(c => c.id === hoverCat) || categorias[0]
  const enListado = location.pathname === '/productos'
  const canPublish = user && user.role === 'cliente'
  const canShop = user?.role !== 'admin' && user?.role !== 'despachante'
  // Notificaciones del backend: el contador se pide seguido (es liviano) y la
  // lista recien al abrir la campanita.
  const [notifications, setNotifications] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setNoLeidas(0)
      return
    }
    const actualizarContador = () => contarNoLeidas().then(setNoLeidas).catch(() => {})
    actualizarContador()
    const timer = setInterval(actualizarContador, 60000)
    return () => clearInterval(timer)
  }, [user])

  const abrirNotificaciones = () => {
    const abrir = !isNotifOpen
    setIsNotifOpen(abrir)
    setIsDropdownOpen(false)
    if (abrir) getNotificaciones().then(setNotifications).catch(() => setNotifications([]))
  }

  const leer = async (notif) => {
    if (!notif.leida) {
      await marcarLeida(notif.id).catch(() => {})
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n))
      setNoLeidas(prev => Math.max(0, prev - 1))
    }
    if (notif.ruta) {
      setIsNotifOpen(false)
      navigate(notif.ruta)
    }
  }

  const handleMarcarLeidas = async () => {
    const pendientes = notifications.filter(n => !n.leida)
    await Promise.all(pendientes.map(n => marcarLeida(n.id).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
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
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No tenés notificaciones.</div>
                      ) : notifications.map(notif => (
                        <article key={notif.id} className={`notif-item ${notif.leida ? '' : 'unread'}`} onClick={() => leer(notif)}>
                          <div className="notif-icon"><i className={`fa-solid ${ICONOS_NOTIFICACION[notif.tipo] ?? 'fa-circle-info'}`}></i></div>
                          <div className="notif-content"><p>{notif.mensaje}</p><span>{notif.hace}</span></div>
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

            {/* Como en Agrofy: a la vista de todos. Sin sesion lleva al login. */}
            {(!user || canPublish) && (
              <button className="btn-publish" onClick={() => navigate(user ? '/publicar' : '/login')}>
                Publicar gratis
              </button>
            )}
          </nav>
        </div>

        {user?.role !== 'despachante' && (
          <nav className="header-categories-bar">
            <div className="categories-container">
              <div className="categories-list">
                <div className="cat-menu-container" onMouseLeave={() => setIsCatMenuOpen(false)}>
                  <button
                    className={`categories-badge ${isCatMenuOpen ? 'abierto' : ''}`}
                    onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                    aria-expanded={isCatMenuOpen}
                  >
                    Categorías
                  </button>

                  {isCatMenuOpen && categorias.length > 0 && (
                    <div className="cat-dropdown">
                      <ul className="cat-dropdown-raices">
                        {categorias.map(cat => (
                          <li key={cat.id}>
                            <button
                              className={categoriaMenu?.id === cat.id ? 'activa' : ''}
                              onMouseEnter={() => setHoverCat(cat.id)}
                              onClick={() => elegirCategoria(cat.id)}
                            >
                              {cat.nombre}
                              {cat.subcategorias.length > 0 && <i className="fa-solid fa-chevron-right"></i>}
                            </button>
                          </li>
                        ))}
                      </ul>

                      {categoriaMenu && (
                        <div className="cat-dropdown-subs">
                          <button className="cat-dropdown-titulo" onClick={() => elegirCategoria(categoriaMenu.id)}>
                            {categoriaMenu.nombre} <span>Ver todo</span>
                          </button>
                          {categoriaMenu.subcategorias.length > 0 ? (
                            <ul>
                              {categoriaMenu.subcategorias.map(sub => (
                                <li key={sub.id}>
                                  <button onClick={() => elegirCategoria(categoriaMenu.id, sub.id)}>{sub.nombre}</button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="cat-dropdown-vacio">{categoriaMenu.descripcion || 'Sin subcategorías.'}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="categories-separador"></span>

                <button className="category-item" onClick={() => irAlListado('?ofertas=1')}>Ofertas</button>
                <button className="category-item" onClick={() => irAlListado('?orden=vistos')}>Más vistos</button>
                <button className="category-item" onClick={() => irAlListado('?orden=vendidos')}>Más vendidos</button>
              </div>
            </div>
          </nav>
        )}

        {user?.role !== 'despachante' && enListado && categoriaActiva?.subcategorias.length > 0 && (
          <nav className="header-subcategories-bar">
            <div className="subcategories-container">
              <div className="subcat-label"><i className="fa-solid fa-angle-right"></i> {categoriaActiva.nombre.toUpperCase()}:</div>
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