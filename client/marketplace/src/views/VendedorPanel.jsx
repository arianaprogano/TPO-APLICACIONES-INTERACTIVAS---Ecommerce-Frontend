import React, { useState } from 'react'
import EditProductForm from '../components/EditProductForm'
import './PanelStyles.css'

function VendedorPanel({ setModalMessage }) {
  const [activeTab, setActiveTab] = useState('publicaciones')
  const [isEditOpen, setIsEditOpen] = useState(false)

  const mockProduct = {
    title: 'Semillas de Maíz Híbrido (Bolsa 80k)',
    category: 'Insumos',
    subcategory: 'Semillas',
    condition: 'Nuevo',
    price: '65',
    stock: '50',
    description: 'Alto rendimiento y resistencia a plagas. Excelente poder germinativo.'
  }

  const handleEditClick = () => {
    setIsEditOpen(true)
  }

  const handleSaveProduct = (updatedProduct) => {
    setIsEditOpen(false)
    if (setModalMessage) {
      setModalMessage("¡Producto actualizado con éxito!");
    }
  }

  return (
    <div className="panel-container">
      <nav className="panel-tabs">
        <button className={activeTab === 'publicaciones' ? 'active' : ''} onClick={() => setActiveTab('publicaciones')}>Mis Publicaciones</button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>Órdenes Recibidas</button>
      </nav>

      <main className="panel-content">
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
      </main>

      {isEditOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <EditProductForm 
            initialData={mockProduct} 
            onClose={() => setIsEditOpen(false)} 
            onSave={handleSaveProduct} 
          />
        </div>
      )}
    </div>
  )
}

export default VendedorPanel