import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrden, nombreProvincia } from '../api/ordenes'
import { ESTADOS_ENVIO, getMisEnvios, getTodosLosEnvios } from '../api/envios'
import ChatOrden from '../components/ChatOrden'
import './DetalleOrden.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

const ESTADOS_ORDEN = {
  PENDIENTE: { texto: 'Pendiente de pago', color: '#f59e0b' },
  PAGADA: { texto: 'Pagada', color: '#16a34a' },
  CANCELADA: { texto: 'Cancelada', color: '#ef4444' },
}

// Pasos del seguimiento segun como se entrega.
const PASOS = {
  DESPACHO: ['PENDIENTE', 'DESPACHADO', 'EN_TRANSITO', 'ENTREGADO'],
  COORDINAR: ['PENDIENTE', 'ENTREGADO'],
}

// Detalle de una orden (GET /ordenes/{id}): la ven su comprador, su vendedor y
// el admin. Si ya se pago, muestra tambien el seguimiento del envio y el chat
// para coordinar la entrega.
function DetalleOrden({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orden, setOrden] = useState(null)
  const [envio, setEnvio] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrden(id).then(setOrden).catch(err => setError(err.message))
    const envios = user?.role === 'admin' ? getTodosLosEnvios() : getMisEnvios()
    envios.then(lista => setEnvio(lista.find(e => String(e.idOrden) === String(id)) ?? null)).catch(() => {})
  }, [id, user?.role])

  if (error) return <div className="detalle-orden"><p className="post-list-mensaje post-list-error">{error}</p></div>
  if (!orden) return <div className="detalle-orden"><p className="post-list-mensaje">Cargando orden...</p></div>

  const estado = ESTADOS_ORDEN[orden.estado] ?? { texto: orden.estado, color: '#6b7280' }
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

        {orden.estado === 'PENDIENTE' && <p className="panel-producto-meta">El envío se prepara cuando se confirme el pago.</p>}
        {orden.estado === 'CANCELADA' && <p className="panel-producto-meta">La orden fue cancelada.</p>}

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

      {orden.estado === 'PAGADA' && <ChatOrden orden={orden} user={user} />}
    </div>
  )
}

export default DetalleOrden
