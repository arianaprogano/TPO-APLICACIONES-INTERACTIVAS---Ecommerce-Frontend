import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import ProductRow from '../components/ProductRow'
import { getArbolCategorias } from '../api/categorias'
import { getProductos } from '../api/productos'
import fotoCampo from '../assets/paisaje-agropecuario.jpg'
import fotoCamioneta from '../assets/camioneta.jpg'
import fotoSemillas from '../assets/semillas.jpg'
import './Inicio.css'

// Icono para cada categoria raiz cuando no hay foto para el banner.
const iconoCategoria = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('maquin') || n.includes('tractor')) return 'fa-tractor'
  if (n.includes('semill') || n.includes('insumo')) return 'fa-seedling'
  if (n.includes('vehic') || n.includes('camion')) return 'fa-truck-pickup'
  return 'fa-leaf'
}

// Foto fija del banner para las categorias que tienen una en assets. Las
// demas usan la foto de alguno de sus productos, o el icono si no hay.
const fotoCategoria = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('vehic') || n.includes('camion')) return fotoCamioneta
  if (n.includes('semill')) return fotoSemillas
  return null
}

// Portada: banner rotativo, acceso al catalogo completo y filas de ofertas,
// mas vistos y mas vendidos. El listado con filtros vive en /productos.
function Inicio({ user, favorites, toggleFavorite, addToCart, setSelectedCategory, setSelectedSubcategory, setSearchTerm }) {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [porCategoria, setPorCategoria] = useState({})
  const [ofertas, setOfertas] = useState([])
  const [masVistos, setMasVistos] = useState([])
  const [masVendidos, setMasVendidos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Si alguna fila falla, que no tire abajo el resto de la portada.
    const lista = (promesa) => promesa.catch(() => [])

    getArbolCategorias()
      .then(async (raices) => {
        setCategorias(raices)
        // Los productos de cada categoria solo se usan para la foto de su banner.
        const productos = await Promise.all(raices.map(c => lista(getProductos({ idCategoria: c.id }))))
        setPorCategoria(Object.fromEntries(raices.map((c, i) => [c.id, productos[i]])))
      })
      .catch(err => setError(err.message))

    lista(getProductos({ enOferta: true })).then(setOfertas)
    lista(getProductos({ orden: 'vistos' })).then(setMasVistos)
    lista(getProductos({ orden: 'vendidos' })).then(setMasVendidos)
  }, [])

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
      link: user ? '/publicar' : '/login',
      icono: 'fa-bullhorn',
    },
  ]

  const filaProps = { user, favorites, toggleFavorite, addToCart }

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

        <ProductRow titulo="Ofertas" subtitulo="Productos con descuento" productos={ofertas} onVerTodos={() => verListado('?ofertas=1')} {...filaProps} />
        <ProductRow titulo="Más vistos" subtitulo="Lo que más están mirando" productos={masVistos} onVerTodos={() => verListado('?orden=vistos')} {...filaProps} />
        <ProductRow titulo="Más vendidos" subtitulo="Los preferidos de los productores" productos={masVendidos} onVerTodos={() => verListado('?orden=vendidos')} {...filaProps} />
      </div>
    </div>
  )
}

export default Inicio
