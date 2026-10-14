import { useEffect, useState } from 'react'
import { cambiarEstadoEnvio, getHistorialEntregas, getMisEnvios, recibirEnvio } from '../api/envios'
import { nombreProvincia } from '../api/ordenes'
import './DespachantePanel.css'
import { useAvisos } from '../components/avisosContext'

// El despachante trabaja como en una sucursal: no elige de una lista, carga el
// numero de la etiqueta del paquete que tiene en la mano. Con eso lo toma y
// recien ahi ve la direccion de entrega. Despues lo marca entregado.
function DespachantePanel() {
  const { error: avisarError, confirmar } = useAvisos()
  const [activeTab, setActiveTab] = useState('encurso')
  const [enCurso, setEnCurso] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [error, setError] = useState('')
  const [numero, setNumero] = useState('')
  const [isIngresoOpen, setIsIngresoOpen] = useState(false)
  const [ingresando, setIngresando] = useState(false)
  const [errorIngreso, setErrorIngreso] = useState('')

  const cargar = () => {
    setError('')
    getMisEnvios().then(setEnCurso).catch(err => setError(err.message))
    getHistorialEntregas().then(setHistorial).catch(err => setError(err.message))
  }

  useEffect(() => { cargar() }, [])

  const ingresarPaquete = async (e) => {
    e.preventDefault()
    if (!numero.trim()) {
      setErrorIngreso('Ingresá el número de seguimiento de la etiqueta.')
      return
    }
    setErrorIngreso('')
    setIngresando(true)
    try {
      const envio = await recibirEnvio(numero)
      setEnCurso(prev => [envio, ...(prev ?? []).filter(e => e.id !== envio.id)])
      setIsIngresoOpen(false)
      setNumero('')
      setActiveTab('encurso')
    } catch (err) {
      setErrorIngreso(err.message)
    } finally {
      setIngresando(false)
    }
  }

  const marcarEntregado = async (envio) => {
    if (!(await confirmar(`¿Confirmás la entrega del envío ${envio.numeroSeguimiento} a ${envio.comprador?.nombre} ${envio.comprador?.apellido}?`))) return
    try {
      await cambiarEstadoEnvio(envio.id, 'ENTREGADO')
      cargar()
    } catch (err) {
      avisarError(err.message)
    }
  }

  const filaEstado = (datos, colSpan, vacio) => {
    if (error) return <tr><td colSpan={colSpan} className="empty-state" style={{ color: '#b91c1c' }}>{error}</td></tr>
    if (datos === null) return <tr><td colSpan={colSpan} className="empty-state">Cargando...</td></tr>
    if (datos.length === 0) return <tr><td colSpan={colSpan} className="empty-state">{vacio}</td></tr>
    return null
  }

  return (
    <div className="panel-container">
      <div className="despacho-header">
        <div className="panel-tabs">
          <button className={activeTab === 'encurso' ? 'active' : ''} onClick={() => setActiveTab('encurso')}>
            Envíos en curso {enCurso?.length > 0 && <span className="panel-tab-contador">{enCurso.length}</span>}
          </button>
          <button className={activeTab === 'historial' ? 'active' : ''} onClick={() => setActiveTab('historial')}>Entregados</button>
        </div>
        <button className="btn-dark" onClick={() => { setIsIngresoOpen(true); setErrorIngreso('') }}>
          <i className="fa-solid fa-box-open"></i> INGRESAR PAQUETE
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'encurso' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>CÓDIGO TRACKING</th>
                <th>DESTINATARIO</th>
                <th>DIRECCIÓN DE ENTREGA</th>
                <th>VENDEDOR</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {filaEstado(enCurso, 5, 'Sin envíos asignados en curso. Ingresá un paquete con su número de seguimiento.') ?? enCurso.map(e => (
                <tr key={e.id}>
                  <td>
                    <strong className="despacho-tracking">{e.numeroSeguimiento}</strong>
                    <div className="panel-producto-meta">Orden #{e.idOrden} · despachado {e.fechaDespacho}</div>
                  </td>
                  <td>{e.comprador?.nombre} {e.comprador?.apellido}<div className="panel-producto-meta">@{e.comprador?.nombreUsuario}</div></td>
                  <td>
                    {e.entrega?.calle}
                    <div className="panel-producto-meta">{e.entrega?.localidad}, {nombreProvincia(e.entrega?.provincia)}</div>
                  </td>
                  <td>{e.vendedor?.nombreUsuario}</td>
                  <td className="text-right">
                    <button className="btn-new-user" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => marcarEntregado(e)}>
                      <i className="fa-solid fa-check"></i> Marcar entregado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'historial' && (
          <table className="panel-table">
            <thead>
              <tr><th>CÓDIGO TRACKING</th><th>DESTINO</th><th>PRODUCTOS</th><th>ENTREGADO</th></tr>
            </thead>
            <tbody>
              {filaEstado(historial, 4, 'Todavía no entregaste ningún envío.') ?? historial.map(h => (
                <tr key={h.numeroSeguimiento}>
                  <td><strong className="despacho-tracking">{h.numeroSeguimiento}</strong></td>
                  <td>{h.localidad}{h.provincia && `, ${nombreProvincia(h.provincia)}`}</td>
                  <td>{(h.productos ?? []).map((p, i) => <div key={i} style={{ fontSize: '13px' }}>{p.nombre} × {p.cantidad}</div>)}</td>
                  <td>{h.fechaEntrega}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isIngresoOpen && (
        <div className="modal-overlay">
          <form className="user-modal-content" style={{ maxWidth: '420px' }} onSubmit={ingresarPaquete} noValidate>
            <header className="user-modal-header">
              <div className="modal-title-with-icon"><i className="fa-solid fa-barcode"></i> Ingresar paquete</div>
              <button type="button" className="close-modal-btn" onClick={() => setIsIngresoOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </header>
            <div className="user-modal-body">
              {errorIngreso && <div className="form-error">{errorIngreso}</div>}
              <div className="form-group">
                <label htmlFor="numero-seguimiento">NÚMERO DE SEGUIMIENTO</label>
                <input id="numero-seguimiento" type="text" autoFocus placeholder="El que figura en la etiqueta" value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Al ingresarlo, el envío queda a tu cargo y pasa a &ldquo;En camino&rdquo;.</p>
            </div>
            <footer className="user-modal-footer">
              <button type="button" className="btn-cancelar" onClick={() => setIsIngresoOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-guardar" disabled={ingresando}>{ingresando ? 'Ingresando...' : 'Ingresar'}</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default DespachantePanel
