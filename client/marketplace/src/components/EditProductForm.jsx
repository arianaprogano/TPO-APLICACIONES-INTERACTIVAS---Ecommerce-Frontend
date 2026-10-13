import { useEffect, useState } from 'react'
import { getArbolCategorias } from '../api/categorias'
import { PROVINCIAS } from '../api/ordenes'
import { actualizarProducto, eliminarFoto } from '../api/productos'
import './ProductForm.css'

// El PUT del backend reemplaza el producto entero, asi que el formulario
// arranca con todos los datos actuales y manda todos de vuelta. Las fotos y
// el estado de publicacion se manejan aparte, desde el panel.
const desdeProducto = (p) => {
  const cat = p.categoria
  return {
    nombre: p.title ?? '',
    idCategoria: String(cat?.idCategoriaPadre ?? cat?.id ?? ''),
    idSubcategoria: cat?.idCategoriaPadre ? String(cat.id) : '',
    condicion: p.condition === 'Nuevo' ? 'NUEVO' : 'USADO',
    anio: String(p.anio ?? ''),
    precio: String(p.precioOriginal ?? ''),
    descuento: String(p.porcentajeDescuento ?? 0),
    stock: String(p.stock ?? 0),
    provincia: p.provincia ?? '',
    ubicacion: p.location ?? '',
    admiteEnvio: Boolean(p.conEnvio),
    aceptaOfertas: Boolean(p.aceptaOfertas),
    descripcion: p.body ?? '',
  }
}

