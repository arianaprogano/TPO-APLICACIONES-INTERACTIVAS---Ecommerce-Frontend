import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ProductDetail.css'

const initialData = [
  { id: 1, sellerId: 10, title: "Tractor John Deere 7320", body: "Excelente estado. Motor impecable. Ideal para siembra gruesa.", price: 85000, category: "Maquinaria", subcategory: "Tractor", condition: "Usado", location: "Buenos Aires", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQvKGGCrxEjqlYgoArtB9fyvxFqb5Lsc3gsOb8ioK2w&s=10", rating: 4.8, sales: 4, stock: 3 },
  { id: 2, sellerId: 10, title: "Semillas de Maíz Híbrido (Bolsa 80k)", body: "Alto rendimiento y resistencia a plagas. Excelente poder germinativo.", price: 65, category: "Insumos", subcategory: "Semillas", condition: "Nuevo", location: "Córdoba", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVnw-xXWYsJT_CYFOeqkfhsojpsx6FvGOz2c84WnaVtA&s=10", rating: 4.9, sales: 450, stock: 50 },
  { id: 3, sellerId: 11, title: "Cosechadora Agrícola Valtra", body: "Mantenimiento al día. Cabina full equipada. Lista para la campaña.", price: 120000, category: "Maquinaria", subcategory: "Cosechadora", condition: "Usado", location: "Santa Fe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5d1WLjF9IfxQeXKbcQ4tJDMQiPQl6cvDDbgo90BD_BQ&s=10", rating: 4.5, sales: 2, stock: 1 }
];

export default function ProductDetail({ favorites, toggleFavorite, user, addToCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const found = initialData.find(p => p.id === parseInt(id))
    setProduct(found)
  }, [id])

  if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando producto...</div>

  const isFavorite = favorites.includes(product.id)
  
  const handleQuantityChange = (delta) => {
    let newQ = quantity + delta
    if (newQ < 1) newQ = 1
    if (newQ > product.stock) newQ = product.stock
    setQuantity(newQ)
  }

  const handleAddToCartClick = () => {
    addToCart(product, quantity)
  }

  const formatMoney = (amount) => 'U$S ' + new Intl.NumberFormat('en-US').format(amount)

  return (
    <div className="product-detail-container">
      <nav style={{ marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Volver al listado
        </button>
      </nav>

      <article className="product-detail-card">
        
        <div className="product-detail-left">
          <figure className="product-detail-image-wrapper" style={{ margin: 0 }}>
            <img src={product.image} alt={product.title} className="product-detail-image" />
          </figure>

          <section className="product-description-section" style={{ marginTop: '30px' }}>
            <h3 className="reviews-title" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px' }}>
              Descripción del producto
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
              {product.body}
            </p>
          </section>

          <section className="product-reviews-section" style={{ marginTop: '40px' }}>
            <h3 className="reviews-title">Opiniones de los usuarios</h3>
            <article className="review-card">
              <div className="review-stars">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
              <p className="review-text">Excelente producto, tal cual la descripción. El envío fue rapidísimo.</p>
              <span className="review-author">Juan P. - Hace 2 semanas</span>
            </article>
          </section>
        </div>

        <div className="product-detail-info">
          <header className="pd-header-row">
            <div className="pd-tags">
              <span className="pd-condition">{product.condition}</span>
              <span className="pd-breadcrumb">{product.category} &gt; {product.subcategory || 'General'}</span>
            </div>
            
            <button className={`pd-top-wishlist ${isFavorite ? 'active-icon' : ''}`} onClick={() => toggleFavorite(product.id)}>
              <i className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              {isFavorite ? 'En Lista de Deseos' : 'Añadir a Deseos'}
            </button>
          </header>

          <h1 className="product-title">{product.title}</h1>
          
          <div className="product-rating">
            <span className="star-icon"><i className="fa-solid fa-star"></i></span>
            <span className="rating-score">{product.rating}</span>
            <span className="rating-sales">| {product.sales} vendidos</span>
          </div>

          <div className="product-price-section">
            <div className="product-price">{formatMoney(product.price)}</div>
            {product.stock > 0 ? (
              <div className="product-stock-green">Stock disponible: {product.stock}</div>
            ) : (
              <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px', marginTop: '8px' }}>Agotado</div>
            )}
          </div>

          <section className="payment-box">
            <h4 className="payment-title">Medios de pago y financiación</h4>
            <ul className="payment-list">
              <li><i className="fa-solid fa-check"></i> Tarjetas de crédito y débito.</li>
              <li><i className="fa-solid fa-check"></i> 6 cuotas sin interés bancarias.</li>
              <li><i className="fa-solid fa-check"></i> Descuento por transferencia bancaria.</li>
            </ul>
          </section>

          {product.stock > 0 ? (
            <div className="product-actions-row">
              <div className="qty-selector">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
              <button className="btn-add-cart" onClick={handleAddToCartClick}>
                AGREGAR AL CARRITO
              </button>
            </div>
          ) : (
            <div className="product-actions-row">
              <button disabled style={{ flex: 1, backgroundColor: '#d1d5db', color: '#6b7280', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                SIN STOCK
              </button>
            </div>
          )}
          
        </div>
      </article>
    </div>
  )
}