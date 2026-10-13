import { useState } from 'react'
import { crearCategoria, editarCategoria } from '../api/admin'
import './AdminModals.css'

// En el backend una subcategoria es una categoria mas, que apunta a su padre.
// Por eso el formulario no lleva una lista de subcategorias: para crear una se
// elige la categoria padre.
function CategoryForm({ onClose, onSave, categoria, raices }) {
  const [form, setForm] = useState({
    nombre: categoria?.nombre ?? '',
    descripcion: categoria?.descripcion ?? '',
    idCategoriaPadre: categoria?.idCategoriaPadre ? String(categoria.idCategoriaPadre) : '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Una categoria no puede quedar debajo de si misma.
  const posiblesPadres = raices.filter(r => r.id !== categoria?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.nombre.trim() === '') {
      setError('El nombre es obligatorio.')
      return
    }
    setError('')
    setGuardando(true)
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      idCategoriaPadre: form.idCategoriaPadre ? Number(form.idCategoriaPadre) : null,
    }
    try {
      await (categoria ? editarCategoria(categoria.id, datos) : crearCategoria(datos))
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="user-modal-content" style={{ maxWidth: '440px' }}>
      <header className="user-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-folder-tree" style={{ color: '#16a34a' }}></i>
          {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
        </div>
        <button type="button" className="close-modal-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="user-modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group full-width">
            <label htmlFor="cat-nombre">NOMBRE *</label>
            <input id="cat-nombre" type="text" maxLength={100} placeholder="Ej. Herramientas" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>

          <div className="form-group full-width">
            <label htmlFor="cat-padre">CATEGORÍA PADRE</label>
            <select id="cat-padre" value={form.idCategoriaPadre} onChange={e => setForm({ ...form, idCategoriaPadre: e.target.value })}>
              <option value="">Ninguna: es una categoría principal</option>
              {posiblesPadres.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Para crear una subcategoría, elegí a qué categoría pertenece.</p>
          </div>

          <div className="form-group full-width">
            <label htmlFor="cat-descripcion">DESCRIPCIÓN</label>
            <textarea id="cat-descripcion" rows="3" maxLength={500} placeholder="Se muestra en el banner de la portada"
              value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            ></textarea>
          </div>
        </div>

        <footer className="user-modal-footer">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-guardar" disabled={guardando}>
            <i className="fa-solid fa-check"></i> {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </footer>
      </form>
    </div>
  )
}

export default CategoryForm
