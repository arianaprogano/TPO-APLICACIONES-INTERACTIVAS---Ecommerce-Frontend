import React, { useState, useEffect } from 'react'
import './ProductForm.css'

function EditProductForm({ onClose, initialData, onSave }) {
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    title: '', category: '', subcategory: '', condition: '', price: '', stock: '', description: ''
  })

  useEffect(() => {
    if (initialData) {
      setEditForm(initialData)
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validación de campos vacíos
    if (!editForm.title || !editForm.price || !editForm.stock || !editForm.description) {
      setEditError('No se puede actualizar un producto con los campos vacíos.')
      return
    }
    
    setEditError('')
    onSave(editForm) // Enviamos los datos actualizados al padre
  }

  return (
    <div className="publish-modal-content">
      <header className="publish-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-pen-to-square" style={{ color: '#3b82f6' }}></i> Editar Producto
        </div>
        <button type="button" className="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>
      
      <form onSubmit={handleSubmit}>
        <section className="publish-modal-body">
          {editError && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{editError}</div>}
          
          <div className="form-group full-width">
            <label>TÍTULO</label>
            <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
          </div>

          <div className="publish-modal-grid">
            <div className="form-group">
              <label>CATEGORÍA</label>
              <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                <option>Maquinaria</option>
                <option>Insumos</option>
              </select>
            </div>
            <div className="form-group">
              <label>SUBCATEGORÍA</label>
              <select value={editForm.subcategory} onChange={e => setEditForm({...editForm, subcategory: e.target.value})}>
                <option>Tractor</option>
                <option>Cosechadora</option>
                <option>Semillas</option>
              </select>
            </div>
            <div className="form-group">
              <label>CONDICIÓN</label>
              <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})}>
                <option>Nuevo</option>
                <option>Usado</option>
              </select>
            </div>
            <div className="form-group">
              <label>PRECIO (U$S)</label>
              <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
            </div>
          </div>

          <div className="form-group full-width">
            <label>STOCK</label>
            <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} />
          </div>

          <div className="form-group full-width">
            <label>SUBIR NUEVAS IMÁGENES (Opcional)</label>
            <input type="file" multiple className="custom-file-input" />
          </div>

          <div className="form-group full-width">
            <label>DESCRIPCIÓN</label>
            <textarea rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
          </div>
        </section>

        <footer className="publish-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar" style={{ backgroundColor: '#3b82f6' }}>Guardar Cambios</button>
        </footer>
      </form>
    </div>
  )
}

export default EditProductForm