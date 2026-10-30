import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { agregarItem } from '../redux/slice/carritoSlice'
import { agregarFavorito, quitarFavorito } from '../redux/slice/wishlistSlice'
import { bajaProductoAdmin } from '../redux/slice/adminSlice'
import { useAvisos } from './avisosContext'
import './PostCard.css'

function PostCard({
  id, title, price, image, condition, anio, rating, sales, disponible, location,
  conEnvio, enOferta, porcentajeDescuento, precioOriginal,
  esMiProducto, esAdmin, nivelDestacado, activo, estadoPublicacion
}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { confirmar, exito } = useAvisos()
  const [isDeleted, setIsDeleted] = useState(false)

  const wishlist = useSelector(state => state.wishlist.items)
  const isFavorite = wishlist.some(fav => fav.id === id)

  const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0);

  const handleDeleteAdmin = async (e) => {
    e.stopPropagation()
    const ok = await confirmar({
      titulo: '¿Dar de baja producto?',
      texto: `"${title}" sale del catálogo y de los carritos.`,
      ok: 'Dar de baja',
      peligro: true,
    })
    if (!ok) return
    
    dispatch(bajaProductoAdmin(id))
    setIsDeleted(true)
  }

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    if (isFavorite) {
      const favItem = wishlist.find(f => f.id === id)
      if (favItem) dispatch(quitarFavorito(favItem.idItem))
    } else {
      dispatch(agregarFavorito(id))
    }
  }

  const agregar = (e) => {
    e.stopPropagation()
    dispatch(agregarItem({ idProducto: id, cantidad: 1 }))
  }

  const noEstaALaVenta = activo === false || estadoPublicacion === 'PAUSADO' || estadoPublicacion === 'BORRADOR'
  // Si es admin, por más que venga la bandera, nunca es su producto
  const realEsMiProducto = esAdmin ? false : esMiProducto
  const esClienteComprando = !realEsMiProducto && !esAdmin
  const sePuedeComprar = disponible && !noEstaALaVenta

  if (isDeleted) return null;

  return (
    <div className="card-item" onClick={() => navigate(`/product/${id}`)} style={{ position: 'relative' }}>
      {esAdmin && (
        <button className="card-admin-delete-btn" onClick={handleDeleteAdmin} title="Dar de baja producto (Vista Admin)">
          <i className="fa-solid fa-ban"></i>
        </button>
      )}

      {!esAdmin && (
        <button className={`card-heart-btn ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
          <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
      )}

      {enOferta && !noEstaALaVenta && (
        <div className="badge-oferta-flotante">{porcentajeDescuento}% OFF</div>
      )}

      <div className="card-image-wrapper" style={{ position: 'relative' }}>
        {image ? (
          <img src={image} alt={title} className="card-image" />
        ) : (
          <div className="card-image card-sin-foto"><i className="fa-regular fa-image"></i></div>
        )}
        {realEsMiProducto && <div className="badge-mi-producto-foto">Mi Producto</div>}
      </div>

      <div className="card-content">
        <div className="card-header-meta">
          <span className="badge-condition">{condition}{anio ? ` · ${anio}` : ''}</span>
          {nivelDestacado && nivelDestacado !== 'NINGUNO' && !noEstaALaVenta && (
            <span className="badge-destacado-card"><i className="fa-solid fa-star"></i> Destacado</span>
          )}
        </div>

        <h3 className="card-title">{title}</h3>

        {rating != null && (
          <div className="card-rating">
            <i className="fa-solid fa-star"></i>
            <span className="rating-score">{rating.toFixed(1)}</span>
            <span className="rating-sales">| {sales} vendidos</span>
          </div>
        )}

        <div className="card-price-container">
           {enOferta && !noEstaALaVenta && <span className="precio-tachado">{formatMoney(precioOriginal)}</span>}
          <div className="card-price">{formatMoney(price)}</div>
        </div>
        
        {location && <div className="card-location"><i className="fa-solid fa-location-dot"></i> {location}</div>}

        <div className="card-footer-info">
          <div className="card-stock" style={noEstaALaVenta ? { color: '#ef4444', fontWeight: 'bold' } : {}}>
            {noEstaALaVenta ? 'No está a la venta' : (disponible ? 'Disponible' : 'Sin stock')}
          </div>
          {conEnvio ? (
             <div className="envio-gratis-badge" style={{ color: '#16a34a' }}><i className="fa-solid fa-truck-fast"></i> Con envío</div>
          ) : (
             <div className="envio-gratis-badge" style={{ color: '#6b7280' }}><i className="fa-solid fa-handshake"></i> Retiro a acordar</div>
          )}
        </div>

        {esClienteComprando && (
          sePuedeComprar ? (
            <button className="card-agregar" onClick={agregar}>
              <i className="fa-solid fa-cart-plus"></i> Agregar al carrito
            </button>
          ) : (
            <button className="card-agregar" disabled style={{ backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }} onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-ban"></i> Producto no disponible
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default PostCard