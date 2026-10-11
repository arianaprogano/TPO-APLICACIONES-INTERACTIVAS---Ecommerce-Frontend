import React, { useState } from 'react'
import './Carrito.css'

export default function Carrito({ isOpen, onClose, cart, removeFromCart, clearCart }) {
  const [shippingMethod, setShippingMethod] = useState('envio')
  const [showEmptyError, setShowEmptyError] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0)

  const handleCheckout = () => {
    if (cart.length === 0) {
      setShowEmptyError(true)
      return
    }
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
      
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        
        <header className="cart-header">
          <div className="cart-title">
            <i className="fa-solid fa-basket-shopping"></i> Carrito
          </div>
          <button className="cart-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </header>

        <section className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart-msg">Tu carrito está vacío.</div>
          ) : (
            cart.map((item, index) => (
              <article className="cart-item" key={index}>
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-price">{formatMoney(item.price)} x {item.qty}</div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </article>
            ))
          )}
        </section>

        <footer className="cart-footer">
          <fieldset className="shipping-section" style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
            <legend className="shipping-title">MÉTODO DE ENTREGA</legend>
            <label className="shipping-option">
              <input type="radio" name="shipping" checked={shippingMethod === 'envio'} onChange={() => setShippingMethod('envio')} />
              <span>Envío a domicilio</span>
            </label>
            <label className="shipping-option">
              <input type="radio" name="shipping" checked={shippingMethod === 'acordar'} onChange={() => setShippingMethod('acordar')} />
              <span>Acordar con vendedor</span>
            </label>
          </fieldset>

          <div className="cart-total-row">
            <span className="cart-total-label">TOTAL:</span>
            <span className="cart-total-value">{formatMoney(total)}</span>
          </div>

          <button className="btn-confirm-purchase" onClick={handleCheckout}>
            CONFIRMAR COMPRA
          </button>
        </footer>
      </aside>

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