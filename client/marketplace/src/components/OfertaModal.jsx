import { useState } from 'react'
import { crearOferta } from '../api/ofertas'
import { PROVINCIAS } from '../api/ordenes'
import './AdminModals.css'

const formatMoney = (amount) => '$ ' + new Intl.NumberFormat('es-AR').format(amount || 0)

// Oferta por un precio menor al de lista. Si el vendedor la acepta, el backend
// crea la orden al precio acordado; por eso, si el producto se despacha, la
// direccion de entrega se pide ahora.
function OfertaModal({ producto, user, onClose, onEnviada }) {
  const [form, setForm] = useState({
    cantidad: 1,
    precioOfrecido: '',
    provinciaEntrega: '',
    localidadEntrega: '',
    direccionEntrega: user?.direccion ?? '',
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }))
  const precio = Number(form.precioOfrecido)
  const ahorro = precio > 0 ? Math.round((1 - precio / producto.price) * 100) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!precio || precio <= 0) return setError('Indicá cuánto ofrecés por unidad.')
    if (precio >= producto.price) return setError(`La oferta tiene que ser menor al precio publicado (${formatMoney(producto.price)}).`)
    if (producto.conEnvio && (!form.provinciaEntrega || !form.localidadEntrega.trim() || !form.direccionEntrega.trim()))
      return setError('Completá la dirección de entrega: si el vendedor acepta, la compra sale con envío.')

    setEnviando(true)
    try {
      await crearOferta({
        idProducto: producto.id,
        cantidad: Number(form.cantidad),
        precioOfrecido: precio,
        ...(producto.conEnvio ? {
          provinciaEntrega: form.provinciaEntrega,
          localidadEntrega: form.localidadEntrega.trim(),
          direccionEntrega: form.direccionEntrega.trim(),
        } : {}),
      })
      onEnviada()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay">
      <form className="user-modal-content" style={{ maxWidth: '460px' }} onSubmit={handleSubmit} noValidate>
        <header className="user-modal-header">
          <div className="modal-title-with-icon"><i className="fa-solid fa-hand-holding-dollar"></i> Hacer una oferta</div>
          <button type="button" className="close-modal-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </header>

        <div className="user-modal-body">
          <p style={{ fontSize: '14px', color: '#374151' }}>
            <strong>{producto.title}</strong><br />
            Precio publicado: {formatMoney(producto.price)} por unidad
          </p>

          {error && <div className="form-error">{error}</div>}

          <div className="user-modal-grid">
            <div className="form-group">
              <label htmlFor="oferta-precio">TU PRECIO POR UNIDAD ($)</label>
              <input id="oferta-precio" type="number" min="1" value={form.precioOfrecido} onChange={e => set('precioOfrecido', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="oferta-cantidad">CANTIDAD</label>
              <input id="oferta-cantidad" type="number" min="1" max={producto.stock} value={form.cantidad} onChange={e => set('cantidad', e.target.value)} />
            </div>
          </div>

          {precio > 0 && precio < producto.price && (
            <p style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
              Total: {formatMoney(precio * Number(form.cantidad || 1))} · {ahorro}% menos que el precio publicado
            </p>
          )}

          {producto.conEnvio && (
            <>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Si el vendedor acepta, la compra sale con envío a esta dirección:</p>
              <div className="user-modal-grid">
                <div className="form-group">
                  <label htmlFor="oferta-provincia">PROVINCIA</label>
                  <select id="oferta-provincia" value={form.provinciaEntrega} onChange={e => set('provinciaEntrega', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="oferta-localidad">LOCALIDAD</label>
                  <input id="oferta-localidad" type="text" value={form.localidadEntrega} onChange={e => set('localidadEntrega', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="oferta-direccion">DIRECCIÓN</label>
                <input id="oferta-direccion" type="text" value={form.direccionEntrega} onChange={e => set('direccionEntrega', e.target.value)} />
              </div>
            </>
          )}

          <p style={{ fontSize: '12px', color: '#6b7280' }}>La oferta vence a los 7 días si el vendedor no responde.</p>
        </div>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar oferta'}</button>
        </footer>
      </form>
    </div>
  )
}

export default OfertaModal
