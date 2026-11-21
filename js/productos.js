/* =====================================================================
   CATÁLOGO DE PRODUCTOS (ficticio)
   Precios en pesos colombianos (COP), números enteros.
   Las "imágenes" son bloques de color con siglas: no hay archivos externos.
   ===================================================================== */
window.PRODUCTOS = [
  {
    id: "CRV-001",
    nombre: "Camiseta Aero Dry",
    categoria: "Camisetas",
    precio: 89000,
    descripcion: "Camiseta de entrenamiento en tejido ligero de secado rápido, con paneles de ventilación en la espalda y costuras planas que no rozan.",
    siglas: "AD",
    fondo: "linear-gradient(140deg, #1e293b 0%, #0f172a 100%)"
  },
  {
    id: "CRV-002",
    nombre: "Camiseta Manga Larga Termo",
    categoria: "Camisetas",
    precio: 119000,
    descripcion: "Primera capa térmica para correr en madrugadas frías. Interior cepillado, puños con pasador para el pulgar y detalles reflectivos.",
    siglas: "MT",
    fondo: "linear-gradient(140deg, #2563eb 0%, #1e40af 100%)"
  },
  {
    id: "CRV-003",
    nombre: "Leggings Pulse",
    categoria: "Leggings",
    precio: 149000,
    descripcion: "Leggings de tiro alto con compresión media, tela opaca en cuatro direcciones y bolsillo lateral para el celular.",
    siglas: "LP",
    fondo: "linear-gradient(140deg, #db2777 0%, #831843 100%)"
  },
  {
    id: "CRV-004",
    nombre: "Pantaloneta Stride 7\"",
    categoria: "Pantalonetas",
    precio: 99000,
    descripcion: "Pantaloneta de running de 7 pulgadas con licra interior, cintura elástica con cordón y bolsillo trasero con cremallera.",
    siglas: "ST",
    fondo: "linear-gradient(140deg, #0d9488 0%, #115e59 100%)"
  },
  {
    id: "CRV-005",
    nombre: "Top Deportivo Core",
    categoria: "Tops",
    precio: 109000,
    descripcion: "Top de soporte medio para yoga, gimnasio o ciclismo. Copas removibles y espalda cruzada que acompaña el movimiento.",
    siglas: "TC",
    fondo: "linear-gradient(140deg, #ea580c 0%, #9a3412 100%)"
  },
  {
    id: "CRV-006",
    nombre: "Chaqueta Cortavientos Vento",
    categoria: "Chaquetas",
    precio: 259000,
    descripcion: "Cortavientos ultraligera y repelente al agua que se guarda en su propio bolsillo. Capucha ajustable y ventilación posterior.",
    siglas: "VE",
    fondo: "linear-gradient(140deg, #64748b 0%, #334155 100%)"
  },
  {
    id: "CRV-007",
    nombre: "Jogger Flow",
    categoria: "Pantalones",
    precio: 179000,
    descripcion: "Jogger en felpa francesa liviana, corte entallado y tobillo con puño. Para calentar, viajar o descansar después del entreno.",
    siglas: "JF",
    fondo: "linear-gradient(140deg, #7c3aed 0%, #4c1d95 100%)"
  },
  {
    id: "CRV-008",
    nombre: "Medias Run Pack x3",
    categoria: "Accesorios",
    precio: 45000,
    descripcion: "Tres pares de medias tobilleras con zonas acolchadas en talón y punta, soporte en el arco y tejido transpirable.",
    siglas: "MR",
    fondo: "linear-gradient(140deg, #d97706 0%, #78350f 100%)"
  }
];

/* Devuelve el producto con ese id, o null si no existe. */
window.buscarProducto = function (id) {
  return window.PRODUCTOS.find(function (p) { return p.id === id; }) || null;
};
