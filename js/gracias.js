/* =====================================================================
   PÁGINA: gracias.html (confirmación)
   Evento: purchase, una sola vez por pedido.
   Antes de purchase: gtag('set', 'user_properties', { tipo_cliente })
   ===================================================================== */
(function () {
  "use strict";

  var CLAVE_PEDIDO = "cervo_pedido";
  var cont = document.getElementById("gracias");

  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem(CLAVE_PEDIDO)); } catch (e) { }

  if (!pedido || !pedido.transaction_id) {
    cont.innerHTML =
      '<div class="panel estado-vacio"><h1>No hay un pedido reciente</h1>' +
      '<p class="texto-2">Cuando completes una compra simulada verás aquí su confirmación.</p>' +
      '<a class="boton" href="index.html">Ir a la tienda</a></div>';
    return;
  }

  var yaEnviado = pedido.enviado === true;

  if (!yaEnviado) {
    Analitica.fijarPropiedadesUsuario({ tipo_cliente: pedido.tipo_cliente });

    var params = {
      transaction_id: pedido.transaction_id,
      affiliation: "Cervo Tienda Online",
      value: pedido.value,          // productos con descuento, sin envío
      shipping: pedido.shipping,
      tipo_cliente: pedido.tipo_cliente,
      items: pedido.items
    };
    if (pedido.coupon) params.coupon = pedido.coupon;
    Analitica.enviarEvento("purchase", params);

    // Marcar como enviado para que recargar no repita el purchase
    pedido.enviado = true;
    try { sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido)); } catch (e) { }
    Carrito.vaciar();
  }

  /* ---------- Pantalla de confirmación ---------- */
  var filas = pedido.items.map(function (it) {
    return '<div class="resumen-item"><span>' + it.item_name + " × " + it.quantity + "</span><span>" +
      Carrito.cop(it.price * it.quantity) + "</span></div>";
  }).join("");

  cont.innerHTML =
    '<svg class="check-grande" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34" fill="#1d8f3a"/>' +
      '<path d="M22 37l9 9 19-20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    "<h1>¡Gracias por tu compra!</h1>" +
    '<p class="texto-2">Este pedido es una simulación: no se cobró dinero.</p>' +
    (yaEnviado
      ? '<p class="mensaje-ok" style="display:inline-block">Este pedido ya se registró en Google Analytics. Recargar la página no envía otro purchase.</p>'
      : "") +
    '<div class="panel pedido">' +
      '<div class="resumen-fila"><span>Pedido</span><span class="pedido-id">' + pedido.transaction_id + "</span></div>" +
      '<div class="resumen-fila"><span>Envío</span><span>' + pedido.pais + " · " + pedido.shipping_tier + "</span></div>" +
      '<div class="resumen-fila"><span>Método de pago</span><span>' + pedido.payment_type + " (simulado)</span></div>" +
      '<div style="margin:12px 0">' + filas + "</div>" +
      '<div class="resumen-fila"><span>Productos' + (pedido.coupon ? " (cupón " + pedido.coupon + ")" : "") + "</span><span>" + Carrito.cop(pedido.value) + "</span></div>" +
      '<div class="resumen-fila"><span>Envío</span><span>' + (pedido.shipping === 0 ? "Gratis" : Carrito.cop(pedido.shipping)) + "</span></div>" +
      '<div class="resumen-fila total"><span>Total pagado</span><span>' + Carrito.cop(pedido.value + pedido.shipping) + "</span></div>" +
    "</div>" +
    '<p style="margin-top:28px"><a class="boton" href="index.html">Seguir comprando</a></p>';
})();