function EditProductForm({ onClose, producto, onSave }) {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(() => desdeProducto(producto))
  const [errores, setErrores] = useState({})
  const [editError, setEditError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [fotos, setFotos] = useState(producto.fotos ?? [])
  const [fotosBorradas, setFotosBorradas] = useState(false)

  // Las fotos se borran al instante (no esperan a "Guardar cambios"): es otro
  // endpoint y el PUT del producto no las toca.
  const borrarFoto = async (foto) => {
    const esLaUltima = fotos.length === 1
    const aviso = esLaUltima
      ? 'Es la última foto: el producto vuelve a borrador y sale del catálogo hasta que subas otra. ¿Borrarla?'
      : '¿Borrar esta foto?'
    if (!window.confirm(aviso)) return
    try {
      await eliminarFoto(foto.id)
      setFotos(prev => prev.filter(f => f.id !== foto.id))
      setFotosBorradas(true)
    } catch (err) {
      setEditError(err.message)
    }
  }

  useEffect(() => {
    getArbolCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  const categoria = categorias.find(c => String(c.id) === form.idCategoria)
  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.precio || form.stock === '' || !form.anio || !form.provincia || !form.idCategoria) {
      setEditError('Completá título, categoría, año, precio, stock y provincia.')
      return
    }

    setEditError('')
    setGuardando(true)
    try {
      const actualizado = await actualizarProducto(producto.id, {
        nombre: form.nombre.trim(),
        idCategoria: Number(form.idSubcategoria || form.idCategoria),
        condicion: form.condicion,
        anio: Number(form.anio),
        precio: Number(form.precio),
        descuento: form.descuento === '' ? 0 : Number(form.descuento),
        stock: Number(form.stock),
        provincia: form.provincia,
        ubicacion: form.ubicacion.trim(),
        admiteEnvio: form.admiteEnvio,
        aceptaOfertas: form.aceptaOfertas,
        descripcion: form.descripcion.trim(),
      })
      onSave(actualizado)
    } catch (err) {
      setEditError(err.message)
      setErrores(err.campos || {})
    } finally {
      setGuardando(false)
    }
  }

  const campoError = (campo) => errores[campo] && <span className="publicar-error-campo">{errores[campo]}</span>

  return (
    <div className="publish-modal-content" style={{ maxWidth: '620px' }}>
      <header className="publish-modal-header">
        <div className="modal-title-with-icon">
          <i className="fa-solid fa-pen-to-square" style={{ color: '#16a34a' }}></i> Editar Producto
        </div>
        <button type="button" className="close-modal-btn" onClick={() => onClose(fotosBorradas)}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <section className="publish-modal-body">
          {editError && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{editError}</div>}

          <div className="form-group full-width">
            <label htmlFor="edit-nombre">TÍTULO</label>
            <input id="edit-nombre" type="text" maxLength={100} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            {campoError('nombre')}
          </div>

          <div className="publish-modal-grid">
            <div className="form-group">
              <label htmlFor="edit-categoria">CATEGORÍA</label>
              <select id="edit-categoria" value={form.idCategoria} onChange={e => { set('idCategoria', e.target.value); set('idSubcategoria', '') }}>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-subcategoria">SUBCATEGORÍA</label>
              <select id="edit-subcategoria" value={form.idSubcategoria} onChange={e => set('idSubcategoria', e.target.value)} disabled={!categoria?.subcategorias.length}>
                <option value="">{categoria?.subcategorias.length ? 'Ninguna en particular' : 'No tiene'}</option>
                {categoria?.subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-condicion">CONDICIÓN</label>
              <select id="edit-condicion" value={form.condicion} onChange={e => set('condicion', e.target.value)}>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-anio">AÑO</label>
              <input id="edit-anio" type="number" min={1900} value={form.anio} onChange={e => set('anio', e.target.value)} />
              {campoError('anio')}
            </div>
            <div className="form-group">
              <label htmlFor="edit-precio">PRECIO ($)</label>
              <input id="edit-precio" type="number" min="0" step="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} />
              {campoError('precio')}
            </div>
            <div className="form-group">
              <label htmlFor="edit-descuento">DESCUENTO (%)</label>
              <input id="edit-descuento" type="number" min="0" max="100" placeholder="0" value={form.descuento} onChange={e => set('descuento', e.target.value)} />
              {campoError('descuento')}
              {form.precio && Number(form.descuento) > 0 && (
                <span className="publicar-nota" style={{ marginTop: '4px' }}>
                  Precio final: $ {new Intl.NumberFormat('es-AR').format(Math.round(Number(form.precio) * (100 - Number(form.descuento)) / 100))}
                  {' '}({form.descuento}% OFF)
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="edit-stock">STOCK</label>
              <input id="edit-stock" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
              {campoError('stock')}
            </div>
            <div className="form-group">
              <label htmlFor="edit-provincia">PROVINCIA</label>
              <select id="edit-provincia" value={form.provincia} onChange={e => set('provincia', e.target.value)}>
                <option value="">Seleccionar...</option>
                {PROVINCIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="edit-ubicacion">LOCALIDAD</label>
            <input id="edit-ubicacion" type="text" maxLength={150} value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} />
          </div>

          <label className="publicar-check">
            <input type="checkbox" checked={form.admiteEnvio} onChange={e => set('admiteEnvio', e.target.checked)} />
            <span><strong>Hago envíos</strong></span>
          </label>
          <label className="publicar-check">
            <input type="checkbox" checked={form.aceptaOfertas} onChange={e => set('aceptaOfertas', e.target.checked)} />
            <span><strong>Acepto ofertas</strong></span>
          </label>

          <div className="form-group full-width">
            <label>FOTOS</label>
            {fotos.length === 0 ? (
              <span className="publicar-nota">Sin fotos aprobadas. Agregá una desde el botón de la cámara en Mis Publicaciones.</span>
            ) : (
              <div className="edit-fotos">
                {fotos.map((foto, i) => (
                  <div key={foto.id} className="edit-foto">
                    <img src={foto.url} alt={`Foto ${i + 1}`} />
                    {i === 0 && <span className="badge-principal">Principal</span>}
                    <button type="button" className="image-chip-delete" title="Borrar foto" onClick={() => borrarFoto(foto)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="edit-descripcion">DESCRIPCIÓN</label>
            <textarea id="edit-descripcion" rows="4" maxLength={500} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}></textarea>
          </div>
        </section>

        <footer className="publish-modal-footer">
          <button type="button" className="btn-cancelar" onClick={() => onClose(fotosBorradas)}>Cancelar</button>
          <button type="submit" className="btn-guardar" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
        </footer>
      </form>
    </div>
  )
}

export default EditProductForm
