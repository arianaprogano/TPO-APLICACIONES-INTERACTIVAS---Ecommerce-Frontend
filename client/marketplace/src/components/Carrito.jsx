import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Carrito.css'

function Carrito({ isOpen, onClose, cart, removeFromCart, updateCartQty, clearCart }) {
  const navigate = useNavigate();
  const [showEmptyError, setShowEmptyError] = useState(false)

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

  const handleGoToCheckout = () => {
    if (cart.length === 0) {
      setShowEmptyError(true)
      return
    }
    onClose()
    navigate('/checkout')
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
            cart.map((item) => (
              <article className="cart-item" key={item.idItem}>
                {item.image ? (
                  <img className="cart-item-foto" src={item.image} alt={item.title} />
                ) : (
                  <div className="cart-item-foto cart-item-sin-foto"><i className="fa-regular fa-image"></i></div>
                )}
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-price">{formatMoney(item.price)}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateCartQty(item.id, item.qty - 1)} aria-label="Quitar uno">-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)} aria-label="Agregar uno">+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </article>
            ))
          )}
        </section>

        <footer className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">TOTAL:</span>
            <span className="cart-total-value">{formatMoney(total)}</span>
          </div>

          <button className="btn-confirm-purchase" onClick={handleGoToCheckout}>
            CONTINUAR COMPRA
          </button>

          {cart.length > 0 && (
            <button className="btn-vaciar-carrito" onClick={clearCart}>
              <i className="fa-regular fa-trash-can"></i> Vaciar carrito
            </button>
          )}
        </footer>
      </aside>

      {showEmptyError && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="modal-content-wide">
            <div className="error-icon-circle-wrapper">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <h3 className="modal-title-wide">Carrito Vacío</h3>
            <p className="modal-text-wide">Agrega productos antes de continuar al pago.</p>
            <button className="modal-btn-red" onClick={() => setShowEmptyError(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Carrito