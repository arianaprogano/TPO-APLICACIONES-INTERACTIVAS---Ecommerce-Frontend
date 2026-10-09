import React, { useState } from 'react'
import './Carrito.css'

export default function Carrito({ isOpen, onClose, cart, removeFromCart, clearCart }) {
  const [shippingMethod, setShippingMethod] = useState('envio')
  const [showEmptyError, setShowEmptyError] = useState(false)
  
  // NUEVO: Estado para mostrar el modal de éxito en lugar del alert()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0)

  const handleCheckout = () => {
    if (cart.length === 0) {
      setShowEmptyError(true)
      return
    }
    
    // Mostramos nuestro modal de éxito personalizado
    setShowSuccessModal(true)
  }

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false)
    clearCart()
    onClose()
  }

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            <i className="fa-solid fa-basket-shopping"></i> Carrito
          </div>
          <button className="cart-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart-msg">Tu carrito está vacío.</div>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={index}>
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-price">{formatMoney(item.price)} x {item.qty}</div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="shipping-section">
            <label className="shipping-title">MÉTODO DE ENTREGA</label>
            <label className="shipping-option">
              <input type="radio" name="shipping" checked={shippingMethod === 'envio'} onChange={() => setShippingMethod('envio')} />
              <span>Envío a domicilio</span>
            </label>
            <label className="shipping-option">
              <input type="radio" name="shipping" checked={shippingMethod === 'acordar'} onChange={() => setShippingMethod('acordar')} />
              <span>Acordar con vendedor</span>
            </label>
          </div>

          <div className="cart-total-row">
            <span className="cart-total-label">TOTAL:</span>
            <span className="cart-total-value">{formatMoney(total)}</span>
          </div>

          <button className="btn-confirm-purchase" onClick={handleCheckout}>
            CONFIRMAR COMPRA
          </button>
        </div>
      </div>

      {/* MODAL DE ERROR (Carrito Vacío) */}
      {showEmptyError && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="modal-content-wide">
            <div className="error-icon-circle-wrapper">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <h3 className="modal-title-wide">Carrito Vacío</h3>
            <p className="modal-text-wide">No puedes confirmar la compra porque el carrito está vacío. Agrega productos antes de continuar.</p>
            <button className="modal-btn-red" onClick={() => setShowEmptyError(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO (Compra Confirmada con Tick Verde) */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="modal-content-wide">
            <div className="success-icon-circle-wrapper">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="modal-title-wide">¡Compra Exitosa!</h3>
            <p className="modal-text-wide">¡Compra confirmada con éxito! La orden ha sido procesada.</p>
            <button className="modal-btn-green" onClick={handleConfirmSuccess}>
              ACEPTAR
            </button>
          </div>
        </div>
      )}
    </>
  )
}