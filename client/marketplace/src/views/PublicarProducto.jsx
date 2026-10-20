import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArbolCategorias } from '../api/categorias'
import { PROVINCIAS } from '../api/ordenes'
import { crearProducto, subirFoto } from '../api/productos'
import '../components/ProductForm.css'
import './PublicarProducto.css'

const AÑO_MAXIMO = new Date().getFullYear()

const formularioVacio = {
  nombre: '', idCategoria: '', idSubcategoria: '', condicion: '', anio: '',
  precio: '', descuento: '', stock: '1',
  provincia: '', ubicacion: '', admiteEnvio: null, aceptaOfertas: false,
  descripcion: '',
}

function PublicarProducto() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(formularioVacio)
  const [fotos, setFotos] = useState([])
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [paso, setPaso] = useState('formulario')
  const [progreso, setProgreso] = useState('')
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    getArbolCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  const fotosRef = useRef(fotos)
  fotosRef.current = fotos
  useEffect(() => () => fotosRef.current.forEach(f => URL.revokeObjectURL(f.url)), [])

  const categoria = categorias.find(c => String(c.id) === String(form.idCategoria))
  
  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const agregarFotos = (e) => {
    const nuevas = Array.from(e.target.files).map(file => ({ file, url: URL.createObjectURL(file) }))
    setFotos(prev => [...prev, ...nuevas])
    setErrores(prev => ({ ...prev, fotos: undefined }))
    e.target.value = null
  }

  const quitarFoto = (indice) => {
    URL.revokeObjectURL(fotos[indice].url)
    setFotos(prev => prev.filter((_, i) => i !== indice))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El título es obligatorio'
    if (!form.idCategoria) e.idCategoria = 'Elegí una categoría'
    if (!form.condicion) e.condicion = 'Indicá si es nuevo o usado'
    

    if (!form.anio) {
      e.anio = 'Indicá el año'
    } else if (Number(form.anio) < 1900 || Number(form.anio) > AÑO_MAXIMO) {
      e.anio = `El año tiene que estar entre 1900 y ${AÑO_MAXIMO}`
    }

    if (!form.precio || Number(form.precio) <= 0) e.precio = 'El precio tiene que ser mayor a cero'
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'El stock no puede ser negativo'
    
    if (form.descuento !== '') {
      if (Number(form.descuento) < 0 || Number(form.descuento) > 99) {
        e.descuento = 'El descuento máximo permitido es 99%'
      }
    }

    if (!form.provincia) e.provincia = 'Elegí la provincia'
    if (form.admiteEnvio === null) e.admiteEnvio = 'Indicá si hacés envíos'
    if (fotos.length === 0) e.fotos = 'Subí al menos una foto: sin foto el producto no se publica'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const encontrados = validar()
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      setError('Hay datos inválidos en el pedido')
      return
    }

    setPaso('subiendo')
    setProgreso('Creando la publicación...')
    let producto
    try {
      ({ producto } = await crearProducto({
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
      }))
    } catch (err) {
      setPaso('formulario')
      
      let mensajeGlobal = err.message
      let camposConError = err.campos || {}

      if (mensajeGlobal && mensajeGlobal.includes('anio tiene que estar entre')) {
        camposConError.anio = mensajeGlobal.replace('anio', 'año')
        mensajeGlobal = 'Hay datos inválidos en el pedido'
      }

      if (camposConError.anio && camposConError.anio.includes('anio')) {
        camposConError.anio = camposConError.anio.replace('anio', 'año')
      }

      setError(mensajeGlobal)
      setErrores(camposConError)
      return
    }

    const fotosSubidas = []
    for (let i = 0; i < fotos.length; i++) {
      setProgreso(`Subiendo foto ${i + 1} de ${fotos.length}...`)
      try {
        await subirFoto(producto.id, fotos[i].file)
        fotosSubidas.push({ nombre: fotos[i].file.name, ok: true })
      } catch (err) {
        fotosSubidas.push({ nombre: fotos[i].file.name, ok: false, mensaje: err.message })
      }
    }

    setResultado({ producto, fotos: fotosSubidas })
    setPaso('listo')
  }

  if (paso === 'subiendo') {
    return (
      <div className="publicar-container">
        <div className="publicar-card publicar-estado">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>{progreso}</p>
        </div>
      </div>
    )
  }

  if (paso === 'listo') {
    const subidas = resultado.fotos.filter(f => f.ok).length
    return (
      <div className="publicar-container">
        <div className="publicar-card publicar-estado">
          <i className={subidas > 0 ? 'fa-solid fa-circle-check publicar-ok' : 'fa-solid fa-triangle-exclamation publicar-aviso'}></i>
          <h2>{subidas > 0 ? '¡Se subió todo!' : 'No se pudo subir ninguna foto'}</h2>
          <p>
            {subidas > 0
              ? `"${resultado.producto.nombre}" está en revisión. Te avisamos con una notificación cuando termine: si se aprueba alguna foto, se publica sola.`
              : 'El producto quedó como borrador. Podés subir fotos desde Mis Publicaciones › Editar publicación.'}
          </p>

          <ul className="publicar-fotos-resultado">
            {resultado.fotos.map((f, i) => (
              <li key={i} className={f.ok ? 'foto-en_revision' : 'foto-rechazada'}>
                <span>{f.nombre}</span>
                <strong>{f.ok ? 'En revisión' : 'No se subió'}</strong>
                {f.mensaje && <small>{f.mensaje}</small>}
              </li>
            ))}
          </ul>

          <div className="publicar-acciones">
            <button className="btn-guardar" onClick={() => navigate('/vendedor')}>Ir a Mis publicaciones</button>
            <button className="btn-cancelar" onClick={() => { setResultado(null); setForm(formularioVacio); setFotos([]); setPaso('formulario') }}>Publicar otro</button>
          </div>
        </div>
      </div>
    )
  }

  const campoError = (campo) => errores[campo] && <span className="publicar-error-campo">{errores[campo]}</span>

  return (
    <div className="publicar-container">
      <form className="publicar-card" onSubmit={handleSubmit} noValidate>
        <header className="publicar-header">
          <h1><i className="fa-solid fa-box-open"></i> Publicar producto</h1>
          <p>Completá los datos de lo que querés vender. Con la primera foto aprobada se publica.</p>
        </header>

        {error && <div className="publicar-error">{error}</div>}

        <section className="publicar-seccion">
          <h2>¿Qué vendés?</h2>
          <div className="form-group">
            <label htmlFor="nombre">Título</label>
            <input id="nombre" type="text" maxLength={100} placeholder="Ej: Tractor John Deere 5090E" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            {campoError('nombre')}
          </div>

          <div className="publish-modal-grid">
            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" value={form.idCategoria} onChange={e => { set('idCategoria', e.target.value); set('idSubcategoria', '') }}>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {campoError('idCategoria')}
            </div>
            <div className="form-group">
              <label htmlFor="subcategoria">Subcategoría</label>
              <select id="subcategoria" value={form.idSubcategoria} onChange={e => set('idSubcategoria', e.target.value)} disabled={!categoria?.subcategorias.length}>
                <option value="">{categoria?.subcategorias.length ? 'Ninguna en particular' : 'No tiene'}</option>
                {categoria?.subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="condicion">Condición</label>
              <select id="condicion" value={form.condicion} onChange={e => set('condicion', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </select>
              {campoError('condicion')}
            </div>
            <div className="form-group">
              <label htmlFor="anio">Año</label>
              <input id="anio" type="number" min={1900} max={AÑO_MAXIMO} placeholder={String(new Date().getFullYear())} value={form.anio} onChange={e => set('anio', e.target.value)} />
              {campoError('anio')}
            </div>
          </div>
        </section>

        <section className="publicar-seccion">
          <h2>Precio y stock</h2>
          <div className="publicar-grid-3">
            <div className="form-group">
              <label htmlFor="precio">Precio ($)</label>
              <input id="precio" type="number" min="0" step="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} />
              {campoError('precio')}
            </div>
            <div className="form-group">
              <label htmlFor="descuento">Descuento (%)</label>
              {/* Le pusimos max="99" como freno visual */}
              <input id="descuento" type="number" min="0" max="99" placeholder="0" value={form.descuento} onChange={e => set('descuento', e.target.value)} />
              {campoError('descuento')}
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input id="stock" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
              {campoError('stock')}
            </div>
          </div>
          {form.precio && Number(form.descuento) > 0 && (
            <p className="publicar-nota">
              Precio final: $ {new Intl.NumberFormat('es-AR').format(Math.round(Number(form.precio) * (100 - Number(form.descuento)) / 100))}
            </p>
          )}
        </section>

        <section className="publicar-seccion">
          <h2>Ubicación y entrega</h2>
          <div className="publish-modal-grid">
            <div className="form-group">
              <label htmlFor="provincia">Provincia</label>
              <select id="provincia" value={form.provincia} onChange={e => set('provincia', e.target.value)}>
                <option value="">Seleccionar...</option>
                {PROVINCIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
              </select>
              {campoError('provincia')}
            </div>
            <div className="form-group">
              <label htmlFor="ubicacion">Localidad</label>
              <input id="ubicacion" type="text" maxLength={150} placeholder="Ej: Pergamino" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} />
              {campoError('ubicacion')}
            </div>
          </div>

          <div className="form-group">
            <label>¿HACÉS ENVÍOS?</label>
            <div className="entrega-opciones">
              <label className={`entrega-opcion ${form.admiteEnvio === true ? 'elegida' : ''}`}>
                <input type="radio" name="publicar-entrega" checked={form.admiteEnvio === true} onChange={() => set('admiteEnvio', true)} />
                <i className="fa-solid fa-truck-fast"></i>
                <span><strong>Sí, con envío</strong><small>Se despacha a domicilio, siempre</small></span>
              </label>
              <label className={`entrega-opcion ${form.admiteEnvio === false ? 'elegida' : ''}`}>
                <input type="radio" name="publicar-entrega" checked={form.admiteEnvio === false} onChange={() => set('admiteEnvio', false)} />
                <i className="fa-solid fa-handshake"></i>
                <span><strong>No, sin envío</strong><small>Retiro o entrega a coordinar</small></span>
              </label>
            </div>
            {campoError('admiteEnvio')}
          </div>
          <label className="publicar-check">
            <input type="checkbox" checked={form.aceptaOfertas} onChange={e => set('aceptaOfertas', e.target.checked)} />
            <span><strong>Acepto ofertas</strong> — los compradores pueden proponerte otro precio.</span>
          </label>
        </section>

        <section className="publicar-seccion">
          <h2>Fotos</h2>
          <div className="form-group">
            <div className="file-input-wrapper">
              <input type="file" multiple className="custom-file-input" onChange={agregarFotos} accept="image/*" title="" />
              {fotos.length > 0 && (
                <div className="publicar-previews">
                  {fotos.map((foto, i) => (
                    <div key={foto.url} className={`publicar-preview ${i === 0 ? 'principal' : ''}`}>
                      <img src={foto.url} alt={foto.file.name} />
                      {i === 0 && <span className="badge-principal">Principal</span>}
                      <button type="button" className="image-chip-delete" onClick={() => quitarFoto(i)} title="Quitar foto">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {campoError('fotos')}
          </div>
        </section>

        <section className="publicar-seccion">
          <h2>Descripción</h2>
          <div className="form-group">
            <textarea rows="5" maxLength={255} placeholder="Estado, horas de uso, características..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)}></textarea>
            <span className="publicar-contador">{form.descripcion.length}/255</span>
            {campoError('descripcion')}
          </div>
        </section>

        <footer className="publish-modal-footer">
          <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="btn-guardar">Publicar</button>
        </footer>
      </form>
    </div>
  )
}

export default PublicarProducto