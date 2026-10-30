import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCatalogo, fetchMisPublicaciones } from '../redux/slice/productosSlice'
import PostCard from './PostCard'
import './PostList.css'

const POR_PAGINA = 12

function PostList({ user, orden, searchTerm, selectedCategory, selectedSubcategory, conditions, provincia, rango, soloConEnvio, soloSinEnvio, soloOfertas }) {
  const dispatch = useDispatch()
  const [pagina, setPagina] = useState(0)
  
  // Extraemos estado de Redux
  const { catalogo: resultado, loading: cargando, error } = useSelector(state => state.productos)
  const misPublicaciones = useSelector(state => state.productos.misPublicaciones)
  const misIds = new Set(misPublicaciones.map(p => p.id))

  const condicion = conditions.length === 1 ? (conditions[0] === 'Nuevo' ? 'NUEVO' : 'USADO') : undefined

  const filtros = {
    idCategoria: selectedSubcategory || selectedCategory,
    nombre: searchTerm.trim(),
    enOferta: soloOfertas || undefined,
    admiteEnvio: soloConEnvio ? true : soloSinEnvio ? false : undefined,
    condicion,
    provincia,
    precioMin: rango.precioMin,
    precioMax: rango.precioMax,
    anioDesde: rango.anioDesde,
    anioHasta: rango.anioHasta,
    orden,
  }
  const claveFiltros = JSON.stringify(filtros)

  useEffect(() => { setPagina(0) }, [claveFiltros])

  // Despacha la búsqueda del catálogo mediante Redux
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchCatalogo({ filtros: JSON.parse(claveFiltros), pagina, tamanio: POR_PAGINA }))
    }, 300)
    return () => clearTimeout(timer)
  }, [claveFiltros, pagina, dispatch])

  // Si es cliente, cargamos sus publicaciones para saber cuáles son suyas
  useEffect(() => {
    if (user?.role === 'cliente') {
      dispatch(fetchMisPublicaciones())
    }
  }, [user, dispatch])

  const irAPagina = (nueva) => {
    setPagina(nueva)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (cargando && resultado.items.length === 0) {
    return <div className="post-list-mensaje">Cargando productos...</div>
  }

  if (error) {
    return <div className="post-list-mensaje post-list-error">{error}</div>
  }

  return (
    <>
      {resultado.total > 0 && (
        <p className="post-list-total">{resultado.total} {resultado.total === 1 ? 'resultado' : 'resultados'}</p>
      )}

      <div className="post-list-grid" style={cargando ? { opacity: 0.6 } : undefined}>
        {resultado.items.length > 0 ? (
          resultado.items.map((post) => (
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
              conEnvio={post.conEnvio}
              enOferta={post.enOferta}
              porcentajeDescuento={post.porcentajeDescuento}
              precioOriginal={post.precioOriginal}
              nivelDestacado={post.nivelDestacado}
              esMiProducto={misIds.has(post.id)}
              esAdmin={user?.role === 'admin'}
            />
          ))
        ) : (
          <div className="post-list-mensaje">
            No se encontraron productos con estos filtros.
          </div>
        )}
      </div>

      {resultado.totalPaginas > 1 && (
        <nav className="post-list-paginacion" aria-label="Páginas">
          <button disabled={pagina === 0} onClick={() => irAPagina(pagina - 1)}>
            <i className="fa-solid fa-chevron-left"></i> Anterior
          </button>
          {Array.from({ length: resultado.totalPaginas }, (_, i) => (
            <button key={i} className={i === pagina ? 'activa' : ''} onClick={() => irAPagina(i)}>{i + 1}</button>
          ))}
          <button disabled={pagina >= resultado.totalPaginas - 1} onClick={() => irAPagina(pagina + 1)}>
            Siguiente <i className="fa-solid fa-chevron-right"></i>
          </button>
        </nav>
      )}
    </>
  )
}

export default PostList
