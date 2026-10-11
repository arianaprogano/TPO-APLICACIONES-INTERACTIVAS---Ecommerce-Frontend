import React from 'react'
import { useNavigate } from 'react-router-dom' 
import './PostCard.css'

function PostCard({ id, title, price, image, subcategory, condition, rating, sales, stock, isFavorite, onToggleFavorite, conEnvio, enOferta, porcentajeDescuento, precioOriginal }) {
  const navigate = useNavigate(); 

  const formatMoney = (amount) =>
    'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0);

  return (
    <div className="card-item" onClick={() => navigate(`/product/${id}`)}>
      <button 
        className={`card-heart-btn ${isFavorite ? 'active' : ''}`}
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleFavorite(id); 
        }}
      >
        <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
      </button>

      {enOferta && (
        <div className="badge-oferta-flotante">
          {porcentajeDescuento}% OFF
        </div>
      )}

      <div className="card-image-wrapper">
        <img src={image || 'https://placehold.co/400'} alt={title} className="card-image" />
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
    </div>
  )
}

export default PostCard