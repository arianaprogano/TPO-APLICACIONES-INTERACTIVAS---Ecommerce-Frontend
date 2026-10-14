import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { darDeBajaProducto } from '../api/admin'
import { useAvisos } from './avisosContext'
import './PostCard.css'

function PostCard({
  id, title, price, image, condition, anio, rating, sales, disponible, location,
  isFavorite, onToggleFavorite, conEnvio, enOferta, porcentajeDescuento, precioOriginal,
  esMiProducto, esAdmin, nivelDestacado, onAddToCart
}) {
  const navigate = useNavigate()
  const { error, confirmar } = useAvisos()
  const [isDeleted, setIsDeleted] = useState(false)

  const formatMoney = (amount) =>
    '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0);

  // Baja logica en el backend: sale del catalogo y de los carritos.
  const handleDeleteAdmin = async (e) => {
    e.stopPropagation()
    const ok = await confirmar({
      titulo: '¿Eliminar producto?',
      texto: `"${title}" sale del catálogo y de los carritos.`,
      ok: 'Eliminar',
      peligro: true,
    })
    if (!ok) return
    try {
      await darDeBajaProducto(id)
      setIsDeleted(true)
    } catch (err) {
      error(err.message)
    }
  }

  // Desde la tarjeta se suma una unidad sin entrar a la ficha.
  const agregar = (e) => {
    e.stopPropagation()
    onAddToCart({ id, title }, 1)
  }

  const puedeAgregar = onAddToCart && disponible && !esMiProducto && !esAdmin

  if (isDeleted) return null;

  return (
    <div className="card-item" onClick={() => navigate(`/product/${id}`)} style={{ position: 'relative' }}>
    
      {esAdmin && (
        <button 
          className="card-admin-delete-btn"
          onClick={handleDeleteAdmin}
          title="Eliminar producto (Vista Admin)"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      )}

      {!esAdmin && (
        <button 
          className={`card-heart-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleFavorite(id); 
          }}
        >
          <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
      )}

      {enOferta && (
        <div className="badge-oferta-flotante">
          {porcentajeDescuento}% OFF
        </div>
      )}

      <div className="card-image-wrapper" style={{ position: 'relative' }}>
        {image ? (
          <img src={image} alt={title} className="card-image" />
        ) : (
          <div className="card-image card-sin-foto"><i className="fa-regular fa-image"></i></div>
        )}
        {esMiProducto && (
          <div className="badge-mi-producto-foto">
            Mi Producto
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-header-meta">
          <span className="badge-condition">{condition}{anio ? ` · ${anio}` : ''}</span>
          {nivelDestacado && nivelDestacado !== 'NINGUNO' && (
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
           {enOferta && (
             <span className="precio-tachado">{formatMoney(precioOriginal)}</span>
           )}
          <div className="card-price">
            {formatMoney(price)} 
          </div>
        </div>
        
        {location && (
          <div className="card-location">
            <i className="fa-solid fa-location-dot"></i> {location}
          </div>
        )}

        <div className="card-footer-info">
          <div className="card-stock">{disponible ? 'Disponible' : 'Sin stock'}</div>
          {conEnvio && (
             <div className="envio-gratis-badge">
                <i className="fa-solid fa-truck-fast"></i> Con envío
             </div>
          )}
        </div>

        {puedeAgregar && (
          <button className="card-agregar" onClick={agregar}>
            <i className="fa-solid fa-cart-plus"></i> Agregar al carrito
          </button>
        )}
      </div>
    </div>
  )
}

export default PostCard