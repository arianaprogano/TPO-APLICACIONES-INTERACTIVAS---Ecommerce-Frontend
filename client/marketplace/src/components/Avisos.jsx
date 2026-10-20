import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvisosContext } from './avisosContext'
import './Avisos.css'

export function AvisosProvider({ children }) {
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [toasts, setToasts] = useState([])
  const resolverConfirmacion = useRef(null)

  const error = useCallback((texto, titulo = 'Error') => {
    if (texto) setModal({ tipo: 'error', titulo, texto })
  }, [])

  const exito = useCallback((texto, { titulo = '¡Listo!', destacado } = {}) => {
    setModal({ tipo: 'exito', titulo, texto, destacado })
  }, [])

  const confirmar = useCallback((opciones) => {
    const { titulo = '¿Confirmás?', texto, ok = 'Confirmar', peligro = false } =
      typeof opciones === 'string' ? { texto: opciones } : opciones
    return new Promise((resolve) => {
      resolverConfirmacion.current = resolve
      setModal({ tipo: 'confirmar', titulo, texto, ok, peligro })
    })
  }, [])

  const toast = useCallback((texto, accion) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, texto, accion }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const cerrar = (respuesta) => {
    if (modal?.tipo === 'confirmar') resolverConfirmacion.current?.(respuesta)
    resolverConfirmacion.current = null
    setModal(null)
  }

  const iconos = { error: 'fa-xmark', exito: 'fa-check', confirmar: modal?.peligro ? 'fa-triangle-exclamation' : 'fa-circle-question' }

  return (
    <AvisosContext.Provider value={{ error, exito, confirmar, toast }}>
      {children}

      {modal && (
        <div className="error-overlay" onClick={() => cerrar(false)}>
          <div className={`error-modal aviso-${modal.tipo} ${modal.peligro ? 'aviso-peligro' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="error-icon-box"><i className={`fa-solid ${iconos[modal.tipo]}`}></i></div>
            <h2 className="error-title">{modal.titulo}</h2>
            {modal.texto && <p className="error-text">{modal.texto}</p>}
            {modal.destacado && <div className="aviso-destacado">{modal.destacado}</div>}

            {modal.tipo === 'confirmar' ? (
              <div className="aviso-botones">
                <button className="error-btn aviso-cancelar" onClick={() => cerrar(false)}>Cancelar</button>
                <button className="error-btn" onClick={() => cerrar(true)} autoFocus>{modal.ok}</button>
              </div>
            ) : (
              <button className="error-btn" onClick={() => cerrar(true)} autoFocus>Aceptar</button>
            )}
          </div>
        </div>
      )}

      <div className="avisos-toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="aviso-toast">
            <i className="fa-solid fa-circle-check"></i>
            <span>{t.texto}</span>
            {t.accion && (
              <button onClick={() => { setToasts(prev => prev.filter(x => x.id !== t.id)); navigate(t.accion.ruta) }}>
                {t.accion.texto}
              </button>
            )}
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  )
}
