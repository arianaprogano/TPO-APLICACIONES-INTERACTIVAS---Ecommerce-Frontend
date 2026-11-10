import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PostCard from '../components/PostCard'
import { fetchProductosDeVendedor } from '../redux/slice/productosSlice'
import { fetchCalificacionVendedor } from '../redux/slice/resenasSlice'
import { NIVELES_VENDEDOR } from '../api/resenas'
import './PerfilVendedor.css'

function PerfilVendedor({ user }) {
  const { nombreUsuario } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const calificacion = useSelector(state => state.resenas.calificacionVendedor)
  const { delVendedor: productos, error } = useSelector(state => state.productos)

  useEffect(() => {
    dispatch(fetchCalificacionVendedor(nombreUsuario))
    dispatch(fetchProductosDeVendedor(nombreUsuario))
  }, [nombreUsuario, dispatch])

  const nivel = NIVELES_VENDEDOR[calificacion?.nivel] ?? NIVELES_VENDEDOR.SIN_CALIFICAR
  const esYo = user?.username === nombreUsuario

  return (
    <div className="perfil-vendedor">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i> Volver
      </button>

      <header className="perfil-vendedor-header">
        <div className="perfil-vendedor-avatar">{nombreUsuario.charAt(0).toUpperCase()}</div>
        <div>
          <h1>@{nombreUsuario} {esYo && <span className="perfil-vendedor-yo">Sos vos</span>}</h1>
          <div className="perfil-vendedor-nivel" style={{ color: nivel.color }}>
            <i className={`fa-solid ${nivel.icono}`}></i> {nivel.texto}
          </div>
        </div>
        <div className="perfil-vendedor-stats">
          <div>
            <strong>{calificacion?.promedio != null ? calificacion.promedio.toFixed(1) : '—'}</strong>
            <span><i className="fa-solid fa-star"></i> Calificación</span>
          </div>
          <div>
            <strong>{calificacion?.cantidad ?? 0}</strong>
            <span>Reseñas</span>
          </div>
          <div>
            <strong>{productos?.length ?? '—'}</strong>
            <span>Publicaciones</span>
          </div>
        </div>
      </header>

      <h2 className="perfil-vendedor-titulo">Publicaciones</h2>
      {error ? (
        <p className="post-list-mensaje post-list-error">{error}</p>
      ) : productos === null ? (
        <p className="post-list-mensaje">Cargando publicaciones...</p>
      ) : productos.length === 0 ? (
        <p className="post-list-mensaje">Este vendedor no tiene publicaciones activas.</p>
      ) : (
        <div className="post-list-grid">
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
              conEnvio={post.conEnvio}
              enOferta={post.enOferta}
              porcentajeDescuento={post.porcentajeDescuento}
              precioOriginal={post.precioOriginal}
              nivelDestacado={post.nivelDestacado}
              esMiProducto={esYo}
              esAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PerfilVendedor
