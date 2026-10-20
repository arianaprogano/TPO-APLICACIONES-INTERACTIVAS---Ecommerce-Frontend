import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HeroCarousel.css'

const INTERVALO_MS = 6000

// Banner rotativo de la portada, como el de Agrofy. Cada slide trae titulo,
// texto, a donde lleva el boton y una foto (o un icono si no hay foto).
function HeroCarousel({ slides }) {
  const navigate = useNavigate()
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => setActual(i => (i + 1) % slides.length), INTERVALO_MS)
    return () => clearInterval(timer)
  }, [slides.length, actual])

  if (slides.length === 0) return null

  const ir = (delta) => setActual(i => (i + delta + slides.length) % slides.length)
  const slide = slides[Math.min(actual, slides.length - 1)]

  return (
    <section className="hero" aria-roledescription="carrusel">
      <div className="hero-slide" key={actual}>
        <div className="hero-texto">
          <h2 className="hero-titulo">{slide.titulo}</h2>
          <p className="hero-bajada">{slide.texto}</p>
          <button className="hero-boton" onClick={() => slide.onClick ? slide.onClick() : navigate(slide.link)}>
            {slide.boton || 'Ver más'}
          </button>
        </div>

        <div className="hero-visual">
          {slide.imagen ? (
            <img src={slide.imagen} alt="" className="hero-imagen" />
          ) : (
            <div className="hero-icono"><i className={`fa-solid ${slide.icono}`}></i></div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-flecha izquierda" onClick={() => ir(-1)} aria-label="Anterior">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="hero-flecha derecha" onClick={() => ir(1)} aria-label="Siguiente">
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="hero-puntos">
            {slides.map((s, i) => (
              <button
                key={s.titulo}
                className={`hero-punto ${i === actual ? 'activo' : ''}`}
                onClick={() => setActual(i)}
                aria-label={`Ir al banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default HeroCarousel
