/* =====================================================================
   PÁGINA: checkout.html (dos pasos)
   Eventos: begin_checkout, add_shipping_info, add_payment_info
   También: gtag('set', 'user_properties', { tipo_cliente }) al confirmar el envío
   ===================================================================== */
(function () {
  "use strict";

  var CLAVE_PEDIDO = "cervo_pedido"; // sessionStorage

  var items = Carrito.itemsGA();
  if (!items.length) {
    document.getElementById("checkout-vacio").hidden = false;
    return;
  }
  document.getElementById("checkout").hidden = false;

  var cupon = Carrito.cupon();
  var totalProductos = Carrito.valorItems(items);
  var subtotal = Carrito.subtotalSinDescuento();

  var formEnvio = document.getElementById("form-envio");
  var formPago = document.getElementById("form-pago");
  var selPais = document.getElementById("pais");
  var envioConfirmado = null; // { tipo_cliente, servicio, shipping_tier, shipping, pais }

  function base() {
    var p = { value: totalProductos, items: items };
    if (cupon) p.coupon = cupon;
    return p;
  }

  function tipoCliente() {
    return selPais.value === "Colombia" ? "Nacional" : "Internacional";
  }
  function servicio() {
    return formEnvio.querySelector('input[name="servicio"]:checked').value;
  }

  /* ---------- Resumen lateral ---------- */
  var cajaItems = document.getElementById("resumen-items");
  Carrito.lineas().forEach(function (l) {
    var fila = document.createElement("div");
    fila.className = "resumen-item";
    var a = document.createElement("span");
    a.textContent = l.producto.nombre + " × " + l.cantidad;
    var b = document.createElement("span");
    b.textContent = Carrito.cop(Carrito.precioUnitario(l.producto) * l.cantidad);
    fila.appendChild(a); fila.appendChild(b);
    cajaItems.appendChild(fila);
  });
  document.getElementById("r-subtotal").textContent = Carrito.cop(subtotal);
  if (cupon) {
    document.getElementById("fila-descuento").hidden = false;
    document.getElementById("r-cupon").textContent = "(" + cupon + ")";
    document.getElementById("r-descuento").textContent = "−" + Carrito.cop(subtotal - totalProductos);
  }

  function actualizarCostos() {
    var tipo = tipoCliente();
    var est = Carrito.costoEnvio(tipo, "Estándar", totalProductos);
    var exp = Carrito.costoEnvio(tipo, "Express", totalProductos);
    document.getElementById("precio-estandar").textContent = est === 0 ? "Gratis" : Carrito.cop(est);
    document.getElementById("precio-express").textContent = Carrito.cop(exp);
    document.getElementById("detalle-estandar").textContent = tipo === "Nacional"
      ? "3 a 5 días hábiles" + (est === 0 ? " · gratis desde " + Carrito.cop(Carrito.ENVIO_GRATIS_DESDE) : "")
      : "8 a 15 días hábiles";
    document.getElementById("detalle-express").textContent = tipo === "Nacional" ? "1 a 2 días hábiles" : "3 a 5 días hábiles";
    var envio = Carrito.costoEnvio(tipo, servicio(), totalProductos);
    document.getElementById("r-envio").textContent = envio === 0 ? "Gratis" : Carrito.cop(envio);
    document.getElementById("r-total").textContent = Carrito.cop(totalProductos + envio);
  }
  selPais.addEventListener("change", actualizarCostos);
  formEnvio.addEventListener("change", actualizarCostos);
  actualizarCostos();

  // begin_checkout al abrir checkout.html
  Analitica.enviarEvento("begin_checkout", base());

  function irAPaso(n) {
    formEnvio.hidden = n !== 1;
    formPago.hidden = n !== 2;
    document.getElementById("ind-paso-1").className = n === 1 ? "activo" : "hecho";
    document.getElementById("ind-paso-2").className = n === 2 ? "activo" : "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Paso 1: Continuar al pago ---------- */
  formEnvio.addEventListener("submit", function (e) {
    e.preventDefault();
    var error = document.getElementById("error-envio");
    var nombre = document.getElementById("nombre").value.trim();
    if (nombre.length < 2) {
      error.textContent = "Escribe un nombre ficticio (mínimo 2 letras).";
      error.hidden = false;
      document.getElementById("nombre").focus();
      return;
    }
    error.hidden = true;

    var tipo = tipoCliente();
    var serv = servicio();
    envioConfirmado = {
      pais: selPais.value,
      tipo_cliente: tipo,
      servicio: serv,
      shipping_tier: tipo + " - " + serv, // "Nacional - Estándar", "Internacional - Express", etc.
      shipping: Carrito.costoEnvio(tipo, serv, totalProductos)
    };

    Analitica.fijarPropiedadesUsuario({ tipo_cliente: tipo });
    Analitica.enviarEvento("add_shipping_info", Object.assign(base(), { shipping_tier: envioConfirmado.shipping_tier }));

    document.getElementById("resumen-envio").textContent =
      "Envío a " + envioConfirmado.pais + " · " + envioConfirmado.shipping_tier + " · " +
      (envioConfirmado.shipping === 0 ? "Gratis" : Carrito.cop(envioConfirmado.shipping));
    irAPaso(2);
  });

  document.getElementById("volver-envio").addEventListener("click", function () { irAPaso(1); });

  /* ---------- Paso 2: Pagar (simulado) ---------- */
  formPago.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!envioConfirmado) { irAPaso(1); return; }
    document.getElementById("boton-pagar").disabled = true;

    var tipoPago = formPago.querySelector('input[name="pago"]:checked').value;

    // Pedido guardado ANTES de ir a gracias.html (sin datos personales)
    var pedido = {
      transaction_id: "CRV-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      fecha: new Date().toISOString(),
      items: items,
      value: totalProductos,
      shipping: envioConfirmado.shipping,
      coupon: cupon,
      tipo_cliente: envioConfirmado.tipo_cliente,
      shipping_tier: envioConfirmado.shipping_tier,
      pais: envioConfirmado.pais,
      payment_type: tipoPago,
      enviado: false
    };
    try { sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido)); } catch (err) { }

    Analitica.enviarEventoYNavegar("add_payment_info", Object.assign(base(), { payment_type: tipoPago }), "gracias.html");
  });
})();
