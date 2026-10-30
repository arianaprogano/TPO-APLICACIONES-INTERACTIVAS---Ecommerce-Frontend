import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProductoDetalle } from '../redux/slice/productosSlice'
import { agregarItem, limpiarErrorCarrito } from '../redux/slice/carritoSlice'
import { agregarFavorito, quitarFavorito } from '../redux/slice/wishlistSlice'
import OfertaModal from '../components/OfertaModal'
import './ProductDetail.css'
import '../Excepciones.css'

function ProductDetail({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [quantity, setQuantity] = useState(1)
  const [fotoActiva, setFotoActiva] = useState(0)
  const [ofertando, setOfertando] = useState(false)

  const { productoActual: product, loading, error: errorProducto } = useSelector(state => state.productos)
  const errorCarrito = useSelector(state => state.carrito.error)
  const wishlist = useSelector(state => state.wishlist.items)
  
  useEffect(() => {
    dispatch(fetchProductoDetalle(id))
    setQuantity(1)
    setFotoActiva(0)
  }, [id, dispatch])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Buscando producto...</div>
  if (errorProducto) return <div style={{ padding: '40px', textAlign: 'center', color: '#b91c1c' }}>{errorProducto}</div>
  if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Producto no encontrado</div>

  const isFavorite = wishlist.some(fav => fav.id === product.id)
  
  // Verificamos si el producto pertenece al usuario logueado para mostrar la insignia
  const esMiProducto = user && product.vendedor && (
    product.vendedor.id === user.id || 
    product.vendedor.nombreUsuario === user.nombreUsuario
  )

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (isFavorite) {
      const favItem = wishlist.find(f => f.id === product.id)
      if (favItem) dispatch(quitarFavorito(favItem.idItem))
    } else {
      dispatch(agregarFavorito(product.id))
    }
  }

  const handleAddToCartClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    dispatch(agregarItem({ idProducto: product.id, cantidad: quantity }))
  }

  const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

  const imagenes = product.imagenes?.length > 0 ? product.imagenes : (product.image ? [product.image] : [])

  const incrementar = () => { if (quantity < (product.stock || 1)) setQuantity(q => q + 1) }
  const decrementar = () => { if (quantity > 1) setQuantity(q => q - 1) }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        <i className="fa-solid fa-arrow-left"></i> Volver
      </button>

      <div className="product-detail-card">
        <div className="pd-top-row">
          
          <div className="product-detail-left">
            <div className="pd-galeria">
              {imagenes.length > 1 && (
                <div className="pd-miniaturas">
                  {imagenes.map((imgUrl, index) => (
                    <button 
                      key={index} 
                      className={`pd-miniatura ${fotoActiva === index ? 'activa' : ''}`}
                      onClick={() => setFotoActiva(index)}
                    >
                      <img src={imgUrl} alt={`${product.title} ${index}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="product-detail-image-wrapper" style={{ position: 'relative' }}>
                {imagenes.length > 0 ? (
                  <img src={imagenes[fotoActiva]} alt={product.title} className="product-detail-image" />
                ) : (
                  <div className="product-detail-image pd-sin-foto"><i className="fa-regular fa-image"></i></div>
                )}
                {/* Insignia de Mi Producto */}
                {esMiProducto && <div className="badge-mi-producto-foto">Mi Producto</div>}
              </div>
            </div>
          </div>

          <div className="product-detail-info">
            <div className="pd-header-row">
              <div className="pd-tags">
                <span className="pd-condition">{product.condition} {product.anio ? `· ${product.anio}` : ''}</span>
                {product.categoria?.nombre && <span className="pd-breadcrumb">{product.categoria.nombre}</span>}
              </div>
              <button className={`pd-top-wishlist ${isFavorite ? 'active-icon' : ''}`} onClick={handleToggleFavorite}>
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> {isFavorite ? 'En favoritos' : 'Favorito'}
              </button>
            </div>

            <h1 className="product-title">{product.title}</h1>

            {product.rating != null && (
              <div className="product-rating">
                <i className="fa-solid fa-star star-icon"></i>
                <span className="rating-score">{product.rating.toFixed(1)}</span>
                <span className="rating-sales">| {product.sales || 0} vendidos</span>
              </div>
            )}

            <div className="product-price-section">
              {product.enOferta && product.precioOriginal && (
                <div>
                  <span className="pd-precio-tachado">{formatMoney(product.precioOriginal)}</span>
                  <span className="pd-badge-oferta" style={{ marginLeft: '8px' }}>{product.porcentajeDescuento}% OFF</span>
                </div>
              )}
              <div className="product-price">{formatMoney(product.price)}</div>
              
              <div className="product-stock-green">
                {product.disponible && product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Sin stock'}
              </div>
            </div>

            <div className="pd-location">
              <i className="fa-solid fa-location-dot"></i> {product.location || 'Ubicación a coordinar'}
              <div className="pd-envio">
                {product.conEnvio ? (
                  <span><i className="fa-solid fa-truck-fast"></i> Con envío disponible</span>
                ) : (
                  <span><i className="fa-solid fa-handshake"></i> Retiro a acordar</span>
                )}
              </div>
            </div>

            {product.disponible && product.stock > 0 && (
              <div className="product-actions-row">
                <div className="qty-selector">
                  <button onClick={decrementar}>-</button>
                  <span>{quantity}</span>
                  <button onClick={incrementar}>+</button>
                </div>
                <button className="btn-add-cart" onClick={handleAddToCartClick}>
                  <i className="fa-solid fa-cart-shopping"></i> Agregar al carrito
                </button>
              </div>
            )}

            {product.vendedor && (
              <div className="pd-vendedor" style={{ marginTop: '20px' }}>
                <div className="pd-vendedor-titulo">Vendido por</div>
                <div className="pd-vendedor-nombre">{product.vendedor.nombreUsuario}</div>
                
                {product.vendedor.nivel && (() => {
                  const raw = product.vendedor.nivel.toLowerCase().replace(/_/g, ' ').trim()
                  if (!raw || raw.includes('ninguno') || raw.includes('sin calificar') || raw.includes('none') || raw.includes('null')) {
                    return null
                  }

                  let colorNivel = '#b45309'
                  if (raw.includes('oro')) colorNivel = '#ca8a04'
                  if (raw.includes('platino')) colorNivel = '#0284c7'

                  const limpiarNivel = product.vendedor.nivel.replace(/vendedor/gi, '').replace(/_/g, ' ').trim()
                  const nivelCapitalizado = limpiarNivel.charAt(0).toUpperCase() + limpiarNivel.slice(1).toLowerCase()
                  const etiquetaNivel = `Vendedor ${nivelCapitalizado}`

                  return (
                    <div className="pd-vendedor-nivel" style={{ color: colorNivel, fontWeight: 'bold', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-medal"></i> {etiquetaNivel}
                    </div>
                  )
                })()}

                {product.vendedor.provincia && <div className="pd-vendedor-meta">{product.vendedor.provincia}</div>}
                
                <button className="pd-vendedor-link" onClick={() => navigate(`/vendedor/${product.vendedor.nombreUsuario}`)}>
                  Ver perfil del vendedor <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}

          </div>
        </div>

        <div className="product-bottom-section">
          <div className="product-description-bottom">
            <h3 className="reviews-title">Descripción</h3>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {product.description || 'El vendedor no dejó una descripción detallada para este producto.'}
            </p>
          </div>

          <div className="product-reviews-section">
            <h3 className="reviews-title">Opiniones sobre el producto</h3>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, index) => (
                <div key={index} className="review-card">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa-solid fa-star ${i < rev.estrellas ? '' : 'text-gray-300'}`} style={{ color: i < rev.estrellas ? '#f97316' : '#d1d5db' }}></i>
                    ))}
                  </div>
                  <p className="review-text">{rev.texto || rev.comentario}</p>
                  <span className="review-author">{rev.autor || 'Comprador verificado'} — {rev.fecha}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Este producto todavía no tiene opiniones.</p>
            )}
          </div>
        </div>

      </div>

      {errorCarrito && (
        <div className="error-overlay">
          <div className="error-modal">
            <div className="error-icon-box">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="error-title">Atención</h3>
            <p className="error-text">{errorCarrito}</p>
            <button 
              className="error-btn" 
              onClick={() => dispatch(limpiarErrorCarrito())}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {ofertando && (
        <OfertaModal producto={product} onClose={() => setOfertando(false)} />
      )}
    </div>
  )
}

export default ProductDetail