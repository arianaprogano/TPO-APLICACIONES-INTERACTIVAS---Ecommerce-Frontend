import { useEffect, useState } from 'react'
import { comprarVisibilidad, getPlanesVisibilidad } from '../api/productos'
import './VisibilidadModal.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

const DESCRIPCIONES = {
  BASICO: { nombre: 'Básico', texto: 'Aparece antes que las publicaciones comunes.', icono: 'fa-arrow-up' },
  DESTACADO: { nombre: 'Destacado', texto: 'Más arriba en el catálogo y con la etiqueta "Destacado".', icono: 'fa-star' },
  PREMIUM: { nombre: 'Premium', texto: 'Primero en el catálogo, por encima de todos.', icono: 'fa-crown' },
}

const MESES = [1, 3, 6]

// Compra de visibilidad para una publicacion propia. Dos pasos: elegir plan y
// meses, y despues confirmar el pago. No hay pasarela: el pago es simulado y el
// backend registra lo cobrado en el historial de destacados.
function VisibilidadModal({ producto, onClose, onComprado }) {
  const [planes, setPlanes] = useState(null)
  const [nivel, setNivel] = useState('DESTACADO')
  const [meses, setMeses] = useState(1)
  const [paso, setPaso] = useState('elegir')
  const [error, setError] = useState('')
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    getPlanesVisibilidad().then(setPlanes).catch(err => setError(err.message))
  }, [])

  const plan = planes?.find(p => p.nivel === nivel)
  const total = plan ? Number(plan.precioMensual) * meses : 0

  const pagar = async () => {
    setError('')
    setPagando(true)
    try {
      const actualizado = await comprarVisibilidad(producto.id, nivel, meses)
      onComprado(actualizado, { nivel: DESCRIPCIONES[nivel].nombre, meses, total })
    } catch (err) {
      setError(err.message)
      setPaso('elegir')
    } finally {
      setPagando(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="user-modal-content visibilidad-modal">
        <header className="user-modal-header">
          <div className="modal-title-with-icon"><i className="fa-solid fa-rocket"></i> Más visibilidad</div>
          <button type="button" className="close-modal-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </header>

        <div className="user-modal-body">
          <p className="visibilidad-producto">Para <strong>{producto.title}</strong></p>
          {error && <div className="form-error">{error}</div>}

          {paso === 'elegir' ? (
            <>
              {planes === null ? (
                <p className="visibilidad-nota">Cargando planes...</p>
              ) : (
                <div className="visibilidad-planes">
                  {planes.map(p => {
                    const info = DESCRIPCIONES[p.nivel] ?? { nombre: p.nivel, texto: '', icono: 'fa-star' }
                    return (
                      <button key={p.nivel} type="button" className={`visibilidad-plan ${nivel === p.nivel ? 'elegido' : ''}`} onClick={() => setNivel(p.nivel)}>
                        <i className={`fa-solid ${info.icono}`}></i>
                        <strong>{info.nombre}</strong>
                        <span className="visibilidad-precio">{formatMoney(p.precioMensual)}<small>/mes</small></span>
                        <span className="visibilidad-texto">{info.texto}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="visibilidad-meses">
                <span>Duración</span>
                {MESES.map(m => (
                  <button key={m} type="button" className={meses === m ? 'elegido' : ''} onClick={() => setMeses(m)}>
                    {m} {m === 1 ? 'mes' : 'meses'}
                  </button>
                ))}
              </div>

              <div className="visibilidad-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
            </>
          ) : (
            <div className="visibilidad-pago">
              <div className="visibilidad-resumen">
                <div><span>Plan</span><strong>{DESCRIPCIONES[nivel]?.nombre}</strong></div>
                <div><span>Duración</span><strong>{meses} {meses === 1 ? 'mes' : 'meses'}</strong></div>
                <div className="total"><span>Total a pagar</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <p className="visibilidad-nota">
                <i className="fa-solid fa-circle-info"></i> Pago simulado: el marketplace todavía no tiene pasarela de pagos. Al confirmar se registra el cobro y la visibilidad se activa en el momento.
              </p>
            </div>
          )}
        </div>

        <footer className="user-modal-footer">
          {paso === 'elegir' ? (
            <>
              <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
              <button type="button" className="btn-guardar" disabled={!plan} onClick={() => setPaso('pagar')}>Continuar</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-cancelar" onClick={() => setPaso('elegir')} disabled={pagando}>Volver</button>
              <button type="button" className="btn-guardar" onClick={pagar} disabled={pagando}>
                <i className="fa-solid fa-lock"></i> {pagando ? 'Procesando...' : `Pagar ${formatMoney(total)}`}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}

export default VisibilidadModal
