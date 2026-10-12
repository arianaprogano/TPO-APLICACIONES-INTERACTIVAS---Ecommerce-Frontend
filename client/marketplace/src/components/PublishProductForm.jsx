import React, { useState } from 'react'
import './ProductForm.css'

function PublishProductForm({ onClose }) {
  // Estados para manejar los modales personalizados
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [selectedImages, setSelectedImages] = useState([])
  const [publishForm, setPublishForm] = useState({
    title: '', category: '', subcategory: '', condition: '', price: '', stock: '', description: ''
  })
  const handleImageChange = (e) => {
    // Convertimos los archivos seleccionados a un arreglo y los sumamos a los que ya teníamos
    const newFiles = Array.from(e.target.files);
    setSelectedImages(prevImages => [...prevImages, ...newFiles]);
    
    // Reseteamos el input para que permita subir el mismo archivo dos veces si el usuario lo borró y se arrepintió
    e.target.value = null; 
  }

  const handleRemoveImage = (indexToRemove) => {
    // Filtramos el arreglo dejando todos menos el que queremos borrar
    setSelectedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  }

  const handleSubmit = (e) => {
    e.preventDefault() 

    // A. Sumamos selectedImages.length === 0 para que la foto sea obligatoria
    if (!publishForm.title || !publishForm.price || !publishForm.stock || !publishForm.description || 
        !publishForm.category || !publishForm.subcategory || !publishForm.condition ||
        selectedImages.length === 0) {
      setShowErrorModal(true)
      return
    }
    
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
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Maquinaria">Maquinaria</option>
                  <option value="Insumos">Insumos</option>
                </select>
              </div>
              <div className="form-group">
                <label>SUBCATEGORÍA</label>
                <select value={publishForm.subcategory} onChange={e => setPublishForm({...publishForm, subcategory: e.target.value})}>
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Tractor">Tractor</option>
                  <option value="Cosechadora">Cosechadora</option>
                  <option value="Semillas">Semillas</option>
                </select>
              </div>
              <div className="form-group">
                <label>CONDICIÓN</label>
                <select value={publishForm.condition} onChange={e => setPublishForm({...publishForm, condition: e.target.value})}>
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
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
            
            {/* NUEVA LÓGICA DE IMÁGENES CON CHIPS */}
<div className="form-group full-width">
              <label>SUBIR IMÁGENES (LOCAL)</label>
              
              {/* Contenedor que simula ser el input para que los chips queden adentro */}
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  multiple 
                  className="custom-file-input" 
                  onChange={handleImageChange}
                  accept="image/*" 
                  title="" 
                />
                
                {selectedImages.length > 0 && (
                  <div className="image-chips-container">
                    {selectedImages.map((file, index) => (
                      <div key={index} className={`image-chip ${index === 0 ? 'main-image-chip' : ''}`}>
                        
                        {/* Indicador visual para la foto principal (la primera) */}
                        {index === 0 && <span className="badge-principal">Principal</span>}
                        
                        <span className="image-chip-name">{file.name}</span>
                        <button 
                          type="button" 
                          className="image-chip-delete" 
                          onClick={() => handleRemoveImage(index)}
                          title="Eliminar imagen"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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