/* =====================================================================
   PÁGINA: producto.html?id=CRV-001 (detalle)
   Eventos: view_item, add_to_cart
   ===================================================================== */
(function () {
  "use strict";

  var cont = document.getElementById("producto");
  var id = new URLSearchParams(window.location.search).get("id");
  var p = window.buscarProducto(id);

  if (!p) {
    cont.innerHTML =
      '<div class="panel estado-vacio"><h1>Producto no encontrado</h1>' +
      '<p class="texto-2">El enlace no corresponde a ningún producto del catálogo.</p>' +
      '<a class="boton" href="index.html">Ver catálogo</a></div>';
    return;
  }

  document.title = p.nombre + " · Cervo";

  var final = Carrito.precioUnitario(p);
  var precio = final === p.precio
    ? '<span class="precio">' + Carrito.cop(p.precio) + "</span>"
    : '<span class="precio">' + Carrito.cop(final) + '</span><span class="precio-antes">' + Carrito.cop(p.precio) +
      '</span> <span class="etiqueta-descuento">' + Carrito.cupon() + "</span>";

  cont.innerHTML =
    '<div class="detalle">' +
      '<div class="visual visual-grande" style="background:' + p.fondo + '">' +
        '<span class="visual-siglas">' + p.siglas + '</span><span class="visual-marca">Cervo · ' + p.id + "</span>" +
      "</div>" +
      '<div class="detalle-info">' +
        '<span class="tarjeta-categoria">' + p.categoria + "</span>" +
        "<h1>" + p.nombre + "</h1>" +
        '<p class="detalle-precio">' + precio + "</p>" +
        '<p class="detalle-desc">' + p.descripcion + "</p>" +
        '<div class="fila-compra">' +
          '<div class="selector-cantidad" role="group" aria-label="Cantidad">' +
            '<button type="button" id="menos" aria-label="Quitar una unidad">−</button>' +
            '<output id="cantidad" aria-live="polite">1</output>' +
            '<button type="button" id="mas" aria-label="Agregar una unidad">+</button>' +
          "</div>" +
          '<button type="button" class="boton" id="agregar">Agregar al carrito</button>' +
        "</div>" +
        '<div id="mensaje" class="mensaje-ok" hidden></div>' +
        '<ul class="lista-beneficios">' +
          "<li>Envío nacional estándar gratis desde " + Carrito.cop(Carrito.ENVIO_GRATIS_DESDE) + "</li>" +
          "<li>Envíos internacionales Estándar y Express</li>" +
          "<li>Referencia " + p.id + "</li>" +
        "</ul>" +
      "</div>" +
    "</div>";

  // view_item al abrir el detalle
  var itemVista = Carrito.itemGA(p, 1, 0);
  Analitica.enviarEvento("view_item", { value: itemVista.price * itemVista.quantity, items: [itemVista] });

  var cantidad = 1;
  var out = document.getElementById("cantidad");
  document.getElementById("menos").addEventListener("click", function () {
    cantidad = Math.max(1, cantidad - 1); out.textContent = cantidad;
  });
  document.getElementById("mas").addEventListener("click", function () {
    cantidad = Math.min(10, cantidad + 1); out.textContent = cantidad;
  });

  document.getElementById("agregar").addEventListener("click", function () {
    Carrito.agregar(p.id, cantidad);
    var item = Carrito.itemGA(p, cantidad, 0); // quantity = unidades agregadas
    Analitica.enviarEvento("add_to_cart", { value: item.price * item.quantity, items: [item] });

    var msg = document.getElementById("mensaje");
    msg.innerHTML = "Agregaste " + cantidad + (cantidad === 1 ? " unidad" : " unidades") +
      ' al carrito. <a href="carrito.html">Ver carrito ›</a>';
    msg.hidden = false;
    cantidad = 1; out.textContent = 1;
  });
})();
