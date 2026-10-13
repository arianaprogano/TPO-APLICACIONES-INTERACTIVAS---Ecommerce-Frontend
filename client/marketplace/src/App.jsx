import React, { useState, useEffect } from 'react'
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
import MisCompras from './views/MisCompras'
import Checkout from './views/Checkout'

import './App.css'
import './Excepciones.css' 

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  
  const [favorites, setFavorites] = useState([])
  
  const [user, setUser] = useState(() => {
    const usuarioGuardado = localStorage.getItem('agroMarketUser')
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('agroMarketUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('agroMarketUser')
    }
  }, [user])
  
  const [modalMessage, setModalMessage] = useState('')

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (product, qty) => {
    if (!user) {
      setModalMessage("Para comprar, debes iniciar sesión primero.")
      return
    }
    if (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'despachante') {
      setModalMessage(`Tu rol de ${user.role} no te permite realizar compras.`)
      return
    }
    
    const idDelDueño = product.vendedorId || product.sellerId;
    if (user.id == idDelDueño) {
      setModalMessage("No te puedes comprar tu propio producto.");
      return;
    }

    setCart(prev => {
      const exist = prev.find(item => item.id === product.id)
      
      if (exist) {
        const nuevaCantidad = exist.qty + qty;
        if (nuevaCantidad > product.stock) {
          setModalMessage(`No hay suficiente stock. Solo quedan ${product.stock} unidades de este producto.`);
          return prev; 
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: nuevaCantidad } : item)
      }
      
      if (qty > product.stock) {
        setModalMessage(`No hay suficiente stock. Solo quedan ${product.stock} unidades de este producto.`);
        return prev;
      }
      
      return [...prev, { ...product, qty }]
    })
    
    setIsCartOpen(true)
  }

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id))
  const clearCart = () => setCart([])
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)

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
        clearCart={clearCart} clearFavorites={clearFavorites}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route path="/home" element={
            user?.role?.toLowerCase() === 'despachante' 
              ? <Navigate to="/despachante" /> 
              : <Home user={user} searchTerm={searchTerm} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          
          <Route path="/product/:id" element={<ProductDetail favorites={favorites} toggleFavorite={toggleFavorite} user={user} addToCart={addToCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/admin" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'admin' ? <AdminPanel /> : <Navigate to="/home" />
          } />
          
          <Route path="/despachante" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'despachante' ? <DespachantePanel /> : <Navigate to="/home" />
          } />
          
          <Route path="/vendedor" element={
            !user ? <Navigate to="/login" /> : user.role?.toLowerCase() === 'vendedor' ? <VendedorPanel setModalMessage={setModalMessage} /> : <Navigate to="/home" />
          } />
          
          <Route path="/perfil" element={
            user ? <MisDatos user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/favoritos" element={
            user ? <Favoritos favorites={favorites} toggleFavorite={toggleFavorite} clearFavorites={clearFavorites} /> : <Navigate to="/login" />
          } />
          <Route path="/mis-compras" element={
            user ? <MisCompras user={user} setModalMessage={setModalMessage} /> : <Navigate to="/login" />
          } />

          <Route path="/checkout" element={
            user ? <Checkout cart={cart} clearCart={clearCart} user={user} /> : <Navigate to="/login" />
          } />

        </Routes>
      </main>

      <Carrito 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        removeFromCart={removeFromCart} 
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