import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home  from './views/Home'
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
  
  // NUEVO: Estado para controlar el modal global de avisos
  const [modalMessage, setModalMessage] = useState('')

  // NUEVO: Lógica de protección para favoritos
  const toggleFavorite = (productId) => {
    // Si no hay usuario logueado, mostramos el cartel y cortamos la función
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
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        favoritesCount={favorites.length}
        user={user}
        setUser={setUser}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={
            user?.role === 'despachante' 
              ? <Navigate to="/despachante" /> 
              : <Home searchTerm={searchTerm} selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          <Route path="/product/:id" element={<ProductDetail favorites={favorites} toggleFavorite={toggleFavorite} user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/despachante" element={<DespachantePanel />} />
          <Route path="/vendedor" element={<VendedorPanel />} />
          <Route path="/perfil" element={<MisDatos user={user} />} />
          
          <Route path="/favoritos" element={
            <Favoritos favorites={favorites} toggleFavorite={toggleFavorite} clearFavorites={clearFavorites} />
          } />
        </Routes>
      </main>

      {/* NUEVO: Modal Global que se dibuja por encima de todo si hay un mensaje */}
      {modalMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <i className="fa-solid fa-circle-exclamation modal-icon"></i>
            <p>{modalMessage}</p>
            <button className="modal-btn" onClick={() => setModalMessage('')}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App