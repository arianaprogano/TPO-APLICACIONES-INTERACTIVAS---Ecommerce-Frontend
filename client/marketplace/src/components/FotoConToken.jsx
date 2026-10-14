import { useEffect, useState } from 'react'
import { getToken } from '../api/client'

// Una foto que todavia no esta aprobada solo la puede ver su vendedor o un
// admin, y el backend lo sabe por el token. Un <img src> no manda el header
// Authorization, asi que estas fotos se piden con fetch y se muestran desde
// una URL temporal del navegador.
function FotoConToken({ src, alt, className }) {
  const [url, setUrl] = useState(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    let creada = null
    let cancelado = false
    setFallo(false)
    fetch(src, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then(blob => {
        if (cancelado) return
        creada = URL.createObjectURL(blob)
        setUrl(creada)
      })
      .catch(() => { if (!cancelado) setFallo(true) })
    return () => {
      cancelado = true
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [src])

  if (fallo) return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '28px' }}><i className="fa-regular fa-image"></i></div>
  if (!url) return <div className={className} style={{ backgroundColor: '#f3f4f6' }} />
  return <img src={url} alt={alt} className={className} />
}

export default FotoConToken
