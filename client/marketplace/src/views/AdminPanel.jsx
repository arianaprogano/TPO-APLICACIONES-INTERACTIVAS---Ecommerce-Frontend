import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserForm from '../components/UserForm'
import CategoryForm from '../components/CategoryForm'
import {
  cambiarRol, darDeBajaCategoria, darDeBajaProducto, darDeBajaUsuario, destacarProducto,
  getCategorias, getFotosPendientes, getHistorialDestacados, getTodasLasOrdenes,
  getTodosLosProductos, getUsuarios, marcarOrdenPagada, NIVELES_DESTACADO, reactivarProducto,
  revisarFoto,
} from '../api/admin'
import { nombreProvincia } from '../api/ordenes'
import { ESTADOS_ENVIO, getTodosLosEnvios } from '../api/envios'
import './PanelStyles.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

const ESTADOS_ORDEN = {
  PENDIENTE: { texto: 'Pendiente de pago', color: '#f59e0b' },
  PAGADA: { texto: 'Pagada', color: '#16a34a' },
  CANCELADA: { texto: 'Cancelada', color: '#ef4444' },
}

const ESTADOS_PUBLICACION = {
  PUBLICADO: { texto: 'Publicado', clase: 'publicado' },
  PAUSADO: { texto: 'Pausado', clase: 'pausado' },
  BORRADOR: { texto: 'Borrador', clase: 'borrador' },
}

const ROLES = { ADMIN: 'Administrador', CLIENTE: 'Cliente', DESPACHANTE: 'Despachante' }

