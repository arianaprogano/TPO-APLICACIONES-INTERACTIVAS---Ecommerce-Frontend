import { createContext, useContext } from 'react'

// Contexto de los avisos al usuario (error, exito, confirmar, toast). El
// proveedor y los modales estan en Avisos.jsx.
export const AvisosContext = createContext(null)

export const useAvisos = () => useContext(AvisosContext)
