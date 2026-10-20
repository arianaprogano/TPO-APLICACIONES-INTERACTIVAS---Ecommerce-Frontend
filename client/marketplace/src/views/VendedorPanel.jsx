import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EditProductForm from '../components/EditProductForm'
import VisibilidadModal from '../components/VisibilidadModal'
import { cambiarEstadoPublicacion, darDeBajaProducto, getDashboard, getMisPublicaciones, reactivarPublicacion } from '../api/productos'
import { cancelarOrden, getMisVentas, nombreProvincia } from '../api/ordenes'
import { cambiarEstadoEnvio, ESTADOS_ENVIO, getMisEnvios } from '../api/envios'
import './PanelStyles.css'
import { useAvisos } from '../components/avisosContext'

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
function VendedorPanel() {
  const { error: avisarError, exito, confirmar, toast } = useAvisos()
  const navigate = useNavigate()
  // Las notificaciones abren una pestaña puntual (?tab=ordenes).
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'publicaciones')
  useEffect(() => { if (searchParams.get('tab')) setActiveTab(searchParams.get('tab')) }, [searchParams])

  const [publicaciones, setPublicaciones] = useState([])
  const [ventas, setVentas] = useState([])
  // Envio de cada venta pagada, por id de orden.
  const [envios, setEnvios] = useState({})
  const [dashboard, setDashboard] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [destacando, setDestacando] = useState(null)
  const [ocupado, setOcupado] = useState(null)

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
    exito('Los cambios del producto se guardaron.', { titulo: 'Producto actualizado' })
  }

  const reactivar = async (producto) => {
    setOcupado(producto.id)
    try {
      reemplazar(await reactivarPublicacion(producto.id))
      toast(`"${producto.title}" se reactivó y volvió a Publicaciones`)
    } catch (err) {
      avisarError(err.message)
    } finally {
      setOcupado(null)
    }
  }

  const alternarPausa = async (producto) => {
    setOcupado(producto.id)
    try {
      reemplazar(await cambiarEstadoPublicacion(producto.id, producto.estadoPublicacion === 'PAUSADO' ? 'PUBLICADO' : 'PAUSADO'))
    } catch (err) {
      avisarError(err.message)
    } finally {
      setOcupado(null)
    }
  }

  const darDeBaja = async (producto) => {
    const ok = await confirmar({
      titulo: '¿Dar de baja la publicación?',
      texto: `"${producto.title}" sale del catálogo y de los carritos. Queda acá en gris y la podés reactivar cuando quieras.`,
      ok: 'Dar de baja',
      peligro: true,
    })
    if (!ok) return
    setOcupado(producto.id)
    try {
      await darDeBajaProducto(producto.id)
      setPublicaciones(prev => prev.map(p => p.id === producto.id ? { ...p, activo: false } : p))
      toast(`"${producto.title}" pasó a Publicaciones inactivas`)
    } catch (err) {
      avisarError(err.message)
    } finally {
      setOcupado(null)
    }
  }

  const cancelarVenta = async (orden) => {
    if (!(await confirmar(`¿Cancelar la orden #${orden.id}? El stock vuelve a quedar disponible.`))) return
    try {
      const actualizada = await cancelarOrden(orden.id)
      setVentas(prev => prev.map(v => v.id === actualizada.id ? actualizada : v))
      cargar()
    } catch (err) {
      avisarError(err.message)
    }
  }

  // Despachar genera el numero de seguimiento que despues carga el despachante.
  const despachar = async (envio) => {
    if (!(await confirmar(`¿Despachar la orden #${envio.idOrden}? Se genera el número de seguimiento para la etiqueta.`))) return
    try {
      const actualizado = await cambiarEstadoEnvio(envio.id, 'DESPACHADO')
      setEnvios(prev => ({ ...prev, [actualizado.idOrden]: actualizado }))
      exito('Pegale al bulto una etiqueta con este número de seguimiento. El despachante lo va a cargar para llevarlo.', {
        titulo: 'Envío despachado',
        destacado: actualizado.numeroSeguimiento,
      })
    } catch (err) {
      avisarError(err.message)
    }
  }

  // Las dadas de baja van a su propia pestaña, para poder reactivarlas.
  const activas = publicaciones.filter(p => p.activo !== false)
  const inactivas = publicaciones.filter(p => p.activo === false)
  const listaVisible = activeTab === 'inactivas' ? inactivas : activas

  const filaVacia = (colSpan, texto) => (
    <tr><td colSpan={colSpan} className="empty-state" style={error ? { color: '#b91c1c' } : undefined}>{texto}</td></tr>
  )

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'resumen' ? 'active' : ''} onClick={() => setActiveTab('resumen')}>Resumen</button>
        <button className={activeTab === 'publicaciones' ? 'active' : ''} onClick={() => setActiveTab('publicaciones')}>Publicaciones ({activas.length})</button>
        <button className={activeTab === 'inactivas' ? 'active' : ''} onClick={() => setActiveTab('inactivas')}>Publicaciones inactivas ({inactivas.length})</button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Órdenes Recibidas ({ventas.length})</button>
      </nav>

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
        {(activeTab === 'publicaciones' || activeTab === 'inactivas') && (
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
                : listaVisible.length === 0 ? filaVacia(5, activeTab === 'inactivas'
                  ? 'No tenés publicaciones dadas de baja.'
                  : 'No tenés publicaciones activas. Las dadas de baja están en "Publicaciones inactivas".')
                : listaVisible.map(p => {
                  const dadaDeBaja = p.activo === false
                  const estado = dadaDeBaja
                    ? { texto: 'Dada de baja', clase: 'baja' }
                    : ESTADOS_PUBLICACION[p.estadoPublicacion] ?? { texto: p.estadoPublicacion, clase: '' }
                  const trabajando = ocupado === p.id
                  return (
                    <tr key={p.id} className={dadaDeBaja ? 'fila-dada-de-baja' : undefined} style={trabajando ? { opacity: 0.5 } : undefined}>
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
                      <td>
                        <span className={`badge-estado ${estado.clase}`}>{estado.texto}</span>
                        {p.nivelDestacado && p.nivelDestacado !== 'NINGUNO' && (
                          <div className="badge-destacado" title={p.destacadoHasta ? `Hasta el ${p.destacadoHasta}` : undefined}>
                            <i className="fa-solid fa-rocket"></i> {p.nivelDestacado.charAt(0) + p.nivelDestacado.slice(1).toLowerCase()}
                            {p.destacadoHasta && ` · hasta ${p.destacadoHasta}`}
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        {dadaDeBaja ? (
                          <button className="btn-reactivar" disabled={trabajando} onClick={() => reactivar(p)}>
                            <i className="fa-solid fa-rotate-left"></i> Reactivar
                          </button>
                        ) : (
                          <div className="panel-acciones">
                            <button className="btn-icon-edit" title="Editar publicación (datos y fotos)" disabled={trabajando} onClick={() => setEditando(p)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            {p.estadoPublicacion === 'PUBLICADO' && (
                              <button className="btn-icon-edit" title="Comprar visibilidad" disabled={trabajando} onClick={() => setDestacando(p)}>
                                <i className="fa-solid fa-rocket"></i>
                              </button>
                            )}
                            {p.estadoPublicacion !== 'BORRADOR' && (
                              <button className="btn-icon-edit" title={p.estadoPublicacion === 'PAUSADO' ? 'Reanudar' : 'Pausar'} disabled={trabajando} onClick={() => alternarPausa(p)}>
                                <i className={`fa-solid ${p.estadoPublicacion === 'PAUSADO' ? 'fa-play' : 'fa-pause'}`}></i>
                              </button>
                            )}
                            <button className="btn-icon-delete" title="Dar de baja" disabled={trabajando} onClick={() => darDeBaja(p)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        )}
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

      {destacando && (
        <VisibilidadModal
          producto={destacando}
          onClose={() => setDestacando(null)}
          onComprado={(actualizado, compra) => {
            reemplazar(actualizado)
            setDestacando(null)
            exito(`Plan ${compra.nivel} por ${compra.meses} ${compra.meses === 1 ? 'mes' : 'meses'}. Tu publicación ya sale más arriba en el catálogo.`, { titulo: 'Visibilidad activada' })
          }}
        />
      )}

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
