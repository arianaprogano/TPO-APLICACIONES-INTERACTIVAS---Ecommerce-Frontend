import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostList from '../components/PostList'
import { PROVINCIAS } from '../api/ordenes'
import './Home.css'

const rangoVacio = { precioMin: '', precioMax: '', anioDesde: '', anioHasta: '' }

const Home = ({ 
  user, addToCart, searchTerm, selectedCategory, selectedSubcategory, favorites, toggleFavorite,
  // Props de filtros levantadas a App.jsx
  conditions, setConditions,
  provincia, setProvincia,
  rango, setRango,
  soloConEnvio, setSoloConEnvio,
  soloSinEnvio, setSoloSinEnvio,
  soloOfertas, setSoloOfertas 
}) => {
  
  const [openCondition, setOpenCondition] = useState(true)
  const [openLocation, setOpenLocation] = useState(true)
  const [openPrecio, setOpenPrecio] = useState(true)
  const [openAnio, setOpenAnio] = useState(true)
  const [openEnvio, setOpenEnvio] = useState(true)
  const [openOfertasMenu, setOpenOfertasMenu] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const orden = searchParams.get('orden') || ''

  const cambiarOrden = (nuevoOrden) => {
    const params = new URLSearchParams(searchParams)
    if (nuevoOrden) params.set('orden', nuevoOrden)
    else params.delete('orden')
    setSearchParams(params)
  }

  const limpiarFiltros = () => {
    setConditions([])
    setProvincia('')
    setRango(rangoVacio)
    setSoloConEnvio(false)
    setSoloSinEnvio(false)
    setSoloOfertas(false)
  }

  const handleConditionChange = (cond) => {
    setConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    )
  }

  const cambiarRango = (campo, valor) => setRango(prev => ({ ...prev, [campo]: valor }))

  const handleFiltroEnvio = (tipo) => {
    if (tipo === 'conEnvio') {
      setSoloConEnvio(prev => !prev)
      setSoloSinEnvio(false)
    } else if (tipo === 'sinEnvio') {
      setSoloSinEnvio(prev => !prev)
      setSoloConEnvio(false)
    }
  }

  return (
    <div className="home-container">
      <div className="home-layout">

        <aside className="sidebar-filtros">

          <div className="filtros-header-principal">
            <h3 className="filtros-titulo">Filtros</h3>
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenCondition(!openCondition)}>
              <h4>Condición</h4>
              <i className={`fa-solid fa-chevron-down ${openCondition ? 'rotado' : ''}`}></i>
            </header>

            {openCondition && (
              <div className="filtro-opciones">
                <label>
                  <input type="checkbox" checked={conditions.includes('Nuevo')} onChange={() => handleConditionChange('Nuevo')} />
                  Nuevo
                </label>
                <label>
                  <input type="checkbox" checked={conditions.includes('Usado')} onChange={() => handleConditionChange('Usado')} />
                  Usado
                </label>
              </div>
            )}
          </section>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenLocation(!openLocation)}>
              <h4>Ubicación</h4>
              <i className={`fa-solid fa-chevron-down ${openLocation ? 'rotado' : ''}`}></i>
            </header>

            {openLocation && (
              <div className="filtro-opciones">
                <select className="filtro-select" value={provincia} onChange={(e) => setProvincia(e.target.value)} aria-label="Provincia">
                  <option value="">Todas las provincias</option>
                  {PROVINCIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
                </select>
              </div>
            )}
          </section>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenPrecio(!openPrecio)}>
              <h4>Precio</h4>
              <i className={`fa-solid fa-chevron-down ${openPrecio ? 'rotado' : ''}`}></i>
            </header>

            {openPrecio && (
              <div className="filtro-rango">
                <input type="number" min="0" placeholder="Mínimo" value={rango.precioMin} onChange={(e) => cambiarRango('precioMin', e.target.value)} aria-label="Precio mínimo" />
                <span>—</span>
                <input type="number" min="0" placeholder="Máximo" value={rango.precioMax} onChange={(e) => cambiarRango('precioMax', e.target.value)} aria-label="Precio máximo" />
              </div>
            )}
          </section>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenOfertasMenu(!openOfertasMenu)}>
              <h4>Promociones</h4>
              <i className={`fa-solid fa-chevron-down ${openOfertasMenu ? 'rotado' : ''}`}></i>
            </header>

            {openOfertasMenu && (
              <div className="filtro-opciones">
                <label>
                  <input type="checkbox" checked={soloOfertas} onChange={() => setSoloOfertas(prev => !prev)} />
                  Solo productos con descuento
                </label>
              </div>
            )}
          </section>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenEnvio(!openEnvio)}>
              <h4>Envío</h4>
              <i className={`fa-solid fa-chevron-down ${openEnvio ? 'rotado' : ''}`}></i>
            </header>

            {openEnvio && (
              <div className="filtro-opciones">
                <label>
                  <input
                    type="checkbox"
                    checked={soloConEnvio}
                    onChange={() => handleFiltroEnvio('conEnvio')}
                  />
                  Con envío disponible
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={soloSinEnvio}
                    onChange={() => handleFiltroEnvio('sinEnvio')}
                  />
                  Unicamente retiro en persona
                </label>
              </div>
            )}
          </section>

          <section className="filtro-grupo">
            <header className="filtro-header" onClick={() => setOpenAnio(!openAnio)}>
              <h4>Año</h4>
              <i className={`fa-solid fa-chevron-down ${openAnio ? 'rotado' : ''}`}></i>
            </header>

            {openAnio && (
              <div className="filtro-rango">
                <input type="number" min="1900" placeholder="Desde" value={rango.anioDesde} onChange={(e) => cambiarRango('anioDesde', e.target.value)} aria-label="Año desde" />
                <span>—</span>
                <input type="number" min="1900" placeholder="Hasta" value={rango.anioHasta} onChange={(e) => cambiarRango('anioHasta', e.target.value)} aria-label="Año hasta" />
              </div>
            )}
          </section>

        </aside>

        <main className="main-productos">
          <div className="catalogo-toolbar">
            <label className="catalogo-orden">
              Ordenar por
              <select value={orden} onChange={(e) => cambiarOrden(e.target.value)}>
                <option value="">Más relevantes</option>
                <option value="precio_asc">Menor precio</option>
                <option value="precio_desc">Mayor precio</option>
                <option value="vistos">Más vistos</option>
                <option value="vendidos">Más vendidos</option>
              </select>
            </label>
          </div>

          <PostList
            orden={orden}
            user={user}
            addToCart={addToCart}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            conditions={conditions}
            provincia={provincia}
            rango={rango}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            soloConEnvio={soloConEnvio}
            soloSinEnvio={soloSinEnvio}
            soloOfertas={soloOfertas}
          />
        </main>
      </div>
    </div>
  )
}

export default Home