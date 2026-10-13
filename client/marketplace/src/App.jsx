import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Carrito from './components/Carrito'
import { Home } from './views/Home'
import Inicio from './views/Inicio'
import ProductDetail from './views/ProductDetail'
import Login from './views/Login'
import AdminPanel from './views/AdminPanel'
import DespachantePanel from './views/DespachantePanel'
import VendedorPanel from './views/VendedorPanel'
import MisDatos from './views/MisDatos'
import Favoritos from './views/Favoritos'
import MisCompras from './views/MisCompras'
import Checkout from './views/Checkout'
import PublicarProducto from './views/PublicarProducto'
import PerfilVendedor from './views/PerfilVendedor'
import MisOfertas from './views/MisOfertas'
import DetalleOrden from './views/DetalleOrden'
import { configurarSesionVencida, getToken } from './api/client'
import { getUsuarioActual, logout } from './api/auth'
import { agregarAlCarrito, cambiarCantidad, getCarrito, quitarDelCarrito, vaciarCarrito } from './api/carrito'
import { agregarAWishlist, getWishlist, quitarDeWishlist, vaciarWishlist } from './api/wishlist'

import './App.css'
import './Excepciones.css' 

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  
  // Lista de deseos tal como la devuelve el backend. favorites son solo los
  // ids de producto, que es lo que necesitan las tarjetas para el corazon.
  const [wishlist, setWishlist] = useState([])
  const favorites = wishlist.map(item => item.id)
  
  // El usuario se guarda para que un F5 no muestre la pantalla deslogueada
  // mientras se valida el token; el que manda es el token.
  const [user, setUser] = useState(() => {
    const usuarioGuardado = localStorage.getItem('agroMarketUser')
    return usuarioGuardado && getToken() ? JSON.parse(usuarioGuardado) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('agroMarketUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('agroMarketUser')
      logout()
    }
  }, [user])

  // Al abrir la app se confirma el token contra el backend y se refrescan los
  // datos del usuario. Si el token vencio, el cliente avisa y se cierra sesion.
  useEffect(() => {
    configurarSesionVencida(() => {
      setUser(null)
      setModalMessage('Tu sesión venció. Volvé a iniciar sesión.')
    })
    if (getToken()) {
      getUsuarioActual().then(setUser).catch(() => {})
    }
  }, [])
  
  const [modalMessage, setModalMessage] = useState('')

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Solo los clientes tienen carrito y lista de deseos: el backend les da 403
  // a admin y despachante.
  const puedeComprar = user?.role === 'cliente'

  // Al entrar se traen el carrito y la wishlist guardados; al salir solo se
  // limpia la vista, lo guardado en el servidor queda para la proxima vez.
  useEffect(() => {
    if (!puedeComprar) {
      setCart([])
      setWishlist([])
      return
    }
    getCarrito().then(c => setCart(c.items)).catch(() => setCart([]))
    getWishlist().then(setWishlist).catch(() => setWishlist([]))
  }, [user?.id, puedeComprar])

  const addToCart = async (product, qty) => {
    if (!user) {
      setModalMessage("Para comprar, debes iniciar sesión primero.")
      return
    }
    if (!puedeComprar) {
      setModalMessage(`Tu rol de ${user.role} no te permite realizar compras.`)
      return
    }
    // Stock, producto propio y publicacion activa los valida el backend, con
    // el mensaje que corresponde a cada caso.
    try {
      const carrito = await agregarAlCarrito(product.id, qty)
      setCart(carrito.items)
      setIsCartOpen(true)
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  // Envuelve cada operacion del carrito: actualiza con lo que devuelve el
  // backend o muestra su error.
  const operarCarrito = async (operacion) => {
    try {
      const carrito = await operacion()
      setCart(carrito.items)
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id)
    if (item) operarCarrito(() => quitarDelCarrito(item.idItem))
  }
  const updateCartQty = (id, qty) => {
    const item = cart.find(i => i.id === id)
    if (!item) return
    operarCarrito(() => qty < 1 ? quitarDelCarrito(item.idItem) : cambiarCantidad(item.idItem, qty))
  }
  const clearCart = () => operarCarrito(vaciarCarrito)
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)

  const toggleFavorite = async (productId) => {
    if (!user) {
      setModalMessage("Para agregar productos a tu Lista de Deseos, debes iniciar sesión primero.")
      return
    }
    if (!puedeComprar) {
      setModalMessage(`Tu rol de ${user.role} no tiene Lista de Deseos.`)
      return
    }
    const item = wishlist.find(i => i.id === productId)
    try {
      setWishlist(item ? await quitarDeWishlist(item.idItem) : await agregarAWishlist(productId))
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  const clearFavorites = async () => {
    try {
      setWishlist(await vaciarWishlist())
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  return (
    <div className="app-container">
      <Navigation 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
        favoritesCount={favorites.length}
        user={user} setUser={setUser}
        cartCount={cartCount} openCart={() => setIsCartOpen(true)}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route path="/home" element={
            user?.role?.toLowerCase() === 'despachante' 
              ? <Navigate to="/despachante" /> 
              : <Inicio user={user} favorites={favorites} toggleFavorite={toggleFavorite} setSelectedCategory={setSelectedCategory} setSelectedSubcategory={setSelectedSubcategory} setSearchTerm={setSearchTerm} />
          } />

          <Route path="/productos" element={
            user?.role?.toLowerCase() === 'despachante' 
              ? <Navigate to="/despachante" /> 
              : <Home user={user} searchTerm={searchTerm} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          
          <Route path="/product/:id" element={<ProductDetail favorites={favorites} toggleFavorite={toggleFavorite} user={user} addToCart={addToCart} setModalMessage={setModalMessage} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/admin" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'admin' ? <AdminPanel user={user} setModalMessage={setModalMessage} /> : <Navigate to="/home" />
          } />
          
          <Route path="/despachante" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'despachante' ? <DespachantePanel setModalMessage={setModalMessage} /> : <Navigate to="/home" />
          } />
          
          <Route path="/vendedor" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'cliente' ? <VendedorPanel setModalMessage={setModalMessage} /> : <Navigate to="/home" />
          } />

          <Route path="/vendedor/:nombreUsuario" element={
            <PerfilVendedor user={user} favorites={favorites} toggleFavorite={toggleFavorite} />
          } />

          <Route path="/ofertas" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'cliente' ? <MisOfertas user={user} setModalMessage={setModalMessage} /> : <Navigate to="/home" />
          } />

          <Route path="/orden/:id" element={
            user ? <DetalleOrden user={user} /> : <Navigate to="/login" />
          } />

          <Route path="/publicar" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'cliente' ? <PublicarProducto /> : <Navigate to="/home" />
          } />
          
          <Route path="/perfil" element={
            user ? <MisDatos user={user} setUser={setUser} /> : <Navigate to="/login" />
          } />
          <Route path="/favoritos" element={
            user ? <Favoritos wishlist={wishlist} user={user} toggleFavorite={toggleFavorite} clearFavorites={clearFavorites} /> : <Navigate to="/login" />
          } />
          <Route path="/mis-compras" element={
            user ? <MisCompras user={user} setModalMessage={setModalMessage} /> : <Navigate to="/login" />
          } />

          <Route path="/checkout" element={
            user ? <Checkout cart={cart} onCompraRealizada={() => setCart([])} user={user} /> : <Navigate to="/login" />
          } />

        </Routes>
      </main>

      <Carrito 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        removeFromCart={removeFromCart}
        updateCartQty={updateCartQty}
        clearCart={clearCart}
      />

      {modalMessage && typeof modalMessage === 'string' && modalMessage.trim() !== '' && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-icon-box">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <h2 className="error-title">Error</h2>
            <p className="error-text">{modalMessage}</p>
            <button className="error-btn" onClick={() => setModalMessage('')}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App