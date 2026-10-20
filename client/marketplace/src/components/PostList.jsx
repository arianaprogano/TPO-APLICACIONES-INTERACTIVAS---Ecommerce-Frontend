import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { getMisPublicaciones, getPaginaProductos } from '../api/productos'
import './PostList.css'

const POR_PAGINA = 12

// Todos los filtros y la paginacion los resuelve el backend (GET /productos):
// asi cada pagina viene llena y el total es el real.
function PostList({ user, addToCart, orden, searchTerm, selectedCategory, selectedSubcategory, conditions, provincia, rango, favorites, toggleFavorite, soloConEnvio, soloSinEnvio, soloOfertas }) {
  const [resultado, setResultado] = useState({ items: [], pagina: 0, totalPaginas: 0, total: 0 })
  const [pagina, setPagina] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [misIds, setMisIds] = useState(new Set())
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

  useEffect(() => {
    let cancelado = false
    const timer = setTimeout(async () => {
      setCargando(true)
      setError('')
      try {
        const respuesta = await getPaginaProductos(JSON.parse(claveFiltros), pagina, POR_PAGINA)
        if (!cancelado) setResultado(respuesta)
      } catch (err) {
        if (!cancelado) setError(err.message)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }, 300)
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [claveFiltros, pagina])

  useEffect(() => {
    if (user?.role !== 'cliente') {
      setMisIds(new Set())
      return
    }
    getMisPublicaciones()
      .then((mios) => setMisIds(new Set(mios.map((p) => p.id))))
      .catch(() => setMisIds(new Set()))
  }, [user])

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
              isFavorite={favorites.includes(post.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
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
