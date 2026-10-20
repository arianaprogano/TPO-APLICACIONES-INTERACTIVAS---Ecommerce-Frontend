import { useEffect, useState } from 'react'
import { getArbolCategorias } from '../api/categorias'
import { PROVINCIAS } from '../api/ordenes'
import { actualizarProducto, eliminarFoto, getFotosDeProducto, subirFoto } from '../api/productos'
import FotoConToken from './FotoConToken'
import './ProductForm.css'
import { useAvisos } from '../components/avisosContext'

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

const ESTADOS_FOTO = { APROBADA: 'Aprobada', EN_REVISION: 'En revisión', RECHAZADA: 'Rechazada' }

function EditProductForm({ onClose, producto, onSave }) {
  const { confirmar, error } = useAvisos()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(() => desdeProducto(producto))
  const [errores, setErrores] = useState({})
  const [editError, setEditError] = useState('')
  const [guardando, setGuardando] = useState(false)
  
  const [fotos, setFotos] = useState(null)
  const [subiendo, setSubiendo] = useState(0)
  const [fotosCambiaron, setFotosCambiaron] = useState(false)

  const cargarFotos = () => getFotosDeProducto(producto.id).then(setFotos).catch(() => setFotos([]))

  const borrarFoto = async (foto) => {
    const aprobadas = (fotos ?? []).filter(f => f.estadoVerificacion === 'APROBADA')
    const esLaUltimaVisible = foto.estadoVerificacion === 'APROBADA' && aprobadas.length === 1
    const ok = await confirmar({
      titulo: '¿Borrar esta foto?',
      texto: esLaUltimaVisible ? 'Es la última foto aprobada: el producto vuelve a borrador y sale del catálogo hasta que se apruebe otra.' : undefined,
      ok: 'Borrar',
      peligro: true,
    })
    if (!ok) return
    try {
      await eliminarFoto(foto.id)
      setFotos(prev => prev.filter(f => f.id !== foto.id))
      setFotosCambiaron(true)
    } catch (err) {
      setEditError(err.message)
    }
  }

  const agregarFotos = async (e) => {
    const archivos = Array.from(e.target.files)
    e.target.value = null
    if (archivos.length === 0) return
    setSubiendo(archivos.length)
    try {
      for (const archivo of archivos) await subirFoto(producto.id, archivo)
      setFotosCambiaron(true)
      await cargarFotos()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSubiendo(0)
    }
  }

  useEffect(() => {
    getArbolCategorias().then(setCategorias).catch(() => setCategorias([]))
    cargarFotos()
  }, [])

  const categoria = categorias.find(c => String(c.id) === form.idCategoria)
  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (Number(form.descuento) >= 100) {
      error('El descuento máximo permitido es del 99%.')
      return
    }

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
        <button type="button" className="close-modal-btn" onClick={() => onClose(fotosCambiaron)}>
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
              <input id="edit-descuento" type="number" min="0" max="99" placeholder="0" value={form.descuento} onChange={e => set('descuento', e.target.value)} />
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

          <div className="form-group full-width">
            <label>ENTREGA</label>
            <div className="entrega-opciones">
              <label className={`entrega-opcion ${form.admiteEnvio ? 'elegida' : ''}`}>
                <input type="radio" name="edit-entrega" checked={form.admiteEnvio} onChange={() => set('admiteEnvio', true)} />
                <i className="fa-solid fa-truck-fast"></i>
                <span><strong>Con envío</strong><small>Se despacha a domicilio</small></span>
              </label>
              <label className={`entrega-opcion ${!form.admiteEnvio ? 'elegida' : ''}`}>
                <input type="radio" name="edit-entrega" checked={!form.admiteEnvio} onChange={() => set('admiteEnvio', false)} />
                <i className="fa-solid fa-handshake"></i>
                <span><strong>Sin envío</strong><small>Retiro o entrega a coordinar</small></span>
              </label>
            </div>
          </div>
          <label className="publicar-check">
            <input type="checkbox" checked={form.aceptaOfertas} onChange={e => set('aceptaOfertas', e.target.checked)} />
            <span><strong>Acepto ofertas</strong></span>
          </label>

          <div className="form-group full-width">
            <label>FOTOS</label>
            {fotos === null ? (
              <span className="publicar-nota">Cargando fotos...</span>
            ) : (
              <div className="edit-fotos">
                {fotos.map((foto, i) => (
                  <div key={foto.id} className={`edit-foto estado-${foto.estadoVerificacion.toLowerCase()}`}>
                    <FotoConToken src={foto.url} alt={`Foto ${i + 1}`} className="edit-foto-img" />
                    <span className="edit-foto-estado">{ESTADOS_FOTO[foto.estadoVerificacion] ?? foto.estadoVerificacion}</span>
                    <button type="button" className="image-chip-delete" title="Borrar foto" onClick={() => borrarFoto(foto)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
                <label className={`edit-foto-agregar ${subiendo ? 'subiendo' : ''}`}>
                  <input type="file" accept="image/*" multiple onChange={agregarFotos} disabled={subiendo > 0} />
                  <i className={`fa-solid ${subiendo ? 'fa-spinner fa-spin' : 'fa-plus'}`}></i>
                  <span>{subiendo ? 'Subiendo...' : 'Agregar'}</span>
                </label>
              </div>
            )}
            <span className="publicar-nota" style={{ marginTop: '6px' }}>Las fotos nuevas se revisan en segundo plano: te avisamos con una notificación.</span>
          </div>

          <div className="form-group full-width">
            <label htmlFor="edit-descripcion">DESCRIPCIÓN</label>
            <textarea id="edit-descripcion" rows="4" maxLength={255} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}></textarea>
          </div>
        </section>

        <footer className="publish-modal-footer">
          <button type="button" className="btn-cancelar" onClick={() => onClose(fotosCambiaron)}>Cancelar</button>
          <button type="submit" className="btn-guardar" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
        </footer>
      </form>
    </div>
  )
}

export default EditProductForm
