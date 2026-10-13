import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import { createPortal } from 'react-dom'
import './PostCard.css'

function PostCard({ 
  id, title, price, image, subcategory, condition, rating, sales, stock, 
  isFavorite, onToggleFavorite, conEnvio, enOferta, porcentajeDescuento, precioOriginal,
  esMiProducto, esAdmin
}) {
  const navigate = useNavigate(); 
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

  const formatMoney = (amount) =>
    'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0);

  const handleDeleteAdmin = (e) => {
    e.stopPropagation(); 
    setShowConfirm(true); 
  }

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
    setIsDeleted(true); 
  }

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  }

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
        <img src={image || 'https://placehold.co/400'} alt={title} className="card-image" />
        {esMiProducto && (
          <div className="badge-mi-producto-foto">
            Mi Producto
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-header-meta">
          <span className="badge-condition">{condition.toUpperCase()}</span>
          <span className="badge-category">{subcategory}</span>
        </div>

        <h3 className="card-title">{title}</h3>
        
        <div className="card-rating">
          <i className="fa-solid fa-star"></i>
          <span className="rating-score">{rating}</span>
          <span className="rating-sales">| {sales} vendidos</span>
        </div>

        <div className="card-price-container">
           {enOferta && (
             <span className="precio-tachado">{formatMoney(precioOriginal)}</span>
           )}
          <div className="card-price">
            {formatMoney(price)} 
          </div>
        </div>
        
        <div className="card-footer-info">
          <div className="card-stock">Stock: {stock}</div>
          {conEnvio && (
             <div className="envio-gratis-badge">
                <i className="fa-solid fa-truck-fast"></i> Con envío
             </div>
          )}
        </div>
      </div>

      {showConfirm && createPortal(
        <div className="error-overlay" onClick={cancelDelete}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-box">
              <i className="fa-solid fa-trash"></i>
            </div>
            <h2 className="error-title">¿Eliminar Producto?</h2>
            <p className="error-text">¿Estás seguro de que deseas eliminar "{title}" del catálogo?</p>
            
            <div className="delete-modal-actions">
              <button 
                className="error-btn btn-cancel-delete" 
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="error-btn" 
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

export default PostCard