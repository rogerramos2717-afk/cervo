/* =====================================================================
   PÁGINA: index.html (catálogo + banner del cupón)
   Eventos: view_item_list, view_promotion, select_promotion, select_item
   ===================================================================== */
(function () {
  "use strict";

  var LISTA = { item_list_id: "catalogo_principal", item_list_name: "Catálogo principal" };
  var PROMO = {
    promotion_id: "BIENVENIDA10",
    promotion_name: "Bienvenida 10 % de descuento",
    creative_name: "banner_bienvenida",
    creative_slot: "inicio_hero"
  };

  var grilla = document.getElementById("catalogo");
  var banner = document.getElementById("banner-promo");

  /* ---------- Catálogo ---------- */
  function precioHTML(p) {
    var final = Carrito.precioUnitario(p);
    if (final === p.precio) return '<span class="precio">' + Carrito.cop(p.precio) + "</span>";
    return '<span class="precio">' + Carrito.cop(final) + '</span><span class="precio-antes">' + Carrito.cop(p.precio) + "</span>";
  }

  window.PRODUCTOS.forEach(function (p, i) {
    var a = document.createElement("a");
    a.className = "tarjeta";
    a.href = "producto.html?id=" + encodeURIComponent(p.id);
    a.innerHTML =
      '<div class="visual" style="background:' + p.fondo + '">' +
        (p.svg ? '<div class="visual-figura">' + p.svg + "</div>" : "") +
        '<span class="visual-siglas">' + p.siglas + "</span>" +
        '<span class="visual-marca">Cervo</span>' +
      "</div>" +
      '<div class="tarjeta-info">' +
        '<span class="tarjeta-categoria">' + p.categoria + "</span>" +
        '<span class="tarjeta-nombre">' + p.nombre + "</span>" +
        "<span>" + precioHTML(p) + "</span>" +
        '<span class="tarjeta-ver">Ver detalle ›</span>' +
      "</div>";

    a.addEventListener("click", function (e) {
      // Ctrl/Cmd+clic abre otra pestaña: dejamos el comportamiento normal
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
        Analitica.enviarEvento("select_item", Object.assign({}, LISTA, { items: [Carrito.itemGA(p, 1, i)] }));
        return;
      }
      e.preventDefault();
      Analitica.enviarEventoYNavegar(
        "select_item",
        Object.assign({}, LISTA, { items: [Carrito.itemGA(p, 1, i)] }),
        a.href
      );
    });
    grilla.appendChild(a);
  });

  var itemsCatalogo = window.PRODUCTOS.map(function (p, i) { return Carrito.itemGA(p, 1, i); });

  // view_item_list al cargar el catálogo
  Analitica.enviarEvento("view_item_list", Object.assign({}, LISTA, { items: itemsCatalogo }));

  /* ---------- Banner del cupón ---------- */
  var paramsPromo = Object.assign({}, PROMO, { items: itemsCatalogo });

  if (Carrito.cupon()) {
    document.getElementById("banner-texto").textContent = "Tu 10 % de descuento ya está activo";
    document.getElementById("banner-cta").textContent = "Ir al carrito";
  }

  // view_promotion cuando el banner se muestra en pantalla (una vez por carga)
  var promoVista = false;
  function marcarVista() {
    if (promoVista) return;
    promoVista = true;
    Analitica.enviarEvento("view_promotion", paramsPromo);
  }
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { marcarVista(); obs.disconnect(); }
      });
    }, { threshold: 0.5 });
    obs.observe(banner);
  } else {
    marcarVista();
  }

  // select_promotion: aplica el cupón y lleva al carrito
  banner.addEventListener("click", function (e) {
    e.preventDefault();
    marcarVista(); // garantiza el orden view_promotion -> select_promotion
    Carrito.aplicarCupon(PROMO.promotion_id);
    Analitica.enviarEventoYNavegar("select_promotion", paramsPromo, "carrito.html");
  });
})();
