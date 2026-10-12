import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Carrito from './components/Carrito'
import { Home } from './views/Home'
import ProductDetail from './views/ProductDetail'
import Login from './views/Login'
import AdminPanel from './views/AdminPanel'
import DespachantePanel from './views/DespachantePanel'
import VendedorPanel from './views/VendedorPanel'
import MisDatos from './views/MisDatos'
import Favoritos from './views/Favoritos'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  
  const [favorites, setFavorites] = useState([])
  const [user, setUser] = useState(null)
  
  // Estado para el modal global
  const [modalMessage, setModalMessage] = useState('')

  // ESTADOS DEL CARRITO
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // LOGICA DEL CARRITO
  const addToCart = (product, qty) => {
    if (!user) {
      setModalMessage("Para comprar, debes iniciar sesión primero.")
      return
    }
    if (user.role === 'admin' || user.role === 'despachante') {
      setModalMessage(`Tu rol de ${user.role} no te permite realizar compras.`)
      return
    }

    setCart(prev => {
      const exist = prev.find(item => item.id === product.id)
      if (exist) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
      }
      return [...prev, { ...product, qty }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id))
  const clearCart = () => setCart([])
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)

  // FAVORITOS
  const toggleFavorite = (productId) => {
    if (!user) {
      setModalMessage("Para agregar productos a tu Lista de Deseos, debes iniciar sesión primero.")
      return
    }
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId))
    } else {
      setFavorites([...favorites, productId])
    }
  }
  const clearFavorites = () => setFavorites([])

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
            user?.role === 'despachante' 
              ? <Navigate to="/despachante" /> 
              : <Home user={user} searchTerm={searchTerm} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          <Route path="/product/:id" element={<ProductDetail favorites={favorites} toggleFavorite={toggleFavorite} user={user} addToCart={addToCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/despachante" element={<DespachantePanel />} />
          <Route path="/vendedor" element={<VendedorPanel />} />
          <Route path="/perfil" element={<MisDatos user={user} />} />
          
          <Route path="/favoritos" element={<Favoritos favorites={favorites} toggleFavorite={toggleFavorite} clearFavorites={clearFavorites} />} />
        </Routes>
      </main>

      <Carrito 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart} 
      />

      {/* MODAL GLOBAL (Estilo apaisado, rojo y con cruz) */}
      {modalMessage && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="modal-content-wide">
            <i className="fa-solid fa-circle-xmark modal-icon-red"></i>
            <p className="modal-text-wide">{modalMessage}</p>
            <button className="modal-btn-red" onClick={() => setModalMessage('')}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App