import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchOrdenDetalle } from '../redux/slice/ordenesSlice'
import { fetchMisEnvios, fetchTodosLosEnvios } from '../redux/slice/enviosSlice'
import { ESTADOS_ENVIO } from '../api/envios'
import { nombreProvincia } from '../api/ordenes'
import ChatOrden from '../components/ChatOrden'
import './DetalleOrden.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

const ESTADOS_ORDEN = {
  PENDIENTE: { texto: 'Pendiente de pago', color: '#f59e0b' },
  PAGADA: { texto: 'Pagada', color: '#16a34a' },
  CANCELADA: { texto: 'Cancelada', color: '#ef4444' },
}

const PASOS = {
  DESPACHO: ['PENDIENTE', 'DESPACHADO', 'EN_TRANSITO', 'ENTREGADO'],
  COORDINAR: ['PENDIENTE', 'ENTREGADO'],
}

function DetalleOrden({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  

  const { ordenActual: orden, loading, error } = useSelector(state => state.ordenes)
  const { enCurso, todos } = useSelector(state => state.envios)

  // Carga inicial de datos (solo al montar o cambiar el ID/rol)
  useEffect(() => {
    dispatch(fetchOrdenDetalle(id))
    
    if (user?.role === 'admin') {
      dispatch(fetchTodosLosEnvios())
    } else {
      dispatch(fetchMisEnvios())
    }
  }, [id, user?.role, dispatch])

  if (error) return <div className="detalle-orden"><p className="post-list-mensaje post-list-error">{error}</p></div>
  if (loading || !orden) return <div className="detalle-orden"><p className="post-list-mensaje">Cargando orden...</p></div>

  // Determinamos el envío actual sin causar bucles de renderizado
  const envios = user?.role === 'admin' ? todos : enCurso
  const envio = envios.find(e => String(e.idOrden) === String(id)) ?? null

  const estado = ESTADOS_ORDEN[orden.estado?.toUpperCase()] ?? { texto: orden.estado, color: '#6b7280' }
  const pasos = PASOS[orden.metodoEntrega] ?? PASOS.DESPACHO
  const pasoActual = envio ? pasos.indexOf(envio.estado) : -1

  return (
    <div className="detalle-orden">
      <button className="back-btn" onClick={() => navigate(-1)}><i className="fa-solid fa-arrow-left"></i> Volver</button>

      <header className="detalle-orden-header">
        <div>
          <h1>Orden #{orden.id}</h1>
          <p>{orden.fecha} · {orden.comprador?.nombreUsuario} le compró a {orden.vendedor?.nombreUsuario}</p>
        </div>
        <span className="detalle-orden-estado" style={{ color: estado.color, borderColor: estado.color }}>{estado.texto}</span>
      </header>

      <section className="detalle-orden-card">
        <h2>Productos</h2>
        {orden.items.map(item => (
          <div key={item.id} className="detalle-orden-item">
            <button className="panel-link" style={{ fontSize: '15px' }} onClick={() => navigate(`/product/${item.idProducto}`)}>{item.nombre}</button>
            <span>{formatMoney(item.precioFinal)} × {item.cantidad}</span>
            <strong>{formatMoney(item.total)}</strong>
          </div>
        ))}
        <div className="detalle-orden-total"><span>Total</span><strong>{formatMoney(orden.total)}</strong></div>
      </section>

      <section className="detalle-orden-card">
        <h2>Entrega</h2>
        {orden.metodoEntrega === 'DESPACHO' ? (
          <p><i className="fa-solid fa-truck"></i> Envío a domicilio: {orden.entrega?.calle}, {orden.entrega?.localidad}, {nombreProvincia(orden.entrega?.provincia)}</p>
        ) : (
          <p><i className="fa-solid fa-handshake"></i> Entrega a coordinar entre comprador y vendedor.</p>
        )}

        {orden.estado?.toUpperCase() === 'PENDIENTE' && <p className="panel-producto-meta">El envío se prepara cuando se confirme el pago.</p>}
        {orden.estado?.toUpperCase() === 'CANCELADA' && <p className="panel-producto-meta">La orden fue cancelada.</p>}

        {envio && (
          <>
            <ol className="detalle-orden-pasos">
              {pasos.map((paso, i) => (
                <li key={paso} className={i <= pasoActual ? 'hecho' : ''}>
                  <span className="detalle-orden-punto"><i className={`fa-solid ${ESTADOS_ENVIO[paso].icono}`}></i></span>
                  {ESTADOS_ENVIO[paso].texto}
                </li>
              ))}
            </ol>
            <div className="detalle-orden-envio-datos">
              {envio.numeroSeguimiento && <span>Seguimiento: <strong>{envio.numeroSeguimiento}</strong></span>}
              {envio.fechaDespacho && <span>Despachado: {envio.fechaDespacho}</span>}
              {envio.despachante && <span>Lo lleva: {envio.despachante.nombre} {envio.despachante.apellido}</span>}
              {envio.fechaEntrega && <span>Entregado: {envio.fechaEntrega}</span>}
            </div>
          </>
        )}
      </section>

      {orden.estado?.toUpperCase() === 'PAGADA' && (
        <ChatOrden orden={orden} user={user} envio={envio} />
      )}
      
    </div>
  )
}

export default DetalleOrden