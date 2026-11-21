/* =====================================================================
   PÁGINA: carrito.html
   Eventos: view_cart, add_to_cart (+), remove_from_cart (− y Eliminar)
   ===================================================================== */
(function () {
  "use strict";

  var cont = document.getElementById("carrito");
  var mensajeCupon = "";

  function pintar() {
    var lineas = Carrito.lineas();
    if (!lineas.length) {
      cont.innerHTML =
        '<div class="panel estado-vacio"><h2>Tu carrito está vacío</h2>' +
        '<p class="texto-2">' + (Carrito.cupon() ? "Tu cupón " + Carrito.cupon() + " está activo. " : "") +
        "Explora el catálogo y agrega tus favoritos.</p>" +
        '<a class="boton" href="index.html">Ver catálogo</a></div>';
      return;
    }

    var cupon = Carrito.cupon();
    var html = '<div class="dos-columnas"><div class="panel">';
    lineas.forEach(function (l) {
      var p = l.producto;
      var unit = Carrito.precioUnitario(p);
      html +=
        '<div class="linea-carrito">' +
          '<div class="visual visual-mini" style="background:' + p.fondo + '"><span class="visual-siglas">' + p.siglas + "</span></div>" +
          '<div class="linea-info">' +
            '<a href="producto.html?id=' + encodeURIComponent(p.id) + '">' + p.nombre + "</a>" +
            '<div class="texto-2" style="font-size:14px">' + p.categoria + " · " + Carrito.cop(unit) + " c/u" +
              (unit !== p.precio ? ' <span class="precio-antes">' + Carrito.cop(p.precio) + "</span>" : "") + "</div>" +
            '<div class="selector-cantidad" style="margin-top:8px" role="group" aria-label="Cantidad de ' + p.nombre + '">' +
              '<button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Quitar una unidad">−</button>' +
              "<span>" + l.cantidad + "</span>" +
              '<button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Agregar una unidad">+</button>' +
            "</div>" +
          "</div>" +
          '<div class="linea-acciones">' +
            '<span class="linea-subtotal">' + Carrito.cop(unit * l.cantidad) + "</span>" +
            '<button type="button" class="boton-texto" data-accion="eliminar" data-id="' + p.id + '">Eliminar</button>' +
          "</div>" +
        "</div>";
    });
    html += "</div>";

    var subtotal = Carrito.subtotalSinDescuento();
    var total = Carrito.totalProductos();
    html += '<aside class="panel resumen"><h2>Resumen</h2>' +
      '<div class="resumen-fila"><span>Subtotal</span><span>' + Carrito.cop(subtotal) + "</span></div>";
    if (cupon) {
      html += '<div class="resumen-fila"><span>Descuento ' + cupon + '</span><span class="descuento">−' + Carrito.cop(subtotal - total) + "</span></div>";
    }
    html += '<div class="resumen-fila total"><span>Total productos</span><span>' + Carrito.cop(total) + "</span></div>" +
      '<p class="texto-2" style="font-size:13px;margin-top:8px">El envío se calcula en el checkout. Nacional estándar gratis desde ' +
      Carrito.cop(Carrito.ENVIO_GRATIS_DESDE) + ".</p>";

    if (cupon) {
      html += '<div class="cupon-activo"><span>Cupón <strong>' + cupon + "</strong> aplicado (10 %)</span>" +
        '<button type="button" class="boton-texto" id="quitar-cupon">Quitar</button></div>';
    } else {
      html += '<form class="form-cupon" id="form-cupon" novalidate>' +
        '<input type="text" id="codigo-cupon" placeholder="Código de cupón" aria-label="Código de cupón" autocomplete="off" maxlength="20">' +
        '<button type="submit" class="boton-secundario">Aplicar</button></form>' +
        '<p class="texto-2" style="font-size:13px">Prueba con <strong>BIENVENIDA10</strong>.</p>';
    }
    if (mensajeCupon) html += '<p class="mensaje-error" style="margin-top:8px">' + mensajeCupon + "</p>";
    html += '<a class="boton boton-bloque" style="margin-top:12px" href="checkout.html">Continuar al checkout</a>' +
      '<p class="centrado" style="margin:12px 0 0"><a href="index.html" style="font-size:14px">Seguir comprando</a></p>' +
      "</aside></div>";

    cont.innerHTML = html;
    mensajeCupon = "";
  }

  // Delegación de eventos para los botones de cada línea
  cont.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-accion]");
    if (!b) return;
    var id = b.getAttribute("data-id");
    var p = window.buscarProducto(id);
    if (!p) return;
    var accion = b.getAttribute("data-accion");

    if (accion === "mas") {
      Carrito.agregar(id, 1);
      var itAdd = Carrito.itemGA(p, 1, 0);
      Analitica.enviarEvento("add_to_cart", { value: itAdd.price, items: [itAdd] });
    } else {
      var quitadas = accion === "eliminar" ? Carrito.eliminar(id) : Carrito.disminuir(id, 1);
      if (quitadas > 0) {
        var itRem = Carrito.itemGA(p, quitadas, 0);
        Analitica.enviarEvento("remove_from_cart", { value: itRem.price * quitadas, items: [itRem] });
      }
    }
    pintar();
  });

  cont.addEventListener("submit", function (e) {
    if (e.target.id !== "form-cupon") return;
    e.preventDefault();
    var codigo = document.getElementById("codigo-cupon").value;
    if (!Carrito.aplicarCupon(codigo)) {
      mensajeCupon = "El cupón no es válido. Usa BIENVENIDA10.";
    }
    pintar();
  });

  cont.addEventListener("click", function (e) {
    if (e.target.id === "quitar-cupon") { Carrito.quitarCupon(); pintar(); }
  });

  pintar();

  // view_cart al abrir el carrito con productos
  var items = Carrito.itemsGA();
  if (items.length) {
    var params = { value: Carrito.valorItems(items), items: items };
    if (Carrito.cupon()) params.coupon = Carrito.cupon();
    Analitica.enviarEvento("view_cart", params);
  }
})();
