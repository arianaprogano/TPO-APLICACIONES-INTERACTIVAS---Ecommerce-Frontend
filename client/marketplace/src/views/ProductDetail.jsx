import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducto, getSimilares } from '../api/productos'
import { crearResena, getResenasDeProducto, NIVELES_VENDEDOR } from '../api/resenas'
import { getMisCompras } from '../api/ordenes' 
import { getMisEnvios } from '../api/envios' 
import ProductRow from '../components/ProductRow'
import OfertaModal from '../components/OfertaModal'
import Reviews from '../components/Reviews' 
import { useAvisos } from '../components/avisosContext'
import './ProductDetail.css'

function ProductDetail({ favorites, toggleFavorite, user, addToCart, pedirLogin }) {
  const { error: avisarError, exito } = useAvisos()
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [fotoActiva, setFotoActiva] = useState(0)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')
  const [similares, setSimilares] = useState([])
  const [todasLasResenas, setTodasLasResenas] = useState(null)
  const [ofertando, setOfertando] = useState(false)

  // Estados para la lógica de reseñas
  const [comprasEntregadas, setComprasEntregadas] = useState([])
  const [miResena, setMiResena] = useState(null)
  const [mostrarModalResena, setMostrarModalResena] = useState(false)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError('')
    setQuantity(1)
    setFotoActiva(0)
    setTodasLasResenas(null)
    setMiResena(null)
    setComprasEntregadas([])

    getSimilares(id).then(lista => { if (!cancelado) setSimilares(lista) }).catch(() => setSimilares([]))

    getProducto(id)
      .then(async (p) => {
        if (cancelado) return
        setProduct(p)

        if (user) {
            try {
                const [misOrdenes, misEnvios, resenasProducto] = await Promise.all([
                    getMisCompras().catch(() => []),
                    getMisEnvios().catch(() => []),
                    getResenasDeProducto(id).catch(() => [])
                ])

                const resenaDelUsuario = resenasProducto.find(r => r.autor === user.username)
                setMiResena(resenaDelUsuario || null)
                setTodasLasResenas(resenasProducto)

                const enviosPorOrden = Object.fromEntries(misEnvios.map(e => [e.idOrden, e]))
                
                const ordenesConEsteProducto = misOrdenes.filter(orden => 
                    orden.items.some(item => String(item.idProducto) === String(id))
                )

                const ordenesEntregadas = ordenesConEsteProducto.filter(orden => 
                    enviosPorOrden[orden.id]?.estado === 'ENTREGADO'
                )

                setComprasEntregadas(ordenesEntregadas)

            } catch (err) {
                console.error("Error al cargar datos del usuario para reseñas:", err)
            }
        }
      })
      .catch(err => {
        if (cancelado) return
        setProduct(null)
        if (err.status !== 404) setError(err.message)
      })
      .finally(() => { if (!cancelado) setLoading(false) })
      
    return () => { cancelado = true }
  }, [id, user])

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#6b7280' }}>Buscando producto...</div>
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#b91c1c', fontWeight: 'bold' }}>{error}</div>
  }

  if (!loading && !product) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <i className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '24px', color: '#111827', marginBottom: '10px' }}>Producto no encontrado</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          Lo sentimos, el producto que estás buscando no existe o fue eliminado.
        </p>
        <button 
          onClick={() => navigate('/home')} 
          style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Volver a la tienda
        </button>
      </div>
    )
  }

  const isFavorite = favorites.includes(product.id)
  const esMiProducto = Boolean(user && product.vendedor?.nombreUsuario === user.username)
  const esAdmin = user?.role?.toLowerCase() === 'admin'
  
  const handleQuantityChange = (delta) => {
    let newQ = quantity + delta
    if (newQ < 1) newQ = 1
    if (newQ > product.stock) newQ = product.stock
    setQuantity(newQ)
  }

  const handleAddToCartClick = () => {
    addToCart(product, quantity)
  }

  const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount)

  const puedeOfertar = product.aceptaOfertas && !esMiProducto && product.stock > 0 && (!user || user.role === 'cliente')
  const abrirOferta = () => {
    if (!user) return pedirLogin('Iniciá sesión para hacer una oferta.')
    setOfertando(true)
  }

  const resenas = todasLasResenas ?? product.reviews
  const hayMasResenas = !todasLasResenas && product.cantidadResenas > product.reviews.length
  const verTodasLasResenas = () =>
    getResenasDeProducto(product.id).then(setTodasLasResenas).catch(err => avisarError(err.message))

  const nivelVendedor = NIVELES_VENDEDOR[product.vendedor?.nivel]

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(<i key={i} className={i <= rating ? "fa-solid fa-star" : "fa-regular fa-star"} style={{ color: i <= rating ? '#f97316' : '#d1d5db' }}></i>)
    }
    return stars
  }

  const handleReviewAction = () => {
      if(!user) return pedirLogin("Iniciá sesión para dejar una opinión")
      setMostrarModalResena(true)
  }
  
  // Tomamos la primera orden entregada para armar la reseña
  const datosParaResena = comprasEntregadas.length > 0 ? { id: comprasEntregadas[0].id, productoId: product.id, productoTitulo: product.title } : null

  const handleReviewSaved = async (ordenId, reseñaData) => {
    try {
      // Solo creamos reseñas nuevas
      await crearResena({
        idOrden: ordenId,
        idProducto: reseñaData.productoId,
        puntaje: reseñaData.estrellas,
        comentario: reseñaData.texto,
      })

      setMostrarModalResena(false)

      const resenasActualizadas = await getResenasDeProducto(product.id)
      setTodasLasResenas(resenasActualizadas)
      
      const resenaDelUsuario = resenasActualizadas.find(r => r.autor === user?.username)
      setMiResena(resenaDelUsuario || null)

      exito('Tu opinión se publicó correctamente.', { titulo: '¡Gracias por opinar!' })
    } catch (err) {
      avisarError(err.message)
    }
  }

  return (
    <div className="product-detail-container">
      <nav style={{ marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Volver al listado
        </button>
      </nav>

      <article className="product-detail-card">
        
        <div className="pd-top-row">
          <div className="product-detail-left">
            <div className="pd-galeria">
              {product.fotos.length > 1 && (
                <div className="pd-miniaturas">
                  {product.fotos.map((foto, i) => (
                    <button key={foto.id} className={`pd-miniatura ${i === fotoActiva ? 'activa' : ''}`} onClick={() => setFotoActiva(i)}>
                      <img src={foto.url} alt={`${product.title} - foto ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <figure className="product-detail-image-wrapper" style={{ margin: 0, position: 'relative' }}>
                {product.fotos.length > 0 ? (
                  <img src={product.fotos[fotoActiva]?.url} alt={product.title} className="product-detail-image" />
                ) : (
                  <div className="product-detail-image pd-sin-foto"><i className="fa-regular fa-image"></i></div>
                )}

                {esMiProducto && (
                  <div className="pd-mi-producto">MI PRODUCTO</div>
                )}
              </figure>
            </div>
          </div>

          <div className="product-detail-info">
            <header className="pd-header-row">
              <div className="pd-tags">
                <span className="pd-condition">{product.condition}{product.anio ? ` · ${product.anio}` : ''}</span>
                <span className="pd-breadcrumb">{product.categoria?.nombreCategoriaPadre ? `${product.categoria.nombreCategoriaPadre} > ` : ''}{product.categoria?.nombre}</span>
              </div>
              
              {!esAdmin && (
                <button className={`pd-top-wishlist ${isFavorite ? 'active-icon' : ''}`} onClick={() => toggleFavorite(product.id)}>
                  <i className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                  {isFavorite ? 'En Lista de Deseos' : 'Añadir a Deseos'}
                </button>
              )}
            </header>

            <h1 className="product-title">{product.title}</h1>
            
            <div className="product-rating">
              <span className="star-icon"><i className="fa-solid fa-star"></i></span>
              <span className="rating-score">{product.rating != null ? product.rating.toFixed(1) : 'Sin reseñas'}</span>
              <span className="rating-sales">| {product.sales} vendidos</span>
            </div>

            <div className="product-price-section">
              {product.enOferta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span className="pd-precio-tachado">
                    {formatMoney(product.precioOriginal)}
                  </span>
                  <span className="pd-badge-oferta">
                    {product.porcentajeDescuento}% OFF
                  </span>
                </div>
              )}
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
                <button disabled style={{ flex: 1, backgroundColor: '#d1d5db', color: '#6b7280', border: 'none', borderRadius: '6px', fontWeight: 'bold', padding: '12px' }}>
                  SIN STOCK
                </button>
              </div>
            )}

            {puedeOfertar && (
              <button className="btn-ofertar" onClick={abrirOferta}>
                <i className="fa-solid fa-hand-holding-dollar"></i> Hacer una oferta
              </button>
            )}

            <div className="pd-location">
              <i className="fa-solid fa-location-dot"></i> {product.location}
              {product.conEnvio && <span className="pd-envio"><i className="fa-solid fa-truck-fast"></i> Con envío</span>}
            </div>

            {product.vendedor && (
              <section className="pd-vendedor">
                <h4 className="pd-vendedor-titulo">Información sobre el vendedor</h4>
                <div className="pd-vendedor-nombre">{product.vendedor.nombre} {product.vendedor.apellido}</div>
                <div className="pd-vendedor-meta">
                  @{product.vendedor.nombreUsuario}
                  {product.vendedor.calificacion != null && ` · ${product.vendedor.calificacion.toFixed(1)} ★ (${product.vendedor.cantidadResenas})`}
                </div>
                {nivelVendedor && (
                  <div className="pd-vendedor-nivel" style={{ color: nivelVendedor.color }}>
                    <i className={`fa-solid ${nivelVendedor.icono}`}></i> {nivelVendedor.texto}
                  </div>
                )}
                <button className="pd-vendedor-link" onClick={() => navigate(`/vendedor/${product.vendedor.nombreUsuario}`)}>
                  Ver más productos del vendedor <i className="fa-solid fa-chevron-right"></i>
                </button>
              </section>
            )}
          </div>
        </div>

        <div className="product-bottom-section">
          <section className="product-description-bottom">
            <h3 className="reviews-title" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px' }}>
              Descripción del producto:
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
              {product.body}
            </p>
          </section>

          <section className="product-reviews-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px' }}>
                <h3 className="reviews-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                Opiniones de los usuarios
                </h3>
                
                {/* Acá está la magia: SOLO si no hay miResena Y hay compras entregadas */}
                {(!miResena && comprasEntregadas.length > 0) && (
                    <button 
                        onClick={handleReviewAction}
                        className="btn-opinar"
                    >
                        <i className="fa-solid fa-star"></i> Opinar sobre este producto
                    </button>
                )}
            </div>
            
            {resenas && resenas.length > 0 ? (
              resenas.map(review => (
                <article key={review.id} className="review-card" style={{ marginBottom: '16px' }}>
                  <div className="review-stars">
                    {renderStars(review.estrellas)}
                  </div>
                  <p className="review-text">{review.texto}</p>
                  <span className="review-author">{review.autor} - {review.fecha}</span>
                </article>
              ))
            ) : (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Este producto aún no tiene opiniones. ¡Sé el primero en calificarlo luego de tu compra!</p>
            )}
            {hayMasResenas && (
              <button className="pd-vendedor-link" onClick={verTodasLasResenas}>
                Ver las {product.cantidadResenas} opiniones <i className="fa-solid fa-chevron-down"></i>
              </button>
            )}
          </section>
        </div>

      </article>

      <ProductRow
        titulo="Productos similares"
        subtitulo="Otras publicaciones que te pueden interesar"
        productos={similares}
        user={user}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        addToCart={addToCart}
      />

      {ofertando && (
        <OfertaModal
          producto={product}
          user={user}
          onClose={() => setOfertando(false)}
          onEnviada={() => {
            setOfertando(false)
            exito('Te avisamos con una notificación cuando el vendedor responda. La podés seguir en "Mis Ofertas".', { titulo: '¡Oferta enviada!' })
          }}
        />
      )}

      {mostrarModalResena && datosParaResena && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <Reviews
            orden={datosParaResena} 
            onClose={() => setMostrarModalResena(false)}
            onSave={handleReviewSaved}
          />
        </div>
      )}
    </div>
  )
}

export default ProductDetail