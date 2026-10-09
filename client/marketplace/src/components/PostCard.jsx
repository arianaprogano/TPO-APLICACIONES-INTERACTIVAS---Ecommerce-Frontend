import React from 'react'
import { useNavigate } from 'react-router-dom' 
import './PostCard.css'

function PostCard({ id, title, price, image, subcategory, condition, rating, sales, stock, isFavorite, onToggleFavorite }) {
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

      <div className="card-image-wrapper">
        <img src={image || 'https://placehold.co/400'} alt={title} className="card-image" />
      </div>

      <div className="card-content">
        <div className="card-header-meta">
          <span className="badge-condition">{condition.toUpperCase()}</span>
          {/* Cambiamos categoría por subcategoría */}
          <span className="badge-category">{subcategory}</span>
        </div>

        <h3 className="card-title">{title}</h3>
        
        {/* Estrellas y ventas */}
        <div className="card-rating">
          <i className="fa-solid fa-star"></i>
          <span className="rating-score">{rating}</span>
          <span className="rating-sales">| {sales} vendidos</span>
        </div>

        <div className="card-price">{formatMoney(price)}</div>
        <div className="card-stock">Stock: {stock}</div>
      </div>
    </div>
  )
}

export default PostCard