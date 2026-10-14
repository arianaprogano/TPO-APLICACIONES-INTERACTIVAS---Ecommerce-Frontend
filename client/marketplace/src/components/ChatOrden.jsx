import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { enviarMensaje, getMensajes } from '../api/mensajes'
import { useAvisos } from './avisosContext'
import './ChatOrden.css'

// Chat de una orden pagada para coordinar la entrega. Comprador y vendedor
// escriben; el admin solo lee. No consulta solo: cada mensaje le llega a la
// otra parte como notificacion, y al tocarla se vuelve a cargar.
function ChatOrden({ orden, user }) {
  const { error: avisarError } = useAvisos()
  const [mensajes, setMensajes] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const finRef = useRef(null)

  // La orden trae a las partes sin id: se reconocen por el nombre de usuario,
  // que es unico.
  const soyComprador = user?.nombreUsuario === orden.comprador?.nombreUsuario
  const soyParte = soyComprador || user?.nombreUsuario === orden.vendedor?.nombreUsuario
  const otraParte = soyComprador ? orden.vendedor : orden.comprador

  // location.key cambia en cada navegacion, aunque sea a la misma URL: si ya
  // estas en la orden y tocas la notificacion de un mensaje nuevo, se recarga.
  const { key } = useLocation()

  useEffect(() => {
    let vigente = true
    getMensajes(orden.id).then(lista => vigente && setMensajes(lista)).catch(err => vigente && avisarError(err.message))
    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden.id, key])

  // Cada vez que llega algo nuevo, se baja al ultimo mensaje.
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensajes?.length])

  const enviar = async (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    try {
      const nuevo = await enviarMensaje(orden.id, texto.trim())
      setMensajes(prev => [...(prev ?? []), nuevo])
      setTexto('')
    } catch (err) {
      avisarError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="detalle-orden-card chat-orden">
      <h2><i className="fa-regular fa-comments"></i> {soyParte ? `Coordiná con ${otraParte?.nombreUsuario}` : 'Mensajes entre comprador y vendedor'}</h2>

      <div className="chat-orden-mensajes">
        {mensajes === null && <p className="chat-orden-vacio">Cargando mensajes...</p>}
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
        <form className="chat-orden-form" onSubmit={enviar}>
          <input
            type="text"
            placeholder="Escribí un mensaje..."
            maxLength={500}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            disabled={enviando}
          />
          <button type="submit" disabled={enviando || !texto.trim()} title="Enviar">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      )}
    </section>
  )
}

export default ChatOrden
