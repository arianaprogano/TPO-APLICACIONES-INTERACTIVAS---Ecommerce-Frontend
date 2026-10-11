import React, { useState } from 'react'
import './ProductForm.css'

function PublishProductForm({ onClose }) {
  // Estados para manejar los modales personalizados
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [publishForm, setPublishForm] = useState({
    title: '', category: 'Maquinaria', subcategory: 'Tractor', condition: 'Nuevo', price: '', stock: '', description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault() 

    // Validamos: si faltan datos, mostramos el modal de error con la cruz
    if (!publishForm.title || !publishForm.price || !publishForm.stock || !publishForm.description) {
      setShowErrorModal(true)
      return
    }
    
    // Si todo está bien, mostramos el modal de éxito con el tick verde
    setShowSuccessModal(true)
  }

  const handleSuccessAccept = () => {
    setShowSuccessModal(false)
    onClose() // Cierra todo el panel de publicación
  }

  return (
    <>
      <div className="publish-modal-content">
        <header className="publish-modal-header">
          <div className="modal-title-with-icon">
            <i className="fa-solid fa-box-open" style={{ color: '#16a34a' }}></i> Publicar Producto
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="publish-modal-body">
            
            <div className="form-group full-width">
              <label>TÍTULO</label>
              <input type="text" value={publishForm.title} onChange={e => setPublishForm({...publishForm, title: e.target.value})} />
            </div>
            
            <div className="publish-modal-grid">
              <div className="form-group">
                <label>CATEGORÍA</label>
                <select value={publishForm.category} onChange={e => setPublishForm({...publishForm, category: e.target.value})}>
                  <option>Maquinaria</option>
                  <option>Insumos</option>
                </select>
              </div>
              <div className="form-group">
                <label>SUBCATEGORÍA</label>
                <select value={publishForm.subcategory} onChange={e => setPublishForm({...publishForm, subcategory: e.target.value})}>
                  <option>Tractor</option>
                  <option>Cosechadora</option>
                  <option>Semillas</option>
                </select>
              </div>
              <div className="form-group">
                <label>CONDICIÓN</label>
                <select value={publishForm.condition} onChange={e => setPublishForm({...publishForm, condition: e.target.value})}>
                  <option>Nuevo</option>
                  <option>Usado</option>
                </select>
              </div>
              <div className="form-group">
                <label>PRECIO (U$S)</label>
                <input type="number" value={publishForm.price} onChange={e => setPublishForm({...publishForm, price: e.target.value})} />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>STOCK</label>
              <input type="number" value={publishForm.stock} onChange={e => setPublishForm({...publishForm, stock: e.target.value})} />
            </div>
            
            <div className="form-group full-width">
              <label>SUBIR IMÁGENES (LOCAL)</label>
              <input type="file" multiple className="custom-file-input" />
            </div>
            
            <div className="form-group full-width">
              <label>DESCRIPCIÓN</label>
              <textarea rows="4" value={publishForm.description} onChange={e => setPublishForm({...publishForm, description: e.target.value})}></textarea>
            </div>
          </div>
          
          <footer className="publish-modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar">Guardar</button>
          </footer>
        </form>
      </div>

      {/* MODAL DE ERROR (Campos incompletos) */}
      {showErrorModal && (
        <div className="modal-overlay" style={{ zIndex: 12000 }}>
          <div className="modal-content-wide">
            <div className="error-icon-circle-wrapper">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <h3 className="modal-title-wide">Campos Incompletos</h3>
            <p className="modal-text-wide">No puedes publicar un producto con los campos vacíos. Por favor, completa toda la información.</p>
            {/* type="button" es clave aquí para que no envíe el formulario al cerrar el error */}
            <button type="button" className="modal-btn-red" onClick={() => setShowErrorModal(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO (Publicación confirmada) */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ zIndex: 12000 }}>
          <div className="modal-content-wide">
            <div className="success-icon-circle-wrapper">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="modal-title-wide">¡Publicación Exitosa!</h3>
            <p className="modal-text-wide">Tu producto ha sido creado y publicado con éxito en el catálogo.</p>
            <button type="button" className="modal-btn-green" onClick={handleSuccessAccept}>
              ACEPTAR
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PublishProductForm