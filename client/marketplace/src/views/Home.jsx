import React, { useState } from 'react'
import PostList from '../components/PostList'
import './Home.css'

export const Home = ({ searchTerm, selectedCategory, selectedSubcategory, favorites, toggleFavorite }) => {
  const [openCondition, setOpenCondition] = useState(true)
  const [openLocation, setOpenLocation] = useState(true)

  const [conditions, setConditions] = useState([])
  const [locations, setLocations] = useState([])

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

  return (
    <div className="home-container">
      <div className="home-layout">
        <aside className="sidebar-filtros">
          <h3 className="filtros-titulo">Filtros</h3>
          
          <div className="filtro-grupo">
            <div className="filtro-header" onClick={() => setOpenCondition(!openCondition)}>
              <h4>Condición</h4>
              <i className={`fa-solid fa-chevron-down ${openCondition ? 'rotado' : ''}`}></i>
            </div>
            
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
          </div>

          <div className="filtro-grupo">
            <div className="filtro-header" onClick={() => setOpenLocation(!openLocation)}>
              <h4>Ubicación</h4>
              <i className={`fa-solid fa-chevron-down ${openLocation ? 'rotado' : ''}`}></i>
            </div>
            
            {openLocation && (
              <div className="filtro-opciones">
                <label>
                  <input type="checkbox" checked={locations.includes('Buenos Aires')} onChange={() => handleLocationChange('Buenos Aires')} /> 
                  Buenos Aires
                </label>
                <label>
                  <input type="checkbox" checked={locations.includes('Córdoba')} onChange={() => handleLocationChange('Córdoba')} /> 
                  Córdoba
                </label>
                <label>
                  <input type="checkbox" checked={locations.includes('Santa Fe')} onChange={() => handleLocationChange('Santa Fe')} /> 
                  Santa Fe
                </label>
              </div>
            )}
          </div>
        </aside>

        <div className="main-productos">
          <PostList 
            searchTerm={searchTerm} 
            selectedCategory={selectedCategory} 
            selectedSubcategory={selectedSubcategory}
            conditions={conditions}
            locations={locations}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  )
}

export default Home