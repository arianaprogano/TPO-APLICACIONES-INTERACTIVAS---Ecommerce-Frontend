import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login({ setUser }) {
  const navigate = useNavigate()

  const mockUsers = {
    admin: { id: 99, username: 'Administrador', role: 'admin' },
    despachante: { id: 98, username: 'Despachante Central', role: 'despachante' },
    vendedor1: { id: 10, username: 'AgroVentas SA', role: 'vendedor' },
    vendedor2: { id: 11, username: 'Carlos Campo', role: 'vendedor' }
  }

  const handleSimulateLogin = (roleKey) => {
    const selectedUser = mockUsers[roleKey]
    setUser(selectedUser)
    
    // Aquí estaba el error. Ahora redirige a la ruta correcta.
    if (selectedUser.role === 'despachante') {
      navigate('/despachante')
    } else {
      navigate('/home')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <i className="fa-solid fa-leaf login-logo-icon"></i>
          <h2>Iniciar Sesión</h2>
          <p>Selecciona una cuenta de prueba para simular el entorno.</p>
        </div>

        <div className="login-test-buttons">
          <button className="btn-test admin" onClick={() => handleSimulateLogin('admin')}>
            <i className="fa-solid fa-shield-halved"></i> Entrar como Admin
          </button>
          
          <button className="btn-test despachante" onClick={() => handleSimulateLogin('despachante')}>
            <i className="fa-solid fa-truck-fast"></i> Entrar como Despachante
          </button>
          
          <button className="btn-test vendedor" onClick={() => handleSimulateLogin('vendedor1')}>
            <i className="fa-solid fa-store"></i> Entrar como Vendedor 1 (AgroVentas)
          </button>
          
          <button className="btn-test vendedor" onClick={() => handleSimulateLogin('vendedor2')}>
            <i className="fa-solid fa-store"></i> Entrar como Vendedor 2 (Carlos Campo)
          </button>
        </div>

        <button className="btn-login-cancel" onClick={() => navigate('/home')}>
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

export default Login