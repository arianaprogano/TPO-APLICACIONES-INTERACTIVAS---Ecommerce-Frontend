import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ProductDetail.css'

const initialData = [
  { id: 1, sellerId: 10, title: "Tractor John Deere 7320", body: "Excelente estado. Motor impecable. Ideal para siembra gruesa.", price: 85000, category: "Maquinaria", subcategory: "Tractor", condition: "Usado", location: "Buenos Aires", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQvKGGCrxEjqlYgoArtB9fyvxFqb5Lsc3gsOb8ioK2w&s=10", rating: 4.8, sales: 4, stock: 3 },
  { id: 2, sellerId: 10, title: "Semillas de Maíz Híbrido (Bolsa 80k)", body: "Alto rendimiento y resistencia a plagas. Excelente poder germinativo.", price: 65, category: "Insumos", subcategory: "Semillas", condition: "Nuevo", location: "Córdoba", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVnw-xXWYsJT_CYFOeqkfhsojpsx6FvGOz2c84WnaVtA&s=10", rating: 4.9, sales: 450, stock: 50 },
  { id: 3, sellerId: 11, title: "Cosechadora Agrícola Valtra", body: "Mantenimiento al día. Cabina full equipada. Lista para la campaña.", price: 120000, category: "Maquinaria", subcategory: "Cosechadora", condition: "Usado", location: "Santa Fe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5d1WLjF9IfxQeXKbcQ4tJDMQiPQl6cvDDbgo90BD_BQ&s=10", rating: 4.5, sales: 2, stock: 1 }
];

export const ProductDetail = ({ favorites, toggleFavorite, user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  
  // Estado para el modal central
  const [modalMessage, setModalMessage] = useState('')
  
  const product = initialData.find(p => p.id === parseInt(id))
  if (!product) return <div className="product-not-found">Producto no encontrado</div>
  
  const isFavorite = favorites.includes(product.id)
  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount || 0);

  const handleRestar = () => { if (quantity > 1) setQuantity(quantity - 1) }
  const handleSumar = () => { if (quantity < product.stock) setQuantity(quantity + 1) }

  // Función al tocar Agregar al Carrito
  const handleAddToCart = () => {
    if (!user) {
      setModalMessage("Para agregar productos al carrito, debes iniciar sesión.");
      return;
    }
    if (user.role === 'admin' || user.role === 'despachante') {
      setModalMessage(`No puedes realizar compras con tu rol de ${user.role}.`);
      return;
    }
    if (user.id === product.sellerId) {
      setModalMessage("No puedes comprar tus propios productos.");
      return;
    }
    
  }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i> Volver a resultados
      </button>

      <div className="product-detail-card">
        
        {/* LADO IZQUIERDO: Imagen y Reseñas */}
        <div className="product-detail-left">
          <div className="product-detail-image-wrapper">
            <img src={product.image} alt={product.title} className="product-detail-image" />
          </div>

          <div className="product-reviews-section">
            <h3 className="reviews-title">Opiniones sobre el producto</h3>
            <div className="review-card">
              <div className="review-stars">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
              <p className="review-text">"Excelente estado, tal cual se veía en las fotos. El vendedor respondió rápido."</p>
              <span className="review-author">- Carlos M.</span>
            </div>

            <div className="review-card">
              <div className="review-stars">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i>
              </div>
              <p className="review-text">"Muy buen producto y buen precio. Llegó impecable."</p>
              <span className="review-author">- Martín G.</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Info y Compra */}
        <div className="product-detail-info">
          <div className="pd-header-row">
            <div className="pd-tags">
              <span className="pd-condition">{product.condition.toUpperCase()}</span>
              <span className="pd-breadcrumb">{product.category.toUpperCase()} &gt; {product.subcategory.toUpperCase()}</span>
            </div>
            <button className="pd-top-wishlist" onClick={() => toggleFavorite(product.id)}>
              <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart ${isFavorite ? 'active-icon' : ''}`}></i> 
              Añadir a Favoritos
            </button>
          </div>

          <h1 className="product-title">{product.title}</h1>
          
          <div className="product-rating">
            <i className="fa-solid fa-star star-icon"></i>
            <span className="rating-score">{product.rating}</span>
            <span className="rating-sales">| {product.sales} vendidos</span>
          </div>

          <div className="product-price-section">
            <div className="product-price">{formatMoney(product.price)}</div>
            <div className="product-stock-green">Stock disponible: {product.stock}</div>
          </div>

          <div className="payment-box">
            <h4 className="payment-title">MEDIOS DE PAGO Y FINANCIACIÓN</h4>
            <ul className="payment-list">
              <li><i className="fa-solid fa-check"></i> Tarjetas de crédito y débito.</li>
              <li><i className="fa-solid fa-check"></i> 6 cuotas sin interés bancarias.</li>
              <li><i className="fa-solid fa-check"></i> Descuento por transferencia bancaria.</li>
              <li><i className="fa-solid fa-check"></i> Financiación directa y Créditos prendarios.</li>
            </ul>
          </div>

          {/* El botón de comprar ahora es fijo y levanta el modal */}
          <div className="product-actions-row">
            <div className="qty-selector">
              <button onClick={handleRestar}>-</button>
              <span>{quantity}</span>
              <button onClick={handleSumar}>+</button>
            </div>
            <button className="btn-add-cart" onClick={handleAddToCart}>
              AGREGAR AL CARRITO
            </button>
          </div>

          <div className="product-description-bottom">
            <p>{product.body}</p>
          </div>
        </div>
      </div>

      {modalMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <i className="fa-solid fa-circle-exclamation modal-icon"></i>
            <p>{modalMessage}</p>
            <button className="modal-btn" onClick={() => setModalMessage('')}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail