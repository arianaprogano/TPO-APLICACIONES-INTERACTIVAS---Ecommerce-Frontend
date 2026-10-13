import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Checkout.css'

function Checkout({ cart, clearCart, user }) {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)

  // Agrupamos por Vendedor Y por Tipo de Envío
  const agruparPaquetes = () => {
    const paquetesObj = {};
    
    cart.forEach(item => {
      const vId = item.vendedorId || item.sellerId || 'Desconocido';
      const tipo = item.conEnvio ? 'envio' : 'retiro';
      const clave = `${vId}-${tipo}`;
      
      if (!paquetesObj[clave]) {
        paquetesObj[clave] = {
          vendedorId: vId,
          tipo: tipo,
          items: []
        };
      }
      paquetesObj[clave].items.push(item);
    });

    return Object.values(paquetesObj);
  }

  const paquetes = agruparPaquetes();
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

        {/* RECORREMOS LOS PAQUETES DINÁMICAMENTE */}
        {paquetes.map((paquete, index) => {
          const numPaquete = index + 1;
          const esEnvio = paquete.tipo === 'envio';

          return (
            <article className="paquete-card" key={index} style={{ marginTop: index > 0 ? '24px' : '0' }}>
              <header className="paquete-header">
                {esEnvio ? (
                  <div className="paquete-icon icon-envio"><i className="fa-solid fa-box"></i></div>
                ) : (
                  <div className="paquete-icon icon-acordar" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    <i className="fa-solid fa-shop"></i>
                  </div>
                )}
                
                <div>
                  <h3 className="paquete-title">Paquete {numPaquete} <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal' }}>- Vendedor #{paquete.vendedorId}</span></h3>
                  
                  {esEnvio ? (
                    <>
                      <p className="paquete-subtitle" style={{ color: '#3b82f6', fontWeight: 'bold', marginTop: '2px' }}>
                        Envío a acordar con el vendedor
                      </p>
                      <p className="paquete-subtitle" style={{ fontSize: '12px', marginTop: '2px' }}>
                        Coordinarás el flete o entrega con el dueño.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="paquete-subtitle" style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>
                        Retiro en el domicilio del vendedor
                      </p>
                      <p className="paquete-subtitle" style={{ fontSize: '12px', marginTop: '2px' }}>
                        Deberás buscar estos productos directamente en la ubicación del vendedor.
                      </p>
                    </>
                  )}
                </div>
              </header>
              
              <div className="paquete-items">
                {paquete.items.map((item, i) => (
                  <div className="checkout-item" key={i}>
                    <div>
                      <div className="checkout-item-title">{item.title}</div>
                      <div className="checkout-item-qty">Cantidad: {item.qty}</div>
                    </div>
                    <div className="checkout-item-price">{formatMoney(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: esEnvio ? '#eff6ff' : '#fef3c7', color: esEnvio ? '#1e3a8a' : '#92400e', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                {esEnvio ? (
                  <><i className="fa-solid fa-circle-info"></i> Te enviaremos los datos de contacto tras confirmar el pago.</>
                ) : (
                  <><i className="fa-solid fa-location-dot"></i> Obtendrás la dirección exacta al finalizar la compra.</>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="checkout-right">
        <h3 className="checkout-section-title">Resumen</h3>
        <div className="summary-row">
          <span>Productos ({cart.length})</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        
        {/* Resumen dinámico de paquetes */}
        {paquetes.map((paquete, index) => (
          <div className="summary-row" key={index}>
            <span>{paquete.tipo === 'envio' ? 'Envío' : 'Retiro'} (Paq. {index + 1})</span>
            <span style={{ color: paquete.tipo === 'envio' ? '#3b82f6' : '#16a34a', fontWeight: '600' }}>
              {paquete.tipo === 'envio' ? 'A acordar' : 'En persona'}
            </span>
          </div>
        ))}

        <div className="summary-total">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>

        <button className="btn-pagar" onClick={handlePay}>
          CONFIRMAR COMPRA
        </button>
      </div>

      {showSuccess && (
        <div className="modal-overlay" style={{ zIndex: 12000 }}>
          <div className="modal-content-wide">
            <div className="success-icon-circle-wrapper">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="modal-title-wide">¡Compra Exitosa!</h3>
            <p className="modal-text-wide">Tu orden ha sido procesada. Ya puedes contactar a los vendedores.</p>
            <button type="button" className="modal-btn-green" onClick={handleSuccessClose}>
              IR A MIS COMPRAS
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Checkout