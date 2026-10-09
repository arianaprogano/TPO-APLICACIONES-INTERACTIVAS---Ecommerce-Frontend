import React, { useState } from 'react'
import './AdminPanel.css'

function VendedorPanel() {
  const [activeTab, setActiveTab] = useState('publicaciones')
  
  // Estados para la Edición de un producto
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    title: '', category: '', subcategory: '', condition: '', price: '', stock: '', description: ''
  })

  // Simulación del producto del vendedor
  const mockProduct = {
    title: 'Semillas de Maíz Híbrido (Bolsa 80k)',
    category: 'Insumos',
    subcategory: 'Semillas',
    condition: 'Nuevo',
    price: '65',
    stock: '50',
    description: 'Alto rendimiento y resistencia a plagas. Excelente poder germinativo.'
  }

  // Función al tocar "Editar"
  const handleEditClick = () => {
    setEditForm(mockProduct) // Carga los datos actuales a la ventana
    setIsEditOpen(true)
  }

  // Función al tocar "Guardar Cambios"
  const handleEditSubmit = () => {
    if (!editForm.title || !editForm.price || !editForm.stock || !editForm.description) {
      setEditError('No se puede actualizar un producto con los campos vacíos.')
      return
    }
    setEditError('')
    setIsEditOpen(false)
    alert("¡Producto actualizado con éxito!")
  }

  return (
    <div className="panel-container">
      <div className="panel-tabs">
        <button className={activeTab === 'publicaciones' ? 'active' : ''} onClick={() => setActiveTab('publicaciones')}>Mis Publicaciones</button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Órdenes Recibidas</button>
      </div>

      <div className="panel-content">
        {activeTab === 'publicaciones' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>PRECIO</th>
                <th>STOCK</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Semillas de Maíz Híbrido (Bolsa 80k)</strong></td>
                <td>U$S 65</td>
                <td><strong>50</strong></td>
                <td style={{ color: '#16a34a', fontWeight: 'bold' }}>Aprobado</td>
                <td className="text-right">
                  <button 
                    onClick={handleEditClick}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fa-solid fa-pen"></i> Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'ordenes' && (
          <table className="panel-table">
            <thead>
              <tr>
                <th>ORDEN #</th>
                <th>FECHA</th>
                <th>CLIENTE</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-state">No hay órdenes recibidas aún.</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE EDITAR PRODUCTO (Usa los estilos de publicación) */}
      {isEditOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="publish-modal-content">
            <div className="publish-modal-header">
              <div className="modal-title-with-icon">
                <i className="fa-solid fa-pen-to-square" style={{ color: '#3b82f6' }}></i> Editar Producto
              </div>
              <button className="close-modal-btn" onClick={() => { setIsEditOpen(false); setEditError(''); }}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="publish-modal-body">
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
            </div>

            <div className="publish-modal-footer">
              <button className="btn-cancelar" onClick={() => { setIsEditOpen(false); setEditError(''); }}>Cancelar</button>
              <button className="btn-guardar" style={{ backgroundColor: '#3b82f6' }} onClick={handleEditSubmit}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendedorPanel