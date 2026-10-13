import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aceptarOferta, cancelarOferta, ESTADOS_OFERTA, getMisOfertas, rechazarOferta } from '../api/ofertas'
import './PanelStyles.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

// GET /ofertas trae juntas las que hice y las que me hicieron; se separan por
// quien es el comprador. El vendedor acepta (se crea la orden al precio
// acordado) o rechaza; el comprador puede retirar la suya mientras este
// pendiente.
function MisOfertas({ user, setModalMessage }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('recibidas')
  const [ofertas, setOfertas] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => getMisOfertas().then(setOfertas).catch(err => setError(err.message))
  useEffect(() => { cargar() }, [])

  const hechas = (ofertas ?? []).filter(o => o.comprador?.nombreUsuario === user?.username)
  const recibidas = (ofertas ?? []).filter(o => o.vendedor?.nombreUsuario === user?.username)
  const lista = activeTab === 'recibidas' ? recibidas : hechas

  const responder = async (oferta, accion) => {
    const textos = {
      aceptar: `¿Aceptar ${formatMoney(oferta.precioOfrecido)} por unidad de ${oferta.comprador?.nombreUsuario}? Se crea la orden de compra a ese precio.`,
      rechazar: `¿Rechazar la oferta de ${oferta.comprador?.nombreUsuario}? Puede volver a ofertar más alto.`,
      cancelar: '¿Retirar tu oferta?',
    }
    if (!window.confirm(textos[accion])) return
    try {
      const accionApi = { aceptar: aceptarOferta, rechazar: rechazarOferta, cancelar: cancelarOferta }[accion]
      await accionApi(oferta.id)
      await cargar()
      if (accion === 'aceptar') setModalMessage?.('Oferta aceptada: se creó la orden de compra. La ves en Mis Publicaciones › Órdenes Recibidas.')
    } catch (err) {
      setModalMessage?.(err.message)
    }
  }

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'recibidas' ? 'active' : ''} onClick={() => setActiveTab('recibidas')}>
          Ofertas recibidas {recibidas.filter(o => o.estado === 'PENDIENTE').length > 0 && (
            <span className="panel-tab-contador">{recibidas.filter(o => o.estado === 'PENDIENTE').length}</span>
          )}
        </button>
        <button className={activeTab === 'hechas' ? 'active' : ''} onClick={() => setActiveTab('hechas')}>Ofertas que hice</button>
      </nav>

      <main className="panel-content">
        <table className="panel-table">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>{activeTab === 'recibidas' ? 'COMPRADOR' : 'VENDEDOR'}</th>
              <th>OFERTA</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr><td colSpan="6" className="empty-state" style={{ color: '#b91c1c' }}>{error}</td></tr>
            ) : ofertas === null ? (
              <tr><td colSpan="6" className="empty-state">Cargando ofertas...</td></tr>
            ) : lista.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">
                {activeTab === 'recibidas' ? 'Todavía no recibiste ofertas.' : 'Todavía no hiciste ofertas. Las podés hacer desde la ficha de los productos que aceptan ofertas.'}
              </td></tr>
            ) : lista.map(o => {
              const estado = ESTADOS_OFERTA[o.estado] ?? { texto: o.estado, color: '#6b7280' }
              const contraparte = activeTab === 'recibidas' ? o.comprador : o.vendedor
              return (
                <tr key={o.id}>
                  <td>
                    <button className="panel-link" style={{ fontSize: '14px' }} onClick={() => navigate(`/product/${o.idProducto}`)}>{o.nombreProducto}</button>
                    <div className="panel-producto-meta">Precio publicado: {formatMoney(o.precioDeLista)}</div>
                  </td>
                  <td>{contraparte?.nombreUsuario}</td>
                  <td>
                    <strong>{formatMoney(o.precioOfrecido)}</strong> × {o.cantidad}
                    <div className="panel-producto-meta">Total {formatMoney(o.total)} · {Math.round((1 - o.precioOfrecido / o.precioDeLista) * 100)}% menos</div>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {o.fechaCreacion}
                    {o.estado === 'PENDIENTE' && <div className="panel-producto-meta">Vence {o.fechaVencimiento}</div>}
                  </td>
                  <td><span style={{ color: estado.color, fontWeight: 'bold' }}>{estado.texto}</span></td>
                  <td className="text-right">
                    {o.estado === 'PENDIENTE' && activeTab === 'recibidas' && (
                      <div className="panel-acciones">
                        <button className="btn-new-user" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => responder(o, 'aceptar')}>Aceptar</button>
                        <button className="btn-icon-delete" onClick={() => responder(o, 'rechazar')}>Rechazar</button>
                      </div>
                    )}
                    {o.estado === 'PENDIENTE' && activeTab === 'hechas' && (
                      <button className="btn-icon-delete" onClick={() => responder(o, 'cancelar')}>Retirar</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </main>
    </div>
  )
}

export default MisOfertas
