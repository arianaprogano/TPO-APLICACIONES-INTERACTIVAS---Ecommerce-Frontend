import { useState } from 'react'
import "../views/PanelStyles.css"

function Reviews({ orden, onClose, onSave }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Por favor, selecciona una calificación (de 1 a 5 estrellas).')
      return
    }

    const nuevaResena = {
      productoId: orden.productoId,
      estrellas: rating,
      texto: comentario,
      fecha: new Date().toLocaleDateString()
    }

    onSave(orden.id, nuevaResena)
  }

  return (
    <div className="user-modal-content">
      <header className="user-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Calificar Producto
        </div>
        <button type="button" className="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <form onSubmit={handleSubmit}>
        <section className="user-modal-body">
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '10px' }}>
            ¿Qué te pareció tu compra de <strong>{orden.productoTitulo}</strong>?
          </p>

          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{error}</div>}

          <div className="form-group" style={{ textAlign: 'center', margin: '15px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>PUNTUACIÓN</label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i 
                  key={star}
                  className={star <= (hoverRating || rating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                  style={{ 
                    fontSize: '28px', 
                    color: star <= (hoverRating || rating) ? '#f97316' : '#d1d5db',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                ></i>
              ))}
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              {rating === 0 ? 'Hacé clic en una estrella' : `${rating} de 5 estrellas`}
            </span>
          </div>

          <div className="form-group">
            <label>COMENTARIO (Opcional)</label>
            <textarea 
              rows="4" 
              placeholder="Contale a otros usuarios qué te pareció el producto..."
              value={comentario} 
              onChange={(e) => setComentario(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            ></textarea>
          </div>
        </section>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar" style={{ backgroundColor: '#f97316' }}>
            Enviar Opinión <i className="fa-solid fa-paper-plane"></i>
          </button>
        </footer>
      </form>
    </div>
  )
}

export default Reviews