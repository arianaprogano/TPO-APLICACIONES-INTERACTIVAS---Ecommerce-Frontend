import { useState } from 'react'
import './ChatOrden.css'

// Chat de una orden pagada para coordinar la entrega. Por ahora es solo la
// parte visual: los mensajes se muestran en pantalla pero no se guardan.
function ChatOrden({ orden, user }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')

  const soyComprador = user?.nombreUsuario === orden.comprador?.nombreUsuario
  const otraParte = soyComprador ? orden.vendedor : orden.comprador

  const enviar = (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    const hora = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    setMensajes([...mensajes, { id: mensajes.length + 1, texto: texto.trim(), hora }])
    setTexto('')
  }

  return (
    <section className="detalle-orden-card chat-orden">
      <h2><i className="fa-regular fa-comments"></i> Coordiná con {otraParte?.nombreUsuario}</h2>

      <div className="chat-orden-mensajes">
        {mensajes.length === 0 && (
          <p className="chat-orden-vacio">Todavía no hay mensajes. Escribí para arreglar el día, el lugar o cualquier detalle de la entrega.</p>
        )}
        {mensajes.map(m => (
          <div key={m.id} className="chat-orden-burbuja mia">
            <p>{m.texto}</p>
            <span className="chat-orden-hora">{m.hora}</span>
          </div>
        ))}
      </div>

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
    </section>
  )
}

export default ChatOrden
