import React from 'react'
import './DespachantePanel.css'

function DespachantePanel() {
  return (
    <div className="panel-container">
      <div className="despacho-header">
        <div className="panel-tabs">
          <button className="active">Gestión de Envíos</button>
        </div>
        <button className="btn-dark">
          <i className="fa-solid fa-box-open"></i> INGRESAR PAQUETE
        </button>
      </div>

      <div className="panel-content">
        <table className="panel-table">
          <thead>
            <tr>
              <th>CÓDIGO TRACKING</th>
              <th>DESTINATARIO</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="empty-state">Sin envíos asignados en curso.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DespachantePanel