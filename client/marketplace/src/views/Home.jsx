import React, { useState } from 'react'
import PostList from '../components/PostList'
import './Home.css'

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires', 
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

export const Home = ({ user, searchTerm, selectedCategory, selectedSubcategory, favorites, toggleFavorite }) => {
  const [openCondition, setOpenCondition] = useState(true)
  const [openLocation, setOpenLocation] = useState(true)
  const [openEnvio, setOpenEnvio] = useState(true)
  const [openOfertas, setOpenOfertas] = useState(true)

  const [conditions, setConditions] = useState([])
  const [locations, setLocations] = useState([])
  const [soloConEnvio, setSoloConEnvio] = useState(false)
  const [soloSinEnvio, setSoloSinEnvio] = useState(false) 
  const [soloOfertas, setSoloOfertas] = useState(false)

  const limpiarFiltros = () => {
    setConditions([])
    setLocations([])
    setSoloConEnvio(false)
    setSoloSinEnvio(false) 
    setSoloOfertas(false)
  }

  const handleConditionChange = (cond) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter(c => c !== cond))
    } else {
      setConditions([...conditions, cond])
    }
  }

  const handleLocationChange = (loc) => {
    if (locations.includes(loc)) {
      setLocations(locations.filter(l => l !== loc))
    } else {
      setLocations([...locations, loc])
    }
  }

  const handleFiltroEnvio = (tipo) => {
    if (tipo === 'conEnvio') {
      setSoloConEnvio(!soloConEnvio)
      if (!soloConEnvio) setSoloSinEnvio(false) 
    } else if (tipo === 'sinEnvio') {
      setSoloSinEnvio(!soloSinEnvio)
      if (!soloSinEnvio) setSoloConEnvio(false) 
    }
  }

  return (
    <div className="home-container">
      <div className="home-layout">
        
        <aside className="sidebar-filtros">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="filtros-titulo" style={{ margin: 0 }}>Filtros</h3>
            
            <button 
              onClick={limpiarFiltros}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#16a34a', 
                fontSize: '13px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
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
            
              <div className="filtro-opciones" style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '8px' }}>
                {PROVINCIAS.map(prov => (
                  <label key={prov}>
                    <input 
                      type="checkbox" 
                      checked={locations.includes(prov)} 
                      onChange={() => handleLocationChange(prov)} 
                    /> 
                    {prov}
                  </label>
                ))}
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
            <header className="filtro-header" onClick={() => setOpenOfertas(!openOfertas)}>
              <h4>Ofertas</h4>
              <i className={`fa-solid fa-chevron-down ${openOfertas ? 'rotado' : ''}`}></i>
            </header>
            
            {openOfertas && (
              <div className="filtro-opciones">
                <label>
                  <input type="checkbox" checked={soloOfertas} onChange={() => setSoloOfertas(!soloOfertas)} /> 
                  Solo productos en oferta
                </label>
              </div>
            )}
          </section>
        </aside>

        <main className="main-productos">
          <PostList 
            user={user}
            searchTerm={searchTerm} 
            selectedCategory={selectedCategory} 
            selectedSubcategory={selectedSubcategory}
            conditions={conditions}
            locations={locations}
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

export default Home;