// Cada pestaña trae sus datos del backend la primera vez que se abre, y cada
// accion actualiza con lo que el backend devuelve. Los errores (por ejemplo,
// borrar una categoria que todavia tiene productos) se muestran tal cual.
function AdminPanel({ user, setModalMessage }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ordenes')

  const [ordenes, setOrdenes] = useState(null)
  const [enviosPorOrden, setEnviosPorOrden] = useState({})
  const [destacados, setDestacados] = useState(null)
  const [destacando, setDestacando] = useState(null)
  const [fotos, setFotos] = useState(null)
  const [productos, setProductos] = useState(null)
  const [usuarios, setUsuarios] = useState(null)
  const [categorias, setCategorias] = useState(null)
  const [error, setError] = useState('')

  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(undefined)
  const [userToDelete, setUserToDelete] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const avisar = (mensaje) => setModalMessage?.(mensaje)

  const cargar = {
    ordenes: () => Promise.all([
      getTodasLasOrdenes().then(setOrdenes),
      getTodosLosEnvios().then(lista => setEnviosPorOrden(Object.fromEntries(lista.map(e => [e.idOrden, e])))),
    ]),
    productos: () => Promise.all([getFotosPendientes().then(setFotos), getTodosLosProductos().then(setProductos)]),
    destacados: () => getHistorialDestacados().then(setDestacados),
    usuarios: () => getUsuarios().then(setUsuarios),
    categorias: () => getCategorias().then(setCategorias),
  }

  // Se recarga solo al cambiar de pestaña: cargar se arma en cada render y
  // ponerlo como dependencia dispararia un pedido por render.
  useEffect(() => {
    setError('')
    cargar[activeTab]().catch(err => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // --- Ordenes ---
  const marcarPagada = async (orden) => {
    if (!window.confirm(`¿Confirmás que se acreditó el pago de la orden #${orden.id} (${formatMoney(orden.total)})?`)) return
    try {
      const actualizada = await marcarOrdenPagada(orden.id)
      setOrdenes(prev => prev.map(o => o.id === actualizada.id ? actualizada : o))
      // Al pagarse nace el envio: se recarga para mostrarlo.
      cargar.ordenes()
    } catch (err) {
      avisar(err.message)
    }
  }

  // --- Fotos y productos ---
  const resolverFoto = async (foto, aprobada) => {
    if (!aprobada && !window.confirm(`¿Rechazar la foto de "${foto.nombreProducto}"? Se elimina.`)) return
    try {
      await revisarFoto(foto.id, aprobada)
      // Aprobar puede publicar el producto: se recargan las dos listas.
      await cargar.productos()
    } catch (err) {
      avisar(err.message)
    }
  }

  const bajaOReactivar = async (producto) => {
    const reactivar = producto.activo === false
    if (!reactivar && !window.confirm(`¿Dar de baja "${producto.title}"? Sale del catálogo y de los carritos.`)) return
    try {
      if (reactivar) await reactivarProducto(producto.id)
      else await darDeBajaProducto(producto.id)
      await cargar.productos()
    } catch (err) {
      avisar(err.message)
    }
  }

  // Visibilidad paga: el admin la registra porque la plata se cobra por afuera.
  const guardarDestacado = async (e) => {
    e.preventDefault()
    try {
      await destacarProducto(destacando.producto.id, destacando.nivel, destacando.meses)
      setDestacando(null)
      await cargar.productos()
    } catch (err) {
      avisar(err.message)
    }
  }

  // --- Usuarios ---
  const cambiarRolUsuario = async (usuario, rol) => {
    if (!window.confirm(`¿Cambiar a ${usuario.nombreUsuario} de ${ROLES[usuario.rol]} a ${ROLES[rol]}?`)) return
    try {
      const actualizado = await cambiarRol(usuario.id, rol)
      setUsuarios(prev => prev.map(u => u.id === actualizado.id ? actualizado : u))
    } catch (err) {
      avisar(err.message)
    }
  }

  const confirmarEliminarUsuario = async () => {
    try {
      await darDeBajaUsuario(userToDelete.id)
      setUsuarios(prev => prev.filter(u => u.id !== userToDelete.id))
    } catch (err) {
      avisar(err.message)
    } finally {
      setUserToDelete(null)
    }
  }

  // --- Categorias ---
  const confirmarEliminarCategoria = async () => {
    try {
      await darDeBajaCategoria(categoryToDelete.id)
      await cargar.categorias()
    } catch (err) {
      avisar(err.message)
    } finally {
      setCategoryToDelete(null)
    }
  }

  const raices = (categorias ?? []).filter(c => c.idCategoriaPadre == null)
  // Cada principal seguida de sus subcategorias, para leer el arbol de corrido.
  const categoriasOrdenadas = raices.flatMap(r => [r, ...(categorias ?? []).filter(c => c.idCategoriaPadre === r.id)])
  const categoriasFiltradas = categoriasOrdenadas.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()) ||
    (c.nombreCategoriaPadre ?? '').toLowerCase().includes(busquedaCategoria.toLowerCase())
  )

  const usuariosFiltrados = (usuarios ?? []).filter(u => {
    const q = busquedaUsuario.toLowerCase()
    return u.mail.toLowerCase().includes(q) || u.nombreUsuario.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q)
  })

  const productosFiltrados = (productos ?? []).filter(p =>
    p.title.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    (p.vendedor?.nombreUsuario ?? '').toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  // Fila de "cargando / error / vacio" comun a todas las tablas.
  const filaEstado = (datos, colSpan, vacio) => {
    if (error) return <tr><td colSpan={colSpan} className="empty-state" style={{ color: '#b91c1c' }}>{error}</td></tr>
    if (datos === null) return <tr><td colSpan={colSpan} className="empty-state">Cargando...</td></tr>
    if (datos.length === 0) return <tr><td colSpan={colSpan} className="empty-state">{vacio}</td></tr>
    return null
  }

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Gestión de Órdenes</button>
        <button className={activeTab === 'productos' ? 'active' : ''} onClick={() => setActiveTab('productos')}>
          Productos {fotos?.length > 0 && <span className="panel-tab-contador">{fotos.length}</span>}
        </button>
        <button className={activeTab === 'destacados' ? 'active' : ''} onClick={() => setActiveTab('destacados')}>Destacados</button>
        <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>Gestión de Usuarios</button>
        <button className={activeTab === 'categorias' ? 'active' : ''} onClick={() => setActiveTab('categorias')}>Gestión de Categorías</button>
      </nav>

      {activeTab === 'ordenes' && (
        <main className="panel-content">
          <table className="panel-table">
            <thead>
              <tr><th>ORDEN</th><th>COMPRADOR → VENDEDOR</th><th>PRODUCTOS</th><th>ENTREGA</th><th>TOTAL</th><th>ESTADO</th><th className="text-right">ACCIÓN</th></tr>
            </thead>
            <tbody>
              {filaEstado(ordenes, 7, 'No hay órdenes todavía.') ?? ordenes.map(o => {
                const estado = ESTADOS_ORDEN[o.estado] ?? { texto: o.estado, color: '#6b7280' }
                return (
                  <tr key={o.id}>
                    <td><button className="panel-link" style={{ fontSize: '14px' }} onClick={() => navigate(`/orden/${o.id}`)}>#{o.id}</button><div className="panel-producto-meta">{o.fecha}</div></td>
                    <td>{o.comprador?.nombreUsuario} <span style={{ color: '#9ca3af' }}>→</span> {o.vendedor?.nombreUsuario}</td>
                    <td>{o.items.map(i => <div key={i.id} style={{ fontSize: '13px' }}>{i.nombre} × {i.cantidad}</div>)}</td>
                    <td style={{ fontSize: '13px' }}>
                      {o.metodoEntrega === 'DESPACHO' ? `Envío a ${o.entrega?.localidad}, ${nombreProvincia(o.entrega?.provincia)}` : 'A coordinar'}
                    </td>
                    <td><strong>{formatMoney(o.total)}</strong></td>
                    <td>
                      <span style={{ color: estado.color, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{estado.texto}</span>
                      {enviosPorOrden[o.id] && (
                        <div style={{ color: ESTADOS_ENVIO[enviosPorOrden[o.id].estado]?.color, fontSize: '12px', fontWeight: 'bold', marginTop: '4px', whiteSpace: 'nowrap' }}>
                          <i className={`fa-solid ${ESTADOS_ENVIO[enviosPorOrden[o.id].estado]?.icono}`}></i> {ESTADOS_ENVIO[enviosPorOrden[o.id].estado]?.texto}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {o.estado === 'PENDIENTE' && (
                        <button className="btn-new-user" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => marcarPagada(o)}>
                          <i className="fa-solid fa-check"></i> Marcar pagada
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </main>
      )}

      {activeTab === 'productos' && (
        <>
          <h3 className="panel-subtitulo">Fotos pendientes de revisión</h3>
          <p className="panel-ayuda">Fotos que la IA no pudo confirmar. Aprobar una publica su producto si estaba en borrador; rechazarla la elimina.</p>
          {error ? <p className="empty-state" style={{ color: '#b91c1c' }}>{error}</p>
            : fotos === null ? <p className="empty-state">Cargando...</p>
            : fotos.length === 0 ? <div className="panel-content"><p className="empty-state">No hay fotos para revisar.</p></div>
            : (
              <div className="panel-fotos">
                {fotos.map(f => (
                  <article key={f.id} className="panel-foto">
                    <img src={f.url} alt={f.nombreProducto} />
                    <div className="panel-foto-info">
                      <strong>{f.nombreProducto}</strong>
                      <span className="panel-producto-meta">Categoría: {f.nombreCategoria}</span>
                      <span className="panel-producto-meta">
                        {f.confianzaIa != null ? `IA: ${Math.round(f.confianzaIa * 100)}% de confianza` : 'La IA no respondió'}
                      </span>
                      {f.queVeIa && <span className="panel-producto-meta">&ldquo;{f.queVeIa}&rdquo;</span>}
                    </div>
                    <div className="panel-foto-acciones">
                      <button className="btn-aprobar" onClick={() => resolverFoto(f, true)}><i className="fa-solid fa-check"></i> Aprobar</button>
                      <button className="btn-rechazar" onClick={() => resolverFoto(f, false)}><i className="fa-solid fa-xmark"></i> Rechazar</button>
                    </div>
                  </article>
                ))}
              </div>
            )}

          <h3 className="panel-subtitulo">Todos los productos</h3>
          <section className="users-section">
            <header className="users-toolbar">
              <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Buscar por producto o vendedor..." value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} />
              </div>
            </header>
            <main className="panel-content">
              <table className="panel-table">
                <thead>
                  <tr><th>PRODUCTO</th><th>VENDEDOR</th><th>PRECIO</th><th>STOCK</th><th>ESTADO</th><th className="text-right">ACCIÓN</th></tr>
                </thead>
                <tbody>
                  {filaEstado(productos, 6, 'No hay productos.') ?? productosFiltrados.map(p => {
                    const estado = p.activo === false
                      ? { texto: 'Dado de baja', clase: 'baja' }
                      : ESTADOS_PUBLICACION[p.estadoPublicacion] ?? { texto: p.estadoPublicacion, clase: '' }
                    return (
                      <tr key={p.id} style={p.activo === false ? { opacity: 0.6 } : undefined}>
                        <td>
                          <div className="panel-producto">
                            {p.image ? <img src={p.image} alt={p.title} /> : <div className="panel-producto-sin-foto"><i className="fa-regular fa-image"></i></div>}
                            <div>
                              <strong style={{ cursor: p.estadoPublicacion === 'PUBLICADO' && p.activo !== false ? 'pointer' : 'default' }}
                                onClick={() => p.estadoPublicacion === 'PUBLICADO' && p.activo !== false && navigate(`/product/${p.id}`)}>
                                {p.title}
                              </strong>
                              <div className="panel-producto-meta">{p.categoria?.nombre} · {nombreProvincia(p.provincia)}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.vendedor?.nombreUsuario}</td>
                        <td>{formatMoney(p.price)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <span className={`badge-estado ${estado.clase}`}>{estado.texto}</span>
                          {p.nivelDestacado && p.nivelDestacado !== 'NINGUNO' && (
                            <div><span className="badge-destacado">{NIVELES_DESTACADO[p.nivelDestacado]}</span></div>
                          )}
                        </td>
                        <td className="text-right">
                          {p.activo !== false && (
                            <button className="btn-icon-edit" title="Destacar" onClick={() => setDestacando({ producto: p, nivel: p.nivelDestacado && p.nivelDestacado !== 'NINGUNO' ? p.nivelDestacado : 'DESTACADO', meses: 1 })}>
                              <i className="fa-solid fa-star"></i>
                            </button>
                          )}
                          {p.activo === false ? (
                            <button className="btn-icon-edit" title="Reactivar" onClick={() => bajaOReactivar(p)}><i className="fa-solid fa-rotate-left"></i></button>
                          ) : (
                            <button className="btn-icon-delete" title="Dar de baja" onClick={() => bajaOReactivar(p)}><i className="fa-solid fa-trash"></i></button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </main>
          </section>
        </>
      )}

      {activeTab === 'destacados' && (
        <main className="panel-content">
          <table className="panel-table">
            <thead>
              <tr><th>PRODUCTO</th><th>VENDEDOR</th><th>NIVEL</th><th>PERÍODO</th><th>ESTADO</th></tr>
            </thead>
            <tbody>
              {filaEstado(destacados, 5, 'Todavía no se destacó ningún producto. Se destaca desde la pestaña Productos.') ?? destacados.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.nombreProducto}</strong></td>
                  <td>{d.vendedor?.nombreUsuario}</td>
                  <td><span className="badge-destacado">{NIVELES_DESTACADO[d.nivel] ?? d.nivel}</span></td>
                  <td style={{ fontSize: '13px' }}>{d.desde} → {d.hasta} <span className="panel-producto-meta">({d.meses} {d.meses === 1 ? 'mes' : 'meses'})</span></td>
                  <td>{d.vigente ? <span className="badge-estado publicado">Vigente</span> : <span className="badge-estado borrador">Vencido</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {activeTab === 'usuarios' && (
        <section className="users-section">
          <header className="users-toolbar">
            <div className="search-bar">
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder="Buscar por email, usuario o rol..." value={busquedaUsuario} onChange={e => setBusquedaUsuario(e.target.value)} />
            </div>
            <button className="btn-new-user" onClick={() => setIsModalOpen(true)}>
              <i className="fa-solid fa-user-plus"></i> NUEVO USUARIO
            </button>
          </header>

          <main className="panel-content">
            <table className="panel-table">
              <thead>
                <tr><th>USUARIO / EMAIL</th><th>NOMBRE COMPLETO</th><th>ROL</th><th>DIRECCIÓN</th><th className="text-right">ACCIÓN</th></tr>
              </thead>
              <tbody>
                {filaEstado(usuarios, 5, 'No hay usuarios.') ?? (usuariosFiltrados.length === 0
                  ? <tr><td colSpan="5" className="empty-state">No se encontraron usuarios.</td></tr>
                  : usuariosFiltrados.map(u => {
                    const soyYo = u.id === user?.id
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar">{u.nombreUsuario.charAt(0).toUpperCase()}</div>
                            <div><strong>{u.nombreUsuario}</strong><br /><span>{u.mail}</span></div>
                          </div>
                        </td>
                        <td>{u.nombre} {u.apellido}</td>
                        <td>
                          {soyYo ? (
                            <span className={`badge-role ${u.rol.toLowerCase()}`}>{ROLES[u.rol]}</span>
                          ) : (
                            <select className="panel-select-rol" value={u.rol} onChange={e => cambiarRolUsuario(u, e.target.value)}>
                              {Object.entries(ROLES).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                            </select>
                          )}
                        </td>
                        <td>{u.direccion || '—'}</td>
                        <td className="text-right">
                          {soyYo ? (
                            <span className="action-text italic">Sesión activa</span>
                          ) : (
                            <button className="btn-icon-delete" title="Dar de baja" onClick={() => setUserToDelete(u)}>
                              <i className="fa-solid fa-trash"></i> Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  }))}
              </tbody>
            </table>
          </main>
        </section>
      )}

      {activeTab === 'categorias' && (
        <section className="users-section">
          <header className="users-toolbar">
            <div className="search-bar">
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder="Buscar categoría..." value={busquedaCategoria} onChange={e => setBusquedaCategoria(e.target.value)} />
            </div>
            <button className="btn-new-user" onClick={() => setCategoriaEditando(null)}>
              <i className="fa-solid fa-folder-plus"></i> NUEVA CATEGORÍA
            </button>
          </header>

          <main className="panel-content">
            <table className="panel-table">
              <thead>
                <tr><th>ID</th><th>NOMBRE</th><th>PERTENECE A</th><th>DESCRIPCIÓN</th><th className="text-right">ACCIÓN</th></tr>
              </thead>
              <tbody>
                {filaEstado(categorias, 5, 'No hay categorías.') ?? (categoriasFiltradas.length === 0
                  ? <tr><td colSpan="5" className="empty-state">No se encontraron categorías.</td></tr>
                  : categoriasFiltradas.map(c => (
                    <tr key={c.id}>
                      <td><strong className="text-gray-500">#{c.id}</strong></td>
                      <td>
                        {c.idCategoriaPadre ? (
                          <span style={{ paddingLeft: '18px' }}><i className="fa-solid fa-turn-up fa-rotate-90" style={{ color: '#9ca3af', marginRight: '8px' }}></i>{c.nombre}</span>
                        ) : <strong>{c.nombre}</strong>}
                      </td>
                      <td>{c.nombreCategoriaPadre ? <span className="subcat-badge">{c.nombreCategoriaPadre}</span> : <span className="panel-producto-meta">Principal</span>}</td>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>{c.descripcion || '—'}</td>
                      <td className="text-right">
                        <button onClick={() => setCategoriaEditando(c)} className="btn-icon-edit" title="Editar"><i className="fa-solid fa-pen"></i></button>
                        <button onClick={() => setCategoryToDelete(c)} className="btn-icon-delete" title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </main>
        </section>
      )}

      {destacando && (
        <div className="modal-overlay">
          <form className="user-modal-content" style={{ maxWidth: '420px' }} onSubmit={guardarDestacado}>
            <header className="user-modal-header">
              <div className="modal-title-with-icon"><i className="fa-solid fa-star"></i> Destacar producto</div>
              <button type="button" className="close-modal-btn" onClick={() => setDestacando(null)}><i className="fa-solid fa-xmark"></i></button>
            </header>
            <div className="user-modal-body">
              <p style={{ fontSize: '14px', color: '#374151' }}><strong>{destacando.producto.title}</strong> de {destacando.producto.vendedor?.nombreUsuario}</p>
              <div className="user-modal-grid">
                <div className="form-group">
                  <label htmlFor="nivel-destacado">NIVEL</label>
                  <select id="nivel-destacado" value={destacando.nivel} onChange={e => setDestacando({ ...destacando, nivel: e.target.value })}>
                    {Object.entries(NIVELES_DESTACADO).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="meses-destacado">MESES</label>
                  <input id="meses-destacado" type="number" min="1" max="24" value={destacando.meses} disabled={destacando.nivel === 'NINGUNO'}
                    onChange={e => setDestacando({ ...destacando, meses: Number(e.target.value) })} />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Los destacados salen primero en el catálogo. &ldquo;Sin destacar&rdquo; le saca la visibilidad.</p>
            </div>
            <footer className="user-modal-footer">
              <button type="button" className="btn-cancelar" onClick={() => setDestacando(null)}>Cancelar</button>
              <button type="submit" className="btn-guardar"><i className="fa-solid fa-check"></i> Guardar</button>
            </footer>
          </form>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <UserForm
            onClose={() => setIsModalOpen(false)}
            onSave={() => { setIsModalOpen(false); cargar.usuarios() }}
          />
        </div>
      )}

      {categoriaEditando !== undefined && (
        <div className="modal-overlay">
          <CategoryForm
            categoria={categoriaEditando}
            raices={raices}
            onClose={() => setCategoriaEditando(undefined)}
            onSave={() => { setCategoriaEditando(undefined); cargar.categorias() }}
          />
        </div>
      )}

      {userToDelete && (
        <div className="error-overlay" onClick={() => setUserToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-box">
              <i className="fa-solid fa-user"></i>
            </div>
            <h2 className="error-title">¿Eliminar Usuario?</h2>
            <p className="error-text">
              ¿Dar de baja a <strong>{userToDelete.nombreUsuario}</strong>? Sus publicaciones salen del catálogo y de los carritos. Las órdenes se conservan.
            </p>
            <div className="panel-modal-actions">
              <button className="error-btn btn-cancel-panel" onClick={() => setUserToDelete(null)}>Cancelar</button>
              <button className="error-btn" onClick={confirmarEliminarUsuario}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="error-overlay" onClick={() => setCategoryToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-box">
              <i className="fa-solid fa-folder-minus"></i>
            </div>
            <h2 className="error-title">¿Eliminar Categoría?</h2>
            <p className="error-text">
              ¿Eliminar <strong>{categoryToDelete.nombre}</strong>? Solo se puede si no tiene subcategorías ni productos.
            </p>
            <div className="panel-modal-actions">
              <button className="error-btn btn-cancel-panel" onClick={() => setCategoryToDelete(null)}>Cancelar</button>
              <button className="error-btn" onClick={confirmarEliminarCategoria}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
