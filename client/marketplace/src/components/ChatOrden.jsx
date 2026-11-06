import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { cargarMensajes, agregarMensaje } from '../redux/slice/chatSlice'
import { notificarMensajeChat } from '../api/notificaciones' // Ajustá la ruta si tu carpeta api está en otro lado
import './ChatOrden.css'

function ChatOrden({ orden, user, envio }) {
  const dispatch = useDispatch()
  const finRef = useRef(null)

  const { mensajes } = useSelector(state => state.chat)
  const [texto, setTexto] = useState('')

  const soyComprador = user?.nombreUsuario === orden.comprador?.nombreUsuario
  const soyParte = soyComprador || user?.nombreUsuario === orden.vendedor?.nombreUsuario
  const otraParte = soyComprador ? orden.vendedor : orden.comprador

  const esEntregada = 
    orden.estado?.trim().toUpperCase() === 'ENTREGADO' || 
    envio?.estado?.trim().toUpperCase() === 'ENTREGADO'

  useEffect(() => {
    if (orden?.id) {
      dispatch(cargarMensajes(orden.id))
    }
  }, [orden?.id, dispatch])

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensajes?.length])

  const enviar = (e) => {
    e.preventDefault()
    if (!texto.trim() || esEntregada) return
    
    // Guardamos el mensaje en Redux (Front)
    dispatch(agregarMensaje({ 
      idOrden: orden.id, 
      user: user, 
      texto: texto.trim() 
    }))
    
    notificarMensajeChat(orden.id)

    setTexto('')
  }

  return (
    <section className="detalle-orden-card chat-orden">
      <h2><i className="fa-regular fa-comments"></i> {soyParte ? `Coordiná con ${otraParte?.nombreUsuario}` : 'Mensajes entre comprador y vendedor'}</h2>

      <div className="chat-orden-mensajes">
        {mensajes?.length === 0 && (
          <p className="chat-orden-vacio">
            {soyParte ? 'Todavía no hay mensajes. Escribí para arreglar el día, el lugar o cualquier detalle de la entrega.' : 'Todavía no hay mensajes.'}
          </p>
        )}
        
        {mensajes?.map(m => {
          const mio = m.idAutor === user?.id
          return (
            <div key={m.id} className={`chat-orden-burbuja ${mio ? 'mia' : ''}`}>
              {!mio && <span className="chat-orden-autor">{m.nombreUsuarioAutor}</span>}
              <p>{m.texto}</p>
              <span className="chat-orden-hora">{m.hora}</span>
            </div>
          )
        })}
        <div ref={finRef}></div>
      </div>

      {soyParte && (
        esEntregada ? (
          <div className="chat-orden-cerrado" style={{ padding: '12px', textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: '6px', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
            <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i> Esta orden fue entregada. El chat ya se encuentra cerrado.
          </div>
        ) : (
          <form className="chat-orden-form" onSubmit={enviar}>
            <input
              type="text"
              placeholder="Escribí un mensaje..."
              maxLength={500}
              value={texto}
              onChange={e => setTexto(e.target.value)}
            />
            <button type="submit" disabled={!texto.trim()} title="Enviar">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        )
      )}
    </section>
  )
}

export default ChatOrden