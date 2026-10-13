import PostCard from './PostCard'
import './ProductRow.css'

// Fila horizontal de productos con titulo y "Ver todos", como las de la
// portada de Agrofy. Si no hay productos no se muestra.
function ProductRow({ titulo, subtitulo, productos, onVerTodos, user, favorites, toggleFavorite }) {
  if (!productos || productos.length === 0) return null

  return (
    <section className="product-row">
      {(titulo || onVerTodos) && (
        <header className="product-row-header">
          <div>
            <h2 className="product-row-titulo">{titulo}</h2>
            {subtitulo && <p className="product-row-subtitulo">{subtitulo}</p>}
          </div>
          {onVerTodos && (
            <button className="product-row-ver-todos" onClick={onVerTodos}>
              Ver todos <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
        </header>
      )}

      <div className="product-row-lista">
        {productos.map(post => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            price={post.price}
            condition={post.condition}
            anio={post.anio}
            image={post.image}
            rating={post.rating}
            sales={post.sales}
            disponible={post.disponible}
            location={post.location}
            isFavorite={favorites.includes(post.id)}
            onToggleFavorite={toggleFavorite}
            conEnvio={post.conEnvio}
            enOferta={post.enOferta}
            porcentajeDescuento={post.porcentajeDescuento}
            precioOriginal={post.precioOriginal}
            nivelDestacado={post.nivelDestacado}
            esAdmin={user?.role === 'admin'}
          />
        ))}
      </div>
    </section>
  )
}

export default ProductRow
