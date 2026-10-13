import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditProductForm from '../components/EditProductForm'
import { cambiarEstadoPublicacion, darDeBajaProducto, getDashboard, getMisPublicaciones, subirFoto } from '../api/productos'
import { cancelarOrden, getMisVentas, nombreProvincia } from '../api/ordenes'
import { cambiarEstadoEnvio, ESTADOS_ENVIO, getMisEnvios } from '../api/envios'
import './PanelStyles.css'

const ESTADOS_PUBLICACION = {
  PUBLICADO: { texto: 'Publicado', clase: 'publicado' },
  PAUSADO: { texto: 'Pausado', clase: 'pausado' },
  BORRADOR: { texto: 'Borrador · sin foto aprobada', clase: 'borrador' },
}

const ESTADOS_ORDEN = {
  PENDIENTE: { texto: 'Pendiente de pago', color: '#f59e0b' },
  PAGADA: { texto: 'Pagada', color: '#16a34a' },
  CANCELADA: { texto: 'Cancelada', color: '#ef4444' },
}

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

// Panel del vendedor: sus publicaciones (GET /productos/mis-publicaciones) y lo
// que le compraron (GET /ordenes/mis-ventas). Cada accion actualiza la fila
// con lo que devuelve el backend.
function VendedorPanel({ setModalMessage }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('publicaciones')

  const [publicaciones, setPublicaciones] = useState([])
  const [ventas, setVentas] = useState([])
  // Envio de cada venta pagada, por id de orden.
  const [envios, setEnvios] = useState({})
  const [dashboard, setDashboard] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [ocupado, setOcupado] = useState(null)

  // Un solo input de archivo para todas las filas: se recuerda para que
  // producto se abrio.
  const inputFoto = useRef(null)
  const [fotoPara, setFotoPara] = useState(null)

  const cargar = async () => {
    setError('')
    try {
      const [mias, vendidas, lista, tablero] = await Promise.all([
        getMisPublicaciones(), getMisVentas(), getMisEnvios(), getDashboard(),
      ])
      setPublicaciones(mias)
      setVentas(vendidas)
      setEnvios(Object.fromEntries(lista.map(e => [e.idOrden, e])))
      setDashboard(tablero)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const reemplazar = (actualizado) =>
    setPublicaciones(prev => prev.map(p => p.id === actualizado.id ? actualizado : p))

  const handleSaveProduct = (actualizado) => {
    reemplazar(actualizado)
    setEditando(null)
    setModalMessage?.('¡Producto actualizado con éxito!')
  }

  const alternarPausa = async (producto) => {
    setOcupado(producto.id)
    try {
      reemplazar(await cambiarEstadoPublicacion(producto.id, producto.estadoPublicacion === 'PAUSADO' ? 'PUBLICADO' : 'PAUSADO'))
    } catch (err) {
      setModalMessage?.(err.message)
    } finally {
      setOcupado(null)
    }
  }

  const darDeBaja = async (producto) => {
    if (!window.confirm(`¿Eliminar "${producto.title}"? Sale del catálogo y de los carritos, y no se puede deshacer desde acá.`)) return
    setOcupado(producto.id)
    try {
      await darDeBajaProducto(producto.id)
      setPublicaciones(prev => prev.filter(p => p.id !== producto.id))
    } catch (err) {
      setModalMessage?.(err.message)
    } finally {
      setOcupado(null)
    }
  }

  const elegirFoto = (producto) => {
    setFotoPara(producto)
    inputFoto.current.click()
  }

  const handleFoto = async (e) => {
    const archivo = e.target.files[0]
    e.target.value = null
    if (!archivo || !fotoPara) return
    setOcupado(fotoPara.id)
    try {
      const foto = await subirFoto(fotoPara.id, archivo)
      // La subida cambia el estado (un borrador queda publicado): se recarga.
      await cargar()
      setModalMessage?.(foto.estadoVerificacion === 'APROBADA'
        ? 'Foto agregada.'
        : 'Foto subida. Queda en revisión hasta que la apruebe un administrador; si el producto estaba en borrador, se publica en ese momento.')
    } catch (err) {
      setModalMessage?.(err.message)
    } finally {
      setOcupado(null)
      setFotoPara(null)
    }
  }

  const cancelarVenta = async (orden) => {
    if (!window.confirm(`¿Cancelar la orden #${orden.id}? El stock vuelve a quedar disponible.`)) return
    try {
      const actualizada = await cancelarOrden(orden.id)
      setVentas(prev => prev.map(v => v.id === actualizada.id ? actualizada : v))
      cargar()
    } catch (err) {
      setModalMessage?.(err.message)
    }
  }

  // Despachar genera el numero de seguimiento que despues carga el despachante.
  const despachar = async (envio) => {
    if (!window.confirm(`¿Despachar la orden #${envio.idOrden}? Se genera el número de seguimiento para la etiqueta.`)) return
    try {
      const actualizado = await cambiarEstadoEnvio(envio.id, 'DESPACHADO')
      setEnvios(prev => ({ ...prev, [actualizado.idOrden]: actualizado }))
      setModalMessage?.(`Envío despachado. Número de seguimiento: ${actualizado.numeroSeguimiento}`)
    } catch (err) {
      setModalMessage?.(err.message)
    }
  }

  const filaVacia = (colSpan, texto) => (
    <tr><td colSpan={colSpan} className="empty-state" style={error ? { color: '#b91c1c' } : undefined}>{texto}</td></tr>
  )

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'resumen' ? 'active' : ''} onClick={() => setActiveTab('resumen')}>Resumen</button>
        <button className={activeTab === 'publicaciones' ? 'active' : ''} onClick={() => setActiveTab('publicaciones')}>Mis Publicaciones ({publicaciones.length})</button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Órdenes Recibidas ({ventas.length})</button>
        <button className="panel-tab-accion" onClick={() => navigate('/publicar')}>
          <i className="fa-solid fa-plus"></i> Publicar producto
        </button>
      </nav>

      <input ref={inputFoto} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />

      {activeTab === 'resumen' && (
        cargando ? <p className="empty-state">Cargando tu resumen...</p>
          : error ? <p className="empty-state" style={{ color: '#b91c1c' }}>{error}</p>
          : dashboard && (
            <div className="dashboard">
              <section className="dashboard-bloque">
                <h3><i className="fa-solid fa-bell"></i> Requiere tu atención</h3>
                <div className="dashboard-tiles">
                  <div className="dashboard-tile"><strong>{dashboard.requiereAccion.aDespachar}</strong><span>Ventas para despachar</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.requiereAccion.aCoordinar}</strong><span>Entregas a coordinar</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.requiereAccion.borradoresSinFoto}</strong><span>Borradores sin foto</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.requiereAccion.fotosEnRevision}</strong><span>Fotos en revisión</span></div>
                </div>
              </section>

              <section className="dashboard-bloque">
                <h3><i className="fa-solid fa-sack-dollar"></i> Plata</h3>
                <div className="dashboard-tiles">
                  <div className="dashboard-tile destacado"><strong>{formatMoney(dashboard.plata.ingresos)}</strong><span>Ingresos totales</span></div>
                  <div className="dashboard-tile"><strong>{formatMoney(dashboard.plata.ingresosEsteMes)}</strong><span>Este mes</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.plata.ventas}</strong><span>Ventas cobradas</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.plata.pendientesDeCobro}</strong><span>Pendientes de cobro</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.plata.canceladas}</strong><span>Canceladas</span></div>
                </div>
              </section>

              <section className="dashboard-bloque">
                <h3><i className="fa-solid fa-chart-line"></i> Rendimiento</h3>
                <div className="dashboard-tiles">
                  <div className="dashboard-tile"><strong>{dashboard.rendimiento.visitas}</strong><span>Visitas a tus publicaciones</span></div>
                  <div className="dashboard-tile"><strong>{/* El backend ya la manda en porcentaje (ej. 3.57) */}
                    {dashboard.rendimiento.conversion != null ? `${dashboard.rendimiento.conversion.toFixed(1)}%` : '—'}</strong><span>Conversión (ventas / visitas)</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.rendimiento.guardadosEnWishlist}</strong><span>Guardados en listas de deseos</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.rendimiento.masVendido?.nombre ?? '—'}</strong><span>Más vendido{dashboard.rendimiento.masVendido ? ` (${dashboard.rendimiento.masVendido.cantidad})` : ''}</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.rendimiento.masVisto?.nombre ?? '—'}</strong><span>Más visto{dashboard.rendimiento.masVisto ? ` (${dashboard.rendimiento.masVisto.cantidad})` : ''}</span></div>
                </div>
              </section>

              <section className="dashboard-bloque">
                <h3><i className="fa-solid fa-star"></i> Reputación</h3>
                <div className="dashboard-tiles">
                  <div className="dashboard-tile"><strong>{dashboard.reputacion.promedio != null ? `${dashboard.reputacion.promedio.toFixed(1)} ★` : '—'}</strong><span>Promedio</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.reputacion.cantidadResenas}</strong><span>Reseñas</span></div>
                  <div className="dashboard-tile"><strong>{dashboard.reputacion.diasPromedioDespacho != null ? `${dashboard.reputacion.diasPromedioDespacho.toFixed(1)} días` : '—'}</strong><span>Tiempo promedio de despacho</span></div>
                </div>
                {dashboard.reputacion.ultimasResenas?.length > 0 && (
                  <ul className="dashboard-resenas">
                    {dashboard.reputacion.ultimasResenas.map(r => (
                      <li key={r.id}>
                        <span className="dashboard-estrellas">{'★'.repeat(r.puntaje)}{'☆'.repeat(5 - r.puntaje)}</span>
                        <strong>{r.nombreProducto}</strong>
                        {r.comentario && <span>“{r.comentario}”</span>}
                        <small>— {r.autor?.nombreUsuario}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )
      )}

      <main className="panel-content" style={activeTab === 'resumen' ? { display: 'none' } : undefined}>
        {activeTab === 'publicaciones' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>PRECIO</th>
                <th>STOCK</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? filaVacia(5, 'Cargando tus publicaciones...')
                : error ? filaVacia(5, error)
                : publicaciones.length === 0 ? filaVacia(5, 'Todavía no publicaste nada.')
                : publicaciones.map(p => {
                  const estado = ESTADOS_PUBLICACION[p.estadoPublicacion] ?? { texto: p.estadoPublicacion, clase: '' }
                  const trabajando = ocupado === p.id
                  return (
                    <tr key={p.id} style={trabajando ? { opacity: 0.5 } : undefined}>
                      <td>
                        <div className="panel-producto">
                          {p.image
                            ? <img src={p.image} alt={p.title} />
                            : <div className="panel-producto-sin-foto"><i className="fa-regular fa-image"></i></div>}
                          <div>
                            <strong
                              style={{ cursor: p.estadoPublicacion === 'PUBLICADO' ? 'pointer' : 'default' }}
                              onClick={() => p.estadoPublicacion === 'PUBLICADO' && navigate(`/product/${p.id}`)}
                            >
                              {p.title}
                            </strong>
                            <div className="panel-producto-meta">
                              {p.categoria?.nombre} · {p.condition} · {nombreProvincia(p.provincia)}
                              {p.conEnvio && ' · Con envío'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.enOferta && <div className="panel-precio-tachado">{formatMoney(p.precioOriginal)}</div>}
                        <strong>{formatMoney(p.price)}</strong>
                        {p.enOferta && <span className="panel-descuento">{p.porcentajeDescuento}% OFF</span>}
                      </td>
                      <td><strong style={p.stock === 0 ? { color: '#ef4444' } : undefined}>{p.stock}</strong></td>
                      <td><span className={`badge-estado ${estado.clase}`}>{estado.texto}</span></td>
                      <td className="text-right">
                        <div className="panel-acciones">
                          <button className="btn-icon-edit" title="Editar" disabled={trabajando} onClick={() => setEditando(p)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="btn-icon-edit" title="Agregar foto" disabled={trabajando} onClick={() => elegirFoto(p)}>
                            <i className="fa-solid fa-camera"></i>
                          </button>
                          {p.estadoPublicacion !== 'BORRADOR' && (
                            <button className="btn-icon-edit" title={p.estadoPublicacion === 'PAUSADO' ? 'Reanudar' : 'Pausar'} disabled={trabajando} onClick={() => alternarPausa(p)}>
                              <i className={`fa-solid ${p.estadoPublicacion === 'PAUSADO' ? 'fa-play' : 'fa-pause'}`}></i>
                            </button>
                          )}
                          <button className="btn-icon-delete" title="Eliminar" disabled={trabajando} onClick={() => darDeBaja(p)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'ordenes' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>ORDEN #</th>
                <th>FECHA</th>
                <th>CLIENTE</th>
                <th>PRODUCTOS</th>
                <th>ENTREGA</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? filaVacia(7, 'Cargando tus ventas...')
                : error ? filaVacia(7, error)
                : ventas.length === 0 ? filaVacia(7, 'No hay órdenes recibidas aún.')
                : ventas.map(v => {
                  const estado = ESTADOS_ORDEN[v.estado] ?? { texto: v.estado, color: '#6b7280' }
                  const envio = envios[v.id]
                  const estadoEnvio = envio && ESTADOS_ENVIO[envio.estado]
                  return (
                    <tr key={v.id}>
                      <td><button className="panel-link" style={{ fontSize: '14px' }} onClick={() => navigate(`/orden/${v.id}`)}>#{v.id}</button></td>
                      <td>{v.fecha}</td>
                      <td>
                        <strong>{v.comprador?.nombreUsuario}</strong>
                        <div className="panel-producto-meta">{v.comprador?.nombre} {v.comprador?.apellido}</div>
                      </td>
                      <td>
                        {v.items.map(item => (
                          <div key={item.id} style={{ fontSize: '13px' }}>{item.nombre} × {item.cantidad}</div>
                        ))}
                        <strong style={{ fontSize: '13px' }}>{formatMoney(v.total)}</strong>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {v.metodoEntrega === 'DESPACHO'
                          ? <>Envío a {v.entrega?.calle}, {v.entrega?.localidad}, {nombreProvincia(v.entrega?.provincia)}</>
                          : 'A coordinar'}
                      </td>
                      <td>
                        <span style={{ color: estado.color, fontWeight: 'bold' }}>{estado.texto}</span>
                        {estadoEnvio && (
                          <div style={{ color: estadoEnvio.color, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                            <i className={`fa-solid ${estadoEnvio.icono}`}></i> {estadoEnvio.texto}
                            {envio.numeroSeguimiento && <div className="panel-producto-meta">Seguimiento: {envio.numeroSeguimiento}</div>}
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        {envio?.metodoEntrega === 'DESPACHO' && envio.estado === 'PENDIENTE' && (
                          <button className="btn-new-user" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => despachar(envio)}>
                            <i className="fa-solid fa-truck"></i> Despachar
                          </button>
                        )}
                        {v.estado === 'PENDIENTE' && (
                          <button className="btn-icon-delete" title="Cancelar orden" onClick={() => cancelarVenta(v)}>
                            <i className="fa-solid fa-ban"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </main>

      {editando && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <EditProductForm
            producto={editando}
            onClose={(huboCambios) => { setEditando(null); if (huboCambios) cargar() }}
            onSave={handleSaveProduct}
          />
        </div>
      )}
    </div>
  )
}

export default VendedorPanel
