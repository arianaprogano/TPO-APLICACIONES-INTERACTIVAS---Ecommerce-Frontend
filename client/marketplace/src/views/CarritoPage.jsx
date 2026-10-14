import { useNavigate } from 'react-router-dom'
import { useAvisos } from '../components/avisosContext'
import './CarritoPage.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

// Carrito en pagina completa: los productos a la izquierda y el resumen a la
// derecha. El contenido vive en el backend (GET /carrito) y App lo mantiene.
function CarritoPage({ cart, removeFromCart, updateCartQty, clearCart }) {
  const navigate = useNavigate()
  const { confirmar } = useAvisos()

  const unidades = cart.reduce((acc, item) => acc + item.qty, 0)
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const ahorro = cart.reduce((acc, item) => acc + (item.enOferta ? (item.precioOriginal - item.price) * item.qty : 0), 0)
  const conEnvio = cart.filter(i => i.conEnvio).length
  const aCoordinar = cart.length - conEnvio

  const vaciar = async () => {
    if (await confirmar({ titulo: '¿Vaciar el carrito?', texto: 'Se quitan todos los productos.', ok: 'Vaciar', peligro: true }))
      clearCart()
  }

  if (cart.length === 0) {
    return (
      <div className="carrito-pagina">
        <div className="carrito-vacio">
          <i className="fa-solid fa-cart-shopping"></i>
          <h2>Tu carrito está vacío</h2>
          <p>Sumá productos desde el catálogo y van a aparecer acá.</p>
          <button className="carrito-btn-principal" onClick={() => navigate('/productos')}>Ver productos</button>
        </div>
      </div>
    )
  }

  return (
    <div className="carrito-pagina">
      <h1 className="carrito-titulo">Carrito <span>({unidades} {unidades === 1 ? 'producto' : 'productos'})</span></h1>

      <div className="carrito-layout">
        <section className="carrito-items">
          {cart.map(item => (
            <article key={item.idItem} className="carrito-item">
              <button className="carrito-item-foto" onClick={() => navigate(`/product/${item.id}`)} aria-label={`Ver ${item.title}`}>
                {item.image ? <img src={item.image} alt="" /> : <i className="fa-regular fa-image"></i>}
              </button>

              <div className="carrito-item-info">
                <button className="carrito-item-titulo" onClick={() => navigate(`/product/${item.id}`)}>{item.title}</button>
                <div className="carrito-item-meta">
                  {item.condition}{item.location && <> · <i className="fa-solid fa-location-dot"></i> {item.location}</>}
                </div>
                {item.conEnvio
                  ? <span className="carrito-envio con"><i className="fa-solid fa-truck-fast"></i> Con envío a domicilio</span>
                  : <span className="carrito-envio sin"><i className="fa-solid fa-handshake"></i> Entrega a coordinar con el vendedor</span>}
                <button className="carrito-item-quitar" onClick={() => removeFromCart(item.id)}>Eliminar</button>
              </div>

              <div className="carrito-item-cantidad">
                <button onClick={() => updateCartQty(item.id, item.qty - 1)} aria-label="Quitar uno">−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateCartQty(item.id, item.qty + 1)} aria-label="Agregar uno">+</button>
              </div>

              <div className="carrito-item-precio">
                {item.enOferta && <span className="carrito-precio-tachado">{formatMoney(item.precioOriginal * item.qty)}</span>}
                <strong>{formatMoney(item.price * item.qty)}</strong>
                {item.qty > 1 && <small>{formatMoney(item.price)} c/u</small>}
              </div>
            </article>
          ))}

          <button className="carrito-vaciar" onClick={vaciar}><i className="fa-regular fa-trash-can"></i> Vaciar carrito</button>
        </section>

        <aside className="carrito-resumen">
          <h2>Resumen de compra</h2>
          <div className="carrito-resumen-fila"><span>Productos ({unidades})</span><span>{formatMoney(total + ahorro)}</span></div>
          {ahorro > 0 && <div className="carrito-resumen-fila ahorro"><span>Descuentos</span><span>− {formatMoney(ahorro)}</span></div>}
          <div className="carrito-resumen-fila">
            <span>Entrega</span>
            <span className="carrito-resumen-entrega">
              {conEnvio > 0 && <span>{conEnvio} con envío</span>}
              {aCoordinar > 0 && <span>{aCoordinar} a coordinar</span>}
            </span>
          </div>
          <div className="carrito-resumen-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
          <button className="carrito-btn-principal" onClick={() => navigate('/checkout')}>Continuar compra</button>
          <button className="carrito-btn-secundario" onClick={() => navigate('/productos')}>Seguir comprando</button>
        </aside>
      </div>
    </div>
  )
}

export default CarritoPage
