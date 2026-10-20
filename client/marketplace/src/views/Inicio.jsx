import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import ProductRow from '../components/ProductRow'
import { getArbolCategorias } from '../api/categorias' 
import { getProductos, getMisPublicaciones } from '../api/productos' // <-- Agregamos getMisPublicaciones
import fotoCampo from '../assets/paisaje-agropecuario.jpg'
import fotoCamioneta from '../assets/camioneta.jpg'
import fotoSemillas from '../assets/semillas.jpg'
import './Inicio.css'

import { useAvisos } from '../components/avisosContext' 

const iconoCategoria = (nombre = '') => {
  const n = nombre.toLowerCase()
  
  // Maquinaria y vehículos
  if (n.includes('maquin') || n.includes('tractor')) return 'fa-tractor'
  if (n.includes('vehic') || n.includes('camion') || n.includes('pick')) return 'fa-truck-pickup'
  
  // Herramientas
  if (n.includes('herramient') || n.includes('taller')) return 'fa-hammer'
  
  // Insumos y semillas
  if (n.includes('semill') || n.includes('insumo') || n.includes('agrotox') || n.includes('fertil')) return 'fa-seedling'
  
  // Ganadería (usando el caballo para máxima compatibilidad)
  if (n.includes('ganad') || n.includes('animal') || n.includes('bovin') || n.includes('vac')) return 'fa-horse'
  
  // Por defecto
  return 'fa-leaf'
}

const fotoCategoria = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('vehic') || n.includes('camion')) return fotoCamioneta
  if (n.includes('semill')) return fotoSemillas
  return null
}

function Inicio({ user, favorites, toggleFavorite, addToCart, setSelectedCategory, setSelectedSubcategory, setSearchTerm }) {
  const navigate = useNavigate()
  const { error: avisarError } = useAvisos() 
  
  const [categorias, setCategorias] = useState([])
  const [porCategoria, setPorCategoria] = useState({})
  const [ofertas, setOfertas] = useState([])
  const [masVistos, setMasVistos] = useState([])
  const [masVendidos, setMasVendidos] = useState([])
  const [error, setError] = useState('')
  

  const [misIds, setMisIds] = useState(new Set())

  useEffect(() => {
    const cargarTodo = () => {
      const lista = (promesa) => promesa.catch(() => [])

      getArbolCategorias()
        .then(async (raices) => {
          setCategorias(raices)
          const productos = await Promise.all(raices.map(c => lista(getProductos({ idCategoria: c.id }))))
          setPorCategoria(Object.fromEntries(raices.map((c, i) => [c.id, productos[i]])))
        })
        .catch(err => setError(err.message))

      lista(getProductos({ enOferta: true })).then(setOfertas)
      lista(getProductos({ orden: 'vistos' })).then(setMasVistos)
      lista(getProductos({ orden: 'vendidos' })).then(setMasVendidos)
    }

    cargarTodo()
    window.addEventListener('categoriasCambiadas', cargarTodo)
    return () => window.removeEventListener('categoriasCambiadas', cargarTodo)
  }, [])


  useEffect(() => {
    if (!user || (user.role !== 'cliente' && user.rol !== 'CLIENTE')) {
      setMisIds(new Set())
      return
    }
    getMisPublicaciones()
      .then((mios) => setMisIds(new Set(mios.map((p) => p.id))))
      .catch(() => setMisIds(new Set()))
  }, [user])

  const verCategoria = (idCategoria) => {
    setSearchTerm('')
    setSelectedCategory(idCategoria)
    setSelectedSubcategory('')
    navigate('/productos')
  }

  const verListado = (query) => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    navigate(`/productos${query}`)
  }

  const handlePublicarClick = () => {
    if (user && (user.rol === 'ADMIN' || user.role === 'admin')) {
      avisarError('Los administradores no publican productos. Gestioná el catálogo desde el Panel.')
    } else if (user) {
      navigate('/publicar')
    } else {
      navigate('/login')
    }
  }

  const slides = [
    {
      titulo: 'El mercado del agro, en un solo lugar',
      texto: 'Maquinaria, insumos y vehículos de productores de todo el país.',
      boton: 'Ver productos',
      onClick: () => verListado(''),
      imagen: fotoCampo,
      icono: 'fa-leaf',
    },
    ...categorias.map(cat => ({
      titulo: cat.nombre,
      texto: cat.descripcion || `Encontrá lo que buscás en ${cat.nombre}.`,
      onClick: () => verCategoria(cat.id),
      imagen: fotoCategoria(cat.nombre) || porCategoria[cat.id]?.find(p => p.image)?.image,
      icono: iconoCategoria(cat.nombre),
    })),
    {
      titulo: 'Publicá tus productos',
      texto: 'Vendé tu maquinaria o tus insumos a compradores de todo el país.',
      boton: user ? 'Publicar producto' : 'Crear cuenta',
      onClick: handlePublicarClick, 
      icono: 'fa-bullhorn',
    },
  ]

  const filaProps = { user, favorites, toggleFavorite, addToCart, misIds }

  return (
    <div className="inicio">
      <HeroCarousel slides={slides} />

      <div className="inicio-contenido">
        {error && <div className="inicio-error">{error}</div>}

        <div className="inicio-catalogo">
          <button className="inicio-btn-catalogo" onClick={() => verListado('')}>
            <i className="fa-solid fa-store"></i> Ver catálogo completo
          </button>
        </div>

        <div className="inicio-recuadro">
          <ProductRow titulo="Ofertas" subtitulo="Productos con descuento" productos={ofertas} onVerTodos={() => verListado('?ofertas=1')} {...filaProps} />
        </div>

        <div className="inicio-recuadro">
          <ProductRow titulo="Más vistos" subtitulo="Lo que más están mirando" productos={masVistos} onVerTodos={() => verListado('?orden=vistos')} {...filaProps} />
        </div>

        <div className="inicio-recuadro">
          <ProductRow titulo="Más vendidos" subtitulo="Los preferidos de los productores" productos={masVendidos} onVerTodos={() => verListado('?orden=vendidos')} {...filaProps} />
        </div>
      </div>
    </div>
  )
}

export default Inicio