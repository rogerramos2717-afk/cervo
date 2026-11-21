/* =====================================================================
   CARRITO (localStorage) + utilidades compartidas
   - Guarda solo id de producto, cantidad y cupón. Ningún dato personal.
   - itemGA() arma cada ítem con el formato exacto del contrato GA4.
   ===================================================================== */
(function () {
  "use strict";

  var CLAVE = "cervo_carrito";
  var CUPON_VALIDO = "BIENVENIDA10";
  var DESCUENTO = 0.10;           // 10 %
  var MARCA = "Cervo";

  // Tarifas de envío en COP
  var TARIFAS = {
    "Nacional": { "Estándar": 12000, "Express": 25000 },
    "Internacional": { "Estándar": 95000, "Express": 160000 }
  };
  var ENVIO_GRATIS_DESDE = 150000; // Solo Nacional - Estándar

  var formato = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0
  });

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE));
      if (d && Array.isArray(d.items)) return d;
    } catch (e) { /* almacenamiento no disponible o dañado */ }
    return { items: [], cupon: null };
  }

  function guardar(d) {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { }
    actualizarContador();
  }

  function precioConCupon(precio, cupon) {
    return cupon ? Math.round(precio * (1 - DESCUENTO)) : precio;
  }

  function actualizarContador() {
    var total = Carrito.cantidadTotal();
    var nodos = document.querySelectorAll("[data-contador-carrito]");
    for (var i = 0; i < nodos.length; i++) {
      var prev = parseInt(nodos[i].textContent, 10);
      nodos[i].textContent = total;
      nodos[i].hidden = total === 0;
      if (total > 0 && total !== prev) {
        nodos[i].classList.remove("pop");
        void nodos[i].offsetWidth;
        nodos[i].classList.add("pop");
      }
    }
  }

  var Carrito = {
    CUPON: CUPON_VALIDO,
    TARIFAS: TARIFAS,
    ENVIO_GRATIS_DESDE: ENVIO_GRATIS_DESDE,

    cupon: function () { return leer().cupon || null; },

    /* [{ producto, cantidad }] solo con productos existentes */
    lineas: function () {
      return leer().items
        .map(function (it) { return { producto: window.buscarProducto(it.id), cantidad: it.cantidad }; })
        .filter(function (l) { return l.producto && l.cantidad > 0; });
    },

    cantidadTotal: function () {
      return this.lineas().reduce(function (s, l) { return s + l.cantidad; }, 0);
    },

    cantidadDe: function (id) {
      var l = leer().items.find(function (it) { return it.id === id; });
      return l ? l.cantidad : 0;
    },

    agregar: function (id, n) {
      n = Math.max(1, parseInt(n, 10) || 1);
      var d = leer();
      var it = d.items.find(function (x) { return x.id === id; });
      if (it) it.cantidad += n; else d.items.push({ id: id, cantidad: n });
      guardar(d);
    },

    /* Resta n unidades; si llega a 0 elimina la línea. Devuelve las unidades quitadas. */
    disminuir: function (id, n) {
      var d = leer();
      var it = d.items.find(function (x) { return x.id === id; });
      if (!it) return 0;
      var quitadas = Math.min(it.cantidad, Math.max(1, parseInt(n, 10) || 1));
      it.cantidad -= quitadas;
      if (it.cantidad <= 0) d.items = d.items.filter(function (x) { return x.id !== id; });
      guardar(d);
      return quitadas;
    },

    eliminar: function (id) {
      return this.disminuir(id, this.cantidadDe(id));
    },

    aplicarCupon: function (codigo) {
      if (String(codigo || "").trim().toUpperCase() !== CUPON_VALIDO) return false;
      var d = leer();
      d.cupon = CUPON_VALIDO;
      guardar(d);
      return true;
    },

    quitarCupon: function () {
      var d = leer();
      d.cupon = null;
      guardar(d);
    },

    vaciar: function () {
      try { localStorage.removeItem(CLAVE); } catch (e) { }
      actualizarContador();
    },

    /* Precio unitario que paga el cliente (con cupón si está activo) */
    precioUnitario: function (producto) {
      return precioConCupon(producto.precio, this.cupon());
    },

    /* Ítem GA4: item_id, item_name, item_brand, item_category, price, quantity, index
       Con cupón: price con descuento, discount por unidad y coupon. */
    itemGA: function (producto, cantidad, index) {
      var cupon = this.cupon();
      var price = precioConCupon(producto.precio, cupon);
      var item = {
        item_id: producto.id,
        item_name: producto.nombre,
        item_brand: MARCA,
        item_category: producto.categoria,
        price: price,
        quantity: cantidad,
        index: index
      };
      if (cupon) {
        item.discount = producto.precio - price;
        item.coupon = cupon;
      }
      return item;
    },

    itemsGA: function () {
      var self = this;
      return this.lineas().map(function (l, i) { return self.itemGA(l.producto, l.cantidad, i); });
    },

    /* value = suma de price × quantity */
    valorItems: function (items) {
      return items.reduce(function (s, it) { return s + it.price * it.quantity; }, 0);
    },

    subtotalSinDescuento: function () {
      return this.lineas().reduce(function (s, l) { return s + l.producto.precio * l.cantidad; }, 0);
    },

    totalProductos: function () {
      return this.valorItems(this.itemsGA());
    },

    descuentoTotal: function () {
      return this.subtotalSinDescuento() - this.totalProductos();
    },

    /* tipo: "Nacional" | "Internacional"; servicio: "Estándar" | "Express" */
    costoEnvio: function (tipo, servicio, totalProductos) {
      if (tipo === "Nacional" && servicio === "Estándar" && totalProductos >= ENVIO_GRATIS_DESDE) return 0;
      return TARIFAS[tipo][servicio];
    },

    cop: function (n) { return formato.format(n); },

    actualizarContador: actualizarContador
  };

  window.Carrito = Carrito;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", actualizarContador);
  } else {
    actualizarContador();
  }
  // Si el carrito cambia en otra pestaña, actualiza el contador
  window.addEventListener("storage", function (e) { if (e.key === CLAVE) actualizarContador(); });
})();
