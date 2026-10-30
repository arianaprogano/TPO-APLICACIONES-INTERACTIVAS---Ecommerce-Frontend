import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Importación de Vistas
import Navigation from './components/Navigation'
import Catalogo from './views/Catalogo' // <-- Importación actualizada
import Inicio from './views/Inicio'
import Login from './views/Login'
import MisDatos from './views/MisDatos'
import CarritoPage from './views/CarritoPage'
import Checkout from './views/Checkout'
import ProductDetail from './views/ProductDetail'
import Favoritos from './views/Favoritos'
import AdminPanel from './views/AdminPanel'
import VendedorPanel from './views/VendedorPanel'
import MisCompras from './views/MisCompras'
import MisOfertas from './views/MisOfertas'
import DespachantePanel from './views/DespachantePanel'
import PerfilVendedor from './views/PerfilVendedor'
import DetalleOrden from './views/DetalleOrden'
import PublicarProducto from './views/PublicarProducto'

function App() {
  // Persistencia de sesión con localStorage
  const [user, setUser] = useState(() => {
    try {
      const usuarioGuardado = localStorage.getItem('agroUser')
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
    } catch (error) {
      return null
    }
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')

  useEffect(() => {
    if (user) {
      localStorage.setItem('agroUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('agroUser')
    }
  }, [user])

  return (
    <>
      <Navigation 
        user={user} 
        setUser={setUser}
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory} 
        setSelectedSubcategory={setSelectedSubcategory}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/home" element={
          <Inicio 
            user={user} 
            setSearchTerm={setSearchTerm}
            setSelectedCategory={setSelectedCategory}
            setSelectedSubcategory={setSelectedSubcategory}
          />
        } />
        
        <Route path="/productos" element={
          <Catalogo 
            user={user}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        } />

        <Route path="/product/:id" element={<ProductDetail user={user} />} />
        <Route path="/vendedor/:nombreUsuario" element={<PerfilVendedor user={user} />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/checkout" element={<Checkout user={user} />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/perfil" element={<MisDatos user={user} setUser={setUser} />} />
        <Route path="/mis-compras" element={<MisCompras user={user} />} />
        <Route path="/orden/:id" element={<DetalleOrden user={user} />} />
        <Route path="/ofertas" element={<MisOfertas user={user} />} />
        <Route path="/admin" element={<AdminPanel user={user} />} />
        <Route path="/vendedor" element={<VendedorPanel user={user} />} />
        <Route path="/despachante" element={<DespachantePanel />} />
        <Route path="/publicar" element={<PublicarProducto />} />
      </Routes>
    </>
  )
}

export default App