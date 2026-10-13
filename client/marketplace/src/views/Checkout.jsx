import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Checkout.css'

function Checkout({ cart, clearCart, user }) {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Separamos los paquetes:
  const itemsConEnvio = cart.filter(item => item.conEnvio);
  const itemsAcordar = cart.filter(item => !item.conEnvio);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0)

  if (cart.length === 0 && !showSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }}></i>
        <h2 style={{ color: '#111827' }}>No hay nada para pagar</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Tu carrito está vacío.</p>
        <button className="error-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/home')}>Volver al inicio</button>
      </div>
    )
  }

  const handlePay = () => {
    if (itemsConEnvio.length > 0 && address.trim() === '') {
      setErrorModal('Por favor, ingresa una dirección de entrega para los productos que van a domicilio.')
      return
    }
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    clearCart()
    navigate('/mis-compras')
  }

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h2 className="checkout-section-title">Revisa tu compra</h2>

        {/* --- PAQUETE 1: ENVÍO A DOMICILIO --- */}
        {itemsConEnvio.length > 0 && (
          <article className="paquete-card">
            <header className="paquete-header">
              <div className="paquete-icon icon-envio"><i className="fa-solid fa-truck-fast"></i></div>
              <div>
                <h3 className="paquete-title">Envío a Domicilio</h3>
                <p className="paquete-subtitle">Llegará a la dirección que indiques.</p>
              </div>
            </header>
            
            <div className="paquete-items">
              {itemsConEnvio.map((item, index) => (
                <div className="checkout-item" key={`envio-${item.id}-${index}`}>
                  <div>
                    <div className="checkout-item-title">{item.title}</div>
                    <div className="checkout-item-qty">Cantidad: {item.qty}</div>
                  </div>
                  <div className="checkout-item-price">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className="address-input-container">
              <label>¿A dónde enviamos este paquete?</label>
              <input 
                type="text" 
                placeholder="Ej: Av. Corrientes 1234, CABA" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </article>
        )}

        {/* --- PAQUETE 2: ACORDAR CON EL VENDEDOR --- */}
        {itemsAcordar.length > 0 && (
          <article className="paquete-card" style={{ marginTop: itemsConEnvio.length > 0 ? '24px' : '0' }}>
            <header className="paquete-header">
              <div className="paquete-icon icon-acordar"><i className="fa-solid fa-handshake"></i></div>
              <div>
                <h3 className="paquete-title">Acordar con el vendedor</h3>
                <p className="paquete-subtitle">Deberás coordinar el retiro directamente con el dueño.</p>
              </div>
            </header>
            
            <div className="paquete-items">
              {itemsAcordar.map((item, index) => (
                <div className="checkout-item" key={`acordar-${item.id}-${index}`}>
                  <div>
                    <div className="checkout-item-title">{item.title}</div>
                    <div className="checkout-item-qty">Cantidad: {item.qty}</div>
                  </div>
                  <div className="checkout-item-price">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              <i className="fa-solid fa-circle-info"></i> Te daremos los datos del vendedor una vez confirmado el pago.
            </div>
          </article>
        )}
      </div>

      <div className="checkout-right">
        <h3 className="checkout-section-title">Resumen</h3>
        <div className="summary-row">
          <span>Productos ({cart.length})</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        
        {/* MAGIA AQUÍ: El resumen reacciona a los paquetes que tengas */}
        {itemsConEnvio.length > 0 && (
          <div className="summary-row">
            <span>Envío a domicilio</span>
            <span style={{ color: '#6b7280' }}>A calcular</span>
          </div>
        )}

        {itemsAcordar.length > 0 && (
          <div className="summary-row">
            <span>Retiro</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>A acordar</span>
          </div>
        )}

        <div className="summary-total">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>

        <button className="btn-pagar" onClick={handlePay}>
          CONFIRMAR COMPRA
        </button>
      </div>

      {/* --- MODALES --- */}
      {errorModal && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-icon-box"><i className="fa-solid fa-xmark"></i></div>
            <h2 className="error-title">Faltan datos</h2>
            <p className="error-text">{errorModal}</p>
            <button className="error-btn" onClick={() => setErrorModal('')}>Aceptar</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-icon-box" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="error-title">¡Compra Exitosa!</h2>
            <p className="error-text">Tu orden ha sido procesada correctamente.</p>
            <button className="error-btn" style={{ backgroundColor: '#16a34a' }} onClick={handleSuccessClose}>Ir a Mis Compras</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Checkout