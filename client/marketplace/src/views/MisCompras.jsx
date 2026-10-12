import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reviews from '../components/Reviews'
import './PanelStyles.css' 

function MisCompras({ user, setModalMessage }) {
  const navigate = useNavigate()
  
  const [productoAReseñar, setProductoAReseñar] = useState(null)

  const [compras, setCompras] = useState([
    {
      id: "ORD-1045",
      fecha: "10/10/2026",
      productoId: 1,
      productoTitulo: "Tractor John Deere 7320",
      precio: 85000,
      estado: "Entregado",
      reseñado: false 
    },
    {
      id: "ORD-1042",
      fecha: "05/10/2026",
      productoId: 2,
      productoTitulo: "Semillas de Maíz Híbrido (Bolsa 80k)",
      precio: 65,
      estado: "Entregado",
      reseñado: true 
    },
    {
      id: "ORD-1048",
      fecha: "11/10/2026",
      productoId: 3,
      productoTitulo: "Cosechadora Agrícola Valtra",
      precio: 120000,
      estado: "En camino",
      reseñado: false
    }
  ])

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Debes iniciar sesión para ver tus compras.</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ir a Iniciar Sesión
        </button>
      </div>
    )
  }

  const handleReviewSaved = (ordenId, reseñaData) => {
    setProductoAReseñar(null)
    
    setCompras(prevCompras => 
      prevCompras.map(compra => 
        compra.id === ordenId ? { ...compra, reseñado: true } : compra
      )
    )

    if(setModalMessage) {
        setModalMessage("¡Gracias por tu opinión! Tu reseña ha sido guardada con éxito.");
    } else {
        alert("¡Reseña guardada con éxito!");
    }
  }

  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount)

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className="active">Mis Compras Realizadas</button>
      </nav>

      <main className="panel-content" style={{ minHeight: '400px', width: '100%' }}>
        <table className="panel-table">
          <thead>
            <tr>
              <th>FECHA / ORDEN</th>
              <th>PRODUCTO</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">No has realizado ninguna compra aún.</td>
              </tr>
            ) : (
              compras.map(compra => (
                <tr key={compra.id}>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{compra.fecha}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>#{compra.id}</div>
                  </td>
                  <td>
                    <strong style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate(`/product/${compra.productoId}`)}>
                      {compra.productoTitulo}
                    </strong>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>{formatMoney(compra.precio)}</div>
                  </td>
                  <td>
                    {compra.estado === 'Entregado' ? (
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}><i className="fa-solid fa-check"></i> {compra.estado}</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}><i className="fa-solid fa-truck"></i> {compra.estado}</span>
                    )}
                  </td>
                  <td className="text-right">
                    
                    {compra.estado === 'Entregado' && !compra.reseñado && (
                      <button 
                        onClick={() => setProductoAReseñar(compra)}
                        style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Dejar Opinión
                      </button>
                    )}

                    {compra.estado === 'Entregado' && compra.reseñado && (
                      <span style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>
                        Ya opinaste
                      </span>
                    )}

                    {compra.estado === 'En camino' && (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                        Esperando entrega...
                      </span>
                    )}
                    
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      {productoAReseñar && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <Reviews
            orden={productoAReseñar}
            onClose={() => setProductoAReseñar(null)}
            onSave={handleReviewSaved}
          />
        </div>
      )}
    </div>
  )
}

export default MisCompras