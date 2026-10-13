import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reviews from '../components/Reviews'
import { cancelarOrden, getMisCompras, nombreProvincia } from '../api/ordenes'
import { crearResena, getResenasDeProducto } from '../api/resenas'
import { cambiarEstadoEnvio, ESTADOS_ENVIO, getMisEnvios } from '../api/envios'
import './PanelStyles.css'

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente de pago', color: '#f59e0b', icono: 'fa-clock' },
  PAGADA: { texto: 'Pagada', color: '#16a34a', icono: 'fa-check' },
  CANCELADA: { texto: 'Cancelada', color: '#ef4444', icono: 'fa-xmark' },
}

// Las ordenes salen de GET /ordenes/mis-compras. Cada orden es de un solo
// vendedor pero puede tener varios productos, y la opinion se deja por
// producto: por eso el boton va en cada renglon y no en la orden.
function MisCompras({ user, setModalMessage }) {
  const navigate = useNavigate()

  const [compras, setCompras] = useState([])
  // Envio de cada orden pagada, por id de orden.
  const [envios, setEnvios] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoAReseñar, setProductoAReseñar] = useState(null)
  // "idOrden-idProducto" de lo que ya se califico en esta sesion.
  const [reseñados, setReseñados] = useState(new Set())

  // El backend no tiene "mis reseñas": para no ofrecer "Opinar" sobre algo
  // ya calificado, se miran las reseñas de los productos ya entregados.
  const marcarYaReseñados = async (ordenes, enviosPorOrden) => {
    const entregadas = ordenes.filter(o => enviosPorOrden[o.id]?.estado === 'ENTREGADO')
    const productos = [...new Set(entregadas.flatMap(o => o.items.map(i => i.idProducto)))]
    const propias = new Set()
    await Promise.all(productos.map(async (idProducto) => {
      const resenas = await getResenasDeProducto(idProducto).catch(() => [])
      if (resenas.some(r => r.autor === user?.username)) {
        entregadas.filter(o => o.items.some(i => i.idProducto === idProducto))
          .forEach(o => propias.add(`${o.id}-${idProducto}`))
      }
    }))
    setReseñados(propias)
  }

  const cargar = () =>
    Promise.all([getMisCompras(), getMisEnvios()])
      .then(([ordenes, lista]) => {
        const porOrden = Object.fromEntries(lista.map(e => [e.idOrden, e]))
        setCompras(ordenes)
        setEnvios(porOrden)
        return marcarYaReseñados(ordenes, porOrden)
      })
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))

  useEffect(() => { cargar() }, [])

  // En las entregas a coordinar no hay despachante: lo confirma el comprador.
  const confirmarRecepcion = async (envio) => {
    if (!window.confirm('¿Confirmás que ya recibiste esta compra? Después vas a poder dejar tu opinión.')) return
    try {
      const actualizado = await cambiarEstadoEnvio(envio.id, 'ENTREGADO')
      setEnvios(prev => ({ ...prev, [actualizado.idOrden]: actualizado }))
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Debes iniciar sesión para ver tus compras.</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ir a Iniciar Sesión
        </button>
      </div>
    )
  }

  const handleCancelar = async (orden) => {
    if (!window.confirm(`¿Cancelar la orden #${orden.id}? El stock vuelve a quedar disponible.`)) return
    try {
      const actualizada = await cancelarOrden(orden.id)
      setCompras(prev => prev.map(c => c.id === actualizada.id ? actualizada : c))
    } catch (err) {
      setModalMessage(err.message)
    }
  }

  const handleReviewSaved = async (ordenId, reseñaData) => {
    try {
      await crearResena({
        idOrden: ordenId,
        idProducto: reseñaData.productoId,
        puntaje: reseñaData.estrellas,
        comentario: reseñaData.texto,
      })
      setReseñados(prev => new Set(prev).add(`${ordenId}-${reseñaData.productoId}`))
      setProductoAReseñar(null)
      setModalMessage('¡Gracias por tu opinión! Tu reseña ha sido guardada con éxito.')
    } catch (err) {
      setProductoAReseñar(null)
      setModalMessage(err.message)
    }
  }

  const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount)

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className="active">Mis Compras Realizadas</button>
      </nav>

      <main className="panel-content" style={{ minHeight: '400px', width: '100%' }}>
        <table className="panel-table">
          <thead>
            <tr>
              <th>FECHA / ORDEN</th>
              <th>PRODUCTOS</th>
              <th>ENTREGA</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="5" className="empty-state">Cargando tus compras...</td></tr>
            ) : error ? (
              <tr><td colSpan="5" className="empty-state" style={{ color: '#b91c1c' }}>{error}</td></tr>
            ) : compras.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No has realizado ninguna compra aún.</td>
              </tr>
            ) : (
              compras.map(compra => {
                const estado = ESTADOS[compra.estado] ?? { texto: compra.estado, color: '#6b7280', icono: 'fa-circle' }
                const envio = envios[compra.id]
                const estadoEnvio = envio && ESTADOS_ENVIO[envio.estado]
                // Se opina recien cuando el producto llego: es lo que exige el backend.
                const puedeOpinar = envio?.estado === 'ENTREGADO'
                return (
                  <tr key={compra.id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{compra.fecha}</div>
                      <button className="panel-link" onClick={() => navigate(`/orden/${compra.id}`)}>#{compra.id} · Ver detalle</button>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Vendedor: {compra.vendedor?.nombreUsuario}</div>
                    </td>
                    <td>
                      {compra.items.map(item => {
                        const clave = `${compra.id}-${item.idProducto}`
                        return (
                          <div key={item.id} style={{ marginBottom: '8px' }}>
                            <strong style={{ cursor: 'pointer', color: '#16a34a' }} onClick={() => navigate(`/product/${item.idProducto}`)}>
                              {item.nombre}
                            </strong>
                            <span style={{ fontSize: '13px', color: '#4b5563' }}> × {item.cantidad} · {formatMoney(item.total)}</span>
                            {puedeOpinar && (
                              reseñados.has(clave) ? (
                                <span style={{ marginLeft: '8px', color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>Ya opinaste</span>
                              ) : (
                                <button
                                  onClick={() => setProductoAReseñar({ id: compra.id, productoId: item.idProducto, productoTitulo: item.nombre })}
                                  style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#f97316', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  <i className="fa-solid fa-star"></i> Opinar
                                </button>
                              )
                            )}
                          </div>
                        )
                      })}
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Total: {formatMoney(compra.total)}</div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#4b5563' }}>
                      {compra.metodoEntrega === 'DESPACHO' ? (
                        <>
                          <div><i className="fa-solid fa-truck"></i> Envío a domicilio</div>
                          {compra.entrega?.calle && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {compra.entrega.calle}, {compra.entrega.localidad}, {nombreProvincia(compra.entrega.provincia)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div><i className="fa-solid fa-handshake"></i> A coordinar con el vendedor</div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: estado.color, fontWeight: 'bold' }}>
                        <i className={`fa-solid ${estado.icono}`}></i> {estado.texto}
                      </span>
                      {estadoEnvio && (
                        <div style={{ color: estadoEnvio.color, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                          <i className={`fa-solid ${estadoEnvio.icono}`}></i> {estadoEnvio.texto}
                          {envio.numeroSeguimiento && <div className="panel-producto-meta">Seguimiento: {envio.numeroSeguimiento}</div>}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {envio?.metodoEntrega === 'COORDINAR' && envio.estado === 'PENDIENTE' && (
                        <button className="btn-new-user" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => confirmarRecepcion(envio)}>
                          <i className="fa-solid fa-check"></i> Ya lo recibí
                        </button>
                      )}
                      {compra.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleCancelar(compra)}
                          style={{ backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </main>

      {productoAReseñar && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <Reviews
            orden={productoAReseñar}
            onClose={() => setProductoAReseñar(null)}
            onSave={handleReviewSaved}
          />
        </div>
      )}
    </div>
  )
}

export default MisCompras
