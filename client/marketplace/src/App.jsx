import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import { useAvisos } from './components/avisosContext'
import Home  from './views/Home'
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
import CarritoPage from './views/CarritoPage'
import { configurarSesionVencida, getToken } from './api/client'
import { getUsuarioActual, logout } from './api/auth'
import { agregarAlCarrito, cambiarCantidad, getCarrito, quitarDelCarrito, vaciarCarrito } from './api/carrito'
import { agregarAWishlist, getWishlist, quitarDeWishlist, vaciarWishlist } from './api/wishlist'

import './App.css'
import './Excepciones.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const avisos = useAvisos()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')


  const [conditions, setConditions] = useState([])
  const [provincia, setProvincia] = useState('')
  const [rango, setRango] = useState({ precioMin: '', precioMax: '', anioDesde: '', anioHasta: '' })
  const [soloConEnvio, setSoloConEnvio] = useState(false)
  const [soloSinEnvio, setSoloSinEnvio] = useState(false)
  const [soloOfertas, setSoloOfertas] = useState(false)

  const [wishlist, setWishlist] = useState([])
  const favorites = wishlist.map(item => item.id)

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

  const [usuarioAnterior, setUsuarioAnterior] = useState(user)

  useEffect(() => {
    // Si la memoria dice que ANTES había un usuario y AHORA es null -> Cerró sesión.
    if (usuarioAnterior && !user) {
      setConditions([])
      setProvincia('')
      setRango({ precioMin: '', precioMax: '', anioDesde: '', anioHasta: '' })
      setSoloConEnvio(false)
      setSoloSinEnvio(false)
      setSoloOfertas(false)
    }
    // Actualizamos la memoria para el próximo cambio de estado
    setUsuarioAnterior(user)
  }, [user, usuarioAnterior])

  useEffect(() => {
    configurarSesionVencida(() => {
      setUser(null)
      avisos.error('Tu sesión venció. Volvé a iniciar sesión.', 'Sesión vencida')
    })
    if (getToken()) {
      getUsuarioActual().then(setUser).catch(() => {})
    }
  }, [])

  const [cart, setCart] = useState([])

  const puedeComprar = user?.role === 'cliente'

  useEffect(() => {
    if (!puedeComprar) {
      setCart([])
      setWishlist([])
      return
    }
    getCarrito().then(c => setCart(c.items)).catch(() => setCart([]))
    getWishlist().then(setWishlist).catch(() => setWishlist([]))
  }, [user?.id, puedeComprar])

  const pedirLogin = (motivo) =>
    navigate('/login', { state: { desde: location.pathname + location.search, motivo } })

  const addToCart = async (product, qty) => {
    if (!user) return pedirLogin('Iniciá sesión para agregar productos al carrito.')
    if (!puedeComprar) return avisos.error(`Tu rol de ${user.role} no te permite realizar compras.`)
    try {
      const carrito = await agregarAlCarrito(product.id, qty)
      setCart(carrito.items)
      avisos.toast(`${product.title} se agregó al carrito`, { texto: 'Ver carrito', ruta: '/carrito' })
    } catch (err) {
      avisos.error(err.message)
    }
  }

  const operarCarrito = async (operacion) => {
    try {
      const carrito = await operacion()
      setCart(carrito.items)
    } catch (err) {
      avisos.error(err.message)
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
    if (!user) return pedirLogin('Iniciá sesión para guardar productos en tu Lista de Deseos.')
    if (!puedeComprar) return avisos.error(`Tu rol de ${user.role} no tiene Lista de Deseos.`)
    const item = wishlist.find(i => i.id === productId)
    try {
      setWishlist(item ? await quitarDeWishlist(item.idItem) : await agregarAWishlist(productId))
      if (!item) avisos.toast('Guardado en tu Lista de Deseos', { texto: 'Ver lista', ruta: '/favoritos' })
    } catch (err) {
      avisos.error(err.message)
    }
  }

  const clearFavorites = async () => {
    try {
      setWishlist(await vaciarWishlist())
    } catch (err) {
      avisos.error(err.message)
    }
  }

  const soloCliente = (elemento) =>
    !user ? <Navigate to="/login" state={{ desde: location.pathname }} /> : user.role === 'cliente' ? elemento : <Navigate to="/home" />

  return (
    <div className="app-container">
      <Navigation
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
        favoritesCount={favorites.length}
        user={user} setUser={setUser}
        cartCount={cartCount} openCart={() => navigate('/carrito')}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />

          <Route path="/home" element={
            user?.role === 'despachante'
              ? <Navigate to="/despachante" />
              : <Inicio user={user} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} setSelectedCategory={setSelectedCategory} setSelectedSubcategory={setSelectedSubcategory} setSearchTerm={setSearchTerm} />
          } />

          <Route path="/productos" element={
            user?.role === 'despachante'
              ? <Navigate to="/despachante" />
              : <Home 
                  user={user} searchTerm={searchTerm} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} 
                  favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart}
                  conditions={conditions} setConditions={setConditions}
                  provincia={provincia} setProvincia={setProvincia}
                  rango={rango} setRango={setRango}
                  soloConEnvio={soloConEnvio} setSoloConEnvio={setSoloConEnvio}
                  soloSinEnvio={soloSinEnvio} setSoloSinEnvio={setSoloSinEnvio}
                  soloOfertas={soloOfertas} setSoloOfertas={setSoloOfertas}
                />
          } />

          <Route path="/product/:id" element={<ProductDetail favorites={favorites} toggleFavorite={toggleFavorite} user={user} addToCart={addToCart} pedirLogin={pedirLogin} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/admin" element={
            !user ? <Navigate to="/login" /> : user.role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/home" />
          } />

          <Route path="/despachante" element={
            !user ? <Navigate to="/login" /> : user.role === 'despachante' ? <DespachantePanel /> : <Navigate to="/home" />
          } />

          <Route path="/vendedor" element={soloCliente(<VendedorPanel />)} />

          <Route path="/vendedor/:nombreUsuario" element={
            <PerfilVendedor user={user} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />
          } />

          <Route path="/ofertas" element={soloCliente(<MisOfertas user={user} />)} />

          <Route path="/orden/:id" element={
            user ? <DetalleOrden user={user} /> : <Navigate to="/login" state={{ desde: location.pathname }} />
          } />

          <Route path="/publicar" element={soloCliente(<PublicarProducto />)} />

          <Route path="/perfil" element={
            user ? <MisDatos user={user} setUser={setUser} /> : <Navigate to="/login" />
          } />
          <Route path="/favoritos" element={
            user ? <Favoritos wishlist={wishlist} user={user} toggleFavorite={toggleFavorite} clearFavorites={clearFavorites} addToCart={addToCart} /> : <Navigate to="/login" state={{ desde: '/favoritos' }} />
          } />
          <Route path="/mis-compras" element={soloCliente(<MisCompras user={user} />)} />

          <Route path="/carrito" element={soloCliente(
            <CarritoPage cart={cart} removeFromCart={removeFromCart} updateCartQty={updateCartQty} clearCart={clearCart} />
          )} />

          <Route path="/checkout" element={soloCliente(
            <Checkout cart={cart} onCompraRealizada={() => setCart([])} user={user} />
          )} />
        </Routes>
      </main>
    </div>
  )
}

export default App