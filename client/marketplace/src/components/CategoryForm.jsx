import React, { useState, useEffect } from 'react'
import './AdminModals.css'

function CategoryForm({ onClose, onSave, initialData }) {
  const [catForm, setCatForm] = useState({ id: null, name: '', subcategories: '' })

  useEffect(() => {
    if (initialData) {
      setCatForm(initialData)
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (catForm.name.trim() === '') return
    
    // Le pasamos la data al panel para que actualice la tabla
    onSave(catForm)
  }

  return (
    <div className="user-modal-content" style={{ maxWidth: '400px' }}>
      <header className="user-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-folder-tree" style={{ color: '#16a34a' }}></i> 
          {catForm.id ? 'Editar Categoría' : 'Nueva Categoría'}
        </div>
        <button type="button" className="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="user-modal-body">
          <div className="form-group full-width">
            <label>NOMBRE DE LA CATEGORÍA *</label>
            <input 
              type="text" 
              placeholder="Ej. Herramientas" 
              value={catForm.name}
              onChange={(e) => setCatForm({...catForm, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group full-width" style={{ marginTop: '8px' }}>
            <label>SUBCATEGORÍAS</label>
            <textarea 
              rows="3" 
              placeholder="Ej. Palas, Rastrillos, Mangueras" 
              value={catForm.subcategories}
              onChange={(e) => setCatForm({...catForm, subcategories: e.target.value})}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            ></textarea>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Escribe las subcategorías separadas por comas (,).</p>
          </div>
        </div>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar">
            <i className="fa-solid fa-check"></i> Guardar
          </button>
        </footer>
      </form>
    </div>
  )
}

export default CategoryForm