import UserForm from './UserForm'
import CategoryForm from './CategoryForm'
import './AdminModals.css'

export default function AdminModals({
  destacando, setDestacando, guardarDestacado, NIVELES_DESTACADO,
  isModalOpen, setIsModalOpen, cargar,
  categoriaEditando, setCategoriaEditando, raices,
  roleChange, setRoleChange, confirmarCambioRol, ROLES,
  userToDelete, setUserToDelete, confirmarEliminarUsuario,
  categoryToDelete, setCategoryToDelete, confirmarEliminarCategoria,
  setCategorias
}) {
  return (
    <>
      {destacando && (
        <div className="modal-overlay">
          <form className="user-modal-content" style={{ maxWidth: '420px' }} onSubmit={guardarDestacado}>
            <header className="user-modal-header">
              <div className="modal-title-with-icon"><i className="fa-solid fa-star"></i> Destacar producto</div>
              <button type="button" className="close-modal-btn" onClick={() => setDestacando(null)}><i className="fa-solid fa-xmark"></i></button>
            </header>
            <div className="user-modal-body">
              <p style={{ fontSize: '14px', color: '#374151' }}><strong>{destacando.producto.title}</strong> de {destacando.producto.vendedor?.nombreUsuario}</p>
              <div className="user-modal-grid">
                <div className="form-group">
                  <label htmlFor="nivel-destacado">NIVEL</label>
                  <select id="nivel-destacado" value={destacando.nivel} onChange={e => setDestacando({ ...destacando, nivel: e.target.value })}>
                    {Object.entries(NIVELES_DESTACADO).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="meses-destacado">MESES</label>
                  <input id="meses-destacado" type="number" min="1" max="24" value={destacando.meses} disabled={destacando.nivel === 'NINGUNO'}
                    onChange={e => setDestacando({ ...destacando, meses: Number(e.target.value) })} />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Los destacados salen primero en el catálogo. &ldquo;Sin destacar&rdquo; le saca la visibilidad.</p>
            </div>
            <footer className="user-modal-footer">
              <button type="button" className="btn-cancelar" onClick={() => setDestacando(null)}>Cancelar</button>
              <button type="submit" className="btn-guardar"><i className="fa-solid fa-check"></i> Guardar</button>
            </footer>
          </form>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <UserForm onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); cargar.usuarios() }} />
        </div>
      )}

      {categoriaEditando !== undefined && (
        <div className="modal-overlay">
          <CategoryForm 
            categoria={categoriaEditando} 
            raices={raices} 
            onClose={() => setCategoriaEditando(undefined)} 
            onSave={(resultado, accion) => { 
              setCategoriaEditando(undefined); 
              
              if (accion === 'crear' && resultado) {
                setCategorias(prev => [...(prev ?? []), resultado]);
              } else if (accion === 'editar' && resultado) {
                setCategorias(prev => (prev ?? []).map(c => c.id === resultado.id ? resultado : c));
              }
              
              cargar.categorias(); 
              window.dispatchEvent(new Event('categoriasCambiadas'));
            }} 
          />
        </div>
      )}

      {roleChange && (
        <div className="error-overlay" onClick={() => setRoleChange(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffffff', fontSize: '32px' }}></i>
            </div>
            <h2 className="error-title">¿Confirmás?</h2>
            <p className="error-text">
              ¿Cambiar a <strong>{roleChange.usuario.nombreUsuario}</strong> de {ROLES[roleChange.usuario.rol]} a {ROLES[roleChange.nuevoRol]}?
            </p>
            <div className="panel-modal-actions">
              <button className="error-btn btn-cancel-panel" style={{ backgroundColor: '#e5e7eb', color: '#111827' }} onClick={() => setRoleChange(null)}>Cancelar</button>
              <button className="error-btn" style={{ backgroundColor: '#16a34a' }} onClick={confirmarCambioRol}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="error-overlay" onClick={() => setUserToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffffff', fontSize: '32px' }}></i>
            </div>
            <h2 className="error-title">¿Eliminar Usuario?</h2>
            <p className="error-text">
              ¿Estás seguro de dar de baja a <strong>{userToDelete.nombreUsuario}</strong>?
              <br /><br />
              {userToDelete.rol?.toUpperCase() === 'DESPACHANTE' && "Este usuario ya no podrá gestionar el estado de los envíos."}
              {userToDelete.rol?.toUpperCase() === 'ADMIN' && "Este usuario perderá el acceso al Panel de Administración."}
              {userToDelete.rol?.toUpperCase() === 'CLIENTE' && "Sus publicaciones saldrán del catálogo y de los carritos. Las órdenes se conservan."}
            </p>
            <div className="panel-modal-actions">
              <button className="error-btn btn-cancel-panel" style={{ backgroundColor: '#e5e7eb', color: '#111827' }} onClick={() => setUserToDelete(null)}>Cancelar</button>
              <button className="error-btn" onClick={confirmarEliminarUsuario}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="error-overlay" onClick={() => setCategoryToDelete(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffffff', fontSize: '32px' }}></i>
            </div>
            <h2 className="error-title">¿Eliminar Categoría?</h2>
            <p className="error-text">
              ¿Eliminar <strong>{categoryToDelete.nombre}</strong>? Solo se puede si no tiene subcategorías ni productos.
            </p>
            <div className="panel-modal-actions">
              <button className="error-btn btn-cancel-panel" style={{ backgroundColor: '#e5e7eb', color: '#111827' }} onClick={() => setCategoryToDelete(null)}>Cancelar</button>
              <button className="error-btn" onClick={confirmarEliminarCategoria}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}