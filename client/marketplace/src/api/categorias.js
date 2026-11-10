// El backend devuelve una lista plana donde cada categoria apunta a su padre.
// La barra de navegacion la necesita en dos niveles: raices y sus hijas.
export const armarArbolCategorias = (categorias) => {
  const raices = categorias.filter((c) => c.idCategoriaPadre == null)
  return raices.map((raiz) => ({
    ...raiz,
    subcategorias: categorias.filter((c) => c.idCategoriaPadre === raiz.id),
  }))
}
