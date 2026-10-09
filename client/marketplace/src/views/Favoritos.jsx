import React from 'react'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import './Favoritos.css'

const initialData = [
  { id: 1, sellerId: 10, title: "Tractor John Deere 7320", body: "Excelente estado.", price: 85000, category: "Maquinaria", subcategory: "Tractor", condition: "Usado", location: "Buenos Aires", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQvKGGCrxEjqlYgoArtB9fyvxFqb5Lsc3gsOb8ioK2w&s=10", rating: 4.8, sales: 4, stock: 3 },
  { id: 2, sellerId: 10, title: "Semillas de Maíz Híbrido (Bolsa 80k)", body: "Alto rendimiento.", price: 65, category: "Insumos", subcategory: "Semillas", condition: "Nuevo", location: "Córdoba", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVnw-xXWYsJT_CYFOeqkfhsojpsx6FvGOz2c84WnaVtA&s=10", rating: 4.9, sales: 450, stock: 50 },
  { id: 3, sellerId: 11, title: "Cosechadora Agrícola Valtra", body: "Mantenimiento al día.", price: 120000, category: "Maquinaria", subcategory: "Cosechadora", condition: "Usado", location: "Santa Fe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5d1WLjF9IfxQeXKbcQ4tJDMQiPQl6cvDDbgo90BD_BQ&s=10", rating: 4.5, sales: 2, stock: 1 }
];

function Favoritos({ favorites, toggleFavorite, clearFavorites }) {
  const navigate = useNavigate()
  const favoriteProducts = initialData.filter(product => favorites.includes(product.id))

  return (
    <div className="favoritos-container">
      <div className="favoritos-header">
        <div>
          <h2 className="fav-title"><i className="fa-solid fa-heart"></i> Mi Lista de Deseos</h2>
          <p className="fav-subtitle">Tus productos guardados para consultar o comprar cuando quieras.</p>
        </div>
        <div className="fav-actions">
          <button className="btn-back-catalog" onClick={() => navigate('/home')}>
            <i className="fa-solid fa-arrow-left"></i> VOLVER AL CATÁLOGO
          </button>
          <button className="btn-clear-list" onClick={clearFavorites} disabled={favorites.length === 0}>
            <i className="fa-regular fa-trash-can"></i> VACIAR LISTA
          </button>
        </div>
      </div>

      <div className="post-list-grid">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              price={post.price}
              category={post.category}
              subcategory={post.subcategory}
              condition={post.condition}
              image={post.image}
              rating={post.rating}
              sales={post.sales}
              stock={post.stock}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="empty-fav-state">
            <div className="empty-icon-circle">
              <i className="fa-regular fa-heart"></i>
            </div>
            <h3 className="empty-fav-title">Tu lista de deseos está vacía</h3>
            <p className="empty-fav-text">Explora nuestro catálogo y guarda los productos que te interesen<br/>haciendo clic en el icono del corazón.</p>
            <button className="btn-explorar" onClick={() => navigate('/home')}>
              Explorar Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favoritos