import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, vaciarFavoritos, quitarFavorito } from '../redux/slice/wishlistSlice';
import { agregarItem } from '../redux/slice/carritoSlice';
import PostCard from '../components/PostCard';
import './Favoritos.css';

function Favoritos() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Extraemos lo que necesitamos del store global
  const { items: wishlist } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.auth?.user); // Suponiendo que auth lo guardes luego en Redux, o lo lees de donde esté.

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleClear = () => {
    dispatch(vaciarFavoritos());
  };

  const handleToggle = (id) => {
    dispatch(quitarFavorito(id));
  };

  const handleAddToCart = (producto, cantidad) => {
    dispatch(agregarItem({ idProducto: producto.id, cantidad }));
  };

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
          <button className="btn-clear-list" onClick={handleClear} disabled={wishlist.length === 0}>
            <i className="fa-regular fa-trash-can"></i> VACIAR LISTA
          </button>
        </div>
      </div>

      <div className="post-list-grid">
        {wishlist.length > 0 ? (
          wishlist.map(post => (
            <PostCard
              key={post.idItem || post.id}
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
              onToggleFavorite={handleToggle}
              onAddToCart={handleAddToCart}
              esAdmin={user?.role === 'admin'}
            />
          ))
        ) : (
          <div className="empty-fav-state">
          </div>
        )}
      </div>
    </div>
  );
}

export default Favoritos;