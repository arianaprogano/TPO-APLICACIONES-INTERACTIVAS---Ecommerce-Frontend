import React, { useEffect, useState } from 'react'
import PostCard from './PostCard'
import './PostList.css'

function PostList({ user, searchTerm, selectedCategory, selectedSubcategory, conditions, locations, favorites, toggleFavorite, soloConEnvio, soloSinEnvio, soloOfertas }) {
  const [posts, setPosts] = useState([])

  const initialData = [
    {
      id: 1,
      title: "Tractor John Deere 7320",
      body: "Excelente estado. Motor impecable. Ideal para siembra gruesa.",
      price: 85000,
      category: "Maquinaria",
      subcategory: "Tractor",
      condition: "Usado",
      location: "Buenos Aires",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQvKGGCrxEjqlYgoArtB9fyvxFqb5Lsc3gsOb8ioK2w&s=10",
      rating: 4.8,
      sales: 4,
      stock: 3,
      conEnvio: false, 
      enOferta: false,  
      vendedorId: 10
    },
    {
      id: 2,
      title: "Semillas de Maíz Híbrido (Bolsa 80k)",
      body: "Alto rendimiento y resistencia a plagas. Excelente poder germinativo.",
      price: 65,
      category: "Insumos",
      subcategory: "Semillas",
      condition: "Nuevo",
      location: "Córdoba",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVnw-xXWYsJT_CYFOeqkfhsojpsx6FvGOz2c84WnaVtA&s=10",
      rating: 4.9,
      sales: 450,
      stock: 50,
      conEnvio: true, 
      enOferta: true, 
      porcentajeDescuento: 15,
      precioOriginal: 75,
      vendedorId: 11 
    },
    {
      id: 3,
      title: "Cosechadora Agrícola Valtra",
      body: "Mantenimiento al día. Cabina full equipada. Lista para la campaña.",
      price: 120000,
      category: "Maquinaria",
      subcategory: "Cosechadora",
      condition: "Usado",
      location: "Santa Fe",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5d1WLjF9IfxQeXKbcQ4tJDMQiPQl6cvDDbgo90BD_BQ&s=10",
      rating: 4.5,
      sales: 2,
      stock: 1,
      conEnvio: true, 
      enOferta: true, 
      porcentajeDescuento: 20,
      precioOriginal: 150000,
      vendedorId: 10 
    }
  ]

  useEffect(() => {
    setPosts(initialData)
  }, [])

  let filteredPosts = posts;

  if (selectedCategory) filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
  if (selectedSubcategory) filteredPosts = filteredPosts.filter(post => post.subcategory === selectedSubcategory);
  if (conditions && conditions.length > 0) filteredPosts = filteredPosts.filter(post => conditions.includes(post.condition));
  if (locations && locations.length > 0) filteredPosts = filteredPosts.filter(post => locations.includes(post.location));
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (soloConEnvio) {
    filteredPosts = filteredPosts.filter(post => post.conEnvio === true);
  }
  
  if (soloSinEnvio) {
    filteredPosts = filteredPosts.filter(post => post.conEnvio === false);
  }

  if (soloOfertas) {
    filteredPosts = filteredPosts.filter(post => post.enOferta === true);
  }

  return (
    <div className="post-list-grid">
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            body={post.body}
            price={post.price}
            category={post.category}
            subcategory={post.subcategory} 
            condition={post.condition}
            image={post.image}
            rating={post.rating} 
            sales={post.sales}   
            stock={post.stock}   
            isFavorite={favorites.includes(post.id)}
            onToggleFavorite={toggleFavorite}
            conEnvio={post.conEnvio}
            enOferta={post.enOferta}
            porcentajeDescuento={post.porcentajeDescuento}
            precioOriginal={post.precioOriginal}
            esMiProducto={user && user.id === post.vendedorId}
            esAdmin={user?.role?.toLowerCase() === 'admin'} 
          />
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280', fontWeight: 'bold' }}>
          No se encontraron productos con estos filtros.
        </div>
      )}
    </div>
  )
}

export default PostList;