import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import './Favoritos.css'

// La lista viene del backend (GET /wishlist) a traves de App, que tambien
// resuelve agregar, quitar y vaciar.
function Favoritos({ wishlist, user, toggleFavorite, clearFavorites, addToCart }) {
  const navigate = useNavigate()

  return (
    <div className="favoritos-container">
      <div className="favoritos-header">
        <div>
          <h2 className="fav-title"><i className="fa-solid fa-heart"></i> Mi Lista de Deseos</h2>
          <p className="fav-subtitle">Tus productos guardados para consultar o comprar cuando quieras.</p>
        </div>
        <div className="fav-actions">
          <button className="btn-back-catalog" onClick={() => navigate('/productos')}>
            <i className="fa-solid fa-arrow-left"></i> VOLVER AL CATÁLOGO
          </button>
          <button className="btn-clear-list" onClick={clearFavorites} disabled={wishlist.length === 0}>
            <i className="fa-regular fa-trash-can"></i> VACIAR LISTA
          </button>
        </div>
      </div>

      <div className="post-list-grid">
        {wishlist.length > 0 ? (
          wishlist.map(post => (
            <PostCard
              key={post.idItem}
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
              conEnvio={post.conEnvio}
              enOferta={post.enOferta}
              porcentajeDescuento={post.porcentajeDescuento}
              precioOriginal={post.precioOriginal}
              nivelDestacado={post.nivelDestacado}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              esAdmin={user?.role === 'admin'}
            />
          ))
        ) : (
          <div className="empty-fav-state">
            <div className="empty-icon-circle">
              <i className="fa-regular fa-heart"></i>
            </div>
            <h3 className="empty-fav-title">Tu lista de deseos está vacía</h3>
            <p className="empty-fav-text">Explora nuestro catálogo y guarda los productos que te interesen<br/>haciendo clic en el icono del corazón.</p>
            <button className="btn-explorar" onClick={() => navigate('/productos')}>
              Explorar Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favoritos